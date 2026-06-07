# VinaListen — MVP Canvas: Resolved Decisions
## P0 Decision Reference — The Single Source of Truth

**Date:** 2026-06-07  
**Version:** 1.0  
**Status:** **LOCKED — These decisions are final.**

---

## CANVAS 1: Scoring Rules (LOCKED)

```
TRANSCRIPT ACCURACY:
  normalize(lowercase) → strip_punctuation → tokenize
  → LCS alignment → classify words
  → accuracy = correct / expected × 100

  CORRECT  = green  ✅
  WRONG    = red    ❌
  MISSING  = gray   _ (underline)
  EXTRA    = orange 🟠

PRONUNCIATION SCORE:
  overall = accuracy×0.5 + fluency×0.25 + completeness×0.25

  fluency = WPM-based:
    120-160 WPM → 100
    100-120 WPM → 80
    160-200 WPM → 80
    <100 WPM → 20-50
    >200 WPM → 40

XP PER LESSON:
  base   = round(accuracy × 10)
  bonus  = +10 (perfect) +5 (fast<5min) +3 (no retry)
  max    = 100 XP/lesson

SPEAKING XP:
  base   = round(pronunciation × 5)
  bonus  = +5 (score≥90) +2 (first attempt)
  max    = 50 XP/clip
```

---

## CANVAS 2: Streak Rules (LOCKED)

```
EVERY CALCULATION IN USER'S LOCAL TIMEZONE.

increment_streak():
  IF first_lesson_ever:
    → streak = 1
  IF last_date == today:
    → streak unchanged (already counted today)
  IF last_date == today - 1day:
    → streak += 1
  ELSE:
    → streak = 1 (reset)

longest_streak = MAX(current_streak, longest_streak)

milestones:
  7  → +30 XP  → "1 tuần!"
  30 → +100 XP → "Tháng!"
  100→ +500 XP → "100 ngày!"

STREAK FREEZE: NOT IN MVP (Phase 2)
```

---

## CANVAS 3: Auth Rules (LOCKED)

```
METHODS:
  ├── Email + Password (register, login, reset)
  ├── Google OAuth (login)
  └── Guest (browse only, no progress saved)

SESSION:
  ├── JWT access token (1 hour)
  ├── Refresh token (auto by Supabase)
  └── HTTP-only cookies (SSR safe)

REDIRECT LOGIC:
  /login?redirect=[path]
  Onboarded? → /dashboard : /onboarding
  Unauthenticated? → redirect to /login

MID-LESSON EXIT: NO SAVE
  Browser close = progress lost
  "Thoát" = confirmation dialog
  "Bỏ qua clip" = skip clip (no score)

MULTI-DEVICE: Pull-to-refresh (NOT real-time sync)
```

---

## CANVAS 4: Speech Recognition (LOCKED)

```
PRIMARY:   Web Speech API (Chrome, Edge) — FREE
FALLBACK:  Whisper API via Supabase Edge Function (Safari, Firefox)

WHISPER COST: $0.006/minute
FREE LIMIT: 10 transcriptions/day (soft gate)
WHISPER BUDGET: Set $100/month cap

ERROR HANDLING:
  no-speech       → "Không phát hiện giọng nói"
  audio-capture   → "Không tìm thấy microphone"
  not-allowed    → Guide to enable in settings
  network         → Retry once → Whisper fallback
  empty           → "Recording quá ngắn"
  timeout         → Process what was recorded

RECORDING RULES:
  min duration: 1 second
  max duration: 30 seconds (auto-stop)
  format: audio/webm (Chrome), audio/mp4 (Safari)
  storage: Supabase Storage (signed URL)
```

---

## CANVAS 5: Progress Tracking (LOCKED)

```
LESSON = COMPLETED when:
  - ALL clips have transcript submitted
  - user_progress row INSERTED

PARTIAL PROGRESS: NOT SAVED
  User quits mid-lesson = progress lost

BEST SCORE:
  best_score = MAX(all_attempt_accuracies)
  latest_accuracy = most recent attempt

MULTIPLE ATTEMPTS:
  Each attempt = new row in user_progress
  attempt_count incremented
  XP awarded each time

DAILY GOAL:
  Options: 5 / 10 / 20 / 30 minutes
  Based on: lessons_today >= daily_goal_lessons
  Set during: Onboarding (Step 3)

DAILY ACTIVITY:
  Updated via trigger on user_progress INSERT
  lessons_done += 1
  time_minutes += duration
  xp_earned += xp
```

---

## CANVAS 6: Freemium Model (LOCKED)

```
MVP = TIER 0 ONLY (FREE FOREVER)
  ├── All audio lessons (unlimited)
  ├── Transcript checking (unlimited)
  ├── Basic scoring (accuracy %)
  ├── Progress tracking
  ├── Basic streak
  ├── History (basic)
  ├── 1 speaking attempt/day (teaser)
  └── NO PREMIUM GATES

PREMIUM = PHASE 3 (Month 4+)
  Tier 1: 49,000 VND → Unlimited speaking
  Tier 2: 99,000 VND → +AI feedback, offline

WHY FREE MVP:
  1. No payment infrastructure
  2. Maximum user acquisition
  3. Validate retention before monetization
  4. Simple ops
```

---

## CANVAS 7: API Rate Limits (LOCKED)

```
ANONYMOUS:  20 requests/minute
FREE USER:  100 requests/minute

PROTECTED ENDPOINTS:
  POST /api/listening/check
    → 50 checks/day (free user)
    → Response: { "remaining": 45, "limit": 50 }

  POST /api/speech/transcribe
    → 10 transcriptions/day (free user)
    → Response: { "remaining": 7, "limit": 10 }
    → At limit: { "limit_reached": true, "upgrade_url": "/premium" }

IMPLEMENTATION:
  - Supabase Row Level Security + anonymous users table
  - OR Vercel Edge Middleware + Upstash Redis
```

---

## CANVAS 8: Accessibility Rules (LOCKED)

```
COLOR CONTRAST:
  --accent (#FF5632) on white → FAIL (3.2:1)
  USE --accent-dark (#CC3A1A) on white → PASS (4.8:1)

  --warning (#FFAB00) on white → FAIL (1.9:1)
  USE --warning-dark (#CC8800) on white → PASS (4.5:1)

WCAG AA TARGETS:
  Text: 4.5:1 minimum
  Large text / UI: 3:1 minimum

MOBILE TOUCH: 44×44px minimum

KEYBOARD: All interactive elements must be reachable
  Tab order = visual order
  Focus ring: 2px solid accent, 2px offset

REDUCED MOTION:
  Check: prefers-reduced-motion
  If true: Disable all animations (Framer Motion)
  Fallback: Instant state changes

SCREEN READER:
  aria-labels on all icon buttons
  Form inputs: associated labels
  Progress: "Accuracy: 85%"
  Audio: "Phát audio, 2 phút 30 giây, đã phát 30 giây"
```

---

## CANVAS 9: Navigation State (LOCKED)

```
MOBILE FIRST:

320px (Mobile):
  └── Bottom nav bar (fixed)
      ├── 🏠 Home
      ├── 📚 Topics
      ├── 📈 Progress
      └── 👤 Me

768px (Tablet):
  └── Bottom nav + minimal top header

1024px+ (Desktop):
  └── Top nav (full)
      ├── Logo
      ├── Topics | Progress | History
      └── Streak counter | Avatar

LESSON PLAYER:
  └── Back button → Topic detail
  └── Close button → Confirmation if in-progress

AUDIO MINI PLAYER:
  └── Sticky bottom (above bottom nav on mobile)
  └── Shows: lesson name, play/pause, clip progress
```

---

## CANVAS 10: Lesson Complete State (LOCKED)

```
TRIGGERS WHEN: Last clip submitted + "Tiếp tục" tapped

CONTENTS:
  ├── Accuracy: X% (all clips average)
  ├── XP earned: +Y (animated count-up)
  ├── Streak: 🔥 Z ngày (if first lesson today)
  ├── Level progress: "Level 3 • 450/600 XP"
  └── Stars: ⭐⭐⭐ (based on accuracy: 90+/80+/60+)

CELEBRATION:
  ├── Confetti animation (canvas-confetti)
  ├── 2-second duration
  ├── Respects reduced motion (fade only)
  └── Sound: Optional (user can disable)

ACTIONS:
  ├── [Bài tiếp theo] → Navigate to next lesson
  ├── [Về Dashboard]  → Navigate to /dashboard
  └── [Học lại]       → Restart same lesson

SESSION END:
  → user_progress INSERTED
  → daily_activity UPSERTED
  → Streak calculated (via trigger)
  → XP added to user total (via trigger)
```

---

## CANVAS 11: Error Message Reference (LOCKED)

```
ALL ERROR MESSAGES IN VIETNAMESE.

AUTH ERRORS:
  "Email hoặc mật khẩu không đúng"        (login fail)
  "Email đã được đăng ký"                   (register duplicate)
  "Phiên đăng nhập hết hạn"                (token expired)
  "Vui lòng đăng nhập để tiếp tục"        (protected route)

AUDIO ERRORS:
  "Audio không tải được. Kiểm tra kết nối mạng."   (load fail)
  "Trình duyệt không hỗ trợ định dạng này."         (format)

SPEAKING ERRORS:
  "Không phát hiện giọng nói. Thử lại."           (no-speech)
  "Không tìm thấy microphone"                     (no-capture)
  "Cần quyền truy cập microphone"                  (not-allowed)
  "Recording quá ngắn (tối thiểu 1 giây)"          (too short)
  "Đã đạt giới hạn 30 giây"                       (auto-stop)
  "Dịch vụ nhận diện giọng nói đang bảo trì"      (whisper down)

API ERRORS:
  "Không thể kết nối. Thử lại."                    (network)
  "Đã xảy ra lỗi phía máy chủ"                    (500)
  "Yêu cầu hết thời gian"                         (timeout)
  "Quá nhiều yêu cầu. Chờ 30 giây."              (rate limit)

USER ACTION ERRORS:
  "Vui lòng nhập transcript"                       (empty)
  "Hãy gõ từ bạn nghe được"                       (paste attempt)
  "Transcript quá dài (tối đa 2000 ký tự)"         (too long)
```

---

## CANVAS 12: Build Checklist (Pre-Merge)

```
BEFORE ANY PR MERGE:

CODE:
  ☐ tsc --noEmit → 0 errors
  ☐ npm run lint → 0 warnings
  ☐ npm run build → succeeds
  ☐ No TODO comments left
  ☐ No console.log left (except in error handlers)
  ☐ No hardcoded secrets (use env vars)
  ☐ Types are specific (no any)

UX:
  ☐ All buttons have onClick handlers
  ☐ All forms have validation
  ☐ All async ops have loading states
  ☐ All errors have user-friendly messages
  ☐ Mobile tested (320px)
  ☐ prefers-reduced-motion tested
  ☐ Keyboard navigation tested

DATA:
  ☐ All API responses match type definitions
  ☐ All database queries have indexes
  ☐ All user input sanitized (XSS)
  ☐ All user input parameterized (SQL injection)

ACCESSIBILITY:
  ☐ No color-only indicators
  ☐ Focus visible on all interactive elements
  ☐ Touch targets 44×44px minimum
  ☐ aria-labels on icon-only buttons
  ☐ Form labels associated
```

---

*Document End — VinaListen MVP Canvas v1.0*
*All decisions are final. Changes require explicit re-review.*
