# PRD Review — VinaListen v1.0

**Reviewer:** Senior PM + UX Researcher + QA Engineer  
**Date:** 2026-06-07  
**Document Reviewed:** PRD-VinaListen-v1.0.md

---

## EXECUTIVE SUMMARY

PRD VinaListen v1.0 có nền tảng tốt: vision rõ ràng, MoSCoW prioritization hợp lý, competitor research đầy đủ. Tuy nhiên, có **4 lỗ hổng nghiêm trọng** cần fix trước khi bắt đầu build:

1. **Onboarding hoàn toàn trống** — 40% churn xảy ra ở bước này
2. **Dictation flow thiếu micro-interactions và edge cases** — sẽ gây confusion
3. ** Freemium model có logic ngược** — AI là chi phí cao nhất nhưng lại free, content là chi phí thấp nhất lại bị giới hạn
4. **Thiếu push notification + offline mode** — hai yếu tố retention quan trọng nhất trên mobile

---

## PHẦN 1: TÍNH NĂNG THIẾU

### 1.1 CRITICAL — Onboarding Flow (Hoàn toàn trống)

**Vấn đề:** PRD đề cập "Skip signup" và "1-click signup" nhưng không có chi tiết về onboarding. Không có bước nào mô tả:

- User đăng ký xong → thấy gì?
- Có level assessment không? (Beginner/Intermediate/Advanced)
- Có recommended path không?
- Có quick tutorial 30 giây không?

**Tác động:** 40% user rời bỏ ở bước này (competitor research). Person C (Anh, tech savvy thấp) đặc biệt dễ drop-off nếu không có guided onboarding.

**Đề xuất — Thêm Section 5.2 (Onboarding Flow):**

```
Bước 1: Landing Page
├── Nút "Bắt đầu ngay" → Skip signup → Practice immediately
├── Nút "Đăng ký" → Email/Google/Apple
└── Hook: "Luyện nghe 5 phút/ngày — hoàn toàn miễn phí"

Bước 2: Level Assessment (30 giây)
├── "Bạn nghe tiếng Anh giỏi đến đâu?"
├── 3 options: Mới bắt đầu / Trung bình / Khá giỏi
└── Recommendation: Gợi ý topic phù hợp

Bước 3: First Lesson (Guided)
├── Audio auto-play với subtitle ẩn
├── Hướng dẫn: "Nhập những gì bạn nghe được"
├── Progress bar: "Bài 1/3"
└── Completion: Hiện "🎉 Wow moment" + streak bắt đầu

Bước 4: Dashboard
├── Today's goal: "Hoàn thành 1 bài để giữ streak"
├── Recommended: Topic phù hợp level
└── Stats: 0 bài | 0 ngày streak
```

**Đặc biệt cho Person C (Anh):**
- Font size mặc định lớn hơn
- Button size tối thiểu 48px
- Tooltip giải thích mỗi feature khi hover
- Progress bar thay vì số

---

### 1.2 CRITICAL — Micro-interactions thiếu trong Dictation Flow

**Vấn đề:** Page 3 (Listening Practice) chỉ có ASCII wireframe, thiếu nhiều micro-interactions quan trọng:

| Thiếu | Tác động |
|---|---|
| **Audio waveform visualization** | User không biết audio đang play hay paused trên mobile |
| **Slow audio option (0.5x)** | Beginner (Person C) không nghe kịp → frustrated → bỏ |
| **Keyboard shortcuts UI** | Không hiển thị "Space = Play, Enter = Submit" → power user không biết |
| **Retry-within-lesson** | Muốn nghe lại 3 lần phải chờ? Hay có nút retry riêng? |
| **Auto-save transcript** | Gõ dài, reload trang → mất hết → extremely frustrating |
| **Partial scoring preview** | Không có "hint" nào giữa chừng |
| **"Skip to check" option** | Beginner muốn xem transcript ngay → không có |

**Đề xuất — Bổ sung vào Dictation Flow:**

```
Audio Player:
├── ▶️ Play/Pause (Space)
├── 🔄 Replay (R)
├── ⏩ Skip 5s / ⏪ Rewind 5s
├── Speed: 0.5x | 0.75x | 1x | 1.25x | 1.5x
├── [🔊 Waveform visualization — shows playback position]
└── [📝 Show Transcript] → Toggle reveal (Premium: unlock sau 3 lần nghe)

Transcript Input:
├── Auto-save mỗi 3 giây (localStorage + Supabase)
├── Character/word count
├── Placeholder: "Nhập những gì bạn nghe được..."
└── [Check] (Ctrl+Enter) → disabled nếu empty

After Submit:
├── Side-by-side comparison: User text vs Transcript
├── Color coding: ✅ Correct | ❌ Wrong | 📝 Missing | 🟠 Extra
├── AI Feedback panel
└── [🔄 Retry] [➡️ Next] [📝 Review Mistakes] [💾 Bookmark]
```

---

### 1.3 HIGH — Vocabulary Integration (Thiếu hoàn toàn)

**Vấn đề:** PRD đề cập "Vocabulary" trong dữ liệu đã crawl, nhưng hoàn toàn không có trong user flow. Vocabulary là:

- **Giá trị gia tăng lớn** — sau khi nghe + check, user học từ mới → thấy "được nhiều thứ"
- **Opportunity cho SEO** — vocabulary pages có thể rank trên Google
- **Reason to return** — flashcard review là daily hook

**Đề xuất — Thêm vào Should Have (Phase 2):**

```
Sau mỗi bài học:
┌─────────────────────────────────────────────────────┐
│  📚 Từ vựng từ bài này (3 từ mới)                │
│                                                     │
│  [flourish] /ˈflʌr.ɪʃ/  verb  ✅ đã học          │
│  [meticulous] /məˈtɪk.jə.ləs/  adj  🔄 đang ôn   │
│  [endeavor] /ɪnˈdev.ər/  noun  🆕 chưa học        │
│                                                     │
│  [Học tất cả từ vựng →]                           │
└─────────────────────────────────────────────────────┘
```

**Features cần thiết:**
- Spaced repetition (SM-2 algorithm) cho vocabulary
- Flashcard review (5 từ/ngày)
- Vocabulary notebook — xem tất cả từ đã học
- Search trong vocabulary
- Export vocabulary list

---

### 1.4 HIGH — Gamification nông (Chỉ có Streak)

**Vấn đề:** PRD chỉ đề cập streak. So sánh với Duolingo:

| Duolingo | VinaListen (hiện tại) |
|---|---|
| XP points | Không có |
| Level system | Không có |
| Achievement badges | Không có |
| Streak | Có |
| Leagues | Phase 2 mới có |
| Weekly challenges | Không có |
| "Streak Society" milestones | Không có |

**Tác động:** Không đủ engagement hooks để giữ user ở lại lâu. Streak một mình không đủ.

**Đề xuất — Mở rộng Gamification:**

```
┌─────────────────────────────────────────────────────┐
│  🏆 Achievements (Badges)                           │
│  ├── 🎯 First Dictation — Hoàn thành bài đầu tiên  │
│  ├── 🔥 7-Day Streak — Giữ streak 7 ngày          │
│  ├── 📖 Bookworm — Hoàn thành 10 bài               │
│  ├── 🎓 Perfect Score — 100% accuracy              │
│  ├── 🌍 Global Citizen — Học 3 topics khác nhau   │
│  └── 👑 Legend — 365-day streak                    │
│                                                     │
│  📊 XP System                                       │
│  ├── Correct word: +1 XP                           │
│  ├── Perfect accuracy: +10 XP bonus                │
│  ├── Streak bonus: +5 XP/ngày                     │
│  └── Complete topic: +50 XP                        │
└─────────────────────────────────────────────────────┘
```

---

### 1.5 MEDIUM — SEO bắt đầu từ Phase 3 (Quá muộn)

**Vấn đề:** SEO được đẩy xuống Phase 3 (Week 11-14). Nhưng:

- Topic pages là static content — có thể index ngay từ Week 1
- Lesson pages có transcript + vocabulary — SEO goldmine
- Mỗi tuần chờ = mất ranking position

**Đề xuất:** SEO từ Phase 0.5 (Week 2-3):
- Metadata cho tất cả topic/lesson pages
- Structured data (FAQ, Course, Article)
- Sitemap tự động
- Open Graph + Twitter Card

---

### 1.6 MEDIUM — Offline Mode (Thiếu hoàn toàn)

**Vấn đề:** Competitive analysis cho thấy Duolingo và ELSA có offline mode. Đây là critical cho:
- User đi metro/xem bus không có internet
- User ở vùng internet chậm
- Retention — practice được offline = stickier

**Đề xuất:** Phase 3+, thêm:
- Service Worker để cache audio + lesson data
- Offline vocabulary review
- Sync progress khi online trở lại

---

### 1.7 LOW — Adaptive Difficulty (Không có)

**Vấn đề:** Không có cơ chế điều chỉnh độ khó theo user performance. User beginner mới vào → gặp bài khó → frustrated → bỏ.

**Đề xuất:** Thêm vào Should Have:
- Auto-suggest next lesson based on accuracy
- If accuracy > 90% → suggest harder topic
- If accuracy < 50% → suggest easier topic or repeat current

---

### 1.8 LOW — Missing features checklist

| Tính năng | Status | Ghi chú |
|---|---|---|
| Dark mode | Không đề cập | Nên có cho người học buổi tối |
| Audio waveform | Không đề cập | Giúp user thấy rõ audio đang play |
| Touch gestures (swipe) | Không đề cận | Mobile-first nhưng không có swipe để next/prev |
| Accessibility (screen reader) | Chỉ có trong QA | Cần đề cập trong UX |
| Multi-language (EN/VI) | Chỉ VI | Nếu muốn mở rộng ra thị trường quốc tế |
| Export progress/certificate | Chỉ trong Phase 5 | |

---

## PHẦN 2: UX CHƯA HỢP LÝ

### 2.1 CRITICAL — Mobile Dictation Flow không rõ ràng

**Vấn đề:** ASCII wireframe cho desktop và mobile giống nhau. Không có mô tả mobile-specific UX.

**Vấn đề cụ thể:**

```
Desktop: Audio Player (left) | Transcript Input (right)  ← OK
Mobile:  ????

Trên mobile:
- Audio player ở đâu? Top hay bottom?
- Transcript input chiếm bao nhiêu % màn hình?
- Submit button có bị keyboard che không?
- Sau khi submit, result panel hiện ở đâu?
- Làm sao nghe lại audio khi đang ở result panel?
```

**Đề xuất — Mobile Dictation Flow:**

```
┌─────────────────────────────────────────────────────┐
│  Header: ← Back  |  Lesson Name  |  🔖 Bookmark   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Mini Audio Player - collapsible]                 │
│  ▶️ 00:42/03:15 ══════○══════ 🔄 0.75x            │
│  [Expand ↓]                                         │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Transcript Input                                   │
│  ┌───────────────────────────────────────────────┐ │
│  │ Nhập những gì bạn nghe được...               │ │
│  │                                               │ │
│  │ (textarea - chiếm ~60% màn hình)             │ │
│  │                                               │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│  Words: 42 | Auto-saved ✓                         │
│                                                     │
│  [      Check & Submit (44px height)      ]        │
│                                                     │
└─────────────────────────────────────────────────────┘

Sau khi submit (bottom sheet):
┌─────────────────────────────────────────────────────┐
│  Accuracy: 78%                      [× Close]    │
│  ✅ 34 correct | ❌ 6 wrong | 📝 4 missing       │
│  ─────────────────────────────────────────────────  │
│  ┌───────────────────────────────────────────────┐ │
│  │ Your answer:                                  │ │
│  │ I am learn English every day. ✅❌✅✅       │ │
│  │ Correct:    I am learning English every day.  │ │
│  └───────────────────────────────────────────────┘ │
│  ─────────────────────────────────────────────────  │
│  AI Feedback: "Bạn thường bỏ sót '-ing'.        │
│  Cố gắng nghe kỹ hơn ở đoạn cuối."               │
│  ─────────────────────────────────────────────────  │
│  [🔄 Retry] [➡️ Next Lesson] [📝 Review Mistakes] │
│                                                     │
│  [🔊 Nghe lại audio] ← Floating button            │
└─────────────────────────────────────────────────────┘
```

---

### 2.2 HIGH — Empty States không được mô tả

**Vấn đề:** PRD không mô tả UI cho các empty states. Người dùng sẽ thấy gì khi:

| Scenario | Hiện tại | Nên có |
|---|---|---|
| Chưa có bài học nào | ??? | Illustration + "Bắt đầu bài học đầu tiên nào!" |
| Không có bookmark | ??? | Illustration + "Lưu bài khó để ôn lại sau" |
| Không có history | ??? | "Chưa có bài nào. Bắt đầu học ngay!" |
| Search không ra kết quả | ??? | "Không tìm thấy. Thử từ khóa khác." |
| Audio load thất bại | ??? | Retry button + "Tải lại audio" |
| Không có internet | ??? | "Không có internet. Vẫn có thể học từ vựng offline." |
| Transcript bị missing | ??? | Warning + skip option |

**Đề xuất:** Thêm Section về Empty States và Error Handling.

---

### 2.3 HIGH — Loading States không được mô tả

**Vấn đề:** Không có skeleton loaders, progress indicators. Trên mobile chậm, loading states rất quan trọng để user biết app không crash.

**Cần thiết kế:**
- Skeleton cho Topic cards
- Skeleton cho Audio player
- Spinner cho "Checking transcript..."
- Progress bar cho AI feedback generation

---

### 2.4 MEDIUM — Navigation Flow không rõ ràng

**Vấn đề:** PRD có 7 pages nhưng không có sitemap hoặc navigation diagram.

**Cần bổ sung:**

```
┌─────────────────────────────────────────────────────┐
│                   NAVIGATION MAP                     │
│                                                     │
│  [Landing]                                          │
│      ↓                                              │
│  [Auth] → [Onboarding] → [Dashboard/Overview]     │
│                                     ↓               │
│                              [Topics]               │
│                                     ↓               │
│                              [Lesson List]          │
│                                     ↓               │
│                         [Listening Practice]        │
│                                     ↓               │
│                          [Result + AI Feedback]    │
│                              ↓         ↓            │
│                        [Next Lesson]  [Bookmarks]  │
│                              ↓                      │
│                         [Dashboard] ←──────────────┐
│                              ↓                      │
│                         [Progress]  [Leaderboard]  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2.5 MEDIUM — Freemium UX không rõ

**Vấn đề:** Không mô tả UX khi user hit limit. Đây là critical moment — nếu không handle tốt, user sẽ rời bỏ hoặc resentful.

**Cần mô tả:**

```
Free user, bài 6/ngày:
┌─────────────────────────────────────────────────────┐
│  ⚠️ Bạn đã hết lượt học hôm nay                    │
│                                                     │
│  Đã hoàn thành: 5/5 bài                           │
│  ─────────────────────────────────────────────────  │
│  🔥 Streak của bạn: 7 ngày — đừng để mất!        │
│                                                     │
│  [      Upgrade Premium — $5/tháng      ]          │
│                                                     │
│  Hoặc quay lại vào ngày mai                        │
│  [📝 Ôn từ vựng hôm nay]  [📖 Xem lịch sử]       │
└─────────────────────────────────────────────────────┘
```

---

### 2.6 LOW — Notification UX không được mô tả

**Vấn đề:** "Email reminders" và "timely push notifications" được đề cập nhưng không có mô tả UX.

**Cần thiết kế notification strategy:**

| Trigger | Timing | Message |
|---|---|---|
| Streak sắp mất | 11pm | "Streak 7 ngày của bạn sẽ reset trong 1 giờ!" |
| Daily reminder | 8am hoặc 9pm | "Luyện nghe 5 phút hôm nay chưa?" |
| Comeback | Day 3 sau last login | "Bạn đang giữ streak 5 ngày. Quay lại ngay!" |
| Achievement unlocked | Immediately | "🎉 Bạn đạt Perfect Score đầu tiên!" |
| Weekly summary | Monday 9am | "Tuần này bạn học 12 bài, accuracy 78%!" |

---

## PHẦN 3: RỦI RO GIỮ CHÂN NGƯỜI DÙNG

### 3.1 CRITICAL — "Wow Moment" không được định nghĩa

**Vấn đề:** PRD đề cập "wow moment" nhưng không mô tả nó là gì. Đây là **quan trọng nhất** trong toàn bộ retention strategy.

**Research:** Duolingo's "Aha moment" là khi user realize họ có thể học tiếng Anh mà không cảm thấy như đang học. Dựa trên research, wow moment cho VinaListen nên là:

**Đề xuất Wow Moment Definition:**

```
Wow Moment của VinaListen:

Sau bài dictation đầu tiên, user THẤY:
┌─────────────────────────────────────────────────────┐
│  🎉 Hoàn thành bài đầu tiên!                       │
│                                                     │
│  Accuracy: 82%                                     │
│  Bạn nghe tốt hơn 70% người dùng khác!            │
│  ─────────────────────────────────────────────────  │
│  🔥 Streak: 1 ngày                                  │
│  📊 Top 30% trên bảng xếp hạng                     │
│  ─────────────────────────────────────────────────  │
│  Tiếp tục học để đạt streak 7 ngày:              │
│  [████████████████████░░░░░░░░] 1/7                │
└─────────────────────────────────────────────────────┘

Cảm giác: "Wow, mình làm được! Mình hơn 70% người khác!"
→ Motivation tăng vọt → Tiếp tục học
```

**Các loại Wow Moments cần thiết kế:**
1. **First lesson** — Bài đầu tiên hoàn thành
2. **First perfect score** — 100% accuracy
3. **First 7-day streak** — Đạt streak 1 tuần
4. **First top 10%** — Vượt qua 90% users
5. **First topic completed** — Hoàn thành topic đầu tiên

---

### 3.2 HIGH — Streak Freeze Policy không rõ ràng

**Vấn đề:** "Streak freeze" được đề cập nhưng không có chi tiết:

| Câu hỏi | Cần trả lời |
|---|---|
| Streak freeze có miễn phí không? | Free: 1/week? Premium: unlimited? |
| Có mua streak freeze được không? | Duolingo: $2.99 cho 1 freeze |
| Có streak repair không? | Duolingo: $9.99 để restore streak đã mất |
| Streak freeze hiện UI như thế nào? | Fire emoji màu xám? Modal? |
| Miss 1 ngày → streak về 0? | Hay có grace period? |

**Đề xuất Streak Policy:**

```
Free tier:
├── 1 streak freeze miễn phí / tuần (reset Monday)
├── Streak repair: KHÔNG có
└── Miss 1 ngày → streak về 0

Premium:
├── 3 streak freezes / tuần
├── Streak repair: $2.99 để restore streak đã mất
├── Streak protection: automatic nếu có streak freeze
└── Streak bonus: +10 XP/ngày thay vì +5 XP

Design:
├── 🔥🔥🔥🔥🔥🔥🔥 = Active streak (màu cam)
├── 🔥💤 = Streak freeze (fire mờ, ngủ)
└── 💀 = Streak died (khi streak về 0)
```

---

### 3.3 HIGH — Daily Goal không được định nghĩa

**Vấn đề:** "Today's Practice" và "Today's Goal" được đề cập nhưng không rõ:

- Goal là gì? 1 bài? 3 bài? 10 phút?
- Có thay đổi goal theo streak không? (Streak dài → goal cao hơn)
- Goal có linh hoạt không? (Ngày bận → goal thấp hơn)

**Đề xuất:**

```
Adaptive Daily Goal:
├── Day 1-7:   Goal = 1 bài/ngày (build habit)
├── Day 8-30:  Goal = 2 bài/ngày
├── Day 31-90: Goal = 3 bài/ngày
└── Day 90+:   Goal = 5 bài/ngày

Flexible goal:
├── "Hôm nay bạn có 15 phút" → Suggest 1 bài ngắn
├── "Hôm nay bạn có 30 phút" → Suggest 2-3 bài
└── User có thể override goal

Goal completion feedback:
├── 🎉 "Mục tiêu hôm nay: 3 bài ✅ Hoàn thành!"
└── 🔔 "Mục tiêu hôm nay: 3 bài | 2/3 | Còn 1 bài nữa!"
```

---

### 3.4 HIGH — Social Proof và Community không có trong MVP

**Vấn đề:** Không có bất kỳ social element nào trong Phase 1. Research cho thấy social proof là retention driver mạnh.

**Các social features cần có từ Phase 1:**

| Feature | Impact | Effort |
|---|---|---|
| Global leaderboard (top accuracy/streak) | Tạo competition nhẹ | Thấp |
| "Top 10% today" badge | Social comparison | Thấp |
| Share result to Facebook/Twitter | Viral loop | Thấp |
| Anonymous activity (e.g., "12 người đang học bài này") | Belonging | Trung bình |
| Comment/discussion per topic | Community | Cao |

---

### 3.5 MEDIUM — "5 bài/ngày" Free Limit có thể chống lại mục tiêu

**Vấn đề:** 5 bài/ngày giới hạn power users (Person A: Minh). Nếu Minh muốn học 10 bài/ngày và bị chặn → cảm thấy bị "cướp" → frustrated → có thể trả tiền hoặc bỏ.

**Phân tích:**
- Duolingo hearts system gây churn vì user cảm thấy bị cướp đoạt thời gian
- BBC không limit → không có friction
- Cake limit 5 hearts/day → gây frustration

**Đề xuất — Rethink free tier:**

```
Option A: Không limit số bài, CHỈ limit AI feedback
├── Free: Unlimited bài + 3 AI feedback/ngày
├── Premium: Unlimited AI feedback
→ Không có friction cho practice, chỉ friction cho "smart" feedback

Option B: Limit weekly thay vì daily
├── Free: 35 bài/tuần (= 5/ngày trung bình)
├── Premium: Unlimited
→ Linh hoạt hơn, không bị "trừng phạt" vì 1 ngày bận

Option C: Time-based limit
├── Free: 30 phút/ngày
├── Premium: Unlimited
→ Natural cap, không ai cảm thấy bị "cướp"
```

**Khuyến nghị: Option A** — Giữ practice free, chỉ limit AI. Revenue model dựa trên AI subscription.

---

### 3.6 MEDIUM — Progress Plateau Prevention không đủ

**Vấn đề:** "AI Feedback" là giải pháp duy nhất cho progress plateau, nhưng không có chi tiết:

- AI feedback chỉ phân tích bài vừa làm → KHÔNG hiển thị trend
- User không biết mình đang CẢI THIỆN hay không
- Progress plateau xảy ra khi accuracy không thay đổi qua 10+ bài

**Đề xuất — Progress Visualization:**

```
┌─────────────────────────────────────────────────────┐
│  📈 Your Listening Progress                         │
│                                                     │
│  Accuracy Trend (30 days)                          │
│  85% ┤                    ╭──╮                    │
│  80% ┤              ╭──╮╭─╯  ╰──╮               │
│  75% ┤        ╭──╮╭─╯  ╰───────╰─╮              │
│  70% ┤  ╭──╮╭─╯  ╰───────────────╰              │
│      ┼──┴──┴──┴──┴──┴──┴──┴──┴──┴───            │
│      Mon  Tue  Wed  Thu  Fri  Sat  Sun            │
│                                                     │
│  ✅ Improved 5% this week!                          │
│  📝 Your weakest sounds: /θ/ (theta), /ð/ (eth)   │
│  🎯 Next goal: 80% accuracy                         │
└─────────────────────────────────────────────────────┘
```

---

## PHẦN 4: RỦI RO THƯƠNG MẠI HÓA

### 4.1 CRITICAL — Legal Risk: Copyright nội dung DailyDictation

**Vấn đề nghiêm trọng nhất:**

DailyDictation là nội dung có copyright. Sử dụng mà không có license agreement có thể dẫn đến:

1. **Cease & Desist letter** — buộc ngừng sử dụng content
2. **DMCA takedown** — hosting trên Supabase Storage → content bị xóa
3. **Lawsuit** — phạt tiền hoặc yêu cầu bồi thường
4. **Reputation damage** — tin đồn "copy DailyDictation"

**Phân tích:**
- DailyDictation founder có PRO app riêng → có commercial interest
- "Accept donations" không đồng nghĩa "free to commercial use"
- Crawling có thể vi phạm ToS của website
- "Fair use" cho giáo dục là grey area, không bảo vệ được startup

**Đề xuất — Phải làm TRƯỚC KHI launch:**

```
Priority 1 (Ngay lập tức):
├── Check DailyDictation ToS — có cấm crawl/usage không?
├── Liên hệ trực tiếp founder — hỏi về licensing
│   └── Email mẫu: "Tôi đang xây dựng app học tiếng Anh 
│       cho người Việt, muốn dùng content của bạn..."
├── Nếu founder đồng ý → có written agreement
└── Nếu founder không đồng ý → phải có backup plan

Priority 2 (Backup content sources):
├── BBC Learning English — hoàn toàn miễn phí, license rõ ràng
├── Voice of America (VOA) Learning English
├── Cambridge English online resources
├── YouGlish / Forvo (cho pronunciation)
└── Podcast: 6 Minute English (BBC) — transcript miễn phí

Priority 3 (Content licensing model):
├── Revenue share với DailyDictation founder?
├── One-time license fee?
├── Attribution + link back?
└── "Made with DailyDictation" credit?
```

---

### 4.2 HIGH — Freemium Model có Logic Ngược

**Vấn đề:** PRD đề xuất:

| | Free | Premium |
|---|---|---|
| Bài học | 5/ngày | Unlimited |
| AI Feedback | 3/ngày | Unlimited |

**Tại sao đây là logic ngược:**

```
AI Feedback (Gemini API) = CHI PHÍ CAO
├── ~$0.001-0.01 per request
├── 50 MAU × 5 bài × 3 AI = 750 requests/day = $0.75-7.5/ngày
├── 500 MAU × 5 bài × 3 AI = 7,500 requests/day = $7.5-75/ngày
└── Gemini free tier: 15 requests/min = 21,600 requests/ngày

Content (audio files) = CHI PHÍ THẤP
├── 500MB Supabase Storage = $0/tháng (free tier)
├── Hosting Vercel = $0/tháng
└── Marginal cost per user ≈ $0
```

**Vấn đề:**
- Content là free (chi phí gần như 0) → GIỚI HẠN content
- AI là đắt (tăng theo usage) → FREE (với limit nhỏ)

**Đề xuất — Đảo ngược freemium model:**

```
Logic đúng:
├── Content = FREE (chi phí thấp, user muốn practice)
├── AI = PREMIUM (chi phí cao, revenue driver)
└── Limit AI, không limit content

Freemium v2:
├── Free: Unlimited bài + 3 AI feedback/ngày
├── Premium ($5-7/tháng): Unlimited AI feedback + all features
└── Lifetime ($49): All features + priority AI queue

Revenue model:
├── AI subscription = primary revenue
├── Content hoàn toàn free = acquisition driver
└── Limit AI để drive conversion
```

---

### 4.3 HIGH — Pricing có thể không phù hợp thị trường Việt Nam

**Vấn đề:** $5-7/tháng = ~120,000-170,000 VND/tháng

| Context | Giá |
|---|---|
| Netflix Vietnam | ~70,000 VND/tháng |
| Spotify Vietnam | ~55,000 VND/tháng |
| YouTube Premium Vietnam | ~79,000 VND/tháng |
| Duolingo Super | ~$12.99/tháng (~$300k VND) |
| ELSA Speak | ~$8.70/tháng (~$220k VND) |
| **VinaListen đề xuất** | **$5-7/tháng (~$120-170k VND)** |

**Phân tích:**
- $5-7 cho Việt Nam là hợp lý (rẻ hơn Netflix)
- Nhưng Persona A (Minh, sinh viên) chỉ WTP 50-100k/tháng
- Persona C (Anh) WTP Free-50k → không bao giờ trả tiền

**Đề xuất — Tiered pricing cho Vietnam market:**

```
Vietnam-native pricing:
├── Free: 5 bài/ngày + 3 AI feedback
├── VinaListen Lite: 49,000 VND/tháng (~$2)
│   └── Unlimited bài + 10 AI feedback/ngày
├── VinaListen Pro: 99,000 VND/tháng (~$4)
│   └── Everything + speaking practice
└── Lifetime: 490,000 VND (~$19.99) = ~1 triệu/năm so với monthly

Cân nhắc:
├── Giá VND = native, không phải USD conversion
├── Lifetime deal = psychological anchor ($20 one-time vs $5/month)
├── Sinh viên = student discount 50%
└── Early adopter = Lifetime deal + bonus features
```

---

### 4.4 HIGH — Không có Payment Infrastructure chi tiết

**Vấn đề:** "Subscription billing (Stripe)" chỉ được đề cập một dòng. Không có chi tiết về:

| Thiếu | Chi tiết |
|---|---|
| Stripe integration | Vietnam Stripe hỗ trợ thanh toán quốc tế, thanh toán local? |
| Payment methods | Card, PayPal, MoMo, VNPay? |
| Refund policy | 7-day refund? No refund? |
| Trial period | 7-day trial trước khi charge? |
| Price display | Hiển thị VND hay USD? |
| Tax/VAT | Vietnam requires FPT invoice? |
| Subscription management | Cancel, upgrade, downgrade UX? |
| Revenue reporting | MRR, churn rate, LTV tracking? |

**Đề xuất:** Thêm Section về Payment Infrastructure.

---

### 4.5 MEDIUM — Viral/Referral Loop không đủ mạnh

**Vấn đề:** "Referral: Invite 3 friends → 1 tháng premium free" là basic. Không có:

- Viral coefficient target cụ thể
- Referral tracking (ai invited ai)
- Incentive structure (cả inviter và invitee đều được gì?)
- Shareable moments (khi nào user muốn share?)

**Đề xuất:**

```
Enhanced Referral System:
├── Invite friend → Both get 1 week premium free
├── Friend completes 3 lessons → Inviter gets 1 month premium
├── Share result screenshot → Get 1 AI feedback bonus
└── "I just scored 95% on this lesson" → Viral loop

Viral moments to leverage:
├── Perfect score (100% accuracy)
├── Long streak milestone (7, 30, 100 days)
├── Topic completed
├── Achievement unlocked
└── "Top 10% today"

Target viral coefficient: K > 0.5
→ Mỗi user mang về > 0.5 user mới
→ 500 users × 0.5 = 250 organic users/cycle
```

---

### 4.6 MEDIUM — No Churn Prevention / Win-back Strategy

**Vấn đề:** Không có strategy cho user đã churn. Once user leaves, không có gì để bring them back.

**Đề xuất:**

```
Churn Prevention + Win-back:
├── Day 1-2: Email "Miss you already" + streak reminder
├── Day 3-7: Offer streak freeze as gift
├── Day 7-14: "Your friends are ahead" social proof
├── Day 14-30: Discount offer (50% off first month)
├── Day 30+: Win-back campaign + new features announcement
└── User segments: At-risk (1 day inactive), Churned (7+ days)

Anti-churn features:
├── Exit survey: "Tại sao bạn rời đi?"
├── Pause subscription (thay vì cancel)
├── "Take a break" → streak freeze auto-apply
└── Re-engagement notification sequence
```

---

### 4.7 LOW — Không có LTV/CAC calculation

**Vấn đề:** PRD có revenue target nhưng không có LTV calculation:

```
Cần tính toán:
├── LTV (Lifetime Value) = ARPU × Average lifespan
│   └── $5 × 6 months = $30 LTV (nếu user stay 6 tháng)
├── CAC (Customer Acquisition Cost)
│   └── Organic = $0? Paid ads = $X?
├── LTV:CAC ratio
│   └── > 3:1 = healthy business
└── Payback period
    └── Bao lâu để recover CAC?

Assumptions cần validate:
├── Average user lifespan = ? months
├── Churn rate = ?% per month
├── % free → paid conversion = ?%
```

---

## PHẦN 5: TỔNG HỢP — PRIORITIZED ACTION ITEMS

### 5.1 Fix trước khi build (P0)

| # | Issue | Priority | Effort |
|---|---|---|---|
| 1 | Legal check — DailyDictation licensing | CRITICAL | High |
| 2 | Backup content sources (BBC, VOA) | CRITICAL | Medium |
| 3 | Onboarding flow chi tiết | CRITICAL | Medium |
| 4 | Mobile dictation UX chi tiết | CRITICAL | Medium |
| 5 | Freemium model logic — đảo ngược AI/Content | CRITICAL | Low |
| 6 | Wow Moment definition | CRITICAL | Low |
| 7 | Empty states + Error states | CRITICAL | Low |

### 5.2 Fix trong MVP build (P1)

| # | Issue | Priority | Effort |
|---|---|---|---|
| 8 | Auto-save transcript (localStorage) | HIGH | Low |
| 9 | Vocabulary integration | HIGH | Medium |
| 10 | Audio waveform visualization | HIGH | Medium |
| 11 | Vietnam-native pricing (VND) | HIGH | Low |
| 12 | Streak freeze policy chi tiết | HIGH | Low |
| 13 | Daily goal system chi tiết | HIGH | Low |
| 14 | Social proof (leaderboard, share) | MEDIUM | Medium |
| 15 | SEO từ Day 1 | MEDIUM | Low |

### 5.3 Fix sau MVP (P2)

| # | Issue | Priority | Effort |
|---|---|---|---|
| 16 | Gamification expansion (XP, badges) | MEDIUM | Medium |
| 17 | Offline mode | MEDIUM | High |
| 18 | Adaptive difficulty | LOW | High |
| 19 | Win-back / churn prevention flow | MEDIUM | Medium |
| 20 | Payment infrastructure chi tiết | MEDIUM | Medium |
| 21 | Dark mode | LOW | Low |
| 22 | Touch gestures (swipe) | LOW | Low |

---

## PHẦN 6: QA CHECKLIST

### 6.1 Edge Cases cần test

| Edge Case | Expected Behavior |
|---|---|
| Audio load thất bại | Retry button + skip option |
| Transcript missing | Warning + skip option |
| User gõ 0 ký tự + submit | Disable button / show error |
| User gõ quá nhiều ký tự | Auto-scroll + no crash |
| AI API timeout (>10s) | Fallback message + retry |
| AI API rate limit exceeded | Queue + notify user |
| Network disconnect mid-lesson | Auto-save + resume on reconnect |
| User refresh trang mid-lesson | Restore from auto-save |
| Spam submit button | Debounce 2 giây |
| Very long audio (>10 phút) | Chunked playback option |
| Accent variations (UK, AU) | Support multiple accents |
| Special characters trong transcript | Handle Unicode properly |

### 6.2 Performance Requirements

| Metric | Target |
|---|---|
| Audio start time | < 1s (preload next 2 lessons) |
| AI feedback response | < 5s (show loading skeleton) |
| Page transition | < 300ms |
| Auto-save frequency | Every 3s |
| Offline audio cache | Last 5 lessons |

### 6.3 Accessibility Requirements

| Requirement | Standard |
|---|---|
| Keyboard navigation | All interactive elements |
| Screen reader | ARIA labels on all controls |
| Color contrast | WCAG AA minimum |
| Focus indicator | Visible focus ring |
| Touch targets | 44px minimum |
| Reduced motion | Respect prefers-reduced-motion |

---

## KẾT LUẬN

PRD VinaListen v1.0 có solid foundation, đặc biệt là:
- Vision và positioning rõ ràng
- Competitor research toàn diện
- Tech stack hợp lý cho chi phí gần bằng 0
- MoSCoW prioritization cơ bản đúng

**Nhưng có 4 lỗ hổng nghiêm trọng cần fix:**

1. **Legal** — Copyright DailyDictation có thể kill toàn bộ product
2. **Onboarding** — 40% churn xảy ra ở bước này
3. **Freemium logic** — Đang limit thứ sai (content) và free thứ đắt (AI)
4. **Mobile UX** — Chưa có mobile-specific design

**Recommendation:** Chỉnh sửa PRD theo prioritized action items ở Section 5, đặc biệt là P0 items, trước khi bắt đầu build.
