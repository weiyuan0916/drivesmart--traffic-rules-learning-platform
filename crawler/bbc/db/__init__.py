"""Database package — PostgreSQL engine, session, and ORM models.

The BBC microservice treats PostgreSQL as the system of record for what
has been crawled.  The on-disk `bbc_listening/` folder remains the
storage of BBC-owned media; the DB stores *metadata only* (titles,
URLs, vocabulary, quiz, transcript text) so re-runs can be idempotent
without re-downloading MP3s.
"""
from crawler.bbc.db.session import (
    get_engine,
    get_session,
    get_session_factory,
    session_scope,
    verify_connection,
)
from crawler.bbc.db.models import (
    Base,
    BbcAsset,
    BbcCrawlRun,
    BbcEpisode,
    BbcLevel,
    BbcQuestion,
    BbcQuizOption,
    BbcSource,
    BbcTranscriptSegment,
    BbcVocabulary,
)

__all__ = [
    "Base",
    "BbcAsset",
    "BbcCrawlRun",
    "BbcEpisode",
    "BbcLevel",
    "BbcQuestion",
    "BbcQuizOption",
    "BbcSource",
    "BbcTranscriptSegment",
    "BbcVocabulary",
    "get_engine",
    "get_session",
    "get_session_factory",
    "session_scope",
    "verify_connection",
]
