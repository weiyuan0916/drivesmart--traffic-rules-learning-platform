"""SQLAlchemy ORM models — mirror of `db/schema.sql` 1:1.

Naming follows the SQL file (snake_case tables, snake_case columns). The
ORM classes carry Python type hints so callers get autocompletion and
mypy can catch mismatches.  All unique constraints from the SQL file are
re-declared here so SQLAlchemy knows how to upsert and how to compose
the ON CONFLICT clause.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------
# Reference / lookup tables
# ---------------------------------------------------------------------

class BbcSource(Base):
    """An upstream content source. Designed to be provider-agnostic so
    the same table can later host `youtube`, `dailydictation`, etc."""
    __tablename__ = "bbc_sources"

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    base_url: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    episodes: Mapped[List["BbcEpisode"]] = relationship(back_populates="source")
    crawl_runs: Mapped[List["BbcCrawlRun"]] = relationship(back_populates="source")


class BbcLevel(Base):
    """CEFR level reference (beginner / intermediate / advanced)."""
    __tablename__ = "bbc_levels"

    code: Mapped[str] = mapped_column(String(16), primary_key=True)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    sort_order: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)


# ---------------------------------------------------------------------
# Operational table
# ---------------------------------------------------------------------

class BbcCrawlRun(Base):
    """One row per CLI invocation. Powers `bbc_crawl_runs` lineage."""
    __tablename__ = "bbc_crawl_runs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    source_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("bbc_sources.id", ondelete="CASCADE"), nullable=False
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="running")
    episodes_seen: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    episodes_inserted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    episodes_updated: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    episodes_skipped: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    assets_downloaded: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    cli_args: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)

    source: Mapped["BbcSource"] = relationship(back_populates="crawl_runs")

    __table_args__ = (
        CheckConstraint(
            "status IN ('running','succeeded','failed','cancelled')",
            name="ck_bbc_crawl_run_status",
        ),
    )


# ---------------------------------------------------------------------
# Core domain table
# ---------------------------------------------------------------------

class BbcEpisode(Base):
    """A single BBC episode.  The (source_id, source_url) unique
    constraint is the natural key used for upsert."""
    __tablename__ = "bbc_episodes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    source_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("bbc_sources.id", ondelete="CASCADE"), nullable=False
    )
    episode_code: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    published_at: Mapped[Optional[date]] = mapped_column(Date)
    level_code: Mapped[Optional[str]] = mapped_column(
        String(16), ForeignKey("bbc_levels.code", ondelete="SET NULL")
    )
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(1024))
    audio_url: Mapped[Optional[str]] = mapped_column(String(1024))
    pdf_url: Mapped[Optional[str]] = mapped_column(String(1024))
    iframe_url: Mapped[Optional[str]] = mapped_column(String(1024))
    bbc_programme_id: Mapped[Optional[str]] = mapped_column(String(64))
    description: Mapped[Optional[str]] = mapped_column(Text)
    introduction: Mapped[Optional[str]] = mapped_column(Text)
    transcript: Mapped[Optional[str]] = mapped_column(Text)
    vocabulary_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    raw_metadata: Mapped[Dict[str, Any]] = mapped_column(
        JSONB, nullable=False, default=dict
    )
    first_crawled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_crawled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    last_crawl_run_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("bbc_crawl_runs.id", ondelete="SET NULL")
    )

    source: Mapped["BbcSource"] = relationship(back_populates="episodes")
    level: Mapped[Optional["BbcLevel"]] = relationship()
    vocabulary: Mapped[List["BbcVocabulary"]] = relationship(
        back_populates="episode", cascade="all, delete-orphan", order_by="BbcVocabulary.position"
    )
    questions: Mapped[List["BbcQuestion"]] = relationship(
        back_populates="episode", cascade="all, delete-orphan", order_by="BbcQuestion.id"
    )
    segments: Mapped[List["BbcTranscriptSegment"]] = relationship(
        back_populates="episode", cascade="all, delete-orphan",
        order_by="BbcTranscriptSegment.position"
    )
    assets: Mapped[List["BbcAsset"]] = relationship(
        back_populates="episode", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("source_id", "source_url", name="uq_bbc_episode_source_url"),
        UniqueConstraint("source_id", "episode_code", name="uq_bbc_episode_code"),
    )


# ---------------------------------------------------------------------
# Episode sub-resources
# ---------------------------------------------------------------------

class BbcVocabulary(Base):
    __tablename__ = "bbc_vocabulary"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    episode_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("bbc_episodes.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    word: Mapped[str] = mapped_column(String(255), nullable=False)
    meaning: Mapped[Optional[str]] = mapped_column(Text)
    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    episode: Mapped["BbcEpisode"] = relationship(back_populates="vocabulary")

    __table_args__ = (
        UniqueConstraint("episode_id", "position", name="uq_bbc_vocab_episode_position"),
    )


class BbcQuestion(Base):
    __tablename__ = "bbc_questions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    episode_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("bbc_episodes.id", ondelete="CASCADE"), nullable=False
    )
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    answer_listen_for: Mapped[Optional[str]] = mapped_column(Text)
    answer_letter: Mapped[Optional[str]] = mapped_column(String(1))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    episode: Mapped["BbcEpisode"] = relationship(back_populates="questions")
    options: Mapped[List["BbcQuizOption"]] = relationship(
        back_populates="question", cascade="all, delete-orphan",
        order_by="BbcQuizOption.letter"
    )

    __table_args__ = (
        CheckConstraint(
            "answer_letter IS NULL OR answer_letter IN ('a','b','c')",
            name="ck_bbc_question_answer_letter",
        ),
    )


class BbcQuizOption(Base):
    __tablename__ = "bbc_quiz_options"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    question_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("bbc_questions.id", ondelete="CASCADE"), nullable=False
    )
    letter: Mapped[str] = mapped_column(String(1), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)

    question: Mapped["BbcQuestion"] = relationship(back_populates="options")

    __table_args__ = (
        UniqueConstraint("question_id", "letter", name="uq_bbc_quiz_option"),
        CheckConstraint("letter IN ('a','b','c')", name="ck_bbc_quiz_option_letter"),
    )


class BbcTranscriptSegment(Base):
    __tablename__ = "bbc_transcript_segments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    episode_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("bbc_episodes.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    speaker: Mapped[Optional[str]] = mapped_column(String(64))
    text: Mapped[str] = mapped_column(Text, nullable=False)

    episode: Mapped["BbcEpisode"] = relationship(back_populates="segments")

    __table_args__ = (
        UniqueConstraint("episode_id", "position", name="uq_bbc_segment_episode_position"),
    )


class BbcAsset(Base):
    __tablename__ = "bbc_assets"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    episode_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("bbc_episodes.id", ondelete="CASCADE"), nullable=False
    )
    asset_kind: Mapped[str] = mapped_column(String(32), nullable=False)
    storage_backend: Mapped[str] = mapped_column(String(32), nullable=False, default="local")
    storage_path: Mapped[Optional[str]] = mapped_column(String(1024))
    remote_url: Mapped[Optional[str]] = mapped_column(String(1024))
    byte_size: Mapped[Optional[int]] = mapped_column(BigInteger)
    mime_type: Mapped[Optional[str]] = mapped_column(String(128))
    checksum_sha256: Mapped[Optional[str]] = mapped_column(String(64))
    downloaded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    meta: Mapped[Dict[str, Any]] = mapped_column(
        "metadata", JSONB, nullable=False, default=dict
    )

    episode: Mapped["BbcEpisode"] = relationship(back_populates="assets")

    __table_args__ = (
        UniqueConstraint(
            "episode_id", "asset_kind", "storage_path",
            name="uq_bbc_asset_episode_kind_path",
        ),
        CheckConstraint(
            "asset_kind IN ('audio','audio_split','transcript_pdf','transcript_txt','content_md','thumbnail')",
            name="ck_bbc_asset_kind",
        ),
        CheckConstraint(
            "storage_backend IN ('local','r2','s3','remote_url')",
            name="ck_bbc_asset_backend",
        ),
    )


__all__ = [
    "Base",
    "BbcSource",
    "BbcLevel",
    "BbcCrawlRun",
    "BbcEpisode",
    "BbcVocabulary",
    "BbcQuestion",
    "BbcQuizOption",
    "BbcTranscriptSegment",
    "BbcAsset",
]
