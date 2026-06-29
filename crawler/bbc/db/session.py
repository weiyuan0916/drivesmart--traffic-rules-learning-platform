"""PostgreSQL engine + session factory for the BBC microservice.

Connection is read from env vars so the same code runs locally, in CI,
and in production. We use SQLAlchemy 2.0 sync API — the BBC crawler is
I/O bound on HTTP, not on the DB, so async here would add complexity
without measurable benefit.

Environment variables (all optional, sensible local defaults):

    BBC_DB_HOST       default: 127.0.0.1
    BBC_DB_PORT       default: 5432
    BBC_DB_NAME       default: postgres
    BBC_DB_USER       default: postgres
    BBC_DB_PASSWORD   default: empty
    BBC_DB_SCHEMA     default: public  (override to run an isolated schema in shared DBs)
    BBC_DB_ECHO       default: 0      (set 1 to log all SQL — verbose!)
"""
from __future__ import annotations

import logging
import os
from contextlib import contextmanager
from typing import Iterator, Optional

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

logger = logging.getLogger(__name__)

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 5432
DEFAULT_NAME = "postgres"
DEFAULT_USER = "postgres"
DEFAULT_SCHEMA = "public"


def _build_url() -> str:
    """Compose a libpq URL from individual env vars.

    Returns a string like `postgresql+psycopg://user:pass@host:port/dbname`.
    `psycopg` is the modern (v3) driver — the de-facto choice for
    PostgreSQL 13+. We do NOT quote-encode the password here; env
    injection is expected to come from a trusted source (.env or
    container secret).
    """
    user = os.environ.get("BBC_DB_USER", DEFAULT_USER)
    password = os.environ.get("BBC_DB_PASSWORD", "")
    host = os.environ.get("BBC_DB_HOST", DEFAULT_HOST)
    port = os.environ.get("BBC_DB_PORT", str(DEFAULT_PORT))
    name = os.environ.get("BBC_DB_NAME", DEFAULT_NAME)
    auth = f"{user}:{password}" if password else user
    return f"postgresql+psycopg://{auth}@{host}:{port}/{name}"


def _make_engine(url: str) -> Engine:
    echo = os.environ.get("BBC_DB_ECHO", "0") == "1"
    return create_engine(
        url,
        echo=echo,
        pool_pre_ping=True,         # transparent reconnect after server restart
        pool_size=5,
        max_overflow=10,
        future=True,
    )


# Lazy-built so importing this module is side-effect free.
_engine: Optional[Engine] = None
_SessionLocal: Optional[sessionmaker] = None


def get_engine() -> Engine:
    global _engine, _SessionLocal
    if _engine is None:
        _engine = _make_engine(_build_url())
        _SessionLocal = sessionmaker(
            bind=_engine, autocommit=False, autoflush=False, expire_on_commit=False
        )
    return _engine


def get_session_factory() -> sessionmaker:
    if _SessionLocal is None:
        get_engine()
    assert _SessionLocal is not None
    return _SessionLocal


def set_search_path(session: Session) -> None:
    """Set `search_path` so unqualified table names resolve to BBC_SCHEMA."""
    schema = os.environ.get("BBC_DB_SCHEMA", DEFAULT_SCHEMA)
    if schema and schema != DEFAULT_SCHEMA:
        session.execute(text(f'SET search_path TO "{schema}"'))


@contextmanager
def session_scope() -> Iterator[Session]:
    """Provide a transactional session scope.

    Usage:
        with session_scope() as session:
            session.add(...)
    Commits on clean exit, rolls back on any exception, always closes.
    """
    factory = get_session_factory()
    session = factory()
    try:
        set_search_path(session)
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_session() -> Session:
    """Return a fresh Session (caller manages lifecycle)."""
    factory = get_session_factory()
    s = factory()
    set_search_path(s)
    return s


def verify_connection() -> bool:
    """Return True if the DB is reachable, False otherwise.

    Used by init_db.py and the CLI --healthcheck flag.
    """
    try:
        with session_scope() as s:
            s.execute(text("SELECT 1"))
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error("DB connection failed: %s", exc)
        return False


__all__ = [
    "get_engine",
    "get_session_factory",
    "session_scope",
    "get_session",
    "verify_connection",
]
