# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DriveSmart is a Vietnamese traffic rules learning platform (ôn thi GPLX) built with React + TypeScript + Vite + Tailwind CSS v4. It helps users study for the B1 driving license exam with 600 questions across 6 chapters, plus an AI-powered traffic situation image analyzer using Google Gemini.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run preview      # Preview production build
npm run clean        # Remove dist directory
npm run lint         # TypeScript type checking (tsc --noEmit)
```

Set `GEMINI_API_KEY` in `.env.local` for the AI analyzer feature.

## Architecture

### Data Layer

- `bo-600-cau-hoi.json` — source data: 600 questions with answers, explanations, chapter assignments
- `src/services/questionsService.ts` — loads and maps raw JSON to typed `Question` objects; caches in memory
- `src/services/examGenerator.ts` — generates a 30-question B1 exam with fixed per-chapter targets (9/1/3/2/9/6), deterministic via FNV-1a + Mulberry32 seeding
- `src/services/geminiService.ts` — calls `gemini-3.1-pro-preview` to analyze uploaded traffic situation images

### Type System

`src/types.ts` defines:
- `RawQuestion` — shape from JSON (array-indexed options, nullable image)
- `Question` — normalized shape (A/B/C/D option IDs, resolved image URL, chapter info)
- `QuestionOption` — individual answer choice with id + text
- `ChapterStat` — chapter-level performance metrics

### Component Structure

- `App.tsx` — top-level layout with two views: "dashboard" (exam) and "analyzer" (AI image analysis). Manages exam state (questions, confirmed answers, current question number, chapter stats).
- Dashboard view uses a 3-column layout with responsive sidebar switching:
  - `Sidebar` (left) — question navigator grid
  - `MainContent` (center) — current question display, answer selection/confirmation, explanation
  - `RightSidebar` (right) — chapter statistics with charts (recharts)
- On mobile, `MobileDashboardTabBar` replaces the desktop header; left/center/right panels switch via `activeSidebar`.
- `ExamSetupScreen` — pre-exam landing page with start button.
- `ImageAnalyzer` — file upload + Gemini-powered traffic analysis (markdown rendering via react-markdown).
- `SmoothScroll` — wraps content with lenis smooth scrolling.

### Context & Hooks

- `ThemeContext` — theme (light/dark) management with CSS variables.
- `LanguageContext` — i18n (Vietnamese/English) via a simple translation dictionary.
- `useMediaQuery` / `useIsDesktop` — responsive breakpoint detection at 1024px.

### Styling

Tailwind CSS v4 with Vite plugin. Uses CSS custom properties (e.g., `--bg-primary`, `--text-secondary`, `--border`) for theming. Motion library for animations.

### Image Assets

Question images are colocated in `images/` with naming convention `cau_XXX.{jpg,jpeg,png,webp}` (zero-padded 3-digit question ID). Vite's `import.meta.glob` resolves them at build time. Falls back to the JSON `image` field or a placeholder URL.

### Scripts

- `scripts/auto-answer-random-to-29.mjs` — utility for random answer generation.
- `scripts/pdf_to_json/` — Python script (uses PyMuPDF) to convert PDF question banks to JSON.
