# BBC Learning English — Listening Integration Plan

**Feature ID:** T-B-003 + T-B-004
**Last Updated:** 2026-06-16
**Rules:** `bbc-feature.mdc`, `development-workflow.mdc`, `rule.mdc`

---

## Overview

DriveSmart integrates BBC Learning English as a **companion learning
platform**. We never rehost BBC audio, transcripts, or full definitions.
We cache only public metadata (title, URL, thumbnail, level, vocabulary
terms, brief meanings) and let users supply their own audio and
transcript when they want to practice dictation.

This plan supersedes the older `bbc-micro-dictation/plan.md` document,
which described a rehosting architecture that violated the content
policy. The previous plan is preserved for historical reference but is
no longer the source of truth — see `audit-2026-06-16.md` for the
remediation work.

---

## Architecture

### Three-service split

```
BbcCatalogService          BbcDictationService         BbcVocabularyCacheService
       │                          │                              │
       └────────────┬─────────────┘                              │
                    ▼                                            │
            BbcController ─────────────────────────────────────► ┘
                    │
                    ▼
            ListeningExternalLesson model
                    │
                    ├─ segments_source (NEW)
                    │   • legacy_bbc   → redacted, no scoring
                    │   • user_provided → as-is, scoring allowed
                    │   • curated       → redacted, no scoring
                    │   • manual        → as-is, scoring allowed
                    │   • NULL          → redacted, no scoring
                    │
                    └─ metadata_json.segments[] (redacted at API boundary)
```

### Frontend (React + TanStack Query)

```
BbcLessonListPage      → GET /api/v1/listening/bbc
BbcLessonDetailPage    → GET /api/v1/listening/bbc/{slug}
BbcWorkspacePage       → Notes + Vocabulary + Dictation tabs
BbcMicroDictationPage  → if has_segments && !legacy_bbc
                          → BbcMicroDictationPractice
                        else
                          → BbcDictationEmptyState (user-provided flow)
```

The `BbcDictationEmptyState` component handles the user-provided flow
entirely client-side using a `Blob` URL for the audio file and
`DictationScoring.scoreSegment()` for word-level scoring.

---

## Data Model

### `listening_external_lessons` (existing + new column)

| Column | Type | Notes |
|--------|------|-------|
| id | bigserial | |
| source_id | int (FK) | |
| title | varchar | |
| slug | varchar | |
| source_url | varchar | |
| thumbnail_url | varchar nullable | |
| level | varchar(20) nullable | `beginner` / `intermediate` / `advanced` |
| duration_seconds | int nullable | |
| published_at | datetime nullable | |
| metadata_json | jsonb nullable | |
| **segments_source** | **varchar(32) nullable** | **NEW 2026-06-16** |

### `bbc_lesson_vocabulary_cache` (NEW)

| Column | Type | Notes |
|--------|------|-------|
| id | bigserial | |
| lesson_id | int (FK) | |
| word | varchar(100) | |
| brief_meaning | varchar(500) | One-line snippet only |
| position | int | Display order |
| created_at, updated_at | timestamps | |

### `user_external_lesson_*` (unchanged)

User data: progress, notes, vocabulary notebook, dictation attempts.

---

## API Endpoints

| Method | Path | Service | Notes |
|--------|------|---------|-------|
| GET | `/api/v1/listening/bbc` | catalog | List with filters |
| GET | `/api/v1/listening/bbc/{slug}` | catalog | Detail |
| POST | `/api/v1/listening/bbc/{id}/progress` | catalog | Update status |
| POST | `/api/v1/listening/bbc/{id}/complete` | catalog | Mark complete |
| GET,PUT | `/api/v1/listening/bbc/{id}/notes` | catalog | Notes CRUD |
| GET,POST,PUT,DELETE | `/api/v1/listening/bbc/{id}/vocabulary` | catalog | Personal vocabulary |
| GET | `/api/v1/listening/bbc/dashboard` | catalog | User metrics |
| GET | `/api/v1/listening/bbc/{id}/dictation` | dictation | Session |
| POST | `/api/v1/listening/bbc/{id}/dictation/segments` | dictation | Score (refused for legacy_bbc) |
| GET | `/api/v1/listening/bbc/{id}/dictation/summary` | dictation | Aggregated scores |
| POST | `/api/v1/listening/bbc/{id}/dictation/complete` | dictation | Mark complete |
| GET | `/api/v1/listening/bbc/{id}/vocabulary-cache` | vocab cache | Suggested terms |
| POST | `/api/v1/listening/bbc/{id}/vocabulary-cache/sync` | vocab cache | Bulk update (admin only) |

---

## Artisan Commands

| Command | Status | Purpose |
|---------|--------|---------|
| `crawl:bbc-lessons` | Active | Crawl metadata only |
| `crawl:bbc-6min` | **DEPRECATED** | Was: download PDF transcripts. Now: no-op with deprecation notice |
| `crawl:bbc-vocabulary` | Active | Crawl vocabulary cache (word + brief meaning) |

---

## Implementation Status

| Task | Status |
|------|--------|
| Disable PDF crawler | ✅ 2026-06-16 |
| Add `segments_source` column | ✅ 2026-06-16 |
| Split BbcService into 3 services | ✅ 2026-06-16 |
| Frontend fallback UI | ✅ 2026-06-16 |
| Vocabulary cache table + service | ✅ 2026-06-16 |
| Vocabulary crawler | ✅ 2026-06-16 |
| Update tests | ✅ 2026-06-16 |
| Hard purge of legacy data | ⏳ Pending product sign-off |
| Remove deprecated code | ⏳ After purge + 1-2 sprints |

---

## Compliance Checklist

- [x] No BBC audio files downloaded
- [x] No BBC transcripts stored
- [x] No BBC content rehosted
- [x] No BBC pages cloned
- [x] DriveSmart is a companion learning platform
- [x] User-provided content stays in the user's browser
- [x] Source attribution preserved in UI
- [x] All violations documented in `audit-2026-06-16.md`
