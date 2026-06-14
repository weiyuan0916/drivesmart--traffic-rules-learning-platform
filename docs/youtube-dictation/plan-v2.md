# Plan v2 — YouTube Interactive Dictation Learning

> Status: **Approved revision of the original implementation plan.**
> Every change is tagged **ADDED**, **MODIFIED**, or **REMOVED** with the reason.
> No implementation code — this is a sequencing and risk document.

---

## 1. Re-baseline

The original spec treated YouTube dictation as a single feature to build. After the architecture and product reviews, it is now a **4-phase program** with explicit gates between phases. Each phase ends with a measurable outcome and a go/no-go decision.

**REMOVED** — original "ship the whole thing" approach. **MODIFIED** — phased delivery with hard phase gates.

---

## 2. Phase 0 — Foundations (1-2 weeks, before MVP)

**Goal**: remove every blocker that would block every later phase.

| Task | Status | Reason |
|---|---|---|
| Register DMCA agent with US Copyright Office | **ADDED** | Required before any public launch; takes 1-2 weeks to process |
| Set up PostHog (or chosen analytics) | **ADDED** | Events must be live from day 1 of MVP |
| Set up Sentry | **ADDED** | Visibility from day 1 |
| Define `ListeningSource` enum + migrations | **MODIFIED** | One domain, many sources — not separate domains |
| Define event taxonomy in `tracker.ts` | **ADDED** | All later phases depend on the event spine |
| Set up Stripe account in test mode | **ADDED** | Pre-work for Phase 2 |
| Choose + provision push provider (OneSignal or FCM) | **ADDED** | Pre-work for Phase 2 |
| Choose + provision email provider (Resend) | **ADDED** | Pre-work for Phase 2 |
| Content lead hired or contracted | **ADDED** | Content is the bottleneck for Phase 1 |
| 20 seed playlists identified, permission-verified | **ADDED** | Phase 1 launch blocker |

**Risk**: Medium — if content lead is not in place by Phase 1 start, MVP slips.

**Complexity**: Low — mostly setup.

**ROI**: High — every later phase depends on it.

---

## 3. Phase 1 — MVP (8-10 weeks, 1 dev + 1 designer)

**Goal**: prove activation. Get 1,000 weekly active learners. Establish the data foundation.

### 3.1 Must-ship (week-by-week)

| Week | Deliverable | Status | Notes |
|---|---|---|---|
| 1 | Design system tokens confirmed; landing page wireframes | **MODIFIED** | Reuse BBC pattern, no new tokens |
| 1 | `listening_sources` + `listening_lessons` migrations with `source_type` + `license` | **MODIFIED** | Schema foundation |
| 2 | `listening_segments` migrations with `text_ephemeral` + `text_source` | **ADDED** | Legal boundary in the data layer |
| 2 | `segment_attempts` + `daily_user_stats` migrations | **ADDED** | Event-sourced foundation |
| 3 | TanStack Query hooks for sources, lessons, segments | **MODIFIED** | Mirror BBC `bbcApi` |
| 3 | YouTube URL parsing library (15+ URL formats) | **ADDED** | Heavy unit-test coverage required |
| 4 | `SegmentPlayer` configured for YouTube IFrame API | **MODIFIED** | Reuse existing component |
| 4 | `DictationInput` with 3-tier hint system (free in MVP) | **MODIFIED** | Reuse BBC component |
| 5 | Landing page with sample 60-second lesson | **ADDED** | Activation spine |
| 5 | Onboarding (3 screens: goal, level, sample) | **ADDED** | Activation spine |
| 6 | Lesson list page (curated seed library, 20 playlists) | **ADDED** | The funnel |
| 6 | Lesson detail page (player + segments) | **MODIFIED** | Reuse `BbcLessonDetailPage` shape |
| 7 | Segment grading pipeline (reuse BBC scoring) | **MODIFIED** | Pure-function scoring, no API changes |
| 7 | Result panel + completion screen | **MODIFIED** | Reuse `LessonResultsSummary` |
| 8 | Event tracking: 10 core events wired up | **ADDED** | Spine of every later decision |
| 8 | Empty / loading / error states on all pages | **ADDED** | Production quality |
| 9 | Accessibility audit + fixes (axe-core, keyboard, screen reader) | **ADDED** | Required for WCAG AA |
| 9 | Performance pass (Lighthouse > 90, bundle < 250KB) | **ADDED** | Budget enforced in CI |
| 10 | Beta with 50 users; fix top 5 issues | **ADDED** | Real-user signal |
| 10 | Phase 1 retro + Phase 2 go/no-go decision | **ADDED** | Hard gate |

### 3.2 Out of scope for Phase 1 (deferred)

**REMOVED** from MVP:
- Stripe / payments
- Streak system
- SRS / spaced repetition
- Daily goal
- Email digests
- Push notifications
- Sharing / OG images
- Hint gating (all 3 hints free in MVP)
- Programmatic SEO at scale
- Admin moderation queue (manual email process for now)
- YouTube paste-URL import (curated only in MVP)

### 3.3 Risk register (Phase 1)

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Activation < 10% because sample lesson is weak | High | Critical | Beta test by week 8; iterate before public launch |
| YouTube embeddability changes mid-build | Medium | High | `last_verified_at` column + daily cron (can be manual in MVP) |
| Bundle size exceeds 250KB | Medium | Medium | Code-split player route; lazy-load IFrame |
| Accessibility violations block launch | Medium | High | axe-core in CI from week 9 |
| Content lead slips → < 20 playlists ready | High | Critical | 4-week buffer; minimum 12 to launch |
| Scoring algorithm regressions | Low | High | Mutation testing on scoring engine |
| 50% of beta users churn after first session | Medium | High | 5 user interviews in week 9 |

### 3.4 Success criteria (Phase 1 go/no-go gate)

- 1,000 WAU within 60 days of public launch
- Activation rate (signup → first segment mastered within 72h) > 30%
- Median TTFV < 30s
- Lighthouse Performance > 90, Accessibility > 95
- Zero P0 bugs
- 0 critical DMCA / ToS issues in first 30 days
- 80%+ test coverage on domain logic
- All 12 Playwright scenarios passing

**If any criterion fails, do not start Phase 2. Fix and re-evaluate in 2 weeks.**

### 3.5 Complexity / ROI

- **Complexity**: Medium — mostly reuse + integration.
- **ROI**: High — sets the data foundation for every later phase.

---

## 4. Phase 2 — Retention + Monetization (6-8 weeks, 1 dev)

**Goal**: convert free → paid. Achieve 30% D30 retention.

**Pre-condition**: Phase 1 success criteria met.

### 4.1 Must-ship (week-by-week)

| Week | Deliverable | Status | Notes |
|---|---|---|---|
| 1 | Streak system (timezone-aware, server-validated) | **ADDED** | Daily + longest streak |
| 1 | Daily 5-min goal + progress ring on home | **ADDED** | |
| 2 | SM-2 spaced repetition for vocab | **ADDED** | Standard algorithm; heavy unit tests |
| 2 | Vocabulary review queue (60/40 with new) | **ADDED** | |
| 3 | Stripe subscription + entitlements | **ADDED** | Free / monthly / annual / student |
| 3 | Free tier caps (5 seg/day, 1 import) | **ADDED** | |
| 4 | Paywall triggers (cap hit, hint gate, AI upsell) | **ADDED** | |
| 4 | 14-day trial + email sequence | **ADDED** | Resend |
| 5 | Weekly recap email | **ADDED** | |
| 5 | Streak-at-risk push notification | **ADDED** | OneSignal or FCM |
| 6 | Hint gating (free = word count, premium = 3 levels) | **MODIFIED** | Was free in MVP |
| 6 | Result screen share button + OG image | **ADDED** | First viral loop |
| 7 | Admin moderation queue (basic) | **ADDED** | DMCA readiness |
| 7 | 100 programmatic SEO landing pages | **ADDED** | Categories × difficulty |
| 8 | Beta with paying users; fix top 5 issues | **ADDED** | |
| 8 | Phase 2 retro + Phase 3 go/no-go | **ADDED** | Hard gate |

### 4.2 Out of scope for Phase 2

**REMOVED** from Phase 2:
- AI pronunciation feedback
- Mobile native apps
- B2B school dashboard
- Affiliate program
- Sponsored playlists
- Community features (comments, buddies, public lists)

### 4.3 Risk register (Phase 2)

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Free → paid conversion < 2% | Medium | Critical | A/B test caps and trial length; 3 iterations minimum |
| Stripe webhook failures cause entitlement drift | Medium | High | Idempotent handlers; reconciliation job; manual override tool |
| D30 retention < 15% (SRS not sticky enough) | Medium | High | User interviews at day 14; iterate on notification cadence |
| Email deliverability < 95% | Low | Medium | SPF + DKIM + DMARC; Resend's deliverability tooling |
| Push notification opt-in rate < 20% | High | Medium | Make opt-in a value moment, not a settings page |
| Hint gating causes rage-quit | Medium | High | Track hint usage; allow 1 free first-letter hint/day |

### 4.4 Success criteria (Phase 2 go/no-go)

- Free → paid conversion > 4% (industry median for EdTech is 2-5%)
- D7 retention > 25%, D30 > 12%
- MRR > $5k by end of Phase 2
- Stripe churn < 8% monthly
- 0 critical billing bugs
- Organic traffic > 5% (SEO pages are indexed)
- All 25 Playwright scenarios passing

### 4.5 Complexity / ROI

- **Complexity**: Medium-High — Stripe + emails + push + SRS is a lot of surface area.
- **ROI**: Very High — this is where revenue starts.

---

## 5. Phase 3 — Acquisition + Content (8-10 weeks, 1 dev + 1 content)

**Goal**: 10,000 MAU. 40% organic traffic share.

**Pre-condition**: Phase 2 success criteria met.

### 5.1 Must-ship

| Deliverable | Status | Notes |
|---|---|---|
| 50+ additional seed playlists | **ADDED** | Content is the bottleneck |
| 10,000+ programmatic SEO pages | **MODIFIED** | Scale from 100 to 10,000 |
| Sitemap + structured data audit + monitoring | **ADDED** | |
| 3 YouTube creator partnership LOIs signed | **ADDED** | Long-term legal moat |
| B2B school pilot (5 schools, manual onboarding) | **ADDED** | Validates B2B pricing |
| Daily lesson push (1 free curated lesson/day) | **ADDED** | Drives habitual return |
| Per-topic opt-in leaderboard | **ADDED** | |
| Internal CMS for content team | **ADDED** | Decouples content from engineering |
| Bundle size + CDN + edge caching | **ADDED** | |
| Browser matrix + load testing in CI | **ADDED** | |
| SLO dashboards + alerting | **ADDED** | |
| First chaos test (IFrame `onError` simulation) | **ADDED** | |

### 5.2 Risk register (Phase 3)

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| SEO pages not indexing (canonical issues) | Medium | High | Google Search Console monitoring; canonical audits |
| Content team can't keep up (1 editor for 50 playlists) | High | Medium | Hire 1 more; tooling to speed up segmentation |
| B2B pilot fails (schools don't renew) | Medium | High | Manual onboarding to start; learn before scaling |
| Organic traffic share plateaus at 20% | Medium | Medium | Investigate SERP competitors; double down on long-tail |
| YouTube embeddability drops for > 5% of catalog | Medium | High | Re-verification cron; graceful degradation |

### 5.3 Success criteria (Phase 3 go/no-go)

- 10,000 MAU
- Organic traffic share > 40%
- MRR > $20k
- B2B pilot: 3+ schools renewed for second term
- Catalog: 70+ playlists, 1,000+ lessons, 0% stale
- D30 retention > 15%

### 5.4 Complexity / ROI

- **Complexity**: Medium-High — content is the bottleneck, not code.
- **ROI**: High over 6-12 months — SEO compounds.

---

## 6. Phase 4 — Differentiation + Scale (12+ weeks, 2 devs + 1 ML)

**Goal**: 100k MAU. Clear differentiation from competitors.

**Pre-condition**: Phase 3 success criteria met. Budget for ML engineer approved.

### 6.1 Must-ship

| Deliverable | Status | Notes |
|---|---|---|
| AI pronunciation feedback (mic-based) | **ADDED** | Highest differentiation; highest risk |
| AI tutor for grammar on saved vocab | **ADDED** | |
| PWA-first mobile experience | **ADDED** | Bridge to native apps |
| Community: study buddies, public vocab lists | **ADDED** | |
| Affiliate program (creator merch, lang products) | **ADDED** | |
| Sponsored playlists (3 signed brand deals) | **ADDED** | |
| Public API for creators/schools | **ADDED** | |
| Multi-language UI (VN, EN, ES, ID, PT) | **ADDED** | |

### 6.2 Risk register (Phase 4)

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| AI pronunciation accuracy < 70% | High | High | Beta with 200 users; ship as "beta" for 90 days |
| AI costs blow up (> $0.10/user/month) | High | High | Aggressive caching; LLM router with fallbacks |
| Community features attract bad actors | High | High | Heavy moderation; opt-in only; small initial groups |
| Native apps rejected by stores | Low | Medium | PWA-first; native is later iteration |
| Affiliate program cannibalizes direct revenue | Low | Medium | Track and cap |

### 6.3 Success criteria

- 100k MAU
- AI pronunciation NPS > 50
- Affiliate revenue > 5% of total
- Mobile (PWA) DAU/MAU > 50%
- Multi-language: 30% of MAU from non-English UI

### 6.4 Complexity / ROI

- **Complexity**: High — ML pipeline + community + i18n.
- **ROI**: Compounding — this is the moat phase.

---

## 7. Cross-phase workstreams

These are continuous, not phase-bound.

### 7.1 Security & compliance (always-on)
- Weekly dependency audit (Snyk or npm audit)
- Monthly OWASP ZAP scan
- Quarterly penetration test
- GDPR data export + delete endpoints (live from Phase 1)
- DMCA agent + takedown process (live from Phase 1)
- Annual security review

### 7.2 Performance (always-on)
- Lighthouse CI on every PR
- Bundle size budget enforced in CI
- Real User Monitoring (RUM) for Core Web Vitals
- Monthly performance review

### 7.3 Quality (always-on)
- 80%+ test coverage on domain logic (gating in CI)
- 12 Playwright scenarios in MVP, growing to 25 by Phase 3
- Accessibility audit every release
- Chaos test rotation (monthly from Phase 2)

### 7.4 Content (continuous)
- 1 content lead from Phase 0
- 1 additional editor from Phase 3
- Weekly content review meeting
- Quarterly content audit (retire underperforming, refresh)

### 7.5 Analytics (always-on)
- Weekly metrics review
- Monthly cohort retention analysis
- Quarterly north star review
- A/B testing framework (PostHog) live from Phase 1

---

## 8. Team & budget (12-month)

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---|---|---|---|---|
| Frontend engineer | 1 | 1 | 1 | 1 |
| Backend engineer | 0.5 (shared) | 0.5 | 1 | 1 |
| Designer | 1 | 0.5 | 0.5 | 0.5 |
| Content lead | 1 | 1 | 1 | 1 |
| Content editor | 0 | 0 | 1 | 2 |
| ML engineer | 0 | 0 | 0 | 1 |
| PM | 0.5 (shared) | 0.5 | 0.5 | 0.5 |
| QA | 0.25 (shared) | 0.5 | 0.5 | 1 |
| **FTE total** | **~4.25** | **~4** | **~5.5** | **~8** |

Infrastructure (monthly, 12-month average):
- Phase 1: ~$300-650/month
- Phase 2: ~$500-1000/month (adds Stripe, Resend, push)
- Phase 3: ~$1500-3000/month (scale, CDN, monitoring)
- Phase 4: ~$5000-10000/month (ML inference, multi-region)

---

## 9. Decisions log (for future reference)

| Date | Decision | Rationale |
|---|---|---|
| | Lead with curated library, not paste-URL | Activation requires it; paste-URL is a Phase 2 feature |
| | Do not store YouTube captions | YouTube ToS + legal risk |
| | Reuse BBC listening module | Architectural consistency, faster shipping |
| | One bounded context, many source types | Simpler architecture, no duplication |
| | Event tracking from day 1 | Foundation for every later decision |
| | Stripe + 14-day trial | Industry-standard EdTech conversion model |
| | SM-2 for vocabulary | Battle-tested, simple, no ML needed |
| | Free tier: 5 seg/day | Tunable, not punitive, enough for a taste |
| | Lead with VN/EN UI, defer i18n to Phase 4 | Match primary market |
| | DMCA agent registered in Phase 0 | Required before public launch |

---

## 10. What changed from the original plan

| Change | Why |
|---|---|
| Broke the single feature into 4 phases with hard gates | Prevents shipping too much too fast; allows data-driven pivots |
| Added Phase 0 (Foundations) | Several prerequisites (DMCA, analytics, content) block every later phase |
| Removed "ship everything" approach | Free products are not businesses; retention + monetization is half the work |
| Removed hard segment unlock | Anti-pattern; replaced with soft mastery threshold |
| Added explicit success criteria per phase | "Done" requires measurable outcomes, not features checked off |
| Added risk registers per phase | Surfaces what to watch before it becomes a problem |
| Added cross-phase workstreams | Security, performance, content, analytics are continuous, not phase-bound |
| Added team & budget model | Without this, the plan is wishful thinking |
| Added decisions log | Future team members (and future us) can trace why we did what we did |

---

## 11. Immediate next actions (this week)

1. **Confirm content lead is hired or contracted** — Phase 1 launch blocker.
2. **Register DMCA agent** — non-negotiable, takes 1-2 weeks.
3. **Set up PostHog** — 1 day, must be live before any user-facing work.
4. **Define `ListeningSource` enum + write first migration** — architectural foundation.
5. **Start content sourcing** — identify and permission-verify 20 seed playlists.
6. **Write the Phase 1 detailed design doc** — wireframes, component tree, API contracts.
7. **Schedule beta** — 50 users, 2 weeks before public launch.
