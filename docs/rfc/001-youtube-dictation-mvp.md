# RFC 001 — YouTube Dictation MVP

Status: **Approved for implementation.**
Owner: Product + Eng.
Target launch: 6 weeks from kickoff.

---

## Goal

Ship a **paste-URL dictation product** that turns any YouTube video into a 5-minute English lesson. Win on activation, not features. Win the first session, not the 30th.

**Single sentence**: paste any YouTube URL, hear 5-second segments, type what you heard, save words that come back. Mobile-first, no signup until the first result.

**What we are NOT building**: a curated content platform, a school product, a community, an AI tutor. Defer all of these.

---

## Success Metrics (90 days post-launch)

| Metric | Target | Why |
|---|---|---|
| Weekly active learners (WAL) | 5,000 | Real PMF signal |
| % paste-URL → first segment played | > 70% | Activation is everything |
| % first segment → session completed | > 50% | If < 50%, the session is broken |
| % session → magic-link signup | > 30% | If < 30%, value isn't clear |
| D7 retention | > 20% | EdTech median is 15% |
| D30 retention | > 8% | We're a tool, not a habit |
| Median sessions / user / week | > 2 | Returning user |
| LTV (90-day cohort) | > $1.50 | Must beat CAC |
| CAC (blended) | < $0.50 | KOL + organic only |

**Anti-metrics** (we will not optimize for): total signups, total sessions, total minutes, XP, social shares.

---

## In Scope (MVP)

1. **Paste-URL entry point** — only entry point. No curated library in MVP.
2. **Caption pipeline** — fetch auto-generated captions via YouTube's public `timedtext` endpoint, or transcribe via Whisper as fallback. Segment into 5-10s chunks. **Text is ephemeral**: never persisted to DB; cached in Redis 24h, scoped to user+session.
3. **Dictation session** — embedded YouTube IFrame, segment-by-segment loop, transcript textarea, hint button, check button, result panel with word-level diff.
4. **"Explain in my language" button** — LLM-powered 2-sentence explanation per segment in EN, VN, ID, ES, PT. **This is the hero feature.**
5. **Magic-link signup** — email only, no passwords. Triggered at the result screen.
6. **Manual vocab save + "review today" list** — no SRS in MVP.
7. **Free tier: 3 sessions/day, unlimited for first 14 days** — no payments in MVP.
8. **Mobile-first responsive** — iPhone SE, iPhone 15, iPad.
9. **Analytics spine** — 10 core events (see API Contract), PostHog, Sentry.
10. **Empty / loading / error states** on every page.

## Out Of Scope (deferred)

Curated seed library • Multiple playlists per user • Streak system • XP / gamification • Daily goal • Email digests • Push notifications • Payments / Stripe • Hint gating • SRS / spaced repetition • Sharing / OG images • Leaderboard • Onboarding wizard • Admin moderation queue • SEO at scale • Browser extension • Mobile share-sheet • DMCA agent • Stripe • Push provider • i18n UI (explanations are i18n; UI is EN+VN only) • B2B / schools • Affiliate program • Sponsored playlists • Multi-region deployment • Community features.

---

## User Journey

```
Landing (no signup)
  → "Paste a YouTube URL" (one input, one button)
    → Loader (5-30s while caption pipeline runs)
      → Dictation session
        → Segment 1: hear 5-10s, type, check, result
        → Segment 2..N: same
      → End-of-session result screen
        → Accuracy ring + word diff + vocab save prompt
        → "Save your progress" → magic-link signup
        → "Try another video" → back to paste-URL
```

**Mobile share-sheet and browser extension are the activation killer features in Phase 2 (week 7-8). MVP is web-only with KOL-driven acquisition.**

---

## API Contract (v1)

```
POST   /api/v1/listening/youtube/imports
       body: { url: string }   headers: Idempotency-Key
       → 202 { job_id, status: "queued" }

GET    /api/v1/listening/youtube/imports/{job_id}
       → 200 { status: "queued|parsing|captioning|ready|failed",
               progress_pct, error_code? }

GET    /api/v1/listening/youtube/lessons/{slug}/segments
       → 200 { segments: [{ order, start_ms, end_ms, text }] }
       (text is session-scoped; not stored long-term)

POST   /api/v1/listening/youtube/lessons/{slug}/segments/{n}/attempts
       body: { typed_text, hints_used, replays_used, duration_ms }
       → 200 { accuracy, correct[], wrong[], missing[], extra[],
               xp_earned, next_segment_url }

GET    /api/v1/vocabulary/me
       → 200 { items: [{ id, lemma, definition, source_lesson_slug }] }

POST   /api/v1/auth/magic-link
       body: { email }   → 202 { sent: true }

GET    /api/v1/auth/verify?token=...
       → 302 → /listening  (sets session cookie)

POST   /api/v1/events                # batched client events
       body: { events: [...] }       → 204

GET    /api/v1/me                    # current user + tier
GET    /api/v1/health                # liveness, readiness
```

**Standard error contract**: `{ error: { code, message, details?, request_id } }`. Status codes: 400 (validation), 401 (auth), 403 (entitlement), 404, 409 (idempotency conflict), 429 (rate limit), 5xx (server). Every error carries `request_id` for support.

**Rate limits**: 5 imports / user / hour; 30 attempts / user / minute; 100 events / user / minute.

**Events (PostHog, versioned, validated)**: `app_session_started`, `app_session_ended`, `landing_viewed`, `url_pasted`, `import_job_started`, `import_job_completed`, `import_job_failed`, `lesson_viewed`, `segment_played`, `segment_typed`, `segment_graded`, `segment_mastered`, `hint_used`, `explain_in_my_language_clicked`, `vocab_saved`, `result_viewed`, `magic_link_sent`, `magic_link_verified`, `paywall_hit`, `kpi_milestone_reached`. Server: `quota_exhausted`, `caption_unavailable`, `embeddability_lost`.

---

## Architecture Decisions

1. **One bounded context** for all listening sources (BBC, YouTube, DailyDictation share the same data model).
2. **Caption text is ephemeral**. Never stored. Redis cache 24h, scoped to user+session. Vocabulary extracted from text is the only thing persisted.
3. **Caption source priority**: public `timedtext` → Whisper transcription → user-pasted fallback. No use of authenticated `captions.list`.
4. **IFrame player state in `useRef + useSyncExternalStore`**, never in Zustand/Redux.
5. **All external I/O is queue-backed**. No inline YouTube/LLM/email calls in request paths.
6. **One `caption_pipeline` worker** handles URL → segments. **One `imports` worker** persists metadata. **One `quota_governor` service** reserves YouTube Data API units before accepting jobs.
7. **Event schema is typed, validated, versioned** (Zod). Unknown events rejected with 400. Client SDK handles batching, dedup, retry.
8. **Postgres with row-level security** on all user-data tables. Defense-in-depth on top of application auth.
9. **Free tier enforced server-side** at the gateway. No client-side checks.
10. **Feature flags** (PostHog) for every new capability. Default 10% rollout.
11. **Stack**: Vite + React + TS + TanStack Query + Zustand; NestJS or Hono API; BullMQ + Redis; Postgres; Cloudflare CDN + R2; Resend (later); PostHog; Sentry; OpenTelemetry.
12. **No DMCA agent in MVP**. No long-term caption storage. No published programmatic SEO. Legal risk is minimal at MVP scale and addressed in Phase 2.

---

## Risks

| Risk | Sev | Mitigation |
|---|---|---|
| Auto-captions unavailable for many videos | High | Whisper fallback (10-30s, $0.02-0.05/video) |
| Whisper cost blowup at scale | High | Hard cap: 3 sessions/day free; 14-day full-access trial; cost alerts at 80% budget |
| YouTube Data API quota exhaustion (10k units/day global) | High | `quota_governor` service with reservation + 429 with `Retry-After` |
| Activation < 10% (paste-URL too hard) | High | Sample lesson on landing; KOL demo video; iterate in week 5 based on 5 user interviews |
| LLM explanation cost blowup | Med | Cache by (lesson_id, language) for 30 days; truncate inputs |
| YouTube IFrame blocked by ad-blockers / privacy tools | Med | Graceful "open in YouTube" fallback; clear error message |
| Creator DMCA / takedown | Med | Ephemeral storage minimizes exposure; attribution on every page; takedown email in week 4 |
| D30 retention < 8% | Med | Phase 2 adds SRS + push + share-sheet — all in plan, not in MVP |

---

## Release Criteria (must all be true to ship)

- 12 Playwright E2E scenarios passing (paste-URL, type-correct, type-wrong, hint, vocab save, refresh, mobile, bad-URL, age-restricted, keyboard-only, error states, magic-link).
- Lighthouse Performance > 90, Accessibility > 95 on landing + lesson + result pages.
- axe-core: 0 critical violations.
- Bundle size < 250KB gzipped on landing; < 400KB on player route.
- 60% test coverage on domain logic (caption pipeline, scoring, vocab extraction, free-tier enforcement, magic-link).
- 50-user beta for 7 days, top 5 issues fixed.
- All 19 client + 3 server events firing and validated end-to-end in PostHog.
- 0 P0/P1 bugs open.
- Cost-per-session measured and projected at 10k/100k MAU.
- Privacy policy, ToS, and contact email live.

---

## Phase Breakdown (6 weeks)

| Week | Owner | Deliverable |
|---|---|---|
| 0 (pre) | Eng + Content | Spike: LLM caption pipeline (TimedText + Whisper) on 10 real videos. **If < 90% accuracy, stop and re-plan.** |
| 0 (pre) | Product | Privacy policy draft; DMCA contact email live; 1 KOL LOI signed. |
| 1 | Eng | Landing page (paste-URL input, loader, error states). |
| 1 | Eng | `listening_lessons` + `listening_segments` schema with ephemeral text model. |
| 2 | Eng | Dictation session UI (player, textarea, hint, check, result). |
| 2 | Eng | Scoring engine (reused from BBC). Pure functions, 95% unit tested. |
| 3 | Eng | "Explain in my language" (LLM-cached). |
| 3 | Eng | Magic-link signup at result screen. |
| 4 | Eng | 10 core events wired + validated in PostHog. |
| 4 | Eng | Mobile responsive + accessibility audit + Lighthouse pass. |
| 5 | Eng | 50-user beta. 5 user interviews. Fix top 5 issues. |
| 5 | Marketing | 1 KOL video recorded + scheduled. |
| 6 | All | Public launch. KOL post. PostHog dashboards live. Phase 2 starts week 7. |

**Phase 2 (weeks 7-10, post-launch)**: mobile share-sheet, browser extension, payment integration ($1.99/mo VN pricing), SRS vocab, push notifications, KOL #2, Phase 1 SEO (50 landing pages).

**Phase 3+**: deferred until 90-day metrics reviewed.
