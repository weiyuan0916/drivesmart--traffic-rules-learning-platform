# BBC 6 Minute English — Micro Dictation Feature

**Feature ID:** T-B-004
**Parent Feature:** T-B-003 — BBC Learning English Integration
**Status:** Draft — Pending Approval
**Last Updated:** 2026-06-13
**Owner:** DriveSmart Product Team

---

## 1. Problem Statement

BBC 6 Minute English episodes are too long for effective dictation practice in a single sitting. Users who want to do dictation (listen → type → check) need to manually pause, rewind, and replay audio — a friction-heavy workflow that breaks concentration and reduces learning effectiveness.

The existing T-B-003 workspace provides a general-purpose note-taking and vocabulary tool, but lacks a guided, segmented dictation experience.

This feature adds a structured micro-dictation loop: play a short segment → pause → type → score → continue.

---

## 2. Goals

- Enable focused dictation practice using BBC 6 Minute English episodes
- Guide users through audio in manageable 5-second segments
- Provide immediate, visual feedback on transcript accuracy
- Track per-segment and per-lesson progress
- Surface learning insights (common error patterns)
- Work seamlessly on mobile (primary), tablet, and desktop

---

## 3. Non-Goals

- Do NOT download or rehost BBC audio files
- Do NOT store word-for-word BBC transcripts permanently in DriveSmart's database in a form that constitutes republication
- Do NOT provide AI speech recognition or TTS
- Do NOT replace the existing BBC workspace (notes + vocabulary remain accessible)
- Do NOT require the user to manually pause — auto-pause is the core mechanic

---

## 4. Legal & Content Review

### 4.1 Audio

BBC does not permit third-party downloading or rehosting of audio files. The existing T-B-003 approach is correct: DriveSmart links to BBC's original audio pages (e.g., `bbc.com/audio/play/p0nmg0q1`) and users open them in a new tab or an embedded player pointing at BBC's own CDN.

**Decision:** No audio storage. Audio remains on BBC infrastructure.

### 4.2 Transcripts

BBC publishes official PDF transcripts for each 6 Minute English episode at:

```
https://downloads.bbc.co.uk/learningenglish/features/6min/{date_code}_6_minute_english_{title}_transcript.pdf
```

The PDF footer explicitly states: *"This is not a word-for-word transcript."* — These are curated educational versions BBC distributes for worksheet use, not verbatim show transcripts.

**Options:**

| Option | Description | Risk | Recommendation |
|---|---|---|---|
| A | Store full parsed transcript in DB | Low-medium legal risk; closest to full functionality | **Preferred for MVP** |
| B | Store only segment text used for scoring | Lowest risk; partial functionality | Fallback |
| C | Fetch transcript at request time, never store | No storage risk; performance penalty | Deprecated |
| D | Ask BBC for embedding permission | Zero risk; slow | Future consideration |

**Option A is recommended** because:

1. BBC intentionally publishes these PDFs as free educational downloads
2. The PDFs are explicitly marked "not a word-for-word transcript" — BBC's own curated version
3. DriveSmart's use case (private learning tool, not public republication) is well within educational fair use
4. Attribution is prominently displayed on every segment
5. The transcript is only used for scoring user input, not displayed verbatim
6. If BBC requests removal, the system degrades gracefully to scoring-free mode

**Attribution requirement:** Every segment and the results screen must show "Transcript: BBC Learning English" in a clearly visible, non-removable attribution element.

### 4.3 Crawler Addition

The existing `crawl:bbc-lessons` command must be extended to:

1. Detect if a 6 Minute English episode has a PDF transcript available
2. Download the PDF (or fetch the text via HTTP from `downloads.bbc.co.uk`)
3. Parse PDF text into sentences/segments
4. Store parsed segments as `segments_json` in the `listening_external_lessons.metadata_json` column

No PDF files are stored on DriveSmart servers — only the parsed text output.

---

## 5. Architecture

### 5.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ SegmentPlayer│  │ DictationInput│ │ ResultsPanel │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │         │
│         └─────────────────┼──────────────────┘         │
│                           │                            │
│                    ┌──────▼───────┐                     │
│                    │  bbcStore   │ (Zustand)           │
│                    └──────┬───────┘                     │
│                           │                            │
└───────────────────────────┼────────────────────────────┘
                            │ HTTP /api/v1/listening/bbc
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (Laravel)                       │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ BbcController│  │ BbcService   │  │ CrawlCmd     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │         │
│         └─────────────────┼──────────────────┘         │
│                           │                            │
│                    ┌──────▼───────┐                     │
│                    │  MySQL DB    │                     │
│                    │ (metadata +  │                     │
│                    │  user data)  │                     │
│                    └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
                            │
                            │ External
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│ BBC Audio    │  │ downloads.bbc.   │  │ BBC Episode  │
│ (streaming, │  │ co.uk (PDF       │  │ Page (meta   │
│ no storage) │  │ transcript)      │  │ data)        │
└──────────────┘  └──────────────────┘  └──────────────┘
```

### 5.2 Database Extension

The existing `listening_external_lessons` table is extended via `metadata_json`:

```json
{
  "transcript_pdf_url": "https://downloads.bbc.co.uk/learningenglish/features/6min/260611_6_minute_english_...pdf",
  "segments": [
    {
      "id": 1,
      "start_time": 0,
      "end_time": 5,
      "text": "Hello, this is 6 Minute English from BBC Learning English.",
      "word_count": 9,
      "difficulty": "easy"
    }
  ],
  "audio_url": "https://www.bbc.com/audio/play/p0nmg0q1",
  "episode_code": "ep-260611"
}
```

New table: `user_external_lesson_segments`

```sql
CREATE TABLE user_external_lesson_segments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    lesson_id BIGINT UNSIGNED NOT NULL,
    segment_index INT NOT NULL,
    user_input TEXT NOT NULL,
    correct_words INT NOT NULL DEFAULT 0,
    wrong_words INT NOT NULL DEFAULT 0,
    missing_words INT NOT NULL DEFAULT 0,
    extra_words INT NOT NULL DEFAULT 0,
    accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    time_spent_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN_KEY (lesson_id) REFERENCES listening_external_lessons(id) ON DELETE CASCADE,
    INDEX idx_user_lesson (user_id, lesson_id),
    INDEX idx_segment (lesson_id, segment_index)
);
```

### 5.3 Frontend Architecture

```
src/features/listening/
├── pages/bbc/
│   ├── BbcMicroDictationPage.tsx    # Route: /listening/bbc/:slug/dictation
│   └── components/
│       ├── SegmentPlayer.tsx         # Audio player with auto-pause
│       ├── DictationInput.tsx        # Textarea for typing
│       ├── SegmentResults.tsx        # Per-segment scoring display
│       ├── MicroLessonProgress.tsx  # Segment progress bar
│       ├── MicroSettings.tsx         # Speed, segment length controls
│       └── LessonResultsSummary.tsx  # End-of-lesson summary
├── stores/
│   └── bbcMicroDictationStore.ts    # Zustand: segments, currentIndex, scores
├── api/
│   └── bbcApi.ts                    # Extended with micro-dictation endpoints
└── types/
    └── bbc.ts                       # Extended with segment types
```

### 5.4 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/listening/bbc/{id}/dictation` | Get lesson with segments (transcript + metadata) |
| POST | `/api/v1/listening/bbc/{id}/dictation/segments` | Submit segment attempt, get scored result |
| GET | `/api/v1/listening/bbc/{id}/dictation/summary` | Get lesson dictation summary for user |
| POST | `/api/v1/listening/bbc/{id}/dictation/complete` | Mark dictation session complete |

### 5.5 Scoring Service

```typescript
// Pseudocode — segment scoring algorithm
function scoreSegment(original: string, userInput: string): SegmentScore {
  const originalWords = tokenize(original)       // split on whitespace, strip punctuation
  const userWords = tokenize(userInput)

  const matched = intersection(originalWords, userWords)
  const extra = userWords - originalWords
  const missing = originalWords - userWords

  // Case-insensitive matching, but preserve original casing in display
  const accuracy = (matched.length / originalWords.length) * 100

  return {
    correct: matched,
    wrong: extra,           // user typed word not in original
    missing: missing,        // original word user missed
    accuracy,
    wordCount: originalWords.length,
  }
}
```

---

## 6. User Flow

### 6.1 Entry Points

1. **From Lesson Detail page:** User clicks "Luyện nghe chép" (Dictation) button — distinct from "Bắt đầu học" (workspace)
2. **From Lesson List:** Filter tab "6 Minute English" → click episode → "Luyện nghe chép"
3. **Direct URL:** `/listening/bbc/{slug}/dictation`

### 6.2 Core Micro Dictation Loop

```
┌──────────────────────────────────────────────────────────┐
│                    START LESSON                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │
│  │ Settings   │  │ Overview   │  │ Begin Button      │   │
│  │ (optional)│  │ (segments) │  │                  │   │
│  └────────────┘  └────────────┘  └──────────────────┘   │
└──────────────────────────┬───────────────────────────────┘
                           ▼
              ┌─────────────────────────────┐
              │   SEGMENT LOOP              │
              │                            │
              │  ① PLAY AUDIO              │
              │     (auto-plays 5 seconds)  │
              │     ↓ auto-pause           │
              │  ② INPUT APPEARS            │
              │     "Type what you heard"   │
              │     ↓ user types           │
              │  ③ CHECK (Enter / Button)  │
              │     ↓ scoring              │
              │  ④ RESULTS DISPLAY         │
              │     word-by-word highlight │
              │     accuracy %             │
              │     ↓ user taps Next       │
              │  ⑤ NEXT SEGMENT            │
              │     ↓ (or Summary if last) │
              └──────────────┬──────────────┘
                           ▼
              ┌─────────────────────────────┐
              │   LESSON SUMMARY            │
              │  Overall accuracy           │
              │  Time spent                 │
              │  Segments completed         │
              │  Common error patterns       │
              │  [Retry] [Next Episode]     │
              └─────────────────────────────┘
```

### 6.3 Settings Panel (before starting)

User can configure before beginning:

| Setting | Default | Options |
|---|---|---|
| Segment length | 5 seconds | 3s / 5s / 10s |
| Playback speed | 1x | 0.75x / 1x / 1.25x |
| Show transcript after attempt | Yes | Yes / No |
| Auto-advance | No | Yes / No |

Settings are per-session (not persisted).

### 6.4 Mobile UX — Priority Design Decisions

**The mobile dictation experience must be thumb-friendly and minimize cognitive load.**

#### Input Mode

- Full-width textarea, auto-focused after audio pauses
- Large submit button (minimum 48px height, full width on mobile)
- Keyboard does not obscure input or results
- Use `viewport` meta to prevent zoom on input focus (font-size >= 16px on iOS)

#### Layout — Mobile (< 768px)

```
┌────────────────────────────┐
│  ← Back    Episode Title   │  Header (compact, 48px)
├────────────────────────────┤
│  ●●●●○○○○○○○  4/10         │  Segment progress bar
├────────────────────────────┤
│                            │
│   [  PLAY AUDIO  ]         │  Segment player (auto-triggers)
│                            │
│   "Type what you heard"    │  Prompt text
│                            │
│  ┌──────────────────────┐  │
│  │                      │  │
│  │  User input area     │  │  Textarea (8-10 rows)
│  │                      │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │   CHECK ANSWER       │  │  Primary CTA (accent color)
│  └──────────────────────┘  │
│                            │
│  ─── OR (after check) ───  │
│  Correct: 8  Wrong: 2      │  Results summary
│  Accuracy: 80%             │
│  [Show Answer] [Next →]    │  Secondary actions
│                            │
└────────────────────────────┘
```

#### Layout — Desktop (>= 1024px)

```
┌──────────────────────────────────────────────────────────┐
│  ← Back        Micro Dictation — Episode Title          │
├──────────────────────────────────────────────────────────┤
│  ●●●●○○○○○○○  4/10                    [⚙ Settings]    │
├──────────────────────────┬───────────────────────────────┤
│                          │                               │
│  [  ▶ PLAY AUDIO  ]     │  Segment 4 of 10              │
│                          │  ─────────────────           │
│  Speed: [0.75x][1x][1.25x]│                              │
│                          │  Your answer:                │
│  [◀ Prev]  [▶▶ Next]    │  ┌────────────────────────┐ │
│                          │  │                        │ │
│                          │  │  (text from user)      │ │
│                          │  └────────────────────────┘ │
│                          │                               │
│                          │  ┌────────────────────────┐  │
│                          │  │    CHECK ANSWER        │  │
│                          │  └────────────────────────┘  │
│                          │                               │
│                          │  ─── Results (after check) ─ │
│                          │  [word-by-word diff below]  │
│                          │  Accuracy: 80%              │
│                          │  [Show Answer] [Next]       │
└──────────────────────────┴───────────────────────────────┘
```

### 6.5 Error States & Edge Cases

| Scenario | UI Response |
|---|---|
| No transcript available for this episode | "Dictation not available for this episode. Open the original BBC lesson to study." + Open BBC button |
| Audio fails to load | Error card with retry button + "Open BBC audio in new tab" link |
| User submits empty input | Shake animation on input + "Please type what you heard" message |
| User submits while audio is still playing | Auto-pause audio + proceed to scoring |
| Network error on segment submit | Toast notification + retry button |
| User abandons mid-lesson | Session persisted to localStorage; prompt to resume on return |
| Very long segment (> 15 words) | Split into sub-segments automatically |

---

## 7. Data Flow

### 7.1 Crawl & Segment Pipeline

```
1. crawl:bbc-6min-lessons (new command, daily at 03:00)
   │
   ├── Fetch episode list from bbc.co.uk/learningenglish/english/features/6-minute-english
   │   (detect episode code: ep-260611)
   │
   ├── For each episode:
   │   ├── Fetch episode page → extract metadata
   │   ├── Construct PDF URL:
   │   │   downloads.bbc.co.uk/learningenglish/features/6min/{code}_{title}_transcript.pdf
   │   ├── Attempt HTTP GET on PDF URL
   │   │   ├── Success (200): Download PDF → Parse text → Split into segments
   │   │   │   Segment rules:
   │   │   │   - Split on sentence-ending punctuation (. ! ?)
   │   │   │   - Merge very short sentences (< 3 words) with next
   │   │   │   - Cap at 20 words per segment
   │   │   │   - Estimate duration based on word count (~2 words/sec for 6ME pace)
   │   │   │   - Assign difficulty: easy (< 8 words) / medium (8-12) / hard (> 12)
   │   │   │   - Calculate time markers (cumulative, estimated)
   │   │   │   Store in metadata_json
   │   │   └── Not found (404): Mark segments as empty; lesson available for workspace only
   │   └── Store/update lesson in DB
   │
   └── Log: episodes processed, transcripts found, parse errors
```

### 7.2 Runtime Data Flow (per session)

```
1. User opens dictation page
   │
   ├── Frontend: GET /api/v1/listening/bbc/{id}/dictation
   │   └── Backend: Return lesson + segments from metadata_json
   │       └── Frontend: Initialize store with segments
   │
2. User taps Play (or auto-play on page load)
   │
   ├── Frontend: Audio element plays BBC audio URL
   │   └── Set timer for N seconds (user-configurable: 3/5/10s)
   │
3. Timer fires → Auto-pause audio
   │
   ├── Frontend: Focus textarea, show "Type what you heard"
   │   └── Start time tracking (for analytics)
   │
4. User types and taps CHECK (or presses Ctrl+Enter / Enter on desktop)
   │
   ├── Frontend: POST /api/v1/listening/bbc/{id}/dictation/segments
   │   Body: { segment_index, user_input, time_spent_ms }
   │   │
   │   └── Backend:
   │       ├── Get segment text from DB
   │       ├── Run scoring algorithm
   │       ├── Store result in user_external_lesson_segments
   │       └── Return: { correct, wrong, missing, accuracy, word_count }
   │
   ├── Frontend: Display results
   │   ├── Highlight correct words (green)
   │   ├── Highlight wrong words (red with strikethrough)
   │   ├── Underline missing words (yellow/dashed)
   │   └── Show accuracy % + word counts
   │
5. User taps Next
   │
   ├── Frontend: Advance segment index
   │   └── If last segment: show summary screen
   │   └── Else: play next segment
   │
6. User completes all segments (or taps "Complete")
   │
   ├── Frontend: POST /api/v1/listening/bbc/{id}/dictation/complete
   │   └── Backend: Upsert lesson progress (completed)
   │
   ├── Frontend: Show LessonSummary screen
   │   ├── Overall accuracy
   │   ├── Segments completed / total
   │   ├── Time spent
   │   ├── Error pattern analysis (aggregate common missing/wrong words)
   │   └── Actions: [Retry] [Next Episode] [Open Transcript]
```

### 7.3 Session Persistence

- Active session state (current segment, all submitted answers) saved to `localStorage` on every segment submit
- On page reload: detect saved session → show "Resume where you left off?" modal
- Session expires after 7 days of inactivity

---

## 8. Segment Strategy

### 8.1 Segmentation Approach

Use **pre-computed sentence-boundary segmentation** (not dynamic/runtime segmentation).

Rationale:
- Dynamic segmentation (e.g., VAD — Voice Activity Detection) is unreliable for accented BBC speakers and adds complexity
- Sentence boundaries are natural pause points that match how speakers naturally group ideas
- Pre-computation during crawl allows consistent scoring and accurate word-count estimates
- Runtime: just load pre-computed segments, no processing needed

### 8.2 Segment Generation Rules

During the crawl phase, the parser:

1. Downloads the BBC transcript PDF
2. Extracts plain text
3. Strips speaker labels (e.g., "Neil:", "Pippa:", timestamps, formatting artifacts)
4. Splits on sentence boundaries: `.` `!` `?`
5. Merges very short sentences (< 3 words) with the following sentence
6. Caps each segment at 20 words
7. Removes filler words from scoring (e.g., "um", "uh", "er") — stored in a skip list
8. Assigns each segment:
   - `word_count` — for difficulty estimation and scoring normalization
   - `estimated_duration` — based on 2 words/second average for native speech
   - `difficulty` — easy / medium / hard

### 8.3 Segment Length Options

| Setting | Seconds | Best For |
|---|---|---|
| Short | 3 seconds | Advanced users, fast speakers, short phrases |
| **Medium (default)** | **5 seconds** | Most learners, balanced challenge |
| Long | 10 seconds | Beginners, slower learners, full sentences |

Each segment maps to a range of seconds; the audio plays for that duration then auto-pauses. The segment text may be shorter or longer than the exact audio duration — this is acceptable.

### 8.4 Pre-computed Time Markers

The crawler estimates time markers for each segment:

```
Segment 1: text="Hello, this is 6 Minute English from BBC Learning English."
           words=9, estimated_duration=5s, time_markers={start:0, end:5}

Segment 2: text="I'm Neil, and with me is Pippa."
           words=7, estimated_duration=4s, time_markers={start:5, end:9}

Segment 3: text="Today we're talking about how advertisers make us spend money."
           words=10, estimated_duration=5s, time_markers={start:9, end:14}
```

These markers allow:
- Accurate audio seeking to the correct position per segment
- Skip/replay within the lesson
- Progress bar showing segment position

### 8.5 Segment Content to Exclude

The parser must strip from transcripts:
- Introduction phrases: "Hello, this is 6 Minute English from BBC Learning English."
- Closing phrases: "Remember to visit bbclearningenglish.com for more."
- Vocabulary list sections (separate from the dialogue)
- Quiz questions embedded in transcripts
- Timestamps and page numbers
- Speaker labels: "Neil:", "Pippa:", etc.

---

## 9. Transcript Strategy

### 9.1 Transcript Storage Decision

**Store parsed transcript text server-side in `metadata_json`.**

Rationale (as detailed in Section 4.2):
- BBC provides these PDFs as free educational downloads
- The PDF footer explicitly states "This is not a word-for-word transcript" — BBC's own curated version for learners
- Storing parsed text (not the PDF file) for scoring purposes is within educational fair use
- DriveSmart is a private learning companion, not a public republication platform
- The transcript is only used server-side for word-by-word scoring comparison, never displayed verbatim to users (only individual word matches shown in results)

### 9.2 Fallback Modes

| Transcript Available | Scoring Available | UI Behavior |
|---|---|---|
| Yes | Yes | Full dictation experience |
| Yes | No (API error) | Dictation mode with "Scoring unavailable" notice |
| No (404) | No | Workspace mode only; "Transcript not available for this episode" banner |

### 9.3 User-Facing Transcript Display Rules

- The full transcript is NEVER shown to users before or during dictation
- After a segment is checked, the user sees:
  - Their own input (with word-by-word color coding)
  - The correct segment text (revealed after checking)
  - Each word is individually highlighted: green (correct), red (wrong), yellow-dash (missing)
- At the lesson summary screen, the user can tap "Review All Segments" to see the full episode transcript with their performance color-coded
- The "Open BBC Transcript" button links to the original BBC PDF download (external)

### 9.4 Transcript Quality & Parsing

BBC 6 Minute English transcripts follow a consistent format:

```
NEIL Hello, this is 6 Minute English from BBC Learning English.
     I'm Neil, and with me is Pippa. How are you doing, Pippa?
PIPPA I'm very well, thanks Neil, and hello everyone.
     Today we're going to be discussing...
```

Parser must handle:
- Mixed case speaker labels (NEIL, Neil, pippa)
- Line breaks within sentences
- Quotation marks and apostrophes
- Numbers and abbreviations (e.g., "BBC", "UK", "Dr.")
- Hyphenated compounds
- Ellipsis (...)

### 9.5 Skip Words List

Words that appear in transcripts but should be excluded from scoring:

```typescript
const SKIP_WORDS = new Set([
  'um', 'uh', 'er', 'eh',
  // Filler words common in spoken English that BBC hosts use
  'yeah', 'okay', 'ok',
  // Common backchannel responses that aren't meaningful content
  'mm', 'mmm', 'hmm',
])
```

These are stripped from both the reference text and user input before comparison.

---

## 10. Scoring Strategy

### 10.1 Word-Level Scoring

```typescript
function scoreSegment(reference: string, userInput: string): ScoringResult {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')  // strip punctuation
      .split(/\s+/)
      .filter(w => w.length > 0)
      .filter(w => !SKIP_WORDS.has(w))

  const refWords = normalize(reference)
  const userWords = normalize(userInput)

  const refSet = new Multiset(refWords)
  const userSet = new Multiset(userWords)

  const correct: string[] = []
  const wrongExtra: string[] = []
  const missing: string[] = []

  // Count correct (matching words, respecting multiplicity)
  for (const word of userWords) {
    if (refSet.count(word) > 0) {
      correct.push(word)
      refSet.remove(word)
    } else {
      wrongExtra.push(word)
    }
  }

  // Remaining in refSet are missing
  for (const [word, count] of refSet.entries()) {
    for (let i = 0; i < count; i++) {
      missing.push(word)
    }
  }

  const total = refWords.length
  const accuracy = total > 0 ? (correct.length / total) * 100 : 0

  return {
    correct,
    wrongExtra,
    missing,
    accuracy: Math.round(accuracy * 10) / 10,
    totalWords: total,
    correctCount: correct.length,
    wrongCount: wrongExtra.length,
    missingCount: missing.length,
  }
}
```

### 10.2 Word Reordering Tolerance

Forgiving mode: words in the correct set but in the wrong order are still counted as "correct" (as long as all words are present). This reduces frustration for learners who hear the meaning but miss the exact phrasing.

### 10.3 Scoring Display

After each segment check:

```
┌─────────────────────────────────────────────┐
│  Accuracy: 80%                              │
│                                             │
│  Reference:  Hello, this is 6 Minute       │
│               English from BBC Learning     │
│               English.                      │
│                                             │
│  Your answer:  Hello, this is 6 Minut      │
│               English from BBC Learnin      │
│               English                       │
│                                             │
│  ✓ Hello, ✓ this, ✓ is, ✓ 6 ✓ Minute      │
│  ✓ English, ✓ from, ✓ BBC, ✓ Learn-ing     │
│    ✗ English (missing)                      │
│                                             │
│  Correct: 8  |  Missing: 1  |  Extra: 0    │
│                                             │
│  [Show Answer]              [Next →]        │
└─────────────────────────────────────────────┘
```

### 10.4 Lesson-Level Scoring

After all segments:

```
Overall Accuracy: 78.5%
Segments Completed: 10/10
Time Spent: 8m 32s

Error Patterns:
  - You often miss contracted words (e.g., "I'm" → "Im")
  - Plurals are frequently omitted (e.g., "advertisers" → "advertiser")
  - Word linking: "kind of" is often heard as one word

Strong Points:
  - Good at catching numbers and proper nouns
  - Consistent with common vocabulary
```

---

## 11. Audio Integration Strategy

### 11.1 Audio Sources

BBC 6 Minute English audio is available from two sources:

1. **BBC Audio page** (preferred for embedding):
   - URL pattern: `https://www.bbc.com/audio/play/{media_id}`
   - Can embed via iframe or direct audio element pointing to the stream

2. **BBC podcast feed** (fallback):
   - Available on Apple Podcasts, Spotify, BBC Sounds
   - Not directly embeddable

3. **BBC Sounds embed**:
   - URL pattern: `https://www.bbc.co.uk/sounds/play/{media_id}`
   - Can be embedded in iframe

### 11.2 Embedding Approach

**Recommended:** Use an iframe pointing to the BBC Sounds embed for audio-only playback:

```html
<iframe
  src="https://www.bbc.co.uk/sounds/embed//audio/p0nmg0q1?lang=en"
  style="width: 100%; border: none;"
  allow="autoplay"
  title="BBC 6 Minute English Audio"
/>
```

**Alternative:** For full control (playback speed, auto-pause), use a custom audio player that streams from BBC's media URL:

```html
<audio
  id="dictation-audio"
  src="https://vbbc-vo.mmdns.live.bbc.co.uk/bbcradio1/6minuteenglish/..."
  preload="metadata"
/>
```

Note: Direct audio URLs may expire or change. The crawler should store the current audio URL at crawl time. If the URL breaks, fall back to the iframe embed.

### 11.3 Audio Playback Controls

| Control | Behavior |
|---|---|
| Play | Start/restart segment audio from segment start time |
| Pause | Auto-pause after configured duration (3/5/10s) |
| Replay segment | Replay current segment from start |
| Previous segment | Go to previous segment |
| Next segment | Go to next segment (skip current without scoring) |
| Speed control | 0.75x, 1x, 1.25x (affects audio, not timer) |

### 11.4 Keyboard Shortcuts (Desktop)

| Key | Action |
|---|---|
| `Space` | Play / Pause audio |
| `Enter` (in input) | Submit answer |
| `Ctrl/Cmd + Enter` | Submit answer |
| `R` | Replay current segment |
| `→` | Next segment |
| `←` | Previous segment |
| `Escape` | Open settings |

---

## 12. SEO Strategy

### 12.1 Page Routes

| Route | Purpose | SEO Priority |
|---|---|---|
| `/listening/bbc/{slug}/dictation` | Individual episode dictation | High |
| `/listening/bbc/6-minute-english` | 6 Minute English episode list | High |
| `/listening/bbc/6-minute-english/dictation` | Micro dictation overview | Medium |

### 12.2 Meta Tags

```html
<title>{Episode Title} — Micro Dictation | DriveSmart</title>
<meta name="description" content="Practice dictation with BBC 6 Minute English '{Episode Title}'. Listen in 5-second segments, type what you hear, and get instant feedback. Free English listening practice." />
<link rel="canonical" href="https://drivesmart.vn/listening/bbc/{slug}/dictation" />
```

### 12.3 Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  "name": "{Episode Title} — 6 Minute English Dictation",
  "description": "Micro dictation practice for BBC 6 Minute English",
  "provider": {
    "@type": "Organization",
    "name": "DriveSmart",
    "sameAs": "https://drivesmart.vn"
  },
  "educationalLevel": "{beginner|intermediate|advanced}",
  "timeRequired": "PT{M}S",
  "inLanguage": "en"
}
```

### 12.4 JSON-LD for Episode List Page

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "BBC 6 Minute English Episodes — Dictation Practice",
  "description": "Practice English listening and dictation with BBC 6 Minute English episodes",
  "numberOfItems": {total_episodes},
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://drivesmart.vn/listening/bbc/ep-260611/dictation",
      "name": "How advertisers make us spend money"
    }
  ]
}
```

### 12.5 Sitemap

Add dictation URLs to the sitemap in the existing BBC sitemap group:

```
/listening/bbc/6-minute-english
/listening/bbc/ep-260611
/listening/bbc/ep-260611/dictation
...
```

---

## 13. Analytics

### 13.1 Events to Track

| Event Name | Trigger | Properties |
|---|---|---|
| `dictation_started` | User opens dictation page | lesson_id, episode_title, segment_count |
| `dictation_segment_played` | Audio segment starts playing | lesson_id, segment_index, segment_length_setting |
| `dictation_segment_paused` | Audio auto-pauses | lesson_id, segment_index, actual_duration |
| `dictation_segment_submitted` | User submits answer | lesson_id, segment_index, word_count, time_spent_ms |
| `dictation_segment_scored` | Score returned | lesson_id, segment_index, accuracy, correct, wrong, missing |
| `dictation_segment_next` | User proceeds to next segment | lesson_id, segment_index, skipped (bool) |
| `dictation_completed` | All segments done or user exits | lesson_id, segments_completed, overall_accuracy, time_spent |
| `dictation_retry` | User taps Retry | lesson_id, retry_count |
| `dictation_abandoned` | User exits mid-lesson | lesson_id, last_segment_index, segments_completed |
| `dictation_settings_changed` | User changes speed/segment length | lesson_id, new_segment_length, new_speed |

### 13.2 Metrics to Derive

From collected events:

- **Per-segment accuracy distribution** — identify which segments are hardest
- **Per-episode completion rate** — how many users finish vs. abandon
- **Average time per segment** — detect frustration points (very long times = difficult segments)
- **Error pattern clustering** — group common mistakes (e.g., "contractions missed", "plurals missed")
- **Feature usage** — how many use short/long segments, speed adjustments
- **Return rate** — do users retry the same episode?

### 13.3 Dashboard Metrics (Backend)

Extend the existing BBC dashboard with dictation-specific metrics:

```typescript
interface BbcDictationMetrics {
  dictationSessionsStarted: number
  dictationSessionsCompleted: number
  dictationCompletionRate: number      // completed / started
  averageAccuracy: number
  averageTimePerSegment: number        // ms
  totalWordsPracticed: number
  totalSegmentsCompleted: number
  mostDifficultSegments: Array<{      // top 5 hardest
    lessonId: number
    segmentIndex: number
    averageAccuracy: number
    segmentText: string
  }>
  errorPatterns: Array<{
    pattern: string                      // e.g., "contraction", "linking sound"
    frequency: number
    exampleMisspellings: string[]
  }>
}
```

---

## 14. Accessibility

### 14.1 WCAG AA Compliance

| Requirement | Implementation |
|---|---|
| Keyboard navigation | Full keyboard support; visible focus indicators on all interactive elements |
| Screen reader support | ARIA labels on all controls; live regions for score announcements |
| Color contrast | Score colors meet 4.5:1 contrast ratio; avoid red-green-only distinction |
| Focus management | After each segment check, focus moves to the Next button |
| Input labels | All inputs have visible or associated labels |
| Error messages | Error messages are announced to screen readers |

### 14.2 Color-Coded Results — Accessible Alternative

Since ~8% of men have red-green color blindness, word highlighting must use additional cues beyond color:

```
Correct words:  Green background (#00BE7C) + checkmark icon + "Correct" label
Wrong words:    Red background (#FF3257) + strikethrough + "Wrong" label
Missing words:  Yellow dashed underline (#F59E0B) + "Missing" label
```

Each category has: color + pattern + icon + text label. Color is never the sole differentiator.

### 14.3 Audio Player Accessibility

- All audio controls have keyboard equivalents
- Current segment number announced via `aria-live="polite"` region
- "Playing" and "Paused" states announced
- Segment progress shown in text form: "Segment 4 of 10"

### 14.4 Touch Targets (Mobile)

- All buttons: minimum 44px × 44px
- Input field: minimum 48px height
- Segment progress bar: tappable to jump to segment
- Results expand/collapse: large touch target

### 14.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .score-reveal {
    animation: none;  /* No count-up animation */
    opacity: 1;        /* Show final value immediately */
  }
}
```

All Framer Motion animations wrapped in `motion` with `whileInView` disabled when `prefers-reduced-motion: reduce`.

---

## 15. Performance

### 15.1 Frontend Performance Targets

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTI (Time to Interactive) | < 3.5s |
| Lighthouse Performance | > 90 |

### 15.2 Performance Strategy

1. **Route-based code splitting** — dictation page loaded only when navigated to
2. **Preload audio metadata** — fetch audio duration on lesson detail page load
3. **Lazy load results animations** — score reveal animations use Framer Motion's `LazyMotion`
4. **Debounce textarea** — autosave to localStorage with 500ms debounce
5. **Optimistic UI** — show results immediately on segment submit; retry in background on network failure
6. **Image optimization** — use Next.js `<Image>` for episode thumbnails
7. **Font subsetting** — use only Latin characters for BBC episode titles

### 15.3 Backend Performance

- Segments stored in `metadata_json` (no additional DB query at runtime)
- Scoring is CPU-bound but fast (< 50ms per segment)
- Segment submission endpoint: target p95 < 200ms
- Lessons list endpoint already paginated (20 per page)
- Dictation summary endpoint: aggregate from `user_external_lesson_segments` with indexed queries

---

## 16. Risks & Mitigations

### 16.1 Legal Risks

| Risk | Severity | Mitigation |
|---|---|---|
| BBC changes transcript PDF URLs or removes access | Medium | Fallback to workspace-only mode; detect 404 in crawler; alert ops team |
| BBC claims transcript storage violates their terms | Low-Medium | Attribution on all segments; clearly educational non-commercial use; ready to remove on request |
| Audio embedding breaks (URL changes, CORS) | Medium | Store audio URL at crawl time; iframe embed as fallback; detect load failure |
| Crawler flagged as abusive by BBC | Low | Respect robots.txt; add delays (300ms+); use rotating user agents; daily schedule off-peak |

### 16.2 Technical Risks

| Risk | Severity | Mitigation |
|---|---|---|
| PDF parsing produces garbage text | Medium | Validate parsed output: word count > threshold, no binary artifacts; flag for manual review |
| Audio streaming quality is poor | Low | BBC CDN is reliable; provide "Open in BBC" fallback |
| Very long episodes (20+ segments) cause fatigue | Low | Show estimated time; suggest breaking into sessions |
| Mobile keyboard covers input area | Medium | Use `visualViewport` API to scroll input into view; test on iOS Safari |
| Session state lost on page refresh | Low | localStorage persistence; resume modal |
| Segment time estimates are inaccurate | Low | Estimates are for UX display only; actual audio controls the duration |

### 16.3 Product Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Users abandon dictation mid-episode | Medium | Save progress; email/mobile notification to resume; keep sessions short (10 segments max) |
| Scoring frustration (too many "wrong" words) | Medium | Forgiving scoring (set matching, skip filler words); positive reinforcement messaging |
| Users skip ahead without attempting | Low | Disable "Next" before checking current segment (with toggle option in settings) |
| SEO pages get low traffic | Medium | Target long-tail keywords ("6 minute english dictation practice"); internal linking from main lesson pages |

---

## 17. Dependencies

### 17.1 On T-B-003 (Existing BBC Integration)

- `BbcController` — extend with new dictation endpoints
- `BbcService` — extend with dictation-specific methods
- `bbcApi` (frontend) — extend with dictation API calls
- `BbcLessonDetailPage` — add "Dictation" CTA button
- `BbcLessonListPage` — filter/tab for 6 Minute English series
- Database migrations for new `user_external_lesson_segments` table

### 17.2 New Dependencies

| Component | Technology | Notes |
|---|---|---|
| PDF Parser (backend) | `smalot/pdfparser` or `barryvdh/laravel-dompdf` | PHP library for parsing BBC PDF transcripts |
| Audio player (frontend) | Custom `<audio>` + HTMLMediaElement API | No external library needed |
| Score animation | Framer Motion | For count-up and word highlight animations |
| Score comparison display | Custom component | Word-by-word rendering with accessibility |

### 17.3 Third-Party APIs

No new external API dependencies. BBC transcripts are fetched via direct HTTPS to `downloads.bbc.co.uk` during crawl time.

---

## 18. Implementation Phases

### Phase 1 — MVP (T-B-004.1)
- Micro dictation page with 5-second segments
- Auto-pause audio player
- Textarea input with scoring
- Word-by-word results display
- Per-segment accuracy
- Lesson summary screen
- Settings: segment length (3/5/10s)
- Session persistence (localStorage)

### Phase 2 — Polish (T-B-004.2)
- Playback speed control
- Keyboard shortcuts (desktop)
- Error pattern analysis
- Dictation-specific dashboard metrics
- SEO pages and structured data
- Accessibility audit and fixes

### Phase 3 — Enhancement (T-B-004.3)
- Retry segment (replay audio without resetting score)
- Spaced repetition suggestions (revisit hard segments)
- Audio embedding via BBC Sounds iframe
- Mobile-optimized audio player
- Email/push reminder to resume abandoned sessions

---

## 19. Open Questions for Stakeholder Decision

1. **Transcript storage**: Should we store parsed transcript text in the database (recommended), or fetch on-demand and never store?
2. **Segment length default**: 5 seconds is proposed as default. Is 3s or 10s more appropriate for the target audience?
3. **Scoring strictness**: Should "extra words" (user adds words not in original) reduce accuracy, or only missing words count against?
4. **Mobile audio restrictions**: iOS requires user gesture to play audio. Should we show a "Tap to begin" overlay before starting the dictation loop?
5. **Episode scope**: Should this feature be limited to only 6 Minute English episodes (which have PDF transcripts), or also support other BBC Learning English series?
6. **Premium/Free**: Is this feature free for all users or gated behind a subscription?

---

## 20. Acceptance Criteria

### Functional Requirements

- [ ] User can access micro dictation from lesson detail page via dedicated CTA
- [ ] Audio auto-plays for configured duration (3/5/10s) then pauses automatically
- [ ] Textarea auto-focuses after audio pauses on mobile and desktop
- [ ] User can submit answer via button or keyboard shortcut
- [ ] Score is displayed with word-by-word color coding (correct/wrong/missing)
- [ ] User can navigate between segments (next/previous)
- [ ] Lesson summary shows overall accuracy, segments completed, time spent
- [ ] Session state persists across page refresh via localStorage
- [ ] Resume modal appears when returning to an in-progress dictation
- [ ] Settings panel allows changing segment length before starting
- [ ] If no transcript available: graceful fallback with explanation

### Technical Requirements

- [ ] TypeScript strict mode: zero errors
- [ ] ESLint: zero warnings
- [ ] API endpoints versioned: `/api/v1/listening/bbc/{id}/dictation/*`
- [ ] Segments stored in `metadata_json` during crawl
- [ ] New `user_external_lesson_segments` table created with proper indexes
- [ ] All analytics events fire correctly
- [ ] Error boundaries catch and display all runtime errors gracefully

### Performance Requirements

- [ ] Lighthouse Performance score > 90
- [ ] LCP < 2.5s on mobile 4G
- [ ] TTI < 3.5s on mobile 4G
- [ ] CLS < 0.1
- [ ] Segment scoring response time < 200ms (p95)

### Accessibility Requirements

- [ ] WCAG AA compliance
- [ ] Keyboard navigation fully functional
- [ ] Screen reader announces score results
- [ ] All interactive elements have visible focus states
- [ ] Color is never the sole indicator of correct/wrong/missing
- [ ] Touch targets minimum 44px × 44px
- [ ] `prefers-reduced-motion` fully respected

### SEO Requirements

- [ ] All dictation pages have unique `<title>` and `<meta description>`
- [ ] Canonical URLs set correctly
- [ ] JSON-LD structured data (EducationalOccupationalProgram) on all episode dictation pages
- [ ] ItemList structured data on episode listing page
- [ ] Sitemap updated with dictation URLs

### Legal & Copyright

- [ ] BBC source attribution on every segment and results screen
- [ ] Clear disclaimer: "Transcript provided by BBC Learning English"
- [ ] Audio remains on BBC infrastructure (no download or rehost)
- [ ] Crawler respects robots.txt and rate limits

### Testing

- [ ] Unit tests: segment scoring algorithm (80%+ coverage)
- [ ] Unit tests: transcript normalization (80%+ coverage)
- [ ] Integration tests: segment submit + score flow
- [ ] E2E tests (Playwright): full dictation session
- [ ] E2E tests: resume from localStorage
- [ ] Browser compatibility: Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] Mobile: iOS Safari, Chrome on Android (latest versions)

---

*Document version: 1.0 — Draft*
*Next step: Stakeholder review and approval of open questions in Section 19*
