-- =====================================================================
-- DriveSmart — BBC Listening microservice schema (PostgreSQL 18+)
-- =====================================================================
-- Storage: PostgreSQL @ 127.0.0.1:5432, database `postgres`
-- Pattern: upsert-by-natural-key — re-runs of the crawler update existing
--          rows instead of inserting duplicates. All *_url columns are
--          unique within their scope.
-- Naming:  snake_case tables, snake_case columns, singular table names
--          (PostgreSQL convention), all foreign keys ON DELETE CASCADE
--          for clean test isolation.
-- =====================================================================

-- Drop in reverse-dependency order so the script is idempotent in dev.
DROP TABLE IF EXISTS bbc_transcript_segments     CASCADE;
DROP TABLE IF EXISTS bbc_quiz_options            CASCADE;
DROP TABLE IF EXISTS bbc_questions               CASCADE;
DROP TABLE IF EXISTS bbc_vocabulary              CASCADE;
DROP TABLE IF EXISTS bbc_assets                  CASCADE;
DROP TABLE IF EXISTS bbc_episodes                CASCADE;
DROP TABLE IF EXISTS bbc_levels                  CASCADE;
DROP TABLE IF EXISTS bbc_sources                 CASCADE;
DROP TABLE IF EXISTS bbc_crawl_runs              CASCADE;

-- Trigram extension is required for the GIN trigram index on episode
-- titles (used for fuzzy search). It ships with PostgreSQL as a
-- contrib module; on managed services (RDS, Cloud SQL, Supabase) it
-- is usually pre-installed.  We try to create it; if the DB role
-- lacks superuser, the index build below will be skipped automatically.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------
-- 1. bbc_sources
-- ---------------------------------------------------------------------
-- One row per upstream provider (e.g. "BBC Learning English"). Designed
-- up-front to be source-agnostic: future YouTube / DailyDictation sources
-- plug in as additional rows, not additional tables.
-- ---------------------------------------------------------------------
CREATE TABLE bbc_sources (
    id            SMALLSERIAL    PRIMARY KEY,
    code          VARCHAR(64)    NOT NULL UNIQUE,    -- e.g. 'bbc-learning-english', 'youtube', 'dailydictation'
    name          VARCHAR(255)   NOT NULL,           -- e.g. 'BBC Learning English'
    base_url      VARCHAR(512)   NOT NULL,
    description   TEXT,
    is_active     BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 2. bbc_levels
-- ---------------------------------------------------------------------
-- Reference table for the three CEFR buckets BBC uses. Kept tiny on
-- purpose: we want to filter by level, not re-stringify it.
-- ---------------------------------------------------------------------
CREATE TABLE bbc_levels (
    code        VARCHAR(16)   PRIMARY KEY,        -- 'beginner' | 'intermediate' | 'advanced'
    description VARCHAR(255)  NOT NULL,
    sort_order  SMALLINT      NOT NULL DEFAULT 0
);

INSERT INTO bbc_levels (code, description, sort_order) VALUES
    ('beginner',     'Beginner (A1-A2)',     1),
    ('intermediate', 'Intermediate (B1-B2)', 2),
    ('advanced',     'Advanced (C1-C2)',     3);

-- ---------------------------------------------------------------------
-- 3. bbc_crawl_runs
-- ---------------------------------------------------------------------
-- One row per CLI invocation. Lets us answer "when was the last crawl?"
-- and "which episodes were inserted in run #N?" without re-scanning the
-- episodes table.
-- ---------------------------------------------------------------------
CREATE TABLE bbc_crawl_runs (
    id            BIGSERIAL      PRIMARY KEY,
    source_id     SMALLINT       NOT NULL REFERENCES bbc_sources(id) ON DELETE CASCADE,
    started_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
    finished_at   TIMESTAMPTZ,
    status        VARCHAR(16)    NOT NULL DEFAULT 'running'
                                 CHECK (status IN ('running','succeeded','failed','cancelled')),
    episodes_seen      INTEGER   NOT NULL DEFAULT 0,
    episodes_inserted  INTEGER   NOT NULL DEFAULT 0,
    episodes_updated   INTEGER   NOT NULL DEFAULT 0,
    episodes_skipped   INTEGER   NOT NULL DEFAULT 0,
    assets_downloaded  INTEGER   NOT NULL DEFAULT 0,
    error_message TEXT,
    cli_args      JSONB
);

CREATE INDEX idx_crawl_runs_source_started ON bbc_crawl_runs (source_id, started_at DESC);

-- ---------------------------------------------------------------------
-- 4. bbc_episodes
-- ---------------------------------------------------------------------
-- One row per crawled episode. The natural key is the source URL — that
-- is the single source of truth BBC exposes and what we use to upsert.
-- ---------------------------------------------------------------------
CREATE TABLE bbc_episodes (
    id                BIGSERIAL    PRIMARY KEY,
    source_id         SMALLINT     NOT NULL REFERENCES bbc_sources(id) ON DELETE CASCADE,
    episode_code      VARCHAR(32)  NOT NULL,                  -- e.g. 'ep-251016'
    title             VARCHAR(512) NOT NULL,
    slug              VARCHAR(255) NOT NULL,                  -- filesystem-friendly
    source_url        VARCHAR(1024) NOT NULL,
    published_at      DATE,
    level_code        VARCHAR(16)  REFERENCES bbc_levels(code) ON DELETE SET NULL,
    duration_seconds  INTEGER,
    thumbnail_url     VARCHAR(1024),
    audio_url         VARCHAR(1024),
    pdf_url           VARCHAR(1024),
    iframe_url        VARCHAR(1024),
    bbc_programme_id  VARCHAR(64),                            -- e.g. 'p0m777wy'
    description       TEXT,
    introduction      TEXT,
    transcript        TEXT,
    word_count        INTEGER GENERATED ALWAYS AS
                      (CASE WHEN transcript IS NULL THEN 0
                            ELSE array_length(regexp_split_to_array(trim(transcript), '\s+'), 1)
                       END) STORED,
    vocabulary_count  INTEGER      NOT NULL DEFAULT 0,
    raw_metadata      JSONB        NOT NULL DEFAULT '{}'::jsonb,   -- full EpisodeData for forensic/debug
    first_crawled_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    last_crawled_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    last_crawl_run_id BIGINT       REFERENCES bbc_crawl_runs(id) ON DELETE SET NULL,

    CONSTRAINT uq_bbc_episode_source_url UNIQUE (source_id, source_url),
    CONSTRAINT uq_bbc_episode_code      UNIQUE (source_id, episode_code)
);

CREATE INDEX idx_bbc_episodes_published    ON bbc_episodes (published_at DESC NULLS LAST);
CREATE INDEX idx_bbc_episodes_level        ON bbc_episodes (level_code);
CREATE INDEX idx_bbc_episodes_slug         ON bbc_episodes (slug);
CREATE INDEX idx_bbc_episodes_run          ON bbc_episodes (last_crawl_run_id);

-- Trigram fuzzy-search index. The CREATE EXTENSION call above is
-- idempotent and is a no-op if pg_trgm is already installed.  If
-- even the extension creation fails (no superuser), this index
-- creation will also fail — in that case the user should request
-- `CREATE EXTENSION pg_trgm;` from their DBA.  The CREATE INDEX is
-- wrapped in DO $$ … $$ so the rest of the schema applies even when
-- the extension is missing.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        CREATE INDEX idx_bbc_episodes_title_trgm
            ON bbc_episodes USING gin (title gin_trgm_ops);
    ELSE
        RAISE NOTICE 'pg_trgm extension missing — skipping trigram index on bbc_episodes.title';
    END IF;
END$$;

-- ---------------------------------------------------------------------
-- 5. bbc_vocabulary
-- ---------------------------------------------------------------------
-- One row per (episode, position). Word + meaning is the unit; example
-- sentences are intentionally not stored to stay metadata-only (matches
-- the project's "no transcript content" policy — vocabulary is the
-- factual reference that is *separately licensed for educational use*).
-- ---------------------------------------------------------------------
CREATE TABLE bbc_vocabulary (
    id            BIGSERIAL    PRIMARY KEY,
    episode_id    BIGINT       NOT NULL REFERENCES bbc_episodes(id) ON DELETE CASCADE,
    position      SMALLINT     NOT NULL,
    word          VARCHAR(255) NOT NULL,
    meaning       TEXT,
    first_seen_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT uq_bbc_vocab_episode_position UNIQUE (episode_id, position)
    -- uq_bbc_vocab_episode_word is created as a unique index below
    -- (PG 18 disallows functional UNIQUE inline; index form works).
);

CREATE UNIQUE INDEX uq_bbc_vocab_episode_word
    ON bbc_vocabulary (episode_id, lower(word));

CREATE INDEX idx_bbc_vocab_word ON bbc_vocabulary (lower(word));

-- ---------------------------------------------------------------------
-- 6. bbc_questions
-- ---------------------------------------------------------------------
-- One row per quiz question attached to an episode. Each question has
-- 2-3 options (a/b/c), so we model options in their own table to avoid
-- a sparse JSON column and to make filtering by correct answer cheap.
-- ---------------------------------------------------------------------
CREATE TABLE bbc_questions (
    id                  BIGSERIAL   PRIMARY KEY,
    episode_id          BIGINT      NOT NULL REFERENCES bbc_episodes(id) ON DELETE CASCADE,
    prompt              TEXT        NOT NULL,
    answer_listen_for   TEXT,                              -- e.g. 'Listen to the programme to hear the answer.'
    answer_letter       VARCHAR(1)  CHECK (answer_letter IS NULL OR answer_letter IN ('a','b','c')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bbc_questions_episode ON bbc_questions (episode_id);

-- ---------------------------------------------------------------------
-- 7. bbc_quiz_options
-- ---------------------------------------------------------------------
-- Multiple-choice options belonging to a question. The (question_id,
-- letter) pair is the natural key.
-- ---------------------------------------------------------------------
CREATE TABLE bbc_quiz_options (
    id           BIGSERIAL    PRIMARY KEY,
    question_id  BIGINT       NOT NULL REFERENCES bbc_questions(id) ON DELETE CASCADE,
    letter       VARCHAR(1)   NOT NULL CHECK (letter IN ('a','b','c')),
    text         TEXT         NOT NULL,
    position     SMALLINT     NOT NULL DEFAULT 0,

    CONSTRAINT uq_bbc_quiz_option UNIQUE (question_id, letter)
);

-- ---------------------------------------------------------------------
-- 8. bbc_transcript_segments
-- ---------------------------------------------------------------------
-- Turn-by-turn breakdown of the transcript (Neil / Georgie / guest
-- alternating). Optional — populated when the source page exposes
-- structured <p> speaker tags. Useful for karaoke-style listening and
-- for downstream TTS/AI tooling.
-- ---------------------------------------------------------------------
CREATE TABLE bbc_transcript_segments (
    id            BIGSERIAL   PRIMARY KEY,
    episode_id    BIGINT      NOT NULL REFERENCES bbc_episodes(id) ON DELETE CASCADE,
    position      INTEGER     NOT NULL,
    speaker       VARCHAR(64),                              -- 'Neil', 'Georgie', 'Dr Karan Rajan', ...
    text          TEXT        NOT NULL,
    char_length   INTEGER     GENERATED ALWAYS AS (char_length(text)) STORED,

    CONSTRAINT uq_bbc_segment_episode_position UNIQUE (episode_id, position)
);

CREATE INDEX idx_bbc_segments_speaker ON bbc_transcript_segments (speaker);

-- ---------------------------------------------------------------------
-- 9. bbc_assets
-- ---------------------------------------------------------------------
-- Local artifacts derived from crawling (downloaded MP3, PDF, generated
-- content.md, audio split chunks). Separate from bbc_episodes so a
-- re-crawl can re-derive them independently and so the same episode can
-- have multiple assets of the same kind (e.g. main + split chunks).
-- ---------------------------------------------------------------------
CREATE TABLE bbc_assets (
    id              BIGSERIAL   PRIMARY KEY,
    episode_id      BIGINT      NOT NULL REFERENCES bbc_episodes(id) ON DELETE CASCADE,
    asset_kind      VARCHAR(32) NOT NULL
                    CHECK (asset_kind IN ('audio','audio_split','transcript_pdf','transcript_txt','content_md','thumbnail')),
    storage_backend VARCHAR(32) NOT NULL DEFAULT 'local'
                    CHECK (storage_backend IN ('local','r2','s3','remote_url')),
    storage_path    VARCHAR(1024),                         -- local path or remote key
    remote_url      VARCHAR(1024),                         -- BBC origin URL
    byte_size       BIGINT,
    mime_type       VARCHAR(128),
    checksum_sha256 CHAR(64),                              -- for content-addressable dedup
    downloaded_at   TIMESTAMPTZ,
    metadata        JSONB       NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT uq_bbc_asset_episode_kind_path UNIQUE (episode_id, asset_kind, storage_path)
);

CREATE INDEX idx_bbc_assets_episode_kind ON bbc_assets (episode_id, asset_kind);
CREATE INDEX idx_bbc_assets_checksum    ON bbc_assets (checksum_sha256);

-- ---------------------------------------------------------------------
-- Helper view — quick "what exists" snapshot
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_bbc_episode_stats AS
SELECT
    s.code                          AS source_code,
    COUNT(*)                        AS total_episodes,
    COUNT(*) FILTER (WHERE e.audio_url IS NOT NULL)        AS with_audio,
    COUNT(*) FILTER (WHERE e.pdf_url   IS NOT NULL)        AS with_pdf,
    COUNT(*) FILTER (WHERE e.transcript IS NOT NULL)       AS with_transcript,
    COUNT(*) FILTER (WHERE e.published_at >= CURRENT_DATE - INTERVAL '30 days') AS last_30_days,
    MAX(e.published_at)             AS latest_published_at
FROM bbc_episodes e
JOIN bbc_sources   s ON s.id = e.source_id
GROUP BY s.code;

-- ---------------------------------------------------------------------
-- Seed: default BBC source
-- ---------------------------------------------------------------------
INSERT INTO bbc_sources (code, name, base_url, description)
VALUES (
    'bbc-learning-english',
    'BBC Learning English - 6 Minute English',
    'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',
    'BBC''s weekly 6-minute English listening series. Metadata + audio + transcripts stored locally for personal study use.'
)
ON CONFLICT (code) DO NOTHING;
