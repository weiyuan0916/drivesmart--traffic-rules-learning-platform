# Product v2 — YouTube Interactive Dictation Learning

> Status: **Approved revision of the original product spec.**
> Every change is tagged **ADDED**, **MODIFIED**, or **REMOVED** with the reason.
> Focuses on activation, retention, engagement, and commercial viability.

---

## 1. Product positioning

**MODIFIED** — original spec positioned this as a "paste a URL" tool. That positioning is a dead end. The new positioning:

> **DriveSmart YouTube Listening** is the fastest way to **actually hear every word** in any English YouTube video. Start with a hand-picked lesson, or paste your own playlist. Type what you hear, get instant feedback, build a 5-minute-a-day habit.

Three positioning pillars:

1. **Hear it** — segment-by-segment playback at learner-friendly speed.
2. **Type it** — instant, fair grading with word-level feedback.
3. **Keep it** — every new word drops into a smart vocabulary review that comes back to you at the perfect moment.

**Why this matters**: positioning around "paste a URL" makes us look like a tool. Positioning around "actually hear every word" makes us look like a teacher. Teachers retain. Tools get uninstalled.

---

## 2. Target user

**MODIFIED** — original spec had no user definition. Adding explicit personas.

### Primary persona: "Self-directed learner"
- **Age**: 18-34
- **Location**: Vietnam, Indonesia, Brazil, Mexico, Turkey (English-as-second-language mobile-first markets)
- **Device**: Mobile (70%+ of traffic)
- **Pain**: Watches English YouTube videos but misses 30-50% of words; feels stuck at intermediate plateau
- **Trigger**: Watching a podcast, lecture, or movie scene and wanting to actually understand it
- **Success moment**: Completing a 5-minute segment with 90% accuracy, replaying the original video the next day and catching words they used to miss

### Secondary persona: "IELTS / TOEIC candidate"
- **Age**: 16-28
- **Pain**: Needs structured listening practice; bored by textbook audio
- **Trigger**: 60-90 days before exam
- **Success moment**: Hitting a 7.0+ IELTS listening band

### Tertiary persona: "Casual content fan"
- **Age**: 25-45
- **Pain**: Loves English YouTube creators; wants to learn while entertained
- **Trigger**: A favorite creator releases a new video
- **Success moment**: Discovering DriveSmart while watching a creator's video and saving 5 new words

---

## 3. Core user flow

**MODIFIED** — original spec led with paste-URL. New flow inverts the priority: **curated first, paste second**.

```
Landing
  → "Try a lesson now" (no signup, 1 tap)
    → Sample lesson: 60 seconds, 3 segments, embedded on landing page
    → User experiences: listen → type → grade → result
    → Signup prompt ONLY at the result screen ("Save your progress")

Home / Listening hub
  → "Today's lesson" (daily curated pick, 5 segments)
  → "Continue learning" (resume last session)
  → "Browse topics" → category pages (Business, IELTS, Daily Life, Tech, ...)
  → "Import a playlist" (paste URL — secondary, but available)

Lesson
  → Embedded YouTube IFrame (autoplay disabled, captions hidden by default)
  → Segment-by-segment loop (auto-advance)
  → Transcript textarea + hint button + check button
  → Result panel (accuracy, correct/wrong/missing/extra, XP, next button)

End of lesson
  → Result screen: accuracy ring, XP earned, streak status, share button
  → "Save 3 vocab from this lesson" one-tap
  → "Next lesson" CTA
```

**REMOVED** — "Paste URL" is no longer the front door. It is one of three entry points to the listening hub, and it is gated behind a sign-in (free or trial). The first time a user sees the product, they should be **learning**, not configuring.

---

## 4. Feature list by phase

### 4.1 Phase 1 — MVP (8-10 weeks)

**Goal**: prove activation and ship a learning loop. Get 1,000 weekly active learners.

| Feature | Status | Notes |
|---|---|---|
| Embedded YouTube IFrame player | MODIFIED | Reuse existing `SegmentPlayer` |
| Curated seed library (20+ playlists) | **ADDED** | The activation spine; permission-verified or public domain |
| Sample 60-second lesson on landing | **ADDED** | Zero-friction TTFV |
| User-typed transcripts only | MODIFIED | Legal: no stored captions |
| 5 segments/lesson (configurable) | **ADDED** | Tunable per lesson |
| Soft mastery threshold (80%) | **MODIFIED** | Replaces hard "unlock next" gate |
| Vocab save + list (no SRS yet) | UNCHANGED | |
| Free tier, no payments | UNCHANGED | |
| 10 core analytics events | **ADDED** | Foundation for every later decision |
| Landing + onboarding (30s intro, pick a goal) | **ADDED** | Without this, activation dies |
| Mobile + desktop responsive | UNCHANGED | |
| Lighthouse > 90, axe-core clean | **ADDED** | |

**REMOVED for MVP**:
- Hard segment unlock
- Spaced repetition
- Stripe / payments
- Daily email digest
- Streak system
- Push notifications
- Sharing / OG images
- Hint gating (all 3 hints free in MVP)
- Programmatic SEO at scale

### 4.2 Phase 2 — Retention + Monetization (6-8 weeks)

**Goal**: convert free → paid. Achieve 30% D30 retention.

| Feature | Status | Notes |
|---|---|---|
| Streak system + daily 5-min goal | **ADDED** | Timezone-aware |
| Weekly recap email | **ADDED** | |
| Streak-at-risk push notification | **ADDED** | Opt-in only |
| SM-2 spaced repetition for vocab | **ADDED** | Drives D7+ return |
| Stripe subscription + entitlements | **ADDED** | |
| Free tier caps: 5 seg/day, 1 import | **ADDED** | |
| Result screen sharing (OG image) | **ADDED** | Viral loop start |
| Admin moderation queue | **ADDED** | DMCA readiness |
| 100 programmatic SEO landing pages | **ADDED** | Long-tail traffic |
| Hint system: 3 levels, gated | **MODIFIED** | Free gets word count only |
| Vocabulary review queue (push before new content) | **ADDED** | |

### 4.3 Phase 3 — Acquisition + Content (8-10 weeks)

**Goal**: 10,000 MAU. 40% organic traffic share.

| Feature | Status | Notes |
|---|---|---|
| Programmatic SEO at scale: 10,000+ pages | **ADDED** | Topic + playlist + lesson pages |
| Sitemap + structured data audit | **ADDED** | |
| 50+ more seed playlists | **ADDED** | Content is the bottleneck |
| YouTube creator partnership program (3 signed LOIs) | **ADDED** | Long-term legal moat |
| B2B school pilot (5 schools) | **ADDED** | Diversifies revenue |
| Daily lesson push (1 free lesson/day to all users) | **ADDED** | Drives habitual return |
| Per-topic opt-in leaderboard | **ADDED** | Local pride > global shame |
| Bundle size + CDN + edge caching | **ADDED** | |
| Browser + load testing in CI | **ADDED** | |

### 4.4 Phase 4 — Differentiation + Scale (12+ weeks)

**Goal**: 100k MAU. Clear differentiation.

| Feature | Status | Notes |
|---|---|---|
| AI pronunciation feedback | **ADDED** | Mic-based, requires ML pipeline |
| AI tutor for grammar questions on saved vocab | **ADDED** | |
| Mobile native apps (RN or PWA-first) | **ADDED** | |
| Community: study buddies, public vocab lists | **ADDED** | |
| Affiliate program | **ADDED** | |
| Sponsored playlists | **ADDED** | |
| Public API for creators/schools | **ADDED** | |
| Multi-language UI | **ADDED** | |

---

## 5. Activation

**REMOVED** — original spec had no activation strategy. **Activation is the make-or-break metric.**

### 5.1 Time-to-first-value (TTFV) target: < 30 seconds

Every additional second of waiting loses ~5% of users. Targets:

| Step | Target |
|---|---|
| Landing page load | < 1.5s |
| "Try a lesson now" click → first segment plays | < 3s |
| First segment graded | < 1s after submit |
| Signup prompt appears | only at result screen |

### 5.2 Onboarding (30 seconds, 3 screens max)

1. **"Welcome — pick a goal"** (3 large cards: Casual / IELTS / Business)
2. **"Pick a level"** (3 cards: Beginner / Intermediate / Advanced — defaults inferred from onboarding Q1)
3. **"Try a 60-second sample"** → sample lesson plays → result → signup prompt

**ADDED** — the original spec had no onboarding. A 5-screen tutorial would kill activation; a 3-screen "pick + try" is the minimum viable.

### 5.3 Activation events (tracked)

- `sample_lesson_started`
- `sample_lesson_completed`
- `signup_started`
- `signup_completed`
- `first_real_lesson_started` (within 24h of signup = activated)
- `first_segment_mastered` (within 72h of signup = retained)

---

## 6. Retention

**REMOVED** — original spec had no retention loop. **Without retention, the product is a one-time tool.**

### 6.1 Daily 5-minute goal

Every user sets a daily goal at signup (3, 5, or 10 segments). A progress ring on the home screen shows today's progress. Reaching the goal triggers a celebratory animation + XP bonus.

### 6.2 Streak system

- Counts consecutive days with at least 1 segment completed.
- Visible on home screen and profile.
- Streak-at-risk push: 2 hours before user's local midnight, if goal not yet hit.
- **Timezone-aware**: stored per user, not per server.
- **Grace day**: premium feature (1 per month).

### 6.3 Spaced repetition review queue

- SM-2 algorithm: intervals of 1, 3, 7, 30, 90 days.
- Daily review queue: 60% review, 40% new content.
- Surfaces on home screen with a separate progress ring.
- Premium gets unlimited reviews; free gets 10/day.

### 6.4 Weekly recap email (Sunday 8pm local)

- "You mastered 23 segments this week — your best week yet!"
- Top 3 vocab saved
- Suggested next playlist
- One-click "continue" deep link

### 6.5 Retention KPIs (tracked)

- D1, D7, D30 retention by cohort
- Median segments per user per week
- Streak length distribution
- Vocabulary retention rate (reviewed → still known after 30 days)
- Weekly active users / monthly active users (stickiness)

---

## 7. Engagement

**MODIFIED** — engagement is not just a streak counter. It's the texture of the daily session.

### 7.1 Within a session

- Default speed: 0.85x (not 1x — most users need this)
- Auto-advance after 1.5s "Get ready" beat
- Pre-segment context cue: topic, difficulty, 1-line hint
- Replay limit: 5 per segment (prevents XP-cheating, encourages real listening)
- Post-segment: 1-tap "save vocab" for words that appeared
- Session length target: 5-7 minutes (one coffee)

### 7.2 Between sessions

- Home screen: "Today's lesson" (1 curated pick), "Continue" (resume last), "Your review queue" (SRS)
- Push notification: streak reminder (2h before midnight)
- Weekly recap email
- In-app badge for new content in favorite categories

### 7.3 Between users (social, opt-in)

- Per-topic leaderboard (opt-in, not global)
- Share result screen with OG image
- Share streak image
- Vocabulary lists can be public (later phase)

---

## 8. Monetization

**REMOVED** — original spec had no monetization. **A free product is not a business.**

### 8.1 Pricing tiers (validate with users)

| Tier | Price | Features |
|---|---|---|
| Free | $0 | 5 segments/day, 1 imported playlist, word-count hint only, ads |
| Premium monthly | $4.99 | Unlimited segments, no ads, all hint levels, AI feedback, offline |
| Premium annual | $29.99 | Same, 50% off, 1 streak freeze/month, certificate |
| Student | $19.99/year | Same as annual, .edu email verification |
| Teams (B2B) | $9.99/seat/month | 5+ seats, admin dashboard, custom playlists |

### 8.2 Free tier caps (deliberate, not punitive)

- 5 segments/day — enough for a taste, not enough for a session
- 1 imported playlist — encourages trying curated content
- Word-count hint only — first-letter and full reveal are premium
- 10 vocab reviews/day
- Daily 1 free lesson (curated, always available)

### 8.3 Conversion triggers

- Hit daily cap → upgrade prompt
- Hit import cap → upgrade prompt
- Hit review queue cap → upgrade prompt
- Streak at risk (3+ day streak) → "Protect your streak with Premium"
- Result screen: "Get AI pronunciation feedback" (premium only)

### 8.4 Trial

- 14-day premium trial on first signup
- Highest-converting trial length in EdTech
- Cancel anytime, no charge until day 15
- Email sequence: day 1 (welcome), day 3 (feature highlight), day 7 (social proof), day 12 (trial ending)

### 8.5 Revenue mix (12-month target)

- 70% premium subscriptions
- 15% team/school subscriptions
- 10% affiliate (creator merch, language learning products)
- 5% sponsored playlists

---

## 9. Competitive positioning

**REMOVED** — original spec had no competitor analysis. **Without differentiation, we lose.**

### 9.1 Direct competitors

| Competitor | Strength | Our edge |
|---|---|---|
| YouGlish | Free, simple | Better mobile UX, vocab SRS, streak loop |
| Yaku | Free, YouTube-native | Curated seed library, learning progression |
| FluentU | Paid, polished, licensed | Free tier, YouTube is bigger catalog |
| TED-ED | Free, premium content | Open to any YouTube, not just TED |
| Cake | App, short lessons | Our focus is dictation, not just exposure |
| DailyDictation | Existing on our platform | Reuse their content as a YouTube-adjacent catalog |

### 9.2 Our wedge

**"The fastest way to actually hear every word in any YouTube video, on mobile, in 5 minutes a day."**

Three things nobody else has together:
1. **Any YouTube video**, not a curated library only.
2. **Mobile-first dictation** with word-level feedback.
3. **Vocabulary that comes back to you** (SRS), not a static list.

---

## 10. Content strategy

**ADDED** — content is the bottleneck. Without 20+ curated playlists in MVP, activation dies.

### 10.1 MVP seed library (20 playlists)

Categories (5 each):
- **Business**: talks from Y Combinator, a16z, Stratechery
- **IELTS**: official IELTS listening samples, academic lectures
- **Daily Life**: Vox, Vox Explained, cut.com
- **Tech**: TED, keynotes from Apple/Google
- **Health**: kurzgesagt, healthcare explainers

**ADDED** — all 20 must be permission-verified or in the YouTube embeddable public domain. This is non-negotiable for legal safety.

### 10.2 Content ops workflow

1. Content lead identifies 5 candidate videos per week
2. PM checks embeddability, license, audience fit
3. Engineering (or content tool) generates 30-60 segments per video
4. Editor reviews segments for difficulty tag and quality
5. Publish + add to SEO landing pages
6. Track first-30-day performance; promote or retire

### 10.3 Scaling to 1,000 lessons (Phase 3)

- Hire 1 content editor
- Build internal CMS for playlist + segment management
- Add daily new-lesson push notification
- Add "trending" + "fresh" sort orders

---

## 11. SEO strategy

**ADDED** — SEO is the primary acquisition channel for Phase 3+.

### 11.1 Page templates

- **Topic landing page**: `/listening/youtube/topic/[category]` (5 categories)
  - Title: "Best YouTube Videos to Learn [Category] English | DriveSmart"
  - JSON-LD: `CollectionPage` + `ItemList` of `LearningResource`
  - 20-50 playlist cards, filterable

- **Playlist page**: `/listening/youtube/[playlist-slug]`
  - Title: "Learn English with [Playlist Name] — Interactive Dictation"
  - JSON-LD: `LearningResource` + `ItemList` of `VideoObject`
  - 20-100 lesson cards

- **Lesson page**: `/listening/youtube/[playlist-slug]/[video-slug]`
  - Title: "[Video Title] — Dictation Practice | DriveSmart"
  - JSON-LD: `VideoObject` + `LearningResource` + `Quiz`
  - Embedded player + segments list + vocab preview

- **Vocabulary page**: `/vocabulary/[word]`
  - Title: "What does '[word]' mean? — English Listening Examples"
  - JSON-LD: `DefinedTerm`
  - Definition + example sentences + "appears in N lessons" + links back to source

### 11.2 Programmatic SEO

- 10,000+ landing pages achievable with seed library + lesson catalog
- Every lesson page is indexable
- Every vocabulary page is indexable
- Sitemap with `<priority>` based on segment count and traffic

### 11.3 Internal linking

- Topic → playlists → lessons → vocabulary → back to lessons
- Footer: "Popular topics" auto-generated from analytics

---

## 12. Analytics & north star

**ADDED** — explicit metrics.

### 12.1 North Star Metric

**Segments mastered per user per week.**

Combines: activity (more segments), learning (mastery threshold), breadth (variety of topics), and engagement (consistency over the week). Higher = healthier business.

### 12.2 Supporting metrics

| Category | Metric | Target (90 days post-launch) |
|---|---|---|
| Acquisition | Weekly signups | 2,000 |
| Activation | % signup → first segment mastered within 72h | 40% |
| Activation | Median TTFV | < 30s |
| Retention | D7 retention | 25% |
| Retention | D30 retention | 12% |
| Engagement | Segments mastered / WAU / week | 8 |
| Engagement | Streak length median (active users) | 5 days |
| Monetization | Free → paid conversion | 4% |
| Monetization | MRR | $5k by month 6 |
| SEO | Organic traffic share | 40% by month 9 |
| Quality | App-store rating | > 4.5 |
| Quality | NPS | > 40 |

### 12.3 Analytics stack

- PostHog (product analytics, free up to 1M events/month)
- Cloudflare Analytics (traffic)
- Stripe (revenue)
- Sentry (errors)
- Custom `/events` endpoint (in-app events we own)

---

## 13. Risks (product-side)

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Activation < 10% (paste-URL flow too hard) | High | Critical | Lead with curated library; defer paste-URL to Phase 2 |
| YouTube creators disable embed | High | High | Daily re-verify; show "unavailable" gracefully |
| YouTube changes ToS | Medium | Critical | Architecture is already YouTube-independent; pivot to licensed content in 2 weeks |
| Free tier too generous (no conversions) | Medium | High | A/B test caps weekly in Phase 2 |
| Free tier too restrictive (no users) | Medium | High | Start with 5 seg/day, raise to 10 if conversion > 6% |
| Competitor launches similar feature | Medium | Medium | Speed + retention moat |
| Vocabulary retention (SRS) underperforms | Low | Medium | Fall back to manual review queue |
| DMCA takedown | Low | Critical | DMCA agent + moderation queue + ephemeral content policy |
| Creator backlash | Low | High | Partnership program, attribution, optional revenue share |

---

## 14. What changed and why (summary)

| Change | Why |
|---|---|
| Repositioned from "paste URL" to "hear every word" | Paste-URL is a tool; "hear every word" is a teacher |
| Added 3 personas | Without personas, we design for nobody |
| Inverted flow: curated first, paste second | Paste-URL kills activation; curated is the funnel |
| Removed hard segment unlock | Anti-pattern; replaced with soft mastery |
| Added 4-phase roadmap with retention + monetization | Free products are not businesses |
| Added onboarding (3 screens) | Activation requires it |
| Added daily goal + streak + SRS | Retention requires all three |
| Added weekly recap email | Re-engagement lever |
| Added pricing tiers, free caps, trial | Monetization was undefined |
| Added competitive positioning | Without differentiation we lose |
| Added content ops workflow | Content is the bottleneck |
| Added SEO templates | Acquisition was undefined |
| Added north star + supporting metrics | Without metrics, every decision is opinion |
| Added risk register | Surfaces what to watch |

---

## 15. Open questions for the engineering team

1. **Push notification provider**: OneSignal (free) vs Firebase Cloud Messaging (free, more setup) vs web push only.
2. **Email provider**: Resend vs Postmark vs SendGrid. Recommend Resend for developer experience.
3. **Analytics**: PostHog cloud vs self-hosted. Cloud for MVP, self-host at 100k MAU.
4. **CMS for content**: build vs buy. Build in MVP (5 tables, 3 forms), revisit in Phase 3.
5. **Daily lesson push frequency**: 1/day vs 3/week. A/B test in Phase 3.
6. **Trial length**: 14 days vs 7 days vs 30 days. Industry data favors 14.
