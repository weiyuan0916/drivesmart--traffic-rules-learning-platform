# PRD — VinaListen: Nền tảng luyện nghe-nói tiếng Anh

**Phiên bản:** 1.0  
**Ngày:** 2026-06-07  
**Tác giả:** Founder  
**Trạng thái:** Draft

---

## 1. Product Vision

**Tầm nhìn:** Trở thành nền tảng luyện nghe-nói tiếng Anh #1 tại Việt Nam cho người tự học — đặc biệt tập trung vào người Việt muốn cải thiện kỹ năng nghe và phản xạ ngôn ngữ một cách thực tế, không cần lớp học đắt đỏ.

**Sứ mệnh:** Biến việc luyện nghe tiếng Anh mỗi ngày thành thói quen dễ dàng như đánh răng — với chi phí gần như bằng không và nội dung chất lượng cao từ DailyDictation.

**Giá trị cốt lõi:**

- **Rẻ tiền:** Miễn phí hoặc gần như miễn phí trong MVP
- **Thực tế:** Nghe đoạn hội thoại thực tế, không phải bài ngữ pháp trừu tượng
- **Cá nhân hóa:** Theo dõi lỗi riêng, gợi ý nội dung phù hợp level
- **Không rườm rà:** Mở app → nghe → check → biết ngay đúng sai, tiếp tục

---

## 2. Problem Statement

### 2.1 Vấn đề thị trường

| Vấn đề | Chi tiết |
|---|---|
| **Chi phí học tiếng Anh quá cao** | Khóa học giao tiếp IELTS/TOIEC giá 5-15 triệu, gia sư 150-500k/giờ. Sinh viên và người đi làm không đủ ngân sách. |
| **Thiếu nơi luyện nghe chất lượng** | YouTube và podcast không có transcript chuẩn, không có hệ thống đánh giá. |
| **Drop-off cao trên app học** | Duolingo có 40% user rời trong tuần đầu. Không có cơ chế giữ chân phù hợp. |
| **Người Việt yếu nghe** | TOEIC Listening trung bình người Việt: 150-250/495 — thấp hơn nhiều nước trong khu vực. |
| **Không có feedback** | Học 1 mình không biết mình sai chỗ nào, không ai sửa. |

### 2.2 Root Cause Analysis

```
Người dùng muốn học nghe tiếng Anh
        ↓
Tìm YouTube, podcast, app
        ↓
Không hiểu → Frustrated → Bỏ
        ↓
Hoặc hiểu một phần nhưng không biết đúng sai
        ↓
Không có tiến bộ rõ ràng
        ↓
Mất động lực → Bỏ
```

### 2.3 Opportunity

- **DailyDictation** đã crawl được nội dung chất lượng: audio, transcript, vocabulary, topic, section
- Chi phí vận hành gần như bằng 0 (Vercel + Supabase)
- Thị trường EdTech Việt Nam đang tăng trưởng 20-30%/năm
- AI có thể thay thế gia sư để give feedback cá nhân

---

## 3. Product Goals

### 3.1 Mục tiêu ngắn hạn (0-2 tháng — MVP)

1. **Mở rộng phạm vi tiếp cận** — Đạt **500 người dùng đăng ký** trong tháng đầu tiên ra mắt
2. **Tạo thói quen học** — **30% user quay lại** sau 7 ngày đầu tiên
3. **Xây dựng nội dung** — Có ít nhất **50 bài học hoàn chỉnh** (audio + transcript + vocabulary)
4. **Chứng minh giá trị** — User hoàn thành trung bình **3 bài/ngày**
5. **Không crash hệ thống** — Uptime > 99%, load time < 2s trên mobile

### 3.2 Mục tiêu trung hạn (3-6 tháng)

1. Đạt **2,000 MAU** (Monthly Active Users)
2. **15% user chuyển thành paid** (freemium model)
3. Tích hợp AI coach cho speaking feedback
4. Hệ thống progress/achievement hoàn chỉnh

### 3.3 Mục tiêu dài hạn (6-12 tháng)

1. Đạt **10,000 MAU**
2. **500 paying users** ($5-10/tháng)
3. Mở rộng nội dung: IELTS, TOEIC, Business English
4. Xây dựng community và leaderboard

---

## 4. Target Users

### 4.1 Primary Personas

#### Person A: Minh — Sinh viên năm 3 (20 tuổi)

- **Mục tiêu:** Pass IELTS 6.5 để xin việc
- **Pain points:** Không đủ tiền học IELTS, tự học thì không biết mình đúng sai ở đâu
- **Hành vi:** Học vào buổi tối, dùng điện thoại nhiều, thích học ngắn 10-15 phút
- **Willings to pay:** 50-100k/tháng nếu thấy hiệu quả thật
- **Tech savvy:** Cao

#### Person B: Linh — Nhân viên văn phòng (28 tuổi)

- **Mục tiêu:** Giao tiếp tiếng Anh trong công việc, đi công tác nước ngoài tự tin hơn
- **Pain points:** Bận rộn, không có thời gian học dài, nghe không hiểu người nước ngoài nói nhanh
- **Hành vi:** Học lúc đi xe buýt, giờ nghỉ trưa, thích nội dung thực tế
- **Willings to pay:** 100-200k/tháng
- **Tech savvy:** Trung bình

#### Person C: Anh — Người đi làm muốn thi GPLX (30 tuổi) *(người dùng DriveSmart hiện tại)*

- **Mục tiêu:** Học tiếng Anh cơ bản, cải thiện nghe để xin việc tốt hơn
- **Pain points:** Đã lâu không học tiếng Anh, quên nhiều, cần nền tảng vững
- **Hành vi:** Học buổi sáng sớm hoặc tối muộn, cần cảm giác "có tiến bộ" rõ ràng
- **Willings to pay:** Miễn phí là tốt nhất, có thể trả 50k nếu thấy hữu ích
- **Tech savvy:** Thấp-Trung bình

### 4.2 User Journey Map

```
[Awareness] → [Consideration] → [Onboarding] → [First Practice] → [Habit] → [Retention]
     ↓               ↓                ↓               ↓              ↓          ↓
  SEO/Review    Free Trial       1-click      Dictation      Daily     Paid/Referral
  Mouth         experience       signup       exercise       streak    /churn
```

**Key Drop-off Points:**
- Sau khi đăng ký xong → không biết bắt đầu từ đâu
- Sau bài đầu tiên → không thấy "wow moment"
- Sau 3-5 ngày → streak không đủ hấp dẫn để giữ
- Sau 2 tuần → không thấy progress rõ ràng

---

## 5. MVP Scope

### 5.1 MoSCoW Prioritization

#### Must Have (MVP — Phase 1)

| Tính năng | Mô tả |
|---|---|
| **Topic Browser** | Danh sách chủ đề (Business, Travel, IELTS, Daily Life...) với filter level |
| **Audio Player** | Play/Pause/Replay, tốc độ 0.5x-1.5x, hiển thị thời lượng |
| **Dictation Input** | Textarea để nhập transcript, compare với transcript chuẩn |
| **Scoring System** | Accuracy %, correct words, wrong words, missing words |
| **AI Feedback** | GPT/Gemini analyze lỗi và gợi ý cải thiện |
| **Progress Dashboard** | Tổng bài đã học, accuracy TB, streak hiện tại |
| **Responsive Mobile** | Mobile-first, tối ưu 320px-1024px |

#### Should Have (Phase 2)

| Tính năng | Mô tả |
|---|---|
| **Bookmarks** | Lưu bài khó, câu khó |
| **History** | Xem lại bài đã làm, score cũ |
| **Leaderboard** | Top accuracy, top streak |
| **Spaced Repetition** | Ôn lại bài cũ đúng lúc |
| **Vocabulary Cards** | Từ mới từ mỗi bài học |

#### Could Have (Phase 3)

| Tính năng | Mô tả |
|---|---|
| **Speaking Practice** | Record và compare với transcript |
| **AI Speaking Coach** | Pronunciation feedback bằng AI |
| **YouTube Integration** | Nhập link YouTube → auto-generate dictation |
| **Subscription** | Premium lessons, unlimited practice |
| **Certificates** | Chứng chỉ hoàn thành topic |

#### Won't Have (Phase 4+)

- Video calls với tutor
- Live classes
- Mobile app (native)
- AI avatar

### 5.2 MVP Feature Breakdown

#### Page 1: Overview (Landing sau login)

```
┌─────────────────────────────────────────────────────┐
│  Hero: "Luyện nghe mỗi ngày"                        │
│  ─────────────────────────────────────────────────  │
│  [Continue Learning Card]   [Today's Goal Card]     │
│  ─────────────────────────────────────────────────  │
│  Recommended Topics        Popular Topics           │
│  [Topic Card] [Topic Card] [Topic Card] [Topic Card]│
│  ─────────────────────────────────────────────────  │
│  Recent Activity: 12 bài | Streak: 5 ngày          │
└─────────────────────────────────────────────────────┘
```

#### Page 2: Topics

```
┌─────────────────────────────────────────────────────┐
│  Search: [Tìm kiếm chủ đề...      ]                 │
│  Filter: [All] [Beginner] [Intermediate] [Advanced] │
│  ─────────────────────────────────────────────────  │
│  [IELTS]        [Business]    [Daily Life]          │
│  25 bài         18 bài        32 bài               │
│  ⏱ 30 phút/bài  ⏱ 20 phút     ⏱ 15 phút          │
│  ─────────────────────────────────────────────────  │
│  [Travel]       [Technology]  [News]                │
│  20 bài         15 bài        22 bài               │
└─────────────────────────────────────────────────────┘
```

#### Page 3: Listening Practice (Core Loop)

```
Desktop:
┌──────────────────────────┬──────────────────────────┐
│  Audio Player             │  Transcript Input        │
│  ▶️ ⏸️ 🔄  0.75x 1x 1.25x│  [Nhập những gì bạn     │
│  ══════════○══════════    │   nghe được ở đây...]   │
│  00:42 / 03:15            │                          │
│  ──────────────────────── │  [Submit & Check]       │
│  Progress: 3/25 bài      │                          │
│  Accuracy: 78%            │                          │
├──────────────────────────┴──────────────────────────┤
│  Result Panel                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │ Accuracy: 78%  ✅ 34   ❌ 6   📝 4          │   │
│  │                                              │   │
│  │ AI Feedback:                                 │   │
│  │ "Bạn thường bỏ sót mạo từ 'a', 'the'.       │   │
│  │  Cố gắng nghe kỹ hơn ở đoạn cuối."          │   │
│  └──────────────────────────────────────────────┘   │
│  [🔄 Retry]  [➡️ Next Lesson]  [📝 Review Mistakes]│
└─────────────────────────────────────────────────────┘
```

#### Page 4: My Progress

```
┌─────────────────────────────────────────────────────┐
│  Stats Overview                                      │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐        │
│  │  47   │  │ 12.5h │  │  82%  │  │  7🔥  │        │
│  │ Bài   │  │ Giờ   │  │ Acc   │  │Streak│        │
│  └───────┘  └───────┘  └───────┘  └───────┘        │
│  ─────────────────────────────────────────────────  │
│  Weekly Progress Chart 📊                           │
│  [Bar chart: Mon-Sun]                              │
│  ─────────────────────────────────────────────────  │
│  Best Streak: 14 ngày                             │
│  Total Practice Time: 12.5 giờ                     │
└─────────────────────────────────────────────────────┘
```

### 5.3 Tech Stack (Chi phí gần như bằng 0)

| Layer | Công nghệ | Chi phí |
|---|---|---|
| **Frontend** | Next.js App Router + TypeScript + TailwindCSS | $0 |
| **Animation** | Framer Motion | $0 |
| **Icons** | Lucide React | $0 |
| **State** | React Context + useReducer | $0 |
| **Backend** | Next.js API Routes | $0 |
| **Database** | Supabase (Free tier: 500MB, 2GB transfer) | $0 |
| **Auth** | Supabase Auth (Free tier: 50k MAU) | $0 |
| **AI Feedback** | Gemini API (Free tier: 15 req/min) | $0* |
| **Hosting** | Vercel (Hobby: 100GB bandwidth) | $0 |
| **Storage** | Supabase Storage (1GB) | $0 |
| **Domain** | .app hoặc .vn | ~$10-15/năm |
| **Analytics** | Vercel Analytics | $0 |

**Tổng chi phí năm đầu: ~$15** (chủ yếu là domain)

---

## 6. Product Roadmap

### Phase 0: Infrastructure (Week 1-2)

- [ ] Setup Next.js project với TypeScript + TailwindCSS
- [ ] Setup Supabase (database, auth, storage)
- [ ] Import dữ liệu đã crawl vào database
- [ ] Xây dựng component system (design tokens, typography, colors)
- [ ] Setup CI/CD với Vercel

### Phase 1: Core MVP (Week 3-6)

- [ ] Auth: Login/Register/Skip (anonymous)
- [ ] Topic Browser + Search + Filter
- [ ] Audio Player (play, pause, replay, speed control)
- [ ] Dictation Input + Scoring Engine
- [ ] Result Screen + AI Feedback
- [ ] Progress Dashboard
- [ ] Responsive Mobile (320px → 1024px)

### Phase 2: Engagement (Week 7-10)

- [ ] Bookmarks (lưu bài, lưu câu)
- [ ] History (xem lại bài cũ)
- [ ] Streak System (fire emoji, streak freeze)
- [ ] Leaderboard (top accuracy, top streak)
- [ ] Onboarding flow (quick tutorial 30 giây)
- [ ] Email reminders (streak sắp mất)

### Phase 3: Growth (Week 11-14)

- [ ] SEO optimization (meta tags, structured data)
- [ ] Landing page cho người chưa đăng ký
- [ ] Freemium model (giới hạn bài miễn phí)
- [ ] Referral system (invite friend → premium)
- [ ] Social sharing (result screenshot)

### Phase 4: AI + Speaking (Week 15-20)

- [ ] Speaking Practice (record audio)
- [ ] AI Pronunciation Feedback (Gemini/Voice AI)
- [ ] Smart Analysis (phân tích lỗi pattern)
- [ ] Personalized Practice Plan (gợi ý bài dựa trên lỗi)

### Phase 5: Scale (Week 21-24)

- [ ] Mobile App (React Native hoặc Capacitor)
- [ ] Premium Content (IELTS, TOEIC courses)
- [ ] Certificates
- [ ] Subscription billing (Stripe)
- [ ] Community features

---

## 7. Monetization Strategy

### 7.1 Freemium Model

| Feature | Free | Premium ($5-7/tháng) |
|---|---|---|
| Bài học | 5 bài/ngày | Unlimited |
| AI Feedback | 3 lần/ngày | Unlimited |
| Audio speed control | 0.75x - 1.25x | 0.5x - 2x |
| Progress history | 7 ngày | Unlimited |
| Leaderboard | Không | Có |
| Speaking Practice | Không | Có |
| Certificates | Không | Có |
| New lessons | Chậm |优先 |

### 7.2 Revenue Model Options

#### Option A: Monthly/Yearly Subscription

- $5/tháng hoặc $45/năm (tiết kiệm 25%)
- Billing qua Stripe
- Cancel anytime

#### Option B: Lifetime Deal (Launch)

- $49 one-time payment (lifetime access)
- Thu hút early adopters
- Tạo initial revenue

#### Option C: Hybrid

- Free tier: 5 bài/ngày
- Lifetime: $49
- Monthly: $7

**Recommendation: Option C (Hybrid)** — Tối đa hóa conversion với multiple entry points.

### 7.3 Additional Revenue Streams (Phase 4+)

| Nguồn | Tiềm năng | Chi phí triển khai |
|---|---|---|
| Affiliate (coursera, udemy) | $50-200/tháng | Thấp |
| Affiliate (book, dictionary) | $20-50/tháng | Thấp |
| Ads (non-intrusive) | $100-500/tháng | Thấp |
| Sponsored content | $200-1000/tháng | Trung bình |

---

## 8. Metrics & Success Criteria

### 8.1 North Star Metric

**"Số bài dictation hoàn thành mỗi tuần trên mỗi user hoạt động"**

→ Core metric thể hiện giá trị thực của sản phẩm. Nếu user hoàn thành nhiều bài, họ đang học thực sự.

### 8.2 Pirate Metrics (AARRR)

| Metric | Definition | Target (Month 1) | Target (Month 6) |
|---|---|---|---|
| **Acquisition** | User mới đăng ký | 500 | 2,000 |
| **Activation** | User hoàn thành bài đầu tiên | 60% | 70% |
| **Retention** | DAU/MAU ratio | 15% | 25% |
| **Revenue** | Paying users | 5 | 150 |
| **Referral** | K = viral coefficient | 0.3 | 0.8 |

### 8.3 Engagement Metrics

| Metric | Target |
|---|---|
| Avg. lessons/day/user | 3+ |
| Avg. session duration | 10-15 phút |
| Streak rate (7-day) | 30%+ |
| Feature adoption rate | >50% dùng bookmark |

### 8.4 Technical Metrics

| Metric | Target |
|---|---|
| Page load time | < 2s (LCP) |
| Time to interactive | < 3s |
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 95 |
| Error rate | < 0.1% |
| Uptime | > 99.5% |

---

## 9. Risk Analysis

### 9.1 Product Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| User không thấy giá trị sau bài đầu tiên | Cao | Cao | Tối ưu onboarding, hiện "wow moment" ngay. Competitor research: 40% churn xảy ra ngay sau initial enthusiasm. |
| Streak không đủ hấp dẫn | Trung bình | Cao | Thêm streak rewards, streak freeze, streak repair. Duolingo's streak society (100, 365+ days) là benchmark. |
| Progress plateau (user không thấy tiến bộ) | Cao | Cao | AI feedback chi tiết, milestone celebrations, progress chart. BBC không có gì → 0 retention. |
| Monotonous dictation loop | Trung bình | Trung bình | Đa dạng content, multiple topics, spaced repetition. Pain point phổ biến trên dictation platforms. |
| AI feedback chất lượng kém | Thấp | Cao | Test kỹ, human review feedback samples. ELSA Speak set standard cao. |

### 9.2 User Adoption Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Drop-off sau registration | Cao | Cao | Skip signup, immediate practice option |
| Competitor (Duolingo) ra feature tương tự | Trung bình | Trung bình | Tập trung niche: dictation + AI feedback |
| User quen với free rồi không chịu trả tiền | Trung bình | Trung bình | Freemium giới hạn hợp lý, early bird deal |
| Khó khăn onboarding người lớn tuổi | Thấp | Trung bình | Simple UX, big buttons, clear instructions |

### 9.3 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Supabase free tier limit exceeded | Thấp | Trung bình | Monitor usage, optimize queries, có kế hoạch scale |
| AI API costs spike | Trung bình | Trung bình | Cache AI responses, rate limiting, budget alerts |
| SEO không hiệu quả | Trung bình | Trung bình | SEO specialist review, structured data, sitemap |
| Mobile experience kém | Cao | Cao | Mobile-first development, test trên nhiều thiết bị |

### 9.4 Legal & Compliance Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| DailyDictation thay đổi/crawl data | Trung bình | Cao | Đã có data local, backup định kỳ |
| Copyright nội dung audio | Thấp | Cao | Dùng cho mục đích giáo dục (fair use) |
| GDPR/Data privacy | Thấp | Trung bình | Không collect sensitive data, clear privacy policy |

### 9.5 Scalability Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 100+ concurrent users | Thấp | Thấp | Vercel + Supabase scale tốt ở free tier |
| Database query slowdown | Trung bình | Trung bình | Indexing, query optimization |
| AI response time slow | Trung bình | Trung bình | Async processing, queue system |

---

## 10. Competitive Analysis

### 10.1 Competitive Positioning

| Feature | VinaListen | Duolingo | ELSA Speak | DailyDictation | Cake |
|---|---|---|---|---|---|
| **Dictation practice** | ✅ Core | ❌ | ❌ | ✅ Basic | ❌ |
| **AI feedback** | ✅ GPT/Gemini | ✅ | ✅ | ❌ | ✅ |
| **Transcript comparison** | ✅ Advanced | ❌ | N/A | ✅ Basic | N/A |
| **Progress tracking** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Mobile-first** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Free tier** | ✅ Full | ✅ | ✅ Limited | ✅ | ✅ Limited |
| **Vietnamese market** | ✅ Native | ❌ | ✅ | ❌ | ✅ |
| **Offline mode** | ❌ | ✅ | ✅ | ❌ | ✅ |

### 10.2 Competitive Advantage

**VinaListen wins on:**
1. **Dictation focus** — Không có app nào tập trung 100% vào dictation + transcript comparison
2. **AI feedback depth** — Chi tiết hơn Duolingo, Vietnamese-native
3. **Zero cost** — Hoàn toàn miễn phí trong giai đoạn đầu
4. **Data quality** — DailyDictation content đã được verify quality

---

## 11. Go-to-Market Strategy

### 11.1 Launch Plan

#### Soft Launch (Week 1-2)
- Invite 20-50 beta testers từ DriveSmart user base
- Collect feedback, fix bugs
- **Không public announcement**

#### Public Launch (Week 3-4)
- Post lên: Reddit r/languagelearning, Facebook groups (IELTS, TOEIC VN)
- SEO: Index tất cả topic pages
- Launch on ProductHunt hoặc Vietnamese startup community

#### Growth Phase (Month 2-6)
- SEO content: Blog về tips học nghe tiếng Anh
- Referral: Invite 3 friends → 1 tháng premium free
- Community: Discord/Telegram group cho learners
- Influencer: Tiếp cận micro-influencers (5-20k followers) về IELTS/English

### 11.2 Content Marketing

| Content Type | Platform | Frequency | Goal |
|---|---|---|---|
| SEO Articles | Website | 2/tuần | Organic traffic |
| Tips & Tricks | TikTok/YouTube Short | 3/tuần | Brand awareness |
| User testimonials | Twitter/FB | Khi có | Social proof |
| Feature announcements | Blog | 1/tháng | Engagement |

---

## 12. Success Criteria & Exit Conditions

### 12.1 MVP Success Checklist

- [ ] 500 users registered
- [ ] 30% 7-day retention
- [ ] Avg 3 lessons/user/day
- [ ] 0 critical bugs
- [ ] Lighthouse > 90
- [ ] No data breaches

### 12.2 Pivot Conditions

Nếu sau 2 tháng:
- Retention < 10% → Pivot sang app social learning
- Acquisition < 100 users → Rethink positioning/marketing
- NPS < 30 → Rethink UX/product-market fit

### 12.3 Exit / Scale Conditions

Nếu sau 6 tháng:
- MAU > 5,000
- Paying users > 100
- Viral coefficient > 0.5
- Revenue > $1,000/tháng

→ **Raise seed funding hoặc scale organically**

---

## 13. Open Questions

1. **DailyDictation có cho phép sử dụng content không?** Cần check ToS hoặc liên hệ author. Insight: DailyDictation founder accept donations và có PRO app riêng → có thể open-minded về licensing. Nên thử contact trực tiếp.
2. **AI feedback có cần thiết từ đầu không?** Competitor research cho thấy AI personalization là baseline expectation. Có thể bắt đầu với basic scoring, nhưng cần roadmap rõ ràng để thêm AI trong Phase 2.
3. **Nên build mobile app hay web mobile-first?** Khuyến nghị web mobile-first (nhanh hơn 10x). DailyDictation vẫn là web. Cake và ELSA có app nhưng cần nhiều resource hơn.
4. **Branding: "VinaListen" hay tên khác?** Cần user research để chọn. Tham khảo: "ListenUp", "EarCraft", "Dicta", "HearTrue".
5. **Hearts/energy system có nên có không?** Duolingo và Cake dùng hearts → gây frustration. Khuyến nghị: KHÔNG dùng hearts. Dùng streak thay vì energy limit.
6. **Monetization timing?** Duolingo's free tier rất restrictive. BBC hoàn toàn free. Khuyến nghị: Free tier rộng rãi để build trust trước, paywall nhẹ nhàng (unlimited lessons + AI).

---

## 14. Appendix

### 14.1 Competitor Research Insights

*Sau khi nghiên cứu 5 đối thủ chính (DailyDictation, Duolingo, ELSA Speak, Cake, BBC Learning English) và xu hướng thị trường EdTech 2025-2026.*

#### Key Findings

**1. DailyDictation** — Đối thủ trực tiếp nhất
- **Ưu điểm:** 100% miễn phí, focus 100% vào dictation, không cần account
- **Nhược điểm:** Không có AI feedback, không có progress tracking chi tiết, không có gamification, giao diện cũ
- **PRO app:** $2.99/month hoặc $19.99 lifetime (mobile)
- **Bài học:** DailyDictation đã chứng minh concept dictation hoạt động. VinaListen cần thêm AI feedback + progress tracking để differentiate.

**2. Duolingo** — Gold standard về retention
- **Ưu điểm:** Streak system mạnh nhất ngành (9M users có streak 1+ năm), leagues, XP system
- **Nhược điểm:** Free tier rất hạn chế (hearts limit), gamification có thể gây nghiện mà không học thật
- **Churn giảm từ 47% (2020) xuống 28% (2026)** nhờ cải thiện retention mechanics
- **Bài học:** Streak là công cụ retention mạnh nhất. Cần implement từ Phase 1. Loss aversion (sợ mất streak) hiệu quả hơn gain motivation.

**3. ELSA Speak** — AI pronunciation leader
- **Ưu điểm:** Real-time pronunciation scoring bằng AI, mạnh ở thị trường châu Á
- **Nhược điểm:** Giá $8.70-13.33/tháng, tập trung speaking hơn listening
- **Bài học:** Speech AI đang trở thành baseline expectation, không còn là premium feature.

**4. Cake** — Entertainment-led learning
- **Ưu điểm:** K-content (K-drama, K-pop) tạo engagement cực cao, 100M+ downloads
- **Nhược điểm:** Hearts system gây frustration khi hết limit
- **Bài học:** Real-world content (video thực) > synthetic content. DailyDictation content phù hợp vì là real conversations.

**5. BBC Learning English** — Institutional credibility
- **Ưu điểm:** Không paywall, brand uy tín, content chất lượng cao
- **Nhược điểm:** Không có gamification, không có retention mechanism
- **Bài học:** Không gamification = không retention. Cần cân bằng giữa quality content và engagement mechanics.

#### Retention Mechanisms (Effectiveness Ranking)

| Mechanism | Effectiveness | Notes |
|---|---|---|
| Streak (loss aversion) | ⭐⭐⭐⭐⭐ | Mạnh nhất. 1000-day streak gần như không thể rời bỏ. |
| Social competition (leagues) | ⭐⭐⭐⭐ | Duolingo's leagues rất hiệu quả |
| AI personalization | ⭐⭐⭐⭐ | Adaptive difficulty giữ user trong "flow zone" |
| Daily minimum action | ⭐⭐⭐⭐ | 5 phút/ngày đủ duy trì streak |
| Real-world progress feeling | ⭐⭐⭐⭐ | User ở lại khi thấy mình "làm được" điều mới |
| Push notifications (timed) | ⭐⭐⭐ | 11pm reminder trước streak reset hiệu quả |
| Hearts/energy limits | ⭐⭐ | Tạo frustration nhiều hơn engagement |

#### Market Trends 2025-2026

- **Global ELT market:** ~$95B (2026) → $181B (2034)
- **Digital English learning:** $12-16B → $25-31B (2030-2031), CAGR 14-18%
- **AI personalization** đang là baseline expectation
- **Voice AI** đang thay thế human evaluation cho pronunciation
- **Asia-Pacific** là growth engine chính (Vietnam, Indonesia, India)
- **Shift:** Từ "lessons completed" → "can you hold a real conversation"

#### Key Pain Points (User Drop-off)

| Pain Point | % Impact | Mitigation |
|---|---|---|
| Motivation loss sau initial enthusiasm | ~40% | Streak system + quick daily action |
| Progress plateau (không thấy tiến bộ) | ~20% | AI feedback + progress milestones |
| Monotonous repetition | ~15% | Content diversification, multiple topics |
| No speaking output feedback | ~15% | Speaking practice (Phase 3) |
| Isolated skill practice | ~10% | Integrate listening + vocabulary + speaking |

#### Competitive Differentiation Strategy

```
DailyDictation: Free + Dictation + No AI + No gamification
Duolingo:        Freemium + All skills + Gamification + AI (mới)
ELSA Speak:      Pronunciation AI + Speaking
Cake:            Real-world content + Entertainment

VinaListen:      Free + Dictation-focused + AI feedback + Vietnamese-native
                           ↑                            ↑
                    DailyDictation quality     Không có đối thủ nào
                    (audio, transcript,        làm tốt ở thị
                     vocabulary)               trường Việt Nam
```

**Positioning:** "DailyDictation nhưng thông minh hơn" — cùng nội dung chất lượng, thêm AI feedback cá nhân hóa và progress tracking.

### 14.2 Data Model

```
Topic
├── id (uuid)
├── name (string)
├── slug (string)
├── description (text)
├── thumbnail_url (string)
├── total_lessons (int)
├── difficulty (enum: beginner/intermediate/advanced)
├── estimated_minutes_per_lesson (int)
└── created_at (timestamp)

Section
├── id (uuid)
├── topic_id (fk)
├── name (string)
└── order_index (int)

Lesson
├── id (uuid)
├── section_id (fk)
├── name (string)
├── audio_url (string)
├── local_audio_path (string)
├── transcript (text)
├── vocab_level (string)
├── parts_count (int)
├── duration_seconds (int)
└── created_at (timestamp)

UserProgress
├── id (uuid)
├── user_id (fk)
├── lesson_id (fk)
├── accuracy (float)
├── user_transcript (text)
├── is_completed (bool)
├── time_spent_seconds (int)
└── completed_at (timestamp)

User
├── id (uuid)
├── email (string)
├── display_name (string)
├── streak (int)
├── total_lessons_completed (int)
├── avg_accuracy (float)
├── is_premium (bool)
└── created_at (timestamp)
```

### 14.2 Tech Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│  Next.js 15 (App Router) + TypeScript + TailwindCSS │
│  Framer Motion + Lucide React                        │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS
┌─────────────────────┴───────────────────────────────┐
│                  Supabase                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │PostgreSQL│  │  Auth    │  │    Storage       │  │
│  │ (DB)     │  │          │  │  (Audio Files)   │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │ SQL / REST
┌─────────────────────┴───────────────────────────────┐
│                  AI Layer                            │
│  Gemini API (Free tier) → AI Feedback Generation    │
└─────────────────────────────────────────────────────┘
```

### 14.3 Key Assumptions

1. DailyDictation content được phép sử dụng cho mục đích giáo dục cá nhân
2. Gemini API free tier đủ cho MVP (< 15 requests/minute)
3. Supabase free tier đủ cho 500-1,000 MAU
4. Thị trường Việt Nam đủ lớn để sustain 1 founder
5. User chấp nhận web app (không cần native mobile app)
