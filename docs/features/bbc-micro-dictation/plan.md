# BBC 6 Minute English — Micro Dictation Implementation Plan

**Feature ID:** T-B-004
**Parent Feature:** T-B-003 — BBC Learning English Integration
**Phase:** MVP (T-B-004.1)
**Last Updated:** 2026-06-13
**Rules:** No implementation. 2-5 minute tasks. Exact files. Verification. Rollback.

---

## Overview

The implementation follows 7 ordered tasks. Each task is self-contained and rollbacks cleanly via `git checkout -- <files>`.

**Estimated total time:** ~3-4 hours of coding (18 tasks at ~10-15 min each, parallelizable where dependencies allow)

**Test order:** Run backend tests first, then frontend tests, then E2E last.

---

## Task 1 — Database & Model

**Time:** ~10 min
**Risk:** Low
**Dependencies:** None

### Files

**New files:**
- `backend/database/migrations/2026_06_13_000001_create_user_external_lesson_segments_table.php`
- `backend/app/Models/UserExternalLessonSegment.php`

### Implementation

**Migration:** Create `user_external_lesson_segments` table as defined in design Section 5.2.

```php
// Columns: id, user_id, lesson_id, segment_index, user_input,
//          correct_words, wrong_words, missing_words, extra_words,
//          accuracy, time_spent_ms, created_at
// Indexes: composite (user_id, lesson_id), composite (lesson_id, segment_index)
// FK: user_id → users(id), lesson_id → listening_external_lessons(id)
```

**Model:** `UserExternalLessonSegment` with `$fillable`, `$casts` (accuracy → float), `$timestamps = false`, `created_at` only. Relationships: `belongsTo(User)` and `belongsTo(ListeningExternalLesson)`. `toApiArray()` method returning snake_case keys.

**Verification:**
1. Run `php artisan migrate --dry-run` — should show migration as pending
2. Run `php artisan migrate` — should succeed
3. Run `php artisan tinker` — `UserExternalLessonSegment::count()` should be 0
4. `php artisan migrate:rollback` — should succeed cleanly

**Rollback:** `php artisan migrate:rollback && rm backend/database/migrations/2026_06_13_000001_create_user_external_lesson_segments_table.php && rm backend/app/Models/UserExternalLessonSegment.php`

---

## Task 2 — Segment Scoring Service

**Time:** ~10 min
**Risk:** Low (pure logic, no I/O)
**Dependencies:** Task 1 (model exists for type hinting)

### Files

**New file:**
- `backend/app/Services/DictationScoringService.php`

### Implementation

**`DictationScoringService`** — stateless service with one public method:

```php
public function scoreSegment(string $reference, string $userInput): array
```

Returns:
```php
[
  'correct' => ['word1', 'word2', ...],
  'wrong'   => ['wordA', ...],      // extra words user typed
  'missing' => ['wordB', ...],       // reference words user missed
  'accuracy' => 80.0,               // float, 0-100
  'total_words' => 10,
  'correct_count' => 8,
  'wrong_count' => 0,
  'missing_count' => 2,
]
```

Algorithm (design Section 10.1):
1. `normalize()` — lowercase, strip punctuation `.,!?;:'"`, split on whitespace, filter empty, filter skip words
2. Skip word list: `'um', 'uh', 'er', 'eh', 'yeah', 'ok', 'okay', 'mm', 'mmm', 'hmm'`
3. Multiset-based matching (preserve multiplicity)
4. Accuracy = (correct_count / total_words) * 100, rounded to 1 decimal

**Verification:**
1. Write `tests/Unit/DictationScoringServiceTest.php` with at minimum:
   - Exact match: 100% accuracy
   - All wrong: 0% accuracy
   - Empty input: 0% accuracy
   - Punctuation stripped in comparison
   - Skip words excluded from both sides
   - Case-insensitive matching
   - Word multiplicity (e.g., "the the" vs "the" counts 1 correct)
2. Run `php artisan test tests/Unit/DictationScoringServiceTest.php`
3. All tests must pass; coverage target > 80% for this service

**Rollback:** `rm backend/app/Services/DictationScoringService.php && rm tests/Unit/DictationScoringServiceTest.php`

---

## Task 3 — Backend: Extend BbcService

**Time:** ~15 min
**Risk:** Low (additive only)
**Dependencies:** Task 1, Task 2

### Files

**Modified file:**
- `backend/app/Services/BbcService.php`

### Implementation

Add these methods to `BbcService`:

1. **`getDictation(int $lessonId): ?ListeningExternalLesson`** — fetch lesson by ID, return null if not found

2. **`scoreSegment(int $userId, int $lessonId, int $segmentIndex, string $userInput, int $timeSpentMs): array`** — runs `DictationScoringService::scoreSegment()`, looks up segment text from lesson's `metadata_json->segments[$segmentIndex]`, stores result in `UserExternalLessonSegment`, returns scored result array

3. **`getDictationSummary(int $userId, int $lessonId): array`** — aggregates all `UserExternalLessonSegment` records for this user+lesson. Returns: `{ segments_completed, overall_accuracy, total_time_ms, segment_scores: [...] }`

4. **`completeDictation(int $userId, int $lessonId): UserExternalLessonProgress`** — calls `markCompleted()`

5. **`getSegmentText(int $lessonId, int $segmentIndex): ?string`** — reads `metadata_json['segments'][$segmentIndex]['text']`; returns null if segments not available

6. **`hasDictationSegments(int $lessonId): bool`** — true if `metadata_json` contains non-empty `segments` array

**Verification:**
1. `php artisan tinker` — manually call each method against existing test data
2. `php artisan test` — all existing BbcService tests still pass
3. `php artisan route:list --path=bbc` — verify no route conflicts

**Rollback:** `git checkout -- backend/app/Services/BbcService.php`

---

## Task 4 — Backend: Add BbcController Dictation Endpoints

**Time:** ~15 min
**Risk:** Low (additive only)
**Dependencies:** Task 3

### Files

**Modified files:**
- `backend/app/Http/Controllers/BbcController.php`
- `backend/routes/api.php`

### Implementation

**`BbcController.php`** — add 4 new methods inside the existing class (after line 226, before the closing `}`):

```php
public function getDictation(Request $request, int $id): JsonResponse
// GET /api/v1/listening/bbc/{id}/dictation
// Auth required. Returns: lesson metadata + segments array + has_segments bool.
// 404 if lesson not found.

public function submitSegment(Request $request, int $id): JsonResponse
// POST /api/v1/listening/bbc/{id}/dictation/segments
// Auth required. Body: { segment_index: int, user_input: string, time_spent_ms: int }
// Validates: segment_index >= 0, user_input non-empty string, time_spent_ms >= 0
// Returns: scored result (correct, wrong, missing, accuracy, total_words, ...)
// 404 if lesson not found. 422 if validation fails. 400 if no segments available.

public function getDictationSummary(Request $request, int $id): JsonResponse
// GET /api/v1/listening/bbc/{id}/dictation/summary
// Auth required. Returns: { segments_completed, overall_accuracy, total_time_ms, segment_scores: [...] }
// 404 if lesson not found.

public function completeDictation(Request $request, int $id): JsonResponse
// POST /api/v1/listening/bbc/{id}/dictation/complete
// Auth required. Returns: { data: progress object }
// 404 if lesson not found.
```

**`api.php`** — inside the existing `Route::middleware('auth:sanctum')->prefix('v1')->group()` block, inside the BBC user-specific prefix, add:

```php
Route::prefix('listening/bbc')->group(function () {
    // ... existing routes ...

    // Dictation routes
    Route::get('/{id}/dictation', [BbcController::class, 'getDictation'])->where('id', '[0-9]+');
    Route::post('/{id}/dictation/segments', [BbcController::class, 'submitSegment'])->where('id', '[0-9]+');
    Route::get('/{id}/dictation/summary', [BbcController::class, 'getDictationSummary'])->where('id', '[0-9]+');
    Route::post('/{id}/dictation/complete', [BbcController::class, 'completeDictation'])->where('id', '[0-9]+');
});
```

**Verification:**
1. `php artisan route:list --path=api/v1/listening/bbc` — confirm 4 new routes appear
2. `php artisan test` — all tests pass
3. Manually test with `curl` or Postman (unauthenticated → 401, authenticated → correct response shape)
4. `php artisan tinker` — verify request validation rejects bad input

**Rollback:** `git checkout -- backend/app/Http/Controllers/BbcController.php backend/routes/api.php`

---

## Task 5 — Backend: Extend Crawler for 6 Minute English + PDF Parsing

**Time:** ~20 min
**Risk:** Medium (new command, new library)
**Dependencies:** None

### Files

**New files:**
- `backend/app/Console/Commands/CrawlBbc6MinLessons.php`
- `backend/app/Services/BbcTranscriptParser.php`

**Modified files:**
- `backend/routes/console.php` (register new command)
- `backend/composer.json` (add `smalot/pdfparser` if not already present)

### Implementation

**`BbcTranscriptParser.php`** — pure service class:
- `parsePdfUrl(string $pdfUrl): ?array` — HTTP GET the PDF, parse with `smalot/pdfparser`, return text
- `splitIntoSegments(string $text): array` — takes raw text, returns array of segment objects with fields: `{ index, text, word_count, difficulty, estimated_duration }`
- Implementation of split logic per design Section 8.2: strip speaker labels (regex), split on `.!?`, merge < 3 word sentences, cap at 20 words, assign difficulty
- `stripSpeakerLabels(string $text): string` — remove patterns like `NEIL`, `Pippa:`, `NEIL:`, timestamps
- `normalizeSegmentText(string $text): string` — clean whitespace, trim

**`CrawlBbc6MinLessons.php`** — new artisan command:
- Signature: `crawl:bbc-6min {--limit=0 : Max lessons to crawl}`
- Fetches episode list from `https://www.bbc.co.uk/learningenglish/english/features/6-minute-english` (check page for pagination pattern)
- For each episode, extracts: title, slug, audio_url (from episode page or audio page link), published_at, episode_code (from URL: `ep-260611`)
- Constructs PDF URL: `downloads.bbc.co.uk/learningenglish/features/6min/{code}_{title_slug}_transcript.pdf`
- Attempts PDF fetch → if 200: parse + split segments, store in `metadata_json['segments']`
- If 404: store lesson without segments (workspace-only)
- Stores/updates in DB via `BbcService::upsertLesson()`

**`console.php`** — add: `Artisan::starting(function ($artisan) { $artisan->resolve(CrawlBbc6MinLessons::class); })` OR use standard Laravel auto-discovery (commands in `app/Console/Commands` are auto-discovered)

**Verification:**
1. `php artisan list crawl` — should show `crawl:bbc-6min`
2. `php artisan crawl:bbc-6min --limit=1 --dry-run` — verify it finds episodes without saving
3. `php artisan crawl:bbc-6min --limit=1` — run against real BBC, verify lesson created with segments
4. `php artisan tinker` — `ListeningExternalLesson::latest()->first()->metadata_json` — verify segments array present

**Rollback:** `rm backend/app/Console/Commands/CrawlBbc6MinLessons.php backend/app/Services/BbcTranscriptParser.php && git checkout -- backend/routes/console.php backend/composer.json && composer remove smalot/pdfparser`

---

## Task 6 — Frontend: Types, Store, API Client

**Time:** ~15 min
**Risk:** Low (additive only)
**Dependencies:** Task 4 (API contracts defined)

### Files

**Modified files:**
- `src/features/listening/types/bbc.ts`

**New files:**
- `src/features/listening/stores/bbcMicroDictationStore.ts`
- `src/features/listening/api/bbcDictationApi.ts`

### Implementation

**`types/bbc.ts`** — add to existing exports:

```typescript
export interface BbcSegment {
  id: number
  text: string
  wordCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedDuration: number   // seconds
  startTime: number          // cumulative seconds
  endTime: number
}

export interface BbcDictationSession {
  lessonId: number
  hasSegments: boolean
  segments: BbcSegment[]
  audioUrl: string | null
  episodeCode: string | null
}

export interface BbcSegmentScore {
  correct: string[]
  wrong: string[]
  missing: string[]
  accuracy: number           // 0-100
  totalWords: number
  correctCount: number
  wrongCount: number
  missingCount: number
}

export interface BbcSegmentAttempt {
  segmentIndex: number
  userInput: string
  timeSpentMs: number
  score: BbcSegmentScore
}

export interface BbcDictationSummary {
  segmentsCompleted: number
  overallAccuracy: number
  totalTimeMs: number
  segmentScores: BbcSegmentScore[]
}

export type MicroSegmentLength = 3 | 5 | 10
export type MicroPlaybackSpeed = 0.75 | 1 | 1.25

export interface MicroSettings {
  segmentLength: MicroSegmentLength
  playbackSpeed: MicroPlaybackSpeed
  showTranscriptAfter: boolean
  autoAdvance: boolean
}
```

**`bbcMicroDictationStore.ts`** — Zustand store (separate from existing `bbcStore`):

```typescript
interface BbcMicroDictationState {
  // Session
  lesson: BbcDictationSession | null
  currentIndex: number
  isPlaying: boolean
  hasChecked: boolean        // user submitted answer for current segment

  // Answers
  attempts: BbcSegmentAttempt[]  // indexed by segment index

  // Settings (session-level, not persisted)
  settings: MicroSettings

  // Actions
  initSession: (lesson: BbcDictationSession) => void
  setCurrentIndex: (index: number) => void
  playSegment: () => void
  pauseSegment: () => void
  submitAttempt: (attempt: BbcSegmentAttempt) => void
  updateSettings: (partial: Partial<MicroSettings>) => void
  resetSession: () => void
}
```

`initSession` initializes from API data. `submitAttempt` saves attempt to `attempts` array (indexed by segmentIndex). `resetSession` resets all state. Store persists to `localStorage` key `drivesmart_bbc_dictation_{lessonId}` on every mutation via Zustand's `persist` middleware with 7-day expiration.

**`bbcDictationApi.ts`** — API client for dictation endpoints:

```typescript
// Uses same BASE_PATH = '/api/v1/listening/bbc'
// All calls go through apiClient (which handles auth)

export const bbcDictationApi = {
  getDictation(lessonId: number): Promise<BbcDictationSession> { ... },
  submitSegment(lessonId: number, payload: {
    segment_index: number
    user_input: string
    time_spent_ms: number
  }): Promise<BbcSegmentScore> { ... },
  getSummary(lessonId: number): Promise<BbcDictationSummary> { ... },
  complete(lessonId: number): Promise<void> { ... },
}
```

Includes transformers matching snake_case API response → camelCase TypeScript types.

**Verification:**
1. `npm run lint` — zero TypeScript errors
2. `npm run build` — frontend builds successfully
3. Unit test `stores/bbcMicroDictationStore.test.ts`:
   - `initSession` sets lesson and currentIndex = 0
   - `submitAttempt` saves attempt, sets hasChecked = true
   - `setCurrentIndex` advances and resets hasChecked
   - `resetSession` clears all state
   - `initSession` loads from localStorage when session exists

**Rollback:** `git checkout -- src/features/listening/types/bbc.ts && rm src/features/listening/stores/bbcMicroDictationStore.ts src/features/listening/api/bbcDictationApi.ts`

---

## Task 7 — Frontend: Audio Player + UI Components

**Time:** ~20 min
**Risk:** Low (new components)
**Dependencies:** Task 6

### Files

**New files:**
- `src/features/listening/pages/bbc/components/SegmentPlayer.tsx`
- `src/features/listening/pages/bbc/components/DictationInput.tsx`
- `src/features/listening/pages/bbc/components/SegmentResults.tsx`
- `src/features/listening/pages/bbc/components/MicroLessonProgress.tsx`
- `src/features/listening/pages/bbc/components/MicroSettings.tsx`
- `src/features/listening/pages/bbc/components/LessonResultsSummary.tsx`

### Implementation

**`SegmentPlayer.tsx`**:
- Props: `audioUrl`, `segmentDuration`, `playbackSpeed`, `onAutoPause`, `onPlay`, `isPlaying`
- Uses native `<audio>` element (HTMLMediaElement API)
- On `play`: sets `setTimeout` for `segmentDuration * 1000 / playbackSpeed` ms, then calls `audio.pause()` and `onAutoPause()`
- Controls: Play/Pause button, speed selector (0.75x/1x/1.25x pills), Replay button
- Keyboard: Space = play/pause, R = replay
- On mount: preload audio metadata
- Error state: shows error card with "Open BBC audio" link
- iOS: requires user tap to play — show "Tap to begin" overlay until first tap

**`DictationInput.tsx`**:
- Props: `value`, `onChange`, `onSubmit`, `disabled`, `hasChecked`, `isLoading`
- Textarea (8 rows mobile, 6 rows desktop), font-mono
- Placeholder: "Type what you heard..."
- On submit: calls `onSubmit(value)` if value.trim() is non-empty
- Empty submission: shake animation (Framer Motion) + error text
- Auto-focus on mount and after `hasChecked` transitions to false
- Keyboard: Enter submits (desktop), Ctrl+Enter submits
- Submit button: full-width on mobile, contained on desktop

**`SegmentResults.tsx`**:
- Props: `reference`, `score: BbcSegmentScore`, `showReference: boolean`
- Renders word-by-word comparison:
  - Each word wrapped in `<span>` with appropriate class
  - Correct: green background (#00BE7C), checkmark icon, "Correct" tooltip
  - Wrong: red background (#FF3257), strikethrough, "Wrong" tooltip
  - Missing: yellow dashed underline (#F59E0B), "Missing" tooltip
- Color is NEVER the sole indicator — each category has icon + label tooltip
- Accuracy percentage displayed prominently
- Stats row: `Correct: N  |  Missing: N  |  Extra: N`
- "Show Answer" toggle reveals reference text

**`MicroLessonProgress.tsx`**:
- Props: `current: number`, `total: number`, `scores: BbcSegmentScore[]`, `onJumpTo: (index: number) => void`
- Horizontal progress bar: filled dots for completed, hollow for remaining
- Color coding: green (accuracy >= 80%), yellow (50-79%), red (< 50%), hollow (not started)
- Current segment: pulsing dot
- Tappable on mobile to jump to segment (with confirmation dialog)
- Text: "Segment 4 of 10" — always visible

**`MicroSettings.tsx`**:
- Props: `settings: MicroSettings`, `onChange: (s: Partial<MicroSettings>) => void`
- Rendered as bottom sheet on mobile, sidebar panel on desktop
- Segment length: 3s / 5s / 10s pill toggle
- Playback speed: 0.75x / 1x / 1.25x pill toggle
- "Show reference after checking" toggle
- "Auto-advance to next segment" toggle (off by default)
- Shown before starting; collapsed (settings icon) during lesson

**`LessonResultsSummary.tsx`**:
- Props: `summary: BbcDictationSummary`, `lessonTitle: string`, `onRetry: () => void`, `onNextEpisode: () => void`
- Overall accuracy: large number with count-up animation (Framer Motion)
- Segments completed: "8 of 10 segments"
- Time spent: formatted duration
- Accuracy ring (SVG circle) showing pass/fail color
- "Review mistakes" expandable section (shows all wrong + missing words from all segments)
- CTAs: [Học lại bài này] [Bài tiếp theo] [Mở transcript BBC]
- BBC attribution: "Transcript: BBC Learning English" — non-removable, prominent

**Verification:**
1. `npm run lint` — zero TypeScript errors
2. Visual check: render each component in isolation with mock props
3. Test keyboard shortcuts with `@testing-library/user-event`
4. Test shake animation with `prefers-reduced-motion` enabled
5. Test accessibility: all interactive elements have `aria-label`, focus order correct, results announced via `aria-live`

**Rollback:** `rm src/features/listening/pages/bbc/components/SegmentPlayer.tsx src/features/listening/pages/bbc/components/DictationInput.tsx src/features/listening/pages/bbc/components/SegmentResults.tsx src/features/listening/pages/bbc/components/MicroLessonProgress.tsx src/features/listening/pages/bbc/components/MicroSettings.tsx src/features/listening/pages/bbc/components/LessonResultsSummary.tsx`

---

## Task 8 — Frontend: Main Dictation Page

**Time:** ~20 min
**Risk:** Low (new page)
**Dependencies:** Task 6, Task 7

### Files

**New files:**
- `src/features/listening/pages/bbc/BbcMicroDictationPage.tsx`
- `src/features/listening/pages/bbc/MicroSEO.tsx`

**Modified files:**
- `src/features/listening/AppRouter.tsx`
- `src/features/listening/pages/bbc/BbcLessonDetailPage.tsx`

### Implementation

**`MicroSEO.tsx`** — SEO metadata component (mirrors existing `BbcSEO.tsx` pattern):

```tsx
interface MicroSEOProps { title: string; slug: string; level: string | null }
```

Renders in `<head>`:
- `<title>{title} — Micro Dictation | DriveSmart</title>`
- `<meta name="description">` — "Practice dictation with BBC 6 Minute English '{title}'. Listen in 5-second segments..."
- `<link rel="canonical">`
- JSON-LD: `EducationalOccupationalProgram` schema

**`BbcMicroDictationPage.tsx`** — main page component:

**State machine:**
```
INTRO → PLAYING → INPUT → CHECKING → RESULTS → (next segment) → PLAYING
                                                          → SUMMARY (if last)
SUMMARY → (retry) → INTRO
```

**INTRO state:**
- Lesson title + metadata
- Segment count + estimated time
- `MicroSettings` panel (collapsed by default)
- "Bắt đầu" (Start) button
- BBC attribution notice

**PLAYING state:**
- `SegmentPlayer` auto-triggers audio on mount
- `MicroLessonProgress` bar at top
- "Đang nghe..." message
- Skip button (small, not prominent)

**INPUT state:**
- `SegmentPlayer` paused
- `DictationInput` auto-focused
- Timer tracking started (for analytics)

**CHECKING state:**
- `DictationInput` disabled
- Loading spinner on submit button
- Optimistic UI: show results immediately on API response

**RESULTS state:**
- `SegmentResults` with word-by-word display
- Accuracy prominent
- [Đoạn tiếp] (Next) button — primary
- [Nghe lại] (Replay) — secondary
- [Bỏ qua] (Skip) — tertiary

**SUMMARY state:**
- `LessonResultsSummary`
- Transitions from RESULTS when last segment completed

**Error handling:**
- No segments: "Dictation not available for this episode. Open the original BBC lesson to study." + Open BBC button
- Network error: toast + retry button inline
- Audio load error: error card + "Open BBC audio" link

**LocalStorage persistence:**
- On every `submitAttempt`: save `{ lessonId, currentIndex, attempts, startedAt }` to `localStorage`
- On mount: check `localStorage` for matching lessonId → show "Resume?" modal
- Resume modal: "Bạn có tiếp tục bài học không?" with [Tiếp tục] [Bắt đầu lại]

**`AppRouter.tsx`** — add new route inside `<ListeningLayout>`:

```tsx
<Route
  path="/bbc/:slug/dictation"
  element={
    <Suspense fallback={<PageLoader />}>
      <BbcMicroDictationPage />
    </Suspense>
  }
/>
```

Also add lazy import at top:
```tsx
const BbcMicroDictationPage = lazy(() => import('./pages/bbc/BbcMicroDictationPage'))
```

**`BbcLessonDetailPage.tsx`** — add second CTA button after the existing workspace button:

```tsx
<Button
  variant="outline"
  size="lg"
  className="flex-1 gap-2"
  onClick={() => window.location.href = `/listening/bbc/${lesson.slug}/dictation`}
>
  <Headphones size={20} />
  Luyện nghe chép
</Button>
```

Add import for `Headphones` from `lucide-react`.

**Verification:**
1. `npm run lint` — zero TypeScript errors
2. `npm run build` — frontend builds successfully
3. Navigate to `/listening/bbc/test-slug/dictation` — page renders correctly
4. Test full flow: start → play → type → check → results → next → summary
5. Test localStorage resume: refresh mid-lesson → resume modal appears
6. Test mobile: open in responsive mode, verify no overflow, keyboard doesn't cover input
7. Accessibility: Tab through all elements, verify focus order, test with VoiceOver

**Rollback:** `rm src/features/listening/pages/bbc/BbcMicroDictationPage.tsx src/features/listening/pages/bbc/MicroSEO.tsx && git checkout -- src/features/listening/AppRouter.tsx src/features/listening/pages/bbc/BbcLessonDetailPage.tsx`

---

## Task 9 — Frontend: Tests

**Time:** ~20 min
**Risk:** Low
**Dependencies:** Task 6, Task 7, Task 8

### Files

**New files:**
- `tests/Unit/DictationScoringServiceTest.php`
- `tests/Unit/DictationScoringServiceTest.ts` (or `.test.tsx`)
- `tests/e2e/bbc-micro-dictation.spec.ts`

### Implementation

**`tests/Unit/DictationScoringServiceTest.php`**:
- 10+ test cases covering: exact match, all wrong, empty input, punctuation, case insensitivity, skip words, word multiplicity, mixed correct/wrong/missing, very long input, special characters
- Target: 80%+ line coverage

**`tests/Unit/bbcMicroDictationStore.test.ts`** (Vitest + @testing-library/zustand):
- 8+ test cases: init, submit, navigation, reset, settings update, localStorage save/load, resume prompt, expiration

**`tests/e2e/bbc-micro-dictation.spec.ts`** (Playwright, extends existing `tests/e2e/bbc.spec.ts` pattern):

```typescript
test('full dictation session', async ({ page }) => {
  await login(page)
  await page.goto('/listening/bbc/test-slug/dictation')
  await page.click('button:has-text("Bắt đầu")')
  // Play → type → check → next → ... → summary
})

test('resume from localStorage', async ({ page }) => {
  // Start lesson, submit 2 segments, refresh
  // Resume modal appears
})

test('empty input shows error', async ({ page }) => {
  await page.goto('/listening/bbc/test-slug/dictation')
  await page.click('button:has-text("Bắt đầu")')
  await page.click('button:has-text("CHECK ANSWER")')
  // Shake animation + error message
})
```

**Verification:**
1. `php artisan test tests/Unit/DictationScoringServiceTest.php` — all pass
2. `npx vitest run tests/Unit/bbcMicroDictationStore.test.ts` — all pass
3. `npx playwright test tests/e2e/bbc-micro-dictation.spec.ts` — all pass
4. `npm run lint` — zero warnings

**Rollback:** `rm tests/Unit/DictationScoringServiceTest.php tests/Unit/bbcMicroDictationStore.test.ts tests/e2e/bbc-micro-dictation.spec.ts`

---

## Task 10 — SEO, Sitemap & Final Polish

**Time:** ~10 min
**Risk:** Low
**Dependencies:** Task 8

### Files

**Modified files:**
- `src/features/listening/pages/bbc/BbcLessonListPage.tsx` (add 6 Minute English filter tab)
- `src/features/listening/pages/bbc/BbcSEO.tsx` (extend for episode list with ItemList schema)
- `backend/app/Http/Controllers/BbcController.php` (add `index` filter for series = '6-minute-english')
- `src/features/listening/pages/bbc/BbcMicroDictationPage.tsx` (add JSON-LD in `<head>`)
- Sitemap config (path depends on project — likely `next-sitemap.config.js` or similar)

### Implementation

**`BbcLessonListPage.tsx`** — add "6 Minute English" filter tab at top of existing filter bar:

```tsx
const SERIES_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: '6-minute-english', label: '6 Minute English' },
  { id: 'beginner', label: 'Sơ cấp' },
  { id: 'intermediate', label: 'Trung cấp' },
  { id: 'advanced', label: 'Nâng cao' },
]
```

Adds `series` filter param to `GET /api/v1/listening/bbc` → `BbcController::index()`.

**`BbcSEO.tsx`** — extend `BbcSEOList` component to output `ItemList` JSON-LD when on `/listening/bbc/6-minute-english` route.

**`BbcMicroDictationPage.tsx`** — add JSON-LD `EducationalOccupationalProgram` in component's `useEffect` that updates `document.head`.

**Sitemap** — add entries for:
- `/listening/bbc/6-minute-english`
- All episode dictation URLs: `/listening/bbc/{slug}/dictation`

**Verification:**
1. `npm run lint` — zero warnings
2. `npm run build` — success
3. Inspect page source of `/listening/bbc/6-minute-english` — verify JSON-LD in `<head>`
4. Inspect page source of `/listening/bbc/{slug}/dictation` — verify JSON-LD + meta tags present
5. Verify sitemap includes new URLs

**Rollback:** `git checkout -- src/features/listening/pages/bbc/BbcLessonListPage.tsx src/features/listening/pages/bbc/BbcSEO.tsx backend/app/Http/Controllers/BbcController.php && git checkout -- <sitemap-file>`

---

## Rollback Summary

| Task | Rollback Command |
|---|---|
| 1. DB + Model | `php artisan migrate:rollback && rm migration && rm model` |
| 2. Scoring Service | `rm service && rm test` |
| 3. BbcService | `git checkout -- BbcService.php` |
| 4. Controller + Routes | `git checkout -- BbcController.php api.php` |
| 5. Crawler | `rm commands && rm parser && git checkout -- console.php composer.json && composer remove smalot/pdfparser` |
| 6. Types + Store + API | `git checkout -- types.ts && rm store && rm api` |
| 7. UI Components | `rm SegmentPlayer.tsx DictationInput.tsx SegmentResults.tsx MicroLessonProgress.tsx MicroSettings.tsx LessonResultsSummary.tsx` |
| 8. Main Page + Routing | `rm page && rm seo && git checkout -- AppRouter.tsx BbcLessonDetailPage.tsx` |
| 9. Tests | `rm tests` |
| 10. SEO | `git checkout -- SEO files + sitemap` |

---

## Parallel Execution Hints

Tasks **1, 2, 5** (backend infrastructure) can run in parallel with **Tasks 6, 7** (frontend components) since they don't share files.

Tasks **3** and **4** must run sequentially (3 before 4).

Tasks **7** and **8** must run sequentially (7 before 8).

Task **9** (tests) should run after all implementation tasks.

Task **10** (SEO) can run in parallel with Task **9**.

---

## Full File Manifest

**New files (18):**
```
backend/database/migrations/2026_06_13_000001_create_user_external_lesson_segments_table.php
backend/app/Models/UserExternalLessonSegment.php
backend/app/Services/DictationScoringService.php
backend/app/Console/Commands/CrawlBbc6MinLessons.php
backend/app/Services/BbcTranscriptParser.php
src/features/listening/types/bbc.ts
src/features/listening/stores/bbcMicroDictationStore.ts
src/features/listening/api/bbcDictationApi.ts
src/features/listening/pages/bbc/components/SegmentPlayer.tsx
src/features/listening/pages/bbc/components/DictationInput.tsx
src/features/listening/pages/bbc/components/SegmentResults.tsx
src/features/listening/pages/bbc/components/MicroLessonProgress.tsx
src/features/listening/pages/bbc/components/MicroSettings.tsx
src/features/listening/pages/bbc/components/LessonResultsSummary.tsx
src/features/listening/pages/bbc/BbcMicroDictationPage.tsx
src/features/listening/pages/bbc/MicroSEO.tsx
tests/Unit/DictationScoringServiceTest.php
tests/Unit/bbcMicroDictationStore.test.ts
tests/e2e/bbc-micro-dictation.spec.ts
```

**Modified files (8):**
```
backend/app/Services/BbcService.php
backend/app/Http/Controllers/BbcController.php
backend/routes/api.php
backend/routes/console.php
backend/composer.json
src/features/listening/AppRouter.tsx
src/features/listening/pages/bbc/BbcLessonDetailPage.tsx
src/features/listening/pages/bbc/BbcLessonListPage.tsx (Task 10)
```

**Deleted on rollback (18 new files, 8 modified)**
