# VinaListen — MVP P0-P1 Gap Specifications
## Critical Decisions for Implementation — Must Resolve Before Coding

**Date:** 2026-06-07  
**Version:** 1.0  
**Status:** **MUST RESOLVE BEFORE CODING PHASE B**  
**Based on:** MVP Freeze + Critical Review + Gap Analysis

---

## PART 1: P0 CRITICAL BLOCKERS (Must Fix Now)

These are undefined or ambiguous core behaviors that will cause implementation chaos if not resolved first.

---

### P0-1: Scoring Logic — Complete Specification

```
┌─────────────────────────────────────────────────────────────┐
│ PROBLEM: Multiple scoring formulas exist across documents     │
│ with conflicting definitions                                  │
└─────────────────────────────────────────────────────────────┘

DOCUMENT CONFLICTS:
- Feature Spec: accuracy = correct_words / total_words × 100
- Technical Design: Same formula
- Critical Review: Different thresholds mentioned
- No handling for contractions, numbers, punctuation
```

#### Transcript Accuracy Scoring (RESOLVED)

```
RULE: Compare user_input vs expected_transcript

STEP 1 — Normalize Both Strings
  1. Convert to lowercase
  2. Trim whitespace
  3. Remove leading/trailing punctuation: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
  4. Collapse multiple spaces to single space
  5. Keep internal apostrophes (for contractions)

STEP 2 — Tokenize
  Split by whitespace into array of words

STEP 3 — Align with LCS Algorithm
  Use Longest Common Subsequence to align:
  - Expected: ["i", "was", "walking", "to", "the", "store"]
  - User:    ["i", "was", "walkn", "to", "store"]
  - LCS:     ["i", "was", "to", "store"]
  - Align:
    Expected | User    | Status
    "i"      | "i"    | correct
    "was"    | "was"  | correct
    "walking"| "walkn"| wrong (different word)
    "to"     | "to"   | correct
    "the"    | [MISS] | missing
    "store"  | "store"| correct

STEP 4 — Classify Each Word
  CORRECT: Word exists in both sequences at aligned position
  WRONG:   Word differs at aligned position
  MISSING: Word in expected but not in user input
  EXTRA:   Word in user input but not in expected

STEP 5 — Calculate Accuracy
  accuracy = correct_count / expected_count × 100

  Round to 1 decimal place.

STEP 6 — Special Cases

  Contractions:
    Expected: "don't"
    User:     "dont"      → CORRECT (normalize removes apostrophe)
    User:     "do not"    → CORRECT (treating as 2 words)
    User:     "dont"      → WRONG (different from "don't" after normalization)

  Numbers:
    Expected: "1995"
    User:     "nineteen ninety five" → WRONG (hard to auto-detect, flag as known limitation)
    User:     "1995"               → CORRECT (exact match)

  Capitalization:
    Expected: "I went to the store"
    User:     "i went to the store" → CORRECT (case-insensitive)

  Punctuation:
    Expected: "Hello, world!"
    User:     "hello world"         → CORRECT (punctuation stripped)

STEP 7 — XP Calculation
  base_xp = round(accuracy × 10)

  bonus_perfect     = accuracy == 100 ? +10 : 0
  bonus_speed        = time_seconds < 300 ? +5 : 0   // < 5 min
  bonus_no_retry     = attempt_count == 1 ? +3 : 0

  total_lesson_xp = sum of (base_xp + bonuses) for all clips
  max_lesson_xp   = 100

STEP 8 — Score Thresholds
  >= 90% → Label: "TUYỆT VỜI!"    | Color: --success (#00BE7C)
  >= 75% → Label: "Khá tốt!"       | Color: --warning (#FFAB00)
  >= 60% → Label: "Cần cải thiện"  | Color: --accent (#FF5632)
  < 60%  → Label: "Thử lại nhé"    | Color: --error (#FF3257)
```

#### Pronunciation Scoring (RESOLVED)

```
RULE: Compare transcribed_text (from speech recognition) vs expected_transcript

The difference from transcript scoring:
- User's spoken words may differ from what they intended to say
- Some mispronunciations sound similar to the correct word
- Phonetic similarity matters more than exact spelling match

STEP 1 — Normalize
  Same as transcript scoring (lowercase, trim, strip punctuation)

STEP 2 — Tokenize
  Split both into word arrays

STEP 3 — Phonetic Similarity Check (Optional, Phase 2)
  MVP: Exact match only (same as transcript)
  Phase 2: Use phonetic encoding (Soundex/Metaphone) for similarity

STEP 4 — Component Scores

  A. Accuracy = (words matching / expected_count) × 100

  B. Fluency  = Based on speaking pace
     time_seconds = how long user spoke
     word_count   = transcribed_words.length

     wpm = word_count / time_seconds × 60

     if wpm >= 120 AND wpm <= 160: fluency = 100
     if wpm >= 100 AND wpm < 120:   fluency = 80  (slightly slow)
     if wpm > 160 AND wpm <= 200:   fluency = 80  (slightly fast)
     if wpm >= 80 AND wpm < 100:    fluency = 50  (slow)
     if wpm > 200:                   fluency = 40  (too fast)
     if wpm < 80:                    fluency = 20  (too slow / no speech)
     if transcribed_text is empty:    fluency = 0

  C. Completeness = (spoken_words / expected_words) × 100
     If user spoke more than expected: cap at 100%
     If user spoke less: percentage of what was expected

STEP 5 — Overall Pronunciation Score
  overall = Accuracy×0.5 + Fluency×0.25 + Completeness×0.25
  Round to 1 decimal place.

STEP 6 — Word-Level Marks
  CORRECT:       Exact match with expected word
  MISPRONOUNCED: Phonetically similar (Phase 2: Soundex match)
  WRONG:         Completely different word
  MISSING:       Expected word not spoken

  MVP: Only CORRECT and WRONG are distinguished
  Phase 2: Add MISPRONOUNCED (phonetic similarity)

STEP 7 — AI Pronunciation Tips (Rule-Based, MVP)
  Generated from pattern detection:

  Pattern: Repeated wrong words
    → "Bạn đã phát âm sai từ 'X' 3 lần. Nên luyện tập riêng từ này."

  Pattern: Punctuation missing at end
    → "Chú ý câu có dấu chấm, phẩy. Trong tiếng Anh, punctuation rất quan trọng."

  Pattern: All words correct but one different
    → "Tuyệt vời! Chỉ cần chú ý từ 'X'. Nghe audio để so sánh."

  Pattern: Speaking too fast
    → "Bạn nói hơi nhanh. Thử chậm lại một chút, đặc biệt với các từ khó."

  Pattern: Speaking too slow
    → "Tốc độ của bạn hơi chậm. Cố gắng nói tự nhiên hơn, khoảng 120-160 từ/phút."

  Fallback (no pattern):
    → "Bạn đã làm tốt! Tiếp tục luyện tập để cải thiện phát âm."

STEP 8 — Speaking XP Calculation
  base_xp = round(pronunciation_score × 5)

  bonus_high_score = pronunciation_score >= 90 ? +5 : 0
  bonus_first_attempt = attempt_count == 1 ? +2 : 0

  total_speaking_xp = base_xp + bonuses
  max_speaking_xp   = 50
```

#### XP and Level System (RESOLVED)

```
LEVEL THRESHOLDS:
  threshold(level) = 100 × level × (level + 1) / 2

  Level  1:  0 XP     (start)
  Level  2:  200 XP
  Level  3:  450 XP
  Level  4:  800 XP
  Level  5: 1350 XP
  Level  6: 2100 XP
  Level  7: 3150 XP
  Level  8: 4500 XP
  Level  9: 6150 XP
  Level 10: 8100 XP
  Level 15: 24000 XP
  Level 20: 42000 XP
  Level 30: 93000 XP

XP TO NEXT LEVEL:
  xp_to_next = threshold(current_level + 1) - total_xp

STREAK MILESTONE XP BONUSES:
  7-day  → +30 XP  (celebrated in-app)
  14-day → +50 XP
  30-day → +100 XP (monthly)
  60-day → +200 XP
  100-day→ +500 XP
  365-day→ +1000 XP

LEVEL-UP ANIMATION:
  Trigger when total_xp crosses threshold(current_level + 1)
  Show: Level up! "Bạn đã đạt Level X!"
  XP progress bar resets
```

---

### P0-2: Database Entity — Complete Schema Fixes

```
┌─────────────────────────────────────────────────────────────┐
│ PROBLEM: Schema missing critical fields, indexes, and       │
│ constraints identified in Critical Review                     │
└─────────────────────────────────────────────────────────────┘
```

#### Missing Fields — Fixes Required

```sql
-- PROBLEM 1: No daily goal tracking
-- FIX: Add daily_goal_minutes to users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS
  daily_goal_minutes INTEGER DEFAULT 10;

ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS
  daily_goal_lessons INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN daily_goal_minutes <= 5 THEN 1
      WHEN daily_goal_minutes <= 10 THEN 2
      WHEN daily_goal_minutes <= 20 THEN 3
      WHEN daily_goal_minutes <= 30 THEN 5
      ELSE 5
    END
  ) STORED;

-- PROBLEM 2: No daily activity tracking for lessons done
-- FIX: Ensure daily_activity tracks by date, not just on lesson complete
-- (already in schema, just ensure trigger fires correctly)

-- PROBLEM 3: No topic progress denormalization
-- FIX: Add computed field or view for topic-level progress
CREATE OR REPLACE VIEW topic_user_progress AS
SELECT
  t.id AS topic_id,
  u.id AS user_id,
  COUNT(DISTINCT CASE WHEN up.best_score IS NOT NULL THEN l.id END) AS lessons_completed,
  COUNT(DISTINCT l.id) AS total_lessons,
  ROUND(
    COUNT(DISTINCT CASE WHEN up.best_score IS NOT NULL THEN l.id END)::NUMERIC
    / NULLIF(COUNT(DISTINCT l.id), 0) * 100, 1
  ) AS progress_percent,
  ROUND(
    AVG(COALESCE(up.accuracy, 0))::NUMERIC, 1
  ) AS average_accuracy
FROM topics t
CROSS JOIN auth.users u
LEFT JOIN lessons l ON l.topic_id = t.id
LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = u.id
WHERE t.is_active = true
GROUP BY t.id, u.id;

-- PROBLEM 4: Vocabulary learning has no source clip tracking
-- FIX: Ensure lesson_id FK exists in vocabulary_learning
-- (already in schema, confirm it's NOT NULL)

-- PROBLEM 5: No tracking for speaking limit usage (freemium)
-- FIX: Add usage tracking for free tier
CREATE TABLE IF NOT EXISTS user_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  speaking_attempts INTEGER DEFAULT 0,
  speaking_transcriptions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_usage_user_date ON user_daily_usage(user_id, date);

-- Trigger to increment speaking count
CREATE OR REPLACE FUNCTION increment_speaking_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_daily_usage (user_id, date, speaking_transcriptions)
  VALUES (auth.uid(), CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    speaking_transcriptions = user_daily_usage.speaking_transcriptions + 1,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PROBLEM 6: Missing index for dashboard queries
-- FIX: Add composite index for daily activity range queries
CREATE INDEX idx_activity_user_date_desc
  ON daily_activity(user_id, date DESC)
  INCLUDE (lessons_done, xp_earned);

-- PROBLEM 7: No tracking for clip session state
-- FIX: Add session_id for tracking in-progress lessons
ALTER TABLE user_clip_progress ADD COLUMN IF NOT EXISTS
  session_id UUID REFERENCES auth.users(id);

-- PROBLEM 8: Streak calculation needs timezone-safe date comparison
-- FIX: Use timezone-aware date
CREATE OR REPLACE FUNCTION get_user_local_date(user_uuid UUID)
RETURNS DATE AS $$
BEGIN
  RETURN CURRENT_DATE AT TIME ZONE COALESCE(
    (SELECT timezone FROM auth.users WHERE id = user_uuid),
    'Asia/Ho_Chi_Minh'
  );
END;
$$ LANGUAGE plpgsql;

-- FIXED TRIGGER: Streak with timezone awareness
CREATE OR REPLACE FUNCTION update_streak_on_lesson_v2()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  user_tz TEXT;
  today_local DATE;
BEGIN
  user_tz := COALESCE(
    (SELECT timezone FROM auth.users WHERE id = NEW.user_id),
    'Asia/Ho_Chi_Minh'
  );

  last_date := COALESCE(
    (SELECT last_lesson_date::DATE FROM auth.users WHERE id = NEW.user_id),
    NULL
  );

  today_local := CURRENT_DATE AT TIME ZONE user_tz;

  IF last_date IS NULL THEN
    -- First ever lesson
    UPDATE auth.users
    SET current_streak = 1,
        longest_streak = GREATEST(1, longest_streak),
        last_lesson_date = today_local,
        streak_start = today_local,
        updated_at = now()
    WHERE id = NEW.user_id;

  ELSIF last_date = today_local THEN
    -- Already practiced today, no change to streak
    UPDATE auth.users
    SET last_lesson_date = today_local,  -- Update timestamp but not streak
        updated_at = now()
    WHERE id = NEW.user_id;

  ELSIF last_date = today_local - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE auth.users
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(current_streak + 1, longest_streak),
        last_lesson_date = today_local,
        updated_at = now()
    WHERE id = NEW.user_id;

  ELSE
    -- Gap in streak
    UPDATE auth.users
    SET current_streak = 1,
        last_lesson_date = today_local,
        streak_start = today_local,
        updated_at = now()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_streak_update ON user_progress;
CREATE TRIGGER tr_streak_update
  AFTER INSERT ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_streak_on_lesson_v2();

-- PROBLEM 9: User settings needs onboarding completion flag
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS
  onboarding_completed BOOLEAN DEFAULT false;

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS
  onboarding_goal TEXT CHECK (onboarding_goal IN ('ielts','toeic','daily','business','travel','study'));

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS
  onboarding_level TEXT CHECK (onboarding_level IN ('beginner','intermediate','advanced'));
```

#### Complete Database Schema (Merged + Fixed)

```sql
-- ============================================================
-- VINALISTEN MVP DATABASE SCHEMA v1.1 (FIXED)
-- ============================================================

-- Content Tables (Public Read, Auth Required for Write)
-- ============================================================

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_vi TEXT,
  description TEXT,
  description_vi TEXT,
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#35375B',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_topics_slug ON topics(slug);
CREATE INDEX idx_topics_active ON topics(is_active) WHERE is_active = true;
CREATE INDEX idx_topics_order ON topics(order_index);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  audio_url TEXT,
  duration INTEGER, -- seconds
  vocab_level TEXT CHECK (vocab_level IN ('A1','A2','B1','B2','C1','C2')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(topic_id, slug)
);

CREATE INDEX idx_lessons_topic ON lessons(topic_id);
CREATE INDEX idx_lessons_slug ON lessons(slug);
CREATE INDEX idx_lessons_order ON lessons(topic_id, order_index);
CREATE INDEX idx_lessons_vocab_level ON lessons(vocab_level);

CREATE TABLE lesson_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  audio_url TEXT,
  duration INTEGER, -- seconds
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clips_lesson ON lesson_clips(lesson_id);
CREATE INDEX idx_clips_order ON lesson_clips(lesson_id, order_index);

-- User Tables (RLS Protected)
-- ============================================================

-- Extended user fields (Supabase Auth handles base auth.users)
-- Note: These columns are added to auth.users via migration
-- In Supabase: Use a public.profiles table instead if auth.users modifications
-- are restricted. Below assumes we can extend auth.users.

ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS
  name TEXT,
  avatar_url TEXT,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  streak_start DATE,
  last_lesson_date DATE,
  streak_freeze_count INTEGER DEFAULT 1,
  freeze_used_today BOOLEAN DEFAULT false,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  learning_goal TEXT CHECK (learning_goal IN ('ielts','toeic','daily','business','travel','study')),
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  daily_goal_minutes INTEGER DEFAULT 10,
  onboarding_completed BOOLEAN DEFAULT false;

CREATE INDEX idx_users_streak ON auth.users USING btree (current_streak DESC);
CREATE INDEX idx_users_level ON auth.users USING btree (level DESC);
CREATE INDEX idx_users_last_lesson ON auth.users(last_lesson_date);

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  accuracy DECIMAL(5,2),
  xp_earned INTEGER DEFAULT 0,
  time_seconds INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 1,
  best_score INTEGER,
  completed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_lesson ON user_progress(lesson_id);
CREATE INDEX idx_progress_date ON user_progress(completed_at DESC);

-- Include topic_id for efficient dashboard queries
CREATE INDEX idx_progress_user_topic
  ON user_progress(user_id, (SELECT topic_id FROM lessons WHERE id = user_progress.lesson_id));

CREATE TABLE user_clip_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clip_id UUID NOT NULL REFERENCES lesson_clips(id) ON DELETE CASCADE,
  transcript_input TEXT,
  accuracy DECIMAL(5,2),
  recording_url TEXT,
  transcribed_text TEXT,
  pronunciation_score DECIMAL(5,2),
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, clip_id)
);

CREATE INDEX idx_clip_progress_user ON user_clip_progress(user_id);
CREATE INDEX idx_clip_progress_clip ON user_clip_progress(clip_id);
CREATE INDEX idx_clip_progress_date ON user_clip_progress(completed_at DESC);

CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  lessons_done INTEGER DEFAULT 0,
  clips_done INTEGER DEFAULT 0,
  speaking_done INTEGER DEFAULT 0,
  time_minutes INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_activity_user ON daily_activity(user_id);
CREATE INDEX idx_activity_date ON daily_activity(date);
CREATE INDEX idx_activity_user_date ON daily_activity(user_id, date);
CREATE INDEX idx_activity_user_range ON daily_activity(user_id, date DESC);

CREATE TABLE vocabulary_learning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  mastery INTEGER DEFAULT 0 CHECK (mastery >= 0 AND mastery <= 5),
  next_review TIMESTAMPTZ,
  last_reviewed TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vocab_user ON vocabulary_learning(user_id);
CREATE INDEX idx_vocab_word ON vocabulary_learning(user_id, word);
CREATE INDEX idx_vocab_review ON vocabulary_learning(user_id, next_review)
  WHERE next_review IS NOT NULL;

CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('at_risk','streak_broken','milestone','level_up','achievement','reminder')),
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notif_user ON user_notifications(user_id);
CREATE INDEX idx_notif_user_unread ON user_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notif_date ON user_notifications(created_at DESC);

CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  push_enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '20:00',
  sound_enabled BOOLEAN DEFAULT false,
  reduced_motion BOOLEAN DEFAULT false,
  email_digest BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_goal TEXT,
  onboarding_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  speaking_attempts INTEGER DEFAULT 0,
  speaking_transcriptions INTEGER DEFAULT 0,
  ai_feedback_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_usage_user_date ON user_daily_usage(user_id, date);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_user_progress_updated
  BEFORE UPDATE ON user_progress FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_daily_activity_updated
  BEFORE UPDATE ON daily_activity FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_user_settings_updated
  BEFORE UPDATE ON user_settings FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_usage_updated
  BEFORE UPDATE ON user_daily_usage FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Upsert daily_activity on lesson complete
CREATE OR REPLACE FUNCTION upsert_daily_activity()
RETURNS TRIGGER AS $$
DECLARE
  user_tz TEXT;
BEGIN
  user_tz := COALESCE(
    (SELECT timezone FROM auth.users WHERE id = NEW.user_id),
    'Asia/Ho_Chi_Minh'
  );

  INSERT INTO daily_activity (user_id, date, lessons_done, time_minutes, xp_earned)
  VALUES (
    NEW.user_id,
    CURRENT_DATE AT TIME ZONE user_tz,
    1,
    GREATEST(0, (NEW.time_seconds / 60)::INTEGER),
    NEW.xp_earned
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    lessons_done = daily_activity.lessons_done + 1,
    time_minutes = daily_activity.time_minutes + GREATEST(0, (NEW.time_seconds / 60)::INTEGER),
    xp_earned = daily_activity.xp_earned + NEW.xp_earned,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_lesson_complete
  AFTER INSERT ON user_progress
  FOR EACH ROW EXECUTE FUNCTION upsert_daily_activity();

-- Streak update (v2 with timezone)
CREATE TRIGGER tr_streak_update
  AFTER INSERT ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_streak_on_lesson_v2();

-- Speaking usage tracking
CREATE TRIGGER tr_speaking_usage
  AFTER INSERT ON user_clip_progress
  FOR EACH ROW
  WHEN (NEW.transcribed_text IS NOT NULL)
  EXECUTE FUNCTION increment_speaking_usage();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clip_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_clips ENABLE ROW LEVEL SECURITY;

-- Users: own data only
CREATE POLICY "Users own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own clip progress" ON user_clip_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own activity" ON daily_activity FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own vocabulary" ON vocabulary_learning FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own notifications" ON user_notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own usage" ON user_daily_usage FOR ALL USING (auth.uid() = user_id);

-- Content: public read
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (is_active = true);
CREATE POLICY "Public read lessons" ON lessons FOR SELECT
  USING (topic_id IN (SELECT id FROM topics WHERE is_active = true));
CREATE POLICY "Public read clips" ON lesson_clips FOR SELECT
  USING (lesson_id IN (SELECT id FROM lessons WHERE topic_id IN (SELECT id FROM topics WHERE is_active = true)));
```

---

### P0-3: User Progress Tracking — Complete Specification

```
┌─────────────────────────────────────────────────────────────┐
│ PROBLEM: Progress tracking has multiple undefined scenarios  │
│ No clear rules for: partial completion, retries, multi-device  │
└─────────────────────────────────────────────────────────────┘
```

#### Progress Tracking Rules (RESOLVED)

```
RULE 1: What Counts as a "Completed Lesson"?
────────────────────────────────────────────
A lesson is "completed" when:
  - User has submitted transcript for ALL clips in the lesson
  - At least 1 clip has been checked (accuracy calculated)
  - A row is inserted into user_progress

A lesson is NOT completed if:
  - User quit mid-lesson (no user_progress row)
  - User only completed some clips (partial progress is LOST)
  - Audio played but no transcript submitted

⚠️  DECISION: Mid-lesson progress is NOT saved.
  Users who quit before completion lose their progress.
  This is intentional: forces full engagement.
  (If this causes user frustration, consider saving partial progress in Phase 2)


RULE 2: Best Score Tracking
────────────────────────────────────────────
When user completes a lesson multiple times:
  - INSERT new row into user_progress
  - attempt_count increments
  - best_score = MAX of all attempt accuracies

  "Hoàn thành lại" button always available.
  Each attempt = new row with attempt_count incremented.
  best_score persists across all attempts.
  latest_accuracy = most recent attempt's accuracy.


RULE 3: Streak Increment Logic
────────────────────────────────────────────
Streak increments on FIRST lesson completion of the day.
  - Multiple lessons same day = streak unchanged
  - Streak = count of CONSECUTIVE days with at least 1 lesson completion
  - Streak resets to 0 if gap >= 2 days
  - Streak is based on user's LOCAL timezone
  - Completed at midnight = counts for the NEW day

  Example:
  Day 1: Complete lesson at 11:59 PM → Day 1 streak = 1
  Day 2: Complete lesson at 12:01 AM → Day 2 streak = 2
  Day 3: No activity → Streak = 0 (broken)
  Day 4: Complete lesson → Streak = 1 (restarted)


RULE 4: XP Award Logic
────────────────────────────────────────────
XP is awarded per lesson completion (not per clip).

  For each lesson completion:
    - Calculate clip accuracy for each clip
    - Sum base_xp across all clips
    - Apply lesson-level bonuses (speed, no retry)
    - Total lesson XP = sum(clip_xp) + lesson_bonus
    - Insert total XP into user_progress.xp_earned
    - Add to auth.users.total_xp (via trigger or API)

  XP is NOT awarded for:
    - Speaking attempts without transcript (speaking XP separate)
    - Re-attempting a lesson (each attempt = new XP)
    - Listening without submitting (no XP)


RULE 5: Speaking Score Tracking
────────────────────────────────────────────
Speaking score is tracked per clip in user_clip_progress.
  - pronunciation_score: 0-100
  - recorded: BOOLEAN (did user record)
  - transcribed_text: what they said

  Speaking XP is tracked in user_clip_progress (implicit):
    - Speaking XP is added to lesson total XP
    - If user skipped speaking = 0 speaking XP

  Speaking is OPTIONAL for lesson completion.
    - User can skip all speaking → lesson still completes
    - Speaking score does NOT affect lesson accuracy
    - Speaking accuracy is tracked SEPARATELY for dashboard


RULE 6: Multi-Device Sync
────────────────────────────────────────────
All progress is stored in Supabase (server-side).
  - User A on phone → user_progress row created
  - User A on desktop → Same account → Sees same progress
  - No client-side caching of progress state
  - Pull-to-refresh always shows latest from server

  Real-time sync: NOT in MVP (Phase 2+ with Supabase Realtime)
  MVP: Pull-to-refresh is sufficient


RULE 7: Daily Activity Tracking
────────────────────────────────────────────
daily_activity table aggregates per-day stats.

  Updated via trigger on user_progress INSERT:
    - lessons_done += 1
    - time_minutes += lesson_time_seconds / 60
    - xp_earned += lesson_xp

  speaking_done: Updated via trigger on user_clip_progress INSERT
    (when transcribed_text IS NOT NULL)

  weekly_activity = SUM(daily_activity) for current week
  monthly_activity = SUM(daily_activity) for current month
```

#### Progress State Machine

```
┌──────────────────────────────────────────────────────────────────┐
│ LESSON STATE MACHINE                                             │
│                                                                   │
│    ┌─────────┐                                                   │
│    │ AVAILABLE│ (user opened lesson)                             │
│    └────┬────┘                                                   │
│         │ user plays audio                                        │
│         ▼                                                         │
│    ┌─────────┐                                                   │
│    │PLAYING  │ (audio in progress)                                │
│    └────┬────┘                                                   │
│         │ user submits transcript                                  │
│         ▼                                                         │
│    ┌──────────┐                                                  │
│    │SUBMITTED│ (awaiting result)                                  │
│    └────┬─────┘                                                   │
│         │ score received                                          │
│         ▼                                                         │
│    ┌─────────┐                                                   │
│    │RESULT   │ (showing accuracy)                                 │
│    └────┬────┘                                                   │
│         │ user navigates to next clip                             │
│         ▼                                                         │
│    ┌─────────────┐                                                │
│    │ IN_PROGRESS │ (clip 2, 3...)                                │
│    └──────┬──────┘                                                │
│           │ last clip completed                                    │
│           ▼                                                        │
│    ┌───────────┐                                                 │
│    │ COMPLETE │ (lesson finished)                                 │
│    └─────┬─────┘                                                 │
│          │ user can re-attempt                                      │
│          └─────────────────────────────────────────► AVAILABLE   │
│                                                                   │
│  EXIT PATHS:                                                       │
│  - User clicks "Thoát" mid-lesson → NO SAVE, back to topic       │
│  - Browser closed → NO SAVE, next visit = new attempt            │
│  - "Bỏ qua" clip → Skip to next (no score for skipped clip)       │
└──────────────────────────────────────────────────────────────────┘
```

---

### P0-4: Authentication Flow — Complete Specification

```
┌─────────────────────────────────────────────────────────────┐
│ PROBLEM: Auth has undefined edge cases:                      │
│ guest mode, session expiry, multi-tab, password reset      │
└─────────────────────────────────────────────────────────────┘
```

#### Auth Flow Specification (RESOLVED)

```
AUTHENTICATION METHODS:
├── Email + Password (Supabase Auth)
├── Google OAuth (Supabase Auth)
└── Guest Mode (no account, limited features)

────────────────────────────────────────────
METHOD 1: EMAIL + PASSWORD
────────────────────────────────────────────
Register:
  1. User enters email + password (8+ chars, 1 uppercase, 1 number)
  2. Zod validation on client
  3. Server: Supabase Auth signup
  4. Success → auto-login → redirect to /onboarding
  5. Failure → show error message in Vietnamese

Login:
  1. User enters email + password
  2. Supabase Auth signInWithPassword
  3. Success → check onboarding_completed
     - completed=true → redirect to /dashboard
     - completed=false → redirect to /onboarding
  4. Failure → "Email hoặc mật khẩu không đúng"
  5. Lock account after 5 failed attempts (10 minutes)

Password Reset:
  1. User clicks "Quên mật khẩu?" on login page
  2. Enter email → Supabase Auth resetPassword
  3. Success → "Email đặt lại mật khẩu đã được gửi"
  4. User clicks link in email → /auth/reset-password page
  5. Enter new password (same rules as register)
  6. Supabase Auth updateUser
  7. Success → redirect to /auth/login

────────────────────────────────────────────
METHOD 2: GOOGLE OAUTH
────────────────────────────────────────────
Login with Google:
  1. User clicks "Đăng nhập với Google"
  2. Redirect to Google OAuth consent screen
  3. Google callback → /auth/callback?code=xxx
  4. Server: Supabase Auth exchangeCodeForSession
  5. Check if user exists:
     - New user → auto-login → /onboarding
     - Existing user → check onboarding → /dashboard or /onboarding

Edge case: Google email already registered with email/password
  → "Email này đã được đăng ký. Vui lòng đăng nhập bằng email và mật khẩu."
  → Don't link Google account automatically

────────────────────────────────────────────
METHOD 3: GUEST MODE
────────────────────────────────────────────
Skip Signup (guest browsing):
  1. User clicks "Bỏ qua, học thử" on landing/onboarding
  2. Create anonymous session (no Supabase account)
  3. Guest user:
     - Can browse topics and lessons
     - Can play audio
     - CANNOT save progress, streaks, history
     - "Đăng ký để lưu tiến độ" banner shown
  4. Prompt to register: After first lesson, after first streak day

Convert guest to account:
  1. User clicks "Đăng ký" while in guest mode
  2. Show register form
  3. After successful registration:
     - Migrate any guest state
     - (Guest state = none in MVP, progress only saved after register)
  4. Redirect to /onboarding (if not completed) or /dashboard

⚠️  DECISION: MVP does NOT save guest progress.
  Guests can try lessons but progress is NOT saved.
  This simplifies auth logic significantly.
  Guest mode = just a demo experience.

────────────────────────────────────────────
SESSION MANAGEMENT
────────────────────────────────────────────
Token handling:
  - Supabase Auth handles JWT access tokens (1 hour expiry)
  - Refresh tokens handled automatically by Supabase client
  - Session stored in HTTP-only cookies (SSR safe)
  - Middleware refreshes session on each request

Multi-tab handling:
  - Tab 1: User logs out
  - Tab 2: Any auth-required action → 401 → redirect to /auth/login
  - Implement: BroadcastChannel API to sync logout across tabs

Session expiry handling:
  - Access token expires after 1 hour
  - Supabase client auto-refreshes with refresh token
  - If refresh fails (e.g., user deleted account):
    → Clear local state
    → Redirect to /auth/login with message: "Phiên đăng nhập hết hạn"

Protected route middleware:
  Routes requiring auth:
    /dashboard, /topics/[slug], /listen/[id], /progress,
    /history, /settings

  Middleware logic:
    1. Check for Supabase session cookie
    2. If no session:
       - Redirect to /auth/login?redirect=[original_path]
    3. If session exists:
       - Allow access
       - Attach user_id to request context

Public routes (no auth required):
  /, /auth/login, /auth/register, /auth/callback,
  /auth/reset-password, /topics (can browse, no progress saved)

────────────────────────────────────────────
AUTH STATE IN REACT
────────────────────────────────────────────
AuthProvider (wraps entire app):
  - useAuth() → { user, session, isLoading, login, logout, register }
  - useUser() → { user profile with streak, level, XP }
  - isAuthenticated → boolean
  - isOnboarded → boolean

Auth state flow:
  1. App loads → Supabase client checks for session cookie
  2. If session found → fetch user profile → setAuth(user)
  3. If no session → setAuth(null)
  4. Loading state during 1 → show skeleton or spinner

Hydration safety:
  - Supabase SSR client handles this automatically
  - NEVER store auth state in localStorage (causes hydration mismatch)
  - Server renders without user data → client hydrates with user data
  - Solution: useSupabaseUser() from @supabase/auth-helpers-react

────────────────────────────────────────────
ERROR HANDLING (Auth)
────────────────────────────────────────────
"Email đã được đăng ký" → User exists, show login link
"Email hoặc mật khẩu không đúng" → Generic message (don't reveal which)
"Phiên đăng nhập hết hạn" → Redirect to login
"Tài khoản đã bị khóa" → Show lockout timer
"Không thể kết nối" → Retry button
"Đã xảy ra lỗi" → Generic + Sentry error ID
```

---

### P0-5: Speech Recognition Error Handling — Complete Specification

```
┌─────────────────────────────────────────────────────────────┐
│ PROBLEM: Speech recognition has many failure modes but no   │
│ clear handling strategy defined                              │
└─────────────────────────────────────────────────────────────┘
```

#### Speech Recognition Error Handling (RESOLVED)

```
ARCHITECTURE:
┌─────────────────────────────────────────────────────────────┐
│                    SPEECH FLOW (MVP)                          │
│                                                             │
│  User records audio                                          │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────┐                                        │
│  │ Browser check:  │                                        │
│  │ SpeechRecognition│                                       │
│  │ API available?  │                                        │
│  └───────┬─────────┘                                        │
│     YES  │         NO (Safari iOS, Firefox)                │
│     ▼    │              ▼                                    │
│  ┌──────────────┐    ┌────────────────┐                     │
│  │ Web Speech API│    │  Upload audio  │                     │
│  │ (free)        │    │  to Supabase  │                     │
│  └───────┬──────┘    └───────┬────────┘                     │
│          │                    │                              │
│          ▼                    ▼                               │
│  ┌────────────────────────────────┐                         │
│  │       TRANSCRIPTION RESULT      │                         │
│  │   (text + confidence)           │                         │
│  └──────────────┬─────────────────┘                         │
│                 │                                            │
│                 ▼                                            │
│  ┌────────────────────────────────┐                         │
│  │       SCORE PRONUNCIATION       │                         │
│  │   (compare vs expected)         │                         │
│  └────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

#### Web Speech API Flow (Chrome, Edge)

```
INITIALIZATION:
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()
  recognition.lang = 'en-US'
  recognition.continuous = false
  recognition.interimResults = true    -- Show interim results
  recognition.maxAlternatives = 1

START RECORDING:
  1. recognition.start()
  2. Set recording state: 'recording'
  3. Start timer (count up, max 30s)
  4. Show live waveform (AudioContext + AnalyserNode)

INTERIM RESULTS (while speaking):
  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      const confidence = event.results[i][0].confidence
      -- Display interim with opacity 0.5
    }
  }

FINAL RESULT (when user stops or 30s timeout):
  recognition.onresult = (event) => {
    const finalTranscript = event.results[0][0].transcript
    const confidence = event.results[0][0].confidence
    -- Display final with opacity 1.0
    -- Stop recording
    -- Send to scoring
  }

recognition.onspeechend = () => {
  -- User stopped speaking naturally
  -- recognition.stop()
}

recognition.onend = () => {
  -- Recording stopped
  -- If no result yet: show error
}

recognition.onerror = (event) => {
  switch(event.error) {
    case 'no-speech':
      -- User didn't say anything
      -- Show: "Không phát hiện giọng nói. Vui lòng thử lại."
      -- Auto-stop timer
      -- Show re-record button
      break

    case 'audio-capture':
      -- No microphone found
      -- Show: "Không tìm thấy microphone. Kiểm tra cài đặt thiết bị."
      -- Link to browser settings guide
      break

    case 'not-allowed':
      -- Microphone permission denied
      -- Show: "VinaListen cần quyền truy cập microphone để luyện nói."
      -- Button: "Mở cài đặt"
      -- Guide to enable in browser settings
      break

    case 'network':
      -- Network error during recognition
      -- Fallback to Whisper API
      break

    case 'aborted':
      -- User manually stopped (shouldn't happen with auto-stop)
      -- Ignore, normal flow
      break

    case 'service-not-allowed':
      -- Browser doesn't support or has disabled
      -- Fallback to Whisper API
      break

    default:
      -- Unknown error
      -- Show: "Đã xảy ra lỗi. Vui lòng thử lại."
      -- Fallback to Whisper
  }
}
```

#### Whisper API Fallback Flow (Safari iOS, Firefox)

```
STEP 1: Upload Recording
  1. Recording stored as Blob (audio/webm)
  2. POST /api/speaking/upload with FormData
     { audio: Blob, clip_id: uuid }
  3. Server uploads to Supabase Storage
  4. Return: { recording_url: string, duration: number }

STEP 2: Transcribe via Whisper
  1. Server: POST to OpenAI Whisper API
     Model: whisper-1
     File: audio from storage URL
  2. Return: { text: string, language: "en", duration: number }

STEP 3: Error Handling
  Success:
    → Return transcript to client
    → Score pronunciation

  Whisper Error: "Invalid file format"
    → "File không hợp lệ. Thử ghi âm lại."
    → Allow re-record

  Whisper Error: "Maximum file size exceeded" (>25MB)
    → "Recording quá dài. Vui lòng ghi âm ngắn hơn."
    → Allow re-record

  Whisper Error: Network failure
    → Retry once automatically after 2 seconds
    → If retry fails:
      → "Không thể nhận diện giọng nói. Vui lòng thử lại."
      → Allow re-record
      → Do NOT fallback to Web Speech (already known to be unavailable)

  Whisper Error: API key invalid
    → Log to Sentry
    → Show: "Dịch vụ nhận diện giọng nói đang bảo trì. Vui lòng thử lại sau."
    → Do NOT expose API key error to user

  Whisper Error: Rate limit (429)
    → Retry after 60 seconds
    → If rate limited:
      → "Dịch vụ đang bận. Vui lòng thử lại trong giây lát."

  Whisper Error: Empty transcription
    → "Không phát hiện giọng nói. Vui lòng thử lại với âm thanh rõ ràng hơn."

  Whisper Budget Exceeded:
    → If OpenAI usage > $100/month (configured):
    → "Tính năng nhận diện giọng nói tạm thời giới hạn. Nâng cấp Premium để sử dụng không giới hạn."
    → Log to Sentry for monitoring

STEP 4: Cost Tracking
  - Track transcription_count in user_daily_usage
  - Free limit: 10 transcriptions/day
  - Soft gate: Warn at 8, block at 10
  - Display: "Bạn đã sử dụng 7/10 lượt nhận diện hôm nay"
  - If limit reached:
    → "Bạn đã dùng hết lượt nhận diện hôm nay. Học tiếp vào ngày mai hoặc nâng cấp Premium."
```

#### Recording Quality Guidelines (User-Facing)

```
MICROPHONE QUALITY TIPS (shown on recording screen):
  1. "Nói rõ ràng, gần microphone"
  2. "Tránh tiếng ồn xung quanh"
  3. "Nói tự nhiên, không cần quá chậm"
  4. "Giữ khoảng cách 10-15cm từ miệng đến thiết bị"

SILENCE DETECTION:
  - After 3 seconds of silence during recording:
    → Show tooltip: "Đang chờ... Tiếp tục nói hoặc dừng ghi âm"
  - After 5 seconds of silence:
    → Auto-stop recording (optional, can disable in settings)
    → Process what was recorded

RECORDING TOO SHORT:
  - Duration < 1 second
  - Show: "Recording quá ngắn. Vui lòng nói ít nhất 1 giây."
  → Discard and show re-record

RECORDING TOO LONG:
  - Auto-stop at 30 seconds
  - Show: "Đã đạt giới hạn 30 giây"
  → Process first 30 seconds only
```

---

### P0-6: Freemium Model — Final Decision

```
┌─────────────────────────────────────────────────────────────┐
│ PROBLEM: Conflicting freemium definitions across documents │
└─────────────────────────────────────────────────────────────┘
```

#### Freemium Model (FINAL — LOCKED)

```
┌─────────────────────────────────────────────────────────────┐
│ DECISION: REVERSE LOGIC                                     │
│                                                             │
│ OLD: Free = limited content, unlimited AI                  │
│ NEW: Free = unlimited content, limited speaking            │
└─────────────────────────────────────────────────────────────┘

TIER 0 — FREE (Always, forever)
├── All audio lessons (unlimited)
├── All topics and lessons
├── Transcript checking (unlimited)
├── Basic scoring (accuracy %)
├── Progress tracking
├── Basic streak system
├── History (basic)
├── Dashboard (basic)
├── 1 speaking attempt per day (teaser)
└── Supported by: future ethical ads or VND 0

TIER 1 — STARTER: 49,000 VND/tháng (~$2)
├── Unlimited speaking practice
├── 50 AI pronunciation feedback/month
├── Basic vocabulary (flashcard)
├── 3 reviews/day (spaced repetition)
├── Basic analytics
└── Ad-free experience

TIER 2 — PRO: 99,000 VND/tháng (~$4)
├── Everything in Starter
├── Unlimited AI pronunciation feedback
├── Full spaced repetition
├── Advanced analytics (weak areas, patterns)
├── Offline mode (download 10 lessons)
├── AI Listening Coach (chat) — Phase 4
├── Priority support
└── Ad-free experience

⚠️  MVP = TIER 0 ONLY (Free)
  Premium tiers are Phase 3 (Month 4+)
  For MVP: No gates, no limits, everything free
  Purpose of MVP = validate core loop + user retention
  Payment infrastructure added in Phase 3

⚠️  RATIONALE FOR FREE MVP:
  1. No payment infrastructure to build
  2. Maximum user acquisition (no friction)
  3. Validate retention before monetization
  4. Simple ops (no refund logic, no subscription management)
  5. Revenue focus: Phase 3 onwards
```

---

## PART 2: P1 HIGH-PRIORITY FIXES (< 3 days each)

### P1-1: Daily Goal System — Complete Specification

```
┌─────────────────────────────────────────────────────────────┐
│ DEFINITION: What is "Today's Practice"?                      │
└─────────────────────────────────────────────────────────────┘

DAILY GOAL SETTING (Set during onboarding, adjustable):
  Options: 5 phút (1 lesson) | 10 phút (2 lessons) | 20 phút (3 lessons) | 30 phút (5 lessons)

DAILY GOAL DISPLAY:
  Dashboard: "🎯 Mục tiêu hôm nay: 2/3 bài"
  Header (optional): Progress dot or mini progress bar

DAILY GOAL TRACKING:
  lessons_today = COUNT(user_progress) WHERE date = today
  goal_met = lessons_today >= daily_goal_lessons

GOAL MET:
  Show celebration toast: "Mục tiêu hôm nay đã đạt! 🔥"
  Streak incremented
  XP bonus: +5 XP for meeting daily goal

GOAL NOT MET (at midnight):
  No penalty
  Show next day: "Hôm qua bạn chưa đạt mục tiêu. Hôm nay cố gắng nhé!"

ADAPTIVE DAILY GOAL (Phase 2, not MVP):
  Based on streak:
  - Streak 1-7:   1 lesson/day (build habit)
  - Streak 8-14:  2 lessons/day
  - Streak 15-30: 3 lessons/day
  - Streak 31+:   5 lessons/day
```

### P1-2: Mobile Keyboard Handling — Complete Specification

```
┌─────────────────────────────────────────────────────────────┐
│ PROBLEM: Textarea gets covered by keyboard on mobile        │
└─────────────────────────────────────────────────────────────┘

SOLUTION:

1. When textarea focused (mobile):
   - Scroll page so textarea is visible
   - Use: textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })

2. Submit button:
   - Position: fixed, bottom: 0, above keyboard
   - This happens naturally with position: fixed
   - BUT: On iOS Safari, position: fixed behaves oddly with keyboard

3. iOS Safari specific:
   - Use: window.visualViewport API
   - Listen to resize events
   - Adjust padding-bottom to account for keyboard

4. Layout adjustments:
   Desktop/Tablet:
   ┌────────────────────────────────────────┐
   │ Audio Player                           │
   ├────────────────────────────────────────┤
   │                                        │
   │ Transcript Textarea                    │
   │                                        │
   ├────────────────────────────────────────┤
   │ Submit Button          [Word count]    │
   └────────────────────────────────────────┘

   Mobile (keyboard open):
   ┌────────────────────────┐
   │ Audio Player (shrunk)   │
   ├────────────────────────┤
   │ Audio Controls          │
   ├────────────────────────┤
   │                        │
   │ Transcript (textarea)   │ ← Scrolls into view
   │                        │
   ├────────────────────────┤
   │ [Submit] [Words: 12]   │ ← Fixed above keyboard
   └────────────────────────┘

5. Code snippet:
   useEffect(() => {
     const handleFocus = () => {
       setTimeout(() => {
         textareaRef.current?.scrollIntoView({
           behavior: 'smooth',
           block: 'center',
         })
       }, 300) // Wait for keyboard animation
     }
     textarea.addEventListener('focus', handleFocus)
     return () => textarea.removeEventListener('focus', handleFocus)
   }, [])
```

### P1-3: Empty & Loading States — Complete Specification

```
┌─────────────────────────────────────────────────────────────┐
│ DEFINITION: Every UI state must be designed                 │
└─────────────────────────────────────────────────────────────┘

STATE MATRIX:

┌─────────────────┬─────────────┬──────────────────┬────────────────┐
│ Page             │ Loading      │ Empty            │ Error          │
├─────────────────┼─────────────┼──────────────────┼────────────────┤
│ Topics           │ Skeleton     │ No topics illust. │ Retry button   │
│ Topic Detail     │ Skeleton     │ No lessons yet   │ Retry button   │
│ Lesson Player    │ Skeleton     │ N/A              │ Retry + audio  │
│ Transcript Input │ N/A          │ N/A              │ N/A            │
│ Result           │ Spinner      │ N/A              │ N/A            │
│ Speaking         │ Spinner      │ N/A              │ Mic guide      │
│ Dashboard        │ Skeleton     │ Welcome illust.  │ Retry button   │
│ History          │ Skeleton     │ No history illust│ Retry button   │
│ Progress        │ Skeleton     │ Welcome illust.  │ Retry button   │
│ Streak          │ Skeleton     │ N/A (always data)│ Retry button   │
│ Settings        │ Skeleton     │ N/A              │ Retry button   │
│ Search Results  │ Skeleton     │ "No results"     │ Retry button   │
└─────────────────┴─────────────┴──────────────────┴────────────────┘

SKELETON PATTERN:
  - Match exact dimensions of real content
  - Animate with shimmer (left-to-right gradient)
  - Gray: #E5E7EB (light mode), #374151 (dark mode)
  - Duration: 1.5s infinite

EMPTY STATE PATTERN:
  - Illustration (simple SVG, relevant)
  - Headline: What's missing (max 5 words)
  - Description: Why it matters (max 2 sentences)
  - CTA Button: What to do next
  - Examples:

  Topics (empty):
  🎧 → "Chưa có bài học nào"
     → "Nội dung đang được cập nhật. Quay lại sau nhé!"
     → [Quay lại trang chủ]

  History (empty):
  📚 → "Chưa có lịch sử học tập"
     → "Hoàn thành bài học đầu tiên để bắt đầu theo dõi!"
     → [Bắt đầu học]

  Dashboard (new user):
  🚀 → "Chào mừng bạn!"
     → "Bạn chưa học bài nào. Bắt đầu hành trình học tiếng Anh ngay!"
     → [Chọn topic]

  Search (no results):
  🔍 → "Không tìm thấy kết quả"
     → "Thử từ khóa khác hoặc kiểm tra chính tả."
     → [Xóa tìm kiếm]

ERROR STATE PATTERN:
  - Error icon (⚠️ or 🚫)
  - Headline: What went wrong (max 5 words)
  - Description: What user can do (max 2 sentences)
  - Action: Retry button (primary) or Go back (secondary)
  - Example:
    🌐 → "Không thể kết nối"
       → "Kiểm tra kết nối mạng và thử lại."
       → [Thử lại]

LOADING (SPINNER) — Only for < 1 second actions:
  - Small spinner (16x16px) inside buttons during submit
  - Spinner replaces button text
  - Button stays same size (don't shift layout)
```

### P1-4: Color Contrast — Accessibility Fixes

```
┌─────────────────────────────────────────────────────────────┐
│ PROBLEM: --accent (#FF5632) fails WCAG AA on white          │
│ --warning (#FFAB00) fails WCAG AA on white                  │
└─────────────────────────────────────────────────────────────┘

FIX — Add accessible dark variants:

--accent:         #FF5632 → For dark backgrounds only (not on white)
--accent-dark:    #CC3A1A → For white/light backgrounds (WCAG AA pass)
--accent-muted:  #FFE5E0 → For subtle backgrounds, very light accent

--warning:        #FFAB00 → For dark backgrounds only
--warning-dark:   #CC8800 → For white/light backgrounds (WCAG AA pass)
--warning-muted: #FFF4D6 → For subtle warning backgrounds

WCAG AA Compliance Map:
┌─────────────────────┬──────────┬──────────┬──────────┐
│ Color                │ On White │ On Dark │ On Gray  │
├─────────────────────┼──────────┼──────────┼──────────┤
│ --primary (#35375B) │ ✅ 9.8:1 │         │          │
│ --accent (#FF5632)  │ ❌ 3.2:1 │ ✅ 6.2:1│ ✅ 5.1:1  │
│ --accent-dark       │ ✅ 4.8:1 │         │          │
│ --success (#00BE7C)│ ✅ 4.3:1 │         │          │
│ --error (#FF3257)  │ ✅ 4.7:1 │         │          │
│ --warning (#FFAB00)│ ❌ 1.9:1 │ ✅ 8.1:1│          │
│ --warning-dark      │ ✅ 4.5:1 │         │          │
│ --dark (#2B2727)   │ ✅ 12:1  │         │          │
└─────────────────────┴──────────┴──────────┴──────────┘

USAGE RULES:
- Primary text: --primary on white
- Accent buttons on white: Use --accent-dark
- Warning text on white: Use --warning-dark
- Error text on white: --error (passes)
- Success text on white: --success (passes)
- Accent on dark background: Use --accent
- Warning on dark background: Use --warning
```

---

## PART 3: CANVAS — Quick Reference Cards

### Canvas 1: Scoring Decision Tree

```
                    ┌─────────────────────────┐
                    │ User submits transcript  │
                    └───────────┬─────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │ Normalize both strings │
                    │ (lowercase, trim, strip│
                    │  punctuation)           │
                    └───────────┬─────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │ Tokenize into words     │
                    └───────────┬─────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │ LCS alignment algorithm │
                    └───────────┬─────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │ Classify each word:    │
                    │ CORRECT / WRONG /       │
                    │ MISSING / EXTRA         │
                    └───────────┬─────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │ accuracy =              │
                    │ correct / expected × 100│
                    └───────────┬─────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │ XP = accuracy × 10     │
                    │ + bonuses (perfect,     │
                    │  speed, no retry)       │
                    └─────────────────────────┘
```

### Canvas 2: Auth Decision Flow

```
              ┌─────────────────────────────────────┐
              │ User lands on /auth/login          │
              └─────────────────┬─────────────────┘
                                ▼
              ┌─────────────────────────────────────┐
              │ Has session cookie?                 │
              └─────────────────┬───────────────────┘
                    YES          │          NO
                    ▼                      ▼
        ┌──────────────┐    ┌─────────────────────────┐
        │ Onboarded?   │    │ Show login form          │
        └──────┬───────┘    └───────────┬─────────────┘
          YES  │ NO                     ▼
          ▼    ▼             ┌─────────────────────────┐
    ┌──────────┐             │ Login success?           │
    │ /dashboard│             └───────────┬─────────────┘
    └──────────┘                   YES     │     NO
           ▲                        ▼       ▼
           │           ┌──────────────┐  "Email hoặc
           │           │ Onboarded?   │   mật khẩu
           │           └──────┬───────┘   không đúng"
           │             YES  │ NO
           │             ▼    ▼
           │       ┌──────────┐  /onboarding
           └───────│/dashboard│
                   └──────────┘
```

### Canvas 3: Speech Recognition Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    SPEECH RECOGNITION                       │
│                                                              │
│  Recording ──► [Check browser support]                     │
│                    │                                        │
│         ┌──────────┴──────────┐                            │
│         │                     │                            │
│         ▼ (Chrome/Edge)       ▼ (Safari/Firefox)          │
│  ┌───────────────┐      ┌───────────────┐                 │
│  │ Web Speech API│      │ Supabase Edge │                 │
│  │ (free)        │      │ Function      │                 │
│  └───────┬───────┘      │ (Whisper API) │                 │
│          │              └───────┬───────┘                 │
│          │                      │                          │
│          └──────────┬───────────┘                          │
│                     ▼                                       │
│          ┌───────────────────┐                            │
│          │ Transcript Result   │                            │
│          │ text: "i woke up..."│                           │
│          └─────────┬───────────┘                           │
│                    ▼                                        │
│          ┌───────────────────┐                            │
│          │ Pronunciation Score│                            │
│          │ Accuracy × 0.5    │                            │
│          │ Fluency × 0.25    │                            │
│          │ Completeness × 0.25                            │
│          └─────────┬───────────┘                            │
│                    ▼                                        │
│          ┌───────────────────┐                            │
│          │ Display Results    │                            │
│          │ + AI Feedback     │                            │
│          └───────────────────┘                            │
└──────────────────────────────────────────────────────────────┘

ERROR HANDLING:
  no-speech          → "Không phát hiện giọng nói"
  audio-capture      → "Không tìm thấy microphone"
  not-allowed        → "Cần quyền truy cập microphone"
  network            → Retry → Whisper fallback
  empty result       → "Recording quá ngắn hoặc không rõ"
  timeout            → Process what was recorded
  whisper-error      → "Dịch vụ đang bảo trì, thử lại sau"
```

---

*Document End — VinaListen MVP P0-P1 Gap Specifications v1.0*
*These specifications must be resolved before implementation Phase B*
