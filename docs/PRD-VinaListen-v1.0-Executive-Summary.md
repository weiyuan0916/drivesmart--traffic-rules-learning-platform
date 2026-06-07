# VinaListen — Product Requirement Document
## Executive Summary

**Version:** 1.0 | **Date:** 2026-06-07 | **Status:** Draft

---

## Product Vision
Trở thành nền tảng luyện nghe-nói tiếng Anh #1 tại Việt Nam — miễn phí, tập trung vào dictation practice với AI feedback cá nhân hóa.

**Tagline:** *"Luyện nghe mỗi ngày. Không cần gia sư."*

---

## Problem
- Người Việt yếu nghe tiếng Anh (TOEIC Listening TB: 150-250/495)
- Chi phí học IELTS/TOIEC quá cao (5-15 triệu/khóa)
- Không có công cụ luyện nghe rẻ mà chất lượng
- Drop-off rate cao: 40% user bỏ app trong tuần đầu

---

## Solution
Nền tảng luyện nghe qua dictation:
1. User nghe audio → nhập transcript → so sánh với đáp án
2. Hệ thống chấm điểm: accuracy, đúng/sai/thiếu từ
3. AI feedback phân tích lỗi pattern cá nhân
4. Progress tracking + streak system

---

## Target Users

| Persona | Tuổi | Mục tiêu | Pain Point | Willingness to Pay |
|---|---|---|---|---|
| Minh (Sinh viên) | 20 | IELTS 6.5 | Không đủ tiền học, không biết mình sai ở đâu | 50-100k/tháng |
| Linh (Nhân viên) | 28 | Giao tiếp công việc | Bận rộn, nghe không kịp người nước ngoài | 100-200k/tháng |
| Anh (DriveSmart) | 30 | Cải thiện nghe cơ bản | Đã lâu không học, cần cảm giác tiến bộ rõ ràng | Free-50k |

---

## MVP Features

### Phase 1 — Must Have (2 tháng)

- Topic Browser + Search + Filter (Beginner/Intermediate/Advanced)
- Audio Player (Play/Pause/Replay + Speed 0.5x-1.5x)
- Dictation Input + Transcript Comparison
- Scoring Engine (Accuracy %, Correct/Wrong/Missing words)
- AI Feedback (GPT/Gemini analyze lỗi)
- Progress Dashboard (tổng bài, accuracy TB, streak)
- Responsive Mobile-first

### Phase 2 — Should Have (tháng 3-4)

- Bookmarks + History
- Leaderboard
- Streak System
- Onboarding flow

### Phase 3 — Growth (tháng 5-6)

- SEO + Landing page
- Freemium model
- Referral system
- Speaking Practice (record + AI pronunciation)

---

## Tech Stack — Chi phí ~$15/năm

| Layer | Công nghệ | Chi phí |
|---|---|---|
| Frontend | Next.js + TypeScript + TailwindCSS | $0 |
| Database | Supabase (Free tier) | $0 |
| Auth | Supabase Auth | $0 |
| AI | Gemini API (Free tier) | $0 |
| Hosting | Vercel | $0 |
| Storage | Supabase Storage (Audio files) | $0 |
| Domain | .app/.vn | ~$15/năm |

---

## Roadmap

```
Month 1-2:    ✅ Infrastructure + Core MVP (Topic Browser → Dictation → Scoring → AI Feedback)
Month 3-4:    ✅ Engagement (Bookmarks, History, Streak, Leaderboard)
Month 5-6:    ✅ Growth (SEO, Freemium, Referral, Speaking)
Month 7-12:   ⬜ Scale (Mobile App, Premium Content, Subscription)
```

---

## Business Model

### Freemium Model

| Feature | Free | Premium ($5-7/tháng) |
|---|---|---|
| Bài học | 5 bài/ngày | Unlimited |
| AI Feedback | 3 lần/ngày | Unlimited |
| Audio speed | 0.75x - 1.25x | 0.5x - 2x |
| History | 7 ngày | Unlimited |
| Speaking Practice | ❌ | ✅ |
| Certificates | ❌ | ✅ |

### Revenue Streams

1. **Subscription:** $5-7/tháng = $60-84/user/năm
2. **Lifetime Deal:** $49 one-time (early adopters)
3. **Affiliate:** English learning products (coursera, udemy)
4. **Ads:** Non-intrusive banner (Phase 3+)

---

## Success Metrics

### Month 1 Targets

| Metric | Target |
|---|---|
| Users registered | 500 |
| 7-day retention | 30%+ |
| Avg lessons/day/user | 3+ |
| Activation rate | 60%+ |

### Month 6 Targets

| Metric | Target |
|---|---|
| MAU | 2,000 |
| Paying users | 150 |
| Revenue | $750-1,050/tháng |
| Viral coefficient | 0.5+ |

**North Star Metric:** Số bài dictation hoàn thành mỗi tuần trên mỗi user hoạt động

---

## Competitive Position

| Feature | VinaListen | Duolingo | ELSA Speak | DailyDictation |
|---|---|---|---|---|
| Dictation practice | ✅ Core | ❌ | ❌ | ✅ Basic |
| AI feedback | ✅ Advanced | ✅ | ✅ | ❌ |
| Transcript comparison | ✅ Advanced | ❌ | N/A | ✅ Basic |
| Vietnamese-native | ✅ | ❌ | ✅ | ❌ |
| Zero cost MVP | ✅ | ✅ | ❌ | ✅ |

**Win factor:** Tập trung 100% vào dictation + AI feedback depth + Vietnamese market

---

## Top Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Drop-off sau registration (60%) | Skip signup, immediate practice, "wow moment" ngay sau bài 1 |
| Supabase limit exceeded | Monitor usage, optimize queries, có kế hoạch scale |
| AI API costs spike | Cache responses, rate limiting, budget alerts |
| DailyDictation policy change | Backup data local, crawl định kỳ |

---

## Open Questions

1. DailyDictation content — check ToS hoặc liên hệ author về licensing
2. AI feedback từ đầu hay sau? → Khuyến nghị: bắt đầu với basic scoring, AI ở Phase 2
3. Native mobile app hay web mobile-first? → Khuyến nghị: web mobile-first (nhanh hơn 10x để build)
4. Branding: "VinaListen" hay tên khác?

---

## Success Criteria

### MVP Success (2 tháng)
- [ ] 500 users registered
- [ ] 30% 7-day retention
- [ ] Avg 3 lessons/user/day
- [ ] 0 critical bugs
- [ ] Lighthouse > 90

### Pivot Conditions
- Retention < 10% sau 2 tháng → Pivot sang social learning
- Acquisition < 100 users → Rethink positioning
- NPS < 30 → Rethink UX/product-market fit

---

**Next Step:** Chọn tên brand → Setup Next.js project → Import data vào Supabase → Build core MVP
