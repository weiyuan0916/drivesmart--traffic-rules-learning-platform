# Week 1: Infrastructure Sprint — Execution Plan

**Date:** 2026-06-07  
**Version:** 2.0  
**Scope:** Foundation (T-A-001 → T-A-010)  
**Target:** Week 1 complete  
**Estimated:** 36 hours  
**Updated:** 2026-06-07

---

## STACK (FINAL — APPROVED)

```
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND                                                             │
│   React 19 + Vite + TypeScript + Tailwind CSS v4                  │
│   TanStack Query v5 + Zustand v5                                   │
│   React Router v6 + React Hook Form + Zod                          │
│   Lucide React (icons) + date-fns                                  │
│   CSS animations only (no Framer Motion)                          │
│                                                                      │
│ BACKEND                                                              │
│   Laravel 13 + PHP 8.3+                                           │
│   Laravel Sanctum (authentication + API tokens)                    │
│   PostgreSQL (Supabase)                                            │
│   Cloudflare R2 (S3-compatible, audio storage)                     │
│                                                                      │
│ HOSTING                                                             │
│   PRIMARY:   Bizfly VPS (existing)                                 │
│   FALLBACK:  Railway ($5/month)                                    │
│   FRONTEND:  Vercel (free, fast)                                  │
│                                                                      │
│ REJECTED                                                            │
│   ❌ Next.js, Supabase Auth, Supabase as backend                   │
│   ❌ Microservices, Kubernetes, AI services, Whisper               │
│   ❌ Render free tier, complex abstractions                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## EXECUTION ORDER

```
┌─────────────────────────────────────────────────────────────────────┐
│ DAY 1                                                                  │
│                                                                      │
│ T-A-001  Project Setup (Frontend)                                    │
│          React + Vite + Tailwind + TanStack Query + Zustand        │
│          Estimated: 4h                                              │
│          Dependency: None                                           │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ DAY 1-2                                                              │
│                                                                      │
│ T-A-002  Backend Project Setup (Laravel 13)                         │
│          Laravel 13 + PHP 8.3 + Sanctum + PostgreSQL config         │
│          Estimated: 8h                                              │
│          Dependency: None (parallel with T-A-001)                  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ DAY 2-3                                                              │
│                                                                      │
│ T-A-003  Database Schema (PostgreSQL)                               │
│          7 tables + indexes + RLS policies                          │
│          Estimated: 6h                                              │
│          Dependency: T-A-002                                        │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ DAY 3-4                                                              │
│                                                                      │
│ T-A-004  Design System                                              │
│          Tailwind config + CSS variables + Base components         │
│          Estimated: 6h                                             │
│          Dependency: T-A-001                                       │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ DAY 4                                                                │
│                                                                      │
│ T-A-005  Auth + API Client Setup (Frontend)                         │
│          Laravel Sanctum integration + API client                   │
│          Estimated: 4h                                             │
│          Dependency: T-A-001, T-A-002                               │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ DAY 4-5                                                              │
│                                                                      │
│ T-A-006  Data Ingestion                                             │
│          Laravel command + R2 integration + seed data              │
│          Estimated: 8h                                             │
│          Dependency: T-A-003                                       │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ DAY 5                                                                │
│                                                                      │
│ T-A-007  Error Handling                                             │
│          React ErrorBoundary + Laravel exception handler             │
│          Estimated: 4h                                             │
│          Dependency: T-A-001, T-A-005                              │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ DAY 5-6                                                              │
│                                                                      │
│ T-A-008  Deploy CI/CD                                              │
│          Vercel (frontend) + Bizfly VPS/Railway (Laravel) + GitHub │
│          Estimated: 4h                                             │
│          Dependency: T-A-001, T-A-002, T-A-003, T-A-005            │
└─────────────────────────────────────────────────────────────────────┘
```

**Note:** Merged Supabase Client (T-A-003) into Auth + API Client (T-A-005) since we're using Laravel Sanctum instead of Supabase Auth. This reduces total tasks from 10 to 8.

---

## TASK DETAIL: T-A-001 — Project Setup (Frontend)

```
┌─────────────────────────────────────────────────────────────────────┐
│ T-A-001 | Project Setup (Frontend)                                  │
│ Estimated: 4h | Priority: P0 | Dependency: None                     │
└─────────────────────────────────────────────────────────────────────┘

SCOPE:
├── Initialize Vite + React 19 + TypeScript project
├── Configure Tailwind CSS v4 with Vite plugin
├── Install core dependencies:
│   ├── @tanstack/react-query v5 (data fetching)
│   ├── zustand v5 (state management)
│   ├── react-router-dom v6 (routing)
│   ├── react-hook-form + @hookform/resolvers + zod (form validation)
│   ├── lucide-react (icons)
│   ├── date-fns (date formatting)
│   ├── tailwindcss (v4)
│   └── @tailwindcss/vite (Vite plugin)
├── Configure: ESLint, Prettier, TypeScript strict mode
└── Set up folder structure

DO NOT INSTALL:
├── Framer Motion (CSS only)
├── nuqs (use simple URL params)
├── Recharts (add later for progress dashboard)
├── Sentry (add Phase 2)
└── Any AI/ML libraries

FOLDER STRUCTURE:
  frontend/
  ├── public/
  ├── src/
  │   ├── api/           # API client + typed endpoints
  │   ├── components/    # Shared components
  │   │   └── ui/        # Base UI components
  │   ├── hooks/         # Custom hooks
  │   ├── pages/         # Route pages
  │   ├── stores/        # Zustand stores
  │   ├── types/         # TypeScript types
  │   ├── lib/           # Utilities
  │   ├── App.tsx
  │   ├── main.tsx
  │   └── index.css
  ├── package.json
  ├── vite.config.ts
  ├── tsconfig.json
  ├── tailwind.config.ts
  ├── postcss.config.js
  ├── eslint.config.js
  ├── prettier.config.js
  ├── index.html
  └── .env.example

FILES AFFECTED:
  frontend/
  ├── package.json              (CREATE)
  ├── vite.config.ts           (CREATE)
  ├── tsconfig.json            (CREATE)
  ├── tsconfig.app.json        (CREATE)
  ├── tsconfig.node.json       (CREATE)
  ├── tailwind.config.ts       (CREATE)
  ├── postcss.config.js        (CREATE)
  ├── eslint.config.js         (CREATE)
  ├── prettier.config.js       (CREATE)
  ├── index.html               (CREATE)
  ├── .env.example             (CREATE)
  ├── public/
  │   └── vite.svg              (CREATE)
  └── src/
      ├── main.tsx             (CREATE)
      ├── App.tsx              (CREATE)
      ├── App.css              (CREATE)
      ├── index.css            (CREATE - Tailwind directives)
      ├── api/
      │   └── client.ts        (CREATE - base API client)
      ├── types/
      │   └── index.ts        (CREATE - shared types)
      ├── lib/
      │   └── utils.ts         (CREATE - cn() helper)
      ├── hooks/
      │   └── useApi.ts       (CREATE)
      ├── stores/
      │   └── authStore.ts    (CREATE - skeleton)
      └── pages/
          └── Home.tsx         (CREATE - placeholder)

ACCEPTANCE CRITERIA:
  ✅ `npm install` succeeds
  ✅ `npm run dev` starts dev server on port 5173
  ✅ `npm run build` succeeds with 0 errors
  ✅ `tsc --noEmit` passes with 0 TypeScript errors
  ✅ `npm run lint` passes with 0 warnings
  ✅ Tailwind CSS applies (verify primary color #35375B renders)
  ✅ TanStack Query devtools visible in development
  ✅ React Router navigates between pages
```

---

## TASK DETAIL: T-A-002 — Backend Project Setup (Laravel 13)

```
┌─────────────────────────────────────────────────────────────────────┐
│ T-A-002 | Backend Project Setup (Laravel 13)                        │
│ Estimated: 8h | Priority: P0 | Dependency: None (parallel with T-A-001) │
└─────────────────────────────────────────────────────────────────────┘

SCOPE:
├── Create new Laravel 13 project
├── Configure PHP 8.3+ requirements
├── Install and configure Laravel Sanctum
├── Configure PostgreSQL connection (Supabase)
├── Configure Cloudflare R2 storage (S3-compatible)
├── Set up API routes structure
├── Create base controllers and services
├── Configure CORS for frontend origin
├── Set up environment variables
└── Verify Laravel runs on VPS

WHY LARAVEL 13:
├── Built-in SSR support (optional, not used for MVP)
├── Laravel Reverb (optional real-time, not used for MVP)
├── Per-second rotation for queues (not needed for MVP)
└── Simplified package auto-discovery

WHY LARAVEL SANCTUM:
├── SPA authentication with httponly cookies
├── Token abilities/scopes
├── Multiple devices support
├── Built into Laravel (no extra service)
└── Works perfectly with React SPA

FILES AFFECTED:
  backend/
  ├── app/
  │   ├── Http/
  │   │   └── Controllers/
  │   │       └── Controller.php     (UPDATE - base)
  │   └── Providers/
  │       └── AppServiceProvider.php  (UPDATE)
  ├── config/
  │   ├── app.php                    (UPDATE)
  │   ├── database.php               (UPDATE - PostgreSQL)
  │   ├── sanctum.php               (CREATE)
  │   └── filesystems.php           (UPDATE - R2)
  ├── routes/
  │   └── api.php                    (CREATE - skeleton)
  ├── .env.example                   (CREATE)
  ├── .env.production.example        (CREATE)
  ├── composer.json                  (CREATE)
  ├── phpunit.xml                   (CREATE)
  ├── bootstrap/
  │   └── app.php                   (UPDATE)
  └── artisan                        (CREATE)

ACCEPTANCE CRITERIA:
  ✅ `composer install` succeeds
  ✅ `php artisan serve` runs on port 8000
  ✅ Database connection to Supabase PostgreSQL works
  ✅ R2 storage configured and test file upload works
  ✅ Sanctum generates keys
  ✅ CORS allows Vercel frontend origin
  ✅ API routes respond (e.g., /api/health)
  ✅ Environment variables documented in .env.example
  ✅ `php artisan test` runs successfully
```

---

## TASK DETAIL: T-A-003 — Database Schema (PostgreSQL)

```
┌─────────────────────────────────────────────────────────────────────┐
│ T-A-003 | Database Schema (PostgreSQL)                              │
│ Estimated: 6h | Priority: P0 | Dependency: T-A-002                │
└─────────────────────────────────────────────────────────────────────┘

SCOPE:
├── Create Laravel migrations for 7 tables
├── Define indexes for query performance
├── Add foreign key constraints
├── Add default values and validation
└── Create Eloquent models with relationships

SCHEMA (7 tables):

1. users (extends Laravel default)
   ├── id (ulid, primary)
   ├── name (string)
   ├── email (string, unique)
   ├── password (hashed)
   ├── avatar_url (nullable string)
   ├── current_streak (integer, default: 0)
   ├── longest_streak (integer, default: 0)
   ├── streak_start_date (nullable date)
   ├── last_lesson_date (nullable timestamp)
   ├── total_xp (integer, default: 0)
   ├── level (integer, default: 1)
   ├── learning_goal (enum: ielts, toeic, daily, business)
   ├── timezone (string, default: Asia/Ho_Chi_Minh)
   ├── daily_goal_minutes (integer, default: 10)
   ├── onboarding_completed (boolean, default: false)
   ├── email_verified_at (nullable timestamp)
   ├── remember_token (nullable string)
   ├── created_at, updated_at (timestamps)
   └── INDEXES: email (unique), learning_goal

2. topics
   ├── id (ulid, primary)
   ├── slug (string, unique)
   ├── name (string)
   ├── name_vi (string, nullable)
   ├── description (text, nullable)
   ├── description_vi (text, nullable)
   ├── icon (string) — Lucide icon name
   ├── color (string) — hex color
   ├── order_index (integer, default: 0)
   ├── is_active (boolean, default: true)
   ├── created_at, updated_at
   └── INDEXES: slug (unique), order_index, is_active

3. lessons
   ├── id (ulid, primary)
   ├── topic_id (ulid, FK → topics.id, cascade delete)
   ├── slug (string)
   ├── name (string)
   ├── audio_url (string) — R2 signed URL or path
   ├── duration (integer) — seconds
   ├── vocab_level (enum: beginner, intermediate, advanced)
   ├── order_index (integer, default: 0)
   ├── created_at, updated_at
   └── INDEXES: topic_id, slug (unique per topic), order_index
   └── UNIQUE: topic_id + slug

4. lesson_clips
   ├── id (ulid, primary)
   ├── lesson_id (ulid, FK → lessons.id, cascade delete)
   ├── transcript (text)
   ├── audio_url (string) — R2 path
   ├── duration (integer) — seconds
   ├── order_index (integer, default: 0)
   ├── created_at, updated_at
   └── INDEXES: lesson_id, order_index

5. user_progress
   ├── id (ulid, primary)
   ├── user_id (ulid, FK → users.id, cascade delete)
   ├── lesson_id (ulid, FK → lessons.id)
   ├── accuracy (decimal 5,2, nullable)
   ├── xp_earned (integer, default: 0)
   ├── time_seconds (integer, default: 0)
   ├── attempt_count (integer, default: 1)
   ├── best_score (decimal 5,2, nullable)
   ├── completed_at (timestamp, nullable)
   ├── created_at, updated_at
   └── INDEXES: user_id, lesson_id, completed_at
   └── UNIQUE: user_id + lesson_id

6. daily_activity
   ├── id (ulid, primary)
   ├── user_id (ulid, FK → users.id, cascade delete)
   ├── date (date)
   ├── lessons_done (integer, default: 0)
   ├── clips_done (integer, default: 0)
   ├── time_minutes (integer, default: 0)
   ├── xp_earned (integer, default: 0)
   ├── created_at, updated_at
   └── INDEXES: user_id, date (unique per user per day)
   └── UNIQUE: user_id + date

7. user_clip_progress
   ├── id (ulid, primary)
   ├── user_id (ulid, FK → users.id, cascade delete)
   ├── clip_id (ulid, FK → lesson_clips.id)
   ├── transcript_input (text, nullable)
   ├── accuracy (decimal 5,2, nullable)
   ├── transcribed_text (text, nullable)
   ├── speaking_score (decimal 5,2, nullable)
   ├── completed_at (timestamp, nullable)
   ├── created_at, updated_at
   └── INDEXES: user_id, clip_id, completed_at
   └── UNIQUE: user_id + clip_id

RELATIONSHIPS:
  User 1→N user_progress
  User 1→N daily_activity
  User 1→N user_clip_progress
  Topic 1→N lessons
  Lesson 1→N lesson_clips
  Lesson 1→N user_progress

FILES AFFECTED:
  backend/
  ├── database/
  │   └── migrations/
  │       ├── 2026_06_07_000001_create_users_table.php
  │       ├── 2026_06_07_000002_add_learning_fields_to_users.php
  │       ├── 2026_06_07_000003_create_topics_table.php
  │       ├── 2026_06_07_000004_create_lessons_table.php
  │       ├── 2026_06_07_000005_create_lesson_clips_table.php
  │       ├── 2026_06_07_000006_create_user_progress_table.php
  │       ├── 2026_06_07_000007_create_daily_activity_table.php
  │       └── 2026_06_07_000008_create_user_clip_progress_table.php
  └── app/
      └── Models/
          ├── User.php         (UPDATE - add fields + relationships)
          ├── Topic.php        (CREATE)
          ├── Lesson.php       (CREATE)
          ├── LessonClip.php   (CREATE)
          ├── UserProgress.php (CREATE)
          ├── DailyActivity.php (CREATE)
          └── UserClipProgress.php (CREATE)

ACCEPTANCE CRITERIA:
  ✅ All migrations run on fresh PostgreSQL
  ✅ All foreign keys cascade on delete
  ✅ Unique constraints prevent duplicates
  ✅ Indexes on all queried columns
  ✅ `php artisan migrate:fresh` succeeds
  ✅ Models have correct relationships
  ✅ Models have correct fillable/guarded
  ✅ ULID primary keys (better than UUID for URLs)
```

---

## TASK DETAIL: T-A-004 — Design System

```
┌─────────────────────────────────────────────────────────────────────┐
│ T-A-004 | Design System                                             │
│ Estimated: 6h | Priority: P0 | Dependency: T-A-001                │
└─────────────────────────────────────────────────────────────────────┘

SCOPE:
├── Configure Tailwind CSS v4 with design tokens
├── Set up CSS variables for colors, typography, spacing
├── Build base UI components:
│   ├── Button (primary, secondary, ghost, destructive, sizes)
│   ├── Input (with label, error, helper text)
│   ├── Textarea (auto-grow, word count display)
│   ├── Card (content wrapper with padding)
│   ├── Badge (status labels)
│   ├── Modal (centered dialog with backdrop)
│   ├── BottomSheet (mobile slide-up panel)
│   ├── Toast (success, error, warning, info)
│   ├── Skeleton (loading placeholder)
│   ├── Spinner (loading indicator)
│   ├── EmptyState (illustration + message + CTA)
│   ├── ErrorState (error icon + message + retry)
│   ├── ProgressBar (horizontal progress)
│   ├── ProgressRing (circular progress)
│   ├── Avatar (user image or initials fallback)
│   ├── Tooltip (hover tooltip)
│   └── Tabs (tab navigation)
├── Implement typography scale
└── Implement responsive breakpoints

DESIGN TOKENS:
  Colors:
  --primary:    #35375B
  --primary-dark: #252640
  --accent:     #FF5632
  --accent-dark: #CC3A1A
  --success:    #00BE7C
  --error:      #FF3257
  --warning:    #FFAB00
  --warning-dark: #CC8800
  --dark:       #2B2727
  --light:      #EFEFEF
  --brown:      #B15224
  --cream:      #F0E7DF
  --muted:      #6B7280

  Typography:
  Display:  48px / 700 / -0.02em
  H1:       36px / 700
  H2:       28px / 600
  H3:       20px / 600
  Body:     16px / 400 / 1.6 line-height
  Small:    14px / 400
  Caption:  12px / 400

  Spacing: 8px grid (0.5rem increments)
  Border radius: sm:6px, md:12px, lg:16px, full:9999px

  Breakpoints:
  sm:  640px
  md:  768px
  lg: 1024px
  xl: 1280px

FILES AFFECTED:
  frontend/
  ├── src/
  │   ├── index.css                   (UPDATE - design tokens + Tailwind)
  │   ├── lib/
  │   │   └── utils.ts              (UPDATE - cn() helper)
  │   └── components/
  │       └── ui/
  │           ├── Button.tsx         (CREATE)
  │           ├── Input.tsx          (CREATE)
  │           ├── Textarea.tsx       (CREATE)
  │           ├── Card.tsx          (CREATE)
  │           ├── Badge.tsx          (CREATE)
  │           ├── Modal.tsx          (CREATE)
  │           ├── BottomSheet.tsx    (CREATE)
  │           ├── Toast.tsx          (CREATE)
  │           ├── ToastProvider.tsx  (CREATE)
  │           ├── useToast.ts        (CREATE)
  │           ├── Skeleton.tsx       (CREATE)
  │           ├── Spinner.tsx        (CREATE)
  │           ├── EmptyState.tsx     (CREATE)
  │           ├── ErrorState.tsx    (CREATE)
  │           ├── ProgressBar.tsx   (CREATE)
  │           ├── ProgressRing.tsx   (CREATE)
  │           ├── Avatar.tsx         (CREATE)
  │           ├── Tooltip.tsx        (CREATE)
  │           ├── Tabs.tsx           (CREATE)
  │           └── index.ts           (CREATE - barrel export)
  └── tailwind.config.ts             (UPDATE - design tokens)

ACCEPTANCE CRITERIA:
  ✅ Primary color #35375B renders on page
  ✅ Accent #FF5632 used only on dark/warning backgrounds (WCAG AA)
  ✅ Typography scale matches spec (verify with dev tools)
  ✅ Button variants: primary, secondary, ghost, destructive
  ✅ Button sizes: sm, md, lg
  ✅ Input shows error state with red border + message
  ✅ Textarea auto-grows with word count
  ✅ Toast appears top-right, auto-dismisses 4s
  ✅ Modal renders with backdrop blur
  ✅ BottomSheet slides from bottom on mobile
  ✅ Skeleton shimmer animation smooth (CSS only)
  ✅ All components typed with TypeScript
  ✅ All touch targets ≥ 44×44px on mobile
  ✅ No horizontal overflow at 320px
```

---

## TASK DETAIL: T-A-005 — Auth + API Client Setup (Frontend)

```
┌─────────────────────────────────────────────────────────────────────┐
│ T-A-005 | Auth + API Client Setup (Frontend)                        │
│ Estimated: 4h | Priority: P0 | Dependency: T-A-001, T-A-002      │
└─────────────────────────────────────────────────────────────────────┘

SCOPE:
├── Create typed API client for Laravel backend
├── Integrate Laravel Sanctum authentication:
│   ├── Login page (email + password)
│   ├── Register page (name + email + password)
│   ├── Auth store (Zustand)
│   ├── useAuth hook
│   └── Protected route wrapper
├── Create typed TanStack Query hooks
├── Create auth pages scaffold (HTML structure, no full UI)
└── Set up CSRF + cookie-based auth flow

AUTH FLOW (Laravel Sanctum SPA):
  1. User submits login → POST /api/auth/login
  2. Laravel validates → creates Sanctum token
  3. Token returned to frontend → stored in Zustand
  4. All subsequent requests include: Authorization: Bearer {token}
  5. Logout: DELETE /api/auth/logout → invalidate token

WHY SANCTUM OVER SESSION:
  ├── Bearer tokens work across domains (Vercel → Bizfly VPS)
  ├── Easier to debug (inspect header)
  ├── Better for SPA + API separation
  └── Built into Laravel, no extra setup

FILES AFFECTED:
  frontend/
  ├── src/
  │   ├── api/
  │   │   ├── client.ts             (UPDATE - add auth headers)
  │   │   ├── auth.ts               (CREATE - auth API calls)
  │   │   ├── topics.ts             (CREATE - topics API)
  │   │   ├── lessons.ts            (CREATE - lessons API)
  │   │   ├── progress.ts           (CREATE - progress API)
  │   │   └── scoring.ts            (CREATE - scoring API)
  │   ├── api/
  │   │   └── types.ts              (CREATE - API response types)
  │   ├── hooks/
  │   │   ├── useAuth.ts           (CREATE)
  │   │   ├── useTopics.ts          (CREATE)
  │   │   ├── useTopic.ts          (CREATE)
  │   │   ├── useLesson.ts         (CREATE)
  │   │   ├── useDashboard.ts      (CREATE)
  │   │   └── useHistory.ts        (CREATE)
  │   ├── stores/
  │   │   └── authStore.ts         (UPDATE - full implementation)
  │   ├── components/
  │   │   └── ui/
  │   │       └── ProtectedRoute.tsx (CREATE)
  │   └── pages/
  │       └── auth/
  │           ├── LoginPage.tsx     (CREATE - scaffold)
  │           ├── RegisterPage.tsx   (CREATE - scaffold)
  │           └── CallbackPage.tsx   (CREATE - for OAuth)
  └── .env.example                  (UPDATE - add API URL)

  backend/
  ├── app/
  │   ├── Http/
  │   │   ├── Controllers/
  │   │   │   └── AuthController.php    (CREATE)
  │   │   └── Requests/
  │   │       ├── LoginRequest.php       (CREATE)
  │   │       └── RegisterRequest.php    (CREATE)
  │   ├── Models/
  │   │   └── User.php                  (UPDATE)
  │   └── Providers/
  │       └── AuthServiceProvider.php    (CREATE)
  ├── config/
  │   └── sanctum.php                   (UPDATE - SPA config)
  ├── routes/
  │   └── api.php                       (UPDATE - auth routes)
  └── database/
      └── seeders/
          └── DevSeeder.php             (CREATE)

ACCEPTANCE CRITERIA:
  ✅ API client sends Authorization header with token
  ✅ Login with valid credentials returns token
  ✅ Login with invalid credentials returns 422 with error
  ✅ Protected API routes reject requests without token
  ✅ Auth store: user, isAuthenticated, login(), logout()
  ✅ useAuth() hook works in any component
  ✅ ProtectedRoute redirects to /auth/login when unauthenticated
  ✅ TanStack Query hooks return typed data
  ✅ CSRF token handled correctly on login/register
  ✅ Logout clears token and redirects to /auth/login
```

---

## TASK DETAIL: T-A-006 — Data Ingestion

```
┌─────────────────────────────────────────────────────────────────────┐
│ T-A-006 | Data Ingestion                                           │
│ Estimated: 8h | Priority: P0 | Dependency: T-A-003              │
└─────────────────────────────────────────────────────────────────────┘

SCOPE:
├── Create Laravel Artisan command for ingestion
├── Integrate Cloudflare R2 for audio file storage
├── Upload audio files from crawler to R2
├── Build R2Service for signed URL generation
├── Ingest topics, lessons, clips from crawler JSON
├── Validate data integrity
└── Create re-ingestion command

SOURCE DATA:
  ├── Crawler JSON: crawler/storage/*.json
  ├── Audio files: crawler/storage/audio_clips/{lesson_id}/*.mp3
  └── Expected: 4+ topics, 20+ lessons, 50+ clips

R2 CONFIGURATION:
  ├── Bucket: vinalisten-audio
  ├── Public URL pattern: https://audio.vinalisten.app/{path}
  ├── Signed URLs: For authenticated users (prevent hotlinking)
  └── Public files: Landing page audio, public clips

R2 FILE STRUCTURE:
  vinalisten-audio/
  ├── topics/
  │   └── {topic_slug}/
  │       └── lessons/
  │           └── {lesson_slug}/
  │               ├── full.mp3
  │               └── clips/
  │                   └── clip_{order}.mp3

FILES AFFECTED:
  backend/
  ├── app/
  │   ├── Console/
  │   │   └── Commands/
  │   │       ├── IngestLessonsCommand.php    (CREATE)
  │   │       └── UploadAudioToR2Command.php  (CREATE)
  │   └── Services/
  │       ├── R2Service.php                  (CREATE)
  │       └── LessonIngestionService.php      (CREATE)
  ├── config/
  │   └── filesystems.php                    (UPDATE - add R2)
  └── routes/
      └── api.php                            (UPDATE - audio routes)

  frontend/
  ├── src/
  │   ├── api/
  │   │   └── audio.ts                       (CREATE - signed URL API)
  │   └── .env.example                       (UPDATE - add R2 keys)

ACCEPTANCE CRITERIA:
  ✅ `php artisan ingest:lessons` runs without errors
  ✅ All topics ingested with unique slugs
  ✅ All lessons ingested with correct topic FK
  ✅ All clips ingested with correct lesson FK
  ✅ Audio files uploaded to R2 with correct paths
  ✅ Signed URL generated for authenticated audio access
  ✅ Audio accessible via frontend (test with curl)
  ✅ No broken audio URLs (all return 200)
  ✅ Count: topics ≥ 4, lessons ≥ 20, clips ≥ 50
  ✅ `php artisan ingest:lessons --fresh` re-ingests cleanly
```

---

## TASK DETAIL: T-A-007 — Error Handling

```
┌─────────────────────────────────────────────────────────────────────┐
│ T-A-007 | Error Handling                                           │
│ Estimated: 4h | Priority: P1 | Dependency: T-A-001, T-A-005       │
└─────────────────────────────────────────────────────────────────────┘

SCOPE:
├── React: Global ErrorBoundary
├── React: 404 page
├── React: Error page (app/error.tsx)
├── React: Toast notification system (enhanced)
├── Laravel: Global exception handler
├── Laravel: API error response format
└── Shared: Error codes and messages (Vietnamese)

ERROR CODES:
  E_AUTH_001: Invalid credentials
  E_AUTH_002: Token expired
  E_AUTH_003: Unauthenticated
  E_AUTH_004: Email already exists
  E_VAL_001: Validation failed
  E_VAL_002: Invalid input
  E_NOT_FOUND: Resource not found
  E_SERVER: Internal server error
  E_RATE_LIMIT: Too many requests

FILES AFFECTED:
  frontend/
  ├── src/
  │   ├── error.tsx              (CREATE - ErrorBoundary)
  │   ├── pages/
  │   │   ├── NotFoundPage.tsx  (CREATE)
  │   │   └── ErrorPage.tsx     (CREATE)
  │   └── lib/
  │       └── apiError.ts       (CREATE - error parsing)

  backend/
  ├── app/
  │   ├── Exceptions/
  │   │   └── Handler.php        (UPDATE - API error format)
  │   └── Http/
  │       └── Middleware/
  │           └── ApiErrorHandler.php (CREATE)
  └── bootstrap/
      └── app.php                (UPDATE - register handler)

ACCEPTANCE CRITERIA:
  ✅ Unhandled React error → friendly error page (not white screen)
  ✅ Invalid route → 404 page with home link
  ✅ API error → consistent JSON: {code, message, data}
  ✅ Toast shows: success, error, warning, info with icons
  ✅ Toast auto-dismisses after 4 seconds
  ✅ Error messages in Vietnamese
  ✅ ErrorBoundary caught errors logged to console (dev only)
  ✅ API validation errors return 422 with field-level errors
```

---

## TASK DETAIL: T-A-008 — Deploy CI/CD

```
┌─────────────────────────────────────────────────────────────────────┐
│ T-A-008 | Deploy CI/CD                                             │
│ Estimated: 4h | Priority: P0 | Dependency: T-A-001 to T-A-007    │
└─────────────────────────────────────────────────────────────────────┘

SCOPE:
├── Deploy frontend to Vercel
├── Deploy backend to Bizfly VPS (primary) or Railway (alternative)
├── Configure environment variables
├── Set up GitHub Actions CI:
│   ├── Frontend: tsc, lint, build
│   └── Backend: PHP lint, tests
├── Configure Vercel preview deployments for PRs
├── Set up auto-deploy from main branch
└── Verify production deployment

HOSTING CONFIGURATION:

FRONTEND (Vercel):
  ├── Framework: Vite (React)
  ├── Root directory: frontend/
  ├── Build command: npm run build
  ├── Output directory: dist
  └── Environment variables:
      ├── VITE_API_URL=https://api.vinalisten.app
      └── VITE_APP_URL=https://vinalisten.app

BACKEND (Bizfly VPS — PRIMARY):
  ├── OS: Ubuntu 22.04 LTS
  ├── Web server: Nginx
  ├── PHP: 8.3+
  ├── Process manager: PHP-FPM
  ├── SSL: Let's Encrypt (Certbot)
  ├── Domain: api.vinalisten.app
  └── Deploy: git pull + composer install + artisan migrate

BACKEND (Railway — ALTERNATIVE):
  ├── Runtime: Nixpacks (auto-detect Laravel)
  ├── Database: Supabase PostgreSQL
  └── Auto-deploy from main branch

CI/CD PIPELINE:
  GitHub Actions
  ├── On: push to main → deploy production
  ├── On: pull_request → preview deployment
  └── Jobs: lint → test → build → deploy

FILES AFFECTED:
  frontend/
  ├── vercel.json                (CREATE)
  ├── .env.example               (UPDATE)
  └── .github/
      └── workflows/
          └── ci.yml             (CREATE)

  backend/
  ├── .env.example               (UPDATE)
  ├── .env.production.example    (CREATE)
  ├── docker-compose.yml         (CREATE - local dev only)
  ├── Dockerfile                 (CREATE - for Railway)
  ├── deploy.sh                  (CREATE - Bizfly VPS deploy script)
  └── .github/
      └── workflows/
          └── ci.yml             (CREATE)

ACCEPTANCE CRITERIA:
  ✅ `npm run build` succeeds in CI
  ✅ `npm run lint` passes in CI
  ✅ `tsc --noEmit` passes in CI
  ✅ `composer validate` passes in CI
  ✅ `php artisan test` runs in CI
  ✅ Production frontend accessible on Vercel
  ✅ Production backend accessible on VPS/Railway
  ✅ Environment variables on Vercel (not in git)
  ✅ Environment variables on VPS/Railway (not in git)
  ✅ Preview deployment created for test PR
  ✅ Main branch auto-deploys to production
  ✅ SSL certificate active on api.vinalisten.app
```

---

## SUMMARY

```
┌─────────────────────────────────────────────────────────────────────┐
│ WEEK 1 INFRASTRUCTURE SPRINT — FINAL                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Day 1      T-A-001  Project Setup (Frontend)          4h           │
│  Day 1-2    T-A-002  Laravel 13 Backend Setup        8h           │
│  Day 2-3    T-A-003  Database Schema                 6h           │
│  Day 3-4    T-A-004  Design System                  6h           │
│  Day 4      T-A-005  Auth + API Client               4h           │
│  Day 4-5    T-A-006  Data Ingestion + R2            8h           │
│  Day 5      T-A-007  Error Handling                  4h           │
│  Day 5-6    T-A-008  Deploy CI/CD                   4h           │
│                                                                      │
│  TOTAL                                          44 hours            │
│  BUFFER                                        +4 hours            │
│  CAPACITY                                     48 hours             │
│                                                                      │
│  PARALLEL TRACKS:                                                   │
│  Track A: T-A-001 (Frontend project setup)                          │
│  Track B: T-A-002 (Laravel backend setup)                            │
│  → Both start Day 1, independent                                    │
│                                                                      │
│  DELIVERABLES:                                                      │
│  ├── React 19 + Vite frontend on Vercel                            │
│  ├── Laravel 13 API on Bizfly VPS/Railway                          │
│  ├── PostgreSQL database (Supabase)                                  │
│  ├── Cloudflare R2 audio storage                                    │
│  ├── Laravel Sanctum authentication                                 │
│  ├── Design system + base components                                 │
│  ├── Data ingested (topics + lessons + clips)                      │
│  └── CI/CD pipeline green on every PR                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Week 1 Execution Plan v2.0 — Ready for Approval*
*Updated: 2026-06-07 (Laravel 13 + Sanctum + Bizfly VPS)*
