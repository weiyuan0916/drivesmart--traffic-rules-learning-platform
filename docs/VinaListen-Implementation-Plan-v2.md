# VinaListen — Implementation Plan (Detailed)
## Phase A · Phase B · Phase C · Phase D

**Date:** 2026-06-07  
**Version:** 2.0  
**Based on:** PRD v1.0 · UX Spec · Feature Spec · Technical Design

---

## STRATEGIC SUMMARY

### MVP Scope

```
CORE LOOP (MVP):
  Landing → Onboarding → Topics → Lesson → Audio → Transcript →
  Check → Score → Record → Speech → Pronunciation Score →
  History → Progress → Streak

OUT OF SCOPE (Phase 2+):
  Reading module, Writing, Premium features, AI Coach,
  Leaderboard advanced, Offline mode, Certificates,
  Spaced repetition, Blog/Content
```

### Tech Stack

```
Frontend:    Next.js 14 App Router + TypeScript + Tailwind CSS v4
State:      TanStack Query + Zustand + React Hook Form + Zod
Backend:     Next.js Route Handlers + Supabase (PostgreSQL + Auth + Storage)
Speech:     Web Speech API (primary) + Whisper API (fallback)
Animations: Framer Motion
Charts:     Recharts
Testing:    Vitest + React Testing Library + Playwright
Hosting:    Vercel
```

---

## PHASE A: FOUNDATION & INFRASTRUCTURE

**Timeline:** Day 1 – Day 10  
**Goal:** Có project chạy được, database schema, auth, landing page cơ bản

### A.1 Project Setup

#### Deliverables

```
✅ Next.js 14 project với App Router
✅ TypeScript strict mode enabled
✅ Tailwind CSS v4 configured
✅ ESLint + Prettier configured
✅ TanStack Query setup
✅ Zustand store setup
✅ Framer Motion setup
✅ Recharts setup
✅ React Hook Form + Zod setup
✅ Project deployed to Vercel (blank shell)
✅ Environment variables configured
✅ Git branch strategy (main + dev)
```

#### Files Created

```
vinalisten/
├── app/
│   ├── layout.tsx                  # Root layout (providers)
│   ├── page.tsx                   # Placeholder landing
│   └── globals.css                # CSS variables + base styles
│
├── components/
│   └── ui/                        # (empty, to fill in Phase B)
│
├── lib/
│   ├── api/
│   │   └── client.ts
│   ├── hooks/
│   │   └── useQueryClient.ts
│   ├── store/
│   │   └── index.ts               # Zustand stores (placeholder)
│   └── utils/
│       └── cn.ts
│
├── types/
│   └── index.ts                   # Shared types
│
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

#### Dependencies

```
npm install:
  next@14 react react-dom typescript
  tailwindcss@4 @tailwindcss/vite
  eslint prettier
  @tanstack/react-query zustand
  framer-motion recharts
  react-hook-form @hookform/resolvers zod
  clsx tailwind-merge
  lucide-react

npm install -D:
  @types/react @types/node
  vitest @testing-library/react @testing-library/user-event
  @playwright/test
  eslint-config-next
  prettier-plugin-tailwindcss
```

#### Test Cases

```
TC-A.1.1: Project builds without errors
TC-A.1.2: TypeScript passes with zero errors
TC-A.1.3: ESLint passes with zero warnings
TC-A.1.4: Dev server starts on port 3000
TC-A.1.5: Page loads in browser without console errors
TC-A.1.6: Tailwind CSS applies correctly
TC-A.1.7: TanStack Query devtools visible in development
TC-A.1.8: Zustand store accessible from components
TC-A.1.9: Framer Motion animations work
TC-A.1.10: Vercel preview deployment succeeds
TC-A.1.11: .env.example contains all required keys
TC-A.1.12: Git hooks (pre-commit) run successfully
```

#### Acceptance Criteria

```
AC-A.1: Blank Next.js app builds with `npm run build` in < 3 minutes
AC-A.1: Zero TypeScript errors (tsc --noEmit)
AC-A.1: Zero ESLint errors/warnings
AC-A.1: Landing page renders at / with placeholder content
AC-A.1: App is deployable to Vercel
AC-A.1: All environment variables documented in .env.example
```

---

### A.2 Database & Supabase Setup

#### Deliverables

```
✅ Supabase project created
✅ All 8 database tables created with proper constraints
✅ Database indexes created for performance
✅ Row Level Security (RLS) policies configured
✅ Database triggers created (updated_at, streak, daily_activity)
✅ Supabase Auth configured (email + Google OAuth)
✅ Supabase Storage bucket created for recordings
✅ Storage policies configured (public read for audio, private for recordings)
✅ Database migration file generated
✅ Supabase types generated (supabase gen types)
```

#### Files Created

```
supabase/
├── migrations/
│   └── 001_initial_schema.sql     # All tables + indexes + triggers + RLS
├── functions/
│   └── speech-transcribe/
│       └── index.ts               # Whisper Edge Function
└── config.toml

lib/
├── supabase/
│   ├── client.ts                  # createBrowserClient
│   ├── server.ts                 # createServerClient
│   ├── middleware.ts             # Auth middleware
│   └── types.ts                  # Generated Supabase types
```

#### SQL Tables Created

```
topics
lessons
lesson_clips
users (auth.users extended)
user_progress
user_clip_progress
daily_activity
vocabulary_learning
user_notifications
user_settings
```

#### Test Cases

```
TC-A.2.1: Supabase project accessible
TC-A.2.2: All 8 tables created with correct columns
TC-A.2.3: Primary keys set on all tables
TC-A.2.4: Foreign key constraints enforced
TC-A.2.5: Indexes created on queried columns
TC-A.2.6: RLS policies block cross-user data access
TC-A.2.7: Public can read topics/lessons/clips
TC-A.2.8: Users can only read/write own data
TC-A.2.9: updated_at trigger fires on UPDATE
TC-A.2.10: Streak trigger increments on lesson complete
TC-A.2.11: daily_activity upsert trigger works
TC-A.2.12: Auth signup creates user record
TC-A.2.13: Google OAuth flow completes successfully
TC-A.2.14: Storage bucket created for recordings
TC-A.2.15: Supabase types generate without errors
TC-A.2.16: Migration file runs on fresh database
```

#### Acceptance Criteria

```
AC-A.2: All database tables exist with correct schema
AC-A.2: RLS prevents user A from accessing user B's data
AC-A.2: Auth flows (email + Google OAuth) work end-to-end
AC-A.2: Database triggers fire correctly on inserts/updates
AC-A.2: Storage bucket accepts uploads
AC-A.2: Generated types compile without errors
AC-A.2: Migration is idempotent (can run multiple times safely)
```

---

### A.3 Data Ingestion (Crawler → Supabase)

#### Deliverables

```
✅ Migration script from crawler JSON → Supabase
✅ All existing topic data ingested
✅ All existing lesson data ingested
✅ All existing clip data ingested
✅ All existing audio URLs mapped
✅ Audio files accessible from Supabase Storage
✅ Data integrity verified (counts, relationships)
✅ Re-ingestion script created (for future updates)
```

#### Files Created

```
scripts/
├── migrate-data.ts                # Main migration script
├── validate-data.ts              # Integrity validation
└── audio-uploader.ts             # Upload local audio to Supabase Storage

supabase/
└── migrations/
    └── 002_seed_data.sql         # Initial data import (optional)
```

#### Test Cases

```
TC-A.3.1: Migration script connects to Supabase
TC-A.3.2: Topics ingest without duplicates (slug unique)
TC-A.3.3: Lessons ingest with correct topic_id FK
TC-A.3.4: Clips ingest with correct lesson_id FK
TC-A.3.5: Audio URLs are valid and accessible
TC-A.3.6: Vocabulary data ingested per lesson
TC-A.3.7: Count validation: topics = X, lessons = Y, clips = Z
TC-A.3.8: Re-ingestion does not create duplicates
TC-A.3.9: Missing data (no audio, no transcript) handled gracefully
TC-A.3.10: Migration rollback script works
```

#### Acceptance Criteria

```
AC-A.3: All crawled data loaded into Supabase
AC-A.3: No duplicate records (unique constraints respected)
AC-A.3: All foreign key relationships intact
AC-A.3: Audio URLs point to valid files
AC-A.3: Data counts match source crawler output
AC-A.3: Re-ingestion is safe (no data corruption)
```

---

### A.4 Authentication (Full Auth Flow)

#### Deliverables

```
✅ Login page (/auth/login)
✅ Register page (/auth/register)
✅ OAuth callback handler (/auth/callback)
✅ Auth context + useAuth hook
✅ Protected route middleware
✅ Auth layout (/auth/layout.tsx)
✅ Session management
✅ Logout functionality
✅ Supabase client properly configured (SSR-safe)
```

#### Files Created

```
app/
├── auth/
│   ├── layout.tsx                 # Auth layout (centered, minimal)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── callback/
│       └── route.ts               # OAuth callback
│
├── (app)/
│   └── layout.tsx                 # Protected app layout

components/
├── auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── OAuthButton.tsx
│   └── AuthDivider.tsx

lib/
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   └── useSession.ts
│
└── services/
    └── authService.ts

middleware.ts                       # Root middleware for auth redirects
```

#### Test Cases

```
TC-A.4.1: User can register with email + password
TC-A.4.2: User can login with email + password
TC-A.4.3: Google OAuth login works (redirect + callback)
TC-A.4.4: Session persists across page refresh
TC-A.4.5: Protected routes redirect to login when unauthenticated
TC-A.4.6: Logged-in user redirected away from /auth/login
TC-A.4.7: Invalid credentials show error message
TC-A.4.8: Duplicate email registration shows error
TC-A.4.9: Logout clears session and redirects to login
TC-A.4.10: Token refresh works automatically
TC-A.4.11: Expired token redirects to login
TC-A.4.12: SSR auth works correctly (no hydration mismatch)
TC-A.4.13: Auth state accessible from any component
TC-A.4.14: Google OAuth works on mobile Safari
```

#### Acceptance Criteria

```
AC-A.4: Email/password registration creates user
AC-A.4: Email/password login returns valid session
AC-A.4: Google OAuth completes full flow
AC-A.4: Protected pages inaccessible without auth
AC-A.4: No hydration mismatches with auth state
AC-A.4: Error messages are user-friendly (Vietnamese)
AC-A.4: Loading states shown during auth operations
```

---

### A.5 Landing Page

#### Deliverables

```
✅ Hero section with headline, subheadline, CTA
✅ Mini demo (animated GIF or short video loop)
✅ Social proof stats (X bài học, Y người học)
✅ "How It Works" section (3 steps)
✅ Features section (4 cards)
✅ Topics preview section (4-6 topics)
✅ Testimonials section (carousel, mobile swipeable)
✅ FAQ section (accordion, 5-6 questions)
✅ Final CTA section
✅ Footer (About, Privacy, Terms, Social)
✅ Responsive (mobile / tablet / desktop)
✅ SEO meta tags (title, description, OG, Twitter Card)
```

#### Files Created

```
app/
├── (marketing)/                   # Route group for public pages
│   ├── layout.tsx                 # Marketing layout (no auth nav)
│   └── page.tsx                   # Landing page
│
├── layout.tsx                     # Root layout (providers)
└── not-found.tsx

components/
├── landing/
│   ├── HeroSection.tsx
│   ├── HowItWorksSection.tsx
│   ├── FeaturesSection.tsx
│   ├── TopicsPreviewSection.tsx
│   ├── TestimonialsSection.tsx
│   ├── FaqSection.tsx
│   ├── FinalCTASection.tsx
│   └── LandingFooter.tsx
│
└── layout/
    └── MarketingNav.tsx
```

#### Test Cases

```
TC-A.5.1: Hero section renders on desktop and mobile
TC-A.5.2: CTA button links to /auth/register
TC-A.5.3: Mini demo loops smoothly (no pause/flicker)
TC-A.5.4: Social proof stats display
TC-A.5.5: "How It Works" section renders 3 steps
TC-A.5.6: Feature cards display with icons
TC-A.5.7: Topics preview shows real topics from database
TC-A.5.8: Testimonials carousel works (swipe on mobile, click on desktop)
TC-A.5.9: FAQ accordion expands/collapses
TC-A.5.10: Footer links work
TC-A.5.11: Page renders without horizontal scroll at any breakpoint
TC-A.5.12: 320px viewport: layout stacks correctly
TC-A.5.13: 768px viewport: 2-column grid works
TC-A.5.14: 1024px+ viewport: full layout renders
TC-A.5.15: Page loads in < 3 seconds (3G)
TC-A.5.16: SEO: Title tag present
TC-A.5.17: SEO: Meta description present
TC-A.5.18: SEO: Open Graph tags present
TC-A.5.19: SEO: Twitter Card tags present
TC-A.5.20: No layout shift on load
TC-A.5.21: Animations respect prefers-reduced-motion
TC-A.5.22: All links are keyboard-navigable
TC-A.5.23: Focus visible on all interactive elements
```

#### Acceptance Criteria

```
AC-A.5: Landing page loads in < 3s on 3G
AC-A.5: All sections render at all breakpoints (320px → 1440px)
AC-A.5: No horizontal overflow at any viewport
AC-A.5: SEO meta tags present and correct
AC-A.5: CTA click-through rate testable (links to /auth/register)
AC-A.5: Accessibility: WCAG AA contrast, keyboard navigation, screen reader
AC-A.5: Lighthouse Performance > 90 (after optimization)
AC-A.5: Mobile-first: loads and renders correctly on mobile first
```

---

### A.6 Onboarding Flow

#### Deliverables

```
✅ Onboarding wizard (3 steps)
✅ Step 1: Goal selection (IELTS/TOEIC/Daily/Business)
✅ Step 2: Level assessment (Beginner/Intermediate/Advanced)
✅ Step 3: Topic recommendation
✅ Progress dots indicator
✅ Skip option available
✅ Onboarding completion flag saved to user profile
✅ Redirect to first recommended lesson on completion
✅ Re-onboarding prevention (completed users skip)
```

#### Files Created

```
app/
├── (marketing)/                   # Onboarding after register
│   └── onboarding/
│       └── page.tsx
│
components/
└── onboarding/
    ├── OnboardingFlow.tsx
    ├── GoalStep.tsx
    ├── LevelStep.tsx
    └── TopicSuggestStep.tsx
```

#### Test Cases

```
TC-A.6.1: Onboarding shows after first registration
TC-A.6.2: Step 1 displays 5 goal options
TC-A.6.3: User can select only one goal
TC-A.6.4: Progress dots show current step
TC-A.6.5: "Tiếp theo" advances to next step
TC-A.6.6: "Quay lại" goes to previous step
TC-A.6.7: Skip button visible and functional
TC-A.6.8: Onboarding completion saved to user profile
TC-A.6.9: Completed users see dashboard, not onboarding
TC-A.6.10: Topic recommended based on selected goal
TC-A.6.11: "Bắt đầu học" navigates to lesson
TC-A.6.12: "Xem tất cả" navigates to /topics
```

#### Acceptance Criteria

```
AC-A.6: Onboarding completes in < 2 minutes
AC-A.6: User selection saved and reflected in profile
AC-A.6: Skip option works (not forced)
AC-A.6: Completed users never see onboarding again
AC-A.6: Goal affects topic recommendations
AC-A.6: Mobile: Wizard is single-column, swipe-friendly
```

---

## PHASE B: CORE LISTENING + SPEAKING LOOP

**Timeline:** Day 11 – Day 25  
**Goal:** User có thể hoàn thành full learning loop

### B.1 App Shell & Navigation

#### Deliverables

```
✅ App layout wrapper (Header + BottomNav)
✅ Desktop top navigation (/topics, /progress, /history)
✅ Mobile bottom tab bar (Home, Topics, Progress, Me)
✅ Sticky mini audio player (bottom of screen)
✅ Responsive navigation switching (mobile ↔ desktop)
✅ Auth-aware navigation (logged in vs logged out)
✅ User avatar + dropdown menu
✅ Streak counter in header
```

#### Files Created

```
components/
├── layout/
│   ├── AppShell.tsx
│   ├── Header.tsx
│   ├── HeaderNav.tsx             # Desktop nav
│   ├── BottomNav.tsx             # Mobile bottom bar
│   ├── MobileNav.tsx
│   └── PageContainer.tsx
│
├── audio/
│   └── MiniPlayer.tsx             # Sticky bottom player

app/
├── (app)/
│   ├── layout.tsx                 # App shell with nav
│   └── dashboard/
│       └── page.tsx               # Main dashboard
│
└── layout.tsx                     # Root layout
```

#### Test Cases

```
TC-B.1.1: Desktop: Top nav visible, bottom nav hidden
TC-B.1.2: Mobile: Bottom nav visible, top nav minimal
TC-B.1.3: All nav items link to correct pages
TC-B.1.4: Active page highlighted in nav
TC-B.1.5: User avatar shows correct image or initials
TC-B.1.6: Avatar dropdown shows: Profile, Settings, Logout
TC-B.1.7: Streak counter displays correct number
TC-B.1.8: Mini player appears when audio is playing
TC-B.1.9: Mini player controls work (play/pause, skip)
TC-B.1.10: Nav transitions smoothly between breakpoints
TC-B.1.11: Keyboard navigation works through nav items
TC-B.1.12: Screen reader announces nav items correctly
TC-B.1.13: Mobile: Bottom nav above device keyboard
TC-B.1.14: Mini player does not overlap bottom nav
```

#### Acceptance Criteria

```
AC-B.1: Navigation works on all breakpoints
AC-B.1: No layout breaks at 320px, 768px, 1024px, 1440px
AC-B.1: Active route highlighted
AC-B.1: Mini player functional and accessible
AC-B.1: Auth state reflected in nav (avatar vs login button)
```

---

### B.2 Topic & Lesson Selection

#### Deliverables

```
✅ Topics listing page (/topics)
✅ Topic card grid (desktop) / list (mobile)
✅ Search bar (realtime, debounced)
✅ Filter chips (All, IELTS, TOEIC, Daily, Business)
✅ Sort options (Popular, Newest, Alphabetical)
✅ Topic detail page (/topics/[slug])
✅ Lesson list grouped by section
✅ Progress bar per topic (% completed)
✅ "Continue" button for in-progress lessons
✅ "Next lesson" recommendation
✅ Locked lesson indicators (future)
```

#### Files Created

```
app/
├── (app)/
│   ├── topics/
│   │   ├── page.tsx               # Topics listing
│   │   └── [slug]/
│   │       └── page.tsx           # Topic detail + lessons
│
components/
├── topics/
│   ├── TopicCard.tsx
│   ├── TopicRow.tsx
│   ├── TopicSearch.tsx
│   ├── TopicFilter.tsx
│   ├── TopicGrid.tsx
│   └── ProgressIndicator.tsx
│
├── lesson/
│   ├── LessonCard.tsx
│   └── LessonHeader.tsx

lib/
├── hooks/
│   ├── useTopics.ts
│   └── useTopic.ts
│
└── services/
    └── topicService.ts
```

#### Test Cases

```
TC-B.2.1: Topics page loads and displays topics
TC-B.2.2: Topic card shows name, icon, lesson count, progress
TC-B.2.3: Search filters topics in real-time (debounced 300ms)
TC-B.2.4: Filter chips filter by category
TC-B.2.5: Sort options change order
TC-B.2.6: Tapping topic card navigates to /topics/[slug]
TC-B.2.7: Topic detail page shows all lessons
TC-B.2.8: Lessons grouped by section (Part 1, Part 2...)
TC-B.2.9: Completed lessons show checkmark + accuracy
TC-B.2.10: Current lesson highlighted
TC-B.2.11: Progress bar shows correct percentage
TC-B.2.12: "Continue" button resumes from last position
TC-B.2.13: Tapping lesson navigates to /listen/[id]
TC-B.2.14: Back navigation works
TC-B.2.15: Unauthenticated user sees topics without progress
TC-B.2.16: Empty search shows "No results" state
TC-B.2.17: Page renders at 320px without horizontal scroll
TC-B.2.18: Skeleton loading state shown while fetching
TC-B.2.19: Error state shown if fetch fails
TC-B.2.20: API returns topics within 500ms
```

#### Acceptance Criteria

```
AC-B.2: Topics page loads in < 1 second
AC-B.2: Search responsive (debounced, no lag)
AC-B.2: Filters apply immediately
AC-B.2: Progress reflects actual user data (if logged in)
AC-B.2: All breakpoints render correctly
AC-B.2: Empty states handled gracefully
```

---

### B.3 Audio Player (Listening Module)

#### Deliverables

```
✅ Audio player UI (play/pause, seek bar, time display)
✅ Playback speed selector (0.5x, 0.75x, 1x, 1.25x, 1.5x)
✅ Skip forward/backward 5 seconds
✅ Loop clip mode
✅ Loop all clips mode
✅ Volume control (desktop)
✅ Mute toggle
✅ Keep screen awake during playback
✅ Audio loading states (skeleton, spinner)
✅ Audio error state with retry
✅ Keyboard shortcuts (Space, arrows, 1-5)
✅ Touch gestures (swipe to seek, double-tap sides)
✅ Accessible controls (aria-labels)
```

#### Files Created

```
app/
└── (app)/
    └── listen/
        └── [id]/
            └── page.tsx

components/
└── audio/
    ├── AudioPlayer.tsx
    ├── AudioControls.tsx
    ├── ProgressTrack.tsx
    ├── SpeedSelector.tsx
    ├── VolumeControl.tsx
    ├── LoopControls.tsx
    └── Waveform.tsx

lib/
├── hooks/
│   ├── useAudioPlayer.ts
│   └── useAudioElement.ts
│
└── services/
    └── lessonService.ts
```

#### Test Cases

```
TC-B.3.1: Audio plays when play button tapped
TC-B.3.2: Audio pauses when pause button tapped
TC-B.3.3: Progress bar updates in real-time
TC-B.3.4: Seeking by tapping progress bar works
TC-B.3.5: Seeking by dragging progress bar thumb works
TC-B.3.6: Skip back 5 seconds works
TC-B.3.7: Skip forward 5 seconds works
TC-B.3.8: All 5 speed options function
TC-B.3.9: Speed selection persists during playback
TC-B.3.10: Loop clip mode restarts current clip
TC-B.3.11: Loop all mode restarts lesson
TC-B.3.12: Volume slider adjusts audio level
TC-B.3.13: Mute toggle works
TC-B.3.14: Space bar toggles play/pause
TC-B.3.15: Arrow keys skip forward/backward
TC-B.3.16: Number keys set playback speed
TC-B.3.17: Mobile: Swipe left/right seeks
TC-B.3.18: Mobile: Double-tap sides skips
TC-B.3.19: Screen stays awake during playback
TC-B.3.20: Audio loads and plays on mobile Safari
TC-B.3.21: Audio loads and plays on mobile Chrome
TC-B.3.22: Loading spinner shown while audio loads
TC-B.3.23: Error state shown if audio fails to load
TC-B.3.24: Retry button reloads audio
TC-B.3.25: Fallback audio URL tried if primary fails
TC-B.3.26: Audio pauses when tab is backgrounded
TC-B.3.27: Audio resumes when tab is foregrounded
TC-B.3.28: No memory leaks on long playback
TC-B.3.29: aria-labels present on all controls
TC-B.3.30: Focus order correct for keyboard nav
```

#### Acceptance Criteria

```
AC-B.3: Audio playback works on Chrome, Safari, Firefox, Edge
AC-B.3: All 5 speed options functional
AC-B.3: Keyboard shortcuts work on desktop
AC-B.3: Touch gestures work on mobile
AC-B.3: No audio glitches or stuttering
AC-B.3: Error states graceful (no crash)
AC-B.3: Accessibility: All controls keyboard + screen reader accessible
AC-B.3: Performance: < 1 second to first audio playback
```

---

### B.4 Transcript Input & Checking

#### Deliverables

```
✅ Transcript textarea (min 4 rows, auto-grow)
✅ Real-time word count display
✅ Paste prevention (with tooltip)
✅ Spell-check disabled on input
✅ Clear button
✅ Auto-capitalize first letter
✅ Submit button (enabled when has content)
✅ Loading state during submission
✅ Disabled state during submission
✅ Keyboard shortcut: Ctrl/Cmd+Enter
✅ Client-side validation (non-empty)
✅ Transcript comparison algorithm (word-by-word)
✅ Normalization (lowercase, trim, punctuation)
✅ LCS word alignment algorithm
✅ Result panel with animation
✅ Accuracy score display (animated count-up)
✅ Word-level diff display (correct/wrong/missing/extra)
✅ Side-by-side comparison (expected vs user)
✅ AI feedback (rule-based pattern detection)
✅ Action buttons (Retry, Listen Again, Continue)
✅ Mobile keyboard handling (above input)
```

#### Files Created

```
app/
└── (app)/
    └── listen/
        └── [id]/
            ├── page.tsx               # Full lesson player
            └── loading.tsx

components/
├── lesson/
│   ├── TranscriptInput.tsx
│   ├── TranscriptResult.tsx
│   ├── WordDiff.tsx
│   ├── ScoreDisplay.tsx
│   ├── AIFeedback.tsx
│   └── LessonHeader.tsx

lib/
├── hooks/
│   └── useTranscriptForm.ts
│
├── services/
│   └── listeningService.ts
│
└── utils/
    ├── transcript-comparison.ts       # LCS algorithm
    └── scoring.ts                    # XP calculation
```

#### Test Cases

```
TC-B.4.1: Textarea accepts typing immediately
TC-B.4.2: Word count updates in real-time
TC-B.4.3: Paste is blocked with tooltip
TC-B.4.4: Clear button empties textarea and refocuses
TC-B.4.5: Submit button disabled when textarea empty
TC-B.4.6: Ctrl+Enter submits form
TC-B.4.7: Submit button shows loading state
TC-B.4.8: Result panel slides in after submission
TC-B.4.9: Accuracy count animates from 0 to value
TC-B.4.10: Correct words shown in green
TC-B.4.11: Wrong words shown in red with strikethrough
TC-B.4.12: Missing words underlined in gray
TC-B.4.13: Extra words highlighted in orange
TC-B.4.14: Case differences ignored (correct)
TC-B.4.15: Punctuation differences ignored (correct)
TC-B.4.16: "don't" matches "dont" (contraction handling)
TC-B.4.17: Exact match returns 100%
TC-B.4.18: All wrong returns 0%
TC-B.4.19: AI feedback appears below result
TC-B.4.20: "Retry" clears input and refocuses
TC-B.4.21: "Continue" advances to next clip
TC-B.4.22: Mobile: Keyboard does not cover input
TC-B.4.23: Result panel accessible to screen reader
TC-B.4.24: Double-submit prevented (button disabled)
TC-B.4.25: Empty submission shows validation error
TC-B.4.26: API timeout shows error with retry
TC-B.4.27: Server error shows friendly message
TC-B.4.28: Long input (>2000 chars) handled gracefully
TC-B.4.29: Clip with no transcript shows fallback
TC-B.4.30: Perfect score triggers extra celebration
```

#### Acceptance Criteria

```
AC-B.4: Transcript comparison algorithm is accurate (tested with known cases)
AC-B.4: Result panel shows within 2 seconds of submit
AC-B.4: Accuracy animation smooth (60fps)
AC-B.4: All 4 word states (correct/wrong/missing/extra) visually distinct
AC-B.4: AI feedback specific and actionable
AC-B.4: No paste cheating possible
AC-B.4: Mobile keyboard UX is smooth
AC-B.4: Accessibility: Result readable by screen reader
AC-B.4: Error states graceful with retry option
```

---

### B.5 Clip Navigation & Lesson Flow

#### Deliverables

```
✅ Clip indicator ("Clip 1 of 3")
✅ Next/previous clip navigation
✅ Progress dots for clips
✅ Auto-advance to next clip after completion
✅ Lesson complete modal
✅ XP earned animation
✅ Streak updated indicator
✅ "Next lesson" recommendation
✅ Session auto-save to database
✅ Exit mid-lesson (progress preserved)
✅ Back navigation with confirmation if in-progress
```

#### Files Created

```
components/
├── lesson/
│   ├── ClipIndicator.tsx
│   ├── LessonComplete.tsx
│   ├── Confetti.tsx
│   └── LessonPlayer.tsx           # Orchestrates full flow

app/
└── (app)/
    └── listen/
        └── [id]/
            ├── page.tsx
            └── complete/
                └── page.tsx

lib/
├── hooks/
│   └── useLessonSession.ts
│
└── store/
    └── index.ts                   # LessonSessionStore (Zustand)
```

#### Test Cases

```
TC-B.5.1: Clip indicator shows correct position
TC-B.5.2: Next clip loads after current clip completed
TC-B.5.3: Previous clip accessible (if not first)
TC-B.5.4: Progress dots update on clip completion
TC-B.5.5: Lesson complete modal appears after last clip
TC-B.5.6: Confetti animation plays on completion
TC-B.5.7: XP earned animates and displays
TC-B.5.8: Streak updates and displays if applicable
TC-B.5.9: "Bài tiếp theo" navigates to next lesson
TC-B.5.10: "Về Dashboard" navigates correctly
TC-B.5.11: Progress saved to database on lesson complete
TC-B.5.12: Exiting mid-lesson shows confirmation
TC-B.5.13: Browser back button handled correctly
TC-B.5.14: Tab close with unsaved data shows warning
TC-B.5.15: Reduced motion: No confetti, fade only
TC-B.5.16: Sound effects can be toggled off
TC-B.5.17: Lesson completion triggers dashboard update
TC-B.5.18: Lesson completion triggers streak update
```

#### Acceptance Criteria

```
AC-B.5: Lesson flow complete from first clip to last
AC-B.5: Progress saved to database on completion
AC-B.5: XP awarded correctly per scoring rules
AC-B.5: Streak incremented correctly
AC-B.5: Celebration is delightful but not annoying
AC-B.5: Reduced motion users get graceful fallback
```

---

### B.6 Voice Recording (Speaking Module)

#### Deliverables

```
✅ Recording interface UI
✅ Microphone permission request flow
✅ Permission denied state with guide
✅ Large record button (72x72px minimum)
✅ Recording timer (count up, max 30s)
✅ Live waveform visualizer during recording
✅ Auto-stop at 30 seconds
✅ Manual stop button
✅ Recorded audio playback
✅ Re-record button
✅ Recording uploaded to Supabase Storage
✅ MediaRecorder with proper codec (webm/opus)
✅ Error handling for recording failures
✅ Silence detection
✅ Mobile-optimized touch targets
✅ Keyboard accessible (Enter to record)
```

#### Files Created

```
components/
└── speaking/
    ├── VoiceRecorder.tsx
    ├── RecordingButton.tsx
    ├── RecordingTimer.tsx
    ├── LiveWaveform.tsx
    ├── PlaybackControls.tsx
    └── ReRecordButton.tsx

lib/
├── hooks/
│   ├── useVoiceRecorder.ts         # MediaRecorder logic
│   └── useWaveform.ts             # Audio analysis for waveform
│
└── services/
    └── speakingService.ts
```

#### Test Cases

```
TC-B.6.1: Record button requests microphone permission
TC-B.6.2: Permission denied shows guide
TC-B.6.3: Permission granted starts recording immediately
TC-B.6.4: Timer counts up during recording
TC-B.6.5: Live waveform displays during recording
TC-B.6.6: Recording auto-stops at 30 seconds
TC-B.6.7: Manual stop button works
TC-B.6.8: Recorded audio plays back correctly
TC-B.6.9: Re-record button resets to recording state
TC-B.6.10: Recording uploads to Supabase Storage
TC-B.6.11: Recording fails gracefully (no crash)
TC-B.6.12: Works on Chrome desktop
TC-B.6.13: Works on Safari iOS
TC-B.6.14: Works on Chrome mobile
TC-B.6.15: Touch targets are 44x44px minimum
TC-B.6.16: Keyboard: Enter starts/stops recording
TC-B.6.17: Screen reader announces recording state
TC-B.6.18: Very short recording (<1s) rejected
TC-B.6.19: Recording auto-pauses audio playback
TC-B.6.20: Multiple rapid record attempts handled
TC-B.6.21: Memory: Old recordings released properly
TC-B.6.22: Offline: Recording saved locally, synced later
```

#### Acceptance Criteria

```
AC-B.6: Recording works on Chrome, Safari iOS, Chrome Android
AC-B.6: Permission flow clear and user-friendly
AC-B.6: Waveform animates at 60fps
AC-B.6: 30-second limit enforced
AC-B.6: No memory leaks on repeated recording
AC-B.6: Upload succeeds and URL stored in database
AC-B.6: Mobile: Large touch targets, haptic feedback if available
AC-B.6: Accessibility: Full keyboard + screen reader support
```

---

### B.7 Speech Recognition & Pronunciation Scoring

#### Deliverables

```
✅ Speech-to-text using Web Speech API (Chrome/Edge)
✅ Fallback to Whisper API (Safari iOS)
✅ Real-time transcription display
✅ Interim results (dashed) → Final results (solid)
✅ Pronunciation scoring algorithm
✅ Score breakdown (Accuracy, Fluency, Completeness)
✅ Word-level feedback (correct/mispronounced/wrong)
✅ AI-generated pronunciation tips
✅ Overall score display with animation
✅ Side-by-side: Expected vs Spoken
✅ Error handling (no speech detected, API failure)
✅ Retry option
```

#### Files Created

```
supabase/
└── functions/
    └── speech-transcribe/
        └── index.ts               # Whisper Edge Function

components/
└── speaking/
    ├── SpeechResult.tsx
    ├── PronunciationScore.tsx
    ├── PronunciationBreakdown.tsx
    ├── WordPronunciation.tsx
    └── SpeakingResult.tsx

lib/
├── hooks/
│   └── useSpeechRecognition.ts    # Web Speech API hook
│
└── services/
    └── speakingService.ts         # Score calculation + Whisper fallback
```

#### Test Cases

```
TC-B.7.1: Chrome: Web Speech API transcribes without API key
TC-B.7.2: Safari: Falls back to Whisper API
TC-B.7.3: Firefox: Falls back to Whisper API
TC-B.7.4: Interim results shown during speech
TC-B.7.5: Final results processed for scoring
TC-B.7.6: Empty transcription shows retry option
TC-B.7.7: Pronunciation score calculates correctly
TC-B.7.8: Accuracy component correct
TC-B.7.9: Fluency component correct (based on WPM)
TC-B.7.10: Completeness component correct
TC-B.7.11: Mispronounced words marked ⚠️
TC-B.7.12: Wrong words marked ❌
TC-B.7.13: AI feedback specific to mispronunciations
TC-B.7.14: Score threshold labels correct
TC-B.7.15: Speech recognition timeout handled
TC-B.7.16: Background noise handled gracefully
TC-B.7.17: Whisper fallback timeout handled
TC-B.7.18: Multiple accent variations recognized
TC-B.7.19: Score persists to database
TC-B.7.20: Speaking result saved per clip
```

#### Acceptance Criteria

```
AC-B.7: Transcription accuracy > 90% on clear English audio
AC-B.7: Fallback works on all unsupported browsers
AC-B.7: Pronunciation scoring is consistent
AC-B.7: Feedback is specific and actionable
AC-B.7: Error messages helpful, not frustrating
AC-B.7: Score breakdown matches overall score
```

---

### B.8 Speaking Result & Navigation

#### Deliverables

```
✅ Speaking result panel (after pronunciation scoring)
✅ Overall pronunciation score (animated)
✅ Score breakdown (Accuracy, Fluency, Completeness)
✅ Word-by-word pronunciation display
✅ AI pronunciation tips
✅ Recording playback button
✅ "Ghi âm lại" button
✅ "Tiếp tục clip X" button
✅ "Bỏ qua speaking" option
✅ Speaking score saved to database
✅ Lesson complete screen with speaking summary
```

#### Files Created

```
components/
└── speaking/
    ├── SpeakingResult.tsx
    ├── PronunciationScore.tsx
    ├── PronunciationBreakdown.tsx
    ├── WordPronunciation.tsx
    └── SpeakingComplete.tsx

app/
└── (app)/
    └── listen/
        └── [id]/
            ├── speaking/
            │   └── page.tsx
            └── complete/
                └── page.tsx
```

#### Test Cases

```
TC-B.8.1: Speaking result shows after transcription
TC-B.8.2: Overall score animates from 0
TC-B.8.3: Breakdown shows 3 components
TC-B.8.4: Word-level marks correct/mispronounced/wrong
TC-B.8.5: AI tip specific and actionable
TC-B.8.6: Recording playback works
TC-B.8.7: "Ghi âm lại" resets to recording state
TC-B.8.8: "Tiếp tục" advances to next clip
TC-B.8.9: "Bỏ qua" advances without score
TC-B.8.10: Speaking score saved correctly
TC-B.8.11: Lesson complete shows speaking summary
TC-B.8.12: All speaking skipped = no speaking in summary
TC-B.8.13: Score persists across page refresh
TC-B.8.14: Speaking result accessible to screen reader
```

#### Acceptance Criteria

```
AC-B.8: Speaking results display within 5 seconds of recording
AC-B.8: Score breakdown accurate
AC-B.8: Navigation works correctly (next, retry, skip)
AC-B.8: Speaking score saved per clip
AC-B.8: Lesson complete reflects speaking participation
AC-B.8: Accessibility: Full results readable
```

---

## PHASE C: RETENTION & POLISH

**Timeline:** Day 26 – Day 35  
**Goal:** User có động lực quay lại mỗi ngày

### C.1 Progress Dashboard

#### Deliverables

```
✅ Progress dashboard page (/progress)
✅ Stats cards (lessons, time, accuracy, pronunciation)
✅ Weekly activity chart (7-day bar chart)
✅ Monthly calendar heatmap (GitHub-style)
✅ Topic progress breakdown
✅ XP & Level display
✅ Level-up celebration animation
✅ Personalized recommendations
✅ Weekly summary comparison
✅ Recharts integration
✅ Responsive charts
```

#### Files Created

```
app/
└── (app)/
    └── progress/
        └── page.tsx

components/
├── progress/
│   ├── ProgressDashboard.tsx
│   ├── StatsCard.tsx
│   ├── WeeklyChart.tsx
│   ├── MonthlyCalendar.tsx
│   ├── TopicProgress.tsx
│   ├── XpProgress.tsx
│   ├── LevelBadge.tsx
│   └── InsightsCard.tsx
│
└── ui/
    ├── ProgressBar.tsx
    └── ProgressRing.tsx

lib/
├── hooks/
│   ├── useDashboard.ts
│   ├── useWeeklyProgress.ts
│   └── useXp.ts
│
└── services/
    └── progressService.ts
```

#### Test Cases

```
TC-C.1.1: Dashboard loads and displays stats
TC-C.1.2: Total lessons count accurate
TC-C.1.3: Total time accurate
TC-C.1.4: Average accuracy correct
TC-C.1.5: Weekly chart shows 7 days
TC-C.1.6: Today's bar highlighted
TC-C.1.7: Weekly chart tooltip shows day details
TC-C.1.8: Weekly chart week navigation works
TC-C.1.9: Monthly calendar renders correctly
TC-C.1.10: Calendar color intensity reflects activity
TC-C.1.11: Tapping calendar date shows day detail
TC-C.1.12: Topic progress breakdown accurate
TC-C.1.13: XP and level display correct
TC-C.1.14: Level-up animation triggers at threshold
TC-C.1.15: Recommendation shows next lesson
TC-C.1.16: Charts responsive on mobile
TC-C.1.17: Charts responsive on desktop
TC-C.1.18: Empty state for new user
TC-C.1.19: Stale data refreshes on pull-to-refresh
TC-C.1.20: Data updates after lesson completion
TC-C.1.21: Real-time: Dashboard updates without refresh
```

#### Acceptance Criteria

```
AC-C.1: Dashboard loads in < 2 seconds
AC-C.1: All stats accurate (cross-checked with database)
AC-C.1: Charts render at all breakpoints
AC-C.1: Level-up celebration is exciting but not intrusive
AC-C.1: Real-time updates work during active use
AC-C.1: Empty state encourages first action
```

---

### C.2 Streak System

#### Deliverables

```
✅ Streak tracking logic (increment, reset)
✅ Streak counter in header
✅ Streak detail modal/page
✅ 90-day streak calendar
✅ Streak freeze (1 per week, auto-reset Monday)
✅ Auto-freeze at midnight
✅ Streak milestones (7, 14, 30, 60, 100, 365 days)
✅ Milestone celebrations
✅ XP bonus for milestones
✅ Streak at-risk warning (9pm)
✅ Streak broken notification
✅ Database triggers for streak calculation
```

#### Files Created

```
app/
└── (app)/
    └── streak/
        └── page.tsx               # Streak detail page/modal

components/
└── streak/
    ├── StreakCounter.tsx          # Header streak display
    ├── StreakBadge.tsx
    ├── StreakCalendar.tsx
    ├── StreakFreeze.tsx
    ├── StreakMilestone.tsx
    └── StreakAtRisk.tsx

lib/
├── hooks/
│   └── useStreak.ts
│
└── services/
    └── streakService.ts

supabase/
└── migrations/
    └── 003_streak_functions.sql    # Streak calculation triggers
```

#### Test Cases

```
TC-C.2.1: Streak increments on first lesson of day
TC-C.2.2: Streak does NOT increment on subsequent lessons
TC-C.2.3: Streak resets to 0 after 1+ day gap
TC-C.2.4: Streak freeze preserves streak after 1 day gap
TC-C.2.5: Freeze count resets Monday midnight
TC-C.2.6: Freeze auto-applied at midnight
TC-C.2.7: Freeze cannot be used twice in same week
TC-C.2.8: Streak counter in header updates in real-time
TC-C.2.9: Streak calendar shows 90 days correctly
TC-C.2.10: Calendar green for active days
TC-C.2.11: Calendar blue for freeze-protected days
TC-C.2.12: Calendar gray for inactive days
TC-C.2.13: 7-day milestone triggers celebration
TC-C.2.14: 30-day milestone triggers celebration
TC-C.2.15: 100-day milestone triggers celebration
TC-C.2.16: XP bonus awarded at milestones
TC-C.2.17: At-risk warning shows at 9pm
TC-C.2.18: Streak broken notification shown next morning
TC-C.2.19: Streak calculation correct across timezone
TC-C.2.20: Midnight completion counted to correct day
TC-C.2.21: Multiple devices sync streak correctly
TC-C.2.22: Longest streak never less than current
TC-C.2.23: Database triggers fire correctly
TC-C.2.24: Streak display on 365+ day users
```

#### Acceptance Criteria

```
AC-C.2: Streak increments exactly once per calendar day
AC-C.2: Streak freeze logic bulletproof
AC-C.2: Milestone celebrations trigger at exact thresholds
AC-C.2: Calendar accurate for 90 days
AC-C.2: Timezone handling correct
AC-C.2: No race conditions in streak calculation
AC-C.2: UI updates in real-time
```

---

### C.3 History Module

#### Deliverables

```
✅ History listing page (/history)
✅ Paginated lesson history (20 per page)
✅ Infinite scroll loading
✅ Pull-to-refresh
✅ Search by lesson name
✅ Filter by topic
✅ Filter by date range
✅ Filter by accuracy range
✅ Sort options
✅ Lesson detail with all clips
✅ Multiple attempt tracking
✅ Recording playback from history
✅ Mistake review with word highlighting
✅ Improvement tracking
✅ Export (JSON + CSV)
```

#### Files Created

```
app/
├── (app)/
│   ├── history/
│   │   ├── page.tsx               # History list
│   │   └── [lessonId]/
│   │       └── page.tsx           # Lesson history detail
│
components/
├── history/
│   ├── HistoryList.tsx
│   ├── HistoryItem.tsx
│   ├── HistoryFilters.tsx
│   ├── AttemptComparison.tsx
│   ├── RecordingPlayback.tsx
│   └── ExportButton.tsx
│
lib/
├── hooks/
│   ├── useHistory.ts
│   └── useHistoryDetail.ts
│
└── services/
    └── historyService.ts
```

#### Test Cases

```
TC-C.3.1: History list loads with newest first
TC-C.3.2: Infinite scroll loads next page
TC-C.3.3: Pull-to-refresh updates list
TC-C.3.4: Search filters results in real-time
TC-C.3.5: Topic filter works correctly
TC-C.3.6: Date range filter works correctly
TC-C.3.7: Accuracy filter works correctly
TC-C.3.8: Multiple filters combine correctly
TC-C.3.9: Clear filters resets to full list
TC-C.3.10: Lesson detail shows all clips
TC-C.3.11: Recording playback works
TC-C.3.12: Multiple attempts tracked
TC-C.3.13: Improvement trend visible
TC-C.3.14: "Học lại" navigates to lesson
TC-C.3.15: JSON export generates valid file
TC-C.3.16: CSV export opens correctly in Excel
TC-C.3.17: Large history (1000+ items) paginates
TC-C.3.18: Empty state for new user
TC-C.3.19: Recording not found handled gracefully
TC-C.3.20: Search with special characters works
TC-C.3.21: History accessible to screen reader
```

#### Acceptance Criteria

```
AC-C.3: Initial history load < 2 seconds
AC-C.3: Infinite scroll smooth with no jank
AC-C.3: All filters combine correctly (AND logic)
AC-C.3: Search responsive (<500ms)
AC-C.3: Export files valid and downloadable
AC-C.3: Accessibility full
```

---

### C.4 Notifications & Push

#### Deliverables

```
✅ Notification system (in-app)
✅ Push notification permission request
✅ Streak at-risk notification
✅ Streak broken notification
✅ Milestone notification
✅ Daily reminder notification
✅ Notification bell in header
✅ Notification list page
✅ Mark as read functionality
✅ Notification preferences in settings
```

#### Files Created

```
app/
└── (app)/
    └── notifications/
        └── page.tsx

components/
├── notifications/
│   ├── NotificationBell.tsx
│   ├── NotificationList.tsx
│   └── NotificationItem.tsx
│
lib/
├── hooks/
│   └── useNotifications.ts
│
└── services/
    └── notificationService.ts
```

#### Test Cases

```
TC-C.4.1: Notification bell shows unread count badge
TC-C.4.2: Tapping bell shows notification list
TC-C.4.3: Notifications marked read on tap
TC-C.4.4: "Mark all read" works
TC-C.4.5: Push permission prompt appears
TC-C.4.6: Push permission denied handled gracefully
TC-C.4.7: Streak at-risk notification fires at 9pm
TC-C.4.8: Streak broken notification fires next morning
TC-C.4.9: Milestone notification on achievement
TC-C.4.10: Daily reminder at user-set time
TC-C.4.11: Comeback notification after 3 days
TC-C.4.12: Notification preferences save
TC-C.4.13: User can disable notification types
```

#### Acceptance Criteria

```
AC-C.4: Push notifications fire at correct times
AC-C.4: Permission denied handled without errors
AC-C.4: Notification list accessible
AC-C.4: Preferences persisted
```

---

### C.5 Mobile Polish & PWA

#### Deliverables

```
✅ PWA setup (manifest.json, service worker)
✅ Install prompt
✅ App icon
✅ Offline handling (graceful)
✅ Touch gesture refinements
✅ Haptic feedback (where supported)
✅ Viewport fixes for all mobile browsers
✅ Safe area insets (iPhone notch)
✅ Pull-to-refresh on all lists
✅ Bottom sheet modals on mobile
✅ Mobile keyboard handling (all forms)
```

#### Test Cases

```
TC-C.5.1: PWA installable on Android Chrome
TC-C.5.2: PWA installable on iOS Safari
TC-C.5.3: Manifest.json valid
TC-C.5.4: Service worker caches critical assets
TC-C.5.5: Offline: App shows cached landing page
TC-C.5.6: Offline: Audio player shows offline message
TC-C.5.7: Pull-to-refresh on topics page
TC-C.5.8: Pull-to-refresh on history page
TC-C.5.9: Bottom sheet modal slides up on mobile
TC-C.5.10: Keyboard covers input correctly (input scrolls into view)
TC-C.5.11: Notch safe area respected
TC-C.5.12: Bottom nav above home indicator
TC-C.5.13: 320px: No horizontal scroll
TC-C.5.14: 375px (iPhone): All layouts correct
TC-C.5.15: 414px (iPhone Max): All layouts correct
TC-C.5.16: 768px (iPad): 2-column layouts work
TC-C.5.17: Landscape mode handled
```

#### Acceptance Criteria

```
AC-C.5: PWA installable on iOS and Android
AC-C.5: Offline gracefully handled
AC-C.5: All mobile viewports (320px-1024px) tested
AC-C.5: Touch targets minimum 44x44px
AC-C.5: Keyboard UX smooth on all mobile browsers
```

---

## PHASE D: LAUNCH & VALIDATION

**Timeline:** Day 36 – Day 42  
**Goal:** Soft launch, QA, go live

### D.1 QA Testing & Bug Fixes

#### Deliverables

```
✅ All critical bugs fixed
✅ All high-priority bugs fixed
✅ All medium-priority bugs fixed
✅ Accessibility audit (WCAG AA)
✅ Cross-browser testing complete
✅ Mobile device testing complete
✅ Performance audit (Lighthouse > 90)
✅ Security audit (no data leaks, XSS, CSRF)
✅ Load testing (100 concurrent users)
```

#### Test Cases (Full Regression)

```
TD-1.1: Full user flow: Register → Onboarding → Topic → Lesson → Complete
TD-1.2: Full speaking flow: Record → Transcribe → Score → Results
TD-1.3: Streak flow: Complete lesson → Check streak → Break → Recover
TD-1.4: History flow: Complete lesson → View history → Filter → Detail
TD-1.5: Progress flow: Complete lessons → View dashboard → Check stats
TD-1.6: All 320px / 375px / 768px / 1024px / 1440px breakpoints
TD-1.7: Chrome / Firefox / Safari / Edge
TD-1.8: iOS Safari / Chrome / Firefox
TD-1.9: Android Chrome
TD-1.10: Network: 3G throttling
TD-1.11: Network: Offline mode
TD-1.12: Auth: Login → Logout → Login again
TD-1.13: Auth: Session expiry during use
TD-1.14: Audio: Play → Pause → Seek → Speed change
TD-1.15: Audio: Background tab behavior
TD-1.16: Recording: Permission grant → Record → Stop → Upload
TD-1.17: Recording: Permission deny → Guide shown
TD-1.18: Transcription: Success / Fail / Retry
TD-1.19: All error states display correctly
TD-1.20: All empty states display correctly
TD-1.21: All loading states display correctly
TD-1.22: Animations respect reduced motion
TD-1.23: Screen reader reads all interactive elements
TD-1.24: Keyboard navigation through entire app
TD-1.25: Focus visible on all interactive elements
TD-1.26: Contrast ratios meet WCAG AA
TD-1.27: Lighthouse Performance > 90
TD-1.28: Lighthouse Accessibility > 95
TD-1.29: Lighthouse SEO > 95
TD-1.30: No console errors in production build
TD-1.31: No hydration mismatches
TD-1.32: No memory leaks on 10+ minute sessions
TD-1.33: 100 concurrent users: No server errors
TD-1.34: 100 concurrent users: API latency < 500ms (P99)
TD-1.35: Vercel analytics tracking configured
TD-1.36: Sentry error monitoring configured
```

#### Acceptance Criteria

```
AC-D.1: Zero P0 (critical) bugs remaining
AC-D.1: Zero P1 (high) bugs remaining
AC-D.1: P2 (medium) bugs < 5 remaining
AC-D.1: WCAG AA compliance achieved
AC-D.1: Lighthouse Performance > 90
AC-D.1: Lighthouse Accessibility > 95
AC-D.1: No console errors in production
AC-D.1: No security vulnerabilities
AC-D.1: 100 concurrent users: 0% error rate
```

---

### D.2 SEO & Analytics Setup

#### Deliverables

```
✅ robots.txt
✅ sitemap.xml (auto-generated)
✅ Canonical URLs on all pages
✅ Meta tags (title, description, OG, Twitter) per page
✅ Structured data (WebSite, Course, BreadcrumbList)
✅ Google Analytics 4 configured
✅ Vercel Analytics enabled
✅ Event tracking (lesson_complete, signup, etc.)
✅ Page view tracking
✅ User properties set
```

#### Test Cases

```
TD-2.1: robots.txt blocks /api/ routes
TD-2.2: sitemap.xml contains all public pages
TD-2.3: sitemap.xml updates automatically
TD-2.4: Canonical URLs correct on all pages
TD-2.5: Unique meta title per page
TD-2.6: Unique meta description per page
TD-2.7: Open Graph tags render correctly
TD-2.8: Twitter Card renders correctly
TD-2.9: Structured data validates (Google Rich Results Test)
TD-2.10: GA4 receives page view events
TD-2.11: GA4 receives custom events
TD-2.12: Vercel Analytics dashboard shows data
TD-2.13: User properties set on signup
TD-2.14: Core Web Vitals measured (LCP < 2.5s, FID < 100ms, CLS < 0.1)
```

#### Acceptance Criteria

```
AC-D.2: Sitemap valid and contains all public URLs
AC-D.2: All meta tags present and unique per page
AC-D.2: Structured data passes validation
AC-D.2: GA4 tracking working (test events received)
AC-D.2: Core Web Vitals within thresholds
```

---

### D.3 Soft Launch

#### Deliverables

```
✅ Vercel production deployment
✅ Custom domain configured (optional)
✅ SSL certificate active
✅ Launch announcement prepared
✅ Social media posts ready
✅ Feedback collection mechanism
✅ Bug reporting mechanism
✅ Monitoring dashboards active
```

#### Test Cases

```
TD-3.1: Production URL accessible
TD-3.2: SSL certificate valid
TD-3.3: Custom domain resolves correctly
TD-3.4: All features work on production
TD-3.5: Database connections work on production
TD-3.6: Storage uploads work on production
TD-3.7: Auth works on production
TD-3.8: Analytics tracking on production
TD-3.9: Error monitoring active on production
TD-3.10: Uptime monitoring active
```

#### Acceptance Criteria

```
AC-D.3: Production deployment stable
AC-D.3: All features functional on production
AC-D.3: Monitoring active and receiving data
AC-D.3: Team ready to respond to issues
```

---

## DEPENDENCY CHAIN

```
PHASE A (Must complete first)
    A.1 Project Setup
    A.2 Database & Supabase ──────────┐
    A.3 Data Ingestion ───────────────┼── No later phase can start
    A.4 Auth ─────────────────────────┼── B.1+ requires auth
    A.5 Landing Page ─────────────────┼── C.5 requires app shell
    A.6 Onboarding ───────────────────┘

PHASE B (Requires A.1, A.2, A.4)
    B.1 App Shell & Nav ───┐
    B.2 Topic/Lesson ──────┼── B.3+ requires B.1
    B.3 Audio Player ──────┤
    B.4 Transcript Input ───┤── B.6 requires B.3
    B.5 Clip Navigation ────┤── B.6+ requires B.4
    B.6 Voice Recording ────┤── B.7+ requires B.6
    B.7 Speech Recognition ─┤── B.8 requires B.7
    B.8 Speaking Results ───┘

PHASE C (Requires B.5)
    C.1 Progress Dashboard ──┐
    C.2 Streak System ───────┤── Independent, can parallelize
    C.3 History ─────────────┤
    C.4 Notifications ───────┘

PHASE D (Requires B.8, C.1, C.2, C.3)
    D.1 QA Testing ───┐
    D.2 SEO ──────────┼── Sequential
    D.3 Launch ───────┘
```

---

## COMPREHENSIVE TEST MATRIX

```
PHASE  FEATURE              TEST CASES  PRIORITY
────────────────────────────────────────────────────
A.1    Project Setup         12          P0
A.2    Database & Supabase   16          P0
A.3    Data Ingestion        10          P0
A.4    Auth                  14          P0
A.5    Landing Page          23          P0
A.6    Onboarding            12          P1
────────────────────────────────────────────────────
B.1    App Shell & Nav       14          P0
B.2    Topic/Lesson          20          P0
B.3    Audio Player         30          P0
B.4    Transcript Input      30          P0
B.5    Clip Navigation       18          P0
B.6    Voice Recording       22          P0
B.7    Speech Recognition    20          P0
B.8    Speaking Results      14          P0
────────────────────────────────────────────────────
C.1    Progress Dashboard    21          P1
C.2    Streak System        24          P0
C.3    History              21          P1
C.4    Notifications        13          P2
C.5    Mobile Polish        17          P1
────────────────────────────────────────────────────
D.1    QA Testing           35          P0
D.2    SEO & Analytics      14          P1
D.3    Soft Launch          10          P0
────────────────────────────────────────────────────
TOTAL                       422         -
```

---

## DELIVERABLE SUMMARY

```
PHASE A: Foundation (42 days worth of test cases, 7 deliverables)
  Deliverable 1: Running Next.js project on Vercel
  Deliverable 2: Database schema + RLS policies
  Deliverable 3: All data ingested to Supabase
  Deliverable 4: Full auth flow functional
  Deliverable 5: Landing page live
  Deliverable 6: Onboarding wizard complete
  Deliverable 7: Project documentation

PHASE B: Core Loop (168 test cases, 8 deliverables)
  Deliverable 1: App shell with navigation
  Deliverable 2: Topic browsing + lesson selection
  Deliverable 3: Full audio player with all controls
  Deliverable 4: Transcript input + comparison + scoring
  Deliverable 5: Clip navigation + lesson complete flow
  Deliverable 6: Voice recording with MediaRecorder
  Deliverable 7: Speech recognition + pronunciation scoring
  Deliverable 8: Full speaking result + navigation

PHASE C: Retention (96 test cases, 5 deliverables)
  Deliverable 1: Progress dashboard with charts
  Deliverable 2: Complete streak system
  Deliverable 3: History module with search/filter
  Deliverable 4: Notification system
  Deliverable 5: Mobile polish + PWA

PHASE D: Launch (59 test cases, 3 deliverables)
  Deliverable 1: QA passed, bugs fixed
  Deliverable 2: SEO + Analytics configured
  Deliverable 3: Live on production
```

---

*Document End — VinaListen Implementation Plan v2.0*
