from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TagBase(BaseModel):
    name: str

class Tag(TagBase):
    id: int
    usage_count: int
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str

class Category(CategoryBase):
    id: int
    memory_count: Optional[int] = 0
    class Config:
        from_attributes = True

class MemoryBase(BaseModel):
    content: str
    title: Optional[str] = "Untitled"
    summary: Optional[str] = None   
    source_type: str = "text"
    source_url: Optional[str] = None
    is_favorite: Optional[bool] = False

class MemoryCreate(MemoryBase):
    tags: Optional[List[str]] = []
    category_id: Optional[int] = None

class MemoryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None  
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None
    category_id: Optional[int] = None
    tags: Optional[List[str]] = None

class Memory(MemoryBase):
    id: str
    processing_step: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    accessed_at: Optional[datetime] = None
    access_count: int
    is_archived: bool
    tags: List[Tag] = []
    category: Optional[Category] = None
    class Config:
        from_attributes = True
