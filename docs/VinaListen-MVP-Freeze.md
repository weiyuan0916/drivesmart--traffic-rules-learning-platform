# VinaListen — MVP Freeze Document
## Scope Lock · Feature Decisions · Launch Criteria

**Date:** 2026-06-07  
**Version:** 1.0  
**Based on:** 11 documentation files + Critical Review + Roadmap  
**Decision Maker:** Founder (1 person, part-time 20-30h/week)  
**Status:** **FROZEN** — No scope changes without explicit re-review

---

## DECISION SUMMARY

```
┌────────────────────────────────────────────────────────────┐
│  MVP SCOPE: FROZEN AS OF 2026-06-07                      │
│                                                            │
│  INCLUDED:     17 features                                 │
│  DEFERRED:     14 features                                 │
│  REJECTED:      7 features                                 │
│  TOTAL REVIEWED: 38 features                               │
│                                                            │
│  ⚠️  LEGAL FLAG: Do NOT launch until content license    │
│  ⚠️  CONFIRMED: No DailyDictation content licensed      │
└────────────────────────────────────────────────────────────┘
```

---

## DECISION FRAMEWORK

```
EVERY FEATURE DECISION IS BASED ON:

1. CORE LOOP FIRST
   → Does it serve the listen → speak → score loop?
   → Does it help user complete their first lesson?

2. RETENTION MINIMUM
   → Does it help user come back tomorrow?
   → Streak alone is insufficient; need daily goal anchor

3. TECHNICAL FEASIBILITY (1 founder, part-time)
   → Can I build this alone in reasonable time?
   → Does it require complex third-party integration?

4. LAUNCH CRITERIA
   → Does it affect whether we can ship?
   → Can it be added post-launch without breaking UX?

RULE: When in doubt, CUT. Add later when user data justifies it.
```

---

## PART 1: MVP FEATURES (IN SCOPE)

These 17 features form the MVP. They are **frozen** — no scope creep allowed.

---

### FEATURE 1: Landing Page

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── First impression determines 70% of conversion
├── No landing page = no way to acquire users
├── SEO value from Day 1 (indexable content)
├── Free marketing channel (Google search)
└── Required for any growth strategy

SCOPE (FROZEN):
├── Hero section (headline, subheadline, CTA)
├── Social proof stats (X bài học, Y users)
├── How It Works (3 steps)
├── Features section (4 cards)
├── Topics preview (4-6 topics from database)
├── FAQ (5-6 questions)
├── Footer (About, Privacy, Terms)
└── SEO meta tags (title, description, OG, Twitter)

NOT INCLUDED:
├── Testimonials carousel (nice-to-have, add after launch)
├── Video demo (takes time, add after launch)
├── Blog section (Phase 3)
├── Comparison table vs competitors (Phase 3)
└── Live user count (complex to maintain)

BUSINESS IMPACT:
├── Conversion rate: Landing → Signup target: > 10%
├── SEO: Rank for "luyện nghe tiếng Anh" within 3 months
└── Brand: "Vietnamese-first listening platform" positioning

TECHNICAL COMPLEXITY: Low
├── Next.js static page with Tailwind
├── Fetch topics from Supabase (public read)
├── Framer Motion for entrance animations
└── Estimated: 2-3 days

TEST CASES: 23 (see Implementation Plan v2, TC-A.5.1-23)
ACCEPTANCE: Landing page loads < 3s on 3G, zero console errors
```

---

### FEATURE 2: Authentication System

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── Required for any progress tracking
├── Required for streak system
├── Required for any personalization
├── Supabase Auth is free and fast to implement
└── Google OAuth reduces friction for Vietnamese users

SCOPE (FROZEN):
├── Email/password registration
├── Email/password login
├── Google OAuth (1-click, no password)
├── Session persistence (cookie-based)
├── Protected route middleware
├── Logout functionality
└── Guest mode (browse topics without account)

NOT INCLUDED:
├── Apple OAuth (add in Phase 2)
├── Facebook OAuth (low Vietnamese usage)
├── Magic link / passwordless (add in Phase 2)
├── Two-factor authentication (Phase 4)
├── Password reset email (⚠️ ADD: should be in MVP — fixing)
└── Email verification (add in Phase 2)

⚠️  SCOPE ADDED: Password reset functionality

BUSINESS IMPACT:
├── Required for all retention features
├── No auth = no streak, no progress, no history
└── Directly impacts 7-day retention rate

TECHNICAL COMPLEXITY: Medium
├── Supabase Auth (handled by Supabase)
├── SSR session management (middleware)
├── Protected route redirect logic
└── Guest mode state handling
└── Estimated: 3-4 days

TEST CASES: 14 (see Implementation Plan v2, TC-A.4.1-14)
ACCEPTANCE: All auth flows work, no hydration mismatches, SSR safe
```

---

### FEATURE 3: Onboarding Wizard

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── 40-60% of users churn at first experience (industry data)
├── No guided onboarding = users don't know what to do
├── Sets daily goal anchor (required for streak to make sense)
├── Onboarding data personalizes first recommendations
└── WOW moment must be designed, not accidental

SCOPE (FROZEN — 4 Steps):
Step 1: Goal Selection
  "Tại sao bạn muốn cải thiện tiếng Anh?"
  Options: IELTS · TOEIC · Giao tiếp · Du lịch · Công việc

Step 2: Level Assessment
  "Trình độ hiện tại của bạn thế nào?"
  Options: Mới bắt đầu · Trung bình · Khá giỏi

Step 3: Daily Goal
  "Bạn có thể dành bao lâu mỗi ngày?"
  Options: 5 phút · 10 phút · 20 phút · 30 phút

Step 4: Quick Preview
  Mini 1-clip lesson (30 seconds)
  "Đây là cách hoạt động"

NOT INCLUDED:
├── Audio level test (complex to implement)
├── Proficiency quiz (too complex for MVP)
├── Avatar selection (defer to Phase 2)
├── Notification permission during onboarding (add after launch)
├── Onboarding analytics / funnel tracking (Phase 2)
└── Re-onboarding for returning users (Phase 2)

BUSINESS IMPACT:
├── Activation rate target: > 60% complete onboarding
├── Reduces first-session churn by estimated 30%
├── Sets daily goal = streak anchor = retention driver
└── Goal data enables initial content recommendations

TECHNICAL COMPLEXITY: Medium
├── Multi-step wizard state (Zustand)
├── Progress dots indicator
├── Skip option (onboarding is never forced)
├── Completion flag saved to user profile
├── Redirect logic (completed → dashboard, new → onboarding)
└── Estimated: 3-4 days

TEST CASES: 12 (see Implementation Plan v2, TC-A.6.1-12)
ACCEPTANCE: Completes in < 2 min, data saved to profile, skip works
```

---

### FEATURE 4: Topic Browsing & Lesson Selection

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── Core navigation — user must find lessons to practice
├── Required entry point for the learning loop
├── Public data (topics + lessons) — accessible without auth
├── Enables content discovery and exploration
└── Sets foundation for topic-based progress tracking

SCOPE (FROZEN):
├── Topics listing page (/topics)
├── Topic cards (name, icon, lesson count)
├── Progress % per topic (if logged in)
├── Search bar (realtime, debounced 300ms)
├── Filter chips (All · IELTS · TOEIC · Daily · Business)
├── Sort (Popular · Newest · Alphabetical)
├── Topic detail page (/topics/[slug])
├── Lesson list grouped by section (Part 1, Part 2...)
├── Progress bar per topic
├── "Continue" button for in-progress lessons
├── "Next lesson" recommendation
└── Back navigation

NOT INCLUDED:
├── Topic difficulty rating (add in Phase 2)
├── Topic completion certificate (Phase 4)
├── Topic-level leaderboard (Phase 2)
├── Topic sharing (Phase 2)
├── Bookmark topic (Phase 2)
└── Recommended topic based on learning history (Phase 2)

⚠️  NOTE: Topics must have real content before launch.
   If DailyDictation license not obtained → use BBC/VOA as fallback.

BUSINESS IMPACT:
├── Content discovery = first lesson completion
├── Without topic browsing, users cannot navigate to lessons
└── Progress % drives perceived achievement

TECHNICAL COMPLEXITY: Low
├── Supabase query (public read for topics/lessons)
├── Zustand for filter state
├── TanStack Query for data fetching
├── Responsive grid (mobile list → desktop grid)
└── Estimated: 3-4 days

TEST CASES: 20 (see Implementation Plan v2, TC-B.2.1-20)
ACCEPTANCE: < 1s load, search debounced, filters work, progress accurate
```

---

### FEATURE 5: Audio Player (Listening Module)

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── CORE of the entire product — without audio, nothing works
├── Required for every lesson
├── Audio quality and UX = primary user experience
├── Keyboard shortcuts = power user efficiency
└── Touch gestures = mobile user satisfaction

SCOPE (FROZEN):
├── Play / Pause controls
├── Seekable progress bar (tap + drag)
├── Current time + total duration display
├── Skip backward 5 seconds
├── Skip forward 5 seconds
├── Playback speed: 0.5x · 0.75x · 1x · 1.25x · 1.5x
├── Loop clip mode
├── Volume control (desktop)
├── Mute toggle
├── Screen wake lock during playback
├── Keyboard shortcuts: Space (play/pause), ← → (skip)
├── Audio loading state (skeleton/spinner)
├── Audio error state with retry
├── Audio auto-pause on tab background
├── Preload first clip
└── Mobile touch: tap sides to skip, swipe to seek

NOT INCLUDED:
├── Audio waveform visualization (Phase 2) ← DEFERRED
├── Variable speed beyond 1.5x (Phase 3)
├── Sleep timer (Phase 2)
├── Audio quality selection (low/high) (Phase 2)
├── Picture-in-picture mode (Phase 3)
├── Bluetooth headset controls (Phase 2)
└── Transcript auto-scroll following audio (Phase 2)

⚠️  DECISION: Audio waveform is HIGH value but MEDIUM complexity.
   Added to Phase 2, not MVP. MVP uses progress bar only.

BUSINESS IMPACT:
├── Audio UX = 50% of listening experience
├── Speed control = accessibility for all levels (slow = beginner-friendly)
├── Keyboard shortcuts = efficiency for desktop power users
└── Any audio failure = abandoned session

TECHNICAL COMPLEXITY: Medium
├── HTMLAudioElement API
├── Playback rate manipulation
├── Wake Lock API
├── Touch gesture detection
├── Audio element state management (Zustand)
├── Fallback audio sources
└── Estimated: 4-5 days

TEST CASES: 30 (see Implementation Plan v2, TC-B.3.1-30)
ACCEPTANCE: Works on Chrome/Safari/Firefox/Edge, 3 speeds tested, keyboard works
```

---

### FEATURE 6: Transcript Input & Word-Level Scoring

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── CORE LEARNING MECHANISM — active recall is the key value
├── Without transcript input, there's no practice
├── Word-level scoring = visible progress
├── AI feedback = differentiation from passive listening
└── Required for the listen → check → learn loop

SCOPE (FROZEN):
├── Transcript textarea (auto-grow, min 4 rows)
├── Real-time word count display
├── Paste prevention (with tooltip "Hãy gõ từ bạn nghe được")
├── Spell-check disabled
├── Clear button
├── Submit button (disabled when empty)
├── Loading state during submission
├── Keyboard: Ctrl/Cmd + Enter to submit
├── Client-side validation (non-empty, < 2000 chars)
├── Server-side scoring via POST /api/listening/check
├── LCS-based word alignment algorithm
├── Normalization: lowercase, trim, strip punctuation
├── Case-insensitive comparison
├── Word-level diff display:
│   ├── ✅ Green = correct
│   ├── ❌ Red = wrong
│   ├── Underline gray = missing
│   └── 🟠 Orange = extra
├── Accuracy score with animated count-up
├── Side-by-side comparison (expected vs user)
├── AI rule-based feedback (pattern detection)
├── Action buttons: Retry · Listen Again · Continue
├── Double-submit prevention
└── Auto-capitalize first letter of sentences

NOT INCLUDED:
├── Hint system (reveal first letter) (Phase 2)
├── Character-by-character scoring (Phase 2)
├── Spaced repetition of missed words (Phase 2)
├── Save draft transcript to localStorage (Phase 2)
├── Skip to check (view transcript early) (Phase 2)
├── Slow-typing detection (warn if too slow) (Phase 2)
├── Audio auto-pause during submission (⚠️ ADD: essential UX)
└── Progressive difficulty hint (Phase 3)

⚠️  SCOPE ADDED:
├── Audio auto-pause when submitting
└── Mobile keyboard handling (input above keyboard)

BUSINESS IMPACT:
├── Transcript practice = core value proposition
├── Accuracy visibility = perceived learning progress
├── AI feedback = competitive differentiation
└── Without this, users might as well just watch YouTube

TECHNICAL COMPLEXITY: Medium-High
├── LCS algorithm implementation (well-defined, ~100 lines)
├── Zod validation schemas
├── React Hook Form integration
├── API route handler
├── Animation (Framer Motion for count-up)
├── Mobile keyboard handling (viewport manipulation)
└── Estimated: 4-5 days

TEST CASES: 30 (see Implementation Plan v2, TC-B.4.1-30)
ACCEPTANCE: Algorithm tested with known inputs, < 2s result display, mobile keyboard smooth
```

---

### FEATURE 7: Clip Navigation & Lesson Completion

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── Lessons have multiple clips — must navigate between them
├── Lesson completion = trigger for streak, XP, navigation
├── Without this, user can only do 1 clip and gets stuck
└── Lesson complete screen = WOW moment opportunity

SCOPE (FROZEN):
├── Clip indicator ("Clip 1 of 3")
├── Progress dots per clip
├── Next / Previous clip navigation
├── Auto-advance to next clip after completion
├── "Skip clip" option (for confident users)
├── Back navigation with in-progress confirmation
├── Browser tab close warning (if in-progress)
├── Lesson complete modal:
│   ├── Accuracy summary (all clips)
│   ├── Total XP earned (animated)
│   ├── Streak updated indicator (if applicable)
│   ├── "Bài tiếp theo" CTA
│   ├── "Về Dashboard" option
│   └── Confetti animation (respects reduced motion)
├── Progress saved to database on completion
├── Session state persisted (resume on return)
└── Reduced motion: Fade only, no confetti

NOT INCLUDED:
├── Lesson rating (how was this lesson?) (Phase 2)
├── Save to bookmarks (Phase 2)
├── Share lesson result (Phase 3)
├── Lesson notes (Phase 2)
├── AI summary of lesson (Phase 4)
├── Download transcript as PDF (Phase 3)
└── Compare with previous attempt score (Phase 2)

BUSINESS IMPACT:
├── Completion rate = primary engagement metric
├── WOW moment = emotional connection = retention
├── XP system drives perceived progression
└── Streak update = daily return motivation

TECHNICAL COMPLEXITY: Medium
├── Zustand lesson session store
├── TanStack Query mutations (lesson complete)
├── Confetti animation (canvas-confetti)
├── Navigation guards (unsaved changes)
└── Estimated: 3-4 days

TEST CASES: 18 (see Implementation Plan v2, TC-B.5.1-18)
ACCEPTANCE: Flow completes for 1-10 clips, progress saved, XP awarded, streak updates
```

---

### FEATURE 8: Voice Recording (Speaking Module)

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── Completes the listen → speak → feedback loop
├── Speaking = the "wow" differentiator vs passive listening
├── Without recording, it's just a dictation app
├── MediaRecorder API is well-supported
├── Recording upload to Supabase Storage is straightforward
└── Required for pronunciation scoring

SCOPE (FROZEN):
├── Microphone permission request (on first use)
├── Permission denied state with guide + settings link
├── Large record button (72x72px minimum)
├── Recording timer (count up, max 30 seconds)
├── Live waveform visualizer (bars animation)
├── Auto-stop at 30 seconds
├── Manual stop button
├── Recorded audio playback (before submit)
├── Re-record button (discard and restart)
├── Recording uploaded to Supabase Storage
├── MediaRecorder: audio/webm;codecs=opus (Chrome), audio/mp4 (Safari)
├── 1-second minimum (reject shorter)
├── Error handling for recording failures
├── Mobile touch targets: minimum 44x44px
├── Keyboard: Enter to start/stop recording
└── Auto-pause audio playback when recording starts

NOT INCLUDED:
├── Voice activity detection (VAD) (Phase 2)
├── Background noise warning (Phase 2)
├── Recording transcription preview (rely on scoring screen)
├── Save multiple recordings per clip (Phase 2)
├── Trim recording (Phase 2)
├── Pitch/speed adjustment on playback (Phase 3)
├── Video recording (Phase 4)
└── Collaborative speaking (Phase 4)

⚠️  DECISION: Voice activity detection is desirable but complex.
   Phase 2 add. For MVP, just timer + waveform is sufficient.

BUSINESS IMPACT:
├── Speaking = premium feature hook
├── Without speaking, product = simple dictation (easily cloned)
├── Recording quality = speech recognition accuracy
└── User-generated recordings = data for AI improvement

TECHNICAL COMPLEXITY: High
├── MediaRecorder API (complex cross-browser)
├── AudioContext for waveform analysis
├── File upload to Supabase Storage
├── Mobile browser quirks (iOS Safari requires user gesture)
├── Blob to URL conversion
└── Estimated: 4-5 days

TEST CASES: 22 (see Implementation Plan v2, TC-B.6.1-22)
ACCEPTANCE: Works on Chrome desktop, Safari iOS, Chrome Android
```

---

### FEATURE 9: Speech Recognition & Pronunciation Scoring

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── Required to close the speaking loop
├── Without recognition, recording is useless
├── Pronunciation score = the learning feedback for speaking
├── Web Speech API is free and browser-native
└── Whisper fallback ensures iOS/Safari coverage

SCOPE (FROZEN):
├── Speech-to-text via Web Speech API (Chrome, Edge)
├── Interim results shown during speech (dashed text)
├── Final results processed for scoring
├── Fallback: Whisper API via Supabase Edge Function (Safari, Firefox)
├── Whisper API key management (environment variable)
├── Pronunciation scoring algorithm:
│   ├── Accuracy: (correct / expected) × 100
│   ├── Fluency: Based on WPM (120-160 = normal, penalty outside range)
│   ├── Completeness: (spoken / expected) × 100
│   └── Overall: Accuracy×0.5 + Fluency×0.25 + Completeness×0.25
├── Word-level comparison (correct / mispronounced / wrong)
├── Mispronounced marker (⚠️) for phonetic similarity
├── Score display with animated count-up
├── Score breakdown: Accuracy · Fluency · Completeness
├── AI pronunciation tips (rule-based, Vietnamese accent patterns)
├── Error handling:
│   ├── No speech detected → retry option
│   ├── Recognition timeout (30s) → fallback
│   ├── Whisper also fails → retry + skip option
│   └── Score saved to database per clip
└── Speaking score = per-clip, not per-lesson (for granularity)

NOT INCLUDED:
├── Phonetic error database specific to Vietnamese speakers (Phase 2)
├── Per-syllable feedback (Phase 3)
├── Intonation/stress analysis (Phase 4)
├── AI pronunciation coach (Phase 4)
├── Custom phonetic model for VN accents (Phase 3)
├── Prosody analysis (Phase 4)
├── Whisper Turbo (use whisper-large-v3-turbo for quality) (Phase 2)
└── Caching of transcription results (Phase 2)

⚠️  COST NOTE: Whisper API costs ~$0.006/minute of audio.
   Free user limit: 10 transcriptions/day (soft gate, warn only)
   Track usage per user in database.

BUSINESS IMPACT:
├── Speaking = the "sticky" feature that retains users
├── Pronunciation score = tangible improvement feedback
├── AI feedback = competitive differentiation
└── Without this, product = passive listening tool (unsustainable)

TECHNICAL COMPLEXITY: High
├── Web Speech API integration (SpeechRecognition)
├── Supabase Edge Function for Whisper
├── OpenAI API integration
├── Word alignment algorithm (reuse from listening)
├── WPM calculation (words / seconds × 60)
├── Fallback routing logic
├── Cost tracking per user
└── Estimated: 5-6 days

TEST CASES: 20 (see Implementation Plan v2, TC-B.7.1-20)
ACCEPTANCE: Chrome uses Web Speech free, Safari uses Whisper, score accurate
```

---

### FEATURE 10: Speaking Result & Navigation

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── Users need to see their speaking score
├── Navigation to next step required to complete the loop
├── Without result display, recording is meaningless
└── Re-record option enables improvement attempt

SCOPE (FROZEN):
├── Speaking result panel (after pronunciation scoring)
├── Overall score with animated count-up
├── Score breakdown: Accuracy · Fluency · Completeness
├── Word-by-word pronunciation marks (✅ ⚠️ ❌)
├── AI pronunciation tip (specific, actionable)
├── Recording playback button
├── "Ghi âm lại" (re-record) button
├── "Tiếp tục" (next clip) button
├── "Bỏ qua speaking" option (no penalty)
├── Speaking score saved to database per clip
└── Lesson complete screen with speaking summary:
    ├── Listening accuracy average
    ├── Speaking accuracy average
    └── Clips attempted / total

NOT INCLUDED:
├── Compare with previous speaking attempt (Phase 2)
├── Share speaking score (Phase 3)
├── Text-to-speech playback of expected transcript (Phase 2)
├── Pronunciation difficulty breakdown (Phase 2)
├── "Listen to native speaker" button (Phase 2)
└── Speaking challenge with friends (Phase 4)

BUSINESS IMPACT:
├── Visible score = proof of learning
├── Re-record = growth mindset (try again = engagement)
├── Speaking summary = satisfaction of completion
└── Skip option prevents frustration (not forced to speak)

TECHNICAL COMPLEXITY: Low
├── Reuse ScoreDisplay component from listening
├── Reuse WordDiff component from listening
├── Navigation state management
└── Estimated: 2-3 days

TEST CASES: 14 (see Implementation Plan v2, TC-B.8.1-14)
ACCEPTANCE: Score displays correctly, navigation works, skip doesn't affect score
```

---

### FEATURE 11: Progress Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── Users need to see their learning progress
├── Progress = proof of time well spent
├── Drives retention (users return to see chart fill up)
├── Sets foundation for all future analytics
└── Required for showing value to users

SCOPE (FROZEN):
├── Stats cards:
│   ├── Total lessons completed
│   ├── Total time practiced (hours/minutes)
│   ├── Average accuracy (all time)
│   ├── Current streak
│   └── Current level + XP
├── Weekly activity chart (7-day bar chart via Recharts)
├── Today's bar highlighted in accent color
├── Weekly chart tooltip (lessons, time, accuracy per day)
├── Topic progress breakdown (per-topic completion %)
├── XP progress bar (current / next level)
├── Personalized recommendation (next lesson)
├── Weekly summary comparison (vs last week)
└── Empty state for new users (encouraging CTA)

NOT INCLUDED:
├── Monthly calendar heatmap (Phase 2) ← DEFERRED
├── Level-up celebration animation (Phase 2)
├── Achievement badges (Phase 2)
├── AI-generated insights (Phase 4)
├── Learning path recommendation (Phase 3)
├── Time-of-day pattern analysis (Phase 3)
├── Export progress as PDF (Phase 3)
├── Share progress card (Phase 3)
├── Advanced analytics (Phase 3)
└── Compare with friends (Phase 4)

⚠️  DECISION: Monthly calendar is nice but not critical.
   Monthly heatmap deferred to Phase 2. MVP gets weekly chart only.

BUSINESS IMPACT:
├── Progress visibility = retention driver
├── "See chart fill up" = emotional investment = return visits
├── Stats cards = quick snapshot of achievement
└── Recommendation = reduced decision friction = faster next lesson

TECHNICAL COMPLEXITY: Medium
├── TanStack Query dashboard aggregation
├── Recharts integration (bar chart)
├── XP calculation service
├── Streak calculation service
├── Responsive chart (mobile-friendly)
└── Estimated: 4-5 days

TEST CASES: 21 (see Implementation Plan v2, TC-C.1.1-21)
ACCEPTANCE: Stats accurate, charts responsive, real-time updates on lesson complete
```

---

### FEATURE 12: Streak System (Basic)

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── STREAK = the #1 retention mechanic for daily habit apps
├── Duolingo data: Streak users 3x more likely to return
├── Visible streak = loss aversion (don't want to lose progress)
├── Simple streak = minimum viable habit anchor
└── Required to make "daily goal" meaningful

SCOPE (FROZEN — Basic, No Freeze):
├── Streak counter in header (🔥 X ngày)
├── Streak increments on first lesson of day
├── Streak resets to 0 after 1+ day gap
├── Streak does NOT increment on subsequent lessons same day
├── last_lesson_date tracked per user
├── longest_streak tracked (all-time record)
├── Streak display:
│   ├── Header: Fire emoji + number (always visible)
│   ├── Dashboard: Streak card with longest record
│   └── At-risk indicator (at 9pm, no activity today)
├── Database trigger: Streak auto-calculated on lesson complete
├── Streak milestones (celebrations only):
│   ├── 7 days: "1 tuần! Bạn đang tạo thói quen!"
│   ├── 30 days: "Tháng! Bạn nghiêm túc!"
│   └── 100 days: "100 ngày! Huyền thoại!"
├── Milestone XP bonus (awarded automatically)
└── Milestone notification (in-app)

NOT INCLUDED (Phase 2):
├── Streak freeze (1/week) ← DEFERRED
├── Streak repair (paid feature) ← Phase 4
├── Streak calendar (90-day GitHub-style) ← Phase 2
├── Streak at-risk push notification ← Phase 2
├── Streak broken push notification ← Phase 2
├── Streak guardian (auto-freeze logic) ← Phase 2
├── Streak battle / challenges ← Phase 4
├── Streak sharing ← Phase 3
└── Streak recovery (paid) ← Phase 4

⚠️  DECISION: Streak freeze is a complex feature (auto-freeze at midnight, weekly reset logic, UI for freeze indicator, user understanding of freeze). MVP gets streak WITHOUT freeze. This is the minimum viable retention mechanic.

⚠️  REASONING: Without freeze, some users will lose streak → emotional response → return to maintain new streak. Freeze actually reduces urgency. Adding freeze post-launch is easier than removing it.

BUSINESS IMPACT:
├── Streak = primary retention driver
├── Milestone celebrations = emotional peaks
├── Loss aversion (losing streak) = stronger than gaining XP
└── Streak visible in header = constant reminder

TECHNICAL COMPLEXITY: Medium
├── Database trigger for streak calculation
├── Timezone handling (user's local date)
├── Midnight boundary handling
├── Milestone detection logic
├── XP bonus calculation
└── Estimated: 3-4 days

TEST CASES: 24 (see Implementation Plan v2, TC-C.2.1-24)
ACCEPTANCE: Streak increments once/day, resets correctly, milestones trigger
```

---

### FEATURE 13: History Module (Basic)

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── Users want to review what they've learned
├── History = evidence of progress (psychological value)
├── Mistake review = learning effectiveness (spaced recall)
├── Enables re-attempt → improved scores → satisfaction
└── Required for users to track improvement over time

SCOPE (FROZEN):
├── History listing page (/history)
├── Paginated list (20 per page)
├── Infinite scroll
├── Lesson name, topic, date, accuracy score per row
├── Sort: Newest first (default)
├── Search by lesson name (debounced)
├── Filter by topic
├── Filter by accuracy range (≥ 60%, ≥ 80%, 100%)
├── Lesson detail page (/history/[lessonId]):
│   ├── All clips with transcript comparison
│   ├── Accuracy per clip
│   ├── Speaking score per clip (if done)
│   ├── Re-attempt button
│   └── Multiple attempts tracked (attempt # badge)
├── Empty state for new users
└── Pull-to-refresh (mobile)

NOT INCLUDED (Phase 2+):
├── Filter by date range ← Phase 2
├── Recording playback from history ← Phase 2 (needs storage URL)
├── Export history as JSON/CSV ← Phase 2
├── Mistake pattern analysis (your common errors) ← Phase 3
├── Spaced repetition review from mistakes ← Phase 3
├── Share history (social) ← Phase 3
├── Lesson notes / annotations ← Phase 2
├── Highlight recurring mistakes across lessons ← Phase 3
└── Compare with other users' scores ← Phase 4

⚠️  DECISION: Recording playback from history is desirable but complex.
   Requires recording storage URL + playback UI + 404 handling.
   MVP: Show transcript comparison only, recording playback Phase 2.

BUSINESS IMPACT:
├── Review = better retention of learned material
├── Re-attempt = engagement (users come back to improve score)
├── Multiple attempts = growth mindset
└── Search = ability to find specific lessons

TECHNICAL COMPLEXITY: Medium
├── TanStack Query with pagination
├── nuqs for URL state (filters persist in URL)
├── Reuse WordDiff component
├── Attempt comparison logic
└── Estimated: 4-5 days

TEST CASES: 21 (see Implementation Plan v2, TC-C.3.1-21)
ACCEPTANCE: Pagination works, search responsive, filters correct, detail view accurate
```

---

### FEATURE 14: Mobile Responsiveness

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── 60%+ of Vietnamese internet users are on mobile
├── Mobile-first market: must work perfectly on phones
├── Landing page mobile UX = conversion rate
├── Lesson player mobile UX = engagement time
└── No mobile = losing 60% of potential users

SCOPE (FROZEN):
├── Mobile-first CSS (Tailwind mobile-first)
├── Breakpoints:
│   ├── 320px: Single column, full-width buttons
│   ├── 375px: iPhone standard
│   ├── 768px: Tablet (2-column grids)
│   └── 1024px+: Desktop (full layout)
├── Bottom nav bar (mobile only, replaces desktop nav)
├── Bottom sheet modals (mobile only)
├── Safe area insets (iPhone notch + home indicator)
├── Mobile keyboard handling (input scrolls into view)
├── Touch targets minimum 44x44px
├── Swipe gestures:
│   ├── Swipe left/right on lesson player → next/prev clip
│   └── Swipe down → dismiss bottom sheet
├── Pull-to-refresh on lists
├── No horizontal overflow at any viewport
└── Test devices:
    ├── iPhone SE (smallest)
    ├── iPhone 15 (standard)
    ├── Galaxy S (Android standard)
    └── iPad (768px tablet)

NOT INCLUDED:
├── Native app (React Native) (Phase 4)
├── Haptic feedback (Phase 2)
├── PWA install prompt (Phase 2)
├── Offline mode with service worker (Phase 3)
├── PWA with manifest (Phase 2)
├── Mobile-specific onboarding (MVP uses same onboarding)
└── Landscape mode optimization (Phase 2)

⚠️  DECISION: PWA install is Phase 2. MVP is web-only.
   "Install app" prompt is disruptive to first-time experience.

BUSINESS IMPACT:
├── Mobile market in Vietnam: 60%+ of all traffic
├── Mobile UX = conversion, engagement, retention
└── Poor mobile = lost users before first lesson

TECHNICAL COMPLEXITY: Medium
├── Tailwind responsive utilities
├── Safe area handling (env vars)
├── Keyboard resize observer
├── Touch event handlers
├── Bottom sheet component
└── Estimated: Integrated throughout all features (no standalone days)

TEST CASES: Per-feature (mobile-specific cases in each feature)
ACCEPTANCE: All features work on 320px-1024px, no horizontal scroll, touch targets pass
```

---

### FEATURE 15: PWA Basics (Minimal)

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── PWA = web app that acts like native app
├── Mobile users expect "Add to Home Screen"
├── Without manifest.json, no app icon on home screen
├── Required for mobile engagement (home screen = reminder)
└── Minimal PWA = just manifest.json, no service worker yet

SCOPE (FROZEN):
├── manifest.json (app name, icons, theme color, display: standalone)
├── App icon (simple SVG-based, or placeholder)
├── Theme color matching design system (#35375B)
├── Standalone display mode (no browser chrome)
└── Meta viewport configured correctly

NOT INCLUDED (Phase 2):
├── Service worker (offline caching) ← Phase 2
├── Background sync (queue submissions offline) ← Phase 3
├── Push notifications via service worker ← Phase 2
├── Install prompt (beforeinstallprompt) ← Phase 2
├── Cached audio for offline playback ← Phase 3
└── Offline lesson downloads (Phase 3)

⚠️  DECISION: Full PWA (service worker + offline) is Phase 3.
   MVP gets PWA manifest only — basic install to home screen.

BUSINESS IMPACT:
├── Home screen icon = daily reminder to open app
├── Standalone mode = native app feel = engagement
└── PWA is free (no app store fees)

TECHNICAL COMPLEXITY: Low
├── manifest.json file
├── SVG or PNG app icon
├── Meta tags in layout
└── Estimated: 0.5 day

ACCEPTANCE: "Add to Home Screen" works on iOS Safari + Android Chrome
```

---

### FEATURE 16: Error Handling & Empty States

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── Every error must be handled gracefully
├── Empty states guide users to next action
├── No error = no crash = user trust
├── Error messages must be Vietnamese and helpful
└── Loading states prevent layout shift

SCOPE (FROZEN — Cover ALL error scenarios):
Audio Errors:
├── Audio load fails → Retry button + error message
├── Audio network error → "Kiểm tra kết nối mạng"
├── Audio format unsupported → "Trình duyệt không hỗ trợ"
└── Fallback audio URL tried automatically

API Errors:
├── Network error → "Không thể kết nối. Thử lại."
├── Server error (500) → "Đã xảy ra lỗi. Đang sửa."
├── Timeout → "Yêu cầu hết thời gian. Thử lại."
├── Rate limit (429) → "Quá nhiều yêu cầu. Chờ 30 giây."
└── Retry automatically once, then manual retry

Form Errors:
├── Empty transcript → Submit button disabled
├── Server validation fail → Inline error message
└── Rapid submit → Button disabled after first tap

Permission Errors:
├── Microphone denied → Guide to enable in settings
├── Camera denied (future) → Guide to enable
└── Notification denied → In-app notification alternative

Empty States:
├── No topics → "Chưa có nội dung nào"
├── No lessons in topic → "Topic này đang được cập nhật"
├── No history → "Bạn chưa hoàn thành bài học nào. Bắt đầu ngay!"
├── No search results → "Không tìm thấy. Thử từ khóa khác."
└── No progress → "Hoàn thành bài đầu tiên để xem tiến độ!"

Loading States:
├── Skeleton placeholders (not spinners) for content
├── Spinners only for < 1s operations (buttons)
└── Progress bar for file uploads

NOT INCLUDED:
├── Custom error pages (404, 500) (add post-launch)
├── Error reporting to user dashboard (Phase 3)
├── Automatic error recovery suggestions (Phase 4)
└── Offline mode (Phase 3)

BUSINESS IMPACT:
├── Error handling = trust = retention
├── Empty states = reduced confusion = faster activation
├── Friendly Vietnamese messages = user feels cared for
└── No crash = no negative app store reviews

TECHNICAL COMPLEXITY: Low
├── Global error boundary (React ErrorBoundary)
├── Zod validation
├── try/catch in all API handlers
├── Toast notification system
└── Estimated: 2-3 days (covers all features)

TEST CASES: Covered in each feature's test suite
ACCEPTANCE: No unhandled exceptions, all errors have user-friendly message
```

---

### FEATURE 17: Basic SEO

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: IN MVP                                             │
└─────────────────────────────────────────────────────────────┘

WHY INCLUDED:
├── SEO = free organic traffic from Day 1
├── Landing page must be indexable
├── Topic pages must be discoverable
├── Vietnamese market: Google is dominant search engine
└── Without SEO, must pay for all traffic

SCOPE (FROZEN):
├── Unique meta title per page
├── Unique meta description per page
├── Open Graph tags (title, description, image, url)
├── Twitter Card tags
├── Canonical URLs on all pages
├── Semantic HTML (h1, h2, nav, main, article)
├── robots.txt (allow all, block /api/)
├── Next.js Metadata API (generateMetadata)
├── Structured data (JSON-LD):
│   ├── WebSite schema (homepage)
│   └── BreadcrumbList (topic pages)
└── Sitemap.xml (auto-generated, all public pages)

NOT INCLUDED (Phase 3):
├── Vocabulary pages with SEO content ← Phase 3
├── Blog with educational articles ← Phase 3
├── FAQ schema markup ← Phase 3
├── Course/Product schema for lessons ← Phase 3
├── Backlink strategy ← Phase 3
├── Content marketing calendar ← Phase 3
└── Google Search Console setup ← Phase 3

⚠️  CONTENT REQUIREMENT: SEO requires real content.
   If launch with no lessons → no SEO value → wasted opportunity.

BUSINESS IMPACT:
├── Organic traffic = free acquisition
├── "luyện nghe tiếng Anh" ranking = brand awareness
├── Search visibility = credibility
└── Without SEO, 100% reliant on paid acquisition

TECHNICAL COMPLEXITY: Low
├── Next.js Metadata API
├── next-sitemap package
├── JSON-LD in layout
└── Estimated: 1 day

TEST CASES: Covered in D.2 test suite (TC-D.2.1-14)
ACCEPTANCE: Sitemap valid, structured data passes Google test, meta tags correct
```

---

## PART 2: FUTURE FEATURES (OUT OF MVP)

These 14 features are **deferred** to Phase 2-4. They are important but not critical for MVP launch.

### DEFERRED FEATURE 1: Vocabulary Module

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 2                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Crawler data includes vocabulary but no UI designed yet
├── Spaced repetition (SM-2) adds complexity
├── Post-lesson panel adds another step to already long flow
└── Users can learn without explicit vocabulary module

WHY INCLUDED LATER:
├── Vocabulary review increases retention
├── SM-2 algorithm proven to improve memorization
├── Differentiates from competitors (Anki integration?)
└── User data on vocabulary will improve AI feedback

BUSINESS IMPACT:
├── Estimated: +15% long-term retention for users who use vocab
└── Competitive differentiation

TECHNICAL COMPLEXITY: High
├── SM-2 algorithm implementation
├── Vocabulary panel UI (post-lesson)
├── Spaced repetition scheduling
├── Vocabulary notebook UI
└── Estimated: 5-7 days
```

### DEFERRED FEATURE 2: Streak Freeze

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 2                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Complex midnight logic, timezone handling
├── Auto-freeze cron job needed
├── Weekly reset logic
├── Freeze UI (snowflake indicator)
├── User understanding of freeze (educational copy)
└── MVP streak without freeze already drives retention

WHY INCLUDED LATER:
├── Compassion for users who miss a day
├── Paid freeze (revenue opportunity)
├── Premium feature differentiation
└── Reduces churn from streak breaks

TECHNICAL COMPLEXITY: Medium
├── Supabase cron job (pg_cron)
├── Freeze auto-application at midnight
├── Freeze count management
└── Estimated: 3-4 days
```

### DEFERRED FEATURE 3: Monthly Calendar Heatmap

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 2                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── GitHub-style calendar is complex to build
├── MVP weekly chart already shows activity
├── Calendar is "nice to see" not "critical for retention"
└── Time investment better spent on speaking quality

WHY INCLUDED LATER:
├── Visual proof of consistency
├── Shareable calendar card
├── Pattern recognition ("you practice best on weekends")
└── Gamification element

TECHNICAL COMPLEXITY: Medium
├── Calendar grid generation
├── Color intensity mapping
├── Interactive date selection
└── Estimated: 3-4 days
```

### DEFERRED FEATURE 4: Push Notifications

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 2                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Requires web push setup (service worker)
├── Permission UX is complex (don't ask immediately)
├── Notification fatigue if not carefully designed
├── Requires Supabase Edge Functions or cron jobs
└── MVP can use in-app notifications (toast + badge)

WHY INCLUDED LATER:
├── Push = 2x more effective than in-app for retention
├── Streak at-risk notification is highest-ROI notification
├── Comeback notification for churn prevention
└── Daily reminder drives habit formation

TECHNICAL COMPLEXITY: Medium
├── Service worker (Workbox)
├── Web Push API
├── Notification scheduling (cron)
├── Permission flow design
└── Estimated: 5-6 days
```

### DEFERRED FEATURE 5: Leaderboard

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 2                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Needs real-time updates (Supabase Realtime)
├── Gamification must be balanced (not too competitive)
├── Requires thinking about leaderboard scope (global? topic?)
├── Potential for cheating/gaming
└── Can cause anxiety for low-ranked users

WHY INCLUDED LATER:
├── Social proof drives engagement
├── Friendly competition increases daily practice
├── Achievement unlocked feeling
└── Top users become brand ambassadors

TECHNICAL COMPLEXITY: Medium
├── Supabase Realtime subscriptions
├── Leaderboard query optimization
├── Anonymous vs public display
└── Estimated: 4-5 days
```

### DEFERRED FEATURE 6: Achievements & Badges

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 2                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Requires defining 15-20 achievement types
├── Badge design + icon creation needed
├── Unlock detection logic per achievement
├── Badge showcase UI (profile page)
├── Achievement notification (push + in-app)
└── MVP streak milestones cover the basics

WHY INCLUDED LATER:
├── Achievements = extrinsic motivation (short-term)
├── Badges = shareable social proof
├── "Collection" psychology drives engagement
└── Milestone gamification for each skill area

TECHNICAL COMPLEXITY: Medium
├── Achievement definition table
├── Unlock detection logic
├── Badge SVG/icon assets
├── Profile badge showcase UI
└── Estimated: 4-5 days
```

### DEFERRED FEATURE 7: Audio Waveform Visualization

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 2                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Canvas-based waveform is complex
├── Web Audio API for peak extraction adds overhead
├── MVP progress bar + timer is sufficient
├── SVG bar approach is simpler (Phase 2)
└── Not a blocker for core learning loop

WHY INCLUDED LATER:
├── Visual feedback during playback
├── Professional, polished feel
├── Helps users follow speech rhythm
└── Differentiates from basic audio players

TECHNICAL COMPLEXITY: Medium
├── Web Audio API (AudioContext, AnalyserNode)
├── Canvas rendering (60fps)
├── Mobile canvas performance
└── Estimated: 3-4 days
```

### DEFERRED FEATURE 8: Speaking Recording Playback in History

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 2                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Recording storage URL handling
├── 404 handling for deleted recordings
├── Audio player component for playback
├── Mobile storage management
└── MVP history shows transcript only — sufficient for review

WHY INCLUDED LATER:
├── Users want to hear their own pronunciation
├── Compare current vs past recording
├── Share recording with teacher
└── Hear improvement over time

TECHNICAL COMPLEXITY: Low
├── Reuse AudioPlayer component
├── 404 fallback UI
└── Estimated: 2-3 days
```

### DEFERRED FEATURE 9: Dark Mode

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 2                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Design system needs dual color tokens
├── All 50+ components need dark variants
├── User preference must persist
├── OS preference detection needed
├── Testing across all states doubles QA time
└── Light mode is sufficient for MVP

WHY INCLUDED LATER:
├── Dark mode expected by many users
├── Battery saving on OLED devices
├── Night-time practice comfort
└── Accessibility for light sensitivity

TECHNICAL COMPLEXITY: Medium
├── CSS custom properties for theming
├── Tailwind dark: variant
├── OS preference (prefers-color-scheme)
├── Manual toggle + persistence
└── Estimated: 3-4 days
```

### DEFERRED FEATURE 10: Full PWA (Service Worker)

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 3                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Service worker complexity
├── Offline lesson caching strategy
├── Background sync for submissions
├── Cache invalidation strategy
├── PWA update flow (new version notification)
└── MVP works online — sufficient for launch

WHY INCLUDED LATER:
├── Offline access = accessibility for poor connectivity
├── Download lessons = practice on subway/commute
├── Faster repeat visits (cached assets)
└── True "app-like" experience

TECHNICAL COMPLEXITY: High
├── Workbox service worker
├── Cache strategies (stale-while-revalidate)
├── Audio file caching (large)
├── Background sync API
└── Estimated: 6-8 days
```

### DEFERRED FEATURE 11: Phonetic Error Database (Vietnamese)

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 2                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Requires linguistics expertise to build
├── Vietnamese accent patterns need research
├── 50+ common error mappings needed
├── Must be validated with real user data
├── MVP uses generic AI feedback — sufficient baseline

WHY INCLUDED LATER:
├── Most impactful learning feature
├── Competitive moat (no competitor has this)
├── Personalized feedback based on user's accent
├── Pattern recognition: "You're Vietnamese, you likely confuse X"
└── Data improves with every user

TECHNICAL COMPLEXITY: High
├── Phonetic transcription (IPA)
├── Vietnamese accent analysis
├── Error pattern library (curated)
├── Integration with scoring algorithm
└── Estimated: 7-10 days (research + implementation)
```

### DEFERRED FEATURE 12: Vietnam Payment Integration

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 3                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Stripe doesn't support VND natively
├── Need VNPay, MoMo, or ZaloPay integration
├── Payment provider contracts needed
├── Tax compliance (Vietnamese invoicing)
├── Subscription management UI
├── Freemium model must be finalized first
└── MVP is 100% free — no payment needed

WHY INCLUDED LATER:
├── Revenue generation (primary goal post-launch)
├── Sustainable infrastructure funding
├── VNPay: Most common (local bank cards)
├── MoMo: Popular e-wallet
├── ZaloPay: Strong VN user base
└── Combined: Cover 90%+ of Vietnamese payers

TECHNICAL COMPLEXITY: High
├── Payment provider APIs
├── Webhook handling
├── Subscription lifecycle
├── Invoice generation
├── Refund flow
└── Estimated: 8-10 days
```

### DEFERRED FEATURE 13: Email Digest

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 3                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Requires email service (SendGrid/Resend)
├── Email template design needed
├── Weekly/daily email scheduling
├── Unsubscribe flow (legal requirement)
├── Low priority for MVP (users are active in-app)
└── Push notification covers retention use cases

WHY INCLUDED LATER:
├── "Your week in review" drives engagement
├── Churn prevention for inactive users
├── Win-back emails for churned users
└── Feature announcement emails

TECHNICAL COMPLEXITY: Medium
├── Resend/SendGrid integration
├── Email templates (React Email)
├── Scheduling (Supabase cron)
└── Estimated: 4-5 days
```

### DEFERRED FEATURE 14: Adaptive Difficulty

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: DEFERRED — Phase 3                                 │
└─────────────────────────────────────────────────────────────┘

WHY DEFERRED:
├── Requires data on user performance patterns
├── Algorithm needs user data to calibrate
├── Risk of recommending too-hard content (frustration)
├── Risk of recommending too-easy content (boredom)
├── MVP uses manual topic selection — sufficient

WHY INCLUDED LATER:
├── Personalized learning path
├── Optimal challenge level (flow state)
├── Predict next skill to learn
└── Reduces "what should I learn next?" friction

TECHNICAL COMPLEXITY: High
├── Performance tracking by skill area
├── Difficulty scoring per lesson
├── Recommendation algorithm
├── A/B testing framework
└── Estimated: 10-15 days
```

---

## PART 3: FEATURES EXPLICITLY REJECTED

These 7 features are **permanently rejected** for MVP and considered for Phase 4+ only.

### REJECTED FEATURE 1: Reading Module

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: REJECTED — Not in any planned phase               │
└─────────────────────────────────────────────────────────────┘

WHY REJECTED:
├── Listening → Speaking is the core loop. Reading dilutes focus.
├── Every feature added to MVP increases time-to-market
├── Reading would require content sourcing + UI + scoring
├── Resources better spent perfecting listening + speaking
└── Can be added as separate product later (VinaRead)

REASONING: Focus is the only competitive advantage of a solo founder.
Adding features = scattered attention = mediocre product.
```

### REJECTED FEATURE 2: Writing Practice

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: REJECTED — Not in any planned phase               │
└─────────────────────────────────────────────────────────────┘

WHY REJECTED:
├── Writing is 4th skill (after listen, speak, read)
├── Feedback on writing requires LLM (expensive)
├── Grading writing is subjective and complex
├── Timeline is already 6+ months — adding writing = 12 months
└── Focus on 1 skill done well > 4 skills done poorly

REASONING: Same as reading. One skill mastered > four skills attempted.
```

### REJECTED FEATURE 3: Native Mobile App (React Native)

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: REJECTED — Phase 4+, if ever                     │
└─────────────────────────────────────────────────────────────┘

WHY REJECTED:
├── iOS App Store approval = 1-2 week delay
├── Android Play Store = 1-4 days
├── Maintain 2 codebases (web + native)
├── Push notification complexity doubles
├── Audio recording API differs by platform
├── PWA covers 90% of native app use cases
├── $99/year Apple Developer fee + $25 one-time Android
└── 3x the development and maintenance effort

REASONING: PWA with offline mode (Phase 3) covers 90% of native use cases.
Native app only if PWA proves insufficient.

EXCEPTION: If PWA has < 30% engagement vs native benchmark → revisit.
```

### REJECTED FEATURE 4: Corporate / Admin Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: REJECTED — Phase 4+, B2B only                     │
└─────────────────────────────────────────────────────────────┘

WHY REJECTED:
├── B2B requires sales cycle (weeks to months)
├── Admin dashboard = separate product
├── Focus must be B2C first (individual learners)
├── Corporate needs are different (team management, reporting)
├── Pricing, contracts, support = full-time job
└── Only add if 500+ MAU validated

REASONING: Corporate sales before product-market fit is premature.
Get 500 MAU first, then evaluate B2B demand.
```

### REJECTED FEATURE 5: LinkedIn / Social Integration

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: REJECTED — Not planned                              │
└─────────────────────────────────────────────────────────────┘

WHY REJECTED:
├── LinkedIn OAuth adds complexity
├── "Share to LinkedIn" = very low viral coefficient
├── Vietnamese market: Zalo, Facebook more relevant
├── Distracts from core learning loop
├── Privacy concerns with social sharing
└── Can add "share result" button in Phase 3 without OAuth

REASONING: Share buttons (Phase 3) without full OAuth = sufficient.
Don't add OAuth complexity for sharing.
```

### REJECTED FEATURE 6: AI Chat Tutor (Full)

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: REJECTED — Phase 4 only (not MVP, not Phase 2-3) │
└─────────────────────────────────────────────────────────────┘

WHY REJECTED:
├── Full AI chat tutor = separate product
├── Requires Gemini/Claude API integration
├── Conversation state management complex
├── Content moderation needed
├── 24/7 AI availability = high API cost
├── "AI Coach" in PRD = Phase 4 feature, not MVP
├── Must validate core loop first before adding AI
└── Expensive to run before monetization established

WHY IN PHASE 4: AI Chat is premium feature. Can gate behind paywall.
Early adopters pay for AI = revenue + validation.

REASONING: Save AI investment until product-market fit confirmed.
```

### REJECTED FEATURE 7: Blockchain / NFT Certificates

```
┌─────────────────────────────────────────────────────────────┐
│ STATUS: REJECTED — Never                                     │
└─────────────────────────────────────────────────────────────┘

WHY REJECTED:
├── Blockchain adds technical complexity
├── NFT certificates have zero employer recognition
├── Credibility comes from employer relationships, not tech
├── Complexity >> value for language learners
├── Distracts from core product
├── Crypto users ≠ language learners (wrong audience)
└── Regular PDF certificates sufficient when Phase 4

REASONING: No employer has ever asked for blockchain certificate.
PDF with design = same value, 1% of the complexity.
```

---

## PART 4: SUCCESS METRICS

### MVP Launch Metrics

```
┌─────────────────────────────────────────────────────────────┐
│ NORTH STAR METRIC                                           │
│ Primary: Daily Active Users (DAU) — Track daily logins      │
│ Secondary: Weekly Active Users (WAU) — Track weekly return   │
└─────────────────────────────────────────────────────────────┘

LAUNCH TARGETS (Week 1-4 after launch):

ACQUISITION:
├── New registrations: > 100 users/week
├── Landing page conversion: > 10% (visit → signup)
├── Google Search impressions: > 1,000/month
└── "luyện nghe tiếng Anh" ranking: Top 20

ACTIVATION (Critical — 4 weeks to improve):
├── Onboarding completion rate: > 60%
├── First lesson completion rate: > 50%
├── First lesson → Second lesson: > 40%
└── First speaking attempt: > 30%

ENGAGEMENT:
├── Average session duration: > 5 minutes
├── Clips completed per session: > 3
├── Average accuracy: 60-85% (not too easy, not too hard)
├── Daily practice goal met: > 40% of active users
└── DAU/MAU ratio: > 15%

RETENTION (Week 4):
├── Day 1 retention: > 40%
├── Day 7 retention: > 20%
├── Day 30 retention: > 10%
├── Users with streak > 0: > 30% of registered
└── Streak users with streak >= 7: > 10% of registered

QUALITY:
├── Crash-free rate: > 99.5%
├── Error rate: < 1%
├── Lighthouse Performance: > 85
├── Lighthouse Accessibility: > 90
├── Lighthouse SEO: > 90
└── Support tickets: < 5/week

FINANCIAL (MileStone — before Phase 3):
├── Cost per user (server): < $0.10/month
├── Revenue: $0 (free MVP)
└── Breakeven user count: 1,000 (if paid)
```

### PIVOT CONDITIONS

```
⚠️  IF after 8 weeks:
├── Onboarding completion < 30% → Rethink onboarding UX
├── Day 7 retention < 10% → Pause, investigate drop-off
├── No organic growth (SEO) → Invest in content
└── Technical debt > 50% → Stop features, refactor

⚠️  IF after 16 weeks:
├── MAU < 100 → Product-market fit not confirmed
├── Conversion to premium < 1% → Redesign freemium
└── Churn rate > 50%/month → Major retention problem

✅  SUCCESS CONDITION after 6 months:
├── 500+ MAU
├── 30%+ Day 7 retention
├── 20%+ DAU/MAU
├── 10+ users with streak > 30
└── Organic traffic growing month-over-month
```

---

## PART 5: LAUNCH CRITERIA

### Hard Requirements (Cannot Launch Without)

```
┌─────────────────────────────────────────────────────────────┐
│ BLOCKER — Legal & Content                                   │
│                                                             │
│ ☐ DailyDictation content licensed OR                       │
│ ☐ Alternative content (BBC/VOA) integrated and tested       │
│ ☐ No copyrighted content used without permission           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BLOCKER — Core Loop                                         │
│                                                             │
│ ☐ User can complete full lesson:                           │
│   Topic → Lesson → Audio → Transcript → Score →            │
│   Recording → Pronunciation Score → Complete                │
│ ☐ All 17 MVP features implemented and functional           │
│ ☐ No P0 bugs (crash, data loss, security hole)             │
│ ☐ No P1 bugs affecting core loop                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BLOCKER — Performance                                        │
│                                                             │
│ ☐ Lighthouse Performance: > 85                              │
│ ☐ Audio plays within 1 second                              │
│ ☐ Page load (3G): < 3 seconds                              │
│ ☐ API response P99: < 500ms                                │
│ ☐ Zero hydration mismatches                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BLOCKER — Mobile                                            │
│                                                             │
│ ☐ iPhone SE (320px): Zero horizontal overflow              │
│ ☐ iPhone 15 (375px): All features functional                │
│ ☐ iPad (768px): Layout correct                             │
│ ☐ Android Chrome: Audio + Recording functional               │
│ ☐ Safari iOS: Audio + Recording functional                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BLOCKER — Security                                           │
│                                                             │
│ ☐ RLS policies block cross-user data access               │
│ ☐ No SQL injection (parameterized queries only)             │
│ ☐ No XSS vulnerability (React auto-escapes)                │
│ ☐ HTTPS enforced on all routes                             │
│ ☐ Environment variables not committed to git                 │
│ ☐ No sensitive data in client-side code                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BLOCKER — Accessibility                                      │
│                                                             │
│ ☐ All interactive elements keyboard accessible              │
│ ☐ Focus visible on all interactive elements                 │
│ ☐ Color contrast: WCAG AA (4.5:1 text, 3:1 large text)    │
│ ☐ Screen reader can navigate main flows                     │
│ ☐ prefers-reduced-motion respected                         │
└─────────────────────────────────────────────────────────────┘
```

### Soft Requirements (Should Have, Can Launch Without)

```
┌─────────────────────────────────────────────────────────────┐
│ RECOMMENDED — Launch Readiness                              │
│                                                             │
│ ☐ All P0 bugs fixed                                       │
│ ☐ P1 bugs < 10                                            │
│ ☐ P2 bugs < 20                                             │
│ ☐ Lighthouse Accessibility: > 95                           │
│ ☐ Lighthouse SEO: > 95                                     │
│ ☐ Vercel Analytics configured                              │
│ ☐ Sentry error monitoring active                           │
│ ☐ Privacy policy published                                 │
│ ☐ Terms of service published                               │
│ ☐ Contact/support channel available                         │
└─────────────────────────────────────────────────────────────┘
```

### Pre-Launch Checklist

```
WEEK -1 (1 week before launch):
☐ All content licensed and verified
☐ All 17 MVP features code-complete
☐ Full regression test passed
☐ Performance audit passed
☐ Security audit passed
☐ Mobile testing on physical devices (not just emulator)
☐ Privacy policy written (in Vietnamese)
☐ Terms of service written (in Vietnamese)
☐ Support email configured (support@vinalisten.app)
☐ Error monitoring active (Sentry)
☐ Analytics active (Vercel Analytics)
☐ Social media accounts created (Facebook, Zalo OA)
☐ Domain configured (www.vinalisten.app)
☐ SSL certificate active
☐ 404 page designed
☐ Loading states for all async operations

DAY OF LAUNCH:
☐ Production deployment verified
☐ Database migrations applied
☐ Backup strategy confirmed
☐ Rollback plan documented
☐ Launch announcement ready
☐ Social media posts scheduled
☐ Email list notified (if pre-launch list exists)

POST-LAUNCH (Day 1-7):
☐ Monitor error rates every 4 hours
☐ Check analytics dashboard daily
☐ Respond to all support tickets within 24 hours
☐ Track crash reports in Sentry
☐ Collect user feedback
☐ Fix critical bugs within 24 hours
☐ Deploy hotfixes via Vercel (auto-deploy)
```

---

## PART 6: POST-LAUNCH ROADMAP

### Phase 1 Post-MVP (Week 7-13): Polish & Retention

```
WEEK 7-9: Stabilization
├── Fix all P2 bugs discovered in production
├── Implement PWA service worker (offline)
├── Add push notification system
├── Build vocabulary module (SM-2 + UI)
└── Add streak freeze system

WEEK 10-13: Retention Features
├── Monthly calendar heatmap
├── Achievement + badge system
├── Leaderboard (streak, accuracy, lessons)
├── Dark mode
├── Speaking recording playback in history
├── Audio waveform visualization (SVG bars)
└── Basic analytics (funnel, retention)

SUCCESS METRICS (End of Phase 1):
├── Day 7 retention: > 25%
├── Day 30 retention: > 12%
├── Users with streak > 7: > 15%
└── DAU/MAU: > 18%
```

### Phase 2 (Week 14-19): Growth

```
WEEK 14-16: SEO + Content
├── Vocabulary pages with SEO content
├── Blog with 2 educational articles/week
├── FAQ schema markup
├── Sitemap optimization
├── Backlink outreach (language learning sites)
└── Content marketing calendar

WEEK 17-19: Freemium + Payments
├── Define premium tiers
├── Implement VNPay payment integration
├── Freemium gates (speaking limit, AI feedback limit)
├── Upgrade nudge UX
├── Pricing page
└── Lifetime deal launch (490,000 VND)

SUCCESS METRICS (End of Phase 2):
├── MAU: > 300
├── Organic traffic: > 50% of total
├── First paying users: > 5
└── MRR: > $20
```

### Phase 3 (Week 20-25): AI + Scale

```
WEEK 20-22: AI Features
├── AI pronunciation coach (Gemini)
├── Phonetic error database (Vietnamese accents)
├── Smart analysis (learning patterns)
├── Personalized recommendations
└── AI listening tutor (chat-based)

WEEK 23-25: Scale
├── Full PWA (offline audio download)
├── Email digest (weekly summary)
├── Adaptive difficulty algorithm
├── Performance optimization for 10K+ MAU
└── Infrastructure scaling (read replicas)

SUCCESS METRICS (End of Phase 3):
├── MAU: > 500
├── MRR: > $200
├── DAU/MAU: > 22%
└── First $500 MRR milestone
```

### Phase 4 (Week 26+): Monetization + B2B

```
WEEK 26-30: B2B / Enterprise
├── Corporate dashboard (teacher view)
├── Team management (student groups)
├── Progress reports (PDF export)
├── Curriculum customization
├── Custom pricing (per-seat)
└── Direct sales (no self-serve)

WEEK 31+: Scale
├── Native mobile apps (React Native — evaluate)
├── Content expansion (IELTS, TOEIC, Business English)
├── Community features (shared notes, peer explanations)
├── Certificates (PDF + digital)
├── Partnership with language schools
└── Expand to other Southeast Asian markets

SUCCESS TARGETS (End of Year 1):
├── MAU: > 1,000
├── MRR: > $1,000
├── Enterprise deals: > 2
└── NPS: > 50
```

---

## SCOPE SUMMARY TABLE

```
┌──────────────────┬─────────────┬────────────┬──────────────┐
│ Feature          │ MVP (v1.0)  │ Phase 2   │ Phase 3+     │
├──────────────────┼─────────────┼────────────┼──────────────┤
│ Landing Page     │ ✅          │ (improve)  │ (content)    │
│ Auth             │ ✅ (basic)  │ (Apple)    │ (2FA)       │
│ Onboarding       │ ✅ (4-step) │ (analytics)│ (adaptive)  │
│ Topics/Lessons   │ ✅          │ (sort)     │ (filter)    │
│ Audio Player     │ ✅ (basic)  │ (waveform) │ (quality)   │
│ Transcript       │ ✅          │ (hints)    │ (AI tips)   │
│ Clip Navigation  │ ✅          │            │             │
│ Voice Recording  │ ✅          │ (trim)     │ (video)     │
│ Speech Recogn.   │ ✅          │ (cache)    │ (custom)    │
│ Pronun. Score    │ ✅ (basic)  │ (phonetic) │ (prosody)   │
│ Speaking Result  │ ✅          │            │             │
│ Progress         │ ✅ (basic)  │ (calendar) │ (adaptive)  │
│ Streak           │ ✅ (basic)  │ (freeze)   │ (battle)    │
│ History          │ ✅ (basic)  │ (export)  │ (patterns)  │
│ Mobile           │ ✅          │ (dark)     │ (native)    │
│ PWA              │ ✅ (basic)  │ (offline)  │             │
│ Error States     │ ✅          │            │             │
│ SEO              │ ✅ (basic)  │ (blog)     │ (content)   │
├──────────────────┼─────────────┼────────────┼──────────────┤
│ Vocabulary       │             │ ✅          │             │
│ Leaderboard      │             │ ✅          │             │
│ Achievements     │             │ ✅          │             │
│ Push Notif.      │             │ ✅          │             │
│ Monthly Calendar │             │ ✅          │             │
│ Dark Mode        │             │ ✅          │             │
│ Recordings Hist.  │             │ ✅          │             │
│ Phonetic DB      │             │ ✅          │             │
├──────────────────┼─────────────┼────────────┼──────────────┤
│ Payment/VNPay    │             │            │ ✅           │
│ Email Digest     │             │            │ ✅           │
│ Full PWA         │             │            │ ✅           │
│ AI Coach         │             │            │ ✅           │
│ Adaptive Diff.   │             │            │ ✅           │
│ B2B Dashboard    │             │            │ ✅           │
│ Native App       │             │            │ ✅ (eval)    │
├──────────────────┼─────────────┼────────────┼──────────────┤
│ Reading Module   │ ❌ REJECTED │ ❌         │ ❌           │
│ Writing Practice │ ❌ REJECTED │ ❌         │ ❌           │
│ Blockchain NFT   │ ❌ REJECTED │ ❌         │ ❌           │
│ LinkedIn OAuth   │ ❌ REJECTED │ ❌         │ ❌           │
│ Admin Dashboard  │ ❌ REJECTED │ ❌         │ ✅ (B2B)    │
│ Full AI Chat     │ ❌ REJECTED │ ❌         │ ✅ (Phase 4)│
│ Native Mobile    │ ❌ REJECTED │ ❌         │ ✅ (eval)    │
└──────────────────┴─────────────┴────────────┴──────────────┘

IN MVP:     17 features ✅
DEFERRED:   14 features ⏳
REJECTED:    7 features ❌
TOTAL:       38 features reviewed
```

---

## FINAL SCOPE STATEMENT

```
┌─────────────────────────────────────────────────────────────┐
│ MVP SCOPE IS FROZEN                                         │
│                                                             │
│ This document represents the complete and final scope for    │
│ VinaListen MVP v1.0.                                        │
│                                                             │
│ No features may be added to MVP without explicit           │
│ re-review by the founder.                                  │
│                                                             │
│ Exceptions require:                                         │
│ 1. Legal requirement (e.g., privacy policy)               │
│ 2. Security vulnerability (must fix immediately)           │
│ 3. P0 bug that blocks core loop                            │
│                                                             │
│ All "nice to have" ideas → backlog → Phase 2+              │
│                                                             │
│ FOCUS = Complete the listen → speak → learn loop.          │
│ Everything else is a distraction.                          │
└─────────────────────────────────────────────────────────────┘
```

---

*Document End — VinaListen MVP Freeze v1.0*
*Frozen: 2026-06-07 | Review Date: 2026-09-01 (post-launch)*
