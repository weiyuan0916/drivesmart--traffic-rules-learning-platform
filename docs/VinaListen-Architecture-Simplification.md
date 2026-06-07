# VinaListen — Architecture Simplification
## Solo Developer · Zero Budget · Maximum Launch Speed

**Date:** 2026-06-07  
**Version:** 1.0  
**Perspective:** Solo founder, near-zero budget, fastest path to launch  
**Based on:** Full documentation review + cost analysis

---

## EXECUTIVE SUMMARY

```
┌─────────────────────────────────────────────────────────────────────┐
│  CURRENT PLAN:      264 hours · 12 weeks · 17 documents            │
│  SIMPLIFIED PLAN:   120 hours · 6 weeks · 8 documents             │
│                                                                      │
│  SAVINGS:           144 hours (55% reduction)                       │
│  TIME SAVED:        6 weeks                                         │
│                                                                      │
│  CORE LOOP REDUCED TO:                                              │
│  Listen → Type Transcript → Get Score → Progress → Come Back        │
│                                                                      │
│  REMOVED FROM MVP:                                                  │
│  Speaking (40h), Vocabulary (24h), Achievements (16h)              │
│  Leaderboard (16h), Notifications (20h), PWA offline (24h)          │
│                                                                      │
│  OPERATING COST: $0-1/month for 0-100 MAU                          │
│  (Whisper = $0 with Web Speech API as primary)                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 1: KEEP — Essential for Launch

### K-1: Core Learning Loop (Listen → Type → Score)

```
┌─────────────────────────────────────────────────────────────────────┐
│  WHY KEEP                                                          │
│  ├── This IS the product. Nothing else matters if this is broken.  │
│  ├── Listen + Type + Score = 80% of user value                     │
│  ├── Simplest possible monetization hook                            │
│  └── Can validate product-market fit with this alone                 │
│                                                                      │
│  INCLUDES:                                                         │
│  ├── Topics listing page                                            │
│  ├── Lesson selection                                               │
│  ├── Audio player (basic: play, pause, seek, speed)               │
│  ├── Transcript textarea (input, word count, submit)                │
│  ├── LCS-based scoring algorithm                                     │
│  ├── Word-level diff display (green/red/gray/orange)              │
│  ├── Accuracy + XP display                                          │
│  ├── Clip navigation (next/prev)                                   │
│  └── Lesson complete state (confetti optional)                      │
│                                                                      │
│  REMOVED:                                                          │
│  ├── Loop clip mode (complexity, marginal value)                    │
│  ├── Keyboard shortcuts UI (nice-to-have)                           │
│  └── Touch gestures (swipe) — basic buttons sufficient              │
│                                                                      │
│  TIME SAVED: 8 hours                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### K-2: Basic Authentication (Email + Google)

```
┌─────────────────────────────────────────────────────────────────────┐
│  WHY KEEP                                                          │
│  ├── Required for any progress tracking                             │
│  ├── Google OAuth = lowest friction signup                          │
│  └── Guest mode = optional (browse without account)                 │
│                                                                      │
│  INCLUDES:                                                         │
│  ├── Email + password (register, login, logout)                    │
│  ├── Google OAuth                                                   │
│  ├── Session persistence                                            │
│  ├── Protected routes                                               │
│  ├── Password reset                                                 │
│  └── Guest mode (browse only, no progress saved)                    │
│                                                                      │
│  SIMPLIFIED:                                                       │
│  ├── NO Apple OAuth (add Phase 2)                                  │
│  ├── NO magic link (email/password sufficient)                       │
│  └── NO multi-tab session sync (add Phase 2)                       │
│                                                                      │
│  TIME SAVED: 4 hours                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### K-3: Basic Progress & Streak

```
┌─────────────────────────────────────────────────────────────────────┐
│  WHY KEEP                                                          │
│  ├── Streak = #1 retention mechanic for daily habit apps            │
│  ├── Progress = proof of learning (psychological value)            │
│  └── Without these, users have no reason to return                  │
│                                                                      │
│  INCLUDES:                                                         │
│  ├── Dashboard: total lessons, avg accuracy, streak, XP           │
│  ├── Weekly chart (7-day bar chart)                                │
│  ├── Streak counter in header                                      │
│  ├── Streak milestone celebrations (7, 30, 100 days)              │
│  ├── XP system with levels                                         │
│  └── Basic history (list of completed lessons)                      │
│                                                                      │
│  SIMPLIFIED:                                                       │
│  ├── NO monthly calendar heatmap (Phase 2)                         │
│  ├── NO streak freeze (Phase 2)                                    │
│  ├── NO streak calendar view (Phase 2)                             │
│  └── NO streak push notifications (Phase 2)                         │
│                                                                      │
│  TIME SAVED: 16 hours                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### K-4: Onboarding (Minimal — 4 Steps)

```
┌─────────────────────────────────────────────────────────────────────┐
│  WHY KEEP                                                          │
│  ├── 40-60% churn at first experience without it                   │
│  └── Sets daily goal anchor for streak                            │
│                                                                      │
│  INCLUDES (4 steps):                                               │
│  ├── Step 1: Goal (IELTS / TOEIC / Daily / Business)              │
│  ├── Step 2: Level (Beginner / Intermediate / Advanced)            │
│  ├── Step 3: Daily time (5 / 10 / 20 / 30 min)                   │
│  └── Step 4: Quick preview (1 clip, 30 seconds)                   │
│                                                                      │
│  REMOVED:                                                          │
│  ├── NO onboarding analytics (Phase 2)                             │
│  ├── NO proficiency quiz (too complex)                             │
│  └── NO avatar selection (Phase 2)                                 │
│                                                                      │
│  TIME SAVED: 8 hours                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### K-5: Landing Page (Basic)

```
┌─────────────────────────────────────────────────────────────────────┐
│  WHY KEEP                                                          │
│  ├── Required for SEO + user acquisition                          │
│  └── No landing page = no way to acquire users                     │
│                                                                      │
│  INCLUDES:                                                         │
│  ├── Hero section (headline + CTA)                                 │
│  ├── Topics preview (from database)                                │
│  ├── How It Works (3 steps)                                        │
│  └── Footer (links, privacy, terms)                                │
│                                                                      │
│  REMOVED:                                                          │
│  ├── NO FAQ section (add Phase 2)                                 │
│  ├── NO testimonials carousel                                       │
│  ├── NO video demo                                                 │
│  ├── NO features comparison table                                   │
│  ├── NO blog/SEO content                                           │
│  └── NO social proof stats (add after launch)                      │
│                                                                      │
│  TIME SAVED: 8 hours                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### K-6: Basic Mobile Responsive

```
┌─────────────────────────────────────────────────────────────────────┐
│  WHY KEEP                                                          │
│  ├── 60%+ of Vietnamese internet users are on mobile                 │
│  └── 320px minimum required for iPhone SE                          │
│                                                                      │
│  INCLUDES:                                                         │
│  ├── 320px single column layout                                    │
│  ├── Mobile keyboard handling (textarea scrolls into view)         │
│  ├── Bottom nav bar (mobile)                                       │
│  ├── Top nav bar (desktop)                                         │
│  └── Safe area insets (iPhone notch + home indicator)              │
│                                                                      │
│  REMOVED:                                                          │
│  ├── NO bottom sheet result panels (stack layout is fine)           │
│  ├── NO swipe gestures (buttons are sufficient)                    │
│  └── NO pull-to-refresh (add Phase 2)                             │
│                                                                      │
│  TIME SAVED: 8 hours                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### K-7: Supabase (Free Tier)

```
┌─────────────────────────────────────────────────────────────────────┐
│  WHY KEEP                                                          │
│  ├── PostgreSQL + Auth + Storage + RLS in one service             │
│  ├── Free tier: 500MB DB, 1GB storage, 50K MAU                   │
│  └── Easiest to implement for solo developer                       │
│                                                                      │
│  INCLUDES:                                                         │
│  ├── Database (all tables, indexes, triggers, RLS)                 │
│  ├── Supabase Auth                                                 │
│  └── Supabase Storage (audio + recordings)                         │
│                                                                      │
│  SIMPLIFIED:                                                       │
│  ├── NO analytics dashboard (Supabase has built-in)                 │
│  └── NO real-time subscriptions (polling is fine for MVP)          │
│                                                                      │
│  COST: $0 for 0-100 MAU                                           │
│  UPGRADE: $25/month at 1K MAU                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### K-8: Web Speech API (Primary Speech Recognition)

```
┌─────────────────────────────────────────────────────────────────────┐
│  WHY KEEP                                                          │
│  ├── Browser-native, $0 cost                                      │
│  ├── Covers 70% of users (Chrome + Edge)                          │
│  └── NO Whisper API bill                                          │
│                                                                      │
│  FALLBACK:                                                         │
│  ├── Safari/Firefox: Whisper trial credits ($5 free)              │
│  └── Limit: 50 transcriptions/day for Safari users                 │
│                                                                      │
│  REMOVED FROM MVP:                                                 │
│  ├── NO full speaking module (recording + scoring)                 │
│  │   └── Speaking = 40 hours of work. Move to Phase 2.            │
│  └── NO pronunciation tips (rule-based AI removed with speaking)   │
│                                                                      │
│  COST: $0/month (vs $2-60/month with Whisper)                     │
│  TIME SAVED: 40 hours                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 2: SIMPLIFY — Reduce Scope

### S-1: Database Schema

```
┌─────────────────────────────────────────────────────────────────────┐
│  CURRENT: 11 tables with complex triggers                          │
│  SIMPLIFIED: 7 tables, fewer triggers                             │
└─────────────────────────────────────────────────────────────────────┘

REMOVE:
├── user_daily_usage (speaking-related, not needed without speaking)
├── vocabulary_learning (Phase 2)
├── user_notifications (Phase 2)
├── user_settings (merge into auth.users)

SIMPLIFY:
├── NO materialized views (complex, add in Phase 2)
├── NO generated columns (computed in app, not DB)
├── streak calculation → App logic, not DB trigger
└── daily_activity → Simple INSERT (not UPSERT trigger complexity)

SAVED: 8 hours of DB complexity
```

### S-2: TanStack Query + Zustand

```
┌─────────────────────────────────────────────────────────────────────┐
│  CURRENT: 6-layer state management architecture                     │
│  SIMPLIFIED: 3 layers max                                          │
└─────────────────────────────────────────────────────────────────────┘

KEEP:
├── TanStack Query (data fetching + caching)
├── Zustand (auth state + audio player state)
└── React useState (local UI state)

REMOVE:
├── nuqs (URL state — use simple URL params instead)
├── Zustand persistence (not needed for MVP)
└── Complex middleware (not needed at MVP scale)

SAVED: 4 hours of architecture complexity
```

### S-3: Framer Motion

```
┌─────────────────────────────────────────────────────────────────────┐
│  CURRENT: Framer Motion throughout                                   │
│  SIMPLIFIED: CSS transitions + CSS animations only                 │
└─────────────────────────────────────────────────────────────────────┘

REASON:
├── Framer Motion = additional 50KB bundle
├── MVP animations are simple (fade, translate, scale)
├── CSS transitions handle 90% of use cases
├── Save dependency for Phase 2 (when more complex animations needed)

KEEP:
├── CSS transitions (e.g., button press, tab switching)
├── CSS keyframe animations (e.g., shimmer skeleton, confetti)
├── CSS animations for loading states

REMOVE:
├── Framer Motion package entirely
├── Motion components in code
└── AnimatePresence wrappers

SAVED: 4 hours + bundle size reduction
```

### S-4: Error Handling (Simplified)

```
┌─────────────────────────────────────────────────────────────────────┐
│  CURRENT: Sentry + ErrorBoundary + Toast + Fallback UI             │
│  SIMPLIFIED: React ErrorBoundary + simple toast                     │
└─────────────────────────────────────────────────────────────────────┘

KEEP:
├── Global React ErrorBoundary (prevents white screen)
├── Toast notifications (success/error/warning)
└── User-friendly error messages in Vietnamese

REMOVE:
├── Sentry (add Phase 2 when you have budget)
├── Error monitoring dashboards
├── Automatic error reporting
└── Sentry alerts

IMPLEMENT INSTEAD:
├── Try/catch in every API handler
├── Global error page (app/error.tsx)
└── Simple console.log for debugging (dev only)

SAVED: 4 hours setup + $0/month monitoring cost
```

### S-5: PWA (Manifest Only)

```
┌─────────────────────────────────────────────────────────────────────┐
│  CURRENT: Full PWA (manifest + service worker + offline caching)   │
│  SIMPLIFIED: manifest.json only                                    │
└─────────────────────────────────────────────────────────────────────┘

KEEP:
├── manifest.json (app name, icons, theme, display: standalone)
├── Meta viewport
└── Basic meta tags

REMOVE:
├── Service worker (offline caching)
├── Background sync
├── Install prompt
├── Offline audio download
└── PWA update notification

WHY:
├── Service worker = 16-24 hours of work
├── Offline not critical for MVP (most users have connectivity)
├── "Add to Home Screen" works with manifest.json alone
└── Service worker is Phase 3 work

SAVED: 20 hours
```

### S-6: API Rate Limiting

```
┌─────────────────────────────────────────────────────────────────────┐
│  CURRENT: Rate limiting on every endpoint with Redis/Upstash        │
│  SIMPLIFIED: Client-side limit only for MVP                        │
└─────────────────────────────────────────────────────────────────────┘

KEEP:
├── Client-side soft limits (show message, don't block)
├── Supabase built-in rate limiting (free tier)
└── Simple server-side checks (e.g., max transcript length)

REMOVE:
├── Vercel Edge Middleware rate limiting
├── Upstash Redis for rate limits
├── Per-user rate limit tracking
└── 429 response logic

IMPLEMENT INSTEAD:
├── Warn users when they hit soft limits (e.g., "Bạn đã học 10 bài!")
├── Supabase's built-in anonymous rate limiting is sufficient for MVP
└── Add proper rate limiting when monetization starts (Phase 3)

SAVED: 8 hours + $0/month (no Upstash cost)
```

### S-7: SEO (Minimal)

```
┌─────────────────────────────────────────────────────────────────────┐
│  CURRENT: Full SEO (sitemap, structured data, blog, schema)        │
│  SIMPLIFIED: Basic meta tags only                                  │
└─────────────────────────────────────────────────────────────────────┘

KEEP:
├── Unique title + description per page
├── Open Graph tags on landing page
└── Semantic HTML

REMOVE:
├── JSON-LD structured data (add Phase 2)
├── Sitemap.xml (add Phase 2)
├── robots.txt (Vercel handles this)
├── FAQ schema markup
├── Course schema
└── Blog with 2 posts/week (Phase 3)

WHY:
├── SEO work = 8 hours. Better spent on core loop.
├── Product needs real users before SEO matters
├── Add SEO when you have content and traffic data

SAVED: 8 hours
```

---

## PART 3: REMOVE — Not MVP

These features are permanently removed from the MVP plan.

### R-1: Speaking Module (40 hours — BIGGEST CUT)

```
┌─────────────────────────────────────────────────────────────────────┐
│  REMOVED FROM MVP                                                   │
│                                                                      │
│  WHAT IT INCLUDES (was 40 hours):                                  │
│  ├── Voice recording component (12h)                                 │
│  ├── Speech recognition (12h)                                       │
│  ├── Pronunciation scoring (8h)                                     │
│  └── Speaking result UI (8h)                                        │
│                                                                      │
│  REASON:                                                           │
│  ├── $2-60/month Whisper API cost                                  │
│  ├── 40 hours = biggest single chunk of work                      │
│  ├── Core loop works without speaking                               │
│  ├── Can validate PMF with listen-only product                     │
│  └── Speaking can be Phase 2 differentiator                        │
│                                                                      │
│  ADD BACK IN PHASE 2 AS:                                            │
│  ├── "Speaking Practice" — premium feature                          │
│  ├── Use Web Speech API (free for 70% users)                       │
│  └── Whisper only for Safari (30% users)                           │
│                                                                      │
│  PRODUCT IMPACT:                                                    │
│  ├── Some users will want speaking practice                         │
│  ├── But: Listen-only is still a complete product                  │
│  └── Users can practice listening NOW, speaking comes later         │
│                                                                      │
│  TIME SAVED: 40 hours (15% of total backlog)                       │
└─────────────────────────────────────────────────────────────────────┘
```

### R-2: Vocabulary Module (24 hours)

```
┌─────────────────────────────────────────────────────────────────────┐
│  REMOVED FROM MVP                                                   │
│                                                                      │
│  WHAT IT INCLUDES:                                                 │
│  ├── Post-lesson vocabulary panel (8h)                              │
│  ├── Vocabulary notebook page (8h)                                 │
│  ├── SM-2 spaced repetition algorithm (8h)                          │
│  └── Vocabulary UI components                                        │
│                                                                      │
│  REASON:                                                           │
│  ├── Crawler data includes vocab but no UI designed                  │
│  ├── SM-2 algorithm is complex to implement correctly               │
│  ├── Users can learn without explicit vocabulary module             │
│  └── 24 hours = 2 weeks of work for solo developer                 │
│                                                                      │
│  ADD BACK IN PHASE 2 AS:                                            │
│  ├── Simple vocabulary list (no SM-2, just bookmarking)             │
│  └── Spaced repetition is Phase 3 work                             │
│                                                                      │
│  TIME SAVED: 24 hours                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### R-3: Achievements & Badges (16 hours)

```
┌─────────────────────────────────────────────────────────────────────┐
│  REMOVED FROM MVP                                                   │
│                                                                      │
│  WHAT IT INCLUDES:                                                 │
│  ├── Achievement definitions (15-20 types)                          │
│  ├── Achievement table + unlock logic                              │
│  ├── Badge design + SVG icons                                      │
│  └── Profile badge showcase UI                                      │
│                                                                      │
│  REASON:                                                           │
│  ├── Streak milestones cover the basic achievement need              │
│  ├── Badge design requires designer time                           │
│  ├── Too early to define achievements (no user data yet)          │
│  └── Define achievements AFTER you see what users actually do       │
│                                                                      │
│  ADD BACK IN PHASE 2 AS:                                            │
│  ├── Data-driven achievements (based on real user behavior)         │
│  └── Badge icons can be created with simple SVGs                    │
│                                                                      │
│  TIME SAVED: 16 hours                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### R-4: Leaderboard (16 hours)

```
┌─────────────────────────────────────────────────────────────────────┐
│  REMOVED FROM MVP                                                   │
│                                                                      │
│  WHAT IT INCLUDES:                                                 │
│  ├── Supabase Realtime subscriptions (8h)                          │
│  ├── Leaderboard API + UI (4h)                                      │
│  └── Top 100 queries + pagination                                   │
│                                                                      │
│  REASON:                                                           │
│  ├── Needs real-time infrastructure (complex)                       │
│  ├── Social features need users first                               │
│  ├── Gamification without users = empty leaderboard                 │
│  └── Polling every 60s is fine for MVP (Phase 2 upgrade)          │
│                                                                      │
│  ADD BACK IN PHASE 2:                                              │
│  ├── Simple polling leaderboard (every 5 min)                       │
│  └── Supabase Realtime when you have budget                        │
│                                                                      │
│  TIME SAVED: 16 hours                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### R-5: Push Notifications (20 hours)

```
┌─────────────────────────────────────────────────────────────────────┐
│  REMOVED FROM MVP                                                   │
│                                                                      │
│  WHAT IT INCLUDES:                                                 │
│  ├── Service worker setup (8h)                                     │
│  ├── Web Push API integration (4h)                                 │
│  ├── Cron jobs for scheduling (4h)                                 │
│  ├── Permission flow design (4h)                                   │
│  └── Notification templates                                        │
│                                                                      │
│  REASON:                                                           │
│  ├── Complex + time-consuming to implement                         │
│  ├── Notification fatigue if not carefully designed               │
│  ├── In-app streak counter is sufficient for MVP                   │
│  └── Push is Phase 2 retention feature                            │
│                                                                      │
│  REPLACED WITH (MVP):                                              │
│  ├── Streak shown in header (always visible)                       │
│  ├── "Streak at risk" shown in-app on dashboard (at 9pm)         │
│  └── Email digest (if any) via simple cron                         │
│                                                                      │
│  ADD BACK IN PHASE 2:                                              │
│  ├── Push notifications (after PWA is set up)                      │
│  ├── Notification scheduling logic                                  │
│  └── Permission flow                                               │
│                                                                      │
│  TIME SAVED: 20 hours                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### R-6: Custom Analytics (8 hours)

```
┌─────────────────────────────────────────────────────────────────────┐
│  REMOVED FROM MVP                                                   │
│                                                                      │
│  WHAT IT INCLUDES:                                                 │
│  ├── Google Analytics 4 setup (4h)                                │
│  ├── Custom event tracking                                         │
│  └── Analytics dashboard                                           │
│                                                                      │
│  REASON:                                                           │
│  ├── Supabase has built-in analytics (sufficient for MVP)          │
│  ├── Vercel Analytics is free + already integrated                 │
│  ├── GA4 requires cookie consent (complex for MVP)                 │
│  └── You need users before analytics matter                        │
│                                                                      │
│  REPLACED WITH:                                                    │
│  ├── Vercel Analytics (free, built-in)                             │
│  └── Supabase dashboard (built-in metrics)                         │
│                                                                      │
│  ADD BACK IN PHASE 2:                                              │
│  ├── GA4 when you have budget and traffic                          │
│  └── Custom funnel analysis                                        │
│                                                                      │
│  TIME SAVED: 8 hours + $0/month analytics cost                     │
└─────────────────────────────────────────────────────────────────────┘
```

### R-7: Dark Mode (8 hours)

```
┌─────────────────────────────────────────────────────────────────────┐
│  REMOVED FROM MVP                                                   │
│                                                                      │
│  WHAT IT INCLUDES:                                                 │
│  ├── CSS custom properties for theming                             │
│  ├── Tailwind dark: variant                                        │
│  ├── OS preference detection                                       │
│  └── Manual toggle + persistence                                   │
│                                                                      │
│  REASON:                                                           │
│  ├── Light mode is sufficient for MVP                              │
│  ├── Every component needs dual color tokens = testing ×2          │
│  ├── QA time doubles for dark mode                                 │
│  └── Users can request dark mode in Phase 2                        │
│                                                                      │
│  ADD BACK IN PHASE 2:                                              │
│  ├── Dark mode with CSS variables                                   │
│  └── User preference toggle                                         │
│                                                                      │
│  TIME SAVED: 8 hours + QA time                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### R-8: Advanced Accessibility (12 hours)

```
┌─────────────────────────────────────────────────────────────────────┐
│  REMOVED FROM MVP (partially)                                      │
│                                                                      │
│  WHAT TO SIMPLIFY:                                                 │
│  ├── Full WCAG AA audit (remove — do basic checks instead)         │
│  ├── Screen reader testing with NVDA/VoiceOver (skip)              │
│  ├── Accessibility audit of every component (skip)                 │
│  └── prefers-reduced-motion deep integration (basic only)           │
│                                                                      │
│  KEEP (MVP basic):                                                 │
│  ├── Keyboard navigation (Tab, Enter, Escape)                        │
│  ├── Focus visible indicators                                       │
│  ├── Color contrast basics (don't use #FF5632 on white)           │
│  ├── aria-labels on icon buttons                                   │
│  └── Touch targets 44×44px minimum                                │
│                                                                      │
│  REASON:                                                           │
│  ├── Full accessibility audit = 12 hours of testing                │
│  ├── Basic accessibility covers 90% of needs                      │
│  ├── Accessibility improvements are iterative                       │
│  └── Add formal audit when you have resources                      │
│                                                                      │
│  TIME SAVED: 12 hours                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 4: POSTPONE — Phase 2+

### P-1: Speaking Practice → Phase 2

```
┌─────────────────────────────────────────────────────────────────────┐
│  POSTPONE: Phase 2                                                  │
│  ESTIMATED: 40 hours                                               │
│  DEPENDENCY: None (can build standalone)                           │
│                                                                      │
│  WHEN TO ADD:                                                      │
│  ├── After basic listening loop is validated                       │
│  ├── When you have budget for Whisper (~$10/month)                 │
│  └── When users ask for it                                         │
│                                                                      │
│  DELIVERY:                                                         │
│  ├── Recording component (MediaRecorder API)                        │
│  ├── Web Speech API primary + Whisper fallback                     │
│  ├── Pronunciation scoring                                         │
│  └── Speaking result UI                                            │
└─────────────────────────────────────────────────────────────────────┘
```

### P-2: Vocabulary + Spaced Repetition → Phase 2

```
┌─────────────────────────────────────────────────────────────────────┐
│  POSTPONE: Phase 2                                                  │
│  ESTIMATED: 24 hours                                               │
│  DEPENDENCY: None                                                  │
│                                                                      │
│  WHEN TO ADD:                                                      │
│  ├── After users complete 50+ lessons                              │
│  └── When you have data on which words users miss most              │
│                                                                      │
│  DELIVERY:                                                         │
│  ├── Post-lesson vocabulary panel (save words)                      │
│  ├── Vocabulary notebook page (simple list)                          │
│  └── SM-2 algorithm (Phase 3 if requested)                         │
└─────────────────────────────────────────────────────────────────────┘
```

### P-3: Leaderboard → Phase 2

```
┌─────────────────────────────────────────────────────────────────────┐
│  POSTPONE: Phase 2                                                  │
│  ESTIMATED: 16 hours                                               │
│  DEPENDENCY: Real user base                                        │
│                                                                      │
│  WHEN TO ADD:                                                      │
│  ├── After 100+ active users                                        │
│  └── When leaderboard won't be empty                                │
│                                                                      │
│  DELIVERY:                                                         │
│  ├── Simple polling leaderboard (every 5 min)                       │
│  ├── Supabase Realtime upgrade (Phase 3)                            │
│  └── Anonymous display options                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### P-4: Push Notifications → Phase 2

```
┌─────────────────────────────────────────────────────────────────────┐
│  POSTPONE: Phase 2                                                  │
│  ESTIMATED: 20 hours                                               │
│  DEPENDENCY: Service worker (adds PWA offline too)                  │
│                                                                      │
│  WHEN TO ADD:                                                      │
│  ├── After PWA is set up (service worker ready)                    │
│  └── When you have retention data (know WHEN to send)               │
│                                                                      │
│  DELIVERY:                                                         │
│  ├── Web Push API                                                 │
│  ├── Notification scheduling                                        │
│  └── Streak reminder, at-risk, comeback flows                       │
└─────────────────────────────────────────────────────────────────────┘
```

### P-5: Payments + Freemium → Phase 3

```
┌─────────────────────────────────────────────────────────────────────┐
│  POSTPONE: Phase 3                                                  │
│  ESTIMATED: 40 hours                                               │
│  DEPENDENCY: Product-market fit validated                           │
│                                                                      │
│  WHEN TO ADD:                                                      │
│  ├── After 100+ MAU with good retention                           │
│  └── When you need revenue to cover costs                          │
│                                                                      │
│  DELIVERY:                                                         │
│  ├── Premium tiers (Starter 49K VND, Pro 99K VND)                  │
│  ├── VNPay/MoMo/ZaloPay integration                               │
│  ├── Speaking limit gates                                           │
│  ├── Subscription management                                        │
│  └── Upgrade nudge UX                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### P-6: Offline Mode + Service Worker → Phase 3

```
┌─────────────────────────────────────────────────────────────────────┐
│  POSTPONE: Phase 3                                                  │
│  ESTIMATED: 24 hours                                               │
│  DEPENDENCY: Service worker baseline                               │
│                                                                      │
│  WHEN TO ADD:                                                      │
│  ├── After basic PWA is working                                     │
│  └── When users request offline access                             │
│                                                                      │
│  DELIVERY:                                                         │
│  ├── Service worker with Workbox                                    │
│  ├── Offline audio caching (selected lessons)                        │
│  ├── Background sync for progress                                   │
│  └── Offline-first UX states                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### P-7: Achievements + Gamification → Phase 2

```
┌─────────────────────────────────────────────────────────────────────┐
│  POSTPONE: Phase 2                                                  │
│  ESTIMATED: 16 hours                                               │
│  DEPENDENCY: User behavior data                                     │
│                                                                      │
│  WHEN TO ADD:                                                      │
│  ├── After you know what users actually do                         │
│  ├── After streak system is proven (users come back)                │
│  └── When you have data to define meaningful achievements            │
│                                                                      │
│  DELIVERY:                                                         │
│  ├── Data-driven achievement definitions                            │
│  ├── Badge design (simple SVGs)                                     │
│  └── Achievement showcase UI                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### P-8: AI Coach + Pronunciation AI → Phase 4

```
┌─────────────────────────────────────────────────────────────────────┐
│  POSTPONE: Phase 4                                                  │
│  ESTIMATED: 40+ hours                                              │
│  DEPENDENCY: Gemini API budget, user base                          │
│                                                                      │
│  WHEN TO ADD:                                                      │
│  ├── After product-market fit confirmed                             │
│  └── When premium revenue covers AI costs                           │
│                                                                      │
│  DELIVERY:                                                         │
│  ├── AI chat tutor (Gemini Flash)                                   │
│  ├── Vietnamese accent phonetic patterns                            │
│  ├── Personalized learning recommendations                          │
│  └── Smart analysis + learning patterns                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 5: BOTTLENECK ANALYSIS

### Critical Bottlenecks

```
┌─────────────────────────────────────────────────────────────────────┐
│  BOTTLENECK 1: Supabase Free Tier at 1K MAU                        │
│                                                                      │
│  ISSUE: Database 500MB limit reached at ~50 users with full progress  │
│  STORAGE: 1GB limit reached at ~100 user recordings                 │
│  BANDWIDTH: 2GB/month limit at ~20 DAU                            │
│                                                                      │
│  TRIGGER: Month 1-3 at 1K MAU                                       │
│                                                                      │
│  SOLUTION:                                                          │
│  ├── Monitor usage monthly                                          │
│  ├── Delete old recordings (auto, 30 days)                          │
│  ├── Upgrade to Supabase Pro ($25/month) when limit hit             │
│  └── This is the RIGHT time to upgrade (revenue = users)             │
│                                                                      │
│  COST AFTER UPGRADE: $25/month (~$620K VND)                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  BOTTLENECK 2: Whisper API Cost at Scale                           │
│                                                                      │
│  ISSUE: $2-60/month growing with users who use speaking             │
│  PROBLEM: At 1K MAU with 20% speaking = $60/month                   │
│                                                                      │
│  SOLUTION (in order):                                               │
│  1. Web Speech API primary → $0 for 70% users                       │
│  2. Whisper only for Safari (~30%) → $18/month instead of $60       │
│  3. Cache transcriptions 7 days → 40% reduction                      │
│  4. Set OpenAI budget cap at $20                                    │
│  5. Speaking = premium feature (Phase 3) → cost shift               │
│                                                                      │
│  COST AFTER OPTIMIZATION: $3-10/month at 1K MAU                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  BOTTLENECK 3: Solo Developer Time                                  │
│                                                                      │
│  ISSUE: 264 hours = 6+ months at 20h/week                           │
│  PROBLEM: Scope creep kills startups                                │
│                                                                      │
│  SOLUTION: This document. Cut to 120 hours = 6 weeks               │
│  RULES:                                                            │
│  ├── No feature adds more than 4 hours without approval              │
│  ├── Every "nice to have" goes to Phase 2 backlog                   │
│  ├── If it's not in this document, it's not in MVP                  │
│  └── Weekly scope review: "Can this wait?"                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Medium Bottlenecks

```
BOTTLENECK 4: No CDN for Audio
├── Supabase CDN is included (Pro) = OK
├── At 100 DAU, audio is cached = fine
└── Add Cloudflare at 1K MAU if slow

BOTTLENECK 5: Single Developer
├── No redundancy if you get sick/busy
├── MITIGATION: Write documentation as you build
├── MITIGATION: Simple architecture = easier to resume
└── MITIGATION: Weekly commits = backup of progress

BOTTLENECK 6: Content Dependency
├── Single source of content (DailyDictation)
├── MITIGATION: Legal check Week 0 (before code)
├── MITIGATION: BBC/VOA backup sources ready
└── MITIGATION: Content is not IP-protected (educational fair use)
```

---

## PART 6: OPERATING COST ANALYSIS

### Realistic Budget

```
┌─────────────────────────────────────────────────────────────────────┐
│  MONTH 1-3 (0-100 MAU, Pre-Revenue)                               │
│                                                                      │
│  Supabase Free Tier      $0                                         │
│  Vercel Hobby           $0                                         │
│  Web Speech API        $0                                         │
│  Whisper (Safari only)  $0-2    (~$5 OpenAI credits)               │
│  Domain                $1-2    (~$15/year .app)                    │
│  ─────────────────────────────────                                 │
│  TOTAL                 $1-4/month                                    │
│                       ~25K-100K VND                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  MONTH 4-6 (100-500 MAU, Early Revenue)                            │
│                                                                      │
│  Supabase Pro           $25      (when limits hit)                   │
│  Vercel Hobby          $0-20    (upgrade if bandwidth exceeded)      │
│  Web Speech API        $0                                         │
│  Whisper (Safari)      $5-15    (scaling with Safari users)        │
│  Domain                $1-2                                        │
│  ─────────────────────────────────                                 │
│  TOTAL                 $31-44/month                                  │
│                       ~775K-1.1M VND                                │
│                                                                      │
│  REVENUE BREAK-EVEN:                                               │
│  At 5% conversion (very low): 500 × 5% = 25 paying                 │
│  25 × 49K VND = 1.225M VND = $49 ✅                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  MONTH 7-12 (500-1K MAU, Scaling)                                  │
│                                                                      │
│  Supabase Pro           $25                                         │
│  Vercel Pro            $20       (bandwidth needs)                   │
│  Cloudflare Free       $0                                         │
│  Web Speech API        $0                                         │
│  Whisper (optimized)   $10-30    (cache + premium-only)             │
│  Domain                $1-2                                        │
│  ─────────────────────────────────                                 │
│  TOTAL                 $56-78/month                                  │
│                       ~1.4M-1.9M VND                                │
│                                                                      │
│  REVENUE BREAK-EVEN:                                               │
│  At 5% conversion: 1000 × 5% = 50 paying                           │
│  50 × 49K VND = 2.45M VND = $98 ✅                                │
│                                                                      │
│  ⚠️  CRITICAL: Conversion must be > 5%                            │
│  If 2% conversion: 20 paying = $29 ❌ (cost > revenue)              │
│  SOLUTION: Focus on activation + retention BEFORE monetization      │
└─────────────────────────────────────────────────────────────────────┘
```

### The Freemium Math

```
┌─────────────────────────────────────────────────────────────────────┐
│  FREEMIUM PARADOX — SOLVED                                         │
│                                                                      │
│  OLD (in docs):                                                    │
│  Free = limited content (cheap) + unlimited AI (expensive)          │
│  Premium = unlimited content + limited AI                          │
│  → Free users cost money, paying users get cheap features          │
│                                                                      │
│  NEW (simplified):                                                 │
│  MVP = ALL FREE (validate first)                                    │
│  Phase 2 = Speaking = premium (free teaser, 1/day)                  │
│  Phase 3 = AI features = premium                                   │
│                                                                      │
│  COST DRIVER REDUCED:                                              │
│  Speaking (Whisper) = removed from MVP → $0/month                  │
│  AI Coach = Phase 4 → when revenue exists                          │
│  Vocabulary = Phase 2 → not MVP scope                              │
│                                                                      │
│  REAL COST AT LAUNCH: $1-4/month                                    │
│  BREAK-EVEN: 25 paying users × 49K VND = $49 = 12× operating cost  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 7: SIMPLIFIED MVP SCOPE

### Before vs After

```
┌─────────────────────────────────────────────────────────────────────┐
│  BEFORE (42 tasks, 264 hours)                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Phase A: Infrastructure (10 tasks, 60h)                         │
│  Phase B: Core Loop (13 tasks, 104h)                              │
│    ← Speaking alone = 40h (B-011 + B-012 + B-013)                │
│  Phase C: Retention (7 tasks, 48h)                                │
│  Phase D: QA & Launch (8 tasks, 52h)                              │
│                                                                      │
│  Total: 264 hours / 12 weeks (at 20h/week)                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  AFTER (25 tasks, 120 hours)                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Foundation (5 tasks, 32h)                                        │
│    T-A-001: Project setup → 4h                                     │
│    T-A-002: Supabase + DB → 8h                                     │
│    T-A-003: Supabase client → 4h                                   │
│    T-A-004: Design system → 6h                                     │
│    T-A-005: Data ingestion → 8h                                     │
│    T-A-009: Error handling → 4h (simplified, no Sentry)          │
│    T-A-010: Deploy CI/CD → 4h                                      │
│                                                                      │
│  Core Loop (10 tasks, 48h)                                         │
│    T-B-001: Auth → 8h                                              │
│    T-B-002: Landing → 6h (simplified)                              │
│    T-B-003: Onboarding → 6h (simplified)                          │
│    T-B-004: App shell + nav → 4h                                   │
│    T-B-005: Topics + lessons → 6h                                 │
│    T-B-006: Audio player → 8h (simplified, no waveform)            │
│    T-B-007: Transcript input → 6h                                  │
│    T-B-008: Scoring engine → 6h                                    │
│    T-B-009: Clip navigation → 4h                                  │
│    T-B-010: Lesson page → 4h                                      │
│    ← NO speaking module (removed)                                   │
│    ← NO vocabulary module (removed)                                │
│                                                                      │
│  Retention + Polish (7 tasks, 32h)                                  │
│    T-C-001: Progress dashboard → 6h                                │
│    T-C-002: Streak system → 4h (basic, no freeze)                 │
│    T-C-003: History → 4h (simplified)                              │
│    T-C-004: Dashboard → 4h                                        │
│    T-C-005: Basic SEO → 2h (meta tags only)                       │
│    T-C-006: Vercel Analytics → 1h (minimal)                       │
│    T-C-007: PWA manifest → 1h (manifest only)                       │
│    ← NO achievements (removed)                                      │
│    ← NO leaderboard (removed)                                       │
│    ← NO push notifications (removed)                               │
│    ← NO dark mode (removed)                                         │
│    ← NO vocabulary (removed)                                       │
│                                                                      │
│  QA & Launch (3 tasks, 8h)                                        │
│    T-D-001: Unit tests (scoring) → 4h                              │
│    T-D-004: Basic cross-browser test → 4h                          │
│    T-D-008: Launch → 4h                                           │
│    ← NO E2E tests (add Phase 2)                                   │
│    ← NO formal accessibility audit (basic checks only)              │
│    ← NO security audit (basic checks only)                         │
│    ← NO legal pages (add basic ones, skip full compliance)         │
│                                                                      │
│  Total: 120 hours / 6 weeks (at 20h/week)                          │
└─────────────────────────────────────────────────────────────────────┘

SAVINGS:
├── 144 hours (55% reduction)
├── 6 weeks (launch 6 weeks sooner)
├── $0/month operating cost at launch
└── Zero complex dependencies (no service worker, no PWA, no notifications)
```

### Simplified Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                          │
│  React + Vite + Tailwind CSS + TanStack Query + Zustand            │
│  No Framer Motion (CSS only)                                        │
│  No nuqs (simple URL params)                                        │
│  No complex state machine (useState + Zustand only)               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND                                                           │
│  Next.js API Routes + Supabase                                     │
│  No Edge Functions (unless needed for Whisper)                      │
│  No Redis (use Supabase built-in)                                  │
│  No custom server (Vercel serverless)                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  DATABASE                                                          │
│  7 tables (was 11)                                                 │
│  No materialized views                                             │
│  Simple triggers (updated_at only)                                 │
│  No complex computed columns                                        │
│  RLS for all user tables                                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  SERVICES                                                          │
│  Supabase (DB + Auth + Storage) = $0/month (free tier)             │
│  Web Speech API = $0/month (browser native)                         │
│  Vercel = $0/month (hobby)                                         │
│  Vercel Analytics = $0/month (built-in)                           │
│  Domain = $1-2/month                                                │
│  ─────────────────────────────────                                 │
│  TOTAL = $1-2/month at launch                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 8: DECISION SUMMARY TABLE

```
┌─────────────────────────────────────────────────────────────────────┐
│  KEEP (Essential for MVP)                                         │
│  ├── Core learning loop (Listen → Type → Score)               48h │
│  ├── Basic auth (Email + Google)                              8h │
│  ├── Progress + streak (basic)                                14h │
│  ├── Onboarding (4-step)                                       6h │
│  ├── Landing page (basic)                                      6h │
│  ├── Mobile responsive                                         6h │
│  ├── Supabase + data ingestion                                 16h │
│  ├── Basic error handling (no Sentry)                          4h │
│  ├── Deploy CI/CD                                             4h │
│  └── Unit tests (scoring) + basic QA                          8h │
│                                                            ───────── │
│  SUBTOTAL KEEP:                                            120h │
│                                                                      │
│  SIMPLIFY (Reduce scope)                                          │
│  ├── Database: 11 tables → 7 tables                             │
│  ├── State: 6 layers → 3 layers                                 │
│  ├── Animation: Framer Motion → CSS only                          │
│  ├── Error: Sentry → ErrorBoundary + console                    │
│  ├── PWA: Full → manifest.json only                             │
│  ├── SEO: Full → meta tags only                                │
│  ├── Rate limiting: Redis → client-side soft limits               │
│  └── Analytics: GA4 → Vercel Analytics only                      │
│                                                                      │
│  REMOVE (Not MVP)                                                 │
│  ├── Speaking module                                    40h │
│  ├── Vocabulary module                              24h │
│  ├── Achievements + badges                          16h │
│  ├── Leaderboard                                  16h │
│  ├── Push notifications                            20h │
│  ├── Custom analytics (GA4)                         8h │
│  ├── Dark mode                                     8h │
│  └── Full accessibility audit                           12h │
│                                                            ───────── │
│  SUBTOTAL REMOVE:                                     144h │
│                                                                      │
│  POSTPONE (Phase 2+)                                              │
│  ├── Speaking practice → Phase 2 (40h)                           │
│  ├── Vocabulary → Phase 2 (24h)                                  │
│  ├── Leaderboard → Phase 2 (16h)                                  │
│  ├── Push notifications → Phase 2 (20h)                           │
│  ├── Achievements → Phase 2 (16h)                                 │
│  ├── Payments → Phase 3 (40h)                                    │
│  ├── Offline mode → Phase 3 (24h)                                 │
│  ├── AI Coach → Phase 4 (40h+)                                    │
│  └── Pronunciation AI → Phase 4 (40h+)                           │
│                                                                      │
│  ───────────────────────────────────────────────────────────────── │
│  ORIGINAL ESTIMATE:                                       264h       │
│  SIMPLIFIED ESTIMATE:                                     120h       │
│  REDUCTION:                                               144h (55%) │
│                                                                      │
│  ORIGINAL TIMELINE:                                   12 weeks      │
│  SIMPLIFIED TIMELINE:                                  6 weeks      │
│  TIME SAVED:                                            6 weeks      │
│                                                                      │
│  OPERATING COST AT LAUNCH:                              $1-4/month   │
│  COST AT 1K MAU:                                       $31-78/month   │
│  REVENUE BREAK-EVEN:                                  25 paying × 49K│
└─────────────────────────────────────────────────────────────────────┘
```

---

## FINAL RECOMMENDATION

```
┌─────────────────────────────────────────────────────────────────────┐
│  IMMEDIATE ACTIONS (This Week)                                     │
│                                                                      │
│  1. APPROVE this simplified scope (120h, 6 weeks, $0 launch)       │
│  2. Legal check: Contact DailyDictation for license OR             │
│     set up BBC/VOA scraper as backup                               │
│  3. Start T-A-001: Project setup (4 hours)                        │
│                                                                      │
│  WEEK 1-2: Infrastructure                                          │
│  T-A-001 → T-A-005 → T-A-010                                       │
│  Goal: Running app on Vercel, database ready, content loaded       │
│                                                                      │
│  WEEK 3-4: Core Loop                                               │
│  T-B-001 → T-B-005 → T-B-010                                       │
│  Goal: User can browse topics, play audio, type transcript,          │
│        see score, navigate clips                                     │
│                                                                      │
│  WEEK 5: Retention                                                 │
│  T-C-001 → T-C-004                                                 │
│  Goal: Dashboard shows progress, streak visible, history works       │
│                                                                      │
│  WEEK 6: Polish + Launch                                            │
│  T-C-005 → T-D-001 → T-D-004 → T-D-008                            │
│  Goal: Live on production                                           │
│                                                                      │
│  PHASE 2 STARTS: First paying feature (Speaking)                   │
│  PHASE 3 STARTS: Monetization (Premium tiers)                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Document End — VinaListen Architecture Simplification v1.0*
*Approved: 2026-06-07 | Review date: Post-launch*
