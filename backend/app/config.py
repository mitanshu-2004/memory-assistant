"""
Configuration management for the Memory Assistant application.

This module handles all configuration settings including environment variables,
database connections, AI model settings, and application constants.
"""

import os
from pathlib import Path
from typing import List, Optional
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application settings
    app_name: str = Field(default="AI Memory Assistant", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=False, env="DEBUG")
    
    # Database settings
    database_url: str = Field(default="sqlite:///./database/memory.db", env="DATABASE_URL")
    
    # AI Model settings
    model_path: str = Field(default="./models/Phi-3-mini-4k-instruct-q4.gguf", env="MODEL_PATH")
    embedding_model: str = Field(default="all-MiniLM-L6-v2", env="EMBEDDING_MODEL")
    
    # Vector store settings
    vector_store_path: str = Field(default="./data/vectors", env="VECTOR_STORE_PATH")
    
    # Content storage settings
    content_store_path: str = Field(default="./content_store", env="CONTENT_STORE_PATH")
    
    # CORS settings
    allowed_origins: List[str] = Field(
        default=["http://localhost:5173", "http://127.0.0.1:5173"],
        env="ALLOWED_ORIGINS"
    )
    
    # Rate limiting settings
    rate_limit_per_minute: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    
    # File upload settings
    max_file_size: int = Field(default=50 * 1024 * 1024, env="MAX_FILE_SIZE")  # 50MB
    allowed_file_types: List[str] = Field(
        default=[
            "text/plain", "text/markdown", "application/pdf",
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ],
        env="ALLOWED_FILE_TYPES"
    )
    
    # Logging settings
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()


def get_database_url() -> str:
    """Get the database URL for SQLAlchemy."""
    return settings.database_url


def get_model_path() -> Path:
    """Get the path to the AI model file."""
    return Path(settings.model_path)


def get_vector_store_path() -> Path:
    """Get the path to the vector store directory."""
    path = Path(settings.vector_store_path)
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_content_store_path() -> Path:
    """Get the path to the content storage directory."""
    path = Path(settings.content_store_path)
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_allowed_origins() -> List[str]:
    """Get the list of allowed CORS origins."""
    if isinstance(settings.allowed_origins, str):
        return [origin.strip() for origin in settings.allowed_origins.split(",")]
    return settings.allowed_origins


def is_debug_mode() -> bool:
    """Check if the application is running in debug mode."""
    return settings.debug


def get_log_level() -> str:
    """Get the logging level."""
    return settings.log_level.upper()
