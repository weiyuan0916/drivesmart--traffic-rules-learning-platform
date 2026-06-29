# BBC Learning English — 6 Minute English Microservice

Python microservice for BBC's [6 Minute English](https://www.bbc.co.uk/learningenglish/english/features/6-minute-english) podcast.

The service runs in two modes — **filesystem only** (legacy) and
**PostgreSQL-backed** (new) — so you can pick the deployment profile that
matches the rest of the stack. In DB mode, the service:

- Discovers ~50 latest episodes from the BBC sidebar
- Parses each episode's HTML page
- Optionally downloads audio + PDF + extracts transcripts
- **Upserts** all metadata into PostgreSQL so re-runs are idempotent
- Records per-run telemetry (inserted / updated / skipped counts)

For each episode it persists:

| File / Table | Contents |
| --- | --- |
| `metadata.json` | Full episode metadata (legacy filesystem output) |
| `audio/<slug>.mp3` | The MP3 audio (skippable) |
| `transcript.pdf` | The official BBC PDF transcript (skippable) |
| `transcript.txt` | Extracted UTF-8 text |
| `split/NNN.mp3` | Optional fixed-length audio chunks (requires ffmpeg) |
| `bbc_episodes` | Source URL, title, published date, level, URLs |
| `bbc_vocabulary` | Word + meaning per position |
| `bbc_questions` / `bbc_quiz_options` | The weekly quiz + a/b/c options |
| `bbc_transcript_segments` | Transcript split by speaker (Neil / Georgie / guest) |
| `bbc_assets` | Local paths, byte sizes, mime types for every downloaded file |
| `bbc_crawl_runs` | One row per CLI invocation (status, counters, cli args) |

A master `episodes.json` is written at the output root with an index of
all processed episodes.

---

## IMPORTANT — Legal / content policy

**Read this before running.**

This crawler downloads and stores BBC-owned media (MP3 audio, PDF
transcripts) to local disk. The project's own content policy explicitly
states:

> "No BBC audio stored. No BBC transcript stored." — `bbc-feature.mdc`

The Laravel command `CrawlBbc6MinLessons` was deprecated in 2026-06-16
for violating this policy. This Python crawler is an **alternative**
path that stores BBC content to a local `bbc_listening/` folder
**outside** the project's database.

**You are responsible for:**

- Not redistributing the downloaded files
- Complying with BBC's [Terms of Use](https://www.bbc.co.uk/usingthebbc/terms/)
- Complying with copyright law in your jurisdiction
- Removing the folder if/when you stop using the project

This tool is for **personal, non-commercial, educational use only**.

---

## ERD

See [`docs/ERD.md`](docs/ERD.md) for the full Mermaid diagram. The
authoritative schema is in [`db/schema.sql`](db/schema.sql); keep them
in sync.

---

## Quick start

### 1. Install

```bash
# Create a virtualenv (Python 3.9+)
cd crawler
python3 -m venv .venv-bbc
source .venv-bbc/bin/activate

# Install dependencies
pip install -r bbc/requirements.txt

# Optional: install ffmpeg for --split-audio
brew install ffmpeg   # macOS
sudo apt install ffmpeg  # Linux
```

### 2. Configure

Copy the template and edit if your local PostgreSQL isn't at the
defaults:

```bash
cp bbc/.env.example bbc/.env
# Edit bbc/.env — set BBC_DB_HOST / BBC_DB_PORT / BBC_DB_PASSWORD
```

Default connection is `127.0.0.1:5432`, user `postgres`, db `postgres`.

### 3. Initialize the database

```bash
python -m crawler.bbc.init_db --apply-sql
```

This drops and recreates all `bbc_*` tables and seeds the default
source row + the 3 CEFR levels. Run once per environment.

You can also use `--create-all` (SQLAlchemy metadata only — no seed
data) or `--check` (just ping the DB).

### 4. Run the crawler

```bash
# Filesystem only (legacy behavior)
python -m crawler.bbc.main --limit 10

# Filesystem + DB
python -m crawler.bbc.main --db --limit 10

# DB only — skip the local folder entirely
python -m crawler.bbc.main --db --no-files --limit 5

# Stats
python -m crawler.bbc.main --stats

# DB connection check
python -m crawler.bbc.main --check-db
```

Re-running is safe: existing rows are updated, never duplicated.

---

## CLI reference

| Flag | Description |
|------|-------------|
| `--limit N` | Max episodes to process (default: 50, env: `BBC_LIMIT`) |
| `--skip-audio` | Do not download audio |
| `--skip-pdf` | Do not download PDF / extract transcript |
| `--split-audio` | Also produce `split/*.mp3` (requires ffmpeg) |
| `--split-seconds N` | Chunk length in seconds (default: 30) |
| `--dry-run` | Print URLs only, do not download |
| `--output-dir DIR` | Filesystem output root (default: `bbc_listening/`) |
| `--db` | Upsert metadata into PostgreSQL |
| `--no-files` | Skip filesystem writes (combine with `--db` for a pure-DB run) |
| `--stats` | Print DB aggregate counts and exit |
| `--check-db` | Verify DB connectivity and exit |
| `-v`, `--verbose` | Debug logging |

---

## Architecture

```
crawler/bbc/
├── main.py                      # CLI orchestrator (crawl + DB pipeline)
├── init_db.py                   # Schema bootstrap / connection check
├── config.py                    # Paths, constants, slugify
├── bbc_client.py                # Async HTTP client with rate limit + retry
├── episode_list_crawler.py      # Discover episode URLs from sidebar
├── episode_parser.py            # Parse one episode page → EpisodeData
├── pdf_extractor.py             # Download PDF + extract text
├── audio_downloader.py          # Stream MP3 to disk
├── audio_splitter.py            # Optional: split MP3 into chunks
├── content_writer.py            # Render markdown body
│
├── db/
│   ├── __init__.py              # Re-exports
│   ├── schema.sql               # Authoritative PostgreSQL DDL
│   ├── session.py               # Engine + session factory
│   └── models.py                # SQLAlchemy ORM (1:1 with schema.sql)
│
├── repository/
│   ├── __init__.py              # Re-exports
│   └── episode_repository.py    # All DB writes & reads
│
├── docs/
│   └── ERD.md                   # Mermaid diagram + design notes
│
├── .env.example                 # Local env template
├── requirements.txt
├── README.md
└── tests/
    ├── test_config.py
    ├── test_content_writer.py
    ├── test_episode_parser.py
    ├── test_episode_repository.py
    ├── test_pdf_extractor.py
    ├── test_pipeline_smoke.py
    └── test_transcript_splitter.py
```

### Module boundaries

- **`episode_parser.py` knows nothing about the DB.**  It produces
  pure `EpisodeData` dataclasses.
- **`db/models.py` mirrors `db/schema.sql` 1:1.**  The ORM is the
  query surface; the SQL is the schema-of-record.
- **`repository/episode_repository.py` is the only place that writes
  to the DB.**  It exposes `upsert_*` and `replace_*` functions with
  no SQLAlchemy implementation details leaking out.
- **`main.py` is the orchestrator.**  It owns the lifecycle of the
  crawl run row, the HTTP client, and the per-episode pipeline.

### Deduplication strategy

The natural key for an episode is `(source_id, source_url)`. The
repository:

1. Looks up the existing row by that key.
2. If found → mutates in place (preserves `first_crawled_at`).
3. If missing → inserts a new row (commits `first_crawled_at`).
4. Replaces child collections (vocab, quiz, segments) by
   delete-then-insert so BBC's data reshuffles are honored.
5. Upserts assets by `(episode_id, asset_kind, storage_path)` so
   re-downloading a file that was already on disk does not insert a
   duplicate.

Result: re-running the crawler is O(new-or-changed) not O(all).

---

## Database setup

### Apply schema (idempotent — drops & recreates)

```bash
python -m crawler.bbc.init_db --apply-sql
```

### Apply schema via SQLAlchemy only (no seed data)

```bash
python -m crawler.bbc.init_db --create-all
```

### Drop everything (DANGEROUS)

```bash
python -m crawler.bbc.init_db --drop-all
```

### Re-seed reference data (levels + default source)

```bash
python -m crawler.bbc.init_db --seed
```

### Check connection

```bash
python -m crawler.bbc.init_db --check
# or
python -m crawler.bbc.main --check-db
```

---

## Environment variables

| Var | Default | Description |
| --- | --- | --- |
| `BBC_DB_HOST` | `127.0.0.1` | PostgreSQL host |
| `BBC_DB_PORT` | `5432` | PostgreSQL port |
| `BBC_DB_NAME` | `postgres` | Database name |
| `BBC_DB_USER` | `postgres` | DB user |
| `BBC_DB_PASSWORD` | (empty) | DB password |
| `BBC_DB_SCHEMA` | `public` | Schema (set to `bbc` for isolation) |
| `BBC_DB_ECHO` | `0` | Set `1` to log all SQL |
| `BBC_LIMIT` | `50` | Default --limit |
| `BBC_USER_AGENT` | Chrome 120 | HTTP User-Agent |
| `BBC_RATE_LIMIT_SECONDS` | `1.5` | Min seconds between requests |
| `BBC_MAX_CONCURRENCY` | `2` | Max parallel requests |
| `BBC_REQUEST_TIMEOUT` | `30` | HTTP timeout (s) |
| `BBC_RETRY_ATTEMPTS` | `3` | HTTP retry attempts |

---

## Testing

```bash
# Run unit tests
pytest crawler/bbc/tests/

# Verbose
pytest crawler/bbc/tests/ -v

# Specific file
pytest crawler/bbc/tests/test_episode_repository.py
```

Tests that touch the DB are isolated — each creates its own `bbc_sources`
row with a UUID-based code, then deletes it in teardown, so parallel
runs do not collide.

---

## Output structure

```
bbc_listening/
├── episodes.json                                    # Master index
└── should-animals-be-kept-in-zoos/                  # One folder per episode
    ├── metadata.json
    ├── audio/
    │   └── should-animals-be-kept-in-zoos.mp3
    ├── transcript.pdf
    ├── transcript.txt
    └── split/                                       # Only if --split-audio
        ├── 000.mp3
        ├── 001.mp3
        └── ...
```

## episodes.json shape

```json
{
  "crawled_at": "2026-06-16T14:30:00Z",
  "source": "BBC Learning English - 6 Minute English",
  "source_url": "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english",
  "total_episodes": 50,
  "episodes": [
    {
      "title": "Should animals be kept in zoos?",
      "episode_code": "ep-250508",
      "source_url": "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
      "published_at": "2025-05-08",
      "level": "intermediate",
      "thumbnail_url": "https://ichef.bbci.co.uk/...",
      "audio_url": "https://downloads.bbc.co.uk/.../250508_6_minute_english_zoos.mp3",
      "pdf_url": "https://downloads.bbc.co.uk/.../250508_6_minute_english_zoos.pdf",
      "description": "Neil and Sam discuss the topic of zoos.",
      "vocabulary": [
        { "word": "zoo", "meaning": "a place where animals are kept for public viewing", "position": 0 }
      ],
      "folder": "should-animals-be-kept-in-zoos",
      "files": {
        "audio": "audio/should-animals-be-kept-in-zoos.mp3",
        "transcript_pdf": "transcript.pdf",
        "transcript_txt": "transcript.txt",
        "content_md": "content.md",
        "split_dir": null
      },
      "vocabulary_count": 1,
      "crawled_at": "2026-06-16T14:30:01Z"
    }
  ]
}
```

---

## Known issues

### Geo-blocking

BBC blocks many datacenter / cloud IP ranges (observed: SSL handshake
timeouts from AWS / Google Cloud / Azure). If you see
`httpx.ConnectTimeout`:

1. Run from a residential connection (home network)
2. Or use a residential proxy — pass it via httpx client customization
   (not implemented in MVP)
3. Or use a VPN from a non-blocked region

### Episode URL discovery

BBC has no public archive index. The crawler uses the "Latest 6 Minute
English" sidebar on any episode page to discover ~50 recent episodes.
The list mixes old (`/6-minute-english/ep-YYMMDD`) and new
(`/6-minute-english_YYYY/ep-YYMMDD`) URL formats — both are handled.

For full archive coverage, you would need to probe YYMMDD codes from
2016-01-01 forward (not implemented in this MVP).

### PDF parsing failures

If pdfplumber fails to extract text from a particular PDF, the raw
`.pdf` is still saved and `transcript.txt` is left empty. The episode's
`metadata.json` will reflect the missing transcript.

### Missing `pg_trgm` extension

If your managed PostgreSQL does not have the `pg_trgm` extension, the
schema script will skip the GIN trigram index on `bbc_episodes.title`
and print a notice. Everything else still works.

---

## Idempotency

Re-running the crawler is safe:

- Audio: skipped if `audio/<slug>.mp3` already exists with non-zero size
- PDF: skipped if `transcript.pdf` already exists with non-zero size
- Text: re-extracted from existing PDF (cheap)
- DB: episodes upserted by `(source_id, source_url)`; vocab/quiz/segments
  replaced; assets upserted by `(episode_id, kind, path)`
- `episodes.json`: overwritten with the current run

---

## License & attribution

All downloaded content remains the property of BBC. The vocabulary word
+ one-line meaning cached in `metadata.json` / `bbc_vocabulary` is
factual reference data; the audio and transcripts are BBC's
intellectual property and are not bundled or redistributed by this
project.
