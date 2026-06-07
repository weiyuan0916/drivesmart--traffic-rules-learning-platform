# VinaListen — Launch Readiness Checklist
## Complete Pre-Launch Verification

**Date:** 2026-06-07  
**Version:** 1.0  
**Based on:** MVP Freeze + Critical Review + Implementation Plan v2 + Gap Spec  
**Scope:** MVP v1.0 (17 features)  
**Launch Target:** TBD (after Week 6 build + Week 1 QA)

---

## HOW TO USE THIS CHECKLIST

```
EVERY ITEM = Must verify before launch.

P0 = Blocks launch. Cannot deploy if fail.
P1 = Should fix before launch. Deployable but risky.
P2 = Nice to have. Can launch without these.

For each item:
  ☐ Not started
  🔄 In progress
  ✅ Done
  ❌ Failed (needs fix)

SIGN-OFF: One person reviews each section.
No section = No launch.
```

---

## SECTION 1: PRODUCT READINESS

### 1.1 Content & Legal

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  BLOCKER — Cannot launch without resolving content     │
│ ⚠️  LEGAL. DailyDictation content may be unlicensed.      │
└─────────────────────────────────────────────────────────────┘

P0:
☐ DailyDictation ToS reviewed (no scraping prohibition)
☐ Written license from DailyDictation obtained OR
☐ Alternative content (BBC/VOA) integrated and tested
☐ All audio files accessible from Supabase Storage
☐ All transcripts verified accurate (no corrupted data)
☐ Content count verified: Topics = X, Lessons = Y, Clips = Z
☐ No broken audio URLs (404 check on all audio)
☐ No duplicate lessons across topics

SIGN-OFF: _________________ Date: _________
```

### 1.2 Freemium Model

```
P0:
☐ Freemium model decision documented (Free = unlimited content + limited speaking)
☐ MVP = Free tier only (no premium gates, no payment infrastructure)
☐ All 17 MVP features available without login
☐ Progress tracking works for logged-in users
☐ Guest mode works (browse without account)

P1:
☐ Future premium tier documented in Roadmap
☐ Pricing in VND (49k, 99k, 299k VND) documented
☐ Vietnam payment methods identified (VNPay, MoMo, ZaloPay)

SIGN-OFF: _________________ Date: _________
```

### 1.3 Core Learning Loop

```
P0:
☐ User can complete full flow: Landing → Topic → Lesson → Audio → Transcript → Score → Recording → Pronunciation → Complete
☐ Transcript scoring algorithm tested with known inputs
☐ Accuracy calculation verified: correct/total × 100
☐ XP awarded correctly on lesson completion
☐ Streak increments on first lesson of day
☐ Streak resets after 2+ day gap
☐ Streak uses user's local timezone

P1:
☐ Clip navigation works (next/prev)
☐ Lesson complete modal shows after last clip
☐ Confetti plays on lesson complete
☐ Reduced motion users see fade-only (no confetti)
☐ Progress saved to database on lesson completion

SIGN-OFF: _________________ Date: _________
```

### 1.4 Onboarding

```
P0:
☐ Onboarding wizard complete (4 steps: Goal → Level → Daily Goal → Preview)
☐ Onboarding completion flag saved to user profile
☐ New users see onboarding, returning onboarded users skip
☐ "Skip" option works on all onboarding steps
☐ Daily goal saved and used in dashboard
☐ Post-onboarding redirect: /onboarding → /dashboard

P1:
☐ Onboarding analytics tracking (funnel: step 1 → step 2 → ... → complete)
☐ Quick preview (1-clip mini lesson) functional

SIGN-OFF: _________________ Date: _________
```

### 1.5 Navigation & Discovery

```
P0:
☐ Topics page loads and displays topics
☐ Search bar filters topics (debounced)
☐ Filter chips work (All · IELTS · TOEIC · Daily · Business)
☐ Topic detail page shows lessons grouped by section
☐ "Continue" button shows for in-progress lessons
☐ "Next lesson" recommendation displayed
☐ Back navigation works throughout

P1:
☐ Sort options work (Popular · Newest · Alphabetical)
☐ Progress % shown per topic for logged-in users
☐ Empty search state shown correctly

SIGN-OFF: _________________ Date: _________
```

### 1.6 Audio Player

```
P0:
☐ Audio plays on Chrome desktop
☐ Audio plays on Safari iOS
☐ Audio plays on Android Chrome
☐ Play/pause works
☐ Progress bar updates in real-time
☐ Seeking by clicking progress bar works
☐ Seeking by dragging progress bar thumb works
☐ All 5 speeds work (0.5x, 0.75x, 1x, 1.25x, 1.5x)
☐ Skip forward 5 seconds works
☐ Skip backward 5 seconds works
☐ Error state shown when audio fails to load
☐ Retry button reloads audio

P1:
☐ Keyboard shortcuts: Space (play/pause), Arrow keys (skip)
☐ Loop clip mode works
☐ Volume control works (desktop)
☐ Mute toggle works
☐ Audio pauses when tab is backgrounded
☐ Loading state shown while audio loads
☐ Preload first clip on lesson load

SIGN-OFF: _________________ Date: _________
```

### 1.7 Transcript Input

```
P0:
☐ Textarea accepts input
☐ Word count updates in real-time
☐ Paste is blocked with tooltip
☐ Submit button disabled when textarea empty
☐ Ctrl+Enter submits form
☐ Score displays after submission (< 2 seconds)
☐ Accuracy count animates from 0 to value
☐ Word-level diff: green/red/gray/orange colors correct
☐ AI feedback displays below result
☐ "Retry" clears and refocuses
☐ "Continue" advances to next clip

P1:
☐ Clear button works
☐ Double-submit prevented (button disabled during submission)
☐ Mobile keyboard handles correctly (input above keyboard)
☐ Server validation error shows inline
☐ Loading state shown during submission
☐ Audio auto-pauses when submitting

SIGN-OFF: _________________ Date: _________
```

### 1.8 Speaking & Recording

```
P0:
☐ Microphone permission requested on first recording
☐ Permission denied state shown with guide
☐ Recording starts when record button tapped
☐ Timer counts up during recording
☐ Live waveform animates during recording
☐ Recording auto-stops at 30 seconds
☐ Manual stop button works
☐ Recorded audio plays back
☐ Re-record button resets to recording state
☐ Recording uploads to Supabase Storage
☐ Pronunciation score displays after recording
☐ Score breakdown shows (Accuracy · Fluency · Completeness)
☐ AI pronunciation tip displays
☐ "Re-record" resets to recording state
☐ "Continue" advances to next clip
☐ "Skip" advances without recording

P1:
☐ Web Speech API used on Chrome (free, no API key)
☐ Whisper API fallback works on Safari iOS
☐ Empty transcription shows retry option
☐ Recording minimum 1 second enforced
☐ Keyboard: Enter starts/stops recording
☐ Touch targets minimum 44x44px

SIGN-OFF: _________________ Date: _________
```

### 1.9 Progress & Stats

```
P0:
☐ Dashboard loads
☐ Total lessons count accurate
☐ Total time practiced accurate
☐ Average accuracy correct
☐ Current streak displays
☐ Current level + XP displays
☐ XP progress bar accurate
☐ Weekly activity chart shows 7 days
☐ Today's bar highlighted
☐ Personalized recommendation shows next lesson
☐ Stats update in real-time after lesson complete

P1:
☐ Empty state for new users
☐ Pull-to-refresh updates data
☐ Charts responsive on mobile

SIGN-OFF: _________________ Date: _________
```

### 1.10 History

```
P0:
☐ History page loads
☐ Paginated list (20 per page) works
☐ Lesson name, topic, date, accuracy shown per row
☐ Search filters results in real-time
☐ Topic filter works
☐ Accuracy filter works (≥60%, ≥80%, 100%)
☐ Lesson detail shows all clips
☐ Transcript comparison shown per clip
☐ Re-attempt button navigates to lesson

P1:
☐ Infinite scroll loads next page smoothly
☐ Pull-to-refresh updates list
☐ Multiple attempts tracked (attempt # badge)
☐ Empty state for new users

SIGN-OFF: _________________ Date: _________
```

### 1.11 Streak

```
P0:
☐ Streak counter in header displays
☐ Streak increments on first lesson of day
☐ Streak does NOT increment on subsequent lessons same day
☐ Streak resets to 0 after 1+ day gap
☐ longest_streak updates when current exceeds it
☐ 7-day milestone triggers celebration
☐ 30-day milestone triggers celebration
☐ XP bonus awarded at milestones

SIGN-OFF: _________________ Date: _________
```

---

## SECTION 2: UX READINESS

### 2.1 Responsive Design

```
P0:
☐ 320px: Single column, full-width buttons
☐ 320px: No horizontal overflow
☐ 375px: All features functional (iPhone standard)
☐ 768px: 2-column grids work
☐ 1024px+: Desktop layout renders correctly
☐ 1440px: Layout doesn't stretch too wide (max-width: 1200px)

P1:
☐ 768px: iPad tested
☐ 375px: iPhone tested (physical device or simulator)

SIGN-OFF: _________________ Date: _________
```

### 2.2 Mobile-Specific UX

```
P0:
☐ Bottom nav bar visible on mobile
☐ Top nav visible on desktop
☐ Bottom sheet modals work on mobile
☐ Safe area insets respected (iPhone notch + home indicator)
☐ Mobile keyboard handles (input scrolls into view)
☐ Touch targets minimum 44x44px on all interactive elements

P1:
☐ Swipe gestures for clip navigation
☐ Pull-to-refresh on lists
☐ Haptic feedback (where supported)

SIGN-OFF: _________________ Date: _________
```

### 2.3 Typography & Spacing

```
P0:
☐ Font family: Nimbus Sans (or Inter fallback)
☐ Font sizes correct per scale (H1 36px, H2 28px, H3 20px, Body 16px)
☐ Maximum content width: 1200px
☐ 8px base grid spacing
☐ Consistent border radius (sm 6px, md 12px, lg 16px)

P1:
☐ Font loading: No FOUT (flash of unstyled text)
☐ Font loading: No layout shift (reserve space)

SIGN-OFF: _________________ Date: _________
```

### 2.4 Visual Design

```
P0:
☐ Primary color: #35375B (verified in CSS)
☐ Accent color: #FF5632
☐ Success: #00BE7C
☐ Error: #FF3257
☐ All colors consistent across app

P1:
☐ Color contrast: --accent-dark on white for accessibility
☐ Color contrast: --warning-dark on white for accessibility
☐ Dark mode: NOT in MVP (Phase 2)

SIGN-OFF: _________________ Date: _________
```

### 2.5 Micro-interactions & Animation

```
P0:
☐ Page transitions smooth (Framer Motion)
☐ Button press states (scale, opacity)
☐ Loading states shown for all async operations
☐ prefers-reduced-motion respected (all animations disabled)

P1:
☐ Animations: 60fps, no jank
☐ Audio player progress bar: smooth updates
☐ Score count-up animation smooth
☐ Confetti: Canvas-confetti, performant

SIGN-OFF: _________________ Date: _________
```

### 2.6 Empty & Error States

```
P0:
☐ Topics empty state: "Chưa có bài học nào"
☐ History empty state: "Chưa có lịch sử học tập"
☐ Search no results: "Không tìm thấy kết quả"
☐ Dashboard new user state: "Chào mừng bạn!"

P1:
☐ Audio load error: Retry button + message
☐ Network error: Retry button + message
☐ API error: User-friendly message + retry
☐ Loading skeletons for content (not spinners)

SIGN-OFF: _________________ Date: _________
```

### 2.7 Loading States

```
P0:
☐ Topics page: Skeleton while loading
☐ Topic detail: Skeleton while loading
☐ Dashboard: Skeleton while loading
☐ History: Skeleton while loading
☐ Skeleton dimensions match real content

P1:
☐ Skeleton shimmer animation smooth
☐ Skeleton gray: #E5E7EB (light mode)
☐ Spinner only for <1s operations (buttons)

SIGN-OFF: _________________ Date: _________
```

---

## SECTION 3: TECHNICAL READINESS

### 3.1 Build & Deployment

```
P0:
☐ `npm run build` succeeds with zero errors
☐ `npm run lint` passes with zero errors
☐ `tsc --noEmit` passes with zero errors
☐ Vercel preview deployment succeeds
☐ Production deployment succeeds
☐ Environment variables configured on Vercel
☐ .env.example matches actual .env.local

P1:
☐ Build time < 3 minutes
☐ Bundle size < 200KB (initial JS)
☐ No console errors in production

SIGN-OFF: _________________ Date: _________
```

### 3.2 Database

```
P0:
☐ All 8 tables created in Supabase
☐ Primary keys on all tables
☐ Foreign keys enforced
☐ Indexes created for queried columns
☐ RLS policies configured on all user tables
☐ RLS: Users can only access own data
☐ RLS: Public can read topics/lessons/clips
☐ Triggers: updated_at auto-update
☐ Triggers: Streak calculation
☐ Triggers: daily_activity upsert

P1:
☐ Database migrations tracked in supabase/migrations/
☐ Fresh database can be seeded from migration
☐ Database backup configured (auto-backup daily)

SIGN-OFF: _________________ Date: _________
```

### 3.3 API Routes

```
P0:
☐ GET /api/topics — returns topics
☐ GET /api/topics/[slug] — returns topic with lessons
☐ GET /api/lessons/[id] — returns lesson with clips
☐ POST /api/listening/check — returns transcript score
☐ POST /api/speaking/upload — uploads recording
☐ POST /api/speaking/score — returns pronunciation score
☐ GET /api/progress/dashboard — returns stats
☐ GET /api/streak — returns streak data
☐ GET /api/history — returns paginated history
☐ GET /api/history/lessons/[id] — returns lesson detail
☐ GET /api/notifications — returns notifications
☐ PATCH /api/notifications/[id]/read — marks as read
☐ GET /api/settings — returns settings
☐ PATCH /api/settings — updates settings
☐ All endpoints return consistent JSON format
☐ All endpoints handle errors gracefully

P1:
☐ GET /api/progress/weekly — returns weekly stats
☐ POST /api/streak/freeze — activates freeze
☐ Rate limiting on transcript check endpoint
☐ Rate limiting on speaking transcription endpoint
☐ API response time P99 < 500ms

SIGN-OFF: _________________ Date: _________
```

### 3.4 Authentication

```
P0:
☐ Email/password registration creates user
☐ Email/password login works
☐ Google OAuth login works
☐ Session persists across page refresh
☐ Protected routes redirect to /auth/login when unauthenticated
☐ Logout clears session and redirects to /auth/login
☐ Token refresh works automatically
☐ Expired token redirects to login
☐ Guest mode allows browsing without account

P1:
☐ Password reset email sends successfully
☐ SSR auth works correctly (no hydration mismatch)
☐ Auth state accessible from any component
☐ Multi-tab logout sync works

SIGN-OFF: _________________ Date: _________
```

### 3.5 Security

```
P0:
☐ RLS blocks cross-user data access (tested)
☐ No SQL injection (parameterized queries only)
☐ No XSS vulnerability (React auto-escapes)
☐ HTTPS enforced on all routes
☐ Environment variables not committed to git
☐ No sensitive data in client-side code
☐ Supabase anon key not exposed as secret

P1:
☐ CSRF tokens on state-changing operations
☐ SameSite=Lax cookie attribute set
☐ Input validation on all API routes (Zod)
☐ Request body size limit enforced
☐ Rate limiting on auth endpoints
☐ Audit logging for auth events (login, logout, fail)

SIGN-OFF: _________________ Date: _________
```

### 3.6 Performance

```
P0:
☐ Lighthouse Performance > 85
☐ LCP < 2.5s
☐ FID < 100ms
☐ CLS < 0.1
☐ TTI < 3.5s

P1:
☐ Lighthouse Performance > 90
☐ Bundle size: Route-based code splitting
☐ Images: Next.js Image optimization
☐ Fonts: font-display: swap
☐ Audio: Preload first clip
☐ React Query: staleTime configured per query type

SIGN-OFF: _________________ Date: _________
```

### 3.7 Storage & CDN

```
P0:
☐ Audio files uploadable to Supabase Storage
☐ Recordings uploadable to Supabase Storage
☐ Audio files accessible via public URL
☐ Recording URLs are user-specific (signed)
☐ Storage bucket created and configured

P1:
☐ Supabase CDN configured for audio
☐ Recording auto-cleanup after 90 days

SIGN-OFF: _________________ Date: _________
```

### 3.8 Error Handling

```
P0:
☐ No unhandled exceptions in production
☐ Global error boundary catches React errors
☐ All API errors return user-friendly messages
☐ All error messages in Vietnamese
☐ Error recovery paths (retry buttons)

P1:
☐ Sentry error monitoring active
☐ Sentry captures API errors
☐ Sentry captures client-side errors
☐ Sentry alerts configured for P0 errors

SIGN-OFF: _________________ Date: _________
```

---

## SECTION 4: SEO READINESS

### 4.1 Meta Tags

```
P0:
☐ Landing page: Unique <title>
☐ Landing page: Unique <meta name="description">
☐ Landing page: Open Graph tags (title, description, image, url)
☐ Landing page: Twitter Card tags
☐ Topic pages: Unique <title> per topic
☐ Topic pages: Unique <meta description> per topic
☐ All pages: Canonical URLs set
☐ All pages: Semantic HTML (h1, h2, nav, main, article)

P1:
☐ OG image created and hosted
☐ OG image: 1200x630px
☐ OG image: Text overlay with brand

SIGN-OFF: _________________ Date: _________
```

### 4.2 Sitemap & Robots

```
P0:
☐ robots.txt exists and blocks /api/ routes
☐ sitemap.xml exists and contains all public pages
☐ sitemap.xml auto-updates with new topics
☐ Sitemap submitted to Google Search Console

P1:
☐ Sitemap includes topic detail pages
☐ Sitemap includes lesson pages (if public)

SIGN-OFF: _________________ Date: _________
```

### 4.3 Structured Data

```
P0:
☐ Homepage: WebSite JSON-LD schema
☐ Topic pages: BreadcrumbList JSON-LD schema

P1:
☐ Topic pages: Course JSON-LD schema (if applicable)
☐ Structured data passes Google Rich Results Test

SIGN-OFF: _________________ Date: _________
```

---

## SECTION 5: ANALYTICS READINESS

### 5.1 Analytics Setup

```
P0:
☐ Vercel Analytics enabled
☐ Page views tracked
☐ Core Web Vitals measured

P1:
☐ Google Analytics 4 configured
☐ GA4 receives page view events
☐ GA4 receives custom events:
    ├── lesson_started
    ├── lesson_completed
    ├── lesson_abandoned
    ├── speaking_attempted
    ├── speaking_completed
    ├── signup_completed
    ├── onboarding_completed
    └── error_occurred
☐ User properties set (level, streak)
☐ Google Search Console connected

SIGN-OFF: _________________ Date: _________
```

### 5.2 Monitoring

```
P0:
☐ Sentry error monitoring active
☐ Uptime monitoring active (e.g., UptimeRobot)
☐ API uptime: /api/topics responds < 200ms

P1:
☐ Dashboard: Real-time error count
☐ Alert: Error rate > 1% → notify
☐ Alert: API latency P99 > 1s → notify
☐ Alert: Deploy failure → notify

SIGN-OFF: _________________ Date: _________
```

---

## SECTION 6: TESTING READINESS

### 6.1 Unit Tests

```
P0:
☐ Transcript comparison algorithm tested (LCS)
☐ Scoring calculation tested (accuracy, XP)
☐ Pronunciation scoring tested
☐ XP level thresholds tested
☐ Streak increment logic tested
☐ Streak reset logic tested
☐ Date normalization tested (timezone)
☐ Zod validation schemas tested

TARGET: 80% coverage on scoring logic
DONE: _____% coverage

SIGN-OFF: _________________ Date: _________
```

### 6.2 Integration Tests

```
P0:
☐ Auth: Register → Login → Logout flow
☐ Auth: Protected route redirects correctly
☐ API: Topics endpoint returns data
☐ API: Listening check endpoint scores correctly
☐ API: Speaking score endpoint calculates correctly
☐ API: Progress dashboard aggregates correctly
☐ API: History pagination works

P1:
☐ Auth: Google OAuth flow end-to-end
☐ API: Rate limiting enforced
☐ API: Error responses are correct format

SIGN-OFF: _________________ Date: _________
```

### 6.3 E2E Tests (Playwright)

```
P0:
☐ E2E: User registers and completes onboarding
☐ E2E: User browses topics and selects lesson
☐ E2E: User completes full lesson (audio → transcript → score → complete)
☐ E2E: User records and submits speaking
☐ E2E: User views dashboard and history

P1:
☐ E2E: Mobile flow (320px viewport)
☐ E2E: Network error recovery
☐ E2E: Session expiry handling
☐ E2E: Microphone permission denied flow
☐ E2E: Full streak flow (complete → check → next day → verify)

SIGN-OFF: _________________ Date: _________
```

### 6.4 Cross-Browser Testing

```
P0:
☐ Chrome desktop: All features work
☐ Safari desktop: All features work
☐ Firefox desktop: All features work
☐ Edge desktop: All features work

P1:
☐ Safari iOS (iPhone): Audio + Recording
☐ Chrome Android: Audio + Recording
☐ iPad Safari: Layout correct

SIGN-OFF: _________________ Date: _________
```

### 6.5 Accessibility Testing

```
P0:
☐ All interactive elements keyboard accessible
☐ Focus visible on all interactive elements
☐ Tab order follows visual order
☐ No keyboard traps

P1:
☐ Color contrast: WCAG AA (4.5:1 text, 3:1 large text)
☐ Screen reader: Can navigate main flows
☐ prefers-reduced-motion respected
☐ Focus indicators: 2px solid, 2px offset
☐ aria-labels on all icon buttons
☐ Form inputs have associated labels

SIGN-OFF: _________________ Date: _________
```

### 6.6 Performance Testing

```
P0:
☐ Lighthouse Performance > 85 (desktop)
☐ Lighthouse Accessibility > 90
☐ Lighthouse SEO > 90
☐ Lighthouse Best Practices > 90

P1:
☐ Lighthouse Performance > 90 (desktop)
☐ Lighthouse Performance > 80 (mobile)
☐ API P99 latency < 500ms (100 concurrent users)
☐ Time to first audio playback < 1.5 seconds

SIGN-OFF: _________________ Date: _________
```

---

## SECTION 7: COMPLIANCE & LEGAL

### 7.1 Privacy & Data

```
P0:
☐ Privacy policy page created (in Vietnamese)
☐ Privacy policy states: What data is collected
☐ Privacy policy states: How data is used
☐ Privacy policy states: How to delete data
☐ Terms of service page created (in Vietnamese)
☐ Terms of service: User obligations
☐ Terms of service: Content license
☐ Cookie consent banner (if using analytics cookies)

P1:
☐ Data retention policy: Recordings 90 days
☐ Data retention policy: Progress: Lifetime (user account)
☐ User can export all data (JSON/CSV)
☐ User can delete account → 30-day process
☐ GDPR compliance: EU users (if any)

SIGN-OFF: _________________ Date: _________
```

### 7.2 Support

```
P0:
☐ Contact email configured (support@vinalisten.app)
☐ Support email monitored
☐ Response time: < 24 hours

P1:
☐ FAQ page created
☐ Help center started

SIGN-OFF: _________________ Date: _________
```

---

## FINAL SIGN-OFF

```
┌─────────────────────────────────────────────────────────────┐
│ LAUNCH READINESS VERIFICATION                               │
│                                                             │
│ Section 1: Product Readiness                               │
│   P0: _____/17 items passed                                │
│   P1: _____/22 items passed                                │
│                                                             │
│ Section 2: UX Readiness                                     │
│   P0: _____/17 items passed                                │
│   P1: _____/16 items passed                                │
│                                                             │
│ Section 3: Technical Readiness                               │
│   P0: _____/29 items passed                                │
│   P1: _____/21 items passed                                │
│                                                             │
│ Section 4: SEO Readiness                                    │
│   P0: _____/ 9 items passed                                │
│   P1: _____/ 6 items passed                                │
│                                                             │
│ Section 5: Analytics Readiness                              │
│   P0: _____/ 3 items passed                                │
│   P1: _____/ 8 items passed                                │
│                                                             │
│ Section 6: Testing Readiness                                │
│   P0: _____/29 items passed                                │
│   P1: _____/20 items passed                                │
│                                                             │
│ Section 7: Compliance & Legal                               │
│   P0: _____/ 8 items passed                                │
│   P1: _____/ 5 items passed                                │
│                                                             │
│─────────────────────────────────────────────────────────────│
│ TOTAL P0: _____/132 items (MUST ALL PASS)                 │
│ TOTAL P1: _____/ 98 items (IDEAL PASS)                    │
│                                                             │
│ LAUNCH BLOCKERS REMAINING: _____                           │
│                                                             │
│ RECOMMENDATION:                                            │
│ □ READY TO LAUNCH                                          │
│ □ NOT READY (blockers remaining)                           │
│                                                             │
│ Signed off by: _____________________                        │
│ Date: _____________________                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## QUICK REFERENCE: P0 PRIORITY ITEMS

```
P0 PRIORITY — Must fix before ANY deployment:

1. ☐ Content licensed (DailyDictation ToS or BBC/VOA)
2. ☐ Full learning loop works end-to-end
3. ☐ Transcript scoring algorithm accurate
4. ☐ Audio plays on Chrome, Safari iOS, Android
5. ☐ Recording works on Chrome, Safari iOS, Android
6. ☐ RLS tested and blocks cross-user access
7. ☐ HTTPS enforced
8. ☐ Protected routes redirect unauthenticated users
9. ☐ Build succeeds (npm run build)
10. ☐ Lighthouse Performance > 85
11. ☐ No horizontal overflow at 320px
12. ☐ Privacy policy published
13. ☐ Terms of service published
14. ☐ Sentry error monitoring active
15. ☐ All API endpoints return correct format
16. ☐ No console errors in production
17. ☐ Database migrations applied and tested

P0 = LAUNCH BLOCKER.
No deployment until all 17 pass.
```

---

*Document End — VinaListen Launch Readiness Checklist v1.0*
