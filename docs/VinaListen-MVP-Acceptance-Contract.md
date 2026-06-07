# VinaListen — MVP Acceptance Contract
## Final Scope Lock · Completion Criteria · Success Metrics

**Date:** 2026-06-07  
**Version:** 1.0 — FINAL  
**Status:** **APPROVED WITH MODIFICATIONS**  
**Approved by:** Founder  
**Effective:** 2026-06-07  
**Target Launch:** Week 7-8 (at 20h/week)

---

## APPROVAL SIGNATURES

```
┌─────────────────────────────────────────────────────────────────────┐
│ APPROVED FEATURES                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ ✅ Core Learning Loop: Listen → Type → Score                      │
│ ✅ Simplified Speaking: Browser Speech → Text → Accuracy          │
│ ✅ Basic Auth: Email + Google                                     │
│ ✅ Progress + Streak (basic)                                      │
│ ✅ Onboarding (4-step)                                           │
│ ✅ Landing Page (basic)                                           │
│ ✅ Mobile Responsive                                              │
│ ✅ Progress Dashboard                                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ REJECTED FROM MVP                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ ❌ Vocabulary Module                                              │
│ ❌ Achievements + Badges                                          │
│ ❌ Leaderboard                                                    │
│ ❌ Push Notifications                                             │
│ ❌ Dark Mode                                                     │
│ ❌ Custom Analytics (GA4)                                        │
│ ❌ Full Accessibility Audit                                        │
│ ❌ AI Pronunciation Coach                                         │
│ ❌ Phoneme Analysis                                               │
│ ❌ Fluency Scoring                                               │
│ ❌ Accent Detection                                              │
│ ❌ Recording Storage                                             │
│ ❌ Speaking History                                               │
│ ❌ Whispers API (Speech-to-text only)                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 1: FINAL MVP FEATURE LIST

### Core Loop (24h)

```
F1  Topics & Lessons       Browse → Select lesson              [T-B-005]
F2  Audio Player           Play → Pause → Seek → Speed         [T-B-006]
F3  Transcript Input       Type → Word count → Submit           [T-B-007]
F4  Scoring Engine         LCS → Accuracy → XP → Display        [T-B-008]
F5  Clip Navigation       Next → Prev → Auto-advance            [T-B-009]
F6  Lesson Page           Integrate all → Complete flow          [T-B-010]
```

### Speaking Module (20h)

```
F7  Voice Recording        Mic → Record → Stop → Playback       [T-B-011]
F8  Speech Recognition     Browser API → Text (Chrome/Edge)     [T-B-012]
F9  Speaking Score        Compare → Accuracy % → Display        [T-B-013]
```

### Foundation (36h)

```
F10 Project Setup         Next.js + TS + Tailwind + Supabase    [T-A-001]
F11 Database Schema       7 tables + indexes + RLS              [T-A-002]
F12 Supabase Client       SSR-safe auth + data client           [T-A-003]
F13 Design System         Colors + Typography + Components      [T-A-004]
F14 Data Ingestion        Crawler → Supabase (50+ lessons)     [T-A-005]
F15 Error Handling        ErrorBoundary + Toast                 [T-A-009]
F16 Deploy CI/CD          Vercel + GitHub Actions               [T-A-010]
```

### Authentication (8h)

```
F17 Auth Pages            Register → Login → Google → Reset     [T-B-001]
F18 Guest Mode            Browse → Play audio (no progress)      [T-B-001]
```

### Onboarding + Navigation (14h)

```
F19 Onboarding            4 steps → Goal → Level → Daily →     [T-B-003]
                          Preview
F20 App Shell + Nav       Header + Bottom nav + Mobile nav       [T-B-004]
```

### Retention + Polish (28h)

```
F21 Progress Dashboard    Stats + Weekly chart + Recommendations [T-C-001]
F22 Streak System        Increment → Reset → Milestones         [T-C-002]
F23 History (basic)       List + Detail + Re-attempt            [T-C-003]
F24 Dashboard Page        Today + Continue + Recommended         [T-C-004]
F25 Basic SEO             Meta tags + OG + Semantic HTML         [T-C-005]
F26 Analytics             Vercel Analytics (built-in)           [T-C-006]
F27 PWA Manifest          manifest.json + icons                 [T-C-007]
```

### QA + Launch (12h)

```
F28 Unit Tests            Scoring algorithm (80% coverage)      [T-D-001]
F29 Cross-Browser         Chrome + Safari + Firefox + Mobile     [T-D-004]
F30 Production Launch     Deploy → Verify → Monitor             [T-D-008]
```

---

## PART 2: ACCEPTANCE CRITERIA PER FEATURE

### F1: Topics & Lessons

```
ACCEPTANCE CRITERIA:

AC-1.1: Topics page loads < 1s and displays all topics from database
AC-1.2: Each topic card shows: name, icon, lesson count
AC-1.3: Search filters topics in real-time (debounced 300ms)
AC-1.4: Filter chips filter by category (All · IELTS · TOEIC · Daily · Business)
AC-1.5: Topic detail shows all lessons grouped by section
AC-1.6: Progress bar shows correct % for logged-in user
AC-1.7: "Continue" button navigates to last in-progress lesson
AC-1.8: Empty search shows: "Không tìm thấy kết quả"
AC-1.9: No horizontal overflow at 320px

PASS: All 9 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F2: Audio Player

```
ACCEPTANCE CRITERIA:

AC-2.1: Audio plays on click Play button
AC-2.2: Audio pauses on click Pause button
AC-2.3: Progress bar updates in real-time during playback
AC-2.4: Seeking by click on progress bar works
AC-2.5: Seeking by dragging progress thumb works
AC-2.6: All 5 speeds work: 0.5x, 0.75x, 1x, 1.25x, 1.5x
AC-2.7: Skip forward 5 seconds works
AC-2.8: Skip backward 5 seconds works
AC-2.9: Audio pauses when browser tab is backgrounded
AC-2.10: Error state with retry button shows when audio fails to load
AC-2.11: Loading skeleton shown while audio loads
AC-2.12: Audio plays on Chrome, Safari, Firefox, Edge
AC-2.13: Audio plays on iOS Safari and Android Chrome
AC-2.14: Space key toggles play/pause

PASS: All 14 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F3: Transcript Input

```
ACCEPTANCE CRITERIA:

AC-3.1: Textarea accepts text input immediately
AC-3.2: Word count updates in real-time
AC-3.3: Paste is blocked with tooltip: "Hãy gõ từ bạn nghe được"
AC-3.4: Submit button disabled when textarea is empty
AC-3.5: Ctrl+Enter submits the form
AC-3.6: Submit button shows loading state during submission
AC-3.7: Double-submit prevented (button disabled during processing)
AC-3.8: Mobile keyboard does not cover textarea (scrolls into view)
AC-3.9: Clear button empties textarea and refocuses

PASS: All 9 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F4: Scoring Engine

```
ACCEPTANCE CRITERIA:

AC-4.1: "i was walking" vs "I was walking" → 100% (case-insensitive)
AC-4.2: "Hello, world!" vs "hello world" → 100% (punctuation stripped)
AC-4.3: "don't" vs "dont" → CORRECT (contraction normalized)
AC-4.4: "the" missing in user input → marked as MISSING (gray underline)
AC-4.5: Extra word "really" in user input → marked as EXTRA (orange)
AC-4.6: Wrong word "running" vs "walking" → marked as WRONG (red)
AC-4.7: Correct word → marked as CORRECT (green)
AC-4.8: Accuracy = correct_count / expected_count × 100 (rounded to 1 decimal)
AC-4.9: Score result displays < 500ms after submission
AC-4.10: Accuracy animates from 0 to value (count-up effect)
AC-4.11: XP = accuracy × 10 (rounded)
AC-4.12: Error responses return user-friendly Vietnamese message
AC-4.13: Unit test coverage on scoring logic: ≥ 80%

KNOWN LIMITATIONS (Acceptable):
- Numbers ("1995") vs words ("nineteen ninety five") → may score wrong
- Strong accents → may misrecognize → acceptable for MVP

PASS: All 13 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F5: Clip Navigation

```
ACCEPTANCE CRITERIA:

AC-5.1: Clip indicator shows: "Clip 1 of 3" (correct for lesson)
AC-5.2: Progress dots update on clip completion
AC-5.3: Next clip loads after current clip result shown
AC-5.4: Previous clip accessible if not on clip 1
AC-5.5: Lesson complete modal appears after last clip completed
AC-5.6: "Bài tiếp theo" navigates to next lesson in topic
AC-5.7: "Về Dashboard" navigates to /dashboard
AC-5.8: Progress saved to database on lesson complete
AC-5.9: Browser close while in-progress shows confirmation dialog

PASS: All 9 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F6: Lesson Page

```
ACCEPTANCE CRITERIA:

AC-6.1: Lesson page loads and displays correct lesson name
AC-6.2: All clips accessible in sequence
AC-6.3: Audio player initializes with first clip
AC-6.4: Lesson header shows: lesson name, topic, progress
AC-6.5: Back button navigates to topic detail
AC-6.6: Loading skeleton shown during data fetch
AC-6.7: Error state shows retry button on API failure

PASS: All 7 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F7: Voice Recording

```
ACCEPTANCE CRITERIA:

AC-7.1: Microphone permission dialog appears on first record tap
AC-7.2: Permission denied state shows guide with settings link
AC-7.3: Record button shows as "ready" state before tapping
AC-7.4: Recording starts immediately on record button tap
AC-7.5: Timer counts up during recording (0:00 → 0:30 max)
AC-7.6: Recording auto-stops at 30 seconds
AC-7.7: Manual stop button stops recording early
AC-7.8: Recorded audio plays back correctly
AC-7.9: Re-record button resets to recording state
AC-7.10: Recording duration < 1 second shows error: "Recording quá ngắn"
AC-7.11: Works on Chrome (desktop + Android)
AC-7.12: Works on Safari iOS (tap-to-record, user gesture required)
AC-7.13: Touch targets minimum 44×44px

PASS: All 13 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F8: Speech Recognition

```
ACCEPTANCE CRITERIA:

AC-8.1: Chrome/Edge: Uses Web Speech API (no API key, no cost)
AC-8.2: Safari/Firefox: Shows message "Tính năng đang phát triển"
        → User can skip speaking for Safari/Firefox
AC-8.3: Interim results shown during speech (dashed text, 50% opacity)
AC-8.4: Final transcript replaces interim when user stops
AC-8.5: Empty speech (no-speech) shows: "Không phát hiện giọng nói"
AC-8.6: No microphone found shows: "Không tìm thấy microphone"
AC-8.7: Microphone denied shows: "Cần quyền truy cập microphone"
AC-8.8: Transcription result displays < 3 seconds after recording stops

PASS: All 8 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F9: Speaking Score

```
ACCEPTANCE CRITERIA:

AC-9.1: Speaking score = (correct_words / expected_words) × 100
AC-9.2: Score displays as percentage (e.g., "78%")
AC-9.3: Score animates from 0 to value
AC-9.4: Correct words marked green
AC-9.5: Wrong words marked red
AC-9.6: Missing words marked gray (underline)
AC-9.7: "Ghi âm lại" resets to recording state
AC-9.8: "Tiếp tục" advances to next clip
AC-9.9: "Bỏ qua" advances without recording (no score penalty)
AC-9.10: Speaking score saved per clip (database)
AC-9.11: Speaking score NOT required for lesson completion
        → User can skip all speaking and still complete lesson

PASS: All 11 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F10-F16: Foundation

```
ACCEPTANCE CRITERIA:

AC-10.1: `npm run build` succeeds in < 3 minutes with 0 errors
AC-10.2: `tsc --noEmit` passes with 0 TypeScript errors
AC-10.3: `npm run lint` passes with 0 warnings
AC-11.1: All 7 tables created with correct columns and constraints
AC-11.2: RLS: User A cannot read or write User B's data
AC-11.3: Database indexes created for queried columns
AC-11.4: Triggers fire correctly (updated_at, streak)
AC-12.1: Auth state persists across page refresh
AC-12.2: Protected routes redirect to /auth/login when unauthenticated
AC-13.1: Primary color #35375B renders correctly
AC-13.2: Accent color #FF5632 passes WCAG AA on white (use --accent-dark)
AC-13.3: Typography scale correct (H1 36px, H2 28px, H3 20px, Body 16px)
AC-13.4: Base components styled (Button, Input, Card, Badge)
AC-14.1: All topics ingested (slug unique, no duplicates)
AC-14.2: All lessons ingested with correct topic_id FK
AC-14.3: All clips ingested with correct lesson_id FK
AC-14.4: Audio files accessible via Supabase Storage
AC-14.5: No broken audio URLs (verified with curl)
AC-15.1: Unhandled errors show friendly error page (not white screen)
AC-15.2: Toast notifications appear and auto-dismiss
AC-16.1: Production deployment successful on Vercel
AC-16.2: Environment variables configured on Vercel (not in git)
AC-16.3: CI pipeline runs on every push

PASS: All 25 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F17-F18: Authentication

```
ACCEPTANCE CRITERIA:

AC-17.1: Email/password registration creates user and auto-logs in
AC-17.2: Email/password login works and redirects correctly
AC-17.3: Google OAuth completes full flow and redirects
AC-17.4: Password reset email sends successfully
AC-17.5: Protected routes redirect to /auth/login
AC-17.6: Logged-in users redirected away from /auth/login
AC-17.7: Session persists across page refresh and tab close
AC-17.8: Logout clears session and redirects
AC-17.9: Error messages in Vietnamese
AC-18.1: Guest can browse topics and lessons
AC-18.2: Guest can play audio
AC-18.3: Guest sees "Đăng ký để lưu tiến độ" banner
AC-18.4: Guest cannot save progress

PASS: All 14 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F19: Onboarding

```
ACCEPTANCE CRITERIA:

AC-19.1: All 4 steps render and navigate correctly
AC-19.2: Progress dots show current step
AC-19.3: Step 1: Goal selection (IELTS · TOEIC · Daily · Business)
AC-19.4: Step 2: Level assessment (Beginner · Intermediate · Advanced)
AC-19.5: Step 3: Daily time (5 · 10 · 20 · 30 min)
AC-19.6: Step 4: Quick preview (1 clip, 30 seconds)
AC-19.7: Skip button works on all steps
AC-19.8: Data saved to user_settings on completion
AC-19.9: New users redirected to /onboarding after register
AC-19.10: Completed users skip onboarding (redirect to /dashboard)
AC-19.11: Onboarding completes in < 2 minutes

PASS: All 11 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F20: App Shell + Navigation

```
ACCEPTANCE CRITERIA:

AC-20.1: Desktop: Top nav visible, bottom nav hidden
AC-20.2: Mobile (≤768px): Bottom nav visible, top nav minimal
AC-20.3: All nav links navigate correctly
AC-20.4: Active page highlighted in nav
AC-20.5: Avatar dropdown shows Profile, Settings, Logout
AC-20.6: Streak counter displays correct number in header
AC-20.7: Safe area insets respected (iPhone notch + home indicator)
AC-20.8: No horizontal overflow at 320px

PASS: All 8 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F21: Progress Dashboard

```
ACCEPTANCE CRITERIA:

AC-21.1: Dashboard loads with all stat cards
AC-21.2: Total lessons count is accurate
AC-21.3: Total time practiced is accurate
AC-21.4: Average accuracy is correct
AC-21.5: Weekly chart shows 7 days, today highlighted
AC-21.6: XP progress bar accurate (current / next level)
AC-21.7: Personalized recommendation shows next lesson
AC-21.8: Stats update in real-time after lesson complete
AC-21.9: Empty state for new users (welcome message + CTA)

PASS: All 9 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F22: Streak System

```
ACCEPTANCE CRITERIA:

AC-22.1: Streak increments on first lesson of day
AC-22.2: Streak does NOT increment on subsequent lessons same day
AC-22.3: Streak resets to 0 after 1+ day gap
AC-22.4: longest_streak updates when current exceeds it
AC-22.5: Header shows: 🔥 X ngày
AC-22.6: 7-day milestone triggers celebration toast
AC-22.7: 30-day milestone triggers celebration toast
AC-22.8: XP bonus awarded at milestones (7d: +30XP, 30d: +100XP)
AC-22.9: Streak calculated in user's local timezone

PASS: All 9 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F23: History

```
ACCEPTANCE CRITERIA:

AC-23.1: History list loads with newest first
AC-23.2: Each row shows: lesson name, topic, date, accuracy
AC-23.3: Search filters results in real-time
AC-23.4: Topic filter works
AC-23.5: Lesson detail shows all clips with transcript comparison
AC-23.6: Re-attempt button navigates to lesson
AC-23.7: Empty state: "Chưa có lịch sử học tập"
AC-23.8: Infinite scroll loads next page

PASS: All 8 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F24-F27: Polish

```
ACCEPTANCE CRITERIA:

AC-24.1: Dashboard shows: Welcome message + Today's goal + Recommended
AC-25.1: Landing page has title + description meta tags
AC-25.2: Landing page has Open Graph tags
AC-25.3: Semantic HTML (h1, nav, main, article)
AC-25.4: All topics have unique meta title
AC-26.1: Vercel Analytics shows page views
AC-27.1: manifest.json valid and complete
AC-27.2: "Add to Home Screen" works on Android Chrome
AC-27.3: "Add to Home Screen" works on iOS Safari

PASS: All 10 criteria
FAIL: Any 1 criterion fails → Return to developer
```

### F28-F30: QA + Launch

```
ACCEPTANCE CRITERIA:

AC-28.1: LCS algorithm unit tested with ≥ 10 known inputs
AC-28.2: Scoring calculation unit tested with ≥ 10 known inputs
AC-28.3: All unit tests pass in < 30 seconds
AC-28.4: Coverage on scoring logic ≥ 80%
AC-29.1: Chrome desktop: All features work
AC-29.2: Safari desktop: All features work
AC-29.3: Firefox desktop: All features work
AC-29.4: iOS Safari: Audio plays, recording works
AC-29.5: Android Chrome: Audio plays, recording works
AC-29.6: No horizontal overflow at 320px, 375px, 768px, 1024px
AC-29.7: Keyboard navigation works (Tab, Enter, Escape)
AC-29.8: Focus visible on all interactive elements
AC-30.1: Production URL accessible and returns 200
AC-30.2: SSL certificate valid
AC-30.3: All API endpoints respond correctly
AC-30.4: No P0 bugs in production (crash, data loss)
AC-30.5: Error rate < 1% in first 48 hours

PASS: All 20 criteria
FAIL: Any 1 criterion fails → Return to developer
```

---

## PART 3: TEST CASES

### TC-1: Full User Journey

```
TC-1.1: Guest visits landing page → browses topics → selects lesson
         → plays audio → types transcript → sees score
         → completes lesson → sees complete screen
         → registers → sees dashboard → verifies progress saved

TC-1.2: User registers → completes onboarding → selects topic
         → plays lesson → types transcript (100% accuracy)
         → completes all clips → verifies XP awarded
         → checks dashboard → verifies streak = 1

TC-1.3: User on Safari iOS → browses lesson → plays audio
         → types transcript → records voice
         → sees "Tính năng đang phát triển"
         → skips speaking → completes lesson successfully

TC-1.4: User completes lesson today → completes second lesson today
         → verifies streak unchanged (still 1)
         → comes back tomorrow → completes lesson
         → verifies streak = 2
```

### TC-2: Scoring Edge Cases

```
TC-2.1: Empty transcript submitted → submit disabled
TC-2.2: Perfect transcript → score = 100%, XP bonus applied
TC-2.3: All wrong words → score = 0%
TC-2.4: Extra words → orange highlighting correct
TC-2.5: Missing words → gray underline correct
TC-2.6: Mixed correct/wrong/missing/extra → all colors correct
TC-2.7: Transcript with punctuation → normalized correctly
TC-2.8: Transcript with uppercase → case-insensitive
TC-2.9: Transcript with contraction ("don't") → normalized
```

### TC-3: Speaking Edge Cases

```
TC-3.1: Microphone permission denied → error message + guide shown
TC-3.2: Recording < 1 second → error message
TC-3.3: Recording = 30 seconds → auto-stops
TC-3.4: Perfect speech → score = 100%
TC-3.5: All wrong words → score = 0%
TC-3.6: No speech detected → error message
TC-3.7: "Bỏ qua" → lesson completes without speaking score
TC-3.8: "Ghi âm lại" → resets to recording
```

### TC-4: Streak Edge Cases

```
TC-4.1: First lesson ever → streak = 1
TC-4.2: Second lesson same day → streak unchanged
TC-4.3: Consecutive days → streak increments
TC-4.4: Gap of 1 day → streak resets to 1
TC-4.5: Gap of 3 days → streak = 0
TC-4.6: 7-day milestone → XP bonus + toast
TC-4.7: Timezone change → calculated in user's local time
```

### TC-5: Error States

```
TC-5.1: Audio fails to load → error + retry button
TC-5.2: Network error during submission → error + retry
TC-5.3: API timeout → error + retry
TC-5.4: Empty topics → "Chưa có bài học nào"
TC-5.5: Empty history → "Chưa có lịch sử học tập"
TC-5.6: Search no results → "Không tìm thấy kết quả"
TC-5.7: Unhandled exception → friendly error page (not white screen)
```

### TC-6: Mobile Responsive

```
TC-6.1: 320px: Single column, no horizontal overflow, buttons full-width
TC-6.2: 375px: All features functional
TC-6.3: 768px: 2-column grid works
TC-6.4: 1024px+: Desktop layout correct
TC-6.5: 1440px: Layout max-width 1200px, no stretching
TC-6.6: Mobile keyboard opens → textarea visible above keyboard
TC-6.7: Touch targets ≥ 44×44px on all buttons
```

---

## PART 4: SUCCESS METRICS

### Launch Targets (Week 1-2)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ACQUISITION                                                          │
├─────────────────────────────────────────────────────────────────────┤
│ New registrations:              > 50 users/week                      │
│ Landing page conversion:        > 10% (visit → signup)             │
│ Google "luyện nghe tiếng Anh":  Top 20 within 3 months             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ACTIVATION                                                           │
├─────────────────────────────────────────────────────────────────────┤
│ Onboarding completion rate:      > 60%                              │
│ First lesson completion rate:    > 50%                              │
│ First lesson → second lesson:    > 40%                              │
│ Speaking attempted (Chrome):      > 30%                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ENGAGEMENT                                                          │
├─────────────────────────────────────────────────────────────────────┤
│ Average session duration:        > 5 minutes                         │
│ Clips completed per session:    > 3                                 │
│ Average accuracy:               60-85%                              │
│ Daily practice goal met:        > 40% of active users               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ RETENTION (Week 4)                                                   │
├─────────────────────────────────────────────────────────────────────┤
│ Day 1 retention:              > 40%                                 │
│ Day 7 retention:              > 20%                                │
│ Day 30 retention:             > 10%                                │
│ Users with streak > 0:        > 30% of registered                   │
│ Streak ≥ 7 days:             > 10% of registered                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ QUALITY                                                              │
├─────────────────────────────────────────────────────────────────────┤
│ Crash-free rate:           > 99.5%                                   │
│ Error rate:                < 1%                                      │
│ Lighthouse Performance:    > 80                                       │
│ Lighthouse Accessibility:  > 85                                       │
│ Lighthouse SEO:            > 85                                       │
│ Lighthouse Best Practices: > 85                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ FINANCIAL (Pre-Revenue)                                              │
├─────────────────────────────────────────────────────────────────────┤
│ Operating cost:             $1-4/month                             │
│ Cost per user/month:         < $0.10                                │
│ Breakeven:                   25 paying × 49K VND = ~$49            │
└─────────────────────────────────────────────────────────────────────┘
```

### Pivot Triggers

```
⚠️  IF after 8 weeks:
├── Onboarding completion < 30%       → Rethink onboarding UX
├── Day 7 retention < 10%            → Pause, investigate drop-off
├── No organic growth                 → Invest in content/SEO
└── Technical debt > 50%             → Stop features, refactor

⚠️  IF after 16 weeks:
├── MAU < 100                       → Product-market fit not confirmed
├── Conversion to premium < 1%       → Redesign freemium
└── Churn rate > 50%/month          → Major retention problem

✅  SUCCESS CONDITION after 6 months:
├── 500+ MAU
├── 30%+ Day 7 retention
├── 20+ users with streak ≥ 30
└── Organic traffic growing month-over-month
```

---

## PART 5: LAUNCH REQUIREMENTS

### Hard Requirements (Must Pass All)

```
┌─────────────────────────────────────────────────────────────────────┐
│ P0 — LAUNCH BLOCKERS (0 tolerance)                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ CONTENT:                                                            │
│ ☐ Content licensed (DailyDictation ToS or BBC/VOA)                │
│ ☐ All audio files accessible (no 404)                               │
│ ☐ All transcripts verified accurate                                  │
│ ☐ Topic count ≥ 4, Lesson count ≥ 20, Clip count ≥ 50           │
│                                                                      │
│ CORE LOOP:                                                          │
│ ☐ Full flow works: Landing → Topic → Lesson → Audio →            │
│   Transcript → Score → Clip Nav → Complete → Dashboard             │
│ ☐ Speaking works on Chrome (skip on Safari)                        │
│ ☐ Streak increments correctly                                        │
│ ☐ XP awarded correctly                                              │
│ ☐ Progress saved to database                                        │
│                                                                      │
│ SECURITY:                                                            │
│ ☐ RLS tested: User A cannot access User B's data                 │
│ ☐ HTTPS enforced                                                    │
│ ☐ No secrets in client bundle                                       │
│ ☐ Environment variables on Vercel (not in git)                    │
│                                                                      │
│ PERFORMANCE:                                                         │
│ ☐ Lighthouse Performance > 80                                       │
│ ☐ LCP < 3.0s                                                       │
│ ☐ Audio plays within 1 second                                       │
│ ☐ Page load (3G) < 4 seconds                                       │
│ ☐ Build succeeds with 0 errors                                       │
│                                                                      │
│ MOBILE:                                                              │
│ ☐ 320px: Zero horizontal overflow                                   │
│ ☐ iOS Safari: Audio plays                                           │
│ ☐ Android Chrome: Audio plays                                       │
│ ☐ Touch targets ≥ 44×44px                                          │
│                                                                      │
│ LEGAL:                                                               │
│ ☐ Privacy policy page accessible (/privacy)                        │
│ ☐ Terms of service page accessible (/terms)                         │
│ ☐ Cookie consent if using analytics cookies                         │
│                                                                      │
│ MONITORING:                                                          │
│ ☐ Vercel Analytics active                                           │
│ ☐ Uptime monitoring active                                          │
│ ☐ Error page configured (app/error.tsx)                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Soft Requirements (Should Have)

```
┌─────────────────────────────────────────────────────────────────────┐
│ P1 — RECOMMENDED (Deployable without these, but ship if easy)       │
├─────────────────────────────────────────────────────────────────────┤
│ ☐ Lighthouse Accessibility > 90                                    │
│ ☐ Lighthouse SEO > 90                                              │
│ ☐ FAQ page                                                          │
│ ☐ Contact email configured (support@vinalisten.app)                │
│ ☐ Social media accounts created (Facebook, Zalo OA)                │
│ ☐ Custom domain configured                                          │
│ ☐ OG image created (1200x630px)                                    │
│ ☐ Unit tests on scoring logic (80% coverage)                        │
│ ☐ Basic cross-browser test passed                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 6: FINAL SCOPE SUMMARY

### Feature → Task Mapping

```
┌─────────────────────────────────────────────────────────────────────┐
│ FOUNDATION                                          ~36 hours       │
├─────────────────────────────────────────────────────────────────────┤
│ T-A-001  Project Setup                              4h              │
│ T-A-002  Supabase + Database Schema                   8h             │
│ T-A-003  Supabase Client (SSR)                        4h             │
│ T-A-004  Design System                                6h             │
│ T-A-005  Data Ingestion                               8h             │
│ T-A-009  Error Handling                               4h             │
│ T-A-010  Deploy CI/CD                                 4h             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ CORE LOOP                                          ~24 hours       │
│                                                                      │
│ T-B-005  Topics & Lessons                           6h             │
│ T-B-006  Audio Player                               8h             │
│ T-B-007  Transcript Input                           6h             │
│ T-B-008  Scoring Engine                             6h             │
│ T-B-009  Clip Navigation                            4h             │
│ T-B-010  Lesson Page                                4h             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ SPEAKING (Simplified)                               ~20 hours       │
│                                                                      │
│ T-B-011  Voice Recording                               6h             │
│ T-B-012  Speech Recognition                            8h             │
│ T-B-013  Speaking Score + Result                      6h             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ AUTH + ONBOARDING + NAV                              ~22 hours       │
│                                                                      │
│ T-B-001  Auth Pages + Guest Mode                       8h             │
│ T-B-003  Onboarding Wizard                            6h             │
│ T-B-004  App Shell + Navigation                       8h             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ RETENTION + POLISH                                  ~28 hours       │
│                                                                      │
│ T-C-001  Progress Dashboard                            6h             │
│ T-C-002  Streak System                                4h             │
│ T-C-003  History                                      4h             │
│ T-C-004  Dashboard Page                               4h             │
│ T-C-005  Basic SEO                                    4h             │
│ T-C-006  Analytics                                   2h             │
│ T-C-007  PWA Manifest                                2h             │
│ T-C-008  Landing Page (minimal)                       6h             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ QA + LAUNCH                                         ~12 hours       │
│                                                                      │
│ T-D-001  Unit Tests (scoring)                         4h             │
│ T-D-004  Cross-Browser + Basic QA                    4h             │
│ T-D-008  Production Launch                            4h             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                                          TOTAL: ~140 hours           │
│                                          At 20h/week: ~7 weeks      │
└─────────────────────────────────────────────────────────────────────┘
```

### Simplification Decisions Locked

```
┌─────────────────────────────────────────────────────────────────────┐
│ SIMPLIFIED CHOICES (Final)                                          │
├─────────────────────────────────────────────────────────────────────┤
│ Speaking:   Browser only (Web Speech API)                           │
│             No Whisper, no recording storage, no speaking history   │
│ Animation:  CSS only (no Framer Motion)                              │
│ State:      TanStack Query + Zustand + useState (no nuqs)          │
│ DB:         7 tables, simple triggers (no materialized views)       │
│ Auth:       Email + Google (no Apple, no magic link)                │
│ Error:      ErrorBoundary + Toast (no Sentry)                       │
│ PWA:        manifest.json only (no service worker)                  │
│ SEO:        Meta tags only (no sitemap, no structured data)         │
│ Analytics:  Vercel built-in only (no GA4)                          │
│ Rate limit: Client-side soft limits only (no Redis)                   │
│ Dark mode:  Light only                                              │
│ Accessibility: Basic checks only (no formal audit)                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 7: SIGN-OFF

```
┌─────────────────────────────────────────────────────────────────────┐
│ MVP ACCEPTANCE CONTRACT                                               │
│ VinaListen v1.0                                                     │
│                                                                      │
│ This contract defines the complete and final scope for MVP launch. │
│                                                                      │
│ TOTAL FEATURES:         30 features                                  │
│ TOTAL TASKS:            27 tasks                                     │
│ TOTAL ESTIMATED HOURS:  140 hours                                   │
│ TIMELINE:               7 weeks (at 20h/week)                       │
│ OPERATING COST:         $1-4/month at launch                        │
│                                                                      │
│ APPROVAL:                                                               │
│                                                                      │
│ Founder: _________________________________ Date: _________            │
│                                                                      │
│ MODIFICATIONS SINCE APPROVAL:                                        │
│ 1. 2026-06-07: Speaking kept in MVP (simplified to browser only)  │
│ 2. Removed: Vocabulary, Achievements, Leaderboard, Notifications,  │
│    Dark Mode, Custom Analytics, Full Audit                           │
│                                                                      │
│ NEXT STEP: Week 1 Infrastructure Sprint (T-A-001 → T-A-010)         │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Document End — VinaListen MVP Acceptance Contract v1.0*
*Final approval: 2026-06-07 | Launch target: Week 7-8*
