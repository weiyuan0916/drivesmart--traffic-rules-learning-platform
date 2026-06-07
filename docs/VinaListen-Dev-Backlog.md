# VinaListen — Development Task Backlog
## Granular Tasks · Estimates · Dependencies

**Date:** 2026-06-07  
**Version:** 1.0  
**Based on:** MVP Freeze + Implementation Plan v2 + Gap Spec + Launch Readiness  
**Total Estimated:** ~300 hours (1 founder, part-time ~20h/week = ~15 weeks)

---

## HOW TO READ THIS BACKLOG

```
Task Format:
┌──────────────────────────────────────────────────────┐
│ T-[PHASE]-[NUMBER] | Feature Name                    │
│                                                    │
│ Description:  What to build                          │
│              Multiple lines for complex tasks       │
│                                                    │
│ Estimate:     X hours                               │
│ Dependencies: T-X-Y (task IDs this depends on)     │
│              "None" if no dependencies              │
│                                                    │
│ Acceptance Criteria:                                 │
│   1. First measurable outcome                       │
│   2. Second measurable outcome                     │
│   3. Third measurable outcome                      │
└──────────────────────────────────────────────────────┘

Priority:
  P0 = Must complete (launch blocker)
  P1 = Should complete (important)
  P2 = Nice to have (post-launch)

Phase:
  A = Foundation & Infrastructure
  B = Core Learning Loop
  C = Retention & Polish
  D = QA & Launch

Time Estimates:
  < 4h   = Half day
  4-8h   = 1 day
  8-16h  = 2 days
  16-24h = 3 days
  24-40h = 1 week
```

---

## PHASE A: FOUNDATION & INFRASTRUCTURE

---

### T-A-001 | Project Setup

```
Description:
  Initialize Next.js 14 project with App Router, TypeScript strict mode,
  Tailwind CSS v4, ESLint, Prettier. Configure folder structure,
  install all required dependencies (TanStack Query, Zustand, Framer Motion,
  Recharts, React Hook Form, Zod, Lucide React). Set up Git with
  main + dev branches. Create .env.example with all required keys.

Estimate:     4 hours
Dependencies: None
Priority:    P0
Phase:       A

Acceptance Criteria:
  1. `npm run build` succeeds with zero errors in < 3 minutes
  2. `tsc --noEmit` passes with zero TypeScript errors
  3. `npm run lint` passes with zero warnings
  4. Folder structure matches technical design (components/, lib/, types/, etc.)
  5. .env.example contains all required keys (SUPABASE_URL, SUPABASE_ANON_KEY, etc.)
```

### T-A-002 | Supabase Project & Database Schema

```
Description:
  Create Supabase project. Run full database migration (v1.1 SQL from Gap Spec).
  Create all 9 tables: topics, lessons, lesson_clips, auth.users (extended),
  user_progress, user_clip_progress, daily_activity, user_notifications,
  user_settings, user_daily_usage, vocabulary_learning. Add all indexes,
  triggers (updated_at, streak, daily_activity, speaking_usage),
  and Row Level Security policies. Generate Supabase types.

Estimate:     8 hours
Dependencies: T-A-001
Priority:    P0
Phase:       A

Acceptance Criteria:
  1. All 9 tables created with correct columns and constraints
  2. Primary keys, foreign keys, and unique constraints enforced
  3. All 12+ indexes created for queried columns
  4. RLS policies block user A from accessing user B's data
  5. Triggers fire correctly (streak increment, daily_activity upsert)
  6. `supabase gen types typescript` generates compilable TypeScript
  7. Migration runs on fresh database without errors
  8. Database backup configured (auto-backup daily)
```

### T-A-003 | Supabase Client Setup (SSR-safe)

```
Description:
  Create Supabase browser client (createBrowserClient), server client
  (createServerClient with cookie adapter), and middleware client.
  Configure SSR session management with HTTP-only cookies.
  Create auth types and helper functions. Set up middleware.ts
  for protected route redirects.

Estimate:     4 hours
Dependencies: T-A-001, T-A-002
Priority:    P0
Phase:       A

Acceptance Criteria:
  1. Browser client initializes without errors
  2. Server client can read session from cookies (SSR)
  3. Middleware redirects unauthenticated users to /auth/login
  4. Auth state is accessible in both server and client components
  5. No hydration mismatches with auth state
  6. Session persists across page refresh
```

### T-A-004 | Design System Setup

```
Description:
  Implement full design system in Tailwind CSS v4. Set up CSS variables
  for all colors (primary, accent, success, error, warning, neutral).
  Create typography scale (Display, H1-H3, Body, Small, Caption).
  Create spacing system (8px grid). Create border radius tokens.
  Create shadow tokens. Configure dark mode (Phase 2 — placeholder only).
  Set up font loading (Nimbus Sans via Google Fonts, Inter fallback).
  Ensure WCAG AA compliance for all text colors.

Estimate:     6 hours
Dependencies: T-A-001
Priority:    P0
Phase:       A

Acceptance Criteria:
  1. All colors available as Tailwind utilities (text-primary, bg-accent, etc.)
  2. Accent color passes WCAG AA on white backgrounds (--accent-dark)
  3. Typography scale matches spec (H1 36px, H2 28px, H3 20px, Body 16px)
  4. Font loads without FOUT or layout shift
  5. Responsive spacing consistent with 8px grid
  6. Button, Input, Card, Badge base components styled
  7. Loading skeleton component created
```

### T-A-005 | Data Ingestion (Crawler → Supabase)

```
Description:
  Build TypeScript migration script to ingest crawled data from local
  JSON into Supabase. Map topics, lessons, lesson_clips, audio URLs,
  transcripts. Validate all data before insert. Handle duplicates
  (upsert by slug). Upload audio files to Supabase Storage.
  Generate re-ingestion script for future updates.
  Validate data integrity post-migration.

Estimate:     8 hours
Dependencies: T-A-002
Priority:    P0
Phase:       A

Acceptance Criteria:
  1. All topics ingested (slug unique, no duplicates)
  2. All lessons ingested with correct topic_id FK
  3. All clips ingested with correct lesson_id FK
  4. Audio files uploaded to Supabase Storage and accessible
  5. Count validation: topics = X, lessons = Y, clips = Z
  6. No broken audio URLs (all return 200)
  7. Re-ingestion script can re-run safely (upsert, no duplicates)
  8. Migration completes in < 10 minutes for 500 lessons
```

### T-A-006 | Base UI Components

```
Description:
  Build foundational UI component library used across all features:
  Button (primary, secondary, ghost, destructive variants),
  Input (with label, error state, helper text),
  Textarea (auto-grow, character count),
  Card, Modal, BottomSheet, Toast/ToastProvider,
  Skeleton, SkeletonCard, Badge, Chip,
  ProgressBar, ProgressRing, Spinner, Avatar,
  Tooltip, Dropdown, Tabs, EmptyState, ErrorState, Divider.

Estimate:     12 hours
Dependencies: T-A-001, T-A-004
Priority:    P0
Phase:       A

Acceptance Criteria:
  1. All components accept correct props with TypeScript types
  2. All variants implemented (Button: primary/secondary/ghost/destructive)
  3. Modal renders on top of page with backdrop
  4. BottomSheet slides up from bottom (mobile)
  5. Toast notifications appear and auto-dismiss
  6. Skeleton matches real content dimensions
  7. ErrorState shows error icon + message + retry
  8. EmptyState shows illustration + headline + CTA
  9. All components accessible (focusable, keyboard nav)
  10. Touch targets minimum 44x44px on mobile
```

### T-A-007 | Zustand Store Setup

```
Description:
  Create Zustand stores: useAuthStore (user, session, isLoading),
  useAudioPlayerStore (lesson, clips, currentIndex, isPlaying, speed,
  volume, loopMode), useLessonSessionStore (clipResults, step,
  transcriptInput, speakingState), useUIStore (theme, reducedMotion,
  toasts, modals, mobileNavOpen). Configure middleware for persistence.

Estimate:     6 hours
Dependencies: T-A-001, T-A-003
Priority:    P0
Phase:       A

Acceptance Criteria:
  1. useAuthStore: user, login, logout, register, isAuthenticated
  2. useAudioPlayerStore: play, pause, seek, skip, speed, volume, loop
  3. useLessonSessionStore: session state for full lesson flow
  4. useUIStore: theme, toasts, modals, reducedMotion toggle
  5. Stores persist auth state (not localStorage — SSR-safe)
  6. No store causes hydration mismatch
  7. All stores accessible from any component
```

### T-A-008 | TanStack Query Setup

```
Description:
  Configure TanStack Query with default options (staleTime 60s, gcTime 5min,
  retry 1). Create API client wrapper with Supabase. Create typed
  query hooks: useTopics, useTopic, useLesson, useDashboard,
  useStreak, useHistory, useNotifications. Create query invalidation
  strategies for mutations.

Estimate:     4 hours
Dependencies: T-A-001, T-A-003
Priority:    P0
Phase:       A

Acceptance Criteria:
  1. TanStack Query devtools visible in development
  2. All query hooks return typed data
  3. Queries refetch on window focus (configurable per query)
  4. Mutations invalidate relevant queries correctly
  5. Loading and error states accessible from hooks
  6. Query keys follow consistent naming convention
  7. Stale time configured appropriately per query type
```

### T-A-009 | Error Boundary & Global Error Handling

```
Description:
  Create global React ErrorBoundary to catch and display React errors.
  Create global API error handler for unhandled API failures.
  Create toast notification system (success, error, warning, info).
  Set up Sentry for error monitoring (client + server).
  Create error page (app/not-found.tsx, app/error.tsx).

Estimate:     4 hours
Dependencies: T-A-001, T-A-006
Priority:    P1
Phase:       A

Acceptance Criteria:
  1. Unhandled React errors show friendly error page (not white screen)
  2. Sentry captures client-side errors with stack traces
  3. Sentry captures server-side errors from API routes
  4. Toast system can show: success, error, warning, info
  5. Toast auto-dismisses after 4 seconds
  6. 404 page shows friendly message with home link
  7. 500 page shows friendly message with retry
```

### T-A-010 | Vercel Deployment & CI/CD

```
Description:
  Deploy Next.js app to Vercel. Configure environment variables
  (SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY).
  Set up GitHub Actions CI pipeline: tsc --noEmit, npm run lint,
  npm run build. Add Playwright E2E tests to CI.
  Configure Vercel preview deployments for PRs.

Estimate:     4 hours
Dependencies: T-A-001, T-A-002, T-A-003
Priority:    P0
Phase:       A

Acceptance Criteria:
  1. Production deployment successful and accessible
  2. Environment variables configured on Vercel (not in repo)
  3. CI pipeline runs on every push (tsc, lint, build)
  4. Preview deployments created for PRs
  5. Vercel Analytics enabled
  6. Custom domain configured (if available)
  7. SSL certificate active
```

---

## PHASE B: CORE LEARNING LOOP

---

### T-B-001 | Authentication Pages & Flows

```
Description:
  Build auth pages: /auth/login, /auth/register, /auth/callback,
  /auth/reset-password. Create LoginForm, RegisterForm, OAuthButton
  components. Implement email/password + Google OAuth via Supabase Auth.
  Build useAuth and useUser hooks. Create password reset flow.
  Implement guest mode (skip signup, browse only). Create auth
  middleware for protected routes.

Estimate:     8 hours
Dependencies: T-A-003, T-A-006, T-A-007
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. Email/password registration creates user and auto-logs in
  2. Email/password login works and redirects correctly
  3. Google OAuth completes full flow and redirects correctly
  4. Password reset email sends and works
  5. Guest mode allows browsing without account
  6. Protected routes redirect to /auth/login
  7. Logged-in users redirected away from /auth/login
  8. Session persists across page refresh and tab close
  9. Logout clears session and redirects
  10. Error messages display in Vietnamese
```

### T-B-002 | Landing Page

```
Description:
  Build full landing page with: HeroSection (headline, subheadline, CTA),
  HowItWorksSection (3 steps with icons),
  FeaturesSection (4 feature cards),
  TopicsPreviewSection (fetch real topics from database),
  FaqSection (accordion with 5-6 questions),
  FinalCTASection (register CTA),
  LandingFooter (links, social).
  Implement Framer Motion entrance animations.
  Implement responsive layout (mobile-first).

Estimate:     12 hours
Dependencies: T-A-004, T-A-006, T-A-008
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. All sections render correctly at 320px, 768px, 1024px, 1440px
  2. No horizontal overflow at any viewport
  3. CTA links to /auth/register
  4. Topics preview shows real topics from database
  5. FAQ accordion expands/collapses smoothly
  6. Entrance animations smooth (fade + translate)
  7. prefers-reduced-motion respected (no animation)
  8. Meta tags present (title, description, OG, Twitter)
  9. Page load < 3 seconds on 3G
  10. Lighthouse Performance > 85
```

### T-B-003 | Onboarding Wizard

```
Description:
  Build 4-step onboarding wizard: GoalStep (goal selection with icons),
  LevelStep (level assessment), DailyGoalStep (daily time commitment),
  PreviewStep (1-clip mini lesson). Create OnboardingProgress dots.
  Save onboarding data to user_settings table.
  Implement redirect logic (completed → dashboard, new → onboarding).
  Create skip option for all steps.

Estimate:     8 hours
Dependencies: T-B-001, T-A-006, T-A-007, T-A-008
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. All 4 steps render and navigate correctly
  2. Progress dots show current step
  3. Data saved to user_settings on completion
  4. New users redirected to /onboarding after register
  5. Completed users never see onboarding again
  6. Skip button works on all steps (never forced)
  7. Preview step plays 1 clip and shows transcript
  8. "Bắt đầu học" navigates to first recommended lesson
  9. Onboarding completes in < 2 minutes
  10. Mobile wizard is single-column, swipe-friendly
```

### T-B-004 | App Shell & Navigation

```
Description:
  Build app layout: Header (logo, nav links, streak counter, avatar dropdown),
  BottomNav (mobile: Home, Topics, Progress, Me),
  MobileNav (hamburger menu for mobile).
  Implement responsive nav switching (mobile ↔ desktop).
  Create AppShell wrapper with header + bottom nav.
  Build MiniPlayer (sticky bottom audio player).
  Create PageContainer for consistent page layouts.

Estimate:     8 hours
Dependencies: T-A-004, T-A-006, T-A-007
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. Desktop: Top nav visible, bottom nav hidden
  2. Mobile: Bottom nav visible, top nav minimal
  3. All nav links navigate correctly
  4. Active page highlighted in nav
  5. Avatar dropdown shows Profile, Settings, Logout
  6. Streak counter displays correct number
  7. Mini player appears when audio is playing
  8. Mini player controls work (play/pause, skip)
  9. Nav transitions smoothly between breakpoints
  10. Safe area insets respected on iPhone
```

### T-B-005 | Topics & Lesson Listing

```
Description:
  Build TopicsListing page (/topics) with grid/list toggle.
  Create TopicCard, TopicRow components.
  Implement search bar (realtime, debounced 300ms).
  Implement filter chips (All · IELTS · TOEIC · Daily · Business).
  Implement sort options (Popular · Newest · Alphabetical).
  Build TopicDetail page (/topics/[slug]) with lesson list
  grouped by section. Implement ProgressIndicator per topic.
  Create "Continue" button for in-progress lessons.

Estimate:     8 hours
Dependencies: T-A-006, T-A-008
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. Topics page loads and displays topics from database
  2. Topic card shows name, icon, lesson count, progress %
  3. Search filters topics in real-time (debounced)
  4. Filter chips filter by category
  5. Sort options change order
  6. Topic detail shows all lessons grouped by section
  7. Completed lessons show checkmark
  8. Progress bar shows correct percentage for logged-in user
  9. "Continue" resumes from last position
  10. Page loads in < 1 second
```

### T-B-006 | Audio Player (Core)

```
Description:
  Build full AudioPlayer component: play/pause, seekable progress bar,
  time display (current / total), skip forward/back 5 seconds,
  playback speed selector (0.5x, 0.75x, 1x, 1.25x, 1.5x),
  loop clip mode, volume control (desktop), mute toggle.
  Implement screen wake lock during playback.
  Handle audio loading states (skeleton, spinner).
  Handle audio error state with retry.
  Implement keyboard shortcuts (Space, arrows, 1-5 for speed).
  Implement touch gestures (swipe to seek, double-tap sides).

Estimate:     16 hours
Dependencies: T-B-004, T-A-007
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. Audio plays and pauses correctly on click
  2. Progress bar updates in real-time during playback
  3. Seeking by click and drag works
  4. All 5 speed options function and persist during playback
  5. Skip forward/back 5 seconds works
  6. Loop clip mode restarts current clip
  7. Audio pauses when tab is backgrounded
  8. Keyboard shortcuts: Space (play/pause), ← → (skip)
  9. Error state with retry button shows on audio fail
  10. Works on Chrome, Safari, Firefox, Edge
  11. Works on iOS Safari and Android Chrome
  12. Loading skeleton shown while audio loads
```

### T-B-007 | Transcript Input Component

```
Description:
  Build TranscriptInput component: auto-growing textarea (min 4 rows),
  real-time word count, paste prevention with tooltip,
  spell-check disabled, clear button, submit button.
  Implement keyboard shortcut (Ctrl/Cmd+Enter).
  Implement loading state during submission.
  Implement mobile keyboard handling (scroll into view).
  Build TranscriptResult component: accuracy score (animated count-up),
  word-level diff display (green/red/gray/orange).
  Build WordDiff component with per-word highlighting.
  Build ScoreDisplay with animated progress ring.

Estimate:     12 hours
Dependencies: T-B-006, T-A-006
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. Textarea accepts input immediately
  2. Word count updates in real-time
  3. Paste is blocked with Vietnamese tooltip
  4. Clear button empties textarea and refocuses
  5. Submit disabled when empty
  6. Ctrl+Enter submits form
  7. Submit button shows loading state
  8. Result panel slides in after submission
  9. Accuracy animates from 0 to value (60fps)
  10. Word diff colors correct (green/red/gray/orange)
  11. Mobile keyboard does not cover textarea
  12. Double-submit prevented (button disabled)
```

### T-B-008 | Transcript Scoring Engine (Backend)

```
Description:
  Build POST /api/listening/check API route.
  Implement LCS-based word alignment algorithm (normalize → tokenize →
  LCS → classify). Implement scoring: accuracy = correct/expected × 100.
  Implement XP calculation (base + bonuses).
  Implement normalization rules (lowercase, trim, strip punctuation,
  handle contractions).
  Implement special case handling (contractions, numbers).
  Return word-level diff results.

Estimate:     8 hours
Dependencies: T-A-002, T-A-008
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. API returns score within 500ms
  2. Algorithm tested with known inputs (10 test cases)
  3. "I was walking" vs "i was walking" → 100% (case-insensitive)
  4. "Hello, world!" vs "hello world" → 100% (punctuation stripped)
  5. "don't" vs "dont" → CORRECT (contraction normalization)
  6. Extra words highlighted correctly
  7. Missing words underlined correctly
  8. XP calculation matches formula (base × 10 + bonuses)
  9. Error responses follow consistent JSON format
  10. Unit test coverage: 80%+ on scoring logic
```

### T-B-009 | Clip Navigation & Lesson Flow

```
Description:
  Build ClipIndicator component (Clip X of Y, progress dots).
  Build LessonPlayer orchestrator (coordinates audio + input + result).
  Implement next/prev clip navigation.
  Implement auto-advance after clip completion.
  Build LessonComplete modal: accuracy summary, XP earned (animated),
  streak indicator, "Bài tiếp theo" CTA, "Về Dashboard" option.
  Implement confetti animation (canvas-confetti).
  Implement session state persistence (resume on return).
  Handle browser close with in-progress warning.

Estimate:     8 hours
Dependencies: T-B-006, T-B-007, T-B-008
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. Clip indicator shows correct position
  2. Next clip loads after current clip completed
  3. Previous clip accessible (if not first)
  4. Progress dots update on clip completion
  5. Lesson complete modal appears after last clip
  6. Confetti plays for 2 seconds
  7. Reduced motion users see fade-only (no confetti)
  8. XP count animates up to earned amount
  9. "Bài tiếp theo" navigates to next lesson
  10. Progress saved to database on lesson complete
  11. Browser close shows confirmation if in-progress
```

### T-B-010 | Lesson Page Integration

```
Description:
  Build full lesson page /listen/[id]: fetches lesson with clips,
  initializes audio player, renders lesson player orchestrator.
  Implement loading state (skeleton).
  Implement error state (retry).
  Implement lesson header (lesson name, topic, progress).
  Connect to progress tracking API.
  Implement back navigation to topic.

Estimate:     6 hours
Dependencies: T-B-005, T-B-006, T-B-009
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. Lesson page loads and displays correct lesson
  2. All clips accessible in order
  3. Audio player initializes with first clip
  4. Progress through clips tracked correctly
  5. Lesson complete triggers progress save
  6. Back button navigates to topic detail
  7. Loading skeleton shown during data fetch
  8. Error state shows retry button
```

### T-B-011 | Voice Recording Component

```
Description:
  Build VoiceRecorder component: microphone permission request flow,
  large record button (72x72px min), recording timer (count up, max 30s),
  live waveform visualizer (AudioContext + AnalyserNode).
  Implement auto-stop at 30 seconds.
  Implement manual stop.
  Implement recorded audio playback.
  Implement re-record button.
  Implement upload to Supabase Storage.
  Handle recording errors gracefully.
  Implement keyboard accessible (Enter to start/stop).

Estimate:     12 hours
Dependencies: T-B-006, T-A-006
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. Record button requests microphone permission
  2. Permission denied shows guide to enable
  3. Timer counts up during recording
  4. Live waveform animates during recording
  5. Recording auto-stops at 30 seconds
  6. Manual stop works
  7. Recorded audio plays back correctly
  8. Re-record resets to recording state
  9. Recording uploads to Supabase Storage
  10. Minimum 1 second enforced (reject shorter)
  11. Works on Chrome, Safari iOS, Android Chrome
  12. Touch targets minimum 44x44px
```

### T-B-012 | Speech Recognition & Scoring (Backend)

```
Description:
  Build POST /api/speech/transcribe API route.
  Implement Web Speech API check and primary flow (Chrome/Edge).
  Implement Supabase Edge Function for Whisper fallback (Safari/Firefox).
  Build pronunciation scoring algorithm: Accuracy × 0.5 +
  Fluency × 0.25 + Completeness × 0.25.
  Implement WPM calculation for fluency.
  Implement rule-based AI pronunciation tips.
  Track usage in user_daily_usage table.
  Implement rate limiting (10/day free, soft gate).

Estimate:     12 hours
Dependencies: T-A-002, T-A-008, T-B-008
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. Chrome uses Web Speech API (no API key needed)
  2. Safari falls back to Whisper API
  3. Transcription returns within 5 seconds
  4. Pronunciation score calculates correctly (0-100)
  5. Fluency component based on WPM (120-160 = 100%)
  6. AI tips display rule-based feedback
  7. Speaking usage tracked in user_daily_usage
  8. Soft gate at 8/10, hard block at 10/10
  9. Error messages in Vietnamese
  10. Unit test coverage: 80%+ on scoring logic
```

### T-B-013 | Speaking Result & Navigation

```
Description:
  Build SpeakingResult component: overall pronunciation score (animated),
  score breakdown (Accuracy · Fluency · Completeness),
  word-by-word marks (correct ⚠️ ❌),
  AI pronunciation tip, recording playback button.
  Build action buttons: "Ghi âm lại", "Tiếp tục", "Bỏ qua".
  Connect to lesson complete flow.
  Update speaking score in database.

Estimate:     6 hours
Dependencies: T-B-011, T-B-012
Priority:    P0
Phase:       B

Acceptance Criteria:
  1. Speaking result shows after transcription
  2. Overall score animates from 0 to value
  3. Breakdown shows 3 components with values
  4. Word marks correct/mispronounced/wrong
  5. AI tip specific and actionable
  6. Recording playback works
  7. "Ghi âm lại" resets to recording state
  8. "Tiếp tục" advances to next clip
  9. "Bỏ qua" advances without recording
  10. Speaking score saved per clip
```

---

## PHASE C: RETENTION & POLISH

---

### T-C-001 | Progress Dashboard

```
Description:
  Build /progress page with StatsCard components (total lessons,
  total time, avg accuracy, streak, level + XP).
  Build WeeklyChart (7-day bar chart via Recharts).
  Build TopicProgress breakdown (per-topic completion %).
  Build XpProgress bar (current / next level).
  Build InsightsCard (recommendation, weekly summary).
  Implement real-time updates on lesson complete.
  Build empty state for new users.

Estimate:     12 hours
Dependencies: T-B-010, T-A-008
Priority:    P0
Phase:       C

Acceptance Criteria:
  1. Dashboard loads and displays all stats
  2. Total lessons count accurate
  3. Total time practiced accurate
  4. Average accuracy correct
  5. Weekly chart shows 7 days, today highlighted
  6. Today's bar highlighted in accent color
  7. XP progress bar accurate
  8. Topic progress breakdown accurate
  9. Stats update in real-time after lesson complete
  10. Empty state encourages first action
  11. Charts responsive on mobile (Recharts responsive container)
```

### T-C-002 | Streak System (Basic)

```
Description:
  Build streak logic: increment on first lesson of day,
  no increment on subsequent lessons, reset after 1+ day gap.
  Implement streak counter in header.
  Implement streak milestone celebrations (7, 30, 100 days).
  Implement XP bonus at milestones.
  Implement streak trigger in database.
  Implement timezone-aware date comparison.

Estimate:     8 hours
Dependencies: T-B-009, T-A-002
Priority:    P0
Phase:       C

Acceptance Criteria:
  1. Streak increments on first lesson of day (only)
  2. Streak does NOT increment on subsequent lessons same day
  3. Streak resets to 0 after 1+ day gap
  4. longest_streak updates when current exceeds it
  5. Header shows 🔥 X ngày
  6. 7-day milestone triggers celebration
  7. 30-day milestone triggers celebration
  8. XP bonus awarded at milestones
  9. Timezone handling correct (user's local date)
  10. Midnight boundary handled correctly
  11. Database trigger fires correctly
```

### T-C-003 | History Module (Basic)

```
Description:
  Build /history page with HistoryList (paginated, 20/page).
  Build HistoryItem row (lesson name, topic, date, accuracy).
  Build HistoryFilters (search, topic filter, accuracy filter).
  Implement search by lesson name (debounced).
  Implement infinite scroll pagination.
  Build /history/[lessonId] detail page with clip breakdown.
  Implement attempt comparison.
  Build re-attempt button.

Estimate:     8 hours
Dependencies: T-A-006, T-A-008, T-B-009
Priority:    P1
Phase:       C

Acceptance Criteria:
  1. History list loads newest first
  2. Infinite scroll loads next page
  3. Search filters results in real-time
  4. Topic filter works
  5. Accuracy filter works (≥60%, ≥80%, 100%)
  6. Lesson detail shows all clips with transcript comparison
  7. Multiple attempts tracked (attempt # badge)
  8. Re-attempt navigates to lesson
  9. Pull-to-refresh updates list
  10. Empty state for new users
  11. Large history (500+ items) performs well
```

### T-C-004 | Dashboard Page

```
Description:
  Build /dashboard page: Welcome message, continue learning section,
  today's goal progress (1/X bài), recommended topics,
  recent activity. Fetch personalized recommendations.
  Connect to all data sources.

Estimate:     6 hours
Dependencies: T-B-003, T-C-001, T-C-002
Priority:    P1
Phase:       C

Acceptance Criteria:
  1. Dashboard shows personalized welcome
  2. Today's goal progress visible
  3. Recommended lessons displayed
  4. Recent lessons accessible
  5. Empty state for new users (first visit)
  6. Stats update after lesson complete
```

### T-C-005 | SEO Setup

```
Description:
  Implement Next.js Metadata API on all pages.
  Add unique meta title + description per page.
  Add Open Graph + Twitter Card tags.
  Add canonical URLs.
  Implement next-sitemap for auto-generated sitemap.xml.
  Add robots.txt (allow public, block /api/).
  Add JSON-LD structured data (WebSite, BreadcrumbList).
  Generate OG image with brand text overlay.

Estimate:     6 hours
Dependencies: T-B-002, T-B-005
Priority:    P1
Phase:       C

Acceptance Criteria:
  1. Landing page: Title, description, OG, Twitter tags present
  2. Topic pages: Unique title and description per topic
  3. sitemap.xml contains all public pages
  4. sitemap.xml auto-updates with new topics
  5. robots.txt blocks /api/ routes
  6. JSON-LD validates in Google Rich Results Test
  7. OG image: 1200x630px, displays correctly
  8. Canonical URL correct on all pages
```

### T-C-006 | Analytics Setup

```
Description:
  Configure Vercel Analytics.
  Set up Google Analytics 4 with events:
  lesson_started, lesson_completed, lesson_abandoned,
  speaking_attempted, speaking_completed, signup_completed,
  onboarding_completed, error_occurred.
  Set up user properties (level, streak).
  Configure Google Search Console.

Estimate:     4 hours
Dependencies: T-B-001, T-B-003, T-C-001
Priority:    P1
Phase:       C

Acceptance Criteria:
  1. Vercel Analytics dashboard shows data
  2. GA4 receives page view events
  3. Custom events fire correctly
  4. User properties set on signup
  5. Search Console connected and receiving data
```

### T-C-007 | PWA Setup (Basic)

```
Description:
  Create manifest.json with app name, icons, theme color (#35375B),
  display: standalone. Create app icons (SVG + PNG variants).
  Configure meta viewport and theme-color.
  Test "Add to Home Screen" on iOS Safari and Android Chrome.

Estimate:     4 hours
Dependencies: T-B-002
Priority:    P1
Phase:       C

Acceptance Criteria:
  1. manifest.json valid and complete
  2. App icons render at all sizes
  3. "Add to Home Screen" works on Android Chrome
  4. "Add to Home Screen" works on iOS Safari
  5. Standalone mode activates (no browser chrome)
  6. Theme color matches design system
```

---

## PHASE D: QA & LAUNCH

---

### T-D-001 | Unit Tests (Scoring Logic)

```
Description:
  Write Vitest unit tests for:
  - Transcript comparison algorithm (LCS)
  - Scoring calculation (accuracy, XP)
  - Pronunciation scoring (accuracy, fluency, completeness)
  - XP level thresholds
  - Streak increment/reset logic
  - Date normalization (timezone)
  - Zod validation schemas

Estimate:     8 hours
Dependencies: T-B-008, T-B-012, T-C-002
Priority:    P0
Phase:       D

Acceptance Criteria:
  1. 80%+ coverage on scoring logic
  2. 80%+ coverage on streak logic
  3. All known edge cases covered (empty, 100%, 0%, etc.)
  4. All tests pass in < 30 seconds
  5. LCS algorithm tested with 10+ known inputs
```

### T-D-002 | Integration Tests

```
Description:
  Write integration tests for:
  - Auth flow: Register → Login → Logout
  - API: Topics endpoint returns data
  - API: Listening check scores correctly
  - API: Speaking score calculates correctly
  - API: Progress dashboard aggregates correctly
  - API: History pagination works

Estimate:     8 hours
Dependencies: T-B-001, T-B-008, T-B-012, T-C-001
Priority:    P0
Phase:       D

Acceptance Criteria:
  1. Auth flow end-to-end works
  2. All API endpoints return correct data
  3. Scoring integration produces correct results
  4. Dashboard aggregation correct
  5. All tests pass in < 60 seconds
```

### T-D-003 | E2E Tests (Playwright)

```
Description:
  Write Playwright E2E tests for critical user flows:
  - User registers and completes onboarding
  - User browses topics and selects lesson
  - User completes full lesson (audio → transcript → score → complete)
  - User records and submits speaking
  - User views dashboard and history
  - Mobile flow (320px viewport)
  - Error recovery (network error, retry)

Estimate:     12 hours
Dependencies: T-B-001, T-B-002, T-B-003, T-B-009, T-B-011
Priority:    P0
Phase:       D

Acceptance Criteria:
  1. All critical flows pass E2E
  2. Mobile viewport (320px) tested
  3. Error flows tested (retry, recovery)
  4. All tests pass in < 5 minutes
  5. Tests run in CI on every PR
```

### T-D-004 | Cross-Browser & Accessibility Audit

```
Description:
  Manual testing across browsers: Chrome, Safari, Firefox, Edge.
  Manual testing on mobile devices: iPhone, Android.
  Accessibility audit: keyboard navigation, focus visible,
  color contrast (WCAG AA), screen reader.
  Fix all P0 and P1 accessibility issues found.

Estimate:     8 hours
Dependencies: T-B-006, T-B-011, T-C-001
Priority:    P0
Phase:       D

Acceptance Criteria:
  1. Chrome desktop: All features work
  2. Safari desktop: All features work
  3. Firefox desktop: All features work
  4. Edge desktop: All features work
  5. Safari iOS: Audio + Recording functional
  6. Android Chrome: Audio + Recording functional
  7. All interactive elements keyboard accessible
  8. Focus visible on all interactive elements
  9. Color contrast: WCAG AA compliant
  10. prefers-reduced-motion respected
```

### T-D-005 | Performance Optimization

```
Description:
  Run Lighthouse audit. Optimize:
  - Route-based code splitting (Next.js dynamic imports)
  - Image optimization (Next.js Image component)
  - Font optimization (font-display: swap, preload)
  - Audio preload for first clip
  - Bundle size reduction (tree shaking)
  - CLS prevention (reserve space for dynamic content)
  - LCP optimization (above-the-fold content priority)

Estimate:     8 hours
Dependencies: T-B-002, T-B-006
Priority:    P0
Phase:       D

Acceptance Criteria:
  1. Lighthouse Performance > 85
  2. Lighthouse Accessibility > 90
  3. Lighthouse SEO > 90
  4. Lighthouse Best Practices > 90
  5. Bundle size < 200KB initial JS
  6. LCP < 2.5s
  7. CLS < 0.1
  8. TTI < 3.5s
```

### T-D-006 | Security Audit

```
Description:
  Manual security review:
  - Test RLS policies (user A cannot access user B data)
  - Test SQL injection (all user inputs parameterized)
  - Test XSS (no innerHTML with user content)
  - Test CSRF (state-changing ops protected)
  - Verify HTTPS enforced
  - Verify no secrets in client bundle
  - Review environment variables (not committed)
  - Verify rate limiting works

Estimate:     6 hours
Dependencies: T-B-001, T-B-008, T-C-002
Priority:    P0
Phase:       D

Acceptance Criteria:
  1. RLS: User A cannot read user B's progress
  2. RLS: User A cannot modify user B's data
  3. No SQL injection vulnerabilities
  4. No XSS vulnerabilities
  5. HTTPS enforced on all routes
  6. No secrets in client bundle
  7. Environment variables not in git
  8. Rate limiting enforced on API endpoints
```

### T-D-007 | Legal & Compliance

```
Description:
  Write Privacy Policy page (in Vietnamese): data collected, usage,
  retention, rights (export/delete). Write Terms of Service page.
  Configure cookie consent banner (if analytics cookies used).
  Implement account deletion flow (30-day process).
  Verify data retention (recordings 90 days).

Estimate:     6 hours
Dependencies: T-B-001
Priority:    P0
Phase:       D

Acceptance Criteria:
  1. Privacy policy page accessible at /privacy
  2. Terms of service accessible at /terms
  3. Privacy policy covers all required items (data collected,
     usage, retention, rights)
  4. Account deletion flow works (30-day process)
  5. Cookie consent banner appears for EU users (if applicable)
```

### T-D-008 | Production Launch

```
Description:
  Final production deployment.
  Verify production URL accessible.
  Verify SSL certificate active.
  Verify database migrations applied.
  Verify all API endpoints functional.
  Set up uptime monitoring.
  Create launch announcement.
  Notify email list (if pre-launch list exists).
  Monitor error rates for first 48 hours.
  Create rollback plan.

Estimate:     4 hours
Dependencies: T-D-001, T-D-002, T-D-003, T-D-004, T-D-005, T-D-006, T-D-007
Priority:    P0
Phase:       D

Acceptance Criteria:
  1. Production deployment verified
  2. Database migrations applied and verified
  3. SSL certificate valid
  4. All API endpoints respond correctly
  5. Uptime monitoring active
  6. Error rate < 1% in first 48 hours
  7. No P0 bugs in production
  8. Rollback plan documented and tested
```

---

## BACKLOG SUMMARY TABLE

```
┌────────┬─────────────────────────────────────────────┬──────────┬────────────┬──────────┐
│ ID     │ Task                                         │ Estimate │ Dependency │ Priority │
├────────┼─────────────────────────────────────────────┼──────────┼────────────┼──────────┤
│ T-A-001│ Project Setup                                │    4h   │ —          │ P0       │
│ T-A-002│ Supabase & Database Schema                  │    8h   │ T-A-001    │ P0       │
│ T-A-003│ Supabase Client Setup (SSR)                 │    4h   │ T-A-001,2  │ P0       │
│ T-A-004│ Design System Setup                          │    6h   │ T-A-001    │ P0       │
│ T-A-005│ Data Ingestion (Crawler → Supabase)         │    8h   │ T-A-002    │ P0       │
│ T-A-006│ Base UI Components                           │   12h   │ T-A-001,4  │ P0       │
│ T-A-007│ Zustand Store Setup                          │    6h   │ T-A-001,3  │ P0       │
│ T-A-008│ TanStack Query Setup                         │    4h   │ T-A-001,3  │ P0       │
│ T-A-009│ Error Boundary & Global Error Handling       │    4h   │ T-A-001,6  │ P1       │
│ T-A-010│ Vercel Deployment & CI/CD                   │    4h   │ T-A-001,2,3│ P0       │
├────────┼─────────────────────────────────────────────┼──────────┼────────────┼──────────┤
│ T-B-001│ Authentication Pages & Flows                  │    8h   │ T-A-003,6,7│ P0       │
│ T-B-002│ Landing Page                                  │   12h   │ T-A-004,6,8│ P0       │
│ T-B-003│ Onboarding Wizard                             │    8h   │ T-B-001,6,7│ P0       │
│ T-B-004│ App Shell & Navigation                        │    8h   │ T-A-004,6,7│ P0       │
│ T-B-005│ Topics & Lesson Listing                       │    8h   │ T-A-006,8  │ P0       │
│ T-B-006│ Audio Player (Core)                           │   16h   │ T-B-004,7  │ P0       │
│ T-B-007│ Transcript Input Component                     │   12h   │ T-B-006,6  │ P0       │
│ T-B-008│ Transcript Scoring Engine (Backend)             │    8h   │ T-A-002,8  │ P0       │
│ T-B-009│ Clip Navigation & Lesson Flow                  │    8h   │ T-B-006,7,8│ P0       │
│ T-B-010│ Lesson Page Integration                       │    6h   │ T-B-005,6,9│ P0       │
│ T-B-011│ Voice Recording Component                     │   12h   │ T-B-006,6  │ P0       │
│ T-B-012│ Speech Recognition & Scoring (Backend)          │   12h   │ T-A-002,8,8│ P0       │
│ T-B-013│ Speaking Result & Navigation                   │    6h   │ T-B-011,12 │ P0       │
├────────┼─────────────────────────────────────────────┼──────────┼────────────┼──────────┤
│ T-C-001│ Progress Dashboard                            │   12h   │ T-B-010,8  │ P0       │
│ T-C-002│ Streak System (Basic)                         │    8h   │ T-B-009,2  │ P0       │
│ T-C-003│ History Module (Basic)                         │    8h   │ T-A-006,8,9│ P1       │
│ T-C-004│ Dashboard Page                                │    6h   │ T-B-003,1,2│ P1       │
│ T-C-005│ SEO Setup                                     │    6h   │ T-B-002,5  │ P1       │
│ T-C-006│ Analytics Setup                                │    4h   │ T-B-001,3,1│ P1       │
│ T-C-007│ PWA Setup (Basic)                             │    4h   │ T-B-002    │ P1       │
├────────┼─────────────────────────────────────────────┼──────────┼────────────┼──────────┤
│ T-D-001│ Unit Tests (Scoring Logic)                    │    8h   │ T-B-008,12,2│ P0       │
│ T-D-002│ Integration Tests                              │    8h   │ T-B-001,8,12,1│ P0      │
│ T-D-003│ E2E Tests (Playwright)                       │   12h   │ T-B-001,2,3,9,11│ P0    │
│ T-D-004│ Cross-Browser & Accessibility Audit          │    8h   │ T-B-006,11,1│ P0       │
│ T-D-005│ Performance Optimization                      │    8h   │ T-B-002,6  │ P0       │
│ T-D-006│ Security Audit                                │    6h   │ T-B-001,8,2 │ P0       │
│ T-D-007│ Legal & Compliance                            │    6h   │ T-B-001    │ P0       │
│ T-D-008│ Production Launch                             │    4h   │ T-D-001..7 │ P0       │
└────────┴─────────────────────────────────────────────┴──────────┴────────────┴──────────┘

P0 Tasks:   35 tasks  |  220 hours
P1 Tasks:   7 tasks  |   44 hours
─────────────────────────────
TOTAL:     42 tasks |  264 hours

At 20h/week (part-time founder): ~13 weeks
At 40h/week (full-time):        ~6.5 weeks
```

---

## SPRINT PLANNING SUGGESTION

```
WEEK 1-2: Infrastructure Sprint
  T-A-001 → T-A-010 (Infrastructure)
  Goal: Running project on Vercel, database schema, design system

WEEK 3-4: Foundation Sprint
  T-B-001 → T-B-004 (Auth + Landing + Onboarding + Nav)
  Goal: User can register, login, see landing, complete onboarding

WEEK 5-7: Core Loop Sprint
  T-B-005 → T-B-013 (Topics → Lesson → Audio → Transcript → Scoring → Recording → Speech)
  Goal: Full listen → speak → score loop working

WEEK 8-9: Retention Sprint
  T-C-001 → T-C-007 (Progress + Streak + History + SEO + Analytics)
  Goal: Dashboard, streak, history, launch readiness

WEEK 10-11: Testing Sprint
  T-D-001 → T-D-007 (Unit + Integration + E2E + Audit)
  Goal: All tests pass, security verified, accessibility verified

WEEK 12: Launch Sprint
  T-D-008 (Production Launch)
  Goal: Live on production
```

---

*Document End — VinaListen Development Task Backlog v1.0*
