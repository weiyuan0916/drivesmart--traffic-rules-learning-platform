# Architecture v2 — YouTube Interactive Dictation Learning

> Status: **Approved revision of the original spec.**
> Every change below is tagged **ADDED**, **MODIFIED**, or **REMOVED** with the reason.
> The document describes the **target architecture only** — no implementation code.

---

## 1. Guiding principles

1. **Reuse the BBC listening module as the reference architecture.** YouTube is structurally identical (external source, metadata only, IFrame playback). Do not invent a new feature folder.
2. **One bounded context, many source types.** `BBC`, `YouTube`, and `DailyDictation` are all `ListeningSource` values, not separate domains.
3. **The IFrame player is imperative, not reactive.** Player state lives in a ref + `useSyncExternalStore` adapter — never in Zustand.
4. **Async by default for any external I/O.** Playlist imports, caption jobs, and OG image generation are queue jobs, never inline HTTP calls.
5. **YouTube content is ephemeral.** Segment ground-truth text is *never* stored long-term. The architecture must enforce this at the data layer, not by convention.

---

## 2. Bounded contexts (DDD)

**MODIFIED** — original spec separated "internal" and "external" lesson domains. That distinction was useful for v1 but does not scale. YouTube is **not** a different domain from BBC; both are `ListeningSource` values inside one domain.

```
listening/
├── sources/           # ListeningSource (BBC, YouTube, DailyDictation, Podcast)
├── lessons/           # Lesson aggregates — same shape across sources
├── segments/          # Segment aggregates — ground truth is ephemeral for YouTube
├── attempts/          # One row per typed attempt, event-sourced
├── vocabulary/        # Global vocab + per-user SRS state
├── progress/          # Status, streaks, daily goal, time-on-task
├── subscription/      # Entitlements, tiers, trials
├── discovery/         # Curated catalog (seed library) — read-optimized
└── sharing/           # OG image generation, deep links
```

**ADDED** — `subscription/`, `discovery/`, `sharing/` contexts. Without these three, the architecture cannot enforce the Phase 2+ business model or the SEO strategy.

---

## 3. Frontend organization

**MODIFIED** — original spec did not pin a folder convention. Mirroring the BBC pattern explicitly.

```
src/features/listening/
├── api/                      # TanStack Query hooks (one per resource)
├── stores/                   # Zustand: cross-page UI state only
├── hooks/                    # useAudioPlayer, useKeyboardShortcuts, useLessonStateMachine
├── components/               # Shared UI: Player, TranscriptInput, ResultPanel, ProgressRing
├── pages/
│   ├── bbc/                  # Existing — reference implementation
│   ├── youtube/              # NEW — mirrors bbc/
│   └── shared/               # Cross-source pages (dashboard, history, progress)
├── lib/
│   ├── youtube/              # Pure helpers: URL parsing, ID extraction, segment splitter
│   ├── scoring/              # Extracted grading engine (reused by BBC + YouTube + DD)
│   └── constants/
├── types/
└── __tests__/
    ├── unit/
    ├── integration/
    └── e2e/                  # Playwright specs
```

**REMOVED** — no new top-level feature folder. No `features/youtube/`. No new design system. No new state library.

---

## 4. Backend organization

**MODIFIED** — original spec was ambiguous about backend layout.

```
src/
├── domains/
│   └── listening/            # All bounded contexts from §2
├── jobs/                     # BullMQ workers: importPlaylist, fetchCaptions, generateOg, sendDigest
├── infra/
│   ├── queue/                # Queue adapter (BullMQ / SQS / Cloud Tasks)
│   ├── events/               # Event bus + client tracker SDK
│   ├── youtube/              # YouTube Data API + IFrame helpers (typed, mocked in tests)
│   └── cache/                # Redis adapter
├── http/                     # Controllers (thin) + middleware (auth, rate limit, csrf)
├── realtime/                 # Optional WebSocket fanout for "import progress"
└── main.ts
```

**ADDED** — `jobs/`, `infra/queue/`, `infra/events/`, `infra/youtube/`, `infra/cache/`. Async processing, event tracking, and external-service isolation were the largest gaps in the original spec.

---

## 5. Data model

### 5.1 Core tables (unchanged shape, added provenance)

**MODIFIED** — every table that holds external metadata now carries a `source` discriminator and a `provenance` enum.

```
listening_sources
  id
  name            # "BBC Learning English" | "TED" | "Vox" | ...
  slug
  source_type     # bbc | youtube | dailydictation | podcast
  attribution_url # required for legal display
  license         # public_domain | licensed | youtube_embed_only | unknown
  crawl_status
  created_at

listening_lessons
  id
  source_id
  title
  slug
  source_url                 # canonical URL on the source platform
  embed_url                  # IFrame-ready URL (for YouTube)
  thumbnail_url
  duration_seconds
  level                      # a1 | a2 | b1 | b2 | c1 | c2 (inferred, not creator-labeled)
  published_at
  metadata_json
  status                     # active | unavailable | archived | region_locked | age_restricted
  last_verified_at           # when we last re-checked embeddability
  created_at
  updated_at
```

**MODIFIED** — added `source_type` discriminator and `license` column. The `license` column is the **legal spine** of the feature: it determines whether segment ground truth is storable, whether ads are allowed on the page, and whether a takedown is required on creator request.

**ADDED** — `last_verified_at` and `status` columns. YouTube creators can disable embedding silently overnight. Without a periodic re-verification job, the catalog will rot within weeks.

### 5.2 New tables (commercial necessities)

**ADDED** — none of these existed in the original spec. Each is required for a different phase but designed now to avoid migration pain.

```
listening_segments
  id
  lesson_id
  order_index
  start_ms
  end_ms
  text_ephemeral             # nullable; cleared after import session
  text_source               # creator_caption | auto_caption | user_provided | none
  difficulty                # inferred, 1-5
  vocabulary_refs[]         # FK into vocabulary_items

vocabulary_items            # global, deduped
  id
  lemma
  pos
  cefr_level
  definition
  ipa
  audio_url
  created_at

user_vocabulary
  id
  user_id
  vocab_id
  ease_factor               # SM-2 state
  interval_days
  next_review_at
  repetitions
  lapses
  source_lesson_id

segment_attempts            # event-sourced; one row per attempt
  id
  user_id
  lesson_id
  segment_id
  typed_text
  accuracy
  correct_count
  wrong_count
  missing_count
  extra_count
  hints_used
  replays_used
  duration_ms
  submitted_at

daily_user_stats            # pre-aggregated for fast dashboards
  user_id
  date                      # user-local date
  segments_completed
  segments_mastered
  vocab_saved
  vocab_reviewed
  xp_earned
  accuracy_avg
  minutes_active

subscriptions
  id
  user_id
  status                     # active | grace | past_due | canceled | expired
  tier                       # free | premium_monthly | premium_annual | student | team
  current_period_end
  provider                   # stripe
  provider_subscription_id
  created_at
  updated_at

share_links
  id
  token                      # short, public
  resource_type              # lesson | segment | result
  resource_id
  created_by
  expires_at
  click_count
  signup_attribution_count
```

**ADDED** — `listening_segments` table is intentionally **mostly empty** for YouTube. Only `start_ms`, `end_ms`, and `text_source` are populated at import time. The actual text is fetched into a transient cache for the duration of a single learning session and never persisted. This is the architectural enforcement of the legal boundary.

**ADDED** — `segment_attempts` is event-sourced. If we change the scoring algorithm in 2027, we can recompute analytics without losing data. This is cheap insurance.

### 5.3 Removed tables

**REMOVED** — the original spec implied a single `user_lesson_progress` table. We replace it with the combination of `segment_attempts` + `daily_user_stats`. Progress is derived, not stored. This is the right call for an event-sourced system.

---

## 6. API surface

**MODIFIED** — explicit versioned routes, parallel to BBC. No nesting under BBC.

### 6.1 Discovery & catalog

```
GET    /api/v1/listening/sources
GET    /api/v1/listening/youtube/featured          # curated seed library
GET    /api/v1/listening/youtube/playlists         # imported playlists for current user
GET    /api/v1/listening/youtube/lessons           # paged, filterable
GET    /api/v1/listening/youtube/lessons/{slug}
```

### 6.2 Import (async)

```
POST   /api/v1/listening/youtube/imports            # body: { playlist_url | video_url }
GET    /api/v1/listening/youtube/imports/{job_id}   # poll for status
```

**MODIFIED** — original spec was implicit about imports being synchronous. They are not. They return a `job_id` immediately; progress is polled or pushed via WebSocket / Server-Sent Events. **Idempotency-Key** header is required.

### 6.3 Learning session

```
GET    /api/v1/listening/youtube/lessons/{slug}/segments        # metadata only, text is empty for YT
POST   /api/v1/listening/youtube/lessons/{slug}/segments/{n}/attempts
GET    /api/v1/listening/youtube/lessons/{slug}/progress
```

**MODIFIED** — `GET .../segments` returns segment timing and `text_source` but **does not return the text** for YouTube. The text is fetched at session start into a server-side cache keyed by user+session+segment, valid for 30 minutes, then evicted. No persistence.

### 6.4 Vocabulary (SRS)

```
GET    /api/v1/vocabulary/me?due=true&limit=20
POST   /api/v1/vocabulary/me/{vocab_id}/review     # submit SM-2 review result
GET    /api/v1/vocabulary/me?status=learning
```

**ADDED** — vocabulary is a first-class resource, not a sub-resource of a lesson. This enables the spaced-repetition review queue that drives D7+ retention.

### 6.5 Progress & analytics

```
GET    /api/v1/me/stats?range=7d|30d|all
GET    /api/v1/me/streak
POST   /api/v1/events                                # batched client events
```

**ADDED** — explicit analytics endpoints. Without these, every retention experiment is guesswork.

### 6.6 Monetization & sharing

```
POST   /api/v1/subscriptions/checkout
POST   /api/v1/webhooks/stripe
GET    /api/v1/shares/{token}                       # public, no auth, returns OG meta + redirect
POST   /api/v1/shares                                # create
```

**ADDED** — required for Phase 2 conversion + viral loop.

---

## 7. State management

**MODIFIED** — explicit policy.

| Concern | Lives in | Reason |
|---|---|---|
| Server data (lessons, segments, attempts, stats) | **TanStack Query** | Cache, retries, invalidation |
| Cross-page UI state (current playlist, current lesson, current segment) | **Zustand** | Mirrors BBC pattern |
| Player imperative state (current time, playback rate, IFrame ref) | **useRef + useSyncExternalStore** | Imperative API does not belong in a reactive store |
| Form state (transcript draft) | **Local useState** | Short-lived, debounced autosave to server |
| Auth + entitlements | **Zustand (authStore) + TanStack Query** | Mirrors existing pattern |

**REMOVED** — no Redux, no MobX, no Recoil, no Jotai. The current BBC module already proved the right pattern; do not fragment it.

---

## 8. Async jobs

**ADDED** — the original spec had no job queue. Without one, the import endpoint cannot scale past a single concurrent user.

```
jobs/
├── ImportYouTubePlaylist      # playlistItems.list → videos.list → persist metadata
├── VerifyEmbeddability        # daily cron: re-check last_verified_at > 7d
├── FetchEphemeralSegmentText  # only on active learning session, TTL 30m
├── GenerateOgImage            # share link creation
├── SendWeeklyDigest           # email job
├── SendStreakReminder         # push job, timezone-aware
└── PurgeEphemeralCache         # cleanup of expired segment text
```

**ADDED** — `VerifyEmbeddability` is critical. YouTube creators disable embedding without notice. Without re-verification, the catalog will silently rot.

---

## 9. Event tracking spine

**ADDED** — the original spec had no analytics. This is the single highest-ROI addition.

Client-side `tracker.ts` wraps a single `POST /api/v1/events` with batching (every 5s or on visibility change).

Required events:

```
playlist_import_started
playlist_import_completed
playlist_import_failed       # reason: quota_exhausted | private | region_locked | invalid_url
lesson_viewed
lesson_started               # first segment opened
segment_played
segment_replayed
hint_revealed                # level: word_count | first_letter | full
segment_typed
segment_graded               # accuracy bucket
segment_mastered             # accuracy >= 80% on first try
vocab_saved
vocab_reviewed
vocab_mastered
streak_extended
streak_lost
paywall_viewed
paywall_dismissed
checkout_started
subscription_started
share_link_created
share_link_clicked
share_link_signup_attributed
```

Server events (job-triggered):
```
import_job_completed
import_job_failed
caption_unavailable          # when ground truth cannot be obtained
embeddability_lost           # video removed embedding
take_down_received           # DMCA
```

**MODIFIED** — events are batched, idempotent, and timestamped client-side. This is the spine of every future growth decision; do not skip it.

---

## 10. Caching policy

**ADDED** — original spec had no caching strategy.

| Resource | TTL | Layer | Notes |
|---|---|---|---|
| YouTube video metadata | 24h | Redis | keyed by video_id, invalidatable on `videos.list` response |
| YouTube playlist metadata | 7d | Redis | keyed by playlist_id |
| Lesson catalog (read path) | 1h | HTTP + CDN | `Cache-Control: public, max-age=300, s-maxage=3600` |
| User progress | 0 | no cache | source of truth is DB |
| Ephemeral segment text | 30m | Redis | **scoped to user_id + session_id**, never shared across users, evicted by `PurgeEphemeralCache` |
| OG images | 30d | CDN | content-hashed filenames |
| Static assets | 1y | CDN | immutable filenames |

---

## 11. YouTube-specific concerns

**ADDED** — these constraints are architectural, not policy suggestions.

### 11.1 Data API quota
- Daily quota: 10,000 units.
- `playlistItems.list`: 1 unit/call.
- `videos.list`: 1 unit/call.
- A 447-video playlist = ~450 units.
- **Hard cap per import**: 200 units (1 import ≈ 22/day at ceiling).
- Cache aggressively; batch with `videos.list` (up to 50 IDs/call).

### 11.2 Embeddability re-verification
- Daily cron for lessons with `last_verified_at` older than 7 days.
- Mark `status = 'unavailable'` if `videos.list` returns `status.embeddable = false`.
- Surface in UI as "Source video no longer embeddable" with link to original.

### 11.3 Caption policy
- **Do not call `captions.list` or `captions.download` for arbitrary videos.** This requires OAuth as the video owner and violates YouTube ToS for third-party use.
- For YouTube, the user **types** the transcript. No ground truth is stored.
- For Phase 4, partner with creators who grant written permission.

### 11.4 IFrame isolation
- IFrame player is loaded in a sandboxed component; no cross-origin scripting to the parent.
- `enablejsapi=1` is the only API interaction.
- Subscribe to `onReady`, `onStateChange`, `onError`, `onPlaybackRateChange`, `onPlaybackQualityChange` only.
- No undocumented events.

### 11.5 Legal display
Every YouTube lesson page must show:
- Source attribution: "Source: YouTube" with link to original.
- Creator name and link.
- License indicator: "Embedded playback only. Transcripts are user-typed."
- "Report this content" link → moderation queue.

---

## 12. Security

**ADDED** — original spec was silent.

- **Auth**: OAuth or email/password with secure session cookies. Reuse existing auth module.
- **Authorization**: per-user ownership on `user_playlists`, `segment_attempts`, `user_vocabulary`. Lesson catalog is public read.
- **Rate limiting**:
  - `POST /imports`: 5/user/hour, 50/global/hour.
  - `POST /attempts`: 60/user/minute.
  - `POST /events`: 100/user/minute.
- **CSRF** on all state-changing endpoints.
- **Input sanitization**: YouTube titles and descriptions are user-visible; strip HTML, validate length, store as plain text.
- **SSRF**: thumbnail URLs are not refetched server-side; we use the URL YouTube gives us.
- **PII**: events strip email and password; only `user_id` is included.
- **GDPR**: `/api/v1/me/export` returns a zip of all user data; `/api/v1/me/delete` cascades across all tables.

---

## 13. Accessibility

**ADDED** — original spec was silent.

- **WCAG 2.1 AA** baseline.
- All custom controls expose ARIA roles mirroring native `<video>` (play, pause, seek, mute, fullscreen).
- Keyboard shortcuts: `Space` (play/pause), `Enter` (check), `R` (replay), `H` (hint), `→` (next), `Cmd/Ctrl+K` (palette).
- Visible focus rings on every interactive element.
- Color is never the only signal: correct/incorrect use icon + text + color.
- `prefers-reduced-motion` disables count-up animations and slide transitions.
- Live region announces segment transitions and grading results.
- Transcript textarea has a visible label and `aria-describedby` for hint count.

---

## 14. Testing strategy

**MODIFIED** — explicit policy.

| Layer | Tool | Coverage target | Notes |
|---|---|---|---|
| Domain logic | Vitest | 95%+ | URL parsing, scoring, SM-2 scheduler, XP, streak rollover, timezone math, segment state machine |
| Components | Vitest + RTL | 80%+ | Player, TranscriptInput, ResultPanel, ProgressRing |
| Integration | Vitest + RTL | 12 critical paths | Full import → first segment → grade → save vocab |
| E2E | Playwright | 12 scenarios min, growing to 25 | See below |
| Accessibility | axe-core in Playwright | 0 violations on key pages | |
| Visual | Chromatic or Percy | 6 main pages | |
| Load | k6 | 200 concurrent, 5k seg/min grading | |
| Mutation | Stryker on scoring engine | 70%+ kill rate | |
| Security | OWASP ZAP in CI | monthly scan | |
| Dependency | Snyk or npm audit | 0 high/critical | |

Playwright scenarios (minimum 12):
1. Open curated seed library → click a lesson → first segment plays in <5s
2. Paste a YouTube playlist URL → see streaming progress → see lesson list
3. Type correct transcript → graded correctly with green feedback
4. Type wrong transcript → graded with red feedback and word-level diff
5. Use 1 hint → see word count → still wrong → retry
6. Reach 80% accuracy → next segment unlocks (soft unlock — can still proceed below)
7. Save a word to vocabulary → appears in vocab list → appears in review queue next day
8. Refresh mid-lesson → state restored from server
9. Open on iPhone 15 viewport → mobile layout → type → submit
10. Paste bad URL → graceful error with actionable recovery
11. Paste age-restricted video → "unavailable" status shown, no black box
12. Use keyboard shortcuts end-to-end (Space, R, H, Enter, →)

---

## 15. Performance budget

**ADDED** — explicit budget. CI fails the build if exceeded.

| Metric | Target |
|---|---|
| Initial JS bundle | < 250 KB gzipped |
| Time to Interactive (4G mobile) | < 2.5s |
| First Contentful Paint | < 1.5s |
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 95 |
| Lighthouse SEO | > 95 |
| Lighthouse Best Practices | > 95 |
| Player route TTI | < 3.5s |
| API p95 latency (lesson read) | < 200ms |
| API p95 latency (attempt submit) | < 300ms |
| DB connection pool size | 20 |

---

## 16. Deployment

**MODIFIED** — original spec did not specify deployment topology.

- **Frontend**: Vite build → CDN (Cloudflare). Edge cached for static assets. SPA hydration.
- **API**: containerized (Node + Hono/NestJS), autoscaling 2-10 instances.
- **Worker**: containerized, dedicated autoscaling for queue workers, scales 1-5 based on queue depth.
- **DB**: managed Postgres with read replica for analytics queries.
- **Cache**: managed Redis.
- **Queue**: managed (SQS / Cloud Tasks / BullMQ+Redis).
- **CDN**: Cloudflare in front of all user-facing traffic.
- **Observability**: structured logs, traces (OpenTelemetry), metrics, alerts on quota exhaustion and import failure rate.

---

## 17. What changed and why (summary)

| Change | Why |
|---|---|
| One bounded context for all sources | YouTube is structurally identical to BBC; splitting creates duplication |
| Added `subscription`, `discovery`, `sharing` contexts | Phase 2+ business model requires them as first-class |
| Mirrored `pages/youtube/` next to `pages/bbc/` | Reuse over invention; faster shipping, lower bug surface |
| Async job queue with `ImportYouTubePlaylist` | Synchronous import cannot scale; quota exhaustion is a real risk |
| Event tracking spine with 20+ events | Without this, every retention experiment is guesswork |
| `listening_segments.text_ephemeral` + 30m TTL cache | Architectural enforcement of the legal boundary on YouTube captions |
| `last_verified_at` + `VerifyEmbeddability` job | Catalog will silently rot without it |
| `segment_attempts` event-sourced | Cheap insurance against algorithm changes |
| `user_lesson_progress` removed | Replaced by `segment_attempts` + `daily_user_stats`; progress is derived |
| `GET .../segments` returns no text for YouTube | Legal boundary |
| Idempotency-Key on import | Quota preservation under retry |
| Player state in `useRef + useSyncExternalStore` | Imperative IFrame API does not belong in a reactive store |
| Stripe + entitlements domain | Phase 2 conversion is a product requirement |
| Caching policy with TTLs | Original spec was silent; required for cost and latency |
| Security: rate limits, CSRF, PII strip, GDPR | Required for any public launch |
| Accessibility: ARIA, keyboard, reduced motion, live regions | Required for WCAG AA and for real users |
| Testing strategy with coverage targets, mutation, load, security | Without explicit policy, coverage decays to 0 in 6 months |
| Performance budget with CI enforcement | "We care about performance" is not a strategy |
| Removed CQRS / Hexagonal ports / new state library | Over-engineering for the scale; reuse existing patterns |
| Removed hard "unlock next segment" gate | Anti-pattern; replaced with soft mastery threshold |

---

## 18. Open questions for the product owner

1. **Free tier caps**: 5 segments/day vs 3 lessons/day vs 10 minutes/day. Product decision, not architecture. Recommend 5 segments/day for the first 60 days, then re-evaluate from event data.
2. **Streak grace days**: paid feature? Or only streak freeze? Product decision.
3. **AI feedback in MVP**: confirm defer to Phase 4. Strong recommendation.
4. **YouTube creator partnerships**: 3 signed letters of intent by when? Required before any caption-related feature ships.
5. **DMCA agent registration**: who is the registered agent? Required before public launch.
6. **Daily lesson push**: server-pushed or client-poll? Architectural impact.
