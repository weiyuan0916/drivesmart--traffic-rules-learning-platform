# VinaListen — Information Architecture
## Thiết kế UX/UI: Mobile First

**Phiên bản:** 1.0  
**Ngày:** 2026-06-07  
**Based on:** PRD VinaListen v1.0 + Roadmap 4-Phases  
**Designed for:** 3 Personas (Minh, Linh, Anh)  
**Framework:** Mobile First → Tablet → Desktop

---

## PART 1: INFORMATION ARCHITECTURE

### 1.1 Global Navigation Structure

#### Navigation Principles

1. **Maximum 5 top-level items** — tránh cognitive overload
2. **Primary action always visible** — không cần search để bắt đầu học
3. **Context-aware navigation** — navigation thay đổi theo flow
4. **Progressive disclosure** — hiện options khi cần, không phải lúc nào cũng thấy hết

#### Navigation Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                 GLOBAL NAVIGATION                         │
│                                                         │
│  Mobile (Bottom Tab Bar):                               │
│  ┌───────┬───────┬───────┬───────┬────────┐           │
│  │  🏠   │  👂   │  🗣️  │  📊   │  👤    │           │
│  │ Home  │ Listen│ Speak │ Stats │ Profile│           │
│  └───────┴───────┴───────┴───────┴────────┘           │
│                                                         │
│  Desktop (Side Navigation):                              │
│  ┌──────────────────────────────────────────────┐      │
│  │  Logo                                        │      │
│  │  ─────────────────────────────────          │      │
│  │  🏠 Dashboard                                │      │
│  │  👂 Listening                                │      │
│  │  🗣️ Speaking (Phase 4)                       │      │
│  │  📚 Topics                                  │      │
│  │  ─────────────────────────────────          │      │
│  │  📊 Progress    ← tab active               │      │
│  │  🔖 Bookmarks                               │      │
│  │  🔥 Streak                                  │      │
│  │  ─────────────────────────────────          │      │
│  │  ⚙️ Settings                                │      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

#### Navigation Mapping

| Screen | Mobile Nav | Desktop Nav | Breadcrumb | Back Button |
|---|---|---|---|---|
| Dashboard | 🏠 Home | Dashboard | — | — |
| Topics | 🏠 Home → tap card | Side Nav → Topics | Dashboard → Topics | ← Back |
| Lesson List | Topics → tap topic | Topics → tap topic | Dashboard → Topics → [Name] | ← Back |
| Listening Practice | Lesson List → tap lesson | Lesson List → tap lesson | — | ← Back |
| Speaking Practice | Dashboard → 🗣️ | Side Nav → Speaking | Dashboard → Speaking | ← Back |
| Progress | 📊 Stats | Side Nav → Progress | Dashboard → Progress | ← Back |
| Profile | 👤 Profile | Side Nav → Profile | Dashboard → Profile | ← Back |

---

### 1.2 Complete Site Map

```
VinaListen
│
├── 📍 Landing Page (Non-authenticated users)
│   │
│   ├── Hero Section
│   ├── How It Works (3 steps)
│   ├── Topics Preview
│   ├── Testimonials / Social Proof
│   ├── Pricing Teaser
│   ├── FAQ
│   └── CTA: [Bắt đầu miễn phí] / [Đăng nhập]
│
├── 📍 Auth Flow
│   │
│   ├── /login
│   │   ├── Email + Password
│   │   ├── Google Login
│   │   ├── Apple Login
│   │   └── Forgot Password
│   │
│   ├── /register
│   │   ├── Email + Password
│   │   ├── Google Login
│   │   ├── Apple Login
│   │   └── Terms acceptance
│   │
│   └── /onboarding (first-time only)
│       ├── Step 1: Level Check
│       ├── Step 2: Quick Tutorial (3 mini-lessons)
│       ├── Step 3: Setup Daily Goal
│       └── Step 4: Dashboard
│
├── 📍 Dashboard (Authenticated — Primary Hub)
│   │
│   ├── Header
│   │   ├── Logo (← Dashboard)
│   │   ├── Search (icon → expands)
│   │   └── Notifications (icon + badge)
│   │
│   ├── Hero Section — Daily Goal
│   │   ├── "Hôm nay bạn có 10 phút?"
│   │   ├── Quick Goal: [📖 1 bài] [📚 2 bài] [🔥 3 bài]
│   │   └── Continue Learning card (nếu có bài đang dở)
│   │
│   ├── Streak Card
│   │   ├── 🔥 X ngày streak
│   │   ├── Progress: X/1 bài hôm nay
│   │   └── "Còn 1 bài nữa để giữ streak!"
│   │
│   ├── Continue Learning
│   │   └── Last lesson + progress
│   │
│   ├── Today's Recommended
│   │   ├── Based on level
│   │   └── Based on weak areas
│   │
│   ├── Popular Topics
│   │   └── Top 3 topic cards
│   │
│   ├── Quick Actions
│   │   ├── [🎧 Luyện nghe]
│   │   ├── [🗣️ Luyện nói] (Phase 4)
│   │   ├── [📝 Ôn từ vựng]
│   │   └── [📊 Xem tiến độ]
│   │
│   └── Footer
│       └── [📱 App banner — "Mở trên điện thoại"]
│
├── 📍 /topics (Topic Browser)
│   │
│   ├── Header
│   │   ├── ← Back
│   │   ├── "Chủ đề"
│   │   └── 🔍 Search
│   │
│   ├── Filter Tabs
│   │   ├── [Tất cả] [IELTS] [Business] [Daily] [Travel] ...
│   │   └── Horizontal scroll on mobile
│   │
│   ├── Topic Cards (Grid 2x on mobile, 3x tablet, 4x desktop)
│   │   ├── Thumbnail (aspect 16:9)
│   │   ├── Name
│   │   ├── Description (2 lines max)
│   │   ├── Meta: X bài | X phút/bài
│   │   └── Difficulty badge
│   │
│   └── Empty State
│       └── "Không tìm thấy chủ đề phù hợp"
│
├── 📍 /topics/[slug] (Lesson List)
│   │
│   ├── Topic Header
│   │   ├── Back ←
│   │   ├── Topic name + thumbnail
│   │   ├── Progress: X/Y bài đã học
│   │   └── Difficulty + estimated time
│   │
│   ├── Section List
│   │   ├── Section 1
│   │   │   ├── Section name
│   │   │   └── Expand/Collapse
│   │   │       └── Lesson items:
│   │   │           ├── Lesson name
│   │   │           ├── Duration + difficulty
│   │   │           ├── Status icon (new ✅ / done ✅ / attempted ⚠️)
│   │   │           └── Accuracy (nếu đã làm)
│   │   │
│   │   ├── Section 2
│   │   └── ...
│   │
│   └── Completion Modal (when all done)
│       └── "🎉 Hoàn thành! Xem kết quả?"
│
├── 📍 /listen/[lesson_id] (Listening Practice — CORE)
│   │
│   ├── 🔙 Back (←)
│   │
│   ├── Audio Player (Sticky Top)
│   │   ├── Lesson name + topic
│   │   ├── ▶️ ▶️ ⏸️ 🔄 (play/pause/replay)
│   │   ├── ⏩ ⏪ (skip 5s / rewind 5s)
│   │   ├── Speed: 0.5x | 0.75x | 1x | 1.25x | 1.5x
│   │   ├── Progress bar with timestamps
│   │   ├── [📝 Transcript] toggle
│   │   └── Waveform visualization
│   │
│   ├── Transcript Input Area
│   │   ├── Textarea (auto-resize)
│   │   ├── Placeholder: "Nhập những gì bạn nghe được..."
│   │   ├── Word count + Auto-saved ✓
│   │   ├── Keyboard hint: "Ctrl+Enter để check"
│   │   └── [Check & Submit] button
│   │
│   └── Result Panel (Bottom Sheet — slides up)
│       ├── Accuracy header: 78% | ✅ 34 | ❌ 6 | 📝 4
│       ├── Comparison:
│       │   ├── "Your answer:" (with color coding)
│       │   └── "Correct:" (with color coding)
│       ├── AI Feedback
│       ├── Action buttons:
│       │   ├── [🔄 Retry] [➡️ Next] [💾 Save] [📝 Mistakes]
│       └── [🔊 Listen Again]
│
├── 📍 /speak/[lesson_id] (Speaking Practice — Phase 4)
│   │
│   ├── Same audio player as Listening
│   │
│   ├── Instructions
│   │   └── "Nghe → Đọc → Nói → So sánh"
│   │
│   ├── Script Display
│   │   ├── Transcript (hidden by default)
│   │   └── [Show transcript]
│   │
│   ├── Recording Area
│   │   ├── [🎤 Record] button (large, 64px)
│   │   ├── Recording indicator (waveform live)
│   │   ├── Timer: 00:45 / 01:00 max
│   │   └── [⏹️ Stop]
│   │
│   ├── Playback (after recording)
│   │   ├── [▶️ Play your recording]
│   │   ├── [🔄 Re-record]
│   │   └── [➡️ Submit]
│   │
│   └── AI Pronunciation Feedback
│       ├── Overall score: 75/100
│       ├── Per-word breakdown
│       ├── Common mistakes
│       └── [Practice Again] [Next Lesson]
│
├── 📍 /progress (My Progress)
│   │
│   ├── Header
│   │   ├── "Tiến độ của tôi"
│   │   └── Period: [Tuần] [Tháng] [Tất cả]
│   │
│   ├── Stats Grid (4 cards)
│   │   ├── 🎯 X bài đã học
│   │   ├── ⏱️ X.X giờ
│   │   ├── 📊 X% accuracy TB
│   │   └── 🔥 X ngày streak
│   │
│   ├── Weekly Chart
│   │   └── Bar chart: Mon-Sun (lessons completed)
│   │
│   ├── Accuracy Trend
│   │   └── Line chart (30 days)
│   │
│   ├── Weak Areas
│   │   └── Top 3 lỗi pattern
│   │
│   ├── Best Records
│   │   ├── Best streak: X ngày
│   │   ├── Best accuracy: X%
│   │   └── Fastest completion: X phút
│   │
│   └── Achievements Gallery
│       └── Badges (unlocked + locked)
│
├── 📍 /vocabulary (Vocabulary Notebook)
│   │
│   ├── Header
│   │   ├── "Từ vựng"
│   │   └── 🔍 Search
│   │
│   ├── Stats
│   │   └── X từ đã học | X đang ôn | X chưa học
│   │
│   ├── Tabs
│   │   ├── [Tất cả] [Đã học] [Đang ôn] [Chưa học]
│   │
│   ├── Word List
│   │   ├── Word + pronunciation
│   │   ├── Part of speech
│   │   ├── Vietnamese meaning
│   │   ├── From lesson: [Lesson Name]
│   │   ├── Mastery: ████░░ (x/?)
│   │   └── Tap → Word detail modal
│   │
│   ├── Daily Review CTA
│   │   └── "Bạn có X từ cần ôn hôm nay"
│   │   └── [Bắt đầu ôn từ]
│   │
│   └── Flashcard Mode (Full screen)
│       ├── Front: Word + audio
│       ├── Back: Meaning + example
│       └── Swipe: Right = know / Left = still learning
│
├── 📍 /bookmarks
│   │
│   ├── Tabs
│   │   ├── [Bài học] [Câu đã lưu]
│   │
│   ├── Saved Lessons
│   │   └── Same card format as lesson list
│   │
│   └── Saved Sentences
│       ├── Highlighted sentence
│       ├── From lesson + timestamp
│       └── [Go to lesson]
│
├── 📍 /history
│   │
│   ├── Filter Bar
│   │   ├── Date range picker
│   │   ├── Topic filter
│   │   └── Accuracy filter: [All] [>90%] [50-90%] [<50%]
│   │
│   ├── History List
│   │   ├── Date header (grouping)
│   │   ├── Lesson name
│   │   ├── Topic
│   │   ├── Score: X%
│   │   ├── Time spent
│   │   └── Tap → Review Mistakes
│   │
│   └── Stats Summary
│       └── Total: X bài | Avg: X% | Time: Xh
│
├── 📍 /leaderboard
│   │
│   ├── Tabs
│   │   ├── [Accuracy] [Streak] [Lessons]
│   │
│   ├── Period
│   │   └── [Tuần này] [Tháng này] [All-time]
│   │
│   ├── Top 3 Podium
│   │   ├── 🥇 Name + Avatar + Score
│   │   ├── 🥈 Name + Avatar + Score
│   │   └── 🥉 Name + Avatar + Score
│   │
│   ├── Leaderboard List
│   │   ├── Rank | Name (anonymized: "User 1234") | Score
│   │   └── You: Rank X | Your Score | ↕ change
│   │
│   └── Your Position Card
│       └── "Top X% today"
│
├── 📍 /profile
│   │
│   ├── Avatar + Name
│   │   └── [Edit Profile]
│   │
│   ├── Account Section
│   │   ├── Email
│   │   ├── Password (change)
│   │   ├── Linked accounts (Google, Apple)
│   │   └── Delete account
│   │
│   ├── Subscription
│   │   ├── Current plan: Free / Premium
│   │   ├── Upgrade CTA (if Free)
│   │   ├── Manage subscription (if Premium)
│   │   └── Billing history
│   │
│   ├── Preferences
│   │   ├── Language: [Tiếng Việt] [English]
│   │   ├── Theme: [Sáng] [Tối] [Auto]
│   │   ├── Notifications
│   │   │   ├── Daily reminder: ON/OFF + time
│   │   │   ├── Streak warning: ON/OFF
│   │   │   └── Achievement: ON/OFF
│   │   └── Daily goal: [1] [2] [3] bài
│   │
│   └── App Info
│       ├── Version
│       ├── Terms of Service
│       ├── Privacy Policy
│       └── Contact Support
│
├── 📍 /settings (same as Profile → Preferences)
│
└── 📍 /404 (Not Found)
    ├── "Trang này không tồn tại"
    ├── [Quay về Dashboard]
    └── [Về trang chủ]
```

---

### 1.3 Navigation Decision Matrix

| User Action | Mobile Behavior | Desktop Behavior |
|---|---|---|
| Tap topic card | Navigate to /topics/[slug] | Navigate to /topics/[slug] |
| Tap lesson card | Navigate to /listen/[id] | Navigate to /listen/[id] |
| Swipe left on lesson | Quick bookmark | — |
| Long press lesson | Context menu: Bookmark / Skip | Right-click: Bookmark / Skip |
| Pull down | Refresh content | F5 / Refresh button |
| Tap back | Go to previous screen | Go to previous screen |
| Swipe from left edge | Go to previous screen | — |
| Tap logo | Go to Dashboard | Collapse side nav / Go to Dashboard |
| Double-tap audio | Toggle play/pause | Same |
| Pinch (desktop) | — | Zoom in/out |
| Keyboard: Esc | Close modals / go back | Same |

---

## PART 2: USER FLOWS

### 2.1 First-Time User Flow (New User → Habit)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FIRST-TIME USER FLOW                               │
│                                                                     │
│  ┌──────────┐     ┌──────────┐     ┌─────────────────────────┐   │
│  │ Landing   │     │ Auth      │     │ Onboarding Step 1       │   │
│  │ Page      │────▶│ Flow      │────▶│ Level Check             │   │
│  │           │     │           │     │                         │   │
│  │ See value │     │ Register  │     │ "Bạn nghe tiếng Anh    │   │
│  │ proposition│    │ in < 30s  │     │ giỏi đến đâu?"         │   │
│  │           │     │           │     │                         │   │
│  │ CTA:      │     │ Options:  │     │ [Mới bắt đầu]         │   │
│  │ "Bắt đầu │     │ • Email   │     │ [Trung bình]           │   │
│  │  miễn phí"│     │ • Google  │     │ [Khá giỏi]             │   │
│  └──────────┘     │ • Apple   │     │                         │   │
│       │           │ • Skip    │     │ → Save level            │   │
│       │           └──────────┘     └───────────┬─────────────┘   │
│       │                                          │                │
│       │           ┌─────────────────────────┐    │                │
│       │           │ Onboarding Step 2       │    │                │
│       │           │ First Lesson (Guided)   │◀───┘                │
│       │           │                         │                      │
│       │           │ "Hãy thử luyện tập     │                      │
│       │           │  bài đầu tiên nhé!"     │                      │
│       │           │                         │                      │
│       │           │ Audio auto-plays        │                      │
│       │           │ Textarea appears        │                      │
│       │           │ Submit → See result     │                      │
│       │           │                         │                      │
│       │           │ [Tiếp tục →]            │                      │
│       │           └───────────┬─────────────┘                      │
│       │                       │                                    │
│       │           ┌───────────┴─────────────┐                       │
│       │           │ 🎉 WOW MOMENT          │                       │
│       │           │                         │                       │
│       │           │ "Chúc mừng bạn!        │                       │
│       │           │ Bạn đã hoàn thành      │                       │
│       │           │ bài đầu tiên!"         │                       │
│       │           │                         │                       │
│       │           │ ✅ Accuracy: 78%        │                       │
│       │           │ 🔥 Streak: 1 ngày      │                       │
│       │           │ 📊 Top 30% today       │                       │
│       │           │                         │                       │
│       │           │ [Bắt đầu học ngay!]    │                       │
│       │           └───────────┬─────────────┘                       │
│       │                       │                                    │
│       │           ┌───────────┴─────────────┐                      │
│       │           │ Dashboard               │                      │
│       │           │ (Daily view)            │                      │
│       │           │                         │                      │
│       │           │ "Hãy hoàn thành 1 bài  │                      │
│       │           │  hôm nay để giữ streak!" │                      │
│       │           │                         │                      │
│       │           │ [📖 Bắt đầu bài học]    │                      │
│       │           └───────────┬─────────────┘                      │
│       │                       │                                    │
│       │           ┌───────────┴─────────────┐                       │
│       │           │ Lesson List            │                       │
│       │           │ (Recommended first)    │                       │
│       │           │                         │                       │
│       │           │ [Tap lesson] ──────────┼───────┐               │
│       │           └───────────┬─────────────┘       │               │
│       │                       │                    │               │
│       │           ┌───────────┴─────────────┐      │               │
│       │           │ 🔁 DAILY LEARNING LOOP  │      │               │
│       │           │                         │      │               │
│       │           │ 1. Listen               │◀─────┘               │
│       │           │ 2. Type transcript      │                      │
│       │           │ 3. Check result         │                      │
│       │           │ 4. See AI feedback      │                      │
│       │           │ 5. Next or Review       │                      │
│       │           │                         │                      │
│       │           │ 🔥 Streak +1           │                      │
│       │           │ 📊 Progress updated    │                      │
│       │           │                         │                      │
│       │           │ [← Dashboard]           │                      │
│       │           └─────────────────────────┘                       │
│       │                                                        │
│       └──────────────────────────────────────────────────────────┘
│                                                                     │
│  Drop-off Points:                                                   │
│  ├── Landing → Drop if không hiểu value prop (< 3s để decide)   │
│  ├── Auth → Drop if signup quá phức tạp (> 30s)                   │
│  ├── Onboarding Step 1 → Drop if level check confusing            │
│  ├── Onboarding Step 2 → Drop if bài quá khó                      │
│  └── After first lesson → Drop if không thấy "wow moment"         │
│                                                                     │
│  Hook Points:                                                       │
│  ├── After first lesson → "Share your score!"                     │
│  ├── Day 3 → Email: "Bạn đang giữ streak 3 ngày"                │
│  ├── Day 7 → Celebration: "🎉 1 tuần streak!"                    │
│  └── Day 30 → Achievement: "🔥🔥 1 tháng!"                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Daily Learning Flow (Returning User)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DAILY LEARNING FLOW                                │
│                                                                     │
│  OPEN APP                                                           │
│      │                                                              │
│      ▼                                                              │
│  ┌──────────────┐                                                   │
│  │ Dashboard    │                                                   │
│  │              │                                                   │
│  │ Streak: 7🔥  │  ← Nhìn thấy streak → motivation kick          │
│  │ Today: 0/1   │  ← Goal rõ ràng                                 │
│  │              │                                                   │
│  │ [🎧 Luyện    │                                                   │
│  │    nghe]     │                                                   │
│  └──────┬───────┘                                                   │
│         │                                                           │
│         ▼                                                           │
│  ┌──────────────┐     ┌──────────────┐                             │
│  │ Topics       │ or  │ Continue     │ or  │ Vocabulary            │
│  │ Browser      │     │ Learning     │     │ Review               │
│  │              │     │              │     │                      │
│  │ Pick topic   │     │ Resume last  │     │ Quick 5-card review  │
│  │ Pick lesson  │     │ lesson       │     │ (2 phút)            │
│  └──────┬───────┘     └──────┬───────┘     └──────────┬───────────┘
│         │                    │                        │
│         ▼                    ▼                        ▼
│  ┌─────────────────────────────────────────────────────────┐        │
│  │            LISTENING PRACTICE LOOP                       │        │
│  │                                                          │        │
│  │  ① Listen (Audio auto-starts)                            │        │
│  │      ↓                                                   │        │
│  │  ② Type (Transcript input)                               │        │
│  │      ↓                                                   │        │
│  │  ③ Check (Submit)                                        │        │
│  │      ↓                                                   │        │
│  │  ④ Result + AI Feedback                                 │        │
│  │      ↓                                                   │        │
│  │  ⑤ Actions: [Next] [Retry] [Bookmark] [Review]         │        │
│  │      ↓                                                   │        │
│  │  IF Goal complete:                                       │        │
│  │      🎉 "Mục tiêu hôm nay: ✅ Hoàn thành!"             │        │
│  │      🔥 Streak maintained!                              │        │
│  │      [← Dashboard] or [Tiếp tục]                        │        │
│  │                                                          │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                     │
│  Decision Points:                                                   │
│  ├── Goal complete → Encourage to do more OR end session?          │
│  │   → Decision: "1 bài là đủ. Bạn có thể làm thêm!"            │
│  ├── Accuracy low (< 60%) → Suggest easier topic?                │
│  │   → Decision: "Gợi ý: Bài này hơi khó. Thử bài dễ hơn?"      │
│  ├── Streak at risk (11pm) → Push notification?                   │
│  │   → Decision: Send "Streak sắp mất!" notification            │
│  └── All topics done → Suggest review or vocabulary?              │
│      → Decision: "Bạn đã học hết topic! Ôn từ vựng nhé?"        │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Speaking Practice Flow (Phase 4)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SPEAKING PRACTICE FLOW                            │
│                                                                     │
│  Entry Points:                                                      │
│  ├── Dashboard → Quick Actions → [🗣️ Luyện nói]                   │
│  ├── Dashboard → Today's Recommended (Speaking topic)              │
│  └── Bottom Nav → 🗣️ Speaking tab                                 │
│                                                                     │
│      ▼                                                              │
│  ┌──────────────────┐                                               │
│  │ Speaking Topics   │                                               │
│  │                   │                                               │
│  │ [Daily Life]      │  ← Topic cards (same style as Listening)    │
│  │ [Business]        │                                               │
│  │ [Interview]       │                                               │
│  │ [Travel]          │                                               │
│  └────────┬─────────┘                                               │
│           │                                                         │
│           ▼                                                         │
│  ┌──────────────────┐                                               │
│  │ Speaking Lesson   │                                               │
│  │                   │                                               │
│  │ Step 1: Listen    │  ← Native speaker audio (same player)        │
│  │                   │  ← Show transcript after listen               │
│  │ [▶️ Nghe mẫu]    │                                               │
│  │                   │                                               │
│  │ Step 2: Practice  │                                               │
│  │                   │                                               │
│  │ [🎤 Bắt đầu      │  ← Large mic button (64px)                  │
│  │  ghi âm]         │                                               │
│  │                   │                                               │
│  │ Recording... 🔴   │  ← Live waveform + timer                    │
│  │ ⏱️ 00:23         │                                               │
│  │                   │                                               │
│  │ [⏹️ Dừng]        │                                               │
│  │                   │                                               │
│  └────────┬─────────┘                                               │
│           │                                                         │
│           ▼                                                         │
│  ┌──────────────────┐                                               │
│  │ Playback + Submit │                                               │
│  │                   │                                               │
│  │ [▶️ Nghe lại]     │  ← Review your recording                    │
│  │ [🔄 Ghi âm lại]  │                                               │
│  │                   │                                               │
│  │ [➡️ Gửi để       │  ← Submit for AI analysis                   │
│  │  phân tích]      │                                               │
│  └────────┬─────────┘                                               │
│           │                                                         │
│           ▼                                                         │
│  ┌──────────────────┐                                               │
│  │ AI Pronunciation │                                               │
│  │ Feedback          │                                               │
│  │                   │                                               │
│  │ Overall: 78/100  │  ← Large, prominent score                   │
│  │ ████████████░░   │                                               │
│  │                   │                                               │
│  │ Per-word scoring: │                                               │
│  │ "I am"     ✅ ✓   │  ← Green = good                           │
│  │ "learn*ng" ⚠️ ~  │  ← Yellow = needs work                     │
│  │ "every"    ✅ ✓   │                                              │
│  │ "day"      ✅ ✓   │                                              │
│  │                   │                                               │
│  │ Common issues:    │                                               │
│  │ "Bạn phát âm      │                                              │
│  │  '-ing' chưa      │                                              │
│  │  chuẩn. Thử mở   │                                              │
│  │  miệng rộng hơn." │                                              │
│  │                   │                                              │
│  │ [🔄 Thử lại]     │  ← Retry the same sentence                │
│  │ [➡️ Câu tiếp    │  ← Next sentence                           │
│  │  theo]           │                                              │
│  │ [📝 Xem script]  │  ← Full transcript                        │
│  └──────────────────┘                                               │
│                                                                     │
│  Completion:                                                        │
│  └── All sentences done → Show summary score                        │
│      └── [🎉 Hoàn thành] → Return to lesson list                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 3: WIREFRAMES — MOBILE (320px - 428px)

### 3.1 Wireframe: Landing Page (Mobile)

```
┌──────────────────────────────────────────────────────┐
│  [Logo]                           [🌙] [Login]        │  Status Bar
├──────────────────────────────────────────────────────┤
│                                                      │
│  ████████████████████████████████████████████████    │  Hero Image
│  ████████████████████████████████████████████████    │  (person
│  ████████  👂  ████████████████████████████████    │  wearing
│  ████████████████████████████████████████████████    │  headphones)
│  ████████████████████████████████████████████████    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Luyện nghe tiếng Anh                              │  H1
│  mỗi ngày.                                         │  28px bold
│  Không cần gia sư.                                 │
│                                                      │
│  Nghe → Đánh vần → Kiểm tra → Tiến bộ              │  Subtitle
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │        Bắt đầu miễn phí                        │ │  Primary CTA
│  │             →                                   │ │  56px height
│  └────────────────────────────────────────────────┘ │  Accent color
│                                                      │
│  ─── hoặc ───                                      │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │  G  Đăng nhập│  │  🍎  Đăng nhập│                  │
│  │    với Google │  │    với Apple │                  │
│  └──────────────┘  └──────────────┘                  │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Cách hoạt động                                      │  Section
│                                                      │  Header
│  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │   🎧    │ │   ✏️    │ │   🤖    │              │
│  │          │ │          │ │          │              │
│  │  Nghe   │ │ Đánh vần │ │AI Feedback│              │
│  │  audio  │ │ transcript│ │ cá nhân  │              │
│  │  bài học│ │  của bạn │ │ hóa      │              │
│  └──────────┘ └──────────┘ └──────────┘              │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Chủ đề phổ biến                                    │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🟡 IELTS                        Beginner      │ │
│  │ 25 bài · 15 phút/bài                         │ │
│  │ Luyện nghe IELTS Listening Part 1-4          │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🟢 Daily Life                   Beginner      │ │
│  │ 32 bài · 10 phút/bài                         │ │
│  │ Đoạn hội thoại thường ngày                   │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🔵 Business                      Intermediate  │ │
│  │ 18 bài · 20 phút/bài                         │ │
│  │ Giao tiếp trong môi trường công sở          │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [Xem tất cả chủ đề →]                            │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Thống kê                                           │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │   5,000+  │  │   98%     │  │   4.8     │     │
│  │ Người dùng│  │Accuracy TB │  │ ⭐ Rating │     │
│  └────────────┘  └────────────┘  └────────────┘     │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Câu hỏi thường gặp                                │
│                                                      │
│  ▼ Chi phí là bao nhiêu?                           │
│    VinaListen hoàn toàn miễn phí. Bạn có          │
│    thể luyện nghe không giới hạn.                 │
│                                                      │
│  ▶ Tôi cần tài khoản không?                        │
│  ▶ Ứng dụng này có hiệu quả không?                │
│  ▶ Tôi có thể học trên máy tính không?             │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│              [Bắt đầu miễn phí →]                  │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  © 2026 VinaListen · Terms · Privacy · Contact     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.2 Wireframe: Dashboard (Mobile — Logged In)

```
┌──────────────────────────────────────────────────────┐
│  VinaListen              🔍        🔔(1)    👤       │  Header
├──────────────────────────────────────────────────────┤
│                                                      │
│  Xin chào, Minh! 👋                                │  Greeting
│                                                      │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐ │
│  │ 🔥🔥🔥🔥🔥🔥🔥  Streak 7 ngày!               │ │  Streak Card
│  │                                              │ │  (Accent bg)
│  │ Mục tiêu hôm nay: 1/1 bài                   │ │
│  │ ████████████████████████████████░░░░  100%  │ │
│  │                                              │ │
│  │ "Giữ streak để không phải bắt đầu lại!"    │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Tiếp tục học                                       │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  📖 First snowfall — Short Stories            │ │
│  │  ████████████░░░░░░░░  65%                  │ │
│  │  Bạn đang dở ở câu 8/20                    │ │
│  │                                              │ │
│  │                      [Tiếp tục →]            │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Gợi ý hôm nay                                      │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  📗 IELTS · Part 1: Conversations             │ │
│  │  12 bài · Intermediate                        │ │
│  │  Bạn đang cải thiện tốt!                    │ │
│  │                      [Học ngay →]             │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Học nhanh                                          │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 🎧      │  │ 🗣️      │  │ 📝      │          │
│  │ Luyện   │  │ Luyện    │  │ Ôn từ   │          │
│  │ nghe    │  │ nói      │  │ vựng    │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📚 Chủ đề phổ biến                                │
│                                                      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐         │
│  │ IELTS     │ │ Business  │ │ Daily Life│         │
│  │ 🟡 25    │ │ 🟢 18    │ │ 🟢 32    │         │
│  │ Intermediate│ │Advanced  │ │Beginner   │         │
│  └───────────┘ └───────────┘ └───────────┘         │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📊 Tuần này bạn đã học: 8 bài · 82% TB          │
│                                                      │
│  [📊 Xem tiến độ chi tiết]                        │
│                                                      │
├──────────────────────────────────────────────────────┤
│  🏠    │  👂    │  🗣️   │  📊    │  👤          │  Bottom Nav
│  Home  │ Listen │ Speak │ Stats │ Profile        │
└──────────────────────────────────────────────────────┘
```

### 3.3 Wireframe: Topics Browser (Mobile)

```
┌──────────────────────────────────────────────────────┐
│  ←  Chủ đề                           🔍 Search      │  Header
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Tất cả] [IELTS] [Business] [Daily] [Travel] [News]│  Filter Tabs
│                                                    │  (horizontal
│  (scrollable →)                                    │  scroll)
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🟡 IELTS Listening                             │ │
│  │                                                │ │
│  │ Luyện nghe IELTS Listening Part 1-4 với       │ │
│  │ đề thi thật từ Cambridge.                    │ │
│  │                                                │ │
│  │ 📖 25 bài  ·  ⏱️ 15 phút  ·  🟡 Intermediate │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🟢 Daily Life                                 │ │
│  │                                                │ │
│  │ Đoạn hội thoại thường ngày giúp bạn         │ │
│  │ giao tiếp tự nhiên hơn.                      │ │
│  │                                                │ │
│  │ 📖 32 bài  ·  ⏱️ 10 phút  ·  🟢 Beginner    │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🔵 Business English                           │ │
│  │                                                │ │
│  │ Giao tiếp trong môi trường công sở,          │ │
│  │ cuộc họp và email.                            │ │
│  │                                                │ │
│  │ 📖 18 bài  ·  ⏱️ 20 phút  ·  🔵 Advanced    │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🟠 TOEIC Listening                            │ │
│  │                                                │ │
│  │ Luyện tập TOEIC Part 1-4 với đề thi         │ │
│  │ thực tế.                                      │ │
│  │                                                │ │
│  │ 📖 20 bài  ·  ⏱️ 12 phút  ·  🟡 Intermediate │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🟢 Travel & Tourism                           │ │
│  │                                                │ │
│  │ Từ sân bay đến khách sạn, học cách nói       │ │
│  │ chuyện khi đi du lịch.                        │ │
│  │                                                │ │
│  │ 📖 15 bài  ·  ⏱️ 8 phút   ·  🟢 Beginner    │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ... more topics ...                                │
│                                                      │
├──────────────────────────────────────────────────────┤
│  🏠    │  👂    │  🗣️   │  📊    │  👤          │  Bottom Nav
│  Home  │ Listen │ Speak │ Stats │ Profile        │
└──────────────────────────────────────────────────────┘
```

### 3.4 Wireframe: Listening Practice (Mobile — Core Loop)

```
┌──────────────────────────────────────────────────────┐
│  ←  First snowfall                    💾              │  Header
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ▶️  00:42 ════════○═════════════════  03:15  │ │  Audio
│  │                                              │ │  Player
│  │   🔄   ⏪5s    1x    5s⏩                   │ │  (Sticky)
│  │                                              │ │
│  │  [📝 Transcript]                            │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Nhập những gì bạn nghe được:                       │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │                                                │ │
│  │  I am learn English every day                 │ │
│  │  to improve my listening skills               │ │
│  │                                                │ │
│  │                                                │ │
│  │                                                │ │
│  │                                                │ │
│  │  ────────────────────────────────────────     │ │
│  │  42 từ  ·  Đã lưu ✓                         │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  💡 Ctrl+Enter để kiểm tra                        │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │        Kiểm tra & Xem kết quả                 │ │  Submit
│  │              →                                  │ │  Button
│  └────────────────────────────────────────────────┘ │
│  (disabled if empty — 44px height)                 │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  KEYBOARD OPEN (Mobile)                             │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │                                                │ │
│  │  I am learn English every day                 │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│  │                                                │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │        Kiểm tra & Xem kết quả                  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘

--- SAU KHI SUBMIT (Bottom Sheet slides up) ---

┌──────────────────────────────────────────────────────┐
│  ✓ Kết quả                    [✕] [🔊 Nghe lại]    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ✅ 34  │  ❌ 6  │  📝 4           │
│  │   78%    │  đúng   │  sai   │  thiếu          │
│  │  ████████│         │        │                 │
│  │  Accurarcy│        │        │                 │
│  └──────────┘         │        │                 │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Đáp án của bạn:                                    │
│  ┌────────────────────────────────────────────────┐ │
│  │ I am learn[❌] English every day               │ │
│  │ to improve my listening[📝] skills             │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Đáp án đúng:                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │ I am learning[✅] English every day            │ │
│  │ to improve my listening skills[✅]             │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🤖 AI Phân tích                                    │
│  │                                                │ │
│  │ Bạn thường bỏ sót '-ing' ở verb.            │ │
│  │ Đặc biệt khi verb đứng sau 'am', 'is',     │ │
│  │ 'are'.                                         │ │
│  │                                                │ │
│  │ 💡 Mẹo: "I am + V-ing" — luôn có '-ing'.   │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌────────────────┐                   │
│  │ 🔄 Thử   │  │  ➡️  Câu tiếp │                   │
│  │  lại     │  │    theo       │                   │
│  └──────────┘  └────────────────┘                   │
│                                                      │
│  ┌──────────┐  ┌──────────┐                         │
│  │ 📝 Lỗi   │  │ 💾 Lưu   │                         │
│  │   sai    │  │          │                         │
│  └──────────┘  └──────────┘                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.5 Wireframe: Speaking Practice (Mobile — Phase 4)

```
┌──────────────────────────────────────────────────────┐
│  ←  Business Meeting                    💾          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ▶️  00:30 ════○══════════════════  01:15     │ │
│  │   🔄   ⏪5s    1x    5s⏩                     │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Hướng dẫn                                          │
│                                                      │
│  1️⃣ Nghe mẫu → 2️⃣ Đọc theo → 3️⃣ Ghi âm         │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  "Good morning, everyone. Thanks for coming          │
│   to today's meeting. I'll start by going          │
│   through the quarterly results."                   │
│                                                      │
│  [📝 Hiện transcript]                              │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│                                                      │
│                                                      │
│               ┌─────────────────┐                    │
│               │                 │                    │
│               │    🎤          │                    │
│               │                 │                    │
│               │   (64px tall)   │                    │
│               │                 │                    │
│               └─────────────────┘                    │
│                                                      │
│            Nhấn để ghi âm                           │
│                                                      │
│                                                      │
│              hoặc nhấn giữ để ghi                   │
│              liên tục                               │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Bạn chưa ghi âm. Thử phát âm câu này!           │
│                                                      │
├──────────────────────────────────────────────────────┤
│  🏠    │  👂    │  🗣️   │  📊    │  👤          │  Bottom Nav
│  Home  │ Listen │ Speak │ Stats │ Profile        │
└──────────────────────────────────────────────────────┘

--- SAU KHI GHI ÂM ---

┌──────────────────────────────────────────────────────┐
│  ←  Business Meeting                    💾          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🔴 Recording saved — 00:23                   │ │
│  │                                              │ │
│  │ [▶️ Nghe lại bản ghi của bạn]                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🤖 Điểm phát âm của bạn: 78/100                   │
│                                                      │
│  ████████████████████████████░░░░                  │
│                                                      │
│  Chi tiết từng từ:                                  │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ "Good"      ✅ 90 — Tốt                      │ │
│  │ "morning"   ✅ 85 — Khá tốt                  │ │
│  │ "everyone"  ⚠️ 65 — Thử mở rộng 'e'         │ │
│  │ "thanks"    ✅ 80 — Khá tốt                  │ │
│  │ "for"       ✅ 88 — Tốt                      │ │
│  │ "com*ing"   ⚠️ 55 — Nhấn mạnh 'mm'          │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  💡 Gợi ý cải thiện:                               │
│  Bạn phát âm "coming" hơi ngắn. Thử kéo dài      │
│  âm "/kʌmɪŋ/" hơn một chút.                       │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌────────────────────────────┐   │
│  │ 🔄 Ghi âm   │  │  ➡️  Câu tiếp theo        │   │
│  │   lại        │  │                           │   │
│  └──────────────┘  └────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.6 Wireframe: Progress Dashboard (Mobile)

```
┌──────────────────────────────────────────────────────┐
│  ←  Tiến độ của tôi                    [Tuần ▼]    │  Header
├──────────────────────────────────────────────────────┤
│                                                      │
│  Thống kê tổng quan                                  │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   🎯    │ │   ⏱️   │ │   📊   │ │   🔥   │  │
│  │   47    │ │  12.5h  │ │   82%   │ │   7    │  │
│  │  Bài    │ │  Giờ    │ │ Accuracy│ │  Ngày  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Tiến độ tuần này                                  │
│                                                      │
│  T2   T3   T4   T5   T6   T7   CN                  │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐              │
│  │██│ │██│ │██│ │██│ │██│ │  │ │  │              │
│  │  │ │  │ │  │ │  │ │  │ │  │ │  │              │
│  │  │ │  │ │  │ │  │ │  │ │  │ │  │              │
│  │  │ │  │ │  │ │  │ │  │ │  │ │  │              │
│  │  │ │  │ │  │ │  │ │  │ │  │ │  │              │
│  │5 │ │3 │ │4 │ │2 │ │3 │ │0 │ │0 │              │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘              │
│                                                      │
│  📈 17 bài tuần này · 12 bài tuần trước           │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Độ chính xác (30 ngày)                            │
│                                                      │
│  90%┤                          ___                  │
│     │                     ___──     ───              │
│  80%┤               ___──                ───        │
│     │          ___──                          ───  │
│  70%┤    ___──                                     │
│     ├────┴───┴───┴───┴───┴───┴───┴───┴───┴────   │
│     1    5    10   15   20   25   30              │
│                                                      │
│  ↗ +5% so với tháng trước                          │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🔴 Lỗi thường gặp                                 │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 1. Bỏ sót '-ing' ở verb         ██████████░░ │ │
│  │ 2. Nhầm /θ/ thành /s/           ████████░░░░ │ │
│  │ 3. Bỏ sót mạo từ 'the'         ██████░░░░░░░ │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [Xem chi tiết + Gợi ý cải thiện →]               │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Kỷ lục cá nhân                                    │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🏆 Best streak:      14 ngày                  │ │
│  │ 🏆 Best accuracy:    98%                     │ │
│  │ 🏆 Nhanh nhất:      2 phút 30 giây          │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🏅 Huy hiệu đã đạt (5/12)                        │
│                                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │ 🎯 │ │ 🔥 │ │ 📖 │ │ 🎓 │ │ ⚡ │ │ 🔒 │        │
│  │ ✔  │ │ ✔  │ │ ✔  │ │ ✔  │ │ ✔  │ │ 🔒 │        │
│  │1st │ │7day│ │10ls│ │perf│ │speed│ │100d│        │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘        │
│                                                      │
│  [Xem tất cả huy hiệu →]                          │
│                                                      │
├──────────────────────────────────────────────────────┤
│  🏠    │  👂    │  🗣️   │  📊    │  👤          │  Bottom Nav
│  Home  │ Listen │ Speak │ Stats │ Profile        │
└──────────────────────────────────────────────────────┘
```

### 3.7 Wireframe: Profile (Mobile)

```
┌──────────────────────────────────────────────────────┐
│  ←  Hồ sơ                                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│         ┌──────────┐                                │
│         │   👤     │                               │
│         │  Avatar  │      Minh Phạ                │
│         └──────────┘      minh.pham@email.com       │
│                                                      │
│              [Chỉnh sửa]                          │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🏆 Thành tích                                     │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  🔥  7 ngày streak          [🔒] 30 ngày     │ │
│  │  📖  47 bài                 [🔒] 100 bài     │ │
│  │  🎓  5 perfect scores       [🔒] 20 perfect  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📋 Tài khoản                                       │
│                                                      │
│  ├── ✉️  minh.pham@email.com                      │
│  ├── 🔗  Google — Đã kết nối                      │
│  ├── 🔗  Apple — Đã kết nối                       │
│  └── 🔐  [Đổi mật khẩu]                           │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  💎 Premium                                         │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │                                                 │ │
│  │  💎 Bạn đang dùng gói Free                    │ │
│  │                                                 │ │
│  │  Nâng cấp Premium để:                         │ │
│  │  ✓ Không giới hạn AI Feedback                 │ │
│  │  ✓ Tốc độ audio 0.5x - 2x                    │ │
│  │  ✓ Luyện nói với AI                          │ │
│  │  ✓ Chứng chỉ hoàn thành                      │ │
│  │                                                 │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │  💎 Nâng cấp Premium — 49,000đ/tháng   │  │ │
│  │  └─────────────────────────────────────────┘  │ │
│  │                                                 │ │
│  │  hoặc [Mua Lifetime — 990,000đ — Tiết kiệm 50%] │ │
│  │                                                 │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ⚙️  Cài đặt                                       │
│                                                      │
│  ├── 🌙 Giao diện          [Sáng ▼]               │
│  │   └── Sáng · Tối · Tự động                    │
│  ├── 🔔 Thông báo                                │
│  │   ├── Nhắc nhở hàng ngày     [Bật]           │
│  │   ├── Cảnh báo streak         [Bật]          │
│  │   └── Thành tích mới          [Bật]           │
│  ├── 🎯 Mục tiêu hàng ngày   [1 bài ▼]           │
│  └── 🌐 Ngôn ngữ           [Tiếng Việt ▼]         │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ❓ Trợ giúp & Phản hồi                           │
│                                                      │
│  ├── 📖 Hướng dẫn sử dụng                        │
│  ├── 💬 Chat với hỗ trợ                          │
│  ├── 📧 Email: support@vinalisten.app              │
│  └── 🚀 Gửi phản hồi                              │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📱 Về ứng dụng                                    │
│                                                      │
│  ├── ℹ️  Phiên bản 1.0.0                         │
│  ├── 📜 Điều khoản sử dụng                       │
│  ├── 🔒 Chính sách bảo mật                       │
│  └── 🚪 [Đăng xuất]                               │
│                                                      │
├──────────────────────────────────────────────────────┤
│  🏠    │  👂    │  🗣️   │  📊    │  👤          │  Bottom Nav
│  Home  │ Listen │ Speak │ Stats │ Profile        │
└──────────────────────────────────────────────────────┘
```

---

## PART 4: RESPONSIVE DESIGN STRATEGY

### 4.1 Breakpoints

| Breakpoint | Width | Device | Layout |
|---|---|---|---|
| **xs** | 320px - 479px | iPhone SE, old Android | 1 column, bottom nav |
| **sm** | 480px - 767px | iPhone 12/13/14/15, Android mid-range | 1 column, bottom nav |
| **md** | 768px - 1023px | iPad Mini, iPad | 2 columns for lists, top nav |
| **lg** | 1024px - 1279px | iPad Pro, small laptops | 2-3 columns, side nav |
| **xl** | 1280px - 1535px | Desktop, MacBook | 3-4 columns, side nav |
| **2xl** | 1536px+ | Large desktop, ultrawide | Max-width 1280px centered |

### 4.2 Layout Patterns by Screen Size

#### Mobile First Grid (320px - 479px)

```
Topic Cards: 1 column (full width)
Stats Cards: 2 columns (stacked on smallest)
Audio Player: Full width, stacked
Input Area: Full width
Result Panel: Bottom sheet (slides up)
Navigation: Bottom tab bar (fixed)
```

#### Tablet (768px - 1023px)

```
Topic Cards: 2 columns
Stats Cards: 4 columns in a row
Audio Player: 60% width, input 40% (side by side)
Result Panel: Right sidebar or bottom sheet (user toggle)
Navigation: Top header with hamburger menu
```

#### Desktop (1024px+)

```
Topic Cards: 3-4 columns
Stats Cards: 4 columns in a row
Audio Player: Left 50%, Input Right 50%
Result Panel: Full width below (after submit)
Navigation: Fixed left sidebar (240px)
Content Max Width: 1280px
```

### 4.3 Mobile-Specific Patterns

| Pattern | Implementation | When to Use |
|---|---|---|
| **Bottom Sheet** | Slides up from bottom, drag to dismiss | Result panel, AI feedback |
| **Sticky Audio Player** | Fixed top, persists during scroll | Listening practice |
| **Pull to Refresh** | Pull down gesture | Dashboard, topic list |
| **Swipe Actions** | Swipe left/right on list items | Bookmark, skip |
| **Long Press Context** | Hold to show options | All list items |
| **Expandable Cards** | Tap to expand details | Topic cards, lesson list |
| **Skeleton Loading** | Shimmer placeholders | All content areas |
| **Floating Action Button** | Fixed position, bottom-right | Quick actions |
| **Keyboard-Aware Layout** | Scroll to keep input visible | All input forms |
| **Safe Area Padding** | Respect notch + home indicator | All screens, iOS |

### 4.4 Responsive Audio Player Behavior

```
MOBILE (320-767px):
┌────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────┐│
│ │ ▶️  00:42 ══════○══════  03:15   🔄  1x  📝  ││
│ └──────────────────────────────────────────────────┘│  ← Sticky top
│                                                    │
│ [Content area scrolls]                             │
│                                                    │
│ [Input textarea — keyboard-aware]                  │
│                                                    │
│ [Submit button — above keyboard]                   │
│                                                    │
│ ────────────────────────────────────────────────── │
│ Bottom Sheet (result):                            │
│ ┌──────────────────────────────────────────────────┐│
│ │ Accuracy: 78%                                  ││
│ │ [AI Feedback]                                   ││
│ │ [Retry] [Next]                                  ││
│ └──────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘

TABLET (768-1023px):
┌────────────────────────────────────────────────────┐
│ [Top Header: ← Back | Lesson Name | 🔊 Transcript] │
├────────────────────────────┬───────────────────────┤
│                            │                       │
│     Audio Player           │   Transcript Input    │
│     (60% width)           │   (40% width)        │
│                            │                       │
│     ▶️  ⏸️  🔄           │   [Textarea]         │
│     ═══════════════○═══   │                       │
│     00:42 / 03:15         │   [Check] button     │
│                            │                       │
│     Speed: 0.5x 0.75x 1x  │   Result panel       │
│                            │   slides in below     │
│                            │                       │
└────────────────────────────┴───────────────────────┘

DESKTOP (1024px+):
┌──────────────────────────────────────────────────────────┐
│ [Sidebar 240px]        │ [Main Content — max 1040px]     │
│                        │                                   │
│ 🏠 Dashboard           │ ┌──────────────────────────────┐│
│ 👂 Listening           │ │ Audio Player (full width)    ││
│ 🗣️ Speaking            │ │ ▶️ ⏸️ 🔄  ═══════○═══    ││
│ 📚 Topics              │ │ 00:42 / 03:15    Speed       ││
│ ────────────────────── │ └──────────────────────────────┘│
│ 📊 Progress            │ ┌─────────────────┬────────────┐│
│ 🔖 Bookmarks          │ │ Transcript Input│ AI Result  ││
│ 🔥 Streak              │ │                 │            ││
│ ────────────────────── │ │ [Textarea]     │ Accuracy   ││
│ ⚙️ Settings           │ │                 │ 78%        ││
│                        │ │ [Check]        │ AI Feedback││
│                        │ │                 │ [Retry][→] ││
│                        │ └─────────────────┴────────────┘│
└────────────────────────┴─────────────────────────────────┘
```

---

## PART 5: ACCESSIBILITY REQUIREMENTS

### 5.1 WCAG AA Compliance Checklist

| Requirement | Implementation | Priority |
|---|---|---|
| Color contrast ratio | All text: 4.5:1 minimum, large text: 3:1 | Must |
| Focus indicators | Visible focus ring (2px solid, offset) | Must |
| Touch targets | Minimum 44x44px | Must |
| Keyboard navigation | All features accessible via keyboard | Must |
| Screen reader | ARIA labels on all interactive elements | Must |
| Reduced motion | Respect prefers-reduced-motion | Should |
| Text resizing | Support up to 200% zoom | Should |
| Color independence | Not convey info by color alone | Must |
| Error identification | Clear error messages with suggestions | Must |
| Skip navigation | Skip to main content link | Should |

### 5.2 Screen Reader Considerations

| Element | ARIA Label |
|---|---|
| Audio play button | "Phát audio, hiện tại 42 giây trong tổng 3 phút 15 giây" |
| Speed selector | "Tốc độ phát, hiện tại 1 lần. Nhấn để thay đổi." |
| Submit button | "Kiểm tra kết quả, đang disabled vì chưa nhập gì" |
| Accuracy score | "Độ chính xác 78 phần trăm, 34 từ đúng, 6 từ sai, 4 từ thiếu" |
| Streak badge | "Streak 7 ngày, giữ streak bằng cách hoàn thành 1 bài học hôm nay" |
| Word with error | "Từ sai: 'learn' nên là 'learning', thiếu 'ing'" |

---

## PART 6: UI RECOMMENDATIONS

### 6.1 Typography Scale

| Element | Mobile | Desktop | Weight |
|---|---|---|---|
| H1 (Hero) | 28px / 36px line | 40px / 52px line | Bold (700) |
| H2 (Section) | 22px / 30px line | 28px / 36px line | SemiBold (600) |
| H3 (Card Title) | 18px / 26px line | 20px / 28px line | SemiBold (600) |
| Body | 16px / 24px line | 16px / 24px line | Regular (400) |
| Body Small | 14px / 20px line | 14px / 20px line | Regular (400) |
| Caption | 12px / 16px line | 12px / 16px line | Regular (400) |
| Button | 16px / 24px line | 16px / 24px line | SemiBold (600) |

### 6.2 Color System (Recommended)

Based on PRD design system (Duolingo-inspired):

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--primary` | #35375B | #E8E8F0 | Primary actions, headers |
| `--accent` | #FF5632 | #FF7A5C | CTA, streak fire, highlights |
| `--success` | #00BE7C | #4DDBA7 | Correct answers, achievements |
| `--error` | #FF3257 | #FF6B80 | Wrong answers, errors |
| `--warning` | #FFAB00 | #FFD54F | Warnings, attention |
| `--bg-primary` | #FFFFFF | #1A1A2E | Main background |
| `--bg-secondary` | #F5F5F7 | #252540 | Cards, sections |
| `--bg-tertiary` | #EFEFEF | #2E2E4A | Input backgrounds |
| `--text-primary` | #1A1A2E | #FFFFFF | Headings |
| `--text-secondary` | #6B6B7B | #A0A0B0 | Body text |
| `--border` | #E0E0E8 | #3A3A5C | Borders, dividers |
| `--streak-fire` | #FF5632 | #FF7A5C | Streak counter |
| `--streak-inactive` | #D0D0D8 | #4A4A6A | Streak died |

### 6.3 Spacing System

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Icon padding, tight gaps |
| `--space-2` | 8px | Component internal spacing |
| `--space-3` | 12px | Card padding, input padding |
| `--space-4` | 16px | Section spacing, standard gaps |
| `--space-5` | 20px | Card margins |
| `--space-6` | 24px | Section separation |
| `--space-8` | 32px | Large section gaps |
| `--space-10` | 40px | Page section margins |
| `--space-12` | 48px | Hero spacing |
| `--radius-sm` | 8px | Buttons, small cards |
| `--radius-md` | 12px | Cards, modals |
| `--radius-lg` | 16px | Large cards, sheets |
| `--radius-xl` | 24px | Bottom sheets |
| `--radius-full` | 9999px | Pills, avatars |

### 6.4 Animation Guidelines

| Animation | Duration | Easing | Usage |
|---|---|---|---|
| Page transition | 200ms | ease-out | Screen changes |
| Bottom sheet slide | 300ms | spring (damping: 0.8) | Result panel open |
| Button press | 100ms | ease-in-out | Tap feedback |
| Skeleton shimmer | 1.5s | linear | Loading states |
| Progress bar | 500ms | ease-out | Score reveal |
| Streak fire | 2s loop | ease-in-out | Streak animation |
| Confetti | 3s | — | Achievement unlock |
| Modal fade | 200ms | ease-out | Error/success modals |
| Toast slide | 250ms | spring | Notifications |

> **Respect `prefers-reduced-motion`**: All animations should be disabled or reduced if user has enabled this setting.

### 6.5 Component Patterns

#### Primary Button
- Height: 48px (mobile), 44px (desktop)
- Border-radius: `--radius-full`
- Background: `--accent`
- Text: White, SemiBold
- Tap feedback: Scale 0.97 + brightness

#### Card (Topic/Lesson)
- Border-radius: `--radius-md`
- Background: `--bg-secondary`
- Shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Tap feedback: Scale 0.98 + shadow increase
- Padding: `--space-4`

#### Bottom Tab Bar
- Height: 64px + safe area
- Background: `--bg-primary`
- Border-top: 1px `--border`
- Active tab: `--accent` icon + label
- Inactive tab: `--text-secondary`

#### Bottom Sheet
- Border-radius: `--radius-xl` top
- Drag handle: 40px × 4px, centered, `--border` color
- Max height: 85vh
- Backdrop: rgba(0,0,0,0.4)

#### Audio Player
- Background: `--bg-tertiary`
- Border-radius: `--radius-md`
- Play button: 56px circle
- Progress bar: 4px height, `--accent` fill

#### Streak Badge
- Background: `--accent` gradient (orange to red)
- Icon: 🔥 + number
- Pulsing animation when at risk
- Gray version when streak died

---

## APPENDIX: Navigation State Map

| Screen | Previous | Next | Global Nav |
|---|---|---|---|
| Landing | — | Auth | Minimal (Logo + Login) |
| Auth | Landing | Onboarding | Minimal |
| Onboarding | Auth | Dashboard | Progress indicator |
| Dashboard | — | Topics / Lesson | Full (5 tabs) |
| Topics | Dashboard | Lesson List | Full |
| Lesson List | Topics | Practice | Back + Full |
| Practice | Lesson List | Result / Next | Minimal (back only) |
| Result | Practice | Next / Dashboard | — (same screen) |
| Speaking | Dashboard / Topics | Recording | Full |
| Recording | Speaking | Feedback | Minimal |
| Feedback | Recording | Next / Dashboard | — |
| Progress | Dashboard | — | Full |
| Vocabulary | Dashboard | Flashcard | Full |
| Flashcard | Vocabulary | — | Minimal |
| Bookmarks | Dashboard | Practice | Full |
| History | Dashboard | Practice | Full |
| Leaderboard | Dashboard | — | Full |
| Profile | Dashboard | — | Full |
