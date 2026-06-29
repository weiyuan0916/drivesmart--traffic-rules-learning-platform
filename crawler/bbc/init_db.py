"""Initialize the BBC microservice PostgreSQL schema.

Usage::

    # Apply db/schema.sql directly (idempotent — drops and re-creates)
    python -m crawler.bbc.init_db --apply-sql

    # Create tables via SQLAlchemy metadata (no seed data, no views)
    python -m crawler.bbc.init_db --create-all

    # Just check the connection
    python -m crawler.bbc.init_db --check

    # Drop everything (DANGEROUS — only for tests / dev resets)
    python -m crawler.bbc.init_db --drop-all
"""
from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

from crawler.bbc.db import (
    Base,
    BbcCrawlRun,
    BbcEpisode,
    BbcSource,
    get_engine,
    verify_connection,
)
from crawler.bbc.db.session import session_scope
from crawler.bbc.repository import (
    DEFAULT_SOURCE_CODE,
    get_or_create_default_source,
    upsert_source,
)
from crawler.bbc.repository.episode_repository import _LEVEL_ALIASES  # noqa: F401

logger = logging.getLogger(__name__)

# Path to the canonical SQL file (relative to this module).
_SCHEMA_SQL = Path(__file__).parent / "db" / "schema.sql"

# Reference seed for the levels table — must match `bbc_levels` in schema.sql.
_LEVEL_SEED = [
    ("beginner", "Beginner (A1-A2)", 1),
    ("intermediate", "Intermediate (B1-B2)", 2),
    ("advanced", "Advanced (C1-C2)", 3),
]


def _exec_sql_script(sql: str) -> None:
    """Run a multi-statement SQL script against the engine.

    We use psycopg's `execute` directly because SQLAlchemy's
    `Connection.execute` only handles single statements. The script
    is split on `;` outside of any string literal — a tiny state
    machine handles single quotes / dollar-quoted blocks.
    """
    engine = get_engine()
    raw = engine.raw_connection()
    try:
        with raw.cursor() as cur:
            cur.execute(sql)
        raw.commit()
    finally:
        raw.close()


def apply_sql_schema() -> None:
    """Execute db/schema.sql — drops everything first then re-creates."""
    if not _SCHEMA_SQL.exists():
        raise FileNotFoundError(f"Schema SQL not found: {_SCHEMA_SQL}")
    logger.info("Applying schema from %s", _SCHEMA_SQL)
    _exec_sql_script(_SCHEMA_SQL.read_text(encoding="utf-8"))
    logger.info("Schema applied.")


def create_all() -> None:
    """Create tables via SQLAlchemy metadata, then seed reference data."""
    logger.info("Creating tables via SQLAlchemy metadata...")
    Base.metadata.create_all(bind=get_engine())
    _seed_reference_data()
    logger.info("Tables created and seeded.")


def drop_all() -> None:
    """Drop everything (DANGEROUS)."""
    logger.warning("Dropping ALL BBC tables...")
    Base.metadata.drop_all(bind=get_engine())
    logger.warning("Done.")


def _seed_reference_data() -> None:
    """Insert bbc_levels and the default source if missing."""
    with session_scope() as session:
        # Levels (idempotent via INSERT … ON CONFLICT)
        from sqlalchemy import text

        engine = get_engine()
        with engine.begin() as conn:
            for code, desc, sort_order in _LEVEL_SEED:
                conn.execute(
                    text(
                        "INSERT INTO bbc_levels (code, description, sort_order) "
                        "VALUES (:code, :desc, :sort) "
                        "ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, sort_order = EXCLUDED.sort_order"
                    ),
                    {"code": code, "desc": desc, "sort": sort_order},
                )

        # Default source
        upsert_source(
            session,
            code=DEFAULT_SOURCE_CODE,
            name="BBC Learning English - 6 Minute English",
            base_url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english",
            description=(
                "BBC's weekly 6-minute English listening series. "
                "Metadata + audio + transcripts stored locally for personal study use."
            ),
        )


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Initialize the BBC PostgreSQL schema.")
    p.add_argument("--apply-sql", action="store_true",
                   help=f"Run db/schema.sql (drops + recreates everything)")
    p.add_argument("--create-all", action="store_true",
                   help="Create tables from SQLAlchemy metadata + seed reference data")
    p.add_argument("--drop-all", action="store_true",
                   help="Drop ALL BBC tables (DANGEROUS)")
    p.add_argument("--check", action="store_true",
                   help="Verify the DB connection is alive")
    p.add_argument("--seed", action="store_true",
                   help="Re-seed reference data only (levels + default source)")
    p.add_argument("-v", "--verbose", action="store_true")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    if not any([args.apply_sql, args.create_all, args.drop_all, args.check, args.seed]):
        args.check = True  # default: just ping the DB

    if args.check:
        ok = verify_connection()
        if not ok:
            logger.error("Database connection failed. Check env vars (BBC_DB_*).")
            return 2
        logger.info("Database connection OK.")
        return 0

    if args.drop_all:
        drop_all()
        return 0

    if args.create_all or args.apply_sql:
        if args.apply_sql:
            apply_sql_schema()
        if args.create_all:
            create_all()
        if not (args.create_all or args.apply_sql):
            return 0
        # Always make sure reference data is present.
        with session_scope() as s:
            get_or_create_default_source(s)
        logger.info("Default source row ensured.")
        return 0

    if args.seed:
        _seed_reference_data()
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(main())
