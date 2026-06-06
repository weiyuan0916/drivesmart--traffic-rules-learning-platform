"""SQLAlchemy models for Daily Dictation crawler."""
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    url = Column(String(512), nullable=False, unique=True)
    lesson_count = Column(Integer, default=0)
    levels = Column(String(100))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    sections = relationship("Section", back_populates="topic", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("slug", name="uq_topic_slug"),)


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    order_index = Column(Integer, default=0)
    lesson_count = Column(Integer, default=0)
    vocab_level = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="sections")
    lessons = relationship("Lesson", back_populates="section", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("topic_id", "slug", name="uq_section_topic_slug"),)


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(512), nullable=False)
    lesson_name = Column(String(512))
    lesson_url = Column(String(512), nullable=False, unique=True)
    vocab_level = Column(String(10))
    parts_count = Column(Integer, default=0)
    audio_src = Column(String(1024))
    local_audio_path = Column(String(1024))
    audio_downloaded = Column(Boolean, default=False)
    transcript = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    section = relationship("Section", back_populates="lessons")
    challenges = relationship("Challenge", back_populates="lesson", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("lesson_url", name="uq_lesson_url"),)


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    position = Column(Integer, default=0)
    content = Column(Text, nullable=False)
    solution = Column(Text)
    audio_src = Column(String(1024))
    time_start = Column(String(20))
    time_end = Column(String(20))
    hints = Column(Text)
    nb_comments = Column(Integer, default=0)
    discussion_url = Column(String(512))
    created_at = Column(DateTime, default=datetime.utcnow)

    lesson = relationship("Lesson", back_populates="challenges")

    __table_args__ = (UniqueConstraint("lesson_id", "position", name="uq_challenge_lesson_position"),)
