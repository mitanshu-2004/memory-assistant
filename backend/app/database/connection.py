"""
Database connection and session management.

This module provides SQLAlchemy engine, session factory, and base model class
for the Memory Assistant application.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import StaticPool
from app.config import get_database_url

# Create database engine with optimized settings
engine = create_engine(
    get_database_url(),
    connect_args={"check_same_thread": False},  # Required for SQLite
    poolclass=StaticPool,  # Use static pool for SQLite
    echo=False,  # Set to True for SQL query logging
    pool_pre_ping=True,  # Verify connections before use
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


def get_db():
    """
    Dependency function to get database session.
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_database_connection() -> bool:
    """
    Test database connection.
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False