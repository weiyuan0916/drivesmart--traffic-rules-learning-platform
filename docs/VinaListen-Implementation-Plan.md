# VinaListen — Implementation Plan
## MVP Scope · 30-Day Build · Listening + Speaking Loop

**Date:** 2026-06-07  
**Strategy:** Free-first, data-driven, MVP validation  
**Goal:** Stable daily habit loop in 30 days

---

## STRATEGIC OVERVIEW

### MVP Loop (User Journey)

```
User vào web
    │
    ▼
Landing Page (wow moment, onboarding)
    │
    ▼
Chọn Topic → Chọn Lesson
    │
    ▼
🎧 LISTEN — Audio player (play/pause/speed)
    │
    ▼
⌨️ TRANSCRIPT TYPING — User nhập transcript
    │
    ▼
✅ CHECK — So sánh + hiện accuracy
    │
    ▼
🎤 VOICE RECORDING — User nói lại câu đó
    │
    ▼
🎯 SPEECH RECOGNITION — Chuyển audio → text
    │
    ▼
📊 SCORE — Điểm pronunciation + accuracy
    │
    ▼
📝 HISTORY — Lưu bài đã học
    │
    ▼
📈 PROGRESS — Dashboard với stats
    │
    ▼
🔥 STREAK — Streak counter + reminder
    │
    ▼
🔄 QUAY LẠI NGÀY MAI
```

### Data Dependency

```
CURRENT DATA (từ crawler):
├── ✅ Audio files: [topic]/[lesson].mp3 + [topic]/[lesson]/clip_XXX.mp3
├── ✅ Transcripts: JSON per lesson
├── ✅ Vocabulary: per lesson
└── ❌ Reading: KHÔNG CÓ — Phase 2

MVP tận dụng 100% data hiện có.
Reading = new module → Phase 2.
```

---

## IMPLEMENTATION Phases

```
PHASE A: Infrastructure (Day 1-5)
├── Project setup
├── Database schema
├── Auth (simple)
├── API structure
└── Crawler data ingestion

PHASE B: Core MVP (Day 6-20)
├── Landing Page + Onboarding
├── Audio Player
├── Transcript Typing
├── Check & Score
├── Voice Recording
├── Speech Recognition
└── Basic History

PHASE C: Retention (Day 21-25)
├── Progress Dashboard
├── Streak System
├── Push Notifications
└── Dashboard

PHASE D: Polish & Launch (Day 26-30)
├── Wow Moment
├── Mobile optimization
├── SEO setup
└── Soft launch
```

---

## PHASE A: Infrastructure (Day 1-5)

### A.1 Project Setup

```
Tasks:
├── [ ] Initialize Next.js 14 + App Router + TypeScript
├── [ ] Setup Tailwind CSS v4
├── [ ] Setup ESLint + Prettier
├── [ ] Setup Git + branch strategy (main, dev)
├── [ ] Setup Vercel deployment
└── [ ] Setup Supabase project (free tier)

Deliverable: Blank Next.js app deployed, accessible via Vercel URL
```

### A.2 Database Schema (Supabase)

```
Tables:

1. users
├── id: uuid PRIMARY KEY
├── email: text UNIQUE
├── name: text
├── created_at: timestamp
├── current_streak: integer DEFAULT 0
├── longest_streak: integer DEFAULT 0
├── streak_start_date: date
└── last_lesson_date: date

2. topics
├── id: uuid PRIMARY KEY
├── slug: text UNIQUE
├── name: text
├── name_vi: text
├── description: text
├── description_vi: text
├── icon: text (emoji)
├── color: text (hex)
├── order_index: integer
└── created_at: timestamp

3. lessons
├── id: uuid PRIMARY KEY
├── topic_id: uuid REFERENCES topics
├── slug: text
├── name: text
├── audio_url: text
├── transcript: text
├── vocabulary: jsonb
├── vocab_level: text (A1/A2/B1/B2/C1/C2)
├── duration_seconds: integer
├── order_index: integer
├── created_at: timestamp
└── UNIQUE(topic_id, slug)

4. lesson_clips (sub-parts của 1 lesson)
├── id: uuid PRIMARY KEY
├── lesson_id: uuid REFERENCES lessons
├── clip_url: text
├── transcript: text
├── order_index: integer
└── duration_seconds: integer

5. user_progress
├── id: uuid PRIMARY KEY
├── user_id: uuid REFERENCES users
├── lesson_id: uuid REFERENCES lessons
├── accuracy: float
├── score: integer (tổng điểm)
├── completed_at: timestamp
└── UNIQUE(user_id, lesson_id)

6. user_clip_progress
├── id: uuid PRIMARY KEY
├── user_id: uuid REFERENCES users
├── clip_id: uuid REFERENCES lesson_clips
├── transcript_input: text
├── accuracy: float
├── recording_url: text
├── pronunciation_score: float
├── completed_at: timestamp
└── UNIQUE(user_id, clip_id)

7. vocabulary_learning
├── id: uuid PRIMARY KEY
├── user_id: uuid REFERENCES users
├── word: text
├── lesson_id: uuid REFERENCES lessons
├── mastery: integer DEFAULT 0 (0-5)
├── next_review: timestamp
├── last_reviewed: timestamp
└── created_at: timestamp

8. daily_activity
├── id: uuid PRIMARY KEY
├── user_id: uuid REFERENCES users
├── date: date
├── lessons_completed: integer DEFAULT 0
├── clips_completed: integer DEFAULT 0
├── total_time_minutes: integer DEFAULT 0
└── UNIQUE(user_id, date)
```

### A.3 Auth (Simple)

```
Tasks:
├── [ ] Setup Supabase Auth (email + Google OAuth)
├── [ ] Create auth context + hooks
├── [ ] Create middleware for protected routes
├── [ ] Create login/signup pages
├── [ ] Create onboarding redirect
└── [ ] Create profile page

Deliverable: User có thể đăng ký, login, logout
```

### A.4 Crawler Data Ingestion

```
Tasks:
├── [ ] Write migration script: JSON → Supabase
├── [ ] Map topic data → topics table
├── [ ] Map lesson data → lessons table
├── [ ] Map clip data → lesson_clips table
├── [ ] Run initial data ingestion
├── [ ] Verify data integrity
└── [ ] Create re-ingestion script (for future updates)

Deliverable: Tất cả audio + transcript từ crawler đã trong Supabase
```

---

## PHASE B: Core MVP (Day 6-20)

### B.1 Landing Page

```
Tasks:
├── [ ] Design hero section:
│   ├── Headline: "Luyện nghe-nói tiếng Anh mỗi ngày"
│   ├── Subheadline: "Nghe → Gõ → Nói → Tiến bộ"
│   ├── CTA: "Bắt đầu ngay" → Register/Login
│   └── Mini demo: 10s audio loop
│
├── [ ] Feature highlights section:
│   ├── 🎧 Học với audio chất lượng cao
│   ├── ⌨️ Luyện nghe chép chính tả
│   ├── 🎤 Nói lại và nhận feedback
│   └── 📈 Theo dõi tiến độ học tập
│
├── [ ] Social proof section:
│   ├── Testimonials (placeholder, fill later)
│   └── Stats: "1,000+ bài học, 5,000+ người học"
│
├── [ ] CTA section: "Đăng ký miễn phí ngay"
│
├── [ ] Footer: About, Privacy, Terms, Contact
│
├── [ ] SEO:
│   ├── Meta title + description
│   ├── Open Graph tags
│   ├── Structured data (WebSite + SoftwareApplication)
│   └── Sitemap setup
│
└── [ ] Mobile responsive

Deliverable: Landing page đẹp, responsive, có CTA rõ ràng
```

### B.2 Onboarding Flow

```
Tasks:
├── [ ] Step 1: Goal selection
│   ├── "Bạn học tiếng Anh để làm gì?"
│   ├── Options: IELTS / TOEIC / Giao tiếp / Tự học / Khác
│   └── Save to user profile
│
├── [ ] Step 2: Level check (optional)
│   ├── "Trình độ nghe của bạn?"
│   ├── Options: Mới bắt đầu / Trung bình / Khá
│   └── Auto-suggest difficulty level
│
├── [ ] Step 3: Topic recommendation
│   ├── Auto-recommend 1 topic dựa trên goal
│   ├── Show: Topic name + description + lesson count
│   └── [Bắt đầu học] [Xem tất cả topics]
│
├── [ ] Step 4: First lesson intro
│   ├── Explain: "Nghe → Gõ → Nói → Xem kết quả"
│   ├── Show mini walkthrough (3 slides)
│   └── [Bắt đầu bài đầu tiên]
│
└── [ ] Progress: dots indicator + skip option

Deliverable: User hiểu app trong < 2 phút, vào bài đầu tiên ngay
```

### B.3 Topic & Lesson Selection

```
Tasks:
├── [ ] Topics listing page
│   ├── Grid of topic cards
│   ├── Each card: Icon + Name + Lesson count + Description
│   ├── Filter: All / IELTS / TOEIC / Daily / Business
│   ├── Search bar (realtime filter)
│   └── Sort: Popular / Newest / Alphabetical
│
├── [ ] Topic detail page
│   ├── Topic header (name, description, stats)
│   ├── Lessons list
│   ├── Progress bar (% completed)
│   └── [Tiếp tục] button if in-progress
│
├── [ ] Lesson card component
│   ├── Lesson name
│   ├── Duration
│   ├── Vocab level badge
│   ├── Completion status (done/not done)
│   └── Locked indicator (if applicable)
│
├── [ ] Lesson detail page
│   ├── Lesson header
│   ├── Transcript preview (spoiler warning)
│   ├── [Bắt đầu] button
│   └── Related lessons
│
└── [ ] URL structure: /topics, /topics/[slug], /listen/[id]

Deliverable: User có thể browse + select topic + lesson dễ dàng
```

### B.4 Audio Player (Listening)

```
Tasks:
├── [ ] Core player UI
│   ├── Play/Pause button (large, central)
│   ├── Progress bar (seekable)
│   ├── Current time / Total time
│   ├── Volume control
│   └── Playback speed selector: 0.5x, 0.75x, 1x, 1.25x, 1.5x
│
├── [ ] Audio source handling
│   ├── Primary: Full lesson audio (MP3)
│   ├── Fallback: Individual clips
│   ├── Loading state: Skeleton + spinner
│   └── Error state: "Audio không tải được. Thử lại?"
│
├── [ ] Keyboard shortcuts
│   ├── Space = Play/Pause
│   ├── Arrow Left = Back 5s
│   ├── Arrow Right = Forward 5s
│   └── 1-5 = Set playback speed
│
├── [ ] Mobile optimizations
│   ├── Swipe gestures: left/right to seek
│   ├── Double-tap: left/right to skip
│   └── Keep screen awake during playback
│
├── [ ] Accessibility
│   ├── aria-label cho tất cả controls
│   ├── Keyboard navigation
│   └── Focus visible states
│
└── [ ] Loop controls
    ├── 🔁 Loop sentence (play current clip again)
    └── 🔂 Loop all (loop entire lesson)

Deliverable: Audio player smooth, accessible, works on mobile
```

### B.5 Transcript Typing

```
Tasks:
├── [ ] Transcript input area
│   ├── Large textarea (min 4 rows)
│   ├── Placeholder: "Nhập transcript ở đây..."
│   ├── Character/word count
│   ├── Clear button
│   └── Auto-focus on load
│
├── [ ] Real-time feedback
│   ├── Current word highlight (optional)
│   ├── Auto-capitalize first letter
│   └── Paste disabled (prevent cheating)
│
├── [ ] Audio sync
│   ├── Auto-scroll transcript (optional toggle)
│   ├── Highlight current sentence
│   └── "Bật tắt đồng bộ"
│
├── [ ] Keyboard shortcuts
│   ├── Ctrl/Cmd + Enter = Submit/Check
│   └── R = Replay audio
│
├── [ ] Mobile keyboard
│   ├── Auto-show keyboard on mobile
│   ├── Submit button visible above keyboard
│   └── Hide suggestions if possible
│
└── [ ] Help tooltip
    └── "Nhấn Space để phát/tạm dừng. Ctrl+Enter để kiểm tra."

Deliverable: User có thể nghe và gõ transcript dễ dàng
```

### B.6 Check & Score

```
Tasks:
├── [ ] Comparison engine
│   ├── Normalize text (lowercase, remove punctuation)
│   ├── Word-by-word comparison
│   ├── Mark: correct / wrong / missing / extra
│   └── Accuracy calculation: (correct / total) * 100
│
├── [ ] Result display
│   ├── Side-by-side view: Expected vs. User's
│   ├── Color coding:
│   │   ├── ✅ Green: Correct word
│   │   ├── ❌ Red: Wrong word
│   │   ├── ➖ Underline: Missing word
│   │   └── 🟠 Orange highlight: Extra word
│   │
│   ├── Summary stats:
│   │   ├── Accuracy: 85%
│   │   ├── Correct: 34 words
│   │   ├── Wrong: 5 words
│   │   ├── Missing: 1 word
│   │   └── Extra: 0
│   │
│   └── Score: 0-100 points
│
├── [ ] AI Feedback (basic)
│   ├── Pattern detection: missing articles, wrong tense, etc.
│   ├── Simple rules-based feedback
│   └── "Tip: Chú ý các mạo từ 'a', 'an', 'the'"
│
├── [ ] Actions
│   ├── [Nghe lại] → Replay audio
│   ├── [Thử lại] → Clear input + retry
│   ├── [Tiếp tục] → Next clip/sentence
│   └── [Nói lại] → Go to voice recording
│
└── [ ] Animations
    ├── Fade in results
    ├── Count up accuracy
    └── Shake animation on wrong words

Deliverable: User thấy rõ đúng/sai, hiểu lỗi, có điểm số
```

### B.7 Voice Recording (Speaking)

```
Tasks:
├── [ ] Recording UI
│   ├── Microphone button (large, red when recording)
│   ├── Recording status: "Đang ghi..." / "Hoàn thành"
│   ├── Duration display
│   ├── Waveform visualizer (simple)
│   └── Stop button
│
├── [ ] Recording logic
│   ├── MediaRecorder API (WebM/Opus)
│   ├── Max duration: 30 seconds
│   ├── Auto-stop at limit
│   ├── Save to memory (not server yet)
│   └── Error handling: mic permission denied
│
├── [ ] Playback controls
│   ├── Play/pause recording
│   ├── Re-record button
│   └── Compare: Play original vs. user recording
│
├── [ ] Permissions
│   ├── Request mic permission on first use
│   ├── Show permission guide if denied
│   └── Fallback: "Tính năng không khả dụng trên thiết bị này"
│
├── [ ] Mobile optimizations
│   ├── Large touch target (min 44x44px)
│   ├── Haptic feedback (if supported)
│   └── Keep screen awake during recording
│
└── [ ] Accessibility
    ├── aria-label cho record button
    └── Keyboard: Enter = Start/Stop recording

Deliverable: User có thể record giọng nói dễ dàng
```

### B.8 Speech Recognition

```
Tasks:
├── [ ] Speech-to-Text integration
│   ├── Primary: Web Speech API (free, browser-native)
│   │   ├── speechRecognition.continuous = true
│   │   ├── speechRecognition.interimResults = true
│   │   └── speechRecognition.lang = 'en-US'
│   │
│   └── Fallback: Supabase Edge Function (Whisper API)
│       ├── For browsers without Web Speech API
│       └── Mobile Safari fallback
│
├── [ ] Real-time transcription
│   ├── Live preview as user speaks
│   ├── Interim results (dashed underline)
│   └── Final results (solid)
│
├── [ ] Recording-to-Transcription flow
│   ├── After recording: Auto-transcribe
│   ├── Loading state: "Đang nhận diện giọng nói..."
│   ├── Error state: "Không nhận diện được. Thử lại?"
│   └── Result: Show transcribed text
│
├── [ ] Comparison
│   ├── Compare: User audio → Transcribed text
│   ├── Compare: Transcribed text vs. Expected
│   ├── Pronunciation score: (matched phonemes / total)
│   └── Visual: highlight correct/incorrect words
│
└── [ ] Browser compatibility
    ├── Chrome/Edge: Full Web Speech API
    ├── Firefox: Partial (may use fallback)
    └── Safari/iOS: Fallback to Whisper API

Deliverable: Convert user speech → text → compare with expected
```

### B.9 Score Display

```
Tasks:
├── [ ] Pronunciation score
│   ├── Overall score: 0-100
│   ├── Breakdown: Accuracy, Fluency, Pronunciation
│   ├── Color coding: Red (<60), Yellow (60-80), Green (>80)
│   └── Animated score reveal
│
├── [ ] Comparison view
│   ├── Expected: "I am learning English"
│   ├── You said: "I am lerning English"
│   ├── Highlight: Correct / Mispronounced / Missing
│   └── Phonetic diff (optional: show IPA if available)
│
├── [ ] Feedback
│   ├── Simple: "Good job!" / "Keep practicing!"
│   ├── Specific: "Bạn phát âm 'learning' chưa chuẩn"
│   └── Tip: "Thử nghe lại từ này ở tốc độ 0.75x"
│
├── [ ] Actions
│   ├── [Nghe lại] → Play original
│   ├── [Nghe mình] → Play recording
│   ├── [Thử lại] → Record again
│   ├── [Tiếp tục] → Next sentence
│   └── [Kết thúc bài] → Go to lesson complete
│
└── [ ] Lesson complete screen
    ├── Overall lesson score
    ├── Clips completed: X/Y
    ├── Accuracy: X%
    ├── Pronunciation avg: X%
    ├── XP earned: +XX
    ├── Streak: 🔥 X (if applicable)
    └── [Bài tiếp theo] [Về Dashboard]

Deliverable: User hiểu điểm mạnh/yếu, có động lực tiếp tục
```

### B.10 Basic History

```
Tasks:
├── [ ] Lesson history page
│   ├── List of completed lessons
│   ├── Each item: Date, Topic, Lesson name, Score, Accuracy
│   ├── Sort: Newest first
│   ├── Filter: By topic, By date range
│   └── Pagination or infinite scroll
│
├── [ ] Lesson detail history
│   ├── View past transcript submissions
│   ├── View past recordings (playback)
│   ├── View past scores
│   └── Compare with current performance
│
├── [ ] Daily activity log
│   ├── Calendar view (GitHub-style)
│   ├── Green = completed, Gray = no activity
│   └── Click date → view day's activity
│
├── [ ] API endpoints
│   ├── GET /api/history
│   ├── GET /api/history/lesson/[id]
│   └── GET /api/history/daily
│
└── [ ] Storage
    └── Save recording URLs to Supabase Storage

Deliverable: User có thể xem lại tất cả bài đã học
```

---

## PHASE C: Retention (Day 21-25)

### C.1 Progress Dashboard

```
Tasks:
├── [ ] Overview cards
│   ├── Total lessons completed
│   ├── Total time practiced
│   ├── Average accuracy
│   └── Average pronunciation score
│
├── [ ] Weekly chart
│   ├── Bar chart: lessons/day (7 days)
│   ├── Line chart: accuracy trend
│   └── Streak indicator
│
├── [ ] Topic breakdown
│   ├── Progress per topic (%)
│   ├── Lessons completed per topic
│   └── Recommended next topic
│
├── [ ] Vocabulary progress
│   ├── Words learned
│   ├── Words mastered
│   └── Review due today
│
├── [ ] Charts library
│   ├── Use Recharts (lightweight)
│   └── Responsive, mobile-friendly
│
└── [ ] Export
    └── "Xuất báo cáo tuần" (PDF, optional Phase 2)

Deliverable: User thấy rõ tiến độ, có động lực tiếp tục
```

### C.2 Streak System

```
Tasks:
├── [ ] Streak tracking
│   ├── Increment streak when user completes ≥1 lesson/day
│   ├── Reset streak if no lesson completed yesterday
│   ├── Track: current_streak, longest_streak, streak_start_date
│   └── Update in real-time on lesson complete
│
├── [ ] Streak display
│   ├── Streak counter in header (always visible)
│   ├── Fire animation (🔥) when streak > 0
│   ├── Milestone celebrations:
│   │   ├── 7 days: "1 tuần! Bạn đang tạo thói quen!"
│   │   ├── 30 days: "Tháng! Impressive!"
│   │   └── 100 days: "100 ngày! Legendary!"
│   └── Streak at risk indicator
│
├── [ ] Streak freeze
│   ├── 1 free freeze/week (resets Monday)
│   ├── Auto-apply if user hasn't practiced today
│   ├── Show: "Streak đang bảo vệ!"
│   └── Visual: Snowflake icon on protected days
│
├── [ ] Streak calendar
│   ├── GitHub-style contribution graph
│   ├── Green = practiced, Gray = missed, Blue = freeze
│   └── Click date → view activity
│
├── [ ] API endpoints
│   ├── GET /api/streak (current status)
│   ├── POST /api/streak/check-in (complete a lesson)
│   └── GET /api/streak/calendar
│
└── [ ] Database triggers
    └── Auto-update streak on daily_activity insert

Deliverable: Streak visible everywhere, automatic, celebrated
```

### C.3 Push Notifications

```
Tasks:
├── [ ] Permission request
│   ├── Show prompt after first lesson complete
│   ├── Explain benefit: "Nhận nhắc nhở hàng ngày"
│   └── Handle deny gracefully
│
├── [ ] Notification types
│   ├── Type 1: Streak at risk (11pm)
│   │   └── "🔥 Streak X ngày! Còn 1 giờ để hoàn thành bài hôm nay!"
│   │
│   ├── Type 2: Daily reminder (user-chosen time)
│   │   └── "Chào buổi sáng! 5 phút luyện nghe nhé? 🔥X"
│   │
│   ├── Type 3: Streak broken
│   │   └── "😢 Streak đã reset. Bắt đầu lại hôm nay nhé!"
│   │
│   ├── Type 4: Comeback (Day 3, 7, 14 no activity)
│   │   └── "Chúng tôi nhớ bạn! Quay lại nhé?"
│   │
│   └── Type 5: Milestone reached
│       └── "🎉 Chúc mừng streak 30 ngày!"
│
├── [ ] Implementation
│   ├── Web Push API (no backend required)
│   ├── VAPID keys in Supabase Edge Functions
│   ├── Schedule via Supabase Cron
│   └── User preferences in user_settings table
│
├── [ ] User settings
│   ├── Enable/disable notifications
│   ├── Reminder time picker
│   ├── Notification types toggle
│   └── Quiet hours
│
└── [ ] Fallback
    └── Email notification if push fails (optional)

Deliverable: Timely reminders drive daily return
```

---

## PHASE D: Polish & Launch (Day 26-30)

### D.1 Wow Moment

```
Tasks:
├── [ ] First lesson complete celebration
│   ├── 🎉 Confetti animation (lightweight, 2s)
│   ├── "CHÚC MỪNG BẠN!"
│   ├── Animated accuracy counter (0 → actual %)
│   ├── XP earned: +XX (animated badge pop)
│   ├── Streak: 🔥 1 ngày (fire animation)
│   ├── "Bạn đang top X% người học hôm nay"
│   └── [Tiếp tục học] [Về Dashboard]
│
├── [ ] Lesson complete screen
│   ├── Score summary (animated)
│   ├── Achievement unlocks (if any)
│   ├── XP + Streak display
│   └── Action buttons
│
├── [ ] Animations (using Framer Motion)
│   ├── Fade in: 300ms ease-out
│   ├── Slide up: 400ms ease-out
│   ├── Scale: 200ms spring
│   └── Confetti: canvas-confetti (lightweight)
│
├── [ ] Respect prefers-reduced-motion
│   └── Disable animations if user prefers
│
└── [ ] Sound effects (optional, off by default)
    └── Success chime on correct answers

Deliverable: User cảm thấy ĐƯỢC KHEN khi hoàn thành bài
```

### D.2 Mobile Optimization

```
Tasks:
├── [ ] Responsive audit
│   ├── Test on: iPhone SE, iPhone 15, iPad
│   ├── Breakpoints: 320px, 375px, 768px, 1024px
│   └── Fix any layout issues
│
├── [ ] Touch optimizations
│   ├── Touch targets: min 44x44px
│   ├── Swipe gestures in audio player
│   └── Pull to refresh on lists
│
├── [ ] Performance
│   ├── Image optimization (Next.js Image)
│   ├── Font optimization (next/font)
│   ├── Bundle analysis
│   └── Core Web Vitals < thresholds
│
├── [ ] PWA setup
│   ├── manifest.json
│   ├── Service worker (for offline)
│   ├── Install prompt
│   └── App icon
│
└── [ ] Testing
    ├── Chrome DevTools mobile emulation
    ├── Real device testing if possible
    └── BrowserStack if available

Deliverable: Native-like mobile experience
```

### D.3 SEO Setup

```
Tasks:
├── [ ] Technical SEO
│   ├── robots.txt
│   ├── sitemap.xml (auto-generate)
│   ├── canonical URLs
│   └── hreflang tags
│
├── [ ] Meta tags (all pages)
│   ├── Title: "[Page] | VinaListen"
│   ├── Description: unique per page
│   ├── Open Graph: image, title, description
│   └── Twitter Card: summary_large_image
│
├── [ ] Structured data
│   ├── Home: WebSite + Organization
│   ├── Topics: ItemList + Course
│   ├── Lessons: Course + Article
│   └── Breadcrumbs: BreadcrumbList
│
├── [ ] Content
│   ├── /blog (Phase 2 — optional now)
│   └── /about, /contact pages
│
├── [ ] Performance SEO
│   ├── Core Web Vitals pass
│   ├── LCP < 2.5s
│   ├── FID < 100ms
│   └── CLS < 0.1
│
└── [ ] Analytics
    ├── Google Analytics 4 (basic)
    ├── Page views
    ├── Events: lesson_complete, signup, etc.
    └── Optional: Vercel Analytics

Deliverable: SEO-ready, discoverable, performant
```

### D.4 Soft Launch

```
Tasks:
├── [ ] Pre-launch checklist
│   ├── [ ] All MVP tasks completed
│   ├── [ ] No TypeScript errors
│   ├── [ ] No console errors
│   ├── [ ] Mobile tested
│   ├── [ ] SEO metadata done
│   ├── [ ] Analytics tracking
│   ├── [ ] Error monitoring (Sentry)
│   └── [ ] Performance > 90 Lighthouse
│
├── [ ] Launch announcement
│   ├── Post on personal social media
│   ├── Share in relevant communities
│   ├── Submit to Product Hunt (optional)
│   └── Collect emails for waitlist
│
├── [ ] Feedback collection
│   ├── In-app feedback button
│   ├── "Report bug" link
│   ├── NPS survey (periodic)
│   └── User interviews (if possible)
│
├── [ ] Monitoring
│   ├── Vercel Analytics (traffic)
│   ├── Supabase Dashboard (usage)
│   ├── Sentry (errors)
│   └── Uptime monitoring
│
└── [ ] Iteration plan
    ├── Week 1: Bug fixes, UX polish
    ├── Week 2: Retention optimizations
    └── Week 3: Feature additions

Deliverable: Live, tested, feedback-ready MVP
```

---

## TECHNICAL ARCHITECTURE

### Folder Structure

```
vinalisten/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx              # Landing page
│   │   └── layout.tsx
│   │
│   ├── (app)/
│   │   ├── layout.tsx            # App shell (header, nav)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Main dashboard
│   │   ├── topics/
│   │   │   ├── page.tsx          # Topics listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Topic detail
│   │   ├── listen/
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Lesson player
│   │   │       └── loading.tsx
│   │   ├── progress/
│   │   │   └── page.tsx          # Progress dashboard
│   │   ├── history/
│   │   │   └── page.tsx          # History listing
│   │   └── profile/
│   │       └── page.tsx          # User settings
│   │
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/route.ts     # OAuth callback
│   │
│   ├── api/
│   │   ├── auth/
│   │   ├── topics/
│   │   ├── lessons/
│   │   ├── progress/
│   │   ├── speech/
│   │   └── streak/
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   │
│   ├── audio/
│   │   ├── AudioPlayer.tsx
│   │   ├── AudioControls.tsx
│   │   └── Waveform.tsx
│   │
│   ├── lesson/
│   │   ├── TranscriptInput.tsx
│   │   ├── TranscriptResult.tsx
│   │   ├── ScoreDisplay.tsx
│   │   ├── ClipCard.tsx
│   │   └── LessonComplete.tsx
│   │
│   ├── speaking/
│   │   ├── VoiceRecorder.tsx
│   │   ├── SpeechResult.tsx
│   │   └── PronunciationScore.tsx
│   │
│   ├── streak/
│   │   ├── StreakCounter.tsx
│   │   ├── StreakCalendar.tsx
│   │   └── StreakBadge.tsx
│   │
│   ├── progress/
│   │   ├── ProgressChart.tsx
│   │   ├── TopicProgress.tsx
│   │   └── StatsCard.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── NavBar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   │
│   └── onboarding/
│       ├── OnboardingFlow.tsx
│       ├── GoalStep.tsx
│       └── TopicSuggest.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLessons.ts
│   │   ├── useProgress.ts
│   │   ├── useStreak.ts
│   │   └── useSpeechRecognition.ts
│   │
│   ├── utils/
│   │   ├── transcript-comparison.ts
│   │   ├── scoring.ts
│   │   ├── date.ts
│   │   └── cn.ts
│   │
│   └── constants/
│       ├── topics.ts
│       └── config.ts
│
├── types/
│   ├── database.ts               # Supabase generated types
│   ├── lesson.ts
│   ├── progress.ts
│   └── user.ts
│
├── styles/
│   └── animations.css
│
├── public/
│   ├── icons/
│   └── images/
│
├── scripts/
│   └── migrate-data.ts           # Crawler data → Supabase
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Key Technical Decisions

```
1. FRAMEWORK: Next.js 14 App Router
├── Server Components for data fetching
├── Client Components for interactivity
└── Streaming for faster perceived load

2. DATABASE: Supabase (Free tier)
├── PostgreSQL: structured data
├── Auth: built-in email + Google OAuth
├── Storage: audio files + recordings
├── Realtime: optional (for future)
└── Edge Functions: speech API fallback

3. STATE MANAGEMENT: React Context + Hooks
├── AuthContext: user state
├── LessonContext: current lesson state
├── StreakContext: streak state
└── No Redux needed for MVP

4. STYLING: Tailwind CSS v4
├── Utility-first, rapid development
├── CSS variables for theming
└── Dark mode support (optional)

5. ANIMATIONS: Framer Motion
├── Page transitions
├── Micro-interactions
├── Celebration animations
└── Respect prefers-reduced-motion

6. SPEECH: Web Speech API + Whisper fallback
├── Browser-native: free, no API key
├── Whisper (via Edge Function): Safari/iOS
└── Progressive enhancement

7. TESTING: Playwright
├── E2E: complete user flows
├── Mobile responsive testing
└── Accessibility audit
```

---

## TASK PRIORITIZATION (30-Day Sprint)

### Week 1: Foundation (Day 1-5)

| Task | Priority | Estimated |
|------|----------|-----------|
| A.1 Project Setup | P0 | 0.5 day |
| A.2 Database Schema | P0 | 0.5 day |
| A.3 Auth | P0 | 1 day |
| A.4 Data Ingestion | P0 | 1 day |
| B.1 Landing Page | P0 | 1 day |
| B.2 Onboarding | P1 | 1 day |

### Week 2: Core Loop (Day 6-12)

| Task | Priority | Estimated |
|------|----------|-----------|
| B.3 Topic/Lesson Selection | P0 | 1.5 days |
| B.4 Audio Player | P0 | 2 days |
| B.5 Transcript Typing | P0 | 1.5 days |
| B.6 Check & Score | P0 | 2 days |

### Week 3: Speaking + Integration (Day 13-20)

| Task | Priority | Estimated |
|------|----------|-----------|
| B.7 Voice Recording | P0 | 2 days |
| B.8 Speech Recognition | P0 | 2 days |
| B.9 Score Display | P0 | 1.5 days |
| B.10 History | P1 | 1.5 days |

### Week 4: Retention + Polish (Day 21-25)

| Task | Priority | Estimated |
|------|----------|-----------|
| C.1 Progress Dashboard | P1 | 1.5 days |
| C.2 Streak System | P0 | 1.5 days |
| C.3 Push Notifications | P1 | 1 day |
| D.1 Wow Moment | P0 | 1 day |

### Week 5: Launch (Day 26-30)

| Task | Priority | Estimated |
|------|----------|-----------|
| D.2 Mobile Optimization | P0 | 2 days |
| D.3 SEO Setup | P1 | 1 day |
| D.4 Soft Launch | P0 | 1 day |
| Buffer + Bug Fixes | P0 | 1 day |

---

## SCOPE CREEP PREVENTION

### IN SCOPE (MVP)

```
✅ Listening (audio player)
✅ Transcript typing
✅ Check + Score (accuracy)
✅ Voice recording
✅ Speech recognition
✅ Pronunciation scoring
✅ Basic history
✅ Progress dashboard
✅ Streak system
✅ Push notifications
✅ Landing page + Onboarding
✅ Topic/Lesson selection
✅ Mobile responsive
✅ SEO basics
```

### OUT OF SCOPE (Phase 2+)

```
❌ Reading module
❌ Writing practice
❌ Premium/Paid features
❌ AI Coach (advanced)
❌ Community/Forum
❌ Certificates
❌ Leaderboard (advanced)
❌ Offline mode
❌ Vocabulary flashcards (basic can add Phase 1)
❌ Spaced repetition
❌ Blog/Content pages
❌ Multi-language support
❌ Team/Classroom mode
❌ Export/Reports (PDF)
```

---

## SUCCESS METRICS

### Week 1

```
- [ ] Project deployed to Vercel
- [ ] 3 users signed up (internal testing)
- [ ] All data ingested to Supabase
- [ ] Landing page live
```

### Week 2

```
- [ ] 5 users completed first lesson
- [ ] Audio player working on mobile
- [ ] Transcript comparison accurate
- [ ] No critical bugs
```

### Week 3

```
- [ ] 10 users completed first lesson
- [ ] Speaking loop working (record → transcribe → score)
- [ ] History page functional
- [ ] Basic analytics tracking
```

### Week 4

```
- [ ] 20 users registered
- [ ] Day 7 retention > 20%
- [ ] Streak system active
- [ ] 5+ users with streak > 3
```

### Week 5 (Soft Launch)

```
- [ ] 50 users registered
- [ ] Day 7 retention > 25%
- [ ] Lighthouse Performance > 90
- [ ] Mobile UX validated
- [ ] First user testimonials
```

---

## RISK MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Audio không load được | Medium | High | Fallback URLs, retry logic |
| Speech recognition fails | High | Medium | Whisper fallback, graceful error |
| Mobile UX issues | High | High | Test early, iterate fast |
| Retention low | Medium | High | Add streak + push ASAP |
| Scope creep | High | Medium | Strict out-of-scope list |
| Supabase limits | Low | Medium | Monitor usage, plan upgrade |

---

## NEXT STEPS (After MVP)

```
1. VALIDATE MVP (Month 2)
├── Analyze retention data
├── Collect user feedback
├── Fix critical issues
└── Optimize onboarding

2. GROWTH (Month 2-3)
├── SEO content
├── Referral system
├── Social sharing
└── Content expansion (new topics)

3. PHASE 2 FEATURES (Month 3-6)
├── Vocabulary flashcards
├── Spaced repetition
├── Reading module
├── Leaderboard
├── Achievements
└── Premium features

4. MONETIZATION (Month 6+)
├── Open paid features
├── Speaking + AI pronunciation
├── Offline mode
└── Personalized plans
```
