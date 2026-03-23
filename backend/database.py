from sqlalchemy import Column, Integer, String, Boolean, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:odoo@127.0.0.1:5432/postgres")

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class CuratedCorpusDB(Base):
    __tablename__ = "curated_corpora"
    id = Column(Integer, primary_key=True, index=True)
    sanskrit = Column(Text, nullable=False)
    english = Column(Text)
    gujarati = Column(Text)
    explanation_gu = Column(Text)
    category = Column(String(100))
    status = Column(String(50), default="Pending")
    author = Column(String(100))
    is_curated = Column(Boolean, default=False)

class GlossaryTermDB(Base):
    __tablename__ = "glossary"
    id = Column(Integer, primary_key=True, index=True)
    term = Column(String(200), unique=True, index=True)
    transliteration = Column(String(200))
    gujarati = Column(Text)
    context = Column(Text)

def init_db():
    """Create tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
