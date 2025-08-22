from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Optional
import hashlib
import datetime
import json
import io
from pathlib import Path
import zipfile
import tempfile
from urllib.parse import urlparse
import requests
from pydantic import BaseModel
import mimetypes
import uuid
import logging
from app.database import models, connection
from app.models import memory_item as memory_models
from app.core import ai_processor, vector_store
from app.utils import text_extractor, web_scraper, image_processor
from ..deps import get_db
import os

logger = logging.getLogger(__name__)

router = APIRouter()

CONTENT_STORAGE_PATH = Path("./content_store")
CONTENT_STORAGE_PATH.mkdir(parents=True, exist_ok=True)

class URLRequest(BaseModel):
    url: str

class URLExtractRequest(BaseModel):
    url: str

processing_status_store: Dict[str, Dict] = {}


def get_or_create_tags(db: Session, tag_names: List[str]) -> List[models.Tag]:
    tags = []
    for name in tag_names:
        tag = db.query(models.Tag).filter(models.Tag.name == name.lower().strip()).first()
        if not tag and name.strip():
            tag = models.Tag(name=name.lower().strip())
            db.add(tag)
        if tag:
            tags.append(tag)
    db.commit()
    return tags

def get_or_create_category(db: Session, category_name: str) -> Optional[models.Category]:
    if not category_name or not category_name.strip():
        return None
    
    category_name = category_name.strip()
    
    # Try to find existing category (case-insensitive)
    category = db.query(models.Category).filter(
        models.Category.name.ilike(f"%{category_name}%")
    ).first()
    
    if not category:
        # Create new category
        category = models.Category(name=category_name)
        db.add(category)
        db.commit()
        db.refresh(category)
        logger.info(f"Created new category: {category_name}")
    else:
        logger.info(f"Found existing category: {category.name}")
    
    return category

def generate_ai_category(db: Session, content: str) -> Optional[int]:
    """Generate category using AI and create if it doesn't exist"""
    try:
        # Get existing categories
        existing_categories = db.query(models.Category).all()
        category_names = [cat.name for cat in existing_categories]
        
        logger.info(f"Generating AI category from {len(category_names)} existing categories")
        
        # Try to generate/match category
        suggested_category = ai_processor.generate_category_from_content(content, category_names)
        
        if suggested_category:
            # Get or create the category
            category = get_or_create_category(db, suggested_category)
            return category.id if category else None
        
        return None
    except Exception as e:
        logger.error(f"Error generating AI category: {e}")
        return None

def create_and_save_memory(db: Session, 
                           content: str, 
                           title: str, 
                           source_type: str, 
                           source_name: str = None,
                           mime_type: str = "text/plain", 
                           file_obj: Optional[bytes] = None, 
                           category_id: int = None, 
                           tags: List[str] = None, 
                           source_url: str = None, 
                           auto_generate_category: bool = True) -> models.Memory:
    
    content_hash = hashlib.sha256(content.encode('utf-8', errors='ignore')).hexdigest()
    if db.query(models.Memory).filter(models.Memory.content_hash == content_hash).first():
        raise HTTPException(status_code=409, detail=f"Content from '{source_name or 'input'}' already exists.")
    
    # Generate AI metadata if not provided
    final_title = title
    final_tags = tags or []
    final_category_id = category_id
    
    print(f"Generating AI metadata for content: {content[:100]}...")
    metadata = ai_processor.generate_metadata(content)
    
    final_title = metadata.get("title", "Untitled")
    print(f"Generated title: {final_title}")
    
    
    final_tags = metadata.get("tags", [])
    print(f"Generated tags: {final_tags}")
    
    # Generate category if not provided and auto-generation is enabled
    if not final_category_id and auto_generate_category:
        # Check if metadata contains a category suggestion
        suggested_category = metadata.get("category")
        if suggested_category:
            category = get_or_create_category(db, suggested_category)
            final_category_id = category.id if category else None
            print(f"Generated/matched category: {suggested_category} (ID: {final_category_id})")
        else:
            # Fallback to AI category generation
            final_category_id = generate_ai_category(db, content)
            if final_category_id:
                category_name = db.query(models.Category).filter(models.Category.id == final_category_id).first()
                print(f"AI generated category: {category_name.name if category_name else 'Unknown'} (ID: {final_category_id})")

    # Ensure we have a valid title
    if not final_title or final_title.strip() == "":
        final_title = content[:50] + ('...' if len(content) > 50 else '')

    db_memory = models.Memory(
        title=final_title,
        
        content=content,
        content_hash=content_hash,
        source_type=source_type,
        source_url=source_url or source_name,
        mime_type=mime_type,
        processing_step="complete"
    )
    db.add(db_memory)
    db.commit()
    db.refresh(db_memory)

    # Add category if we have one
    if final_category_id:
        db.add(models.ItemCategory(item_id=db_memory.id, category_id=final_category_id))
    
    # Add tags
    if final_tags:
        tag_objects = get_or_create_tags(db, final_tags)
        for tag in tag_objects:
            db.add(models.ItemTag(item_id=db_memory.id, tag_id=tag.id))
            
    db.commit()

    # Generate embedding
    embedding = ai_processor.generate_embedding(content)
    vector_store.add_embedding(memory_id=db_memory.id, embedding=embedding)

    # Store original file if provided
    if file_obj and source_name:
        file_extension = source_name.split('.')[-1] if '.' in source_name else 'txt'
        filename = f"{db_memory.id}.{file_extension}"
        file_path = CONTENT_STORAGE_PATH / filename
        with file_path.open("wb") as buffer:
            buffer.write(file_obj)
        db_memory.file_path = filename
        
        # Create thumbnail for images
        if "image" in (mime_type or ""):
            thumbnail_filename = f"thumb_{db_memory.id}.jpg"
            thumbnail_path = CONTENT_STORAGE_PATH / thumbnail_filename
            image_stream = io.BytesIO(file_obj)
            image_processor.create_thumbnail(image_stream, thumbnail_path)
            db_memory.preview_image_path = thumbnail_filename
        
        db.commit()

    return db_memory

@router.post("/", response_model=memory_models.Memory)
def create_memory(memory: memory_models.MemoryCreate, db: Session = Depends(get_db)):

    title_to_use = None
    return create_and_save_memory(
        db, 
        memory.content, 
        title_to_use,  
        "text", 
        category_id=memory.category_id, 
        tags=memory.tags,
        auto_generate_category=True  # Enable AI category generation
    )


@router.post("/from-file", response_model=memory_models.Memory)
async def create_memory_from_file(
    file: UploadFile = File(...),
    category_id: Optional[int] = None,
    auto_generate_category: bool = True,
    db: Session = Depends(get_db)
):
    """Create memory directly from uploaded file with status tracking"""
    
    try:
        file_content = await file.read()
        mime_type = file.content_type or "application/octet-stream"
        
        # Extract text based on file type
        extracted_text = ""
        
        if "pdf" in mime_type:
            extracted_text = text_extractor.extract_text_from_file(file_content, mime_type)
        elif "image" in mime_type:
            extracted_text = image_processor.extract_text_from_image(io.BytesIO(file_content))
        elif "text" in mime_type or "document" in mime_type:
            extracted_text = text_extractor.extract_text_from_file(file_content, mime_type)
        else:
            # Try to extract as text
            try:
                extracted_text = file_content.decode('utf-8', errors='ignore')
            except:
                extracted_text = f"Binary file: {file.filename}"
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            extracted_text = f"File: {file.filename} - Content could not be extracted as text."
        
        
        # Create the memory with AI category generation
        db_memory = create_and_save_memory(
            db=db,
            content=extracted_text,
            title=file.filename,
            source_type="file",
            source_name=file.filename,
            mime_type=mime_type,
            file_obj=file_content,
            category_id=category_id,
            tags=[],
            auto_generate_category=auto_generate_category and category_id is None
        )
        
        
        return db_memory
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_memory_from_file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@router.post("/from-url", response_model=memory_models.Memory)
async def create_memory_from_url(
    request: URLRequest, 
    auto_generate_category: bool = True,
    db: Session = Depends(get_db)
):
    """Create memory directly from URL with AI category generation"""
    try:
        # Extract text from URL using web_scraper
        extracted_data = web_scraper.extract_text_from_url(request.url)
        
        if not extracted_data or not extracted_data.get("extracted_text"):
            raise HTTPException(status_code=400, detail="Could not extract content from URL")

        
        return create_and_save_memory(
            db=db,
            content=extracted_data["extracted_text"],
            title=extracted_data.get("title"),
            source_type="url",
            source_name=request.url,
            source_url=request.url,
            mime_type="text/html",
            tags=[],
            auto_generate_category=auto_generate_category
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_memory_from_url: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create memory from URL: {str(e)}")


@router.post("/{memory_id}/summarize", response_model=memory_models.Memory) 
def summarize_memory(memory_id: str, db: Session = Depends(get_db)): 
    """Generate or regenerate summary for a memory""" 
    db_memory = db.query(models.Memory).filter(models.Memory.id == memory_id).first() 
    if not db_memory: 
        raise HTTPException(status_code=404, detail="Memory not found") 
    # Generate summary using AI processor 
    db_memory.summary = ai_processor.generate_summary(db_memory.content) 
    db.commit() 
    db.refresh(db_memory) 
    return db_memory

@router.get("/{memory_id}/file")
async def get_memory_file(memory_id: str, db: Session = Depends(get_db)):
    """Serve the original file for a memory"""
    db_memory = db.query(models.Memory).filter(models.Memory.id == memory_id).first()
    if not db_memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    
    if not db_memory.file_path:
        raise HTTPException(status_code=404, detail="No file associated with this memory")
    
    file_path = CONTENT_STORAGE_PATH / db_memory.file_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine content type
    content_type = db_memory.mime_type or mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
    
    return FileResponse(
        path=str(file_path),
        media_type=content_type,
        filename=db_memory.source_url.split('/')[-1] if db_memory.source_url else f"memory_{memory_id}"
    )


@router.get("/{memory_id}", response_model=memory_models.Memory)
def get_memory_by_id(memory_id: str, db: Session = Depends(get_db)):
    db_memory = db.query(models.Memory).filter(models.Memory.id == memory_id).options(
        joinedload(models.Memory.tags),
        joinedload(models.Memory.category)
    ).first()
    if not db_memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return db_memory


@router.get("/", response_model=List[memory_models.Memory])
def get_all_memories(
    source_type: Optional[str] = None,
    favorites_only: bool = False,
    category_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Memory).options(
        joinedload(models.Memory.tags),
        joinedload(models.Memory.category)
    )
    if source_type: 
        query = query.filter(models.Memory.source_type == source_type)
    if favorites_only: 
        query = query.filter(models.Memory.is_favorite == True)
    if category_id: 
        query = query.join(models.ItemCategory).filter(models.ItemCategory.category_id == category_id)
    
    memories = query.filter(models.Memory.is_archived == False).order_by(models.Memory.created_at.desc()).offset(skip).limit(limit).all()
    return memories

@router.put("/{memory_id}", response_model=memory_models.Memory)
def update_memory(
    memory_id: str,
    memory_update: memory_models.MemoryUpdate,
    db: Session = Depends(get_db)
):
    db_memory = db.query(models.Memory).filter(models.Memory.id == memory_id).options(joinedload(models.Memory.tags), joinedload(models.Memory.category)).first()
    if db_memory is None:
        raise HTTPException(status_code=404, detail="Memory not found")

    update_data = memory_update.model_dump(exclude_unset=True)
    
    if 'tags' in update_data:
        tag_names = update_data.pop('tags')
        tags = get_or_create_tags(db, tag_names)
        db.query(models.ItemTag).filter(models.ItemTag.item_id == memory_id).delete()
        for tag in tags:
            db.add(models.ItemTag(item_id=db_memory.id, tag_id=tag.id))

    if 'category_id' in update_data:
        category_id = update_data.pop('category_id')
        db.query(models.ItemCategory).filter(models.ItemCategory.item_id == memory_id).delete()
        if category_id:
            db.add(models.ItemCategory(item_id=db_memory.id, category_id=category_id))

    content_updated = 'content' in update_data
    for key, value in update_data.items():
        setattr(db_memory, key, value)
    
    if content_updated:
        db_memory.content_hash = hashlib.sha256(db_memory.content.encode('utf-8')).hexdigest()
        embedding = ai_processor.generate_embedding(db_memory.content)
        vector_store.add_embedding(memory_id=db_memory.id, embedding=embedding)

    db.commit()
    db.refresh(db_memory)
    return db_memory

@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memory(memory_id: str, db: Session = Depends(get_db)):
    db_memory = db.query(models.Memory).filter(models.Memory.id == memory_id).first()
    if db_memory is None:
        raise HTTPException(status_code=404, detail="Memory not found")
    
    if db_memory.file_path and (CONTENT_STORAGE_PATH / db_memory.file_path).exists():
        (CONTENT_STORAGE_PATH / db_memory.file_path).unlink()
        
    if db_memory.preview_image_path and (CONTENT_STORAGE_PATH / db_memory.preview_image_path).exists():
        (CONTENT_STORAGE_PATH / db_memory.preview_image_path).unlink()
        
    vector_store.delete_embedding(memory_id=db_memory.id)
    db.delete(db_memory)
    db.commit()
    return {"ok": True}

