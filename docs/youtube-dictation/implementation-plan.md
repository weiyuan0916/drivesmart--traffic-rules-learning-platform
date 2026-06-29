# Implementation Plan — RFC 001 YouTube Dictation MVP

**Workflow**: brainstorming ✓ → worktree ✓ (see step 0) → plan (this doc) → subagent-driven dev → TDD → code review → branch finish
**Branch policy**: feature branch off `main`, single linear history, squash-merge
**Task budget**: every task ≤ 5 min, RED-GREEN-REFACTOR cycle, typecheck + lint + test must pass before "done"
**Stop rule**: stop after each batch, run verification, await OK before next batch

---

## Phase 0 — Spike (pre-MVP, week 0)

Goal: kill the riskiest assumption (can we get caption text from any YouTube URL in < 30s?) and stand up the worktree. **Hard stop** if Phase 0 fails — every later phase depends on it.

### 0.0 — Worktree setup
**Files**: `.git`, new branch `feat/youtube-mvp-spike`
**Tasks**
- 0.0.1  Run `cd /Users/edward/Documents/GitHub/drivesmart--traffic-rules-learning-platform && git worktree add ../drivesmart--yt-spike -b feat/youtube-mvp-spike main`
- 0.0.2  `cd ../drivesmart--yt-spike && npm install`
- 0.0.3  `git status` (expect clean)
**Tests**: none (mechanical)
**Acceptance**: worktree dir exists, branch checked out, `node_modules` populated
**Verification**: `git branch --show-current` → `feat/youtube-mvp-spike`, `ls node_modules/zod/package.json` exists
**Rollback**: `git worktree remove --force ../drivesmart--yt-spike && git branch -D feat/youtube-mvp-spike`

### 0.1 — Add `youtube-dl` style fetcher dep + typed wrapper
**Files**: `package.json`, `src/features/listening/lib/youtube/urlParser.ts`, `src/features/listening/lib/youtube/urlParser.test.ts`
**Tests** (RED first): 15 URL formats incl. `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/playlist?list=`, `youtube.com/shorts/`, `m.youtube.com`, `youtube.com/embed/`, `youtube.com/live/`, with/without `&t=`, with/without `index=`, with `&list=` orphan video, channel URLs (should reject).
**Tasks**
- 0.1.1  RED: write `urlParser.test.ts` with 15 fixtures and `expect(() => parseYouTubeUrl(...)).toThrow()` for invalid.
- 0.1.2  Run `npx vitest run src/features/listening/lib/youtube/urlParser.test.ts` → expect failures, file may not exist.
- 0.1.3  GREEN: implement `urlParser.ts` with `parseYouTubeUrl(input): { kind: 'video'|'playlist'|'invalid', id: string, startMs?: number }`.
- 0.1.4  Run `npx vitest run src/features/listening/lib/youtube/urlParser.test.ts` → expect 15/15 pass.
- 0.1.5  REFACTOR: extract regex constants, add JSDoc, ensure no `any`.
**Acceptance**: 15/15 tests pass, `npm run typecheck` clean, `npm run lint` clean.
**Verification**: `npx vitest run src/features/listening/lib/youtube/urlParser.test.ts && npm run typecheck`
**Rollback**: `git checkout main -- src/features/listening/lib/youtube/ && rm -rf src/features/listening/lib/youtube/`

### 0.2 — Public TimedText fetcher
**Files**: `src/features/listening/lib/youtube/captionFetcher.ts`, `src/features/listening/lib/youtube/captionFetcher.test.ts`
**Tests** (RED): mock `fetch`, assert URL constructed with `https://www.youtube.com/api/timedtext?v=...&lang=en&fmt=vtt` or `&kind=asr`, parses VTT to `{ startMs, endMs, text }[]`, handles empty body, handles 404.
**Tasks**
- 0.2.1  RED: write `captionFetcher.test.ts` with 4 scenarios (success, empty, 404, malformed VTT).
- 0.2.2  Run vitest → expect failure.
- 0.2.3  GREEN: implement `fetchCaptions(videoId, opts)` calling public TimedText endpoint, return `Caption[]`.
- 0.2.4  Run vitest → all pass.
- 0.2.5  REFACTOR: separate `vttParser.ts` from `captionFetcher.ts`.
**Acceptance**: 4/4 tests pass, typecheck clean, no network in tests (mocked).
**Verification**: `npx vitest run src/features/listening/lib/youtube/captionFetcher.test.ts`
**Rollback**: `git checkout main -- src/features/listening/lib/youtube/`

### 0.3 — Whisper fallback fetcher
**Files**: `src/features/listening/lib/youtube/whisperFetcher.ts`, `src/features/listening/lib/youtube/whisperFetcher.test.ts`
**Tests** (RED): mock OpenAI client, assert segments split on silence, cost recorded, 60s timeout.
**Tasks**
- 0.3.1  Add `@types/node` already present; add `openai` to deps: `npm install openai`.
- 0.3.2  RED: write test asserting 10-min audio → ≥ 5 segments with `startMs`, `endMs`, `text`, `costUsd`.
- 0.3.3  GREEN: implement `transcribeWithWhisper(audioUrl, opts)` using `gpt-4o-transcribe`, 60s timeout, 3 retries with exponential backoff.
- 0.3.4  REFACTOR: extract `estimateCost(durationSec)` pure function.
**Acceptance**: tests pass, mock only, no real API call.
**Verification**: `npx vitest run src/features/listening/lib/youtube/whisperFetcher.test.ts`
**Rollback**: `npm uninstall openai && git checkout main -- src/features/listening/lib/youtube/whisperFetcher.*`

### 0.4 — Segmenter
**Files**: `src/features/listening/lib/youtube/segmenter.ts`, `src/features/listening/lib/youtube/segmenter.test.ts`
**Tests** (RED): input 10 captions → output 5-10s segments, never <3s or >15s, never crosses sentence boundary if input is punctuated.
**Tasks**
- 0.4.1  RED: write test cases.
- 0.4.2  GREEN: implement `segmentCaptions(captions, opts={minMs:3000,maxMs:10000})`.
- 0.4.3  REFACTOR: pure function, no side effects, no I/O.
**Acceptance**: 100% test pass, pure function.
**Verification**: `npx vitest run src/features/listening/lib/youtube/segmenter.test.ts`
**Rollback**: `rm src/features/listening/lib/youtube/segmenter.*`

### 0.5 — Caption pipeline orchestrator
**Files**: `src/features/listening/lib/youtube/captionPipeline.ts`, `src/features/listening/lib/youtube/captionPipeline.test.ts`
**Tests** (RED): TimedText success → no Whisper call; TimedText 404 → Whisper call; both fail → `{ status: 'failed', reason }`.
**Tasks**
- 0.5.1  RED: 3 scenarios.
- 0.5.2  GREEN: orchestrator: try TimedText → on fail, try Whisper → on fail, mark failed.
- 0.5.3  REFACTOR: inject fetcher deps for testability.
**Acceptance**: 3/3 pass.
**Verification**: `npx vitest run src/features/listening/lib/youtube/captionPipeline.test.ts`
**Rollback**: `rm src/features/listening/lib/youtube/captionPipeline.*`

### 0.6 — Manual spike on 10 real videos
**Files**: `scripts/spike-youtube.ts` (not committed), temporary
**Tasks**
- 0.6.1  Write a throwaway script: read 10 hardcoded URLs, run pipeline, log `videoId | captionSource | segmentCount | latencyMs | accuracyHeuristic`.
- 0.6.2  Run: `npx tsx scripts/spike-youtube.ts` (use existing `tsx` dep).
- 0.6.3  **Decision gate**: if 9/10 videos produce ≥ 5 segments with `latencyMs < 30000`, proceed. Otherwise stop and re-plan.
**Acceptance**: 9/10 success, decision documented in `docs/youtube-dictation/spike-results.md`.
**Verification**: open the log file, count successes.
**Rollback**: `rm scripts/spike-youtube.ts` — no production impact.

---

## Phase 1 — MVP Backend + Core Loop (weeks 1-3)

Goal: paste-URL → dictation session working end-to-end against real YouTube videos, with database persistence and ephemeral text cache.

### 1.1 — DB migrations
**Files**: `api/listening/_lib/migrations/001_youtube_mvp.sql` (new), `api/listening/_lib/db.ts`
**Tasks**
- 1.1.1  Create migration file with 4 tables (full SQL in spec):
  - `listening_youtube_lessons` (id, slug, source_url, embed_url, thumbnail_url, duration_seconds, status, created_at)
  - `listening_youtube_segments` (id, lesson_id, order_index, start_ms, end_ms, difficulty, text_source) — **no text column**
  - `youtube_segment_attempts` (id, user_id, lesson_id, segment_id, typed_text, accuracy, correct_count, wrong_count, missing_count, extra_count, hints_used, replays_used, duration_ms, submitted_at)
  - `youtube_session_cache` (session_id PK, user_id, lesson_id, text_ciphertext, expires_at) — Redis-backed, schema is the *fallback* table only
- 1.1.2  Add `CREATE INDEX` on `youtube_segment_attempts(user_id, submitted_at DESC)`, `listening_youtube_segments(lesson_id, order_index)`, `listening_youtube_lessons(slug) UNIQUE`.
- 1.1.3  Add `ALTER TABLE` to enable RLS on `youtube_segment_attempts` (policy: `user_id = current_setting('app.user_id')::uuid`).
- 1.1.4  Verify: `psql $DATABASE_URL -f api/listening/_lib/migrations/001_youtube_mvp.sql` in dev DB.
**Tests**: manual `psql` to confirm tables exist with expected columns.
**Acceptance**: migration applies cleanly, RLS policy visible in `\d` output.
**Verification**: `psql -c "\dt listening_youtube_*" -c "\d youtube_segment_attempts"`.
**Rollback**: `psql $DATABASE_URL -c "DROP TABLE youtube_session_cache, youtube_segment_attempts, listening_youtube_segments, listening_youtube_lessons CASCADE;"`

### 1.2 — Redis cache adapter
**Files**: `api/listening/_lib/cache.ts`, `tests/unit/cache.test.ts`
**Tests** (RED): set, get, TTL expiry, prefix namespacing, graceful degradation when Redis down (returns null, doesn't throw).
**Tasks**
- 1.2.1  Install `ioredis`: `npm install ioredis`.
- 1.2.2  RED: 5 test cases.
- 1.2.3  GREEN: adapter with `get/set/del/withFallback`, prefix `yt:cache:`.
- 1.2.4  REFACTOR: circuit breaker after 3 consecutive failures.
**Acceptance**: 5/5 pass.
**Verification**: `npx vitest run tests/unit/cache.test.ts`
**Rollback**: `npm uninstall ioredis && rm api/listening/_lib/cache.ts tests/unit/cache.test.ts`

### 1.3 — Quota governor
**Files**: `api/listening/_lib/quotaGovernor.ts`, `tests/unit/quotaGovernor.test.ts`
**Tests** (RED): reserve under cap returns reservation_id, reserve at cap returns 429, reservation expires at midnight Pacific, daily reset.
**Tasks**
- 1.3.1  RED: 4 test cases using fake clock.
- 1.3.2  GREEN: `reserve(quotaType, units)`, key `yt:quota:{date}`, `INCRBY`, 10k cap.
- 1.3.3  REFACTOR: log every reservation + denial.
**Acceptance**: 4/4 pass, never exceeds cap.
**Verification**: `npx vitest run tests/unit/quotaGovernor.test.ts`
**Rollback**: `rm api/listening/_lib/quotaGovernor.ts tests/unit/quotaGovernor.test.ts`

### 1.4 — POST /api/v1/listening/youtube/imports
**Files**: `api/v1/listening/youtube/imports.ts`, `tests/e2e/youtube-imports.spec.ts`
**Tests** (RED): 201 with job_id, 400 on invalid URL, 401 on missing auth, 429 on quota exhausted (mock), 200 with `Idempotency-Key` returns same job_id.
**Tasks**
- 1.4.1  RED: write E2E spec.
- 1.4.2  GREEN: handler that validates URL, calls `quotaGovernor.reserve('youtube_data_api', 2)`, inserts row in `youtube_imports` table (new, in migration), returns `{ job_id, status: 'queued' }`.
- 1.4.3  REFACTOR: extract `validateUrl` + `requireAuth` middleware.
- 1.4.4  Add `Idempotency-Key` dedup via Redis `SET NX EX 86400`.
**Acceptance**: 5/5 E2E pass.
**Verification**: `npx playwright test tests/e2e/youtube-imports.spec.ts`
**Rollback**: `rm api/v1/listening/youtube/imports.ts tests/e2e/youtube-imports.spec.ts && psql -c "DROP TABLE youtube_imports"`

### 1.5 — GET /api/v1/listening/youtube/imports/{job_id}
**Files**: `api/v1/listening/youtube/imports/[jobId].ts`, add to E2E spec
**Tests**: 200 with status, 404 on missing, polling shows progress `queued` → `parsing` → `captioning` → `ready` → `failed`.
**Tasks**
- 1.5.1  RED: 3 test cases.
- 1.5.2  GREEN: handler reads from `youtube_imports`.
- 1.5.3  REFACTOR: SSE endpoint for real-time progress (deferred to 1.6 if scope creep).
**Acceptance**: 3/3 pass.
**Verification**: `npx playwright test tests/e2e/youtube-imports.spec.ts`
**Rollback**: `rm api/v1/listening/youtube/imports/[jobId].ts`

### 1.6 — Worker: processImportJob
**Files**: `api/listening/_lib/workers/processImport.ts`, `tests/unit/processImport.test.ts`
**Tests** (RED): happy path persists lesson + segments, on caption fail persists lesson with `status='unavailable'`, on quota fail retries.
**Tasks**
- 1.6.1  Add a worker process entry: `server/youtubeWorker.ts` (Express + BullMQ pattern matching `server/listening_server.ts`).
- 1.6.2  RED: 3 test cases.
- 1.6.3  GREEN: job runs caption pipeline, persists lesson slug `yt-{videoId}-{hash}`, persists segment rows without text.
- 1.6.4  REFACTOR: idempotent on `source_url` UNIQUE.
**Acceptance**: 3/3 pass, real run inserts row in DB.
**Verification**: `psql -c "SELECT slug, status FROM listening_youtube_lessons ORDER BY created_at DESC LIMIT 1"`
**Rollback**: `rm api/listening/_lib/workers/processImport.ts server/youtubeWorker.ts`

### 1.7 — GET /api/v1/listening/youtube/lessons/{slug}/segments
**Files**: `api/v1/listening/youtube/lessons/[slug]/segments.ts`, `tests/e2e/youtube-segments.spec.ts`
**Tests**: 200 with timing only, 200 with text after cache fill, 404 on bad slug, 401 unauth.
**Tasks**
- 1.7.1  RED: 4 cases.
- 1.7.2  GREEN: handler reads segments from DB, checks Redis `yt:cache:lesson:{slug}:session:{userId}` for text; if miss, runs caption pipeline inline (with timeout 25s), stores in Redis TTL 24h, returns text + timing.
- 1.7.3  REFACTOR: extract `resolveLessonText(slug, userId)` helper.
**Acceptance**: 4/4 pass, text never in DB.
**Verification**: `psql -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'listening_youtube_segments'"` — expect no `text` column.
**Rollback**: `rm api/v1/listening/youtube/lessons/[slug]/segments.ts tests/e2e/youtube-segments.spec.ts`

### 1.8 — Scoring engine (RED-GREEN-REFACTOR)
**Files**: `src/features/listening/lib/scoring/grade.ts`, `src/features/listening/lib/scoring/grade.test.ts`, `src/features/listening/lib/scoring/types.ts`, `src/features/listening/lib/scoring/normalize.ts`, `src/features/listening/lib/scoring/normalize.test.ts`
**Tests**: 8 fixtures covering exact match, missing articles, extra words, capitalization, contractions, punctuation, repeated words, empty input.
**Tasks**
- 1.8.1  RED: `normalize.test.ts` (lowercase, strip punctuation, expand `I'm`→`i am`, collapse whitespace) — 4 cases.
- 1.8.2  GREEN: `normalize.ts` pure function.
- 1.8.3  RED: `grade.test.ts` (Levenshtein-based diff) — 8 cases.
- 1.8.4  GREEN: `grade.ts` returns `{ accuracy, correct[], wrong[], missing[], extra[] }`.
- 1.8.5  REFACTOR: extract `levenshtein.ts` from `grade.ts`, keep both 100% covered.
**Acceptance**: 12/12 pass, pure functions, no I/O.
**Verification**: `npx vitest run src/features/listening/lib/scoring/`
**Rollback**: `rm -rf src/features/listening/lib/scoring/`

### 1.9 — POST .../segments/{n}/attempts
**Files**: `api/v1/listening/youtube/lessons/[slug]/segments/[n]/attempts.ts`, `tests/e2e/youtube-attempts.spec.ts`
**Tests**: 201 with grade, 400 on empty, 401 unauth, 404 on bad segment, rate limit 30/min enforced.
**Tasks**
- 1.9.1  RED: 5 cases.
- 1.9.2  GREEN: handler imports `grade.ts` from frontend lib (move to `src/features/listening/lib/scoring/` — already done in 1.8), persists `youtube_segment_attempts`, returns grade.
- 1.9.3  REFACTOR: rate limit via Redis `INCR` with 60s TTL.
**Acceptance**: 5/5 pass.
**Verification**: `npx playwright test tests/e2e/youtube-attempts.spec.ts`
**Rollback**: `rm api/v1/listening/youtube/lessons/[slug]/segments/[n]/attempts.ts tests/e2e/youtube-attempts.spec.ts`

### 1.10 — Standard error contract
**Files**: `api/listening/_lib/errors.ts`, refactor all Phase 1 handlers
**Tests**: 4 cases (400, 401, 404, 429) all return `{ error: { code, message, request_id } }`.
**Tasks**
- 1.10.1  RED: spec asserting error shape.
- 1.10.2  GREEN: middleware `withErrorContract(handler)` that wraps responses.
- 1.10.3  Apply to all 5 endpoints created in 1.4, 1.5, 1.7, 1.9.
- 1.10.4  REFACTOR: ensure `request_id` from `X-Request-Id` header or `crypto.randomUUID()`.
**Acceptance**: every error response matches contract, `request_id` always present.
**Verification**: `npx playwright test tests/e2e/youtube-error-contract.spec.ts`
**Rollback**: `rm api/listening/_lib/errors.ts && git checkout main -- api/v1/listening/youtube/`

### 1.11 — Health endpoint
**Files**: `api/v1/health.ts`
**Tests**: 200 when DB+Redis up, 503 when DB down (mock).
**Tasks**
- 1.11.1  RED: 2 cases.
- 1.11.2  GREEN: returns `{ status, db, redis, queue, version }`.
**Acceptance**: 2/2 pass.
**Verification**: `curl http://localhost:3000/api/v1/health | jq`
**Rollback**: `rm api/v1/health.ts`

---

## Phase 2 — Frontend + Auth + Launch (weeks 4-6)

Goal: paste-URL works in the browser, magic-link signup, events tracked, beta with 50 users, KOL launch.

### 2.1 — Landing page: paste-URL input
**Files**: `src/features/listening/pages/youtube/YoutubeLandingPage.tsx`, `src/features/listening/pages/youtube/YoutubeLandingPage.test.tsx`
**Tests** (RED): renders input, validates URL on submit (use `urlParser` from 0.1), shows loader, error state for bad URL, calls `importApi.start(url)`.
**Tasks**
- 2.1.1  RED: 4 RTL cases.
- 2.1.2  GREEN: minimal page reusing Tailwind tokens from `src/index.css` `--accent: #FF5632` etc.
- 2.1.3  REFACTOR: extract `PasteUrlForm` component.
**Acceptance**: 4/4 pass, Lighthouse perf > 90.
**Verification**: `npx vitest run src/features/listening/pages/youtube/YoutubeLandingPage.test.tsx && npm run build`
**Rollback**: `rm -rf src/features/listening/pages/youtube/`

### 2.2 — Import progress hook
**Files**: `src/features/listening/hooks/useImportProgress.ts`, `src/features/listening/hooks/useImportProgress.test.tsx`
**Tests** (RED): polls every 2s, stops on `ready`/`failed`, returns progress_pct.
**Tasks**
- 2.2.1  RED: 3 cases using `@testing-library/react` fake timers.
- 2.2.2  GREEN: TanStack Query `useQuery` with `refetchInterval: (data) => data?.status === 'ready' ? false : 2000`.
- 2.2.3  REFACTOR: cap retries at 30 (60s max wait).
**Acceptance**: 3/3 pass.
**Verification**: `npx vitest run src/features/listening/hooks/useImportProgress.test.tsx`
**Rollback**: `rm src/features/listening/hooks/useImportProgress*`

### 2.3 — Dictation session page
**Files**: `src/features/listening/pages/youtube/YoutubeDictationPage.tsx`, `src/features/listening/pages/youtube/components/YouTubePlayer.tsx`, `src/features/listening/pages/youtube/components/DictationInput.tsx`, `src/features/listening/pages/youtube/components/ResultPanel.tsx`
**Tests** (RED): segment-by-segment loop, replay button, hint button, check button calls `attemptsApi.submit`, result panel shows diff.
**Tasks**
- 2.3.1  RED: 6 RTL cases for full session flow.
- 2.3.2  GREEN: page + 3 components, reuse `DictationInput` from `src/features/listening/components/TranscriptInput.tsx` if structurally compatible.
- 2.3.3  YouTubePlayer: load `https://www.youtube.com/embed/{id}?enablejsapi=1` in `<iframe sandbox="allow-scripts allow-same-origin allow-presentation">`.
- 2.3.4  Implement imperative `useRef + useSyncExternalStore` per architecture.
- 2.3.5  REFACTOR: extract `useSegmentStateMachine` XState-style (plain discriminated union, no lib).
**Acceptance**: 6/6 pass, page TTI < 3.5s.
**Verification**: `npx vitest run src/features/listening/pages/youtube/YoutubeDictationPage.test.tsx && npm run build`
**Rollback**: `rm -rf src/features/listening/pages/youtube/`

### 2.4 — Result page + magic-link prompt
**Files**: `src/features/listening/pages/youtube/YoutubeResultPage.tsx`, `src/features/listening/pages/youtube/components/SaveProgressPrompt.tsx`
**Tests** (RED): accuracy ring renders, vocab save button works, magic-link form validates email.
**Tasks**
- 2.4.1  RED: 3 RTL cases.
- 2.4.2  GREEN: page reuses `ProgressRing` if present, else build inline.
- 2.4.3  REFACTOR: extract vocab save API hook.
**Acceptance**: 3/3 pass.
**Verification**: `npx vitest run src/features/listening/pages/youtube/YoutubeResultPage.test.tsx`
**Rollback**: `rm src/features/listening/pages/youtube/YoutubeResultPage.*`

### 2.5 — Magic-link auth
**Files**: `api/v1/auth/magic-link.ts`, `api/v1/auth/verify.ts`, `api/v1/me.ts`, `src/features/listening/api/authApi.ts`, `src/features/listening/stores/authStore.ts`
**Tests** (RED): POST email returns 202, GET verify sets cookie, GET /me returns user.
**Tasks**
- 2.5.1  Install `resend`: `npm install resend`.
- 2.5.2  RED: 4 E2E cases.
- 2.5.3  GREEN: handlers + email template (plain text only).
- 2.5.4  Token: 32-char base64, Redis-stored, 15min TTL.
- 2.5.5  Update `authStore` to read from `/me`.
- 2.5.6  REFACTOR: extract `sendMagicLink(email)` helper.
**Acceptance**: 4/4 pass, no real email sent in test.
**Verification**: `npx playwright test tests/e2e/auth-magic-link.spec.ts`
**Rollback**: `npm uninstall resend && git checkout main -- api/v1/auth/ api/v1/me.ts src/features/listening/api/authApi.ts`

### 2.6 — Event tracking SDK
**Files**: `src/features/listening/lib/tracker.ts`, `src/features/listening/lib/tracker.test.ts`, `src/features/listening/lib/events.ts` (Zod schema)
**Tests** (RED): batch every 5s, flush on visibility change, dedup window 10s, reject unknown events server-side.
**Tasks**
- 2.6.1  RED: 5 cases with `vi.useFakeTimers()`.
- 2.6.2  GREEN: tracker with 19 events from RFC §API contract.
- 2.6.3  Wire to all Phase 2 pages.
- 2.6.4  REFACTOR: typed `track(name, props)` with Zod validation client-side.
**Acceptance**: 5/5 pass, network calls < 1/5s in normal use.
**Verification**: `npx vitest run src/features/listening/lib/tracker.test.ts`
**Rollback**: `rm src/features/listening/lib/tracker.* src/features/listening/lib/events.ts`

### 2.7 — Free-tier enforcement
**Files**: `api/v1/listening/youtube/_lib/freeTier.ts`, `tests/unit/freeTier.test.ts`
**Tests** (RED): 4th session in a day returns 429, 14-day trial lifts cap, cap resets at user-local midnight.
**Tasks**
- 2.7.1  RED: 4 cases.
- 2.7.2  GREEN: Redis counter `yt:freetier:{userId}:{date}`, atomic `INCR` with TTL.
- 2.7.3  Wire to all session endpoints from Phase 1.
- 2.7.4  REFACTOR: `Entitlement` enum in DB: `free|trial|premium`.
**Acceptance**: 4/4 pass.
**Verification**: `npx vitest run tests/unit/freeTier.test.ts && npx playwright test tests/e2e/free-tier.spec.ts`
**Rollback**: `rm api/v1/listening/youtube/_lib/freeTier.ts tests/unit/freeTier.test.ts`

### 2.8 — Mobile responsive + a11y
**Files**: CSS only, audit via `tests/e2e/a11y.spec.ts`
**Tests** (RED): axe-core 0 violations on landing, dictation, result pages; keyboard-only flow works.
**Tasks**
- 2.8.1  RED: `tests/e2e/a11y.spec.ts` with `@axe-core/playwright`.
- 2.8.2  GREEN: fix violations (likely: focus rings, ARIA labels on IFrame, color contrast).
- 2.8.3  REFACTOR: extract `useKeyboardShortcuts` (Space, R, H, Enter).
**Acceptance**: 0 axe violations, Lighthouse a11y > 95.
**Verification**: `npx playwright test tests/e2e/a11y.spec.ts && npm run build && npx lhci autorun`
**Rollback**: `git checkout main -- tests/e2e/a11y.spec.ts`

### 2.9 — 12 E2E scenarios
**Files**: `tests/e2e/youtube-full-flow.spec.ts`
**Tests**: paste-URL happy path, type-correct, type-wrong, hint, vocab save, refresh mid-session, mobile viewport, bad URL, age-restricted, keyboard-only, error states, magic-link.
**Tasks**
- 2.9.1  RED: 12 scenarios.
- 2.9.2  GREEN: each scenario isolated, uses `test.beforeEach` to seed DB.
- 2.9.3  REFACTOR: extract `seedYouTubeLesson(slug, segments)` helper.
**Acceptance**: 12/12 pass, total runtime < 90s.
**Verification**: `npx playwright test tests/e2e/youtube-full-flow.spec.ts`
**Rollback**: `rm tests/e2e/youtube-full-flow.spec.ts`

### 2.10 — Beta + KOL launch prep
**Files**: `docs/youtube-dictation/beta-results.md` (writeup, not code)
**Tasks**
- 2.10.1  Deploy preview to Vercel: `vercel --prod=false`.
- 2.10.2  Recruit 50 users via existing channels (no code).
- 2.10.3  Run for 7 days, collect PostHog events + 5 user interviews.
- 2.10.4  Fix top 5 issues found (each becomes a Phase 1.x task, added to this plan in a follow-up).
**Acceptance**: 5 interviews completed, top 5 issues filed as issues in repo, KPI table filled in.
**Verification**: open `docs/youtube-dictation/beta-results.md`, confirm metrics.
**Rollback**: N/A (operational).

### 2.11 — Code review
**Files**: PR opened against `main`
**Tasks**
- 2.11.1  Open PR: `gh pr create --base main --title "feat: youtube dictation MVP (RFC 001)" --body "..."`.
- 2.11.2  Self-review the diff: `gh pr diff`.
- 2.11.3  Request Bugbot via `gh pr comment /bugbot review`.
- 2.11.4  Address all P0/P1 comments.
- 2.11.5  Final verification: `npm run check && npm run test:run && npx playwright test`.
**Acceptance**: 0 P0/P1 comments open, all CI checks green.
**Verification**: PR view shows "All checks passed".
**Rollback**: `gh pr close` if blockers found.

### 2.12 — Merge + cleanup
**Files**: branch deletion
**Tasks**
- 2.12.1  Squash-merge: `gh pr merge --squash`.
- 2.12.2  `git worktree remove --force ../drivesmart--yt-spike`.
- 2.12.3  `git branch -d feat/youtube-mvp-spike`.
- 2.12.4  Tag release: `git tag v0.1.0-mvp`.
**Acceptance**: branch gone, worktree gone, tag pushed.
**Verification**: `git branch -a | grep yt-mvp` → empty.
**Rollback**: `git tag -d v0.1.0-mvp && git push origin :v0.1.0-mvp` (if not yet public).

---

## Stop conditions

- After **0.6** (spike) — proceed to Phase 1 only if ≥ 9/10 videos succeed. Otherwise halt, document failure, re-plan.
- After **1.11** — Phase 1 done means: paste-URL → DB lesson exists → segments fetchable → attempt grading works end-to-end. Test it manually with one real video.
- After **2.9** — all 12 E2E pass means MVP is technically shippable. Continue to 2.10-2.12.
- After **2.12** — Phase 2 done, ready for KOL post. KOL goes live → start measuring 90-day KPIs from RFC.

## Verification matrix (run before declaring any phase done)

```
npm run typecheck
npm run lint
npm run test:run
npx playwright test
npm run build
```

All five must pass. Any failure → fix in RED-GREEN-REFACTOR cycle, do not advance.

## Out of scope (do not build in this plan)

Anything in the RFC "Out of scope" list: curated library, streak, XP, daily goal, email digests, push, payments, hint gating, SRS, sharing, leaderboard, onboarding wizard, admin moderation, SEO at scale, browser extension, mobile share-sheet, DMCA agent, Stripe, push provider, multi-region, community. These are all Phase 3+ per the RFC and will be re-planned after 90 days of metrics.
