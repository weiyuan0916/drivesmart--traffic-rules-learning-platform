# VinaListen — Technical Design Document
## Database Schema · API Contracts · Folder Structure · State Management

**Date:** 2026-06-07
**Version:** 2.0 — Laravel 13 Stack
**Updated:** 2026-06-07
**Based on:** PRD VinaListen v1.0 + UX Specification + Feature Specification

---

## PHẦN 1: DATABASE SCHEMA

### 1.1 Schema Overview

```
DATABASE: PostgreSQL via Supabase (managed, free tier — database only, no auth)
AUTHENTICATION: Laravel Sanctum (SPA, bearer tokens)
STORAGE: Cloudflare R2 (S3-compatible, audio files)
SPEECH: Browser Web Speech API (Chrome/Edge) — no Whisper
HOSTING FRONTEND: Vercel (free tier, auto-deploy)
HOSTING BACKEND: Bizfly VPS (primary) / Railway (fallback)
CDN: Cloudflare CDN for R2 assets
SSL: Let's Encrypt via Certbot
DOMAIN: vinalisten.app (frontend), api.vinalisten.app (backend)
```

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                      │
│   Mobile (iOS Safari, Android Chrome)                                     │
│   Desktop (Chrome, Safari, Firefox, Edge)                                │
└─────────────────────────────┬───────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           VERCEL (Frontend)                              │
│   React 19 + Vite + TanStack Query + Zustand                           │
│   Static hosting + Edge Network                                          │
│   URL: https://vinalisten.app                                           │
└─────────────────────────────┬───────────────────────────────────────────┘
                            │ REST API (HTTPS)
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BIZFLY VPS / RAILWAY (Backend)                     │
│   Laravel 13 + PHP 8.3                                                   │
│   Laravel Sanctum (Bearer Token Auth)                                    │
│   API Endpoints                                                         │
│   URL: https://api.vinalisten.app                                       │
└──────────┬──────────────────────────────────┬──────────────────────────┘
           │ PostgreSQL                       │ S3-compatible
           ▼                                  ▼
┌──────────────────────┐            ┌──────────────────────────────────┐
│  SUPABASE            │            │  CLOUDFLARE R2                   │
│  PostgreSQL (Free)   │            │  Audio Storage                   │
│  500MB DB            │            │  vinalisten-audio bucket         │
│  50K Auth MAU        │            │  Signed URLs for auth users       │
└──────────────────────┘            └──────────────────────────────────┘
```

### 1.3 Frontend Architecture

```
REACT 19 + VITE + TAILWIND CSS v4

┌─────────────────────────────────────────────┐
│ FRONTEND (Vite SPA)                         │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐ │
│  │ TanStack│  │ Zustand  │  │ React     │ │
│  │ Query   │  │ (stores) │  │ Router    │ │
│  └────┬────┘  └─────┬────┘  └─────┬─────┘ │
│       │              │             │        │
│       ▼              ▼             ▼        │
│  ┌─────────────────────────────────────────┐│
│  │           API CLIENT                    ││
│  │  Base URL: VITE_API_URL               ││
│  │  Auth: Bearer Token (Laravel Sanctum) ││
│  │  Error: Consistent JSON responses      ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘

STATE MANAGEMENT:
├── TanStack Query v5  → Server state (topics, lessons, progress)
├── Zustand v5         → Client state (auth, audio player, UI)
└── React useState     → Local component state

WHY ZUSTAND:
├── Simpler than Redux (less boilerplate)
├── Works with SSR (can hydrate from server)
├── Persist middleware for auth state
└── TypeScript-friendly

WHY TANSTACK QUERY:
├── Automatic caching + background refetch
├── Optimistic updates
├── Pagination support
├── Devtools for debugging
└── TypeScript-native
```

### 1.4 Backend Architecture

```
LARAVEL 13 + PHP 8.3 + SANCTUM

┌─────────────────────────────────────────────┐
│ LARAVEL API (Bizfly VPS / Railway)          │
│                                             │
│  ┌─────────────┐  ┌────────────────────┐   │
│  │ Controllers │  │ API Resources      │   │
│  │ (thin)     │  │ (transform)       │   │
│  └──────┬──────┘  └────────────────────┘   │
│         │                                   │
│  ┌──────▼──────────────────────────────────┐│
│  │         SERVICE LAYER                    ││
│  │  ScoringService / AuthService /         ││
│  │  ProgressService / AudioService         ││
│  └──────┬──────────────────────────────────┘│
│         │                                   │
│  ┌──────▼──────┐  ┌────────────────────┐   │
│  │ Models      │  │ Laravel Sanctum     │   │
│  │ (Eloquent)  │  │ (Token auth)       │   │
│  └──────┬──────┘  └────────────────────┘   │
│         │                                   │
│         ▼                                   │
│  ┌────────────┐                             │
│  │ Database   │                             │
│  │ (PostgreSQL│                             │
│  │  via       │                             │
│  │  Supabase) │                             │
│  └────────────┘                             │
└─────────────────────────────────────────────┘

API VERSIONING:
├── /api/v1/*  (current)
└── Prepared for /api/v2/* when breaking changes needed

RESPONSE FORMAT:
{
  "data": T,
  "message": "string (optional)",
  "meta": { "pagination": ... } (optional)
}

ERROR FORMAT:
{
  "code": "E_AUTH_001",
  "message": "Thông tin đăng nhập không hợp lệ",
  "errors": { "field": ["message"] } (optional, validation)
}
```

### 1.2 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USERS                                              │
│  ┌──────────────┬────────────────────────────────────────────────────┐    │
│  │ id           │ uuid, PK, default gen_random_uuid()                │    │
│  │ email        │ text, unique, not null                             │    │
│  │ name         │ text                                               │    │
│  │ avatar_url   │ text                                               │    │
│  │ current_streak│ integer, default 0                                │    │
│  │ longest_streak│ integer, default 0                                │    │
│  │ streak_start │ date                                               │    │
│  │ last_lesson_date│ date                                            │    │
│  │ streak_freeze_count│ integer, default 1                           │    │
│  │ freeze_used_today│ boolean, default false                         │    │
│  │ total_xp     │ integer, default 0                                │    │
│  │ level        │ integer, default 1                                │    │
│  │ learning_goal│ text, enum('ielts','toeic','daily','business')   │    │
│  │ timezone     │ text, default 'Asia/Ho_Chi_Minh'                  │    │
│  │ created_at   │ timestamp, default now()                          │    │
│  │ updated_at   │ timestamp, default now()                          │    │
│  └──────────────┴────────────────────────────────────────────────────┘    │
│                                    │ 1:N                                  │
│                                    │                                      │
│              ┌─────────────────────┼─────────────────────┐              │
│              │                     │                     │              │
│              ▼                     ▼                     ▼              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │  USER_PROGRESS   │  │ USER_CLIP_PROG  │  │ VOCAB_LEARNING   │     │
│  │  (lesson-level)  │  │  (clip-level)   │  │                 │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│              │                     │                     │              │
│              │                     │                     │              │
│              └─────────────────────┴─────────────────────┘              │
│                                    │                                      │
│                                    │ N:1                                  │
│                                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                          LESSONS                                   │   │
│  │  ┌─────────────┬────────────────────────────────────────────┐    │   │
│  │  │ id         │ uuid, PK                                   │    │   │
│  │  │ topic_id   │ uuid, FK → topics.id                       │    │   │
│  │  │ slug       │ text, unique with topic_id                  │    │   │
│  │  │ name       │ text, not null                              │    │   │
│  │  │ audio_url  │ text                                        │    │   │
│  │  │ duration   │ integer (seconds)                           │    │   │
│  │  │ vocab_level│ text (A1/A2/B1/B2/C1/C2)                   │    │   │
│  │  │ order_index│ integer                                     │    │   │
│  │  │ created_at  │ timestamp                                   │    │   │
│  │  └─────────────┴────────────────────────────────────────────┘    │   │
│  │                                    │ 1:N                          │   │
│  │                                    ▼                              │   │
│  │  ┌──────────────────────────────────────────────────────────┐    │   │
│  │  │                    LESSON_CLIPS                           │    │   │
│  │  │  ┌────────────┬─────────────────────────────────────┐   │    │   │
│  │  │  │ id        │ uuid, PK                             │   │    │   │
│  │  │  │ lesson_id │ uuid, FK → lessons.id                │   │    │   │
│  │  │  │ transcript│ text, not null                        │   │    │   │
│  │  │  │ audio_url │ text                                 │   │    │   │
│  │  │  │ duration  │ integer (seconds)                     │   │    │   │
│  │  │  │ order_index│ integer                              │   │    │   │
│  │  │  └────────────┴─────────────────────────────────────┘   │    │   │
│  │  └──────────────────────────────────────────────────────────┘    │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────────────────────────────────────┐    │   │
│  │  │                      TOPICS                               │    │   │
│  │  │  ┌─────────────┬────────────────────────────────────┐   │    │   │
│  │  │  │ id         │ uuid, PK                          │   │    │   │
│  │  │  │ slug       │ text, unique                       │   │    │   │
│  │  │  │ name       │ text, not null                     │   │    │   │
│  │  │  │ name_vi    │ text                               │   │    │   │
│  │  │  │ description│ text                               │   │    │   │
│  │  │  │ icon       │ text (emoji)                       │   │    │   │
│  │  │  │ color      │ text (hex)                         │   │    │   │
│  │  │  │ order_index│ integer                            │   │    │   │
│  │  │  │ is_active  │ boolean, default true               │   │    │   │
│  │  │  │ created_at │ timestamp                          │   │    │   │
│  │  │  └─────────────┴────────────────────────────────────┘   │    │   │
│  │  └──────────────────────────────────────────────────────────┘    │   │
│  │                                                                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      DAILY_ACTIVITY                               │   │
│  │  ┌──────────────┬────────────────────────────────────────────┐  │   │
│  │  │ id           │ uuid, PK                                    │  │   │
│  │  │ user_id      │ uuid, FK → users.id                         │  │   │
│  │  │ date         │ date                                        │  │   │
│  │  │ lessons_done │ integer, default 0                           │  │   │
│  │  │ clips_done   │ integer, default 0                           │  │   │
│  │  │ time_minutes │ integer, default 0                           │  │   │
│  │  │ xp_earned    │ integer, default 0                           │  │   │
│  │  │ created_at   │ timestamp                                    │  │   │
│  │  │ updated_at   │ timestamp                                    │  │   │
│  │  └──────────────┴────────────────────────────────────────────┘  │   │
│  │  UNIQUE(user_id, date)                                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    USER_NOTIFICATIONS                              │   │
│  │  ┌──────────────┬────────────────────────────────────────────┐  │   │
│  │  │ id           │ uuid, PK                                    │  │   │
│  │  │ user_id      │ uuid, FK → users.id                          │  │   │
│  │  │ type         │ text (at_risk, streak_broken, milestone)     │  │   │
│  │  │ title        │ text                                        │  │   │
│  │  │ body         │ text                                        │  │   │
│  │  │ is_read      │ boolean, default false                       │  │   │
│  │  │ data         │ jsonb (extra metadata)                       │  │   │
│  │  │ created_at   │ timestamp                                    │  │   │
│  │  └──────────────┴────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      USER_SETTINGS                               │   │
│  │  ┌──────────────┬────────────────────────────────────────────┐  │   │
│  │  │ id           │ uuid, PK                                   │  │   │
│  │  │ user_id      │ uuid, FK → users.id, UNIQUE                │  │   │
│  │  │ push_enabled │ boolean, default true                       │  │   │
│  │  │ reminder_time│ time (user's preferred reminder hour)       │  │   │
│  │  │ sound_enabled│ boolean, default false                      │  │   │
│  │  │ reduced_motion│ boolean, default false                     │  │   │
│  │  │ created_at   │ timestamp                                   │  │   │
│  │  │ updated_at   │ timestamp                                   │  │   │
│  │  └──────────────┴────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Table Definitions

#### `topics`

```sql
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
```

#### `lessons`

```sql
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
```

#### `lesson_clips`

```sql
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
```

#### `users` (standard Laravel with Sanctum)

```sql
-- Uses Supabase auth.users as base
-- Additional profile fields in public.profiles (or extend via trigger)

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
  learning_goal TEXT,
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh';

CREATE INDEX idx_users_streak ON auth.users USING btree (current_streak DESC);
CREATE INDEX idx_users_level ON auth.users USING btree (level DESC);
CREATE INDEX idx_users_last_lesson ON auth.users(last_lesson_date);
```

#### `user_progress`

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  accuracy DECIMAL(5,2), -- 0.00 to 100.00
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
CREATE INDEX idx_progress_user_topic ON user_progress(user_id, lesson_id(topic_id));
```

#### `user_clip_progress`

```sql
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
```

#### `daily_activity`

```sql
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
```

#### `vocabulary_learning`

```sql
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
```

#### `user_notifications`

```sql
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
CREATE INDEX idx_notif_user_unread ON user_notifications(user_id, is_read)
  WHERE is_read = false;
CREATE INDEX idx_notif_date ON user_notifications(created_at DESC);
```

#### `user_settings`

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  push_enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '20:00',
  sound_enabled BOOLEAN DEFAULT false,
  reduced_motion BOOLEAN DEFAULT false,
  email_digest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.4 Database Triggers

```sql
-- Trigger: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_user_progress_updated
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_daily_activity_updated
  BEFORE UPDATE ON daily_activity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: Upsert daily_activity on lesson complete
CREATE OR REPLACE FUNCTION upsert_daily_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_activity (user_id, date, lessons_done, time_minutes, xp_earned)
  VALUES (NEW.user_id, CURRENT_DATE, 1, NEW.time_seconds / 60, NEW.xp_earned)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    lessons_done = daily_activity.lessons_done + 1,
    time_minutes = daily_activity.time_minutes + (NEW.time_seconds / 60),
    xp_earned = daily_activity.xp_earned + NEW.xp_earned,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_lesson_complete
  AFTER INSERT ON user_progress
  FOR EACH ROW EXECUTE FUNCTION upsert_daily_activity();

-- Trigger: Auto-update user's last_lesson_date and streak
CREATE OR REPLACE FUNCTION update_streak_on_lesson()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  new_streak INTEGER;
BEGIN
  SELECT last_lesson_date INTO last_date
  FROM auth.users WHERE id = NEW.user_id;

  IF last_date IS NULL THEN
    new_streak := 1;
  ELSIF last_date = CURRENT_DATE THEN
    -- Already practiced today, no streak change
    RETURN NEW;
  ELSIF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE auth.users
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_lesson_date = CURRENT_DATE,
        streak_start = COALESCE(streak_start, CURRENT_DATE)
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSE
    -- Streak broken, start new
    UPDATE auth.users
    SET current_streak = 1,
        last_lesson_date = CURRENT_DATE,
        streak_start = CURRENT_DATE
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_streak_update
  AFTER INSERT ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_streak_on_lesson();
```

### 1.5 Row Level Security (RLS)

```sql
-- Enable RLS on all user-specific tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clip_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own clip progress"
  ON user_clip_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clip progress"
  ON user_clip_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activity"
  ON daily_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Public read access for content tables
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active topics"
  ON topics FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view lessons for active topics"
  ON lessons FOR SELECT
  USING (topic_id IN (SELECT id FROM topics WHERE is_active = true));

CREATE POLICY "Anyone can view clips for active lessons"
  ON lesson_clips FOR SELECT
  USING (lesson_id IN (SELECT id FROM lessons WHERE topic_id IN (SELECT id FROM topics WHERE is_active = true)));
```

---

## PHẦN 2: API CONTRACT

### 2.1 API Overview

```
BASE URL: https://vinalisten.app/api
AUTH: Bearer token (Laravel Sanctum)
CONTENT-TYPE: application/json

ENDPOINT PREFIXES:
  /auth     — Authentication
  /topics   — Topics & Lessons
  /progress — Progress & Stats
  /streak  — Streak management
  /history  — History queries
  /speech   — Speech recognition
  /settings — User settings
```

### 2.2 Authentication

> **Auth Method:** Laravel Sanctum (Bearer Token)
> **No Supabase Auth** — all authentication handled by Laravel.

#### POST /api/auth/register

Register a new user with email.

```
REQUEST:
{
  "name": "Minh Trần",
  "email": "user@example.com",
  "password": "securePassword123",
  "password_confirmation": "securePassword123"
}

RESPONSE 201:
{
  "data": {
    "user": {
      "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "email": "user@example.com",
      "name": "Minh Trần",
      "level": 1,
      "total_xp": 0,
      "current_streak": 0
    },
    "token": "1|laravel_sanctum_token...",
    "token_type": "Bearer"
  }
}

RESPONSE 422 (Validation Error):
{
  "code": "E_VAL_001",
  "message": "The email has already been taken.",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

#### POST /api/auth/login

Login with email/password.

```
REQUEST:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

RESPONSE 200:
{
  "data": {
    "user": {
      "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "email": "user@example.com",
      "name": "Minh Trần",
      "avatar_url": null,
      "level": 5,
      "current_streak": 12,
      "longest_streak": 30,
      "total_xp": 850,
      "last_lesson_date": "2026-06-07",
      "onboarding_completed": true,
      "learning_goal": "ielts"
    },
    "token": "2|laravel_sanctum_token...",
    "token_type": "Bearer"
  }
}

RESPONSE 401:
{
  "code": "E_AUTH_001",
  "message": "Thông tin đăng nhập không hợp lệ."
}
```

#### POST /api/auth/logout

Logout current session.

```
REQUEST: (no body, Bearer token in header)

RESPONSE 200:
{
  "message": "Đăng xuất thành công."
}
```

#### GET /api/auth/me

Get current user profile (requires Bearer token).

```
REQUEST: Authorization: Bearer <token>

RESPONSE 200:
{
  "data": {
    "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "email": "user@example.com",
    "name": "Minh Trần",
    "avatar_url": "https://...",
    "level": 5,
    "current_streak": 12,
    "longest_streak": 30,
    "total_xp": 850,
    "xp_to_next_level": 150,
    "learning_goal": "ielts",
    "timezone": "Asia/Ho_Chi_Minh",
    "streak_freeze_count": 1,
    "freeze_used_today": false,
    "created_at": "2026-01-15T10:30:00Z"
  }
}

RESPONSE 401:
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Vui lòng đăng nhập" }
}
```

### 2.3 Topics & Lessons

#### GET /api/topics

Get all topics with user's progress.

```
REQUEST:
  GET /api/topics
  Headers: Authorization: Bearer <token>

  Query params (optional):
    ?search=ielts
    ?category=ielts

RESPONSE 200:
{
  "success": true,
  "data": {
    "topics": [
      {
        "id": "uuid",
        "slug": "ielts-listening",
        "name": "IELTS Listening",
        "name_vi": "Luyện nghe IELTS",
        "description": "Practice IELTS Listening with real exam materials",
        "icon": "🎧",
        "color": "#35375B",
        "lesson_count": 25,
        "progress_percent": 32,
        "lessons_completed": 8
      }
    ],
    "total": 8
  }
}
```

#### GET /api/topics/[slug]

Get topic detail with lessons.

```
REQUEST:
  GET /api/topics/ielts-listening
  Headers: Authorization: Bearer <token>

RESPONSE 200:
{
  "success": true,
  "data": {
    "topic": {
      "id": "uuid",
      "slug": "ielts-listening",
      "name": "IELTS Listening",
      "name_vi": "Luyện nghe IELTS",
      "description": "...",
      "icon": "🎧",
      "color": "#35375B",
      "lesson_count": 25,
      "lessons_completed": 8,
      "progress_percent": 32,
      "average_accuracy": 78.5
    },
    "sections": [
      {
        "name": "Part 1",
        "lessons": [
          {
            "id": "uuid",
            "name": "First Snowfall",
            "duration": 150,
            "vocab_level": "B1",
            "status": "completed",
            "accuracy": 95,
            "best_score": 950
          },
          {
            "id": "uuid",
            "name": "Jessica's First Day",
            "duration": 195,
            "vocab_level": "B1",
            "status": "in_progress",
            "accuracy": null,
            "best_score": null
          },
          {
            "id": "uuid",
            "name": "My Flower Garden",
            "duration": 165,
            "vocab_level": "B1",
            "status": "available",
            "accuracy": null,
            "best_score": null
          }
        ]
      }
    ],
    "next_lesson": {
      "id": "uuid",
      "name": "Jessica's First Day"
    }
  }
}

RESPONSE 404:
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Topic không tồn tại" }
}
```

#### GET /api/lessons/[id]

Get lesson detail with clips.

```
REQUEST:
  GET /api/lessons/uuid-of-lesson
  Headers: Authorization: Bearer <token>

RESPONSE 200:
{
  "success": true,
  "data": {
    "lesson": {
      "id": "uuid",
      "name": "Morning Routine",
      "topic_id": "uuid",
      "topic_name": "IELTS Listening",
      "duration": 180,
      "vocab_level": "B1",
      "audio_url": "https://audio.vinalisten.app/topics/ielts/lessons/first-snowfall/full.mp3",
    },
    "clips": [
      {
        "id": "uuid",
        "transcript": "I woke up at six in the morning.",
        "audio_url": "https://audio.vinalisten.app/topics/ielts/lessons/first-snowfall/clips/clip_001.mp3",
        "duration": 5,
        "order_index": 0,
        "user_progress": {
          "accuracy": 85,
          "pronunciation_score": 78,
          "recording_url": null,
          "completed": false
        }
      }
    ],
    "total_clips": 3,
    "progress": {
      "completed_clips": 1,
      "accuracy": 85,
      "xp_earned": 85
    }
  }
}
```

### 2.4 Listening & Scoring

#### POST /api/listening/check

Submit transcript and get scoring result.

```
REQUEST:
{
  "clip_id": "uuid",
  "transcript_input": "I woke up at six in the morning"
}

RESPONSE 200:
{
  "success": true,
  "data": {
    "clip_id": "uuid",
    "accuracy": 85.71,
    "score": {
      "total_words": 7,
      "correct": 6,
      "wrong": 0,
      "missing": 1,
      "extra": 0
    },
    "comparison": [
      { "word": "I", "status": "correct", "expected": "I" },
      { "word": "woke", "status": "correct", "expected": "woke" },
      { "word": "up", "status": "correct", "expected": "up" },
      { "word": "at", "status": "correct", "expected": "at" },
      { "word": "six", "status": "correct", "expected": "six" },
      { "word": "in", "status": "correct", "expected": "in" },
      { "word": "the", "status": "missing", "expected": "the" },
      { "word": "morning", "status": "correct", "expected": "morning" }
    ],
    "xp_earned": 86,
    "ai_feedback": "Bạn đã làm tốt! Chú ý các mạo từ 'a', 'an', 'the' thường xuất hiện trong câu.",
    "xp_breakdown": {
      "base": 86,
      "perfect_bonus": 0,
      "speed_bonus": 0,
      "first_try_bonus": 0,
      "total": 86
    }
  }
}

RESPONSE 400:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Vui lòng nhập transcript"
  }
}
```

### 2.5 Speaking & Speech Recognition

#### POST /api/speech/transcribe

Transcribe audio recording (Whisper fallback).

```
REQUEST:
  Content-Type: multipart/form-data
  Body: { audio: File (audio/webm) }

RESPONSE 200:
{
  "success": true,
  "data": {
    "text": "i woke up at six in the morning",
    "confidence": 0.92,
    "language": "en"
  }
}

RESPONSE 400:
{
  "success": false,
  "error": {
    "code": "INVALID_AUDIO",
    "message": "Audio không hợp lệ hoặc quá ngắn"
  }
}

RESPONSE 500:
{
  "success": false,
  "error": {
    "code": "TRANSCRIPTION_FAILED",
    "message": "Không thể nhận diện giọng nói. Vui lòng thử lại."
  }
}
```

#### POST /api/speaking/score

Score pronunciation after transcription.

```
REQUEST:
{
  "clip_id": "uuid",
  "transcribed_text": "i woke up at six in the morning",
  "recording_url": null,
}

RESPONSE 200:
{
  "success": true,
  "data": {
    "clip_id": "uuid",
    "overall_score": 78.5,
    "breakdown": {
      "accuracy": 75.0,
      "fluency": 82.0,
      "completeness": 100.0
    },
    "word_comparison": [
      { "word": "i", "status": "correct", "phonetic": "/aɪ/" },
      { "word": "woke", "status": "correct", "phonetic": "/woʊk/" },
      { "word": "up", "status": "correct", "phonetic": "/ʌp/" },
      { "word": "at", "status": "correct", "phonetic": "/æt/" },
      { "word": "six", "status": "correct", "phonetic": "/sɪks/" },
      { "word": "in", "status": "correct", "phonetic": "/ɪn/" },
      { "word": "the", "status": "mispronounced", "phonetic": "/ðə/", "tip": "Nên đọc /ðə/ mềm hơn" },
      { "word": "morning", "status": "correct", "phonetic": "/ˈmɔːrnɪŋ/" }
    ],
    "ai_feedback": "Phát âm tổng thể khá tốt. Chú ý từ 'the' nên đọc mềm hơn với âm /ð/.",
    "xp_earned": 39,
    "xp_breakdown": {
      "base": 39,
      "bonus": 0,
      "total": 39
    }
  }
}
```

#### POST /api/speaking/upload

Upload recording to storage.

```
REQUEST:
  Content-Type: multipart/form-data
  Body: {
    audio: File,
    clip_id: "uuid",
    user_id: "uuid"
  }

RESPONSE 200:
{
  "success": true,
  "data": {
    "recording_url": null,
    "duration": 5
  }
}
```

### 2.6 Progress & Stats

#### GET /api/progress/dashboard

Get dashboard statistics.

```
REQUEST:
  GET /api/progress/dashboard
  Headers: Authorization: Bearer <token>

RESPONSE 200:
{
  "success": true,
  "data": {
    "user": {
      "level": 5,
      "total_xp": 850,
      "xp_to_next_level": 150,
      "current_streak": 12,
      "longest_streak": 30
    },
    "stats": {
      "total_lessons": 45,
      "total_clips": 128,
      "total_time_minutes": 320,
      "average_accuracy": 76.5,
      "average_pronunciation": 71.2,
      "words_learned": 89,
      "days_active": 18
    },
    "weekly_activity": [
      { "date": "2026-06-01", "lessons": 3, "xp": 250 },
      { "date": "2026-06-02", "lessons": 2, "xp": 180 },
      { "date": "2026-06-03", "lessons": 1, "xp": 95 },
      { "date": "2026-06-04", "lessons": 0, "xp": 0 },
      { "date": "2026-06-05", "lessons": 4, "xp": 380 },
      { "date": "2026-06-06", "lessons": 2, "xp": 195 },
      { "date": "2026-06-07", "lessons": 1, "xp": 85 }
    ],
    "monthly_calendar": [
      { "date": "2026-06-01", "lessons": 3, "intensity": 3 },
      { "date": "2026-06-02", "lessons": 2, "intensity": 2 },
      // ... 30 days total
    ],
    "topic_progress": [
      {
        "topic_id": "uuid",
        "name": "IELTS Listening",
        "lessons_completed": 8,
        "total_lessons": 25,
        "progress_percent": 32,
        "average_accuracy": 78.5
      }
    ],
    "recommendation": {
      "type": "next_lesson",
      "lesson_id": "uuid",
      "lesson_name": "Jessica's First Day",
      "reason": "Hoàn thành topic này để cải thiện 5%"
    }
  }
}
```

#### GET /api/progress/weekly

Get weekly activity data.

```
REQUEST:
  GET /api/progress/weekly?week=2026-W23
  Headers: Authorization: Bearer <token>

RESPONSE 200:
{
  "success": true,
  "data": {
    "week": "2026-W23",
    "start_date": "2026-06-01",
    "end_date": "2026-06-07",
    "days": [
      { "date": "2026-06-01", "day": "Mon", "lessons": 3, "time_minutes": 25, "xp": 250 },
      { "date": "2026-06-02", "day": "Tue", "lessons": 2, "time_minutes": 18, "xp": 180 },
      // ...
    ],
    "totals": {
      "lessons": 12,
      "time_minutes": 95,
      "xp": 1085,
      "average_accuracy": 77.2
    },
    "comparison_with_last_week": {
      "lessons_change": "+20%",
      "xp_change": "+15%",
      "improving": true
    }
  }
}
```

### 2.7 Streak

#### GET /api/streak

Get current streak status.

```
REQUEST:
  GET /api/streak
  Headers: Authorization: Bearer <token>

RESPONSE 200:
{
  "success": true,
  "data": {
    "current_streak": 12,
    "longest_streak": 30,
    "streak_start_date": "2026-05-27",
    "last_lesson_date": "2026-06-07",
    "streak_freeze_count": 1,
    "freeze_used_today": false,
    "is_at_risk": false,
    "streak_status": "active", // "active" | "at_risk" | "frozen" | "broken"
    "next_milestone": {
      "days": 18,
      "milestone": 30,
      "xp_bonus": 100
    },
    "calendar": [
      { "date": "2026-06-07", "status": "active", "lessons": 2 },
      { "date": "2026-06-06", "status": "active", "lessons": 1 },
      // ... last 90 days
    ]
  }
}
```

#### POST /api/streak/freeze

Activate streak freeze (manual).

```
REQUEST:
  POST /api/streak/freeze
  Headers: Authorization: Bearer <token>
  Body: {}

RESPONSE 200:
{
  "success": true,
  "data": {
    "freeze_activated": true,
    "streak_freeze_count": 0,
    "streak_preserved": 12
  }
}

RESPONSE 400:
{
  "success": false,
  "error": {
    "code": "FREEZE_NOT_AVAILABLE",
    "message": "Bạn đã sử dụng streak freeze tuần này"
  }
}
```

### 2.8 History

#### GET /api/history

Get lesson history with pagination.

```
REQUEST:
  GET /api/history?page=1&limit=20
  Headers: Authorization: Bearer <token>

  Query params:
    ?page=1              — Page number (default 1)
    ?limit=20            — Items per page (default 20, max 50)
    ?topic_id=uuid       — Filter by topic
    ?date_from=2026-01-01
    ?date_to=2026-06-07
    ?accuracy_min=80     — Filter by minimum accuracy
    ?search=morning      — Search by lesson name

RESPONSE 200:
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "uuid",
        "lesson_id": "uuid",
        "lesson_name": "Morning Routine",
        "topic_name": "IELTS Listening",
        "topic_slug": "ielts-listening",
        "accuracy": 85.0,
        "pronunciation_score": 78.0,
        "xp_earned": 85,
        "time_seconds": 300,
        "attempt_count": 1,
        "best_score": true,
        "completed_at": "2026-06-07T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    },
    "filters": {
      "topic_id": null,
      "date_from": null,
      "date_to": null,
      "accuracy_min": null,
      "search": null
    }
  }
}
```

#### GET /api/history/lessons/[id]

Get detail of a completed lesson.

```
REQUEST:
  GET /api/history/lessons/uuid
  Headers: Authorization: Bearer <token>

RESPONSE 200:
{
  "success": true,
  "data": {
    "lesson": {
      "id": "uuid",
      "name": "Morning Routine",
      "topic_name": "IELTS Listening",
      "completed_at": "2026-06-07T10:30:00Z",
      "total_clips": 3,
      "total_time_seconds": 300
    },
    "attempts": [
      {
        "attempt_number": 1,
        "completed_at": "2026-06-07T10:30:00Z",
        "accuracy": 85.0,
        "pronunciation_avg": 78.0,
        "xp_earned": 85,
        "clips": [
          {
            "clip_id": "uuid",
            "order_index": 0,
            "transcript_expected": "I woke up at six in the morning.",
            "transcript_input": "I woke up at six in the morning",
            "accuracy": 100.0,
            "pronunciation_score": 82.0,
            "recording_url": "https://...",
            "ai_feedback": "Tuyệt vời!"
          }
        ]
      }
    ],
    "stats": {
      "total_attempts": 1,
      "best_accuracy": 85.0,
      "latest_accuracy": 85.0,
      "improvement": 0
    }
  }
}
```

### 2.9 Notifications

#### GET /api/notifications

Get user notifications.

```
REQUEST:
  GET /api/notifications?unread_only=true
  Headers: Authorization: Bearer <token>

RESPONSE 200:
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "milestone",
        "title": "Chúc mừng! 7 ngày streak!",
        "body": "Bạn đang tạo thói quen học tập tuyệt vời!",
        "is_read": false,
        "data": { "streak_days": 7, "xp_bonus": 30 },
        "created_at": "2026-06-07T00:00:00Z"
      }
    ],
    "unread_count": 3
  }
}
```

#### PATCH /api/notifications/[id]/read

Mark notification as read.

```
REQUEST:
  PATCH /api/notifications/uuid/read
  Headers: Authorization: Bearer <token>

RESPONSE 200:
{
  "success": true,
  "data": { "is_read": true }
}
```

### 2.10 Settings

#### GET /api/settings

Get user settings.

```
REQUEST:
  GET /api/settings
  Headers: Authorization: Bearer <token>

RESPONSE 200:
{
  "success": true,
  "data": {
    "push_enabled": true,
    "reminder_time": "20:00",
    "sound_enabled": false,
    "reduced_motion": false,
    "email_digest": false
  }
}
```

#### PATCH /api/settings

Update user settings.

```
REQUEST:
  PATCH /api/settings
  Headers: Authorization: Bearer <token>
  Body: {
    "push_enabled": true,
    "reminder_time": "21:00",
    "reduced_motion": true
  }

RESPONSE 200:
{
  "success": true,
  "data": {
    "push_enabled": true,
    "reminder_time": "21:00",
    "sound_enabled": false,
    "reduced_motion": false,
    "email_digest": false
  }
}
```

---

## PHẦN 3: REQUEST/RESPONSE EXAMPLES

### 3.1 Complete Learning Flow

#### Step 1: Browse Topics

```
GET /api/topics
Authorization: Bearer eyJhbG...

Response:
{
  "success": true,
  "data": {
    "topics": [
      {
        "id": "a1b2c3d4-...",
        "slug": "ielts-listening",
        "name": "IELTS Listening",
        "icon": "🎧",
        "lesson_count": 25,
        "progress_percent": 32
      }
    ]
  }
}
```

#### Step 2: Select Topic

```
GET /api/topics/ielts-listening
Authorization: Bearer eyJhbG...

Response:
{
  "success": true,
  "data": {
    "topic": { "id": "...", "name": "IELTS Listening", ... },
    "sections": [
      {
        "name": "Part 1",
        "lessons": [
          { "id": "...", "name": "First Snowfall", "status": "completed", "accuracy": 95 },
          { "id": "...", "name": "Jessica's First Day", "status": "in_progress" }
        ]
      }
    ],
    "next_lesson": { "id": "...", "name": "Jessica's First Day" }
  }
}
```

#### Step 3: Load Lesson

```
GET /api/lessons/jessicas-first-day-uuid
Authorization: Bearer eyJhbG...

Response:
{
  "success": true,
  "data": {
    "lesson": { "id": "...", "name": "Jessica's First Day", "duration": 195 },
    "clips": [
      { "id": "clip1", "transcript": "Jessica walked into her new office...", "duration": 8 },
      { "id": "clip2", "transcript": "She was nervous but excited...", "duration": 6 }
    ],
    "total_clips": 2
  }
}
```

#### Step 4: Submit Transcript (Clip 1)

```
POST /api/listening/check
Authorization: Bearer eyJhbG...
{
  "clip_id": "clip1",
  "transcript_input": "Jessica walked into her new office"
}

Response:
{
  "success": true,
  "data": {
    "accuracy": 100.0,
    "score": { "correct": 5, "wrong": 0, "missing": 0, "extra": 0 },
    "comparison": [...],
    "xp_earned": 100,
    "ai_feedback": "TUYỆT VỜI! Perfect score! +10 bonus XP"
  }
}
```

#### Step 5: Record & Score (Clip 1)

```
# First: Upload recording
POST /api/speaking/upload
Content-Type: multipart/form-data
{ audio: [File], clip_id: "clip1" }

Response: { "success": true, "data": { "recording_url": "..." } }

# Then: Score pronunciation
POST /api/speaking/score
{
  "clip_id": "clip1",
  "transcribed_text": "jessica walked into her new office",
  "recording_url": "https://..."
}

Response:
{
  "success": true,
  "data": {
    "overall_score": 88.5,
    "breakdown": { "accuracy": 85, "fluency": 90, "completeness": 100 },
    "word_comparison": [...],
    "xp_earned": 44,
    "ai_feedback": "Phát âm tốt! Chú ý 'Jessica' với /dʒ/ rõ hơn."
  }
}
```

#### Step 6: Lesson Complete

```
After submitting all clips, the system returns lesson complete:
{
  "success": true,
  "data": {
    "lesson_completed": true,
    "total_accuracy": 87.5,
    "total_xp": 285,
    "new_level": null,
    "streak_updated": true,
    "current_streak": 13,
    "next_lesson": { "id": "...", "name": "My Flower Garden" }
  }
}
```

### 3.2 Error Scenarios

#### Network Error

```
POST /api/listening/check
Network Error / Timeout

Response (after 1 retry):
{
  "success": false,
  "error": {
    "code": "NETWORK_ERROR",
    "message": "Không thể kết nối. Kiểm tra mạng và thử lại.",
    "retryable": true
  }
}
```

#### Invalid Token

```
GET /api/progress/dashboard
Authorization: Bearer eyJhbGc... (expired)

Response 401:
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
  }
}
```

#### Rate Limiting

```
POST /api/listening/check (50th request in 1 minute)

Response 429:
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Quá nhiều yêu cầu. Vui lòng chờ 30 giây.",
    "retry_after": 30
  }
}
```

---

## PHẦN 4: FOLDER STRUCTURE

### 4.1 Project Root

```
vinalisten/
│
├── frontend/                      # React SPA (Vite)
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── api/                  # API client + typed endpoints
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── topics.ts
│   │   │   ├── lessons.ts
│   │   │   ├── progress.ts
│   │   │   ├── scoring.ts
│   │   │   └── audio.ts
│   │   ├── components/
│   │   │   └── ui/               # Base design system components
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Textarea.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── BottomSheet.tsx
│   │   │       ├── Toast.tsx
│   │   │       ├── Skeleton.tsx
│   │   │       ├── Spinner.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       ├── ErrorState.tsx
│   │   │       ├── ProgressBar.tsx
│   │   │       ├── ProgressRing.tsx
│   │   │       ├── Avatar.tsx
│   │   │       ├── Tooltip.tsx
│   │   │       ├── Tabs.tsx
│   │   │       └── index.ts
│   │   ├── pages/                 # Route pages (React Router)
│   │   │   ├── Home.tsx           # Landing page
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   └── CallbackPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── topics/
│   │   │   │   ├── TopicsPage.tsx
│   │   │   │   └── TopicDetailPage.tsx
│   │   │   ├── listen/
│   │   │   │   ├── ListenPage.tsx
│   │   │   │   └── CompletePage.tsx
│   │   │   ├── progress/
│   │   │   │   └── ProgressPage.tsx
│   │   │   ├── history/
│   │   │   │   ├── HistoryPage.tsx
│   │   │   │   └── HistoryDetailPage.tsx
│   │   │   ├── onboarding/
│   │   │   │   └── OnboardingPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   └── ErrorPage.tsx
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useTopics.ts
│   │   │   ├── useTopic.ts
│   │   │   ├── useLesson.ts
│   │   │   ├── useDashboard.ts
│   │   │   ├── useHistory.ts
│   │   │   └── useAudioPlayer.ts
│   │   ├── stores/               # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── audioPlayerStore.ts
│   │   │   └── uiStore.ts
│   │   ├── types/                 # TypeScript types
│   │   │   ├── index.ts
│   │   │   └── api.ts
│   │   ├── lib/                   # Utilities
│   │   │   ├── utils.ts          # cn(), formatTime()
│   │   │   └── constants.ts       # XP, levels, playback speeds
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── error.tsx              # React ErrorBoundary
│   │   └── index.css             # Tailwind + design tokens
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── prettier.config.js
│   ├── index.html
│   ├── .env.example
│   └── vercel.json               # Vercel deployment config
│
├── backend/                       # Laravel 13 API
│   ├── app/
│   │   ├── Console/
│   │   │   └── Commands/
│   │   │       ├── IngestLessonsCommand.php
│   │   │       └── UploadAudioToR2Command.php
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── TopicController.php
│   │   │   │   ├── LessonController.php
│   │   │   │   ├── ListeningController.php
│   │   │   │   ├── SpeakingController.php
│   │   │   │   ├── ProgressController.php
│   │   │   │   └── AudioController.php
│   │   │   ├── Requests/
│   │   │   │   ├── LoginRequest.php
│   │   │   │   ├── RegisterRequest.php
│   │   │   │   └── CheckTranscriptRequest.php
│   │   │   └── Resources/
│   │   │       ├── UserResource.php
│   │   │       ├── TopicResource.php
│   │   │       ├── LessonResource.php
│   │   │       └── ProgressResource.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Topic.php
│   │   │   ├── Lesson.php
│   │   │   ├── LessonClip.php
│   │   │   ├── UserProgress.php
│   │   │   ├── DailyActivity.php
│   │   │   └── UserClipProgress.php
│   │   ├── Services/
│   │   │   ├── ScoringService.php
│   │   │   ├── StreakService.php
│   │   │   ├── ProgressService.php
│   │   │   └── R2Service.php
│   │   └── Providers/
│   │       └── AppServiceProvider.php
│   ├── config/
│   │   ├── app.php
│   │   ├── database.php
│   │   ├── sanctum.php
│   │   └── filesystems.php
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 2026_06_07_000001_create_users_table.php
│   │   │   ├── 2026_06_07_000002_add_learning_fields_to_users.php
│   │   │   ├── 2026_06_07_000003_create_topics_table.php
│   │   │   ├── 2026_06_07_000004_create_lessons_table.php
│   │   │   ├── 2026_06_07_000005_create_lesson_clips_table.php
│   │   │   ├── 2026_06_07_000006_create_user_progress_table.php
│   │   │   ├── 2026_06_07_000007_create_daily_activity_table.php
│   │   │   └── 2026_06_07_000008_create_user_clip_progress_table.php
│   │   └── seeders/
│   │       └── DevSeeder.php
│   ├── routes/
│   │   └── api.php
│   ├── tests/
│   │   ├── Feature/
│   │   │   └── ScoringServiceTest.php
│   │   └── Unit/
│   │       └── ScoringServiceTest.php
│   ├── composer.json
│   ├── phpunit.xml
│   ├── .env.example
│   ├── Dockerfile                 # For Railway deployment
│   ├── deploy.sh                 # Bizfly VPS deploy script
│   └── artisan
│
├── docs/                         # Documentation
│
├── crawler/                      # Data crawler (existing)
│   └── storage/
│       ├── audio_clips/          # Crawled audio files
│       └── *.json               # Crawled lesson data
│
└── README.md
│   │   ├── ToastProvider.tsx
│   │   ├── Skeleton.tsx
│   │   ├── SkeletonCard.tsx
│   │   ├── Badge.tsx
│   │   ├── Chip.tsx             # Filter chip
│   │   ├── ProgressBar.tsx
│   │   ├── ProgressRing.tsx     # Circular progress
│   │   ├── Spinner.tsx
│   │   ├── Avatar.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Tabs.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── Divider.tsx
│   │   └── index.ts
│   │
│   ├── layout/                  # App shell components
│   │   ├── Header.tsx
│   │   ├── HeaderNav.tsx        # Desktop top nav
│   │   ├── BottomNav.tsx        # Mobile bottom tab bar
│   │   ├── AppShell.tsx         # Main layout wrapper
│   │   ├── PageContainer.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── audio/                   # Audio player components
│   │   ├── AudioPlayer.tsx      # Main player component
│   │   ├── AudioControls.tsx    # Play/pause/skip controls
│   │   ├── ProgressTrack.tsx     # Seekable progress bar
│   │   ├── SpeedSelector.tsx    # 0.5x-1.5x buttons
│   │   ├── VolumeControl.tsx
│   │   ├── LoopControls.tsx      # Loop clip / loop all
│   │   ├── Waveform.tsx         # Audio waveform visualizer
│   │   └── MiniPlayer.tsx        # Sticky mini player (bottom)
│   │
│   ├── lesson/                  # Lesson-related components
│   │   ├── LessonCard.tsx       # Lesson row in list
│   │   ├── LessonHeader.tsx     # Breadcrumb + metadata
│   │   ├── ClipIndicator.tsx    # "Clip 1 of 3" stepper
│   │   ├── TranscriptInput.tsx   # Textarea for typing
│   │   ├── TranscriptResult.tsx  # Result comparison panel
│   │   ├── WordDiff.tsx         # Word-by-word colored diff
│   │   ├── ScoreDisplay.tsx     # Animated accuracy score
│   │   ├── AIFeedback.tsx       # AI tip card
│   │   ├── LessonComplete.tsx    # Completion modal
│   │   ├── Confetti.tsx          # Celebration animation
│   │   └── LessonPlayer.tsx      # Orchestrates full lesson flow
│   │
│   ├── speaking/                # Speaking practice components
│   │   ├── VoiceRecorder.tsx    # Recording interface
│   │   ├── RecordingButton.tsx  # Large record/stop button
│   │   ├── RecordingTimer.tsx    # Countdown/countup timer
│   │   ├── LiveWaveform.tsx     # Real-time waveform during record
│   │   ├── PlaybackControls.tsx # Play recorded audio
│   │   ├── ReRecordButton.tsx
│   │   ├── PronunciationScore.tsx # Score display card
│   │   ├── PronunciationBreakdown.tsx
│   │   ├── WordPronunciation.tsx # Word-level ⚠️ ✅ display
│   │   └── SpeakingResult.tsx    # Full speaking result panel
│   │
│   ├── progress/                # Progress & stats components
│   │   ├── StatsCard.tsx        # Stat number + label
│   │   ├── WeeklyChart.tsx      # 7-day bar chart (Recharts)
│   │   ├── MonthlyCalendar.tsx   # GitHub-style heatmap
│   │   ├── TopicProgress.tsx     # Per-topic progress bars
│   │   ├── XpProgress.tsx        # XP + level progress
│   │   ├── LevelBadge.tsx
│   │   ├── AchievementBadge.tsx
│   │   ├── InsightsCard.tsx     # AI-generated insights
│   │   └── ProgressDashboard.tsx  # Full dashboard composition
│   │
│   ├── streak/                  # Streak components
│   │   ├── StreakCounter.tsx     # Fire emoji + number (header)
│   │   ├── StreakBadge.tsx      # Detailed streak card
│   │   ├── StreakCalendar.tsx    # 90-day contribution graph
│   │   ├── StreakFreeze.tsx      # Freeze indicator + button
│   │   ├── StreakMilestone.tsx   # Celebration on milestone
│   │   └── StreakAtRisk.tsx      # Warning banner
│   │
│   ├── history/                 # History components
│   │   ├── HistoryList.tsx       # Paginated lesson history
│   │   ├── HistoryItem.tsx       # Single history row
│   │   ├── HistoryFilters.tsx    # Search + filter controls
│   │   ├── AttemptComparison.tsx # Multi-attempt view
│   │   ├── RecordingPlayback.tsx # Play past recordings
│   │   └── ExportButton.tsx      # JSON/CSV export
│   │
│   ├── topics/                  # Topic browsing components
│   │   ├── TopicCard.tsx        # Grid card
│   │   ├── TopicRow.tsx         # Mobile list row
│   │   ├── TopicSearch.tsx      # Search bar
│   │   ├── TopicFilter.tsx       # Filter chips
│   │   ├── TopicGrid.tsx         # Responsive grid layout
│   │   └── ProgressIndicator.tsx  # Dots or bar progress
│   │
│   ├── onboarding/              # Onboarding components
│   │   ├── OnboardingFlow.tsx    # Step wizard
│   │   ├── GoalStep.tsx          # Step 1: Select goal
│   │   ├── LevelStep.tsx         # Step 2: Assess level
│   │   ├── TopicSuggestStep.tsx  # Step 3: Recommend topic
│   │   └── OnboardingProgress.tsx
│   │
│   └── auth/                    # Auth components
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── OAuthButton.tsx
│       └── AuthDivider.tsx
│
├── lib/
│   │
│   ├── api/
│   │   ├── client.ts            # API client with auth headers
│   │   ├── auth.ts             # Auth API calls
│   │   ├── topics.ts           # Topics API
│   │   ├── lessons.ts          # Lessons API
│   │   ├── progress.ts         # Progress API
│   │   └── scoring.ts          # Scoring API
│   │
│   ├── hooks/
│   │   │   # Auth hooks
│   │   ├── useAuth.ts
│   │   │
│   │   │   # Lesson hooks
│   │   ├── useLesson.ts
│   │   ├── useTopics.ts
│   │   ├── useTopic.ts
│   │   │
│   │   │   # Progress hooks
│   │   ├── useDashboard.ts
│   │   ├── useHistory.ts
│   │   │
│   │   │   # Audio/Speaking hooks
│   │   ├── useAudioPlayer.ts
│   │   ├── useVoiceRecorder.ts
│   │   ├── useSpeechRecognition.ts
│   │   │
│   │   │   # UI hooks
│   │   ├── useToast.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useIsDesktop.ts
│   │   ├── useLocalStorage.ts
│   │   └── useReducedMotion.ts
│   │
│   ├── services/
│   │   ├── authService.ts       # Auth API calls
│   │   ├── topicService.ts      # Topic API calls
│   │   ├── lessonService.ts     # Lesson API calls
│   │   ├── listeningService.ts   # Transcript check API
│   │   ├── speakingService.ts   # Recording + scoring API
│   │   ├── progressService.ts    # Dashboard + stats API
│   │   ├── streakService.ts     # Streak API
│   │   ├── historyService.ts    # History API
│   │   └── settingsService.ts   # Settings API
│   │
│   ├── utils/
│   │   ├── transcript-comparison.ts  # LCS word alignment algorithm
│   │   ├── scoring.ts               # XP + level calculation
│   │   ├── pronunciation-scoring.ts  # Fluency + accuracy scoring
│   │   ├── date.ts                  # Date formatting + timezone
│   │   ├── format.ts                # Duration, numbers, etc.
│   │   ├── cn.ts                    # className utility (clsx)
│   │   ├── debounce.ts
│   │   └── throttle.ts
│   │
│   └── constants/
│       ├── config.ts             # API URLs, constants
│       ├── xp.ts                 # XP per action, level thresholds
│       ├── levels.ts             # Level definitions
│       ├── playback-speeds.ts    # [0.5, 0.75, 1, 1.25, 1.5]
│       └── breakpoints.ts        # Responsive breakpoints
│
├── types/
│   ├── api.ts                   # API request/response types
│   ├── auth.ts                 # Auth types
│   ├── topic.ts
│   ├── lesson.ts
│   ├── progress.ts
│   ├── streak.ts
│   ├── history.ts
│   ├── speaking.ts
│   └── ui.ts                   # Shared UI types
│
├── styles/
│   ├── globals.css             # CSS variables, base styles
│   └── animations.css         # Keyframe animations
│
├── public/
│   ├── icons/                  # SVG icons
│   ├── og-image.png            # Social sharing image
│   └── manifest.json           # PWA manifest
│
├── scripts/
│   ├── migrate-data.ts         # Crawler JSON → Laravel (deprecated)
│   └── seed-dev.ts            # Development seed data
│
├── .env.example
├── .env.local
├── .gitignore
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── playwright.config.ts
├── vitest.config.ts
├── postcss.config.js
├── eslint.config.js
├── prettier.config.js
└── README.md
```

### 4.2 Component Architecture

```
LAYER STRUCTURE:

UI Components (atoms)
  └── Button, Input, Card, Badge, Spinner, Skeleton, Toast

  ↓ compose into

Feature Components (molecules)
  └── AudioControls, TranscriptInput, WordDiff, StreakBadge,
      TopicCard, HistoryItem, ProgressBar

  ↓ compose into

Page Components (organisms)
  └── LessonPlayer, SpeakingResult, ProgressDashboard,
      StreakModal, HistoryList, TopicGrid

  ↓ compose into

Pages (React Router)
  └── /topics, /listen/:id, /progress, /dashboard
```

---

## PHẦN 5: STATE MANAGEMENT STRATEGY

### 5.1 State Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE LAYERS                              │
│                                                              │
│  LAYER 1: Server State (React Query / TanStack Query)     │
│  ├── Topics, Lessons, Clips (reference data)               │
│  ├── User progress, Dashboard stats                         │
│  ├── History, Streak, Notifications                         │
│  ├── Auto-refetch, Background refresh                       │
│  └── Cache-first, Stale-while-revalidate                   │
│                                                              │
│  LAYER 2: Global UI State (Zustand)                        │
│  ├── Auth state (user, session)                             │
│  ├── Theme (light/dark, reduced motion)                     │
│  ├── Audio player state (current lesson, clip, position)     │
│  ├── Current lesson session state                            │
│  ├── Onboarding completion                                   │
│  └── Modals, toasts, notifications                           │
│                                                              │
│  LAYER 3: Local UI State (React useState)                   │
│  ├── Form inputs, toggle states                              │
│  ├── Collapse/expand                                         │
│  ├── Tab selection                                           │
│  ├── Search input value                                      │
│  └── Pagination cursor                                        │
│                                                              │
│  LAYER 4: URL State (URLSearchParams / React Router)         │
│  ├── Active topic filter                                     │
│  ├── Search query                                            │
│  ├── Date range filter                                       │
│  └── Pagination page                                         │
│                                                              │
│  LAYER 5: Form State (React Hook Form + Zod)            │
│  ├── Login/register forms                                    │
│  ├── Settings forms                                         │
│  ├── Transcript input validation                             │
│  └── Onboarding forms                                        │
│                                                              │
│  LAYER 6: Third-party State                                  │
│  ├── Laravel Sanctum token (Zustand authStore)          │
│  ├── Audio element (HTMLAudioElement)                        │
│  ├── MediaRecorder state                                     │
│  └── SpeechRecognition state                                  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 TanStack Query (Server State)

```typescript
// lib/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,           // 1 minute
      gcTime: 5 * 60 * 1000,          // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Query keys factory
export const queryKeys = {
  // Topics
  topics: ['topics'] as const,
  topic: (slug: string) => ['topics', slug] as const,

  // Lessons
  lessons: (topicId: string) => ['lessons', topicId] as const,
  lesson: (id: string) => ['lessons', id] as const,

  // Progress
  dashboard: ['progress', 'dashboard'] as const,
  weekly: (week: string) => ['progress', 'weekly', week] as const,

  // Streak
  streak: ['streak'] as const,

  // History
  history: (params: HistoryParams) => ['history', params] as const,
  historyDetail: (id: string) => ['history', 'lesson', id] as const,

  // Notifications
  notifications: (unreadOnly?: boolean) => ['notifications', unreadOnly] as const,

  // Settings
  settings: ['settings'] as const,
}

// Example hooks using queryKeys
export function useTopics() {
  return useQuery({
    queryKey: queryKeys.topics,
    queryFn: () => topicService.getAll(),
  })
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: queryKeys.lesson(id),
    queryFn: () => lessonService.getById(id),
    enabled: !!id,
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => progressService.getDashboard(),
    staleTime: 30 * 1000, // 30 seconds for dashboard
    refetchInterval: 60 * 1000, // Refresh every minute during active use
  })
}

export function useSubmitTranscript() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { clip_id: string; transcript_input: string }) =>
      listeningService.check(data),

    onSuccess: (result) => {
      // Invalidate dashboard to update stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      // Invalidate streak to update
      queryClient.invalidateQueries({ queryKey: queryKeys.streak })
      // Optimistically update current lesson session
    },
  })
}
```

### 5.3 Zustand (Global UI State)

```typescript
// lib/store/index.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setSession: (session) => set({ session }),
  logout: () => set({ user: null, session: null }),
}))

// ─── Audio Player Store ───────────────────────────────────────────────────────
interface AudioPlayerState {
  // Current state
  currentLessonId: string | null
  currentClipIndex: number
  clips: Clip[]
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackSpeed: number
  volume: number
  isMuted: boolean
  isLooping: boolean

  // Actions
  loadLesson: (lessonId: string, clips: Clip[]) => void
  setClipIndex: (index: number) => void
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  setPlaybackSpeed: (speed: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleLoop: () => void
  nextClip: () => void
  prevClip: () => void
  reset: () => void
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  currentLessonId: null,
  currentClipIndex: 0,
  clips: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackSpeed: 1,
  volume: 1,
  isMuted: false,
  isLooping: false,

  loadLesson: (lessonId, clips) => set({
    currentLessonId: lessonId,
    clips,
    currentClipIndex: 0,
    currentTime: 0,
    isPlaying: false,
  }),

  setClipIndex: (index) => set({ currentClipIndex: index, currentTime: 0 }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),

  seek: (time) => set({ currentTime: time }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  toggleLoop: () => set((s) => ({ isLooping: !s.isLooping })),

  nextClip: () => {
    const { clips, currentClipIndex } = get()
    if (currentClipIndex < clips.length - 1) {
      set({ currentClipIndex: currentClipIndex + 1, currentTime: 0 })
    }
  },

  prevClip: () => {
    const { currentClipIndex, currentTime } = get()
    if (currentTime > 2) {
      set({ currentTime: 0 })
    } else if (currentClipIndex > 0) {
      set({ currentClipIndex: currentClipIndex - 1, currentTime: 0 })
    }
  },

  reset: () => set({
    currentLessonId: null,
    currentClipIndex: 0,
    clips: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackSpeed: 1,
    isLooping: false,
  }),
}))

// ─── Lesson Session Store ────────────────────────────────────────────────────
// Tracks current lesson session state (not persisted)
interface LessonSessionState {
  lessonId: string | null
  clipResults: Map<string, ClipResult>
  currentStep: 'listening' | 'speaking' | 'results' | 'complete'
  isSubmitting: boolean
  submitError: string | null

  // Actions
  startSession: (lessonId: string, clipCount: number) => void
  setClipResult: (clipId: string, result: ClipResult) => void
  setStep: (step: LessonSessionState['currentStep']) => void
  setSubmitting: (loading: boolean) => void
  setError: (error: string | null) => void
  endSession: () => void
}

export const useLessonSessionStore = create<LessonSessionState>((set) => ({
  lessonId: null,
  clipResults: new Map(),
  currentStep: 'listening',
  isSubmitting: false,
  submitError: null,

  startSession: (lessonId, clipCount) => set({
    lessonId,
    clipResults: new Map(),
    currentStep: 'listening',
    isSubmitting: false,
    submitError: null,
  }),

  setClipResult: (clipId, result) => set((s) => {
    const newResults = new Map(s.clipResults)
    newResults.set(clipId, result)
    return { clipResults: newResults }
  }),

  setStep: (step) => set({ currentStep: step }),
  setSubmitting: (loading) => set({ isSubmitting: loading }),
  setError: (error) => set({ submitError: error }),
  endSession: () => set({ lessonId: null, clipResults: new Map() }),
}))

// ─── UI Store ────────────────────────────────────────────────────────────────
interface UIState {
  theme: 'light' | 'dark'
  reducedMotion: boolean
  activeModal: string | null
  toasts: Toast[]
  isMobileMenuOpen: boolean

  setTheme: (theme: 'light' | 'dark') => void
  setReducedMotion: (value: boolean) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  setMobileMenuOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      reducedMotion: false,
      activeModal: null,
      toasts: [],
      isMobileMenuOpen: false,

      setTheme: (theme) => set({ theme }),
      setReducedMotion: (value) => set({ reducedMotion: value }),

      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),

      addToast: (toast) => set((s) => ({
        toasts: [...s.toasts, { ...toast, id: nanoid() }],
      })),

      removeToast: (id) => set((s) => ({
        toasts: s.toasts.filter((t) => t.id !== id),
      })),

      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    }),
    {
      name: 'vinalisten-ui',
      partialize: (state) => ({
        theme: state.theme,
        reducedMotion: state.reducedMotion,
      }),
    }
  )
)
```

### 5.4 Form State (React Hook Form + Zod)

```typescript
// lib/validations/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Cần ít nhất 1 số'),
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
})

export const transcriptSchema = z.object({
  clip_id: z.string().uuid(),
  transcript_input: z.string()
    .min(1, 'Vui lòng nhập transcript')
    .max(2000, 'Transcript quá dài'),
})

export const settingsSchema = z.object({
  push_enabled: z.boolean(),
  reminder_time: z.string().regex(/^\d{2}:\d{2}$/),
  sound_enabled: z.boolean(),
  reduced_motion: z.boolean(),
  email_digest: z.boolean(),
})

// lib/hooks/useForms.ts
export function useLoginForm() {
  return useForm({ resolver: zodResolver(loginSchema), mode: 'onBlur' })
}

export function useTranscriptForm() {
  return useForm({ resolver: zodResolver(transcriptSchema), mode: 'onSubmit' })
}
```

### 5.5 URL State (nuqs)

```typescript
// In app/history/page.tsx
import { useQueryState } from 'nuqs'

export function HistoryPage() {
  const [page, setPage] = useQueryState('page', { defaultValue: '1' })
  const [topicId, setTopicId] = useQueryState('topic')
  const [dateFrom, setDateFrom] = useQueryState('from')
  const [dateTo, setDateTo] = useQueryState('to')
  const [accuracyMin, setAccuracyMin] = useQueryState('accuracy')
  const [search, setSearch] = useQueryState('q')

  const { data } = useHistory({
    page: parseInt(page),
    topic_id: topicId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    accuracy_min: accuracyMin ? parseInt(accuracyMin) : undefined,
    search: search || undefined,
  })

  return (
    <>
      <SearchInput value={search} onChange={setSearch} />
      <FilterBar
        topicId={topicId}
        onTopicChange={setTopicId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        accuracyMin={accuracyMin}
        onClear={() => {
          setTopicId(null)
          setDateFrom(null)
          setDateTo(null)
          setAccuracyMin(null)
        }}
      />
      <HistoryList data={data} />
      <Pagination
        page={parseInt(page)}
        totalPages={data.pagination.total_pages}
        onChange={(p) => setPage(String(p))}
      />
    </>
  )
}

// URL: /history?q=morning&topic=uuid&from=2026-01-01&page=2
// All state is shareable via URL
```

### 5.6 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                     │
│                                                                       │
│  USER ACTION                                                          │
│  "Submit transcript"                                                   │
│       │                                                               │
│       ▼                                                               │
│  ┌─────────────────┐                                                  │
│  │ useState/Form   │  ← Local form state (input value)               │
│  └────────┬────────┘                                                  │
│           │ validate with Zod                                         │
│           ▼                                                           │
│  ┌─────────────────┐                                                  │
│  │ useMutation     │  ← TanStack Query mutation                      │
│  └────────┬────────┘                                                  │
│           │ POST /api/listening/check                                 │
│           ▼                                                           │
│  ┌─────────────────┐                                                  │
│  │ API Route       │  ← Next.js route handler                        │
│  └────────┬────────┘                                                  │
│           │ Validate + Score + DB write                                │
│           ▼                                                           │
│  ┌─────────────────┐                                                  │
│  │ Supabase        │  ← PostgreSQL + Auth                            │
│  │ Database        │  ← user_progress table                          │
│  └────────┬────────┘                                                  │
│           │ Return result                                              │
│           ▼                                                           │
│  ┌─────────────────┐                                                  │
│  │ onSuccess       │  ← Query invalidation                           │
│  │ callback        │  ← Invalidate: dashboard, streak, history        │
│  └────────┬────────┘                                                  │
│           │                                                           │
│           ▼                                                           │
│  ┌─────────────────┐                                                  │
│  │ React re-render │  ← Component re-renders with new data           │
│  │ via Zustand     │  ← LessonSessionStore updates                   │
│  └─────────────────┘                                                  │
│                                                                       │
│  SIDEBAR: Zustand persists AudioPlayerStore across navigation        │
│  SIDEBAR: QueryClient caches dashboard data, refetches in bg         │
│  SIDEBAR: URL params sync with history filters (shareable)           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## PHẦN 6: SCALABILITY & PERFORMANCE

### 6.1 Scalability Tiers

```
TIER 1: 0-1,000 MAU
├── Current architecture: Sufficient
├── PostgreSQL (Supabase free tier: 500MB)
├── Cloudflare R2 (free tier: 10GB)
├── Bizfly VPS (existing) / Railway ($5/month)
└── Vercel hobby plan

TIER 2: 1,000-10,000 MAU
├── Add: Redis (Upstash) for session cache
├── Add: Vercel Pro plan
├── Supabase: Upgrade to Pro ($25/month)
│   ├── 8GB database
│   └── 100GB storage
└── Consider: Cloudflare CDN for R2 audio

TIER 3: 10,000-100,000 MAU
├── Add: Cloudflare CDN for audio delivery
├── Add: Edge Functions for optimized audio
├── Database: Read replicas
├── Caching: Redis for hot data
└── Vercel: Pro/Enterprise plan

TIER 4: 100,000-1,000,000 MAU
├── Full infrastructure redesign
├── Kubernetes on cloud provider
├── Dedicated ML infrastructure
└── Multi-region deployment
```

### 6.2 Caching Strategy

```
CACHE LAYERS:

1. React Query (Client-side)
   ├── Topics list: staleTime=5min, cacheTime=10min
   ├── Lesson detail: staleTime=30min
   ├── Dashboard: staleTime=30s, refetchInterval=60s
   └── History: No cache (always fresh)
   │
2. Cloudflare CDN (Edge)
   ├── Audio files: cached at edge
   └── Public assets: cached

3. Vercel Edge Cache
   ├── Static pages: 1 year
   ├── API responses: stale-while-revalidate
   └── Dynamic routes: no-cache (user-specific)
   │
4. Cloudflare R2 + CDN
   ├── Recordings: private (signed URLs)
   └── Public audio: cached via Cloudflare CDN
   │
5. Redis (Future Tier 2+)
   ├── Streak calculations
   ├── Leaderboard data
   └── Expensive aggregations
```

### 6.3 Performance Targets

```
METRIC              TARGET      STRATEGY
─────────────────────────────────────────────────────────────
LCP                 < 2.5s      Vite build optimization, font preloading
FID                 < 100ms     Code splitting, defer non-critical JS
CLS                 < 0.1       Reserved space for dynamic content
TTI                  < 3.5s     Lazy loading, route-based splitting
API Latency (P99)   < 500ms     Database indexes, connection pooling
Audio Load          < 2.0s      Preload first clip, Cloudflare CDN
Time to Interactive < 4.0s      Progressive hydration
Bundle Size (JS)    < 200KB     Tree shaking, dynamic imports
```

---

*Document End — VinaListen Technical Design v2.0*
*Updated: 2026-06-07 (Laravel 13 + Sanctum + R2 + Bizfly VPS)*
