# Testing Strategy — VinaListen (Laravel + React/Vite/TS/Zustand)

Owner: QA + Eng. Updated per release. Reviewed monthly.

---

## 0. Stack Snapshot (actual)

| Layer | Stack | Runner | Config |
|---|---|---|---|
| Backend (Laravel 13 / PHP 8.3) | PHPUnit 12, Mockery, SQLite `:memory:` in test env | `backend/phpunit.xml` |
| Frontend (React 19 + Vite + TS + Zustand) | Vitest 2 + RTL 16 + happy-dom or jsdom | `vitest.config.ts` |
| E2E (full stack) | Playwright 1.60 | `playwright.config.ts` |
| API contract | Schemathesis (Laravel HTTP) | optional, add in Phase 2 |
| Mutation (frontend) | Stryker 8 | `stryker.config.mjs` (new) |
| Visual | Playwright `toHaveScreenshot()` | gated, no Chromatic in MVP |
| Load | k6 0.50 | `tests/load/*.js` |
| A11y | `@axe-core/playwright` | integrated in E2E |

No BrowserStack / Sauce in MVP. Add in Phase 3 with KOL-funded budget.

---

## 1. Folder Tree

```
drivesmart--traffic-rules-learning-platform/
├── backend/
│   ├── app/
│   │   ├── Domain/                       # pure PHP, no Laravel
│   │   │   ├── Listening/
│   │   │   │   ├── Scoring/
│   │   │   │   │   ├── GradeTranscript.php
│   │   │   │   │   ├── Normalize.php
│   │   │   │   │   └── Levenshtein.php
│   │   │   │   ├── Caption/
│   │   │   │   │   ├── SegmentCaptions.php
│   │   │   │   │   └── ParseTimedText.php
│   │   │   │   └── FreeTier/
│   │   │   │       └── EnforceDailyLimit.php
│   │   │   └── Vocabulary/
│   │   │       └── ExtractFromTranscript.php
│   │   ├── Http/Controllers/Api/V1/     # thin: input → domain → response
│   │   └── ...
│   └── tests/
│       ├── Unit/
│       │   ├── Domain/                   # mirrors app/Domain
│       │   │   ├── Listening/Scoring/...
│       │   │   ├── Listening/Caption/...
│       │   │   └── Vocabulary/...
│       │   └── Support/
│       │       └── TestDoubles/
│       │           ├── FakeYouTubeClient.php
│       │           └── FakeWhisperClient.php
│       └── Feature/                      # = integration (Laravel-speak)
│           ├── Listening/
│           │   ├── YoutubeImportsTest.php
│           │   ├── YoutubeSegmentsTest.php
│           │   ├── YoutubeAttemptsTest.php
│           │   ├── FreeTierEnforcementTest.php
│           │   └── QuotaGovernorTest.php
│           ├── Auth/MagicLinkTest.php
│           ├── ApiErrorContractTest.php
│           └── SqlInjectionTest.php
│
├── src/
│   └── features/listening/
│       ├── lib/
│       │   ├── scoring/{grade.ts, normalize.ts, levenshtein.ts, *.test.ts}
│       │   ├── youtube/{urlParser.ts, captionPipeline.ts, *.test.ts}
│       │   ├── tracker.ts, events.ts
│       │   └── stateMachine/             # segment state machine
│       ├── stores/
│       │   └── youtubeStore.ts, youtubeStore.test.ts
│       └── pages/youtube/
│           ├── YoutubeLandingPage.tsx, *.test.tsx
│           ├── YoutubeDictationPage.tsx, *.test.tsx
│           ├── YoutubeResultPage.tsx, *.test.tsx
│           └── components/*.test.tsx
│
├── tests/
│   ├── unit/                             # cross-cutting, mostly pure
│   │   ├── scoring.test.ts
│   │   ├── urlParser.test.ts
│   │   ├── events.test.ts
│   │   └── freeTier.test.ts
│   ├── integration/                      # RTL with mocked API client
│   │   ├── pasteUrlToDictation.test.tsx
│   │   ├── resultFlow.test.tsx
│   │   ├── authFlow.test.tsx
│   │   └── eventTracking.test.tsx
│   ├── e2e/
│   │   ├── 01-landing.spec.ts
│   │   ├── 02-dictation-happy-path.spec.ts
│   │   ├── 03-dictation-error-states.spec.ts
│   │   ├── 04-magic-link-signup.spec.ts
│   │   ├── 05-free-tier-cap.spec.ts
│   │   ├── 06-beginner-journey.spec.ts
│   │   ├── 07-returning-user.spec.ts
│   │   ├── 08-mobile-iphone15.spec.ts
│   │   ├── 09-mobile-galaxys24.spec.ts
│   │   ├── 10-slow-network-3g.spec.ts
│   │   ├── 11-keyboard-only.spec.ts
│   │   ├── 12-tablet-ipad.spec.ts
│   │   ├── 13-a11y-landing.spec.ts
│   │   ├── 14-a11y-dictation.spec.ts
│   │   ├── 15-a11y-result.spec.ts
│   │   ├── 16-visual-regression.spec.ts
│   │   └── 17-cross-browser.spec.ts
│   ├── load/
│   │   ├── import-spike.js
│   │   ├── attempt-grading.js
│   │   └── mixed-workload.js
│   └── fixtures/
│       ├── youtube/
│       │   ├── videos/                   # tiny mp4 + VTT samples
│       │   └── json/                     # canned API responses
│       └── users/                        # 5 pre-seeded test users
│
├── stryker.config.mjs
├── playwright.config.ts
├── vitest.config.ts
└── .github/workflows/
    ├── ci-backend.yml
    ├── ci-frontend.yml
    ├── ci-e2e.yml
    └── ci-load.yml
```

---

## 2. Test Pyramid & Coverage Targets

```
                ┌────────┐
                │  E2E   │  ~30 scenarios    (slow, brittle, expensive)
                ├────────┤
                │ Integ. │  ~40 cases        (medium)
                ├────────┤
                │  Unit  │  ~600 cases       (fast, cheap, broad)
                └────────┘
```

| Layer | Tool | Coverage target | Gate |
|---|---|---|---|
| Backend Domain (PHP) | PHPUnit | 95% line, 90% branch | build fails < target |
| Backend Feature (Laravel HTTP) | PHPUnit | 85% line | build fails < target |
| Frontend lib/ (pure) | Vitest | 95% line | build fails < target |
| Frontend components/ | Vitest + RTL | 80% line | warn only |
| Frontend pages/ | Vitest + RTL | 70% line | warn only |
| E2E | Playwright | 12 core scenarios | 100% pass required to merge |
| A11y | axe-core | 0 critical, 0 serious on core pages | 100% pass required |
| Visual | Playwright snapshot | 6 main pages | diff > 0.1% blocks merge |
| Load | k6 | p95 < 300ms @ 200 RPS | weekly report |
| Mutation (scoring only) | Stryker | 70% kill rate | score below 60% blocks merge |

**Mutation testing scope (MVP)**: only `src/features/listening/lib/scoring/*` and `backend/app/Domain/Listening/Scoring/*`. These are the highest-stakes algorithms. Expand to caption pipeline in Phase 2.

---

## 3. Personas — The 5 Real Users We Test As

| Persona | Behavior | Tests where they appear |
|---|---|---|
| **Beginner (An, 22, Vietnam)** | First session, no account, no context. Pastes a video URL. Needs every error message to be helpful. | 01, 02, 06, 09, 10, 11, 13 |
| **Returning (Linh, 28, Vietnam)** | Logged in, has 3 days of history, expects resume-mid-session and progress visible. | 02, 04, 07, 14 |
| **Mobile (Mai, 35, Vietnam, on phone)** | iPhone 15 / Galaxy S24. Touch only, 4G, small viewport. Critical path: paste URL, type, see result. | 02, 03, 05, 08, 09 |
| **Slow network (Huy, 40, Vietnam, on rural 3G)** | 1.6 Mbps down, 750ms RTT. 30s page load is acceptable. Player may buffer. | 10, 02, 05 |
| **Keyboard only (Khoa, 25, screen reader user)** | No mouse, no touch. Tab + Space + Enter. SR announces segment transitions. | 11, 13, 14, 15 |

Each persona gets a **named test file** so it's clear who we are testing as.

---

## 4. Unit Tests

### 4.1 Backend Domain (PHPUnit) — `backend/tests/Unit/Domain/`

**Why unit first**: domain classes are pure PHP, no Laravel facades, no DB, no HTTP. Cheap to run, exhaustive to cover.

#### `backend/tests/Unit/Domain/Listening/Scoring/NormalizeTest.php`
- `test_lowercases_input`
- `test_strips_punctuation_except_apostrophe`
- `test_collapses_whitespace`
- `test_expands_contraction_im_to_i_am`
- `test_expands_contraction_dont_to_do_not`
- `test_preserves_unicode_vietnamese_diacritics_in_user_input_but_strips_in_ground_truth`
- `test_handles_empty_string`
- `test_handles_whitespace_only_string`
- `test_handles_single_character`
- `test_idempotent_when_run_twice`

**Success criteria**: 10/10 pass, 100% line coverage on `Normalize.php`. Pure function, no side effects.
**Failure example**:
```
FAILED NormalizeTest::test_expands_contraction_im_to_i_am
Expected: "i am learning"
Actual:   "i'm learning"
Diff: "i[m]" vs "i[ ]am"
```

#### `backend/tests/Unit/Domain/Listening/Scoring/GradeTranscriptTest.php`
- `test_perfect_match_returns_100_percent`
- `test_empty_user_input_returns_0_percent`
- `test_extra_word_in_user_input_marked_as_extra`
- `test_missing_word_marked_as_missing`
- `test_wrong_word_marked_as_wrong`
- `test_capitalization_difference_counted_as_correct`
- `test_trailing_punctuation_difference_counted_as_correct`
- `test_repeated_word_in_ground_truth_counted_correctly_when_user_omits_one`
- `test_long_transcript_500_words_completes_under_50ms`
- `test_returns_correct_wrong_missing_extra_arrays_in_order`
- `test_accuracy_calculation_rounds_half_up`
- `test_handles_unicode_vietnamese_words_in_ground_truth`
- `test_whitespace_only_user_input_does_not_throw`

**Success criteria**: 13/13 pass, 100% line + branch coverage, 0 PHPUnit warnings.
**Failure example**:
```
FAILED GradeTranscriptTest::test_missing_word_marked_as_missing
Expected: missing = ["quick"]
Actual:   missing = []
```

#### `backend/tests/Unit/Domain/Listening/Scoring/LevenshteinTest.php`
- `test_identical_strings_distance_zero`
- `test_one_substitution_distance_one`
- `test_one_insertion_distance_one`
- `test_one_deletion_distance_one`
- `test_empty_string_distance_equals_length_of_other`
- `test_max_length_500_completes_under_10ms`
- `test_unicode_safe`

**Success criteria**: 7/7 pass, ≤ 10ms for 500 chars.

#### `backend/tests/Unit/Domain/Listening/Caption/ParseTimedTextTest.php`
- `test_parses_vtt_format`
- `test_parses_srt_format`
- `test_returns_segments_with_start_ms_end_ms_text`
- `test_handles_multiline_cue`
- `test_handles_html_stripping_in_cue_text`
- `test_handles_empty_input_returns_empty_array`
- `test_handles_malformed_input_does_not_throw`
- `test_drops_cues_with_zero_duration`

**Success criteria**: 8/8 pass. Pure function.

#### `backend/tests/Unit/Domain/Listening/Caption/SegmentCaptionsTest.php`
- `test_segments_never_shorter_than_3000ms`
- `test_segments_never_longer_than_10000ms`
- `test_segments_split_on_sentence_boundary_when_under_max`
- `test_merges_short_segments_with_next`
- `test_handles_single_caption_longer_than_max`
- `test_returns_segments_in_chronological_order`
- `test_difficulty_estimated_from_word_density`

**Success criteria**: 7/7 pass, pure function.

#### `backend/tests/Unit/Domain/Listening/FreeTier/EnforceDailyLimitTest.php`
- `test_third_session_today_allowed_for_free_user`
- `test_fourth_session_today_throws_quota_exceeded_for_free_user`
- `test_trial_user_unlimited_for_14_days_from_signup`
- `test_premium_user_unlimited`
- `test_quota_resets_at_user_local_midnight_not_utc`
- `test_idempotent_count_under_concurrent_calls`

**Success criteria**: 6/6 pass. Fake clock injected, no real `time()`.

#### `backend/tests/Unit/Domain/Vocabulary/ExtractFromTranscriptTest.php`
- `test_extracts_only_words_above_cefr_threshold`
- `test_dedupes_case_insensitively`
- `test_strips_punctuation_before_checking`
- `test_caps_at_5_words_per_segment`
- `test_returns_empty_for_short_text`

**Success criteria**: 5/5 pass.

### 4.2 Frontend lib (Vitest) — `src/features/listening/lib/`

#### `src/features/listening/lib/scoring/grade.test.ts`
- `perfect_match_returns_accuracy_one`
- `empty_input_returns_accuracy_zero`
- `extra_word_marked_as_extra`
- `missing_word_marked_as_missing`
- `wrong_word_marked_as_wrong`
- `capitalization_does_not_count_as_wrong`
- `contraction_im_vs_i_am_counted_as_wrong_by_default`
- `repeated_word_handled_correctly`
- `unicode_vietnamese_supported`
- `handles_input_with_only_punctuation`
- `runs_under_50ms_for_500_words`
- `returns_consistent_results_for_same_input` (idempotent)

**Success criteria**: 12/12 pass, 100% line coverage on `grade.ts`.

#### `src/features/listening/lib/youtube/urlParser.test.ts`
- `parses_standard_watch_url`
- `parses_short_url`
- `parses_embed_url`
- `parses_shorts_url`
- `parses_mobile_url`
- `parses_url_with_start_time`
- `parses_url_with_playlist_orphan`
- `parses_playlist_url_only`
- `rejects_channel_url`
- `rejects_empty_string`
- `rejects_garbage_input`
- `rejects_non_youtube_url`
- `returns_kind_video_for_video`
- `returns_kind_playlist_for_playlist`
- `extracts_correct_video_id_length_11`

**Success criteria**: 15/15 pass.

#### `src/features/listening/lib/youtube/captionPipeline.test.ts`
- `uses_timed_text_when_available`
- `falls_back_to_whisper_on_404`
- `returns_failed_when_both_sources_fail`
- `passes_timeout_to_whisper`
- `records_cost_on_whisper_path`
- `passes_language_preference`

**Success criteria**: 6/6 pass. Injected fake clients.

#### `src/features/listening/lib/tracker.test.ts`
- `flushes_after_5_seconds`
- `flushes_on_visibility_change_hidden`
- `flushes_on_page_unload`
- `batches_multiple_events`
- `dedupes_identical_events_within_10_seconds`
- `rejects_unknown_event_names`
- `replays_failed_batches_with_backoff`
- `does_not_block_render`
- `preserves_event_order`

**Success criteria**: 9/9 pass, with `vi.useFakeTimers()`.

#### `src/features/listening/lib/events.test.ts`
- `validates_segment_typed_event_against_schema`
- `rejects_segment_typed_with_accuracy_above_one`
- `rejects_unknown_event_name`
- `versioned_events_round_trip_correctly`

**Success criteria**: 4/4 pass. Zod schema is the source of truth.

#### `src/features/listening/lib/stateMachine/segmentMachine.test.ts`
- `initial_state_is_idle`
- `play_transitions_to_playing`
- `pause_transitions_to_paused`
- `typed_transitions_to_input_filled`
- `check_transitions_to_graded`
- `next_transitions_to_idle_with_next_segment`
- `cannot_check_when_in_idle`
- `cannot_next_when_not_graded`
- `reset_returns_to_idle_from_any_state`

**Success criteria**: 9/9 pass. Pure reducer, no React.

#### `src/features/listening/stores/youtubeStore.test.ts`
- `init_session_resets_attempts_array`
- `set_current_segment_increments_index`
- `submit_attempt_appends_to_attempts`
- `reset_session_clears_all_state`
- `persists_to_localstorage_when_persist_enabled`
- `restores_from_localstorage_on_init`
- `does_not_persist_ephemeral_fields`
- `concurrent_updates_lose_nothing`

**Success criteria**: 8/8 pass. Zustand `act()` + happy-dom.

### 4.3 Unit Coverage Gates (per PR)

```bash
# Backend
cd backend && vendor/bin/pest --coverage --min=95 --min-methods=95

# Frontend
npx vitest run --coverage --coverage.thresholds.lines=95 --coverage.thresholds.functions=95
```

Both must pass. Below threshold = PR blocked.

---

## 5. Integration Tests

### 5.1 Backend Feature (PHPUnit) — `backend/tests/Feature/`

These exercise Laravel's HTTP kernel, DB, queue, mail, all together. They are slower but catch wiring bugs that unit tests miss.

#### `backend/tests/Feature/Listening/YoutubeImportsTest.php`
- `test_post_imports_returns_202_with_job_id`
- `test_post_imports_400_on_invalid_url`
- `test_post_imports_400_on_empty_body`
- `test_post_imports_401_when_unauthenticated`
- `test_post_imports_429_when_quota_exhausted`
- `test_idempotency_key_returns_same_job_id_within_24h`
- `test_get_import_status_returns_progress_for_owner`
- `test_get_import_status_returns_404_for_other_user`
- `test_failed_import_records_reason_in_db`
- `test_concurrent_imports_for_same_user_share_quota`

**Success criteria**: 10/10 pass, uses `RefreshDatabase` + `Queue::fake()`.

#### `backend/tests/Feature/Listening/YoutubeSegmentsTest.php`
- `test_get_segments_returns_timing_for_lesson`
- `test_get_segments_returns_text_from_cache_when_present`
- `test_get_segments_falls_back_to_pipeline_when_cache_miss`
- `test_get_segments_401_when_unauthenticated`
- `test_get_segments_404_for_unknown_slug`
- `test_segment_text_never_persisted_to_db` ← **critical legal test**
- `test_cache_expires_after_24_hours`
- `test_concurrent_segment_requests_dedupe_cache_fills`

**Success criteria**: 8/8 pass. The "text never persisted" test runs a `SHOW COLUMNS` query on the `listening_youtube_segments` table and asserts no `text` column exists. If a future migration adds one, this test breaks.

#### `backend/tests/Feature/Listening/YoutubeAttemptsTest.php`
- `test_post_attempt_returns_grade_and_persists_attempt`
- `test_post_attempt_400_on_empty_typed_text`
- `test_post_attempt_404_on_unknown_segment`
- `test_post_attempt_429_after_30_in_one_minute`
- `test_post_attempt_calculates_accuracy_correctly`
- `test_post_attempt_increments_user_stats`
- `test_post_attempt_emits_segment_graded_event`
- `test_post_attempt_does_not_leak_other_users_data` ← **RLS check**

**Success criteria**: 8/8 pass.

#### `backend/tests/Feature/Listening/FreeTierEnforcementTest.php`
- `test_third_session_today_passes_for_free_user`
- `test_fourth_session_today_returns_429`
- `test_counter_resets_at_local_midnight`
- `test_counter_isolated_per_user`
- `test_trial_user_unlimited_for_14_days`
- `test_free_tier_check_uses_redis_not_db`

**Success criteria**: 6/6 pass, uses `Redis::fake()` or a real test Redis with FLUSHDB.

#### `backend/tests/Feature/Listening/QuotaGovernorTest.php`
- `test_reserve_returns_id_under_cap`
- `test_reserve_returns_null_at_cap`
- `test_release_decrements_used`
- `test_daily_reset_at_midnight_pacific`
- `test_concurrent_reserves_never_exceed_cap`

**Success criteria**: 5/5 pass.

#### `backend/tests/Feature/Auth/MagicLinkTest.php`
- `test_post_email_returns_202_and_sends_email`
- `test_post_email_400_on_invalid_email`
- `test_post_email_rate_limited_after_5_per_hour`
- `test_verify_token_creates_session_and_redirects`
- `test_verify_expired_token_returns_410`
- `test_verify_reused_token_returns_401`
- `test_login_persists_session_cookie_with_httponly_secure`

**Success criteria**: 7/7 pass, `Mail::fake()` asserts email queued.

#### `backend/tests/Feature/ApiErrorContractTest.php` ← **NEW, mandatory**
- `test_400_response_matches_contract_shape`
- `test_401_response_matches_contract_shape`
- `test_404_response_matches_contract_shape`
- `test_409_response_matches_contract_shape`
- `test_429_response_includes_retry_after_header`
- `test_500_response_does_not_leak_stack_trace`
- `test_every_error_includes_request_id`
- `test_request_id_is_echoed_from_header_when_provided`

**Success criteria**: 8/8 pass. Validates RFC 001 error contract: `{ error: { code, message, request_id } }`.

#### `backend/tests/Feature/SqlInjectionTest.php`
- `test_youtube_url_param_does_not_allow_sql_injection`
- `test_lesson_slug_param_does_not_allow_sql_injection`
- `test_user_email_param_does_not_allow_sql_injection`
- `test_search_query_does_not_allow_sql_injection`

**Success criteria**: 4/4 pass, asserts no exception, no leaked data.

### 5.2 Frontend Integration (Vitest + RTL) — `tests/integration/`

These render real components, mock the API client, and verify user flows.

#### `tests/integration/pasteUrlToDictation.test.tsx`
- `beginner_pastes_url_sees_loader_within_500ms`
- `beginner_pastes_invalid_url_sees_actionable_error_with_example`
- `beginner_pastes_valid_url_sees_segment_list_within_30s`
- `beginner_types_correct_transcript_sees_green_grade`
- `beginner_types_wrong_transcript_sees_red_diff`
- `beginner_uses_hint_button_reveals_word_count`
- `beginner_completes_session_sees_result_with_xp`

**Success criteria**: 7/7 pass, MSW for API mocking.

#### `tests/integration/resultFlow.test.tsx`
- `returning_user_sees_saved_vocab_list`
- `returning_user_can_save_word_to_vocab`
- `returning_user_clicks_save_progress_sees_magic_link_form`
- `returning_user_enters_email_sees_success_message`
- `result_page_shows_accuracy_ring_with_correct_value`
- `result_page_offers_retry_button_that_restarts_session`
- `result_page_offers_next_video_button`

**Success criteria**: 7/7 pass.

#### `tests/integration/authFlow.test.tsx`
- `unauthenticated_user_can_complete_full_session`
- `magic_link_form_validates_email_format`
- `magic_link_form_shows_rate_limit_message_after_5_attempts`
- `authenticated_user_sees_history_on_dashboard`
- `logout_clears_session_and_redirects_to_landing`

**Success criteria**: 5/5 pass.

#### `tests/integration/eventTracking.test.tsx`
- `landing_view_fires_landing_viewed_event`
- `url_paste_fires_url_pasted_event`
- `segment_typed_fires_segment_typed_event_with_accuracy`
- `magic_link_sent_fires_magic_link_sent_event`
- `events_batched_within_5_seconds`
- `events_persisted_across_page_refresh`
- `failed_events_retry_with_backoff`
- `tracker_does_not_block_first_paint`

**Success criteria**: 8/8 pass, mocked PostHog client.

#### `tests/integration/freeTier.test.tsx`
- `free_user_after_third_session_sees_paywall_at_fourth`
- `free_user_paywall_includes_remaining_reset_time`
- `trial_user_never_sees_paywall_during_trial`
- `paywall_offers_upgrade_button_clicking_starts_checkout`

**Success criteria**: 4/4 pass.

### 5.3 Integration Coverage Gates

```bash
# Backend Feature
cd backend && vendor/bin/pest --testsuite=Feature --coverage --min=85

# Frontend Integration
npx vitest run tests/integration/ --coverage --coverage.thresholds.lines=80
```

---

## 6. E2E Tests (Playwright)

### 6.1 Setup

```ts
// playwright.config.ts (excerpt)
projects: [
  { name: 'chromium',          use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',           use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',            use: { ...devices['Desktop Safari'] } },
  { name: 'mobile-iphone15',   use: { ...devices['iPhone 15'] } },
  { name: 'mobile-galaxys24',  use: { ...devices['Galaxy S24'] } },
  { name: 'tablet-ipad-air',   use: { ...devices['iPad Air'] } },
  { name: 'slow-3g',           use: { ...devices['Desktop Chrome'] },
                                 contextOptions: { ... } },
]
```

Web server auto-started via `webServer.command: 'npm run dev'`. Test DB seeded by `globalSetup`.

### 6.2 Test Files

#### `tests/e2e/01-landing.spec.ts` — **Persona: Beginner**
- `TC-E2E-01-01_landing_page_loads_under_2_5s_on_4g`
- `TC-E2E-01-02_paste_url_input_has_visible_label`
- `TC-E2E-01-03_paste_url_input_is_above_fold`
- `TC-E2E-01-04_paste_url_input_accepts_paste_keyboard_shortcut`
- `TC-E2E-01-05_clicking_try_sample_video_uses_demo_url`
- `TC-E2E-01-06_landing_works_without_javascript_errors`

**Success**: 6/6 pass, 0 console errors, FCP < 1.5s on 4G throttle.

#### `tests/e2e/02-dictation-happy-path.spec.ts` — **Persona: Returning**
- `TC-E2E-02-01_paste_valid_url_starts_import`
- `TC-E2E-02-02_loader_visible_during_caption_pipeline`
- `TC-E2E-02-03_loader_shows_progress_pct`
- `TC-E2E-02-04_segments_appear_within_30s`
- `TC-E2E-02-05_first_segment_autoplays`
- `TC-E2E-02-06_user_can_type_in_transcript_input`
- `TC-E2E-02-07_check_button_grades_attempt`
- `TC-E2E-02-08_correct_attempt_shows_green_grade`
- `TC-E2E-02-09_user_can_advance_to_next_segment`
- `TC-E2E-02-10_session_completes_shows_result_screen`

**Success**: 10/10 pass, total runtime < 60s.

#### `tests/e2e/03-dictation-error-states.spec.ts`
- `TC-E2E-03-01_invalid_url_shows_actionable_error_with_example_url`
- `TC-E2E-03-02_age_restricted_video_shows_graceful_message_no_black_box`
- `TC-E2E-03-03_private_video_shows_source_unavailable`
- `TC-E2E-03-04_quota_exhausted_shows_reset_countdown`
- `TC-E2E-03-05_caption_pipeline_failure_shows_whisper_fallback_in_progress`
- `TC-E2E-03-06_network_offline_shows_offline_banner`
- `TC-E2E-03-07_server_500_shows_generic_error_with_request_id`
- `TC-E2E-03-08_session_expired_during_segment_redirects_to_login`

**Success**: 8/8 pass, no white screens.

#### `tests/e2e/04-magic-link-signup.spec.ts`
- `TC-E2E-04-01_user_enters_email_and_clicks_send`
- `TC-E2E-04-02_success_message_shown_for_valid_email`
- `TC-E2E-04-03_invalid_email_shows_inline_error`
- `TC-E2E-04-04_resend_button_disabled_for_60s`
- `TC-E2E-04-05_clicking_email_link_creates_session_and_redirects`
- `TC-E2E-04-06_used_token_shows_link_expired_message`
- `TC-E2E-04-07_expired_token_redirects_to_request_new_link`

**Success**: 7/7 pass, real email captured by `Mail::fake()` + inbox helper.

#### `tests/e2e/05-free-tier-cap.spec.ts` — **Persona: Returning**
- `TC-E2E-05-01_third_session_completes_normally`
- `TC-E2E-05-02_fourth_session_shows_paywall_with_remaining_quota`
- `TC-E2E-05-03_paywall_offers_upgrade_within_24h_trial`
- `TC-E2E-05-04_quota_resets_at_user_local_midnight`
- `TC-E2E-05-05_paywall_dismissable_until_fourth_attempt`

**Success**: 5/5 pass, fixture user pre-seeded with 3 completed sessions.

#### `tests/e2e/06-beginner-journey.spec.ts` — **Persona: Beginner**
- `TC-E2E-06-01_beginner_with_no_history_sees_welcome_state`
- `TC-E2E-06-02_beginner_first_url_paste_uses_helpful_default_video`
- `TC-E2E-06-03_beginner_uses_hint_button_4_times_in_first_session`
- `TC-E2E-06-04_beginner_sees_save_progress_prompt_at_result`
- `TC-E2E-06-05_beginner_signs_up_via_magic_link_within_60s_of_result`

**Success**: 5/5 pass, first-session funnel < 90s.

#### `tests/e2e/07-returning-user.spec.ts` — **Persona: Returning**
- `TC-E2E-07-01_returning_user_sees_resume_last_session_button`
- `TC-E2E-07-02_resume_restores_segment_index_and_attempts`
- `TC-E2E-07-03_returning_user_sees_streak_count`
- `TC-E2E-07-04_returning_user_sees_vocab_to_review_today`
- `TC-E2E-07-05_returning_user_can_paste_new_url_from_dashboard`
- `TC-E2E-07-06_returning_user_dashboard_loads_under_1_5s`

**Success**: 6/6 pass.

#### `tests/e2e/08-mobile-iphone15.spec.ts` — **Persona: Mobile**
- `TC-E2E-08-01_iphone15_viewport_layout_does_not_horizontal_scroll`
- `TC-E2E-08-02_iphone15_paste_url_button_touch_target_at_least_44px`
- `TC-E2E-08-03_iphone15_textarea_does_not_trigger_zoom_on_focus`
- `TC-E2E-08-04_iphone15_player_does_not_autoplay_audio_on_load`
- `TC-E2E-08-05_iphone15_full_session_completes_with_thumbs`
- `TC-E2E-08-06_iphone15_keyboard_does_not_cover_input`

**Success**: 6/6 pass on iPhone 15 viewport.

#### `tests/e2e/09-mobile-galaxys24.spec.ts` — **Persona: Mobile**
- `TC-E2E-09-01_galaxy_s24_layout_renders_without_overflow`
- `TC-E2E-09-02_galaxy_s24_back_button_navigates_to_landing`
- `TC-E2E-09-03_galaxy_s24_share_sheet_visible_at_result_page`
- `TC-E2E-09-04_galaxy_s24_pull_to_refresh_works_on_dashboard`

**Success**: 4/4 pass on Galaxy S24 viewport.

#### `tests/e2e/10-slow-network-3g.spec.ts` — **Persona: Slow network**
- `TC-E2E-10-01_landing_under_3g_loads_under_5s`
- `TC-E2E-10-02_landing_renders_above_fold_text_under_2s`
- `TC-E2E-10-03_loader_visible_immediately_on_paste`
- `TC-E2E-10-04_player_does_not_block_segment_typing`
- `TC-E2E-10-05_caption_pipeline_timeout_at_30s_shows_clear_error`
- `TC-E2E-10-06_failed_request_auto_retries_up_to_3_times`
- `TC-E2E-10-07_offline_during_session_shows_offline_banner`

**Success**: 7/7 pass, all throttled to 1.6 Mbps / 750ms RTT.

#### `tests/e2e/11-keyboard-only.spec.ts` — **Persona: Keyboard only**
- `TC-E2E-11-01_landing_tabbing_order_is_logical`
- `TC-E2E-11-02_url_input_focusable_via_tab`
- `TC-E2E-11-03_submit_button_activates_via_enter`
- `TC-E2E-11-04_session_full_keyboard_completion`
- `TC-E2E-11-05_space_pauses_plays_player`
- `TC-E2E-11-06_r_replays_segment`
- `TC-E2E-11-07_h_reveals_hint`
- `TC-E2E-11-08_ctrl_enter_submits_attempt`
- `TC-E2E-11-09_arrow_right_advances_segment`
- `TC-E2E-11-10_focus_visible_on_every_interactive_element`
- `TC-E2E-11-11_skip_link_to_main_content_present`
- `TC-E2E-11-12_no_keyboard_trap_on_player`

**Success**: 12/12 pass, `await page.keyboard.press()`.

#### `tests/e2e/12-tablet-ipad.spec.ts` — **Persona: Mobile (tablet)**
- `TC-E2E-12-01_ipad_landing_layout_60_40_split`
- `TC-E2E-12-02_ipad_dictation_split_pane`
- `TC-E2E-12-03_ipad_external_keyboard_shortcuts_work`
- `TC-E2E-12-04_ipad_share_button_at_result`

**Success**: 4/4 pass on iPad Air viewport.

### 6.3 E2E Success Criteria

- All 30+ scenarios pass in CI
- Total runtime < 6 minutes (parallelized)
- 0 console errors on any page
- All personas have ≥ 4 dedicated scenarios
- Cross-browser: runs on chromium, firefox, webkit

---

## 7. Accessibility Tests (axe-core via Playwright)

#### `tests/e2e/13-a11y-landing.spec.ts`
- `TC-A11Y-13-01_landing_has_no_critical_axe_violations`
- `TC-A11Y-13-02_landing_has_no_serious_axe_violations`
- `TC-A11Y-13-03_landing_h1_is_present_and_unique`
- `TC-A11Y-13-04_landing_color_contrast_meets_aa`
- `TC-A11Y-13-05_landing_form_inputs_have_labels`
- `TC-A11Y-13-06_landing_language_attribute_set_correctly`
- `TC-A11Y-13-07_landing_meta_viewport_present`
- `TC-A11Y-13-08_landing_title_describes_page`
- `TC-A11Y-13-09_landing_images_have_alt_text`
- `TC-A11Y-13-10_landing_focus_indicators_visible`

**Success**: 10/10 pass, axe severity threshold = critical+serious.

#### `tests/e2e/14-a11y-dictation.spec.ts`
- `TC-A11Y-14-01_dictation_axe_no_critical_violations`
- `TC-A11Y-14-02_player_iframe_has_accessible_name`
- `TC-A11Y-14-03_transcript_textarea_has_label`
- `TC-A11Y-14-04_segment_transition_announced_by_live_region`
- `TC-A11Y-14-05_grading_result_announced_by_live_region`
- `TC-A11Y-14-06_play_pause_button_has_aria_pressed`
- `TC-A11Y-14-07_speed_selector_has_label`
- `TC-A11Y-14-08_hint_button_aria_expanded_reflects_state`
- `TC-A11Y-14-09_progress_percentage_announced`
- `TC-A11Y-14-10_reduced_motion_disables_animations`

**Success**: 10/10 pass.

#### `tests/e2e/15-a11y-result.spec.ts`
- `TC-A11Y-15-01_result_axe_no_critical_violations`
- `TC-A11Y-15-02_accuracy_ring_has_text_alternative`
- `TC-A11Y-15-03_diff_list_uses_semantic_markup`
- `TC-A11Y-15-04_save_vocab_button_aria_label_includes_word`
- `TC-A11Y-15-05_magic_link_form_email_input_type_email`
- `TC-A11Y-15-06_success_message_uses_aria_live_polite`
- `TC-A11Y-15-07_error_message_uses_aria_live_assertive`
- `TC-A11Y-15-08_skip_to_next_video_link_present`

**Success**: 8/8 pass.

### Accessibility Success Criteria
- 0 critical axe violations on core pages (landing, dictation, result)
- 0 serious axe violations on core pages
- WCAG 2.1 AA compliance verified by axe
- Manual screen reader test (NVDA + VoiceOver) before each release
- Color contrast: 4.5:1 for body text, 3:1 for large text
- Lighthouse Accessibility score ≥ 95

---

## 8. Performance Tests

### 8.1 Frontend (Playwright + Lighthouse)

#### `tests/e2e/16-visual-regression.spec.ts`
- `TC-VIS-16-01_landing_visual_no_regression`
- `TC-VIS-16-02_dictation_visual_no_regression`
- `TC-VIS-16-03_result_visual_no_regression`
- `TC-VIS-16-04_mobile_landing_visual_no_regression`
- `TC-VIS-16-05_dark_mode_landing_visual_no_regression`

**Success**: 5/5 pass, max pixel diff < 0.1%, snapshot updates require manual approval.

#### `tests/e2e/17-cross-browser.spec.ts` (subset of happy path on each engine)
- `TC-XB-17-01_chromium_full_session`
- `TC-XB-17-02_firefox_full_session`
- `TC-XB-17-03_webkit_full_session`

**Success**: 3/3 pass.

#### Lighthouse budget (per PR)
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 95
- Initial JS bundle: < 250 KB gzipped
- Player route TTI: < 3.5s
- LCP: < 2.5s
- CLS: < 0.1
- INP: < 200ms

#### `tests/perf/bundle-size.test.ts` (Vitest)
- `main_bundle_under_250kb_gzipped`
- `player_route_under_400kb_gzipped`
- `vendor_chunk_under_180kb_gzipped`
- `no_unused_exports_in_lib`

**Success**: 4/4 pass, fails PR if exceeded.

### 8.2 Backend Performance (PHPUnit + custom timer)

#### `backend/tests/Performance/ApiLatencyTest.php`
- `test_get_segments_p95_under_200ms_warm`
- `test_get_segments_p95_under_300ms_cold`
- `test_post_attempt_p95_under_300ms`
- `test_post_imports_p95_under_100ms`
- `test_health_endpoint_p99_under_50ms`
- `test_health_endpoint_does_not_block_under_db_load`

**Success**: 6/6 pass with 100 iterations per endpoint, p95 measured.

### 8.3 Performance Success Criteria
- All Lighthouse budgets pass on every PR
- Bundle size budgets enforced in CI
- API p95 latency under target on every endpoint
- 0 memory leaks in 1-hour session test (manual)

---

## 9. Load Tests (k6)

### 9.1 Test Scripts

#### `tests/load/import-spike.js`
**Scenario**: 50 concurrent users paste URL simultaneously.
- `ramp_to_50_users_over_30s`
- `sustain_50_users_for_2_min`
- `ramp_down_over_30s`
- `assert_p95_under_500ms`
- `assert_p99_under_1500ms`
- `assert_error_rate_under_1_percent`
- `assert_quota_governor_correctly_rejects_after_ceiling`

**Pass criteria**: p95 < 500ms, p99 < 1500ms, error rate < 1%, no quota overrun.

#### `tests/load/attempt-grading.js`
**Scenario**: 200 concurrent users submit attempts at peak (5k seg/min).
- `ramp_to_200_users_over_60s`
- `sustain_200_users_for_5_min`
- `assert_p95_under_300ms`
- `assert_p99_under_800ms`
- `assert_db_pool_never_exhausted`
- `assert_redis_cache_hit_rate_above_90_percent`

**Pass criteria**: p95 < 300ms, p99 < 800ms, cache hit > 90%, no 5xx.

#### `tests/load/mixed-workload.js`
**Scenario**: Realistic mix — 70% reads, 20% writes, 10% magic-link.
- `ramp_to_500_users_over_5_min`
- `sustain_500_users_for_15_min`
- `assert_p95_under_400ms_reads`
- `assert_p95_under_500ms_writes`
- `assert_no_memory_leak_over_15min`
- `assert_error_rate_under_0_5_percent`

**Pass criteria**: p95 < 400ms reads, p95 < 500ms writes, error rate < 0.5%.

#### `tests/load/cold-start.js`
**Scenario**: 1000 users hit cold-start (serverless waking up).
- `simulate_cold_start_then_burst`
- `assert_cold_start_p99_under_3s`
- `assert_no_thundering_herd_db_connections`

**Pass criteria**: p99 cold start < 3s, DB pool < 80% capacity.

### 9.2 Load Test Success Criteria

| Test | Users | Duration | p95 target | Error rate target |
|---|---|---|---|---|
| import-spike | 50 | 3 min | 500ms | < 1% |
| attempt-grading | 200 | 7 min | 300ms | < 1% |
| mixed-workload | 500 | 20 min | 400ms | < 0.5% |
| cold-start | 1000 | 5 min | 3s p99 | < 2% |

**Run on every release candidate**, before deploying to production. **Run weekly** as part of health check.

---

## 10. Manual QA

### 10.1 Pre-Release Manual Checklist (run by QA, not Eng)

**Persona-driven sessions, 30 min each, recorded with consent.**

#### Session 1: Beginner (An, 22, Vietnam)
- [ ] An lands on page, sees paste-URL input above the fold
- [ ] An pastes a YouTube URL she watches for IELTS prep
- [ ] An waits 15-30s for the loader
- [ ] An types the first segment, makes 2 typos, uses hint once
- [ ] An gets 60% accuracy on first segment, sees green/red feedback
- [ ] An completes 3 segments, sees result page
- [ ] An clicks "Save my progress", enters email, receives magic link
- [ ] An clicks email link, lands on dashboard with session history

**Pass criteria**: An completes the flow in < 5 min, gives NPS ≥ 8 in post-test survey.

#### Session 2: Returning (Linh, 28, Vietnam)
- [ ] Linh logs in, sees "Resume last session" button
- [ ] Linh resumes mid-segment, picks up where she left off
- [ ] Linh completes 5 segments, sees 80% accuracy
- [ ] Linh sees vocab review list with 7 words from yesterday
- [ ] Linh reviews 5 vocab words (test out of scope for MVP)

**Pass criteria**: Linh does not need to ask for help, completes in < 4 min.

#### Session 3: Mobile (Mai, 35, Vietnam, iPhone 15)
- [ ] Mai opens URL on phone (Safari)
- [ ] Mai pastes URL via share-sheet (iOS)
- [ ] Mai types using thumbs on virtual keyboard
- [ ] Mai does not need to pinch-zoom at any point
- [ ] Mai sees result page, saves vocab by tapping
- [ ] Mai closes phone, opens on desktop next day, sees history synced

**Pass criteria**: No horizontal scroll, no element cut off, no input zoom on focus.

#### Session 4: Slow network (Huy, 40, Vietnam, rural 3G)
- [ ] Huy opens URL on phone with 1.6 Mbps connection
- [ ] Landing loads within 5s, loader appears immediately
- [ ] Caption pipeline takes 20-30s, loader has progress %
- [ ] Segment plays back without buffering
- [ ] Attempt submits within 1s of clicking check
- [ ] Result page loads within 3s

**Pass criteria**: No timeout errors, no white screen, no broken layouts.

#### Session 5: Keyboard only (Khoa, 25, screen reader user, NVDA on Windows)
- [ ] Khoa opens URL with NVDA running
- [ ] Khoa tabs to URL input, types URL, presses Enter
- [ ] NVDA announces "Loading, please wait" and progress
- [ ] Khoa tabs to transcript input, types, presses Ctrl+Enter
- [ ] NVDA announces "Graded, 75% accuracy, 3 wrong, 1 missing"
- [ ] Khoa presses R to replay, Space to pause, → for next segment
- [ ] Khoa completes session without mouse

**Pass criteria**: All actions reachable via keyboard, SR announces every state change, no traps.

### 10.2 Device Matrix (manual + BrowserStack in Phase 3)

| Device | OS | Browser | Priority |
|---|---|---|---|
| iPhone 15 | iOS 17 | Safari | P0 |
| iPhone SE (2022) | iOS 17 | Safari | P0 |
| Galaxy S24 | Android 14 | Chrome | P0 |
| Pixel 7 | Android 14 | Chrome | P1 |
| iPad Air | iPadOS 17 | Safari | P1 |
| MacBook Air M2 | macOS 14 | Chrome | P0 |
| MacBook Air M2 | macOS 14 | Safari | P0 |
| Windows 11 laptop | Win 11 | Edge | P1 |
| Windows 11 laptop | Win 11 | Firefox | P2 |
| Low-end Android (Redmi Note 12) | Android 12 | Chrome | P1 |

P0 = every release. P1 = every 2 weeks. P2 = monthly.

### 10.3 Manual QA Success Criteria
- All 5 persona sessions completed without critical bugs
- All P0 devices tested on every release
- 0 P0/P1 bugs open before release
- Post-test NPS ≥ 8 (beginner + returning) and ≥ 7 (mobile + slow)
- All user feedback tagged and added to backlog

---

## 11. CI Pipeline

### 11.1 GitHub Actions Workflows

```yaml
# .github/workflows/ci-frontend.yml
name: Frontend CI
on: [pull_request]
jobs:
  unit-and-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:run -- --coverage
      - name: Coverage gate (lib/)
        run: |
          npx vitest run --coverage --coverage.reporter=json
          node scripts/check-coverage.js src/features/listening/lib/ 95
      - name: Bundle size gate
        run: npx vitest run tests/perf/bundle-size.test.ts
      - name: Mutation gate (scoring only)
        run: npx stryker run --mutate src/features/listening/lib/scoring/

  e2e:
    needs: unit-and-integration
    runs-on: ubuntu-latest
    services:
      postgres: { image: postgres:16, env: { POSTGRES_DB: test } }
      redis:   { image: redis:7 }
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - name: Backend health
        run: cd backend && php artisan migrate --env=testing
      - run: npx playwright test --project=chromium
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }

  e2e-cross-browser:
    needs: unit-and-integration
    runs-on: ubuntu-latest
    strategy:
      matrix: { browser: [firefox, webkit, mobile-iphone15, mobile-galaxys24] }
    steps:
      - run: npx playwright test --project=${{ matrix.browser }}

  a11y:
    needs: unit-and-integration
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright test tests/e2e/13-a11y-*.spec.ts tests/e2e/14-a11y-*.spec.ts tests/e2e/15-a11y-*.spec.ts
```

```yaml
# .github/workflows/ci-backend.yml
name: Backend CI
on: [pull_request]
jobs:
  unit-and-feature:
    runs-on: ubuntu-latest
    services:
      postgres: { image: postgres:16, env: { POSTGRES_DB: test } }
      redis:   { image: redis:7 }
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.3' }
      - run: cd backend && composer install
      - run: cd backend && vendor/bin/pest --coverage --min=95
      - run: cd backend && vendor/bin/pest --testsuite=Feature --coverage --min=85
      - name: Coverage comment
        uses: qameta/action-coverage-report@v1
        with: { coverage-file: backend/coverage.xml, badge: true }
```

```yaml
# .github/workflows/ci-load.yml
name: Load (weekly + release)
on:
  schedule: [{ cron: '0 6 * * 1' }]
  workflow_dispatch:
jobs:
  k6:
    runs-on: ubuntu-latest
    steps:
      - uses: grafana/k6-action@v0.3.0
        with:
          filename: tests/load/mixed-workload.js
      - name: Assert SLOs
        run: node scripts/check-k6-results.js
```

### 11.2 Required Status Checks (branch protection)
- `Frontend CI / unit-and-integration`
- `Frontend CI / e2e`
- `Frontend CI / e2e-cross-browser` (mobile-iphone15, mobile-galaxys24)
- `Frontend CI / a11y`
- `Backend CI / unit-and-feature`
- `Visual regression diff < 0.1%`
- `Bundle size < 250 KB`

### 11.3 CI Pipeline Success Criteria
- All 7 required status checks pass on every PR
- Total CI runtime < 15 minutes (parallelized)
- 0 flaky tests in the last 30 days (any test with > 1 retry in CI is flagged)
- Coverage gates block merge when below target
- Bundle size gate blocks merge when exceeded

### 11.4 Test Isolation Discipline
- Every test creates its own data via factory; never depends on order
- DB tests use `RefreshDatabase` or `DatabaseTransactions`
- E2E tests use isolated test DB created in `globalSetup`, dropped in `globalTeardown`
- No shared mutable state between tests
- `beforeEach` resets Zustand stores via `useStore.setState(initialState)`

---

## 12. Failure Examples — Real Bugs We Will Catch

| Test that catches it | Bug it would catch |
|---|---|
| `test_segment_text_never_persisted_to_db` | Future engineer adds `text` column to `listening_youtube_segments` table; legal exposure |
| `test_fourth_session_today_returns_429` | Free-tier counter off-by-one allows 4 sessions; CAC balloons |
| `test_500_response_does_not_leak_stack_trace` | Server exposes DB table names + line numbers in production |
| `test_request_id_is_echoed_from_header_when_provided` | Support team can't correlate user reports with server logs |
| `test_iphone15_textarea_does_not_trigger_zoom_on_focus` | Input font < 16px on iOS → page zooms → user frustrated |
| `test_reduced_motion_disables_animations` | Vestibular disorder user gets sick from count-up animation |
| `test_focus_visible_on_every_interactive_element` | `outline: none` left in CSS, keyboard user lost |
| `test_concurrent_reserves_never_exceed_cap` | Race condition in quota governor, 2x budget exceeded |
| `test_unicode_vietnamese_supported` | Vietnamese diacritics stripped → wrong scoring for 22M users |
| `test_get_segments_p95_under_200ms_warm` | N+1 query added in refactor, page takes 5s |
| `test_does_not_persist_ephemeral_fields` | Zustand persist middleware writes cache to localStorage → legal issue |
| `test_idempotency_key_returns_same_job_id_within_24h` | User double-clicks paste, 2 imports, quota burned |
| `test_caption_pipeline_failure_shows_whisper_fallback_in_progress` | Whisper path throws unhandled exception, no fallback |
| `test_offline_during_session_shows_offline_banner` | Network drops, no UI feedback, user thinks app is broken |
| `test_keyboard_only_senior_user_completes_session` | New modal added without `aria-modal`, keyboard user trapped |
| `test_iphone15_paste_url_button_touch_target_at_least_44px` | 32px button added, thumb can't hit it |
| `test_does_not_leak_other_users_data` (RLS) | Forgot `where user_id = ?` in query, all users see all attempts |
| `test_segment_typed_event_contains_accuracy_bucket` | Analytics dashboard shows "0%" for all users, no segment completion |
| `test_bundle_under_250kb` | Imported 200KB charting lib, page TTI > 5s |
| `test_cold_start_p99_under_3s` | New serverless function added, 12s cold start |

---

## 13. What We Do NOT Test (Out of Scope for MVP)

- **Visual design** beyond snapshot regression — design QA is manual
- **Real email delivery** — uses `Mail::fake()` + inbox helper
- **Real payment flows** — no payments in MVP
- **Real YouTube integration** at scale — uses `FakeYouTubeClient`, real YouTube tested in staging only
- **Cross-region latency** — single-region deploy in MVP
- **DDoS resilience** — Cloudflare handles; we test rate limits only
- **Long-running sessions (> 1h)** — out of scope; manual if needed
- **Email deliverability** — Resend handles; we test content only
- **SEO at scale** — Lighthouse SEO score, not full programmatic SEO test
- **Database migration rollbacks** — only forward migrations tested; rollback tested manually before release

---

## 14. Quarterly Audit

Every 90 days, the QA lead runs a 1-day audit:
- [ ] Coverage reports reviewed, gaps closed
- [ ] Flaky tests killed (any test with > 1 retry in 30 days)
- [ ] Outdated snapshots updated
- [ ] Load test scenarios updated to reflect current usage
- [ ] Manual QA device matrix refreshed (new devices added)
- [ ] Mutation testing scope expanded (scoring → caption pipeline)
- [ ] Performance budgets re-baselined
- [ ] Failure examples review: are these still the right things to catch?
- [ ] New risks added: legal, security, accessibility

This document is the contract. Any deviation requires a PR to this file.
