import os
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from dotenv import load_dotenv

# Load .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Handle both Supabase and Render PostgreSQL URLs
if DATABASE_URL:
    # Fix for different PostgreSQL URL formats
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Ensure SSL is required for cloud databases
    if "sslmode" not in DATABASE_URL and ("supabase" in DATABASE_URL or "render" in DATABASE_URL):
        separator = "&" if "?" in DATABASE_URL else "?"
        DATABASE_URL += f"{separator}sslmode=require"

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Cloud-optimized connection settings
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,  # Recycle connections every 5 minutes
    pool_timeout=30,
    max_overflow=20,
    pool_size=10,  # Reduced for cloud deployment
    echo=os.getenv("SQL_DEBUG", "false").lower() == "true",
    connect_args={
        "connect_timeout": 60,
        "application_name": "ai_memory_assistant"
    }
)

# PostgreSQL-specific connection setup
@event.listens_for(engine, "connect")
def on_connect(dbapi_connection, connection_record):
    # Set timezone for new connections
    with dbapi_connection.cursor() as cursor:
        cursor.execute("SET timezone TO 'UTC'")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Updated base class for SQLAlchemy 2.0
class Base(DeclarativeBase):
    pass

def create_fts_table_and_triggers():
    """Create PostgreSQL full-text search setup"""
    with engine.connect() as connection:
        try:
            # Enable required PostgreSQL extensions
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS btree_gin"))
            
            # Create GIN index for full-text search on title and content
            connection.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_memories_fts 
                ON memories USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, '')))
            """))
            
            # Create trigram index for fuzzy matching
            connection.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_memories_title_trgm 
                ON memories USING GIN(title gin_trgm_ops)
            """))
            
            connection.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_memories_content_trgm 
                ON memories USING GIN(content gin_trgm_ops)
            """))
            
            # Create function to update search vector (for future use)
            connection.execute(text("""
                CREATE OR REPLACE FUNCTION update_memories_search_vector()
                RETURNS trigger AS $$
                BEGIN
                    -- This function can be extended to maintain a separate search column if needed
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            """))
            
            connection.commit()
            print("PostgreSQL full-text search setup completed successfully")
        except Exception as e:
            print(f"Warning: Could not create full-text search setup: {e}")
            connection.rollback()