# Daily Dictation Crawler

Crawl topics, lessons, transcripts, and audio from [dailydictation.com](https://dailydictation.com/exercises).

## Tech Stack

- **Python 3.11+** with `asyncio`
- **httpx** — async HTTP client with retry and rate-limiting
- **BeautifulSoup4** — HTML parsing for topic/section listing pages
- **SQLAlchemy 2.0** — ORM with SQLite (zero-config, zero-infrastructure)

## Quick Start

```bash
cd crawler

# Install dependencies
python3 -m venv .venv
source .venv/bin/activate  # (or .venv\Scripts\activate on Windows)
pip install -r requirements.txt

# Full crawl (topics + sections + lessons + details + audio)
python -m app.main --full-detail

# Quick: topics and sections only
python -m app.main --topics-only

# Lessons and details, skip audio download
python -m app.main --lessons --full-detail --skip-audio
```

## CLI Options

| Flag | Description |
|------|-------------|
| `--topics-only` | Only crawl topics and sections (fast) |
| `--lessons` | Include lesson list crawl |
| `--full-detail` | Fetch full lesson details (transcripts, challenges) |
| `--skip-audio` | Skip audio file downloads |
| `--concurrency N` | Max concurrent HTTP requests (default: 10) |
| `--rate-limit N` | Max requests per second (default: 8) |
| `--verbose` | Debug logging |

## Architecture

```text
crawler/
├── app/
│   ├── api/
│   │   ├── client.py     # httpx async HTTP client with retry + rate-limit
│   │   └── endpoints.py   # API endpoint functions
│   ├── db/
│   │   ├── models.py     # SQLAlchemy models (Topic, Section, Lesson, Challenge)
│   │   └── session.py    # SQLite session management
│   ├── services/
│   │   ├── topic_crawler.py     # Parse /exercises HTML
│   │   ├── section_crawler.py  # Parse /exercises/{slug} HTML
│   │   ├── lesson_crawler.py   # Paginated /api/lessons + /api/lessons/{id}
│   │   ├── downloader.py        # Audio downloader with resume support
│   │   └── crawler_service.py  # Pipeline orchestration
│   └── main.py             # CLI entrypoint
├── storage/
│   └── audio/              # Downloaded MP3 files
├── data/
│   └── dailydictation.db   # SQLite database (auto-created)
├── requirements.txt
└── README.md
```

## Database Schema

### Topic
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `name` | VARCHAR(255) | Display name |
| `slug` | VARCHAR(255) | URL slug, unique |
| `url` | VARCHAR(512) | Full URL |
| `lesson_count` | INTEGER | Total lessons |
| `levels` | VARCHAR(100) | e.g. "A1-C1" |
| `description` | TEXT | Topic description |
| `created_at` | DATETIME | Timestamp |

### Section
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `topic_id` | INTEGER FK | Parent topic |
| `name` | VARCHAR(255) | e.g. "Section 1" |
| `slug` | VARCHAR(255) | e.g. "short-stories-1" |
| `order_index` | INTEGER | Display order |
| `lesson_count` | INTEGER | Lessons in section |
| `vocab_level` | VARCHAR(50) | e.g. "A1" |

### Lesson
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Lesson ID from API |
| `section_id` | INTEGER FK | Parent section |
| `name` | VARCHAR(512) | Lesson title |
| `lesson_url` | VARCHAR(512) | API URL, unique |
| `vocab_level` | VARCHAR(10) | e.g. "A1" |
| `parts_count` | INTEGER | Number of challenges |
| `audio_src` | VARCHAR(1024) | Source MP3 URL |
| `local_audio_path` | VARCHAR(1024) | Local file path |
| `audio_downloaded` | BOOLEAN | Download status |

### Challenge
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Challenge ID from API |
| `lesson_id` | INTEGER FK | Parent lesson |
| `position` | INTEGER | Order in lesson |
| `content` | TEXT | Sentence to transcribe |
| `solution` | TEXT | JSON array of accepted answers |
| `audio_src` | VARCHAR(1024) | Sentence MP3 URL |
| `time_start` | VARCHAR(20) | Audio start time (s) |
| `time_end` | VARCHAR(20) | Audio end time (s) |
| `hints` | TEXT | JSON array of hints |
| `nb_comments` | INTEGER | Comment count |
| `discussion_url` | VARCHAR(512) | Discussion page URL |

## API Discovery Results

The site exposes two types of data sources:

### HTML Pages (parsed with BeautifulSoup)
- `GET /exercises` — Lists all topics
- `GET /exercises/{topic-slug}` — Lists sections within a topic

### JSON API (direct HTTP, no auth required)
- `GET /api/lessons?page=N` — Paginated lesson list (30 per page, ~70 pages total)
- `GET /api/lessons/{id}` — Full lesson detail with transcript and audio URLs

Note: The `section` query parameter on `/api/lessons` is broken on the backend — it returns all lessons regardless of value. Lesson IDs are globally unique across all topics.

## Data Deduplication

- `UNIQUE(slug)` on Topic
- `UNIQUE(topic_id, slug)` on Section
- `UNIQUE(lesson_url)` on Lesson
- `UNIQUE(lesson_id, position)` on Challenge

Re-running the crawler updates existing records instead of creating duplicates.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CRAWLER_DB_PATH` | `data/dailydictation.db` | SQLite file path |
