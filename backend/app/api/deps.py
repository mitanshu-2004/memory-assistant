from sqlalchemy.orm import Session
from app.database.connection import SessionLocal

# This is our shared dependency to get a database session.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()