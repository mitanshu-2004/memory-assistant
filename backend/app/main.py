"""
Memory Assistant FastAPI Application

Main application entry point that configures the FastAPI app with:
- CORS middleware
- Rate limiting
- Static file serving
- API routes
- Database initialization
- Error handling
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import structlog

from app.config import settings, get_allowed_origins, get_content_store_path
from app.api.v1 import memory, search, categories
from app.database import connection, models

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown"""
    # Startup
    try:
        models.Base.metadata.create_all(bind=connection.engine)
        
        logger.info("Database initialized successfully")
        yield
    except Exception as e:
        logger.error("Database initialization failed", error=str(e))
        raise
    finally:
        # Cleanup on shutdown
        logger.info("Application shutting down")

app = FastAPI(
    title=settings.app_name,
    description="AI-powered memory management system with semantic search and intelligent categorization",
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Rate limiting error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", 
                 path=request.url.path, 
                 method=request.method,
                 error=str(exc),
                 exc_info=True)
    
    
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": str(exc)}
    )
        

# CORS configuration
origins = get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"]
)

# Content storage setup
content_path = get_content_store_path()
app.mount("/content", StaticFiles(directory=str(content_path)), name="content")

# Include routers with rate limiting
app.include_router(memory.router, prefix="/api/v1/memory", tags=["Memory"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["Categories"])

@app.get("/", tags=["Health"])
async def root(request: Request):
    """Root endpoint providing basic API information."""
    return {
        "message": f"{settings.app_name} API",
        "status": "running",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Comprehensive health check endpoint."""
    try:
        # Test database connection
        with connection.engine.connect() as conn:
            result = conn.execute(connection.text("SELECT 1"))
            db_status = "healthy"
        
        # Test vector store
        from app.core.vector_store import get_collection_info
        vector_info = get_collection_info()
        vector_status = "healthy" if "count" in vector_info else "degraded"
        
        return {
            "status": "healthy",
            "database": db_status,
            "vector_store": vector_status
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=503, detail="Service unavailable")

