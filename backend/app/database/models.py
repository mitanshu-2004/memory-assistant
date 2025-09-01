from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

import uuid
from typing import Optional, List
from .connection import Base

def generate_uuid():
    return str(uuid.uuid4())

class Memory(Base):
    __tablename__ = "memories"

    # Use UUID primary key for PostgreSQL - Updated for SQLAlchemy 2.0
    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String, nullable=False, default="Processing...")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content_hash: Mapped[Optional[str]] = mapped_column(String, unique=True)
    source_type: Mapped[str] = mapped_column(String, default="text")
    source_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    preview_image_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    processing_step: Mapped[str] = mapped_column(String, default="pending")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    accessed_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True), nullable=True)
    access_count: Mapped[int] = mapped_column(Integer, default=0)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    # Fixed relationships for SQLAlchemy 2.0
    tags: Mapped[List["Tag"]] = relationship("Tag", secondary="item_tags", back_populates="memories")
    category: Mapped[Optional["Category"]] = relationship("Category", secondary="item_categories", back_populates="memories", uselist=False)

    # PostgreSQL compatible indexes
    __table_args__ = (
        Index('idx_memories_created_at', 'created_at'),
        Index('idx_memories_source_type', 'source_type'),
        Index('idx_memories_is_favorite', 'is_favorite'),
        Index('idx_memories_is_archived', 'is_archived'),
        Index('idx_memories_content_hash', 'content_hash'),
    )

class Tag(Base):
    __tablename__ = "tags"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    memories: Mapped[List["Memory"]] = relationship("Memory", secondary="item_tags", back_populates="tags")

class ItemTag(Base):
    __tablename__ = "item_tags"
    
    item_id: Mapped[str] = mapped_column(String, ForeignKey("memories.id", ondelete="CASCADE"), primary_key=True)
    tag_id: Mapped[int] = mapped_column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

class Category(Base):
    __tablename__ = "categories"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    memories: Mapped[List["Memory"]] = relationship("Memory", secondary="item_categories", back_populates="category")

class ItemCategory(Base):
    __tablename__ = "item_categories"
    
    item_id: Mapped[str] = mapped_column(String, ForeignKey("memories.id", ondelete="CASCADE"), primary_key=True)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True)