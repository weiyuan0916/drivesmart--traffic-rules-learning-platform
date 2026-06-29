# BBC Microservice — ERD

PostgreSQL schema for the BBC Learning English listening pipeline. Drawn
from `crawler/bbc/db/schema.sql` (the authoritative source — keep them
in sync).

## Overview

```mermaid
erDiagram
    bbc_sources ||--o{ bbc_episodes       : "hosts"
    bbc_sources ||--o{ bbc_crawl_runs     : "tracks"
    bbc_levels  ||--o{ bbc_episodes       : "classifies"

    bbc_crawl_runs ||--o{ bbc_episodes    : "last_run"

    bbc_episodes ||--o{ bbc_vocabulary           : "has"
    bbc_episodes ||--o{ bbc_questions            : "asks"
    bbc_episodes ||--o{ bbc_transcript_segments  : "speaks"
    bbc_episodes ||--o{ bbc_assets               : "stores"

    bbc_questions ||--o{ bbc_quiz_options        : "has"

    bbc_sources {
        SMALLINT id PK
        VARCHAR  code UK
        VARCHAR  name
        VARCHAR  base_url
        TEXT     description
        BOOLEAN  is_active
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
    bbc_levels {
        VARCHAR code PK
        VARCHAR description
        SMALLINT sort_order
    }
    bbc_crawl_runs {
        BIGSERIAL id PK
        SMALLINT  source_id FK
        TIMESTAMPTZ started_at
        TIMESTAMPTZ finished_at
        VARCHAR   status
        INTEGER   episodes_seen
        INTEGER   episodes_inserted
        INTEGER   episodes_updated
        INTEGER   episodes_skipped
        INTEGER   assets_downloaded
        TEXT      error_message
        JSONB     cli_args
    }
    bbc_episodes {
        BIGSERIAL id PK
        SMALLINT  source_id FK
        VARCHAR   episode_code
        VARCHAR   title
        VARCHAR   slug
        VARCHAR   source_url UK
        DATE      published_at
        VARCHAR   level_code FK
        INTEGER   duration_seconds
        VARCHAR   thumbnail_url
        VARCHAR   audio_url
        VARCHAR   pdf_url
        VARCHAR   iframe_url
        VARCHAR   bbc_programme_id
        TEXT      description
        TEXT      introduction
        TEXT      transcript
        INTEGER   vocabulary_count
        JSONB     raw_metadata
        TIMESTAMPTZ first_crawled_at
        TIMESTAMPTZ last_crawled_at
        BIGINT    last_crawl_run_id FK
    }
    bbc_vocabulary {
        BIGSERIAL id PK
        BIGINT    episode_id FK
        SMALLINT  position
        VARCHAR   word
        TEXT      meaning
        TIMESTAMPTZ first_seen_at
    }
    bbc_questions {
        BIGSERIAL id PK
        BIGINT    episode_id FK
        TEXT      prompt
        TEXT      answer_listen_for
        VARCHAR   answer_letter
        TIMESTAMPTZ created_at
    }
    bbc_quiz_options {
        BIGSERIAL id PK
        BIGINT    question_id FK
        VARCHAR   letter
        TEXT      text
        SMALLINT  position
    }
    bbc_transcript_segments {
        BIGSERIAL id PK
        BIGINT    episode_id FK
        INTEGER   position
        VARCHAR   speaker
        TEXT      text
    }
    bbc_assets {
        BIGSERIAL id PK
        BIGINT    episode_id FK
        VARCHAR   asset_kind
        VARCHAR   storage_backend
        VARCHAR   storage_path UK
        VARCHAR   remote_url
        BIGINT    byte_size
        VARCHAR   mime_type
        CHAR      checksum_sha256
        TIMESTAMPTZ downloaded_at
        JSONB     metadata
    }
```

## Key design decisions

1. **`bbc_sources` is provider-agnostic.**  Future YouTube or
   DailyDictation sources plug in as additional rows, not additional
   tables.  All episode-level tables are scoped by `source_id` so
   natural-key uniqueness is enforced *per provider* (a YouTube video
   and a BBC episode can share a slug without colliding).

2. **Episode natural key = `(source_id, source_url)`.**  This is what
   the crawler uses for upsert.  A separate `(source_id, episode_code)`
   unique key catches data inconsistencies — if BBC ever changes the
   URL pattern for an old episode, the code stays stable.

3. **Child collections are `replace_*` not `upsert`.**  Vocabulary,
   questions, and transcript segments are deleted-then-reinserted per
   episode.  The data is small (≤ 20 rows per episode) and BBC
   occasionally re-shuffles positions or drops words, so a clean
   replace is more correct than a diff.

4. **Assets use content-addressable storage where possible.**  The
   `(episode_id, asset_kind, storage_path)` unique constraint is the
   dedup key.  Add `checksum_sha256` later to detect BBC changing the
   underlying MP3 without renaming the file.

5. **`bbc_crawl_runs` is operational telemetry.**  It lets the
   `--stats` CLI answer "what was the last crawl, and what did it
   find?" without re-scanning episodes.  One row per CLI invocation;
   episodes link back via `last_crawl_run_id`.

6. **Generated column on `word_count`.**  PostgreSQL computes the
   transcript word count on write/update so we never have to remember
   to refresh it from the application side.

7. **Trigram GIN index on `title` is optional.**  Created only when
   the `pg_trgm` extension is available (it ships with PostgreSQL
   contrib but is not pre-installed on every managed service).
