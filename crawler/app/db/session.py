"""Database session management."""
import os
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DB_PATH = os.environ.get(
    "CRAWLER_DB_PATH",
    str(Path(__file__).parent.parent.parent / "data" / "dailydictation.db"),
)

Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_session():
    return SessionLocal()


def create_tables():
    from app.db.models import Base
    Base.metadata.create_all(bind=engine)


def migrate_add_transcript():
    """Add transcript column to lessons table if it doesn't exist (for existing DBs)."""
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE lessons ADD COLUMN transcript TEXT"))
            conn.commit()
        except Exception:
            pass  # Column already exists
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE lessons ADD COLUMN lesson_name VARCHAR(512)"))
            conn.commit()
        except Exception:
            pass  # Column already exists
