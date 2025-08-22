from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func # Corrected import
from typing import List, Dict, Any

from app.database import models, connection
from app.models import memory_item as memory_models
from ..deps import get_db

router = APIRouter()



@router.get("/", response_model=List[memory_models.Category])
def get_all_categories(db: Session = Depends(get_db)):
    # Query to count memories for each category
    results = (
        db.query(
            models.Category,
            func.count(models.ItemCategory.item_id).label("memory_count")
        )
        .outerjoin(models.ItemCategory, models.Category.id == models.ItemCategory.category_id)
        .group_by(models.Category.id)
        .order_by(models.Category.name)
        .all()
    )
    # Manually construct the response to include the count
    categories_with_count = []
    for category, count in results:
        cat_model = memory_models.Category.from_orm(category)
        cat_model.memory_count = count
        categories_with_count.append(cat_model)
    return categories_with_count

@router.post("/", response_model=memory_models.Category)
def create_category(category: memory_models.CategoryBase, db: Session = Depends(get_db)):
    """Creates a new user-defined category."""
    existing_category = db.query(models.Category).filter(func.lower(models.Category.name) == category.name.lower()).first()
    if existing_category:
        raise HTTPException(status_code=409, detail="A category with this name already exists.")
    
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/{category_id}", response_model=Dict[str, Any])
def get_category_details(category_id: int, db: Session = Depends(get_db)):
    """Retrieves details and memories for a specific category."""
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
        
    memories = (
        db.query(models.Memory)
        .join(models.ItemCategory)
        .filter(models.ItemCategory.category_id == category_id)
        .options(joinedload(models.Memory.tags), joinedload(models.Memory.category))
        .order_by(models.Memory.created_at.desc())
        .all()
    )
    
    return {
        "category": memory_models.Category.from_orm(category),
        "memories": [memory_models.Memory.from_orm(m) for m in memories]
    }

@router.put("/{category_id}", response_model=memory_models.Category)
def update_category(category_id: int, category_update: memory_models.CategoryBase, db: Session = Depends(get_db)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found.")
    
    existing_name = db.query(models.Category).filter(func.lower(models.Category.name) == category_update.name.lower()).first()
    if existing_name and existing_name.id != category_id:
        raise HTTPException(status_code=409, detail="Another category with this name already exists.")
        
    db_category.name = category_update.name
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found.")
    
    db.delete(db_category)
    db.commit()
    return {"ok": True}