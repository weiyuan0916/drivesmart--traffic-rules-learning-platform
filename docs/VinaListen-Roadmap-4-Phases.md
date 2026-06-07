# VinaListen — Roadmap 4 Phase
## Cho Founder Một Mình

**Phiên bản:** 1.0  
**Ngày:** 2026-06-07  
**Based on:** PRD VinaListen v1.0 + Review  
**Assumption:** 1 founder, part-time (20-30h/tuần)

---

## Tổng quan Timeline

```
Week  0:  ⚖️ Legal + Backup Content
Week  1-2: 🏗️ Phase 0: Infrastructure
Week  3-8:  🎯 Phase 1: Core MVP (6 tuần)
Week  9-13: 🎮 Phase 2: Engagement (5 tuần)
Week 14-19: 📈 Phase 3: Growth (6 tuần)
Week 20-25: 🤖 Phase 4: AI + Scale (6 tuần)
─────────────────────────────────────────
Total: ~25 tuần (khoảng 6 tháng)
```

> **Note:** Với 1 người và part-time, mỗi phase có thể cần thêm 1-2 tuần buffer. Estimate tổng: **6-7 tháng** cho MVP hoàn chỉnh.

---

## WEEK 0: LEGAL + CONTENT BACKUP

*(Chạy song song với suy nghĩ về concept — không cần code)*

### Mục tiêu
- Legal clearance cho nội dung
- Backup content sources nếu DailyDictation không cho phép sử dụng

### Actions

```
☐ Check DailyDictation ToS — có cấm crawl/usage không?
☐ Email联系 DailyDictation founder — hỏi về licensing
   └── Email mẫu: "Tôi đang xây dựng app học tiếng Anh cho người 
       Việt. Tôi đã crawl nội dung từ trang của bạn. Tôi muốn hỏi 
       về licensing..."
☐ Nếu đồng ý → có written agreement (email confirmation đủ cho MVP)
☐ Nếu không đồng ý → chuyển sang backup sources:
   └── BBC Learning English (hoàn toàn miễn phí)
   └── Voice of America Learning English
   └── 6 Minute English (BBC) — transcript miễn phí
```

### Điều kiện hoàn thành Week 0
- [ ] Có written permission từ DailyDictation HOẶC
- [ ] Đã identify 2+ backup content sources
- [ ] Không launch nếu chưa có legal clearance

---

## PHASE 0: Infrastructure
### Tuần 1-2 | Mục tiêu: Sẵn sàng bắt đầu build

#### Mục tiêu

| Goal | Chi tiết |
|---|---|
| Dev environment hoàn chỉnh | Next.js + TypeScript + TailwindCSS + Supabase |
| Database schema deployed | Topics, Sections, Lessons, Users, Progress |
| CI/CD chạy tự động | Mỗi push → auto-deploy lên Vercel |
| Design system bắt đầu | Colors, typography, spacing tokens |
| Data imported | 50+ lessons có audio + transcript |

#### Chức năng

*(Không có user-facing features trong phase này — chỉ backend infrastructure)*

```
Backend:
├── Supabase project setup
├── Database: Topics, Sections, Lessons tables
├── Database: Users, UserProgress tables
├── Auth: Supabase Auth (email + Google)
├── Storage: Upload audio files lên Supabase Storage
├── API Routes: CRUD cho lessons, progress
└── Seed data: Import 50 lessons từ crawl

Frontend:
├── Next.js project với App Router
├── TailwindCSS configuration với design tokens
├── Component folder structure
├── Framer Motion setup
├── Lucide React icons
├── Responsive layout system (mobile-first)
└── CI/CD: Vercel auto-deploy
```

#### KPIs (Tuần 2)

| Metric | Baseline | Target |
|---|---|---|
| Database rows imported | 0 | 50 lessons |
| CI/CD pipeline | Chưa có | Passing 100% |
| Build time | N/A | < 3 phút |
| Lighthouse Performance | N/A | > 80 (trước khi add features) |

#### Điều kiện hoàn thành

- [ ] User có thể sign up + login
- [ ] 50 lessons hiển thị với audio playback
- [ ] Vercel deploy tự động từ GitHub
- [ ] Không có TypeScript errors
- [ ] Lighthouse Performance > 80

---

## PHASE 1: Core MVP
### Tuần 3-8 | Mục tiêu: Chứng minh giá trị core

**Rationale:** 6 tuần — nhiều nhất trong roadmap. Đây là nền tảng. Fix sai ở đây = fix ở mọi nơi.

#### Mục tiêu

| Goal | Chi tiết |
|---|---|
| User hoàn thành bài dictation đầu tiên | Từ landing → lesson → result trong < 5 phút |
| Onboarding tạo "wow moment" | User thấy giá trị ngay sau bài 1 |
| Core loop hoàn chỉnh | Listen → Type → Check → AI Feedback → Next |
| Mobile-first confirmed | Mọi interaction hoạt động trên iPhone SE |
| First paying signal | User thấy value và muốn trả tiền (chưa có payment, chỉ signal) |

#### Chức năng

```
Page 1: Landing + Auth
├── Hero: "Luyện nghe mỗi ngày. Không cần gia sư."
├── "Bắt đầu ngay" → Skip signup → Dashboard
├── "Đăng ký" → Email/Google/Apple
└── Social proof: "500+ người đang học"

Page 2: Onboarding (4 steps)
├── Bước 1: Level check — "Bạn nghe tiếng Anh giỏi đến đâu?"
│   └── 3 options: Mới bắt đầu / Trung bình / Khá giỏi
│   └── → Gợi ý topic phù hợp
├── Bước 2: Quick tutorial (30 giây)
│   └── Mini audio + dictation exercise
│   └── Progress bar: "Bài 1/3"
├── Bước 3: Completion celebration
│   └── 🎉 "Bạn đã sẵn sàng!"
│   └── Accuracy: 78%
│   └── 🔥 Streak: 1 ngày bắt đầu
│   └── "Top 30% trên bảng xếp hạng"
└── Bước 4: Dashboard

Page 3: Dashboard (Overview)
├── Hero card: "Hôm nay bạn có 10 phút?"
│   └── → Gợi ý bài phù hợp thời gian
├── Continue Learning card (nếu có bài đang dở)
├── Today's Goal: 1 bài/ngày (Week 1)
├── Recommended Topics (dựa trên level)
├── Popular Topics
├── Stats: Tổng bài | Streak | Accuracy TB
└── Navigation: Topics | Progress | Settings

Page 4: Topics Browser
├── Search bar (realtime filter)
├── Filter tabs: All | Beginner | Intermediate | Advanced
├── Topic cards:
│   ├── Thumbnail
│   ├── Name + Description
│   ├── Total lessons
│   ├── Estimated time
│   └── Difficulty badge
└── Empty state: "Không tìm thấy topic nào"

Page 5: Lesson List (Section)
├── Topic header
├── Section list
├── Lesson cards:
│   ├── Lesson name
│   ├── Duration
│   ├── Completion status (completed/attempted/new)
│   └── Accuracy badge (nếu đã làm)
└── Back navigation

Page 6: Listening Practice (Core Loop)
├── Audio Player (sticky top)
│   ├── ▶️ Play/Pause (Space shortcut)
│   ├── 🔄 Replay (R shortcut)
│   ├── ⏩ Skip 5s / ⏪ Rewind 5s
│   ├── Speed: 0.5x | 0.75x | 1x | 1.25x | 1.5x
│   ├── Waveform visualization
│   ├── Progress bar với timestamps
│   └── Mini mode: collapsible để focus input
│
├── Transcript Input (main area)
│   ├── Textarea — auto-resize
│   ├── Auto-save (localStorage + Supabase) mỗi 3s
│   ├── Word count indicator
│   ├── Placeholder: "Nhập những gì bạn nghe được..."
│   ├── [Check & Submit] button (44px height, disabled if empty)
│   └── Keyboard shortcut hint: "Ctrl+Enter để submit"
│
├── Result Panel (sau khi submit)
│   ├── Side-by-side comparison:
│   │   ├── Your answer
│   │   └── Correct transcript
│   ├── Color coding:
│   │   ├── ✅ Green — đúng
│   │   ├── ❌ Red — sai
│   │   ├── 📝 Underline — thiếu
│   │   └── 🟠 Orange — thừa
│   ├── Stats bar: Accuracy% | ✅ X | ❌ X | 📝 X
│   ├── AI Feedback panel (Gemini API)
│   │   └── "Bạn thường bỏ sót mạo từ..."
│   └── Action buttons:
│       ├── 🔄 Retry (làm lại bài này)
│       ├── ➡️ Next Lesson
│       ├── 📝 Review Mistakes
│       └── 💾 Bookmark

Page 7: Progress Dashboard
├── Stats overview (4 cards)
│   ├── Tổng bài đã hoàn thành
│   ├── Tổng giờ luyện tập
│   ├── Accuracy trung bình
│   └── 🔥 Streak hiện tại
├── Weekly progress chart (bar chart — Mon-Sun)
├── Best streak record
├── Accuracy trend (optional — Phase 2)
└── Recent lessons list

Settings:
├── Profile (name, avatar)
├── Notifications (toggle email reminders)
├── Dark mode toggle
├── Language (VI / EN)
└── Account (change password, delete account)
```

#### Micro-interactions cần implement

| Feature | Chi tiết |
|---|---|
| Auto-save | localStorage mỗi 3s + Supabase khi online |
| Keyboard shortcuts | Space = Play/Pause, R = Replay, Ctrl+Enter = Submit |
| Loading states | Skeleton loaders cho topic cards, audio player |
| Error states | Audio fail → Retry + Skip option; Network fail → Offline mode |
| Empty states | Tất cả pages có empty state illustration |
| Transitions | Page transitions: fade 200ms; Result: slide up 300ms |

#### KPIs (Tuần 8)

| Metric | Target | Đo lường |
|---|---|---|
| **Activation rate** | > 60% | User đăng ký → hoàn thành bài đầu tiên |
| **Time to first lesson** | < 3 phút | Từ landing → start lesson |
| **Completion rate** | > 70% | User bắt đầu lesson → submit transcript |
| **7-day retention** | > 25% | User quay lại sau 7 ngày |
| **NPS** | > 40 | "Bạn sẽ giới thiệu VinaListen cho bạn bè?" (0-10) |
| **Audio start time** | < 1.5s | First byte → audio playing |
| **AI feedback time** | < 5s | Submit → feedback hiển thị |
| **Bug rate** | < 1% | Crash/error rate trên production |

#### Điều kiện hoàn thành Phase 1

- [ ] 100+ users đăng ký
- [ ] Activation rate > 60%
- [ ] 7-day retention > 25%
- [ ] Không có crash trên production
- [ ] Lighthouse Performance > 85
- [ ] Lighthouse Accessibility > 90
- [ ] Tất cả empty states và error states có UI
- [ ] Auto-save hoạt động (reload không mất data)
- [ ] Mobile tested trên iPhone SE, Samsung Galaxy S, iPad

---

## PHASE 2: Engagement
### Tuần 9-13 | Mục tiêu: Biến user thành habitual user

**Rationale:** 5 tuần. Core loop đã work → giờ thêm hooks để giữ user quay lại mỗi ngày.

#### Mục tiêu

| Goal | Chi tiết |
|---|---|
| Streak system hoạt động | User có lý do quay lại mỗi ngày |
| Daily habit loop hoàn chỉnh | Goal → Practice → Reward → Reminder |
| Social proof bắt đầu | User thấy mình không cô đơn |
| Vocabulary thêm value | User học từ mới, thấy "được nhiều thứ" |
| DAU/MAU tăng | Từ baseline → 15%+ |

#### Chức năng

```
📱 Push Notifications + Email Reminders
├── Streak reminder: 11pm (1 giờ trước midnight)
│   └── "Streak 7 ngày của bạn sẽ reset trong 1 giờ!"
├── Daily reminder: 8am hoặc 9pm (user chọn)
│   └── "Luyện nghe 5 phút hôm nay chưa?"
├── Comeback reminder: Day 3 sau last login
│   └── "Bạn đang giữ streak 5 ngày. Quay lại ngay!"
└── Achievement unlocked: Immediately
    └── "🎉 Bạn đạt Perfect Score đầu tiên!"

🔥 Streak System
├── Daily goal = 1 bài/ngày (Week 1-7 streak)
├── Streak counter trên dashboard
├── Streak visualization:
│   ├── 🔥🔥🔥🔥🔥🔥🔥 = Active streak
│   ├── 🔥💤 = Streak freeze active
│   └── 💀 = Streak died
├── Streak freeze:
│   ├── Free: 1 freeze/tuần (reset Monday)
│   └── Premium: 3 freezes/tuần + streak repair
├── Streak milestones:
│   ├── 7 ngày: "🔥 1 tuần! Bạn đang tạo thói quen!"
│   ├── 30 ngày: "🔥🔥 1 tháng! Bạn là người kiên trì!"
│   └── 100 ngày: "🔥🔥🔥 100 ngày! Legendary!"
└── Streak loss notification:
    └── "😢 Streak của bạn đã reset. Bắt đầu lại từ hôm nay!"

📊 Leaderboard
├── Top Accuracy (weekly)
├── Top Streak (all-time)
├── Top Lessons Completed (weekly)
├── Rank display: "Top 15% today"
├── My rank card
├── Anonymous users (không thấy ai là ai)
└── Badges cho top performers

📚 Vocabulary System
├── Sau mỗi lesson:
│   ├── Vocabulary panel (3-5 từ từ lesson)
│   ├── Pronunciation (audio)
│   ├── Vietnamese translation
│   ├── Example sentence
│   └── [Học từ này] → mark as learned
│
├── Flashcard Review:
│   ├── Spaced repetition (SM-2 algorithm)
│   ├── 5 từ/ngày (daily review)
│   ├── Swipe: Right = know, Left = still learning
│   └── Streak integration: complete review = keep streak
│
├── Vocabulary Notebook:
│   ├── Tất cả từ đã học
│   ├── Search functionality
│   ├── Filter: đã học / đang ôn / chưa học
│   ├── Sort: alphabetical, by lesson, by date
│   └── Export: copy as text list
│
└── Vocabulary SEO pages:
    └── /vocabulary/[word] — individual word pages

🔖 Bookmarks + History
├── Bookmark lesson
├── Bookmark specific sentences (highlight text)
├── Bookmark panel:
│   ├── Saved lessons
│   ├── Saved sentences
│   └── [Retry all bookmarked]
├── History:
│   ├── Date | Topic | Lesson | Score | Time
│   ├── Filter by topic
│   ├── Filter by date range
│   ├── Filter by accuracy
│   └── Click → xem lại lesson + mistakes
└── Review Mistakes flow:
    └── Xem lại bài cũ → hiện transcript đúng → so sánh

🎯 Daily Goal System
├── Adaptive goal:
│   ├── Day 1-7: 1 bài/ngày
│   ├── Day 8-30: 2 bài/ngày
│   └── Day 31+: 3 bài/ngày
├── Goal UI:
│   ├── Progress bar on dashboard
│   ├── Notification: "Còn 1 bài nữa để hoàn thành mục tiêu!"
│   └── Celebration: "🎉 Mục tiêu hôm nay: ✅ Hoàn thành!"
├── Flexible goal option:
│   ├── Quick: 1 bài (< 5 phút)
│   ├── Normal: 2 bài (10-15 phút)
│   └── Deep: 3 bài (20-30 phút)
└── Goal completion = streak maintained

⚙️ Onboarding Polish
├── Quick tutorial 30 giây (có thể skip)
├── Interactive guide: nhấn vào từng element để giải thích
├── Progress: "Bạn đang ở bước 2/3"
├── Skip option rõ ràng
└── "Tôi đã biết cách sử dụng" → skip to dashboard
```

#### Gamification Layer (Basic)

| Achievement | Điều kiện | Icon |
|---|---|---|
| First Dictation | Hoàn thành bài đầu tiên | 🎯 |
| 7-Day Streak | Giữ streak 7 ngày | 🔥 |
| Bookworm | Hoàn thành 10 bài | 📖 |
| Perfect Score | 100% accuracy | 🎓 |
| Speed Demon | Complete 1 bài trong < 3 phút | ⚡ |
| Night Owl | Practice sau 10pm | 🦉 |
| Early Bird | Practice trước 7am | 🐦 |
| Global Citizen | Học 3 topics khác nhau | 🌍 |

#### KPIs (Tuần 13)

| Metric | Baseline (Week 8) | Target (Week 13) |
|---|---|---|
| **DAU/MAU ratio** | 10% | 15%+ |
| **7-day retention** | 25% | 30%+ |
| **Avg lessons/user/week** | 5 | 10+ |
| **Streak rate (7-day)** | N/A | 25%+ |
| **Vocabulary cards reviewed** | 0 | 500+ cards/week |
| **Bookmark usage** | N/A | > 30% users bookmark |
| **Leaderboard engagement** | N/A | > 20% users check weekly |

#### Điều kiện hoàn thành Phase 2

- [ ] 7-day retention > 30%
- [ ] > 25% users có streak >= 7 days
- [ ] Vocabulary review: > 500 cards/week across all users
- [ ] Leaderboard: > 20% active users kiểm tra weekly
- [ ] Email/push reminders: > 40% open rate
- [ ] Bookmark feature: > 30% users sử dụng
- [ ] No new critical bugs introduced
- [ ] Lighthouse Performance > 88

---

## PHASE 3: Growth
### Tuần 14-19 | Mục tiêu: Tăng trưởng user + chuẩn bị monetization

**Rationale:** 6 tuần. User đã có habit → giờ mở rộng reach + bắt đầu thu tiền.

#### Mục tiêu

| Goal | Chi tiết |
|---|---|
| Tăng trưởng organic | SEO + content + referral |
| First revenue | Lifetime deal launch + first paying users |
| Freemium model deployed | Giới hạn AI feedback, content free |
| Viral loop bắt đầu | Share result → bring new users |
| 500+ MAU | Từ baseline → 500 |

#### Chức năng

```
🌐 SEO + Landing Page
├── Landing page cho non-users:
│   ├── Hero: Value proposition rõ ràng
│   ├── How it works (3 steps)
│   ├── Social proof: testimonials, stats
│   ├── Topic preview
│   ├── Pricing teaser
│   └── CTA: "Bắt đầu miễn phí"
│
├── SEO Optimization:
│   ├── Metadata cho tất cả topic pages
│   ├── Metadata cho tất cả lesson pages
│   ├── Vocabulary pages: /vocabulary/[word]
│   ├── Structured data: FAQ, Course, Article
│   ├── Open Graph + Twitter Card
│   └── Sitemap tự động (/sitemap.xml)
│
└── Blog/Content:
    └── Tips học nghe tiếng Anh (2 bài/tuần)

💰 Freemium Model v2 (CORRECTED)
├── Free tier:
│   ├── ✅ Unlimited bài học (không giới hạn content)
│   ├── ✅ Audio player đầy đủ
│   ├── ✅ Scoring engine
│   ├── ✅ Progress dashboard
│   ├── ✅ Bookmarks + History
│   ├── ✅ Vocabulary flashcards
│   ├── ✅ Streak system
│   ├── ✅ Leaderboard
│   └── ⚠️ 3 AI feedback/ngày (limit vì AI = chi phí cao)
│
├── Premium ($49,000 VND/tháng ≈ $2):
│   ├── ✅ Unlimited AI feedback
│   ├── ✅ Audio speed 0.5x - 2x
│   ├── ✅ Speaking practice (Phase 4)
│   ├── ✅ Certificates
│   ├── ✅ Priority support
│   └── ✅ Priority AI queue
│
├── Lifetime Deal (Early Bird):
│   └── ✅ $490,000 VND (~$19.99) — 1 lần, trọn đời
│
└── Vietnam-native pricing:
    └── Hiển thị VND, không phải USD conversion

🔗 Referral System
├── Invite 1 friend → Both get 1 week premium free
├── Friend completes 3 lessons → Inviter gets 1 month premium
├── Referral link + code
├── Referral dashboard: xem ai đã invite, ai đã convert
├── Email invite: "Bạn được mời học tiếng Anh miễn phí"
└── Social share: "I just scored 95% on VinaListen!"

📤 Social Sharing
├── Share result screenshot (after lesson):
│   ├── Accuracy + streak
│   ├── Topic name
│   ├── "Bạn có thể làm tốt hơn không?"
│   └── VinaListen branding + referral link
├── Share achievement:
│   └── "Tôi vừa đạt 100% accuracy! Thử sức?"
├── Shareable badge cards:
│   └── Tạo image đẹp để share lên Facebook/Instagram
└── Share button: Copy link, Facebook, Twitter, Zalo

🛒 Payment Infrastructure
├── Stripe integration:
│   ├── Checkout sessions
│   ├── Customer portal (manage subscription)
│   ├── Webhook handlers (payment success, failure, churn)
│   └── Invoice generation
├── Payment methods:
│   ├── International: Visa, Mastercard
│   └── Vietnam: MoMo, VNPay (nếu Stripe hỗ trợ)
├── Pricing display:
│   ├── 49,000 VND/tháng
│   ├── 490,000 VND/năm (tiết kiệm 17%)
│   ├── 990,000 VND/lifetime (Early Bird — giới hạn thời gian)
│   └── Student discount: 50% (email .edu verification)
├── Refund policy: 7-day money-back guarantee
├── Tax/VAT: FPT Invoice cho enterprise users
└── Revenue dashboard: MRR, churn rate, LTV

⚠️ Upgrade Nudges (UX)
├── Khi hết AI feedback (free):
│   └── Modal: "Bạn đã dùng 3/3 AI feedback hôm nay"
│   └── "Mỗi bài học đều có AI feedback cá nhân hóa"
│   └── [Upgrade — 49k/tháng] [Dùng tiếp (không AI)]
├── Exit intent:
│   └── Khi user chuẩn bị leave → show upgrade offer
├── Freemium banner:
│   └── Nhẹ nhàng ở dashboard: "Upgrade để không giới hạn AI"
```

#### KPIs (Tuần 19)

| Metric | Baseline (Week 13) | Target (Week 19) |
|---|---|---|
| **MAU** | 100 | 500+ |
| **Organic traffic (SEO)** | 0 | 200+ visitors/tháng |
| **Topic pages indexed** | 0 | 100% topics indexed |
| **First paying users** | 0 | 5+ |
| **Referral conversion** | N/A | > 5% invite → sign up |
| **Free → Paid signal** | N/A | > 10% users hit AI limit |
| **Churn rate** | N/A | < 5%/tháng |

#### Điều kiện hoàn thành Phase 3

- [ ] 500+ MAU
- [ ] 5+ paying users (lifetime deal hoặc monthly)
- [ ] Revenue: $100+ total
- [ ] SEO: > 50 topic pages indexed on Google
- [ ] Referral: > 5% conversion rate
- [ ] Freemium model deployed và hoạt động
- [ ] Payment infrastructure: Stripe checkout hoàn chỉnh
- [ ] Churn rate < 5%/tháng

---

## PHASE 4: AI + Scale
### Tuần 20-25 | Mục tiêu: Deep AI features + sustainable revenue

**Rationale:** 6 tuần. Đã có revenue signal → giờ build AI speaking + scale.

#### Mục tiêu

| Goal | Chi tiết |
|---|---|
| Speaking practice hoạt động | Record → AI feedback → improve |
| AI pronunciation scoring | So sánh user's speech với native |
| Revenue sustainable | $500+/tháng |
| 50+ paying users | Từ 5 → 50 |
| Content expansion | Thêm IELTS, TOEIC, Business English |

#### Chức năng

```
🎤 Speaking Practice
├── Record audio:
│   ├── Microphone permission request (friendly UI)
│   ├── Record button (44px, easy to tap)
│   ├── Recording indicator (red dot + waveform)
│   ├── Timer display
│   ├── Max duration: 60 giây
│   └── Stop + Preview playback
│
├── AI Pronunciation Feedback:
│   ├── Phân tích từng từ
│   ├── So sánh với transcript chuẩn
│   ├── Pronunciation score per word (0-100)
│   ├── Common mistakes highlighting:
│   │   ├── "/θ/" vs "/s/" (think vs sink)
│   │   ├── "/ð/" vs "/d/" (this vs dis)
│   │   ├── Vowel length
│   │   └── Word stress
│   └── "Bạn phát âm 'weather' gần đúng. 
│       Chú ý '/ð/' như trong 'the'"
│
└── Speaking lesson flow:
    ├── Listen to audio (native speaker)
    ├── Read transcript
    ├── Record yourself reading
    ├── AI compare + feedback
    └── Retry or Next

🤖 Smart Analysis (AI-powered)
├── Pattern recognition:
│   ├── Track lỗi theo thời gian
│   ├── "Bạn thường bỏ sót '-ing' ở cuối verb"
│   ├── "Bạn hay nhầm 'b' và 'v' trong tiếng Anh"
│   └── Visual: pie chart các loại lỗi
│
├── Personalized Practice Plan:
│   ├── Gợi ý bài dựa trên lỗi pattern
│   │   ├── Nếu yếu linking sounds → bài về connected speech
│   │   ├── Nếu yếu vocabulary → bài về topic đó
│   │   └── Nếu yếu grammar → bài focus vào structure
│   ├── Difficulty auto-adjustment
│   └── Weekly recommendation email
│
└── AI Tutor (chat-based):
    ├── "Tôi không hiểu từ này" → giải thích
    ├── "Đặt câu với từ này" → ví dụ
    └── Grammar clarification

📜 Certificates
├── Topic completion certificate:
│   ├── Topic name
│   ├── Completion date
│   ├── Accuracy average
│   ├── Student name (optional)
│   └── Download as PDF
│
├── Certificate templates:
│   ├── Basic (free): Digital badge
│   └── Premium (paid): PDF certificate
│
└── Share:
    ├── LinkedIn share button
    └── Download PDF

📚 Content Expansion
├── IELTS Listening:
│   ├── Part 1: Conversations
│   ├── Part 2: Monologues
│   ├── Part 3: Discussions
│   └── Part 4: Lectures
│
├── TOEIC Listening:
│   ├── Part 1: Photos
│   ├── Part 2: Question-Response
│   ├── Part 3: Short Conversations
│   └── Part 4: Short Talks
│
├── Business English:
│   ├── Meetings
│   ├── Presentations
│   ├── Emails
│   └── Phone calls
│
└── Content pipeline:
    └── Crawl thêm nguồn (VOA, BBC) + manual upload

🏆 Advanced Gamification
├── XP System:
│   ├── Correct word: +1 XP
│   ├── Perfect accuracy: +10 XP bonus
│   ├── Complete streak bonus: +5 XP/ngày
│   ├── Complete topic: +50 XP
│   └── Review vocabulary: +2 XP
│
├── Levels:
│   ├── Level 1-10: Beginner
│   ├── Level 11-25: Intermediate
│   ├── Level 26-50: Advanced
│   └── Level 51+: Expert
│
├── Challenges:
│   ├── Daily challenge: "Hoàn thành 3 bài hôm nay"
│   ├── Weekly challenge: "Đạt 90% accuracy 5 lần"
│   └── Monthly challenge: "Hoàn thành 1 topic"
│
└── Leaderboard upgrades:
    ├── Weekly leaderboard (reset Monday)
    ├── All-time leaderboard
    └── Friends leaderboard (opt-in)
```

#### KPIs (Tuần 25)

| Metric | Baseline (Week 19) | Target (Week 25) |
|---|---|---|
| **MAU** | 500 | 1,000+ |
| **Paying users** | 5 | 50+ |
| **MRR (Monthly Recurring Revenue)** | $0 | $500+/tháng |
| **Speaking practice sessions** | 0 | 100+/tuần |
| **AI pronunciation feedback** | 0 | 500+/tuần |
| **Content: Total lessons** | 50 | 200+ |
| **Content: Topics** | 5 | 15+ |
| **Certificate downloads** | 0 | 50+/tuần |
| **NPS** | 40 | 50+ |

#### Điều kiện hoàn thành Phase 4

- [ ] MRR >= $500/tháng
- [ ] 50+ paying users
- [ ] Speaking practice: > 100 sessions/week
- [ ] AI pronunciation: > 500 feedback/week
- [ ] 200+ lessons across 15+ topics
- [ ] NPS >= 50
- [ ] No critical bugs in AI features
- [ ] Lighthouse Performance > 90

---

## TỔNG HỢP: 4 Phases

### Timeline Overview

```
Week  0: Legal + Content Backup
─────────────────────────────────────────
Week  1-2: PHASE 0: Infrastructure
         Output: Dev environment, 50 lessons, CI/CD
─────────────────────────────────────────
Week  3-8:  PHASE 1: Core MVP
         Output: Complete dictation flow, 100 users, 60% activation
─────────────────────────────────────────
Week  9-13: PHASE 2: Engagement
         Output: Streak + Vocab + Leaderboard, 30% retention
─────────────────────────────────────────
Week 14-19: PHASE 3: Growth
         Output: SEO + Freemium + Payment, 500 MAU, first revenue
─────────────────────────────────────────
Week 20-25: PHASE 4: AI + Scale
         Output: Speaking + AI Pronunciation, $500 MRR, 50 paying
─────────────────────────────────────────
Total: 25 weeks (~6 months)
```

### KPIs Tổng Hợp

| Metric | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---|---|---|---|---|
| **MAU** | 100 | 200 | 500 | 1,000 |
| **Paying users** | 0 | 0 | 5 | 50 |
| **MRR** | $0 | $0 | $100 | $500 |
| **7-day retention** | 25% | 30% | 35% | 35% |
| **DAU/MAU** | 10% | 15% | 20% | 25% |
| **Lessons/week/user** | 5 | 10 | 12 | 15 |
| **Streak rate** | N/A | 25% | 30% | 35% |
| **NPS** | 40 | 45 | 50 | 55 |

### Risk-Adjusted Timeline

> Với 1 founder part-time, mỗi phase có thể cần thêm 1-3 tuần buffer.

| Phase | Optimistic | Realistic | Conservative |
|---|---|---|---|
| Week 0 | 0 tuần | 0 tuần | 1 tuần |
| Phase 0 | 2 tuần | 2 tuần | 3 tuần |
| Phase 1 | 5 tuần | 6 tuần | 8 tuần |
| Phase 2 | 4 tuần | 5 tuần | 7 tuần |
| Phase 3 | 5 tuần | 6 tuần | 8 tuần |
| Phase 4 | 5 tuần | 6 tuần | 8 tuần |
| **Total** | **17 tuần** | **25 tuần** | **35 tuần** |

**Recommendation:** Dùng timeline conservative. 7-8 tháng cho MVP hoàn chỉnh với 1 người.

### Pivot Conditions

| Nếu... | Thì... |
|---|---|
| Phase 1: Activation < 30% sau Week 8 | Rethink onboarding + core flow |
| Phase 1: Retention < 15% sau Week 8 | Dừng Phase 2, tập trung retention first |
| Phase 2: Streak rate < 15% sau Week 13 | Rethink streak system + reminders |
| Phase 3: MAU < 200 sau Week 19 | Rethink positioning + marketing |
| Phase 3: Revenue = $0 sau Week 19 | Rethink freemium model + pricing |
| Phase 4: MRR < $200 sau Week 25 | Pivot hoàn toàn — product-market fit chưa đạt |

### Success Conditions

**Minimum Viable Success (sau 8 tháng):**
- [ ] 500+ MAU
- [ ] 50+ paying users
- [ ] $500+ MRR
- [ ] 30%+ retention
- [ ] NPS > 40

**Stretch Goal:**
- [ ] 2,000+ MAU
- [ ] 200+ paying users
- [ ] $2,000+ MRR
- [ ] Viral coefficient > 0.5
- [ ] Raise seed round hoặc sustainable solo income

---

## APPENDIX: Phase Comparison — Before vs After Review

| Original PRD | Revised Roadmap | Lý do thay đổi |
|---|---|---|
| Phase 1-5 (24 tuần) | Phase 0-4 (25 tuần) | Thêm Week 0 cho Legal |
| "5 bài/ngày" limit | **Unlimited bài, giới hạn AI** | AI = chi phí cao, content = gần free |
| AI feedback Phase 1 | AI feedback Phase 1 | Giữ nguyên — AI là differentiator |
| SEO Phase 3 | SEO Phase 3, nhưng metadata từ Phase 0 | SEO pages có thể build sớm |
| Vocabulary Phase 2 | Vocabulary Phase 2 | Giữ nguyên |
| Speaking Phase 4 | Speaking Phase 4 | Giữ nguyên |
| $5-7 USD/tháng | 49,000 VND/tháng ($2) | Phù hợp thị trường Việt Nam |
| Lifetime: $49 | Lifetime: 490,000 VND ($20) | Anchor price cho Vietnam market |
| Streak Phase 2 | Streak Phase 2 | Giữ nguyên |
| Onboarding Phase 2 | **Onboarding Phase 1** | Critical fix từ review |
| Mobile UX Phase 1 | Mobile UX Phase 1 (embedded) | Critical fix từ review |
| Payment Phase 5 | Payment Phase 3 | Revenue cần sớm hơn |
