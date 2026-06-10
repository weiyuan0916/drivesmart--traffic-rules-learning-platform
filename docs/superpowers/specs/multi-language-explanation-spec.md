# Spec — Multi-Language Explanation Feature

**Phiên bản:** 1.0
**Ngày:** 2026-06-09
**Feature:** Multi-Language Explanation cho VinaListen
**Trạng thái:** Draft

---

## Mục lục

1. [Overview](#1-overview)
2. [User Stories](#2-user-stories)
3. [Supported Languages](#3-supported-languages)
4. [Architecture](#4-architecture)
5. [Component Specification](#5-component-specification)
6. [Data Flow & API](#6-data-flow--api)
7. [State Management](#7-state-management)
8. [Error Handling & Edge Cases](#8-error-handling--edge-cases)
9. [Performance Optimization](#9-performance-optimization)
10. [Accessibility](#10-accessibility)
11. [Responsive Design](#11-responsive-design)
12. [Testing Strategy](#12-testing-strategy)
13. [Implementation Phases](#13-implementation-phases)

---

## 1. Overview

### 1.1 Feature Summary

Cho phép user xem giải thích kết quả dictation (AI feedback, vocabulary) bằng **6 ngôn ngữ**: Tiếng Việt, Tiếng Anh, Tiếng Nhật, Tiếng Trung, Tiếng Hàn, Tiếng Pháp. User có thể đổi ngôn ngữ giải thích tại 3 vị trí: Result Panel, Settings, và per-lesson override.

### 1.2 Business Goals

- Tăng engagement: user có thể học vocabulary bằng ngôn ngữ mẹ đẻ
- Tăng retention: người dùng có level tiếng Anh khác nhau đều hiểu được feedback
- Giảm bounce rate: không bị stuck vì không hiểu giải thích
- Foundation cho premium: premium user có thể chọn thêm ngôn ngữ

### 1.3 Non-Goals

- Không dịch full transcript (chỉ dịch explanation/feedback)
- Không tạo content bằng AI cho tất cả ngôn ngữ (chỉ translate từ nội dung có sẵn)
- Không hỗ trợ RTL languages (Arabic, Hebrew)

---

## 2. User Stories

### 2.1 Primary Users

| User | Story | Benefit |
|------|-------|---------|
| Beginner (A1-A2) | Tôi không hiểu tiếng Anh, tôi muốn đọc feedback bằng tiếng Việt | Hiểu được mình sai chỗ nào |
| Intermediate (B1-B2) | Tôi muốn đọc feedback bằng tiếng Anh để vừa học vừa hiểu | Học thêm từ vựng tiếng Anh |
| Japanese speaker | Tôi là người Nhật học tiếng Anh, muốn đọc bằng tiếng Nhật | Tránh dùng từ điển Việt-Anh |
| Korean learner | Tôi học qua tiếng Hàn, dùng tiếng Hàn để giải thích | Hiểu nhanh hơn |
| Chinese speaker | Tôi muốn đọc feedback bằng tiếng Trung giản thể | Không phải dùng từ điển |
| French learner | Tôi học qua tiếng Pháp, muốn đọc bằng tiếng Pháp | Học vocabulary tiếng Anh |

### 2.2 Interaction Flows

#### Flow 1: First-time user completes a lesson
```
1. User completes lesson
2. Result Panel shows default (Vietnamese explanation)
3. User sees 6 language flags at top of Result Panel
4. User clicks 🇯🇵 Japan
5. Loading spinner (1-2s on first request)
6. Japanese explanation appears
7. User clicks "Tiếp theo" → next lesson
8. System remembers Japanese preference for future lessons
```

#### Flow 2: User changes default in Settings
```
1. User opens Settings
2. User scrolls to "Ngôn ngữ giải thích" section
3. User selects "Tiếng Hàn"
4. System saves to database
5. User returns to lesson
6. All explanations now default to Korean
7. User can still override per-lesson
```

#### Flow 3: User overrides for one lesson only
```
1. User is in a difficult lesson (Business English vocabulary)
2. Default language is Vietnamese
3. User clicks 🇰🇷 Korean for this lesson only
4. Korean explanation shows for this lesson
5. User moves to next lesson
6. Language reverts to default (Vietnamese)
```

---

## 3. Supported Languages

### 3.1 Language List

| Code | Name | Flag | Native Name | Default For |
|------|------|------|-------------|-------------|
| `vi` | Vietnamese | 🇻🇳 | Tiếng Việt | Yes (default) |
| `en` | English | 🇬🇧 | English | Yes (alt) |
| `ja` | Japanese | 🇯🇵 | 日本語 | Japanese speakers |
| `zh` | Chinese | 🇨🇳 | 中文 | Chinese speakers |
| `ko` | Korean | 🇰🇷 | 한국어 | Korean speakers |
| `fr` | French | 🇫🇷 | Français | French speakers |

### 3.2 Priority Resolution Chain

```
Local Override (session/per-lesson)
        ↓ (if null)
User Preference (database/settings)
        ↓ (if null)
Browser Language (navigator.language)
        ↓ (if no match)
Fallback: 'vi' (Vietnamese)
```

### 3.3 Browser Language Mapping

| navigator.language | Resolved Code |
|--------------------|---------------|
| `vi`, `vi-VN` | `vi` |
| `en`, `en-US`, `en-GB` | `en` |
| `ja`, `ja-JP` | `ja` |
| `zh`, `zh-CN`, `zh-TW` | `zh` |
| `ko`, `ko-KR` | `ko` |
| `fr`, `fr-FR` | `fr` |
| Anything else | `vi` |

---

## 4. Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ ResultPanel  │  │   Settings    │  │ LessonPage     │  │
│  │              │  │               │  │                │  │
│  │ [Language    │  │ [Language     │  │ [Language      │  │
│  │  Selector]   │  │  Selector]    │  │  Selector]     │  │
│  │              │  │               │  │                │  │
│  │ Explanation  │  │ Default       │  │ Per-lesson     │  │
│  │ Content      │  │ Preference     │  │ Override       │  │
│  └──────┬───────┘  └───────┬───────┘  └───────┬────────┘  │
│         │                   │                   │            │
│         └───────────────────┼───────────────────┘            │
│                             ▼                                │
│              ┌─────────────────────────────┐                │
│              │  ExplanationContext (React)  │               │
│              │  + useExplanationLanguage()  │               │
│              └──────────────┬──────────────┘                │
│                             ▼                                │
│              ┌─────────────────────────────┐                │
│              │     Zustand Store            │               │
│              │  • currentLanguage          │               │
│              │  • localOverride             │               │
│              │  • explanationCache          │               │
│              └──────────────┬──────────────┘                │
│                             ▼                                │
│              ┌─────────────────────────────┐                │
│              │     explanationApi           │               │
│              │  GET /api/explanation        │               │
│              │  PATCH /api/user/settings   │               │
│              └──────────────┬──────────────┘                │
└─────────────────────────────┼───────────────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │  BACKEND API    │
                    │  (Laravel/PHP)  │
                    │                 │
                    │ GET explanation │
                    │ PATCH settings  │
                    │                 │
                    │ ExplanationService│
                    │  → Check cache   │
                    │  → AI translate  │
                    │  → Save cache    │
                    │                 │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │  Gemini AI      │
                    │  (Translation)  │
                    └─────────────────┘
```

### 4.2 File Structure

```
src/
├── contexts/
│   └── ExplanationContext.tsx        # React context + provider
│
├── hooks/
│   ├── useExplanationLanguage.ts    # Primary hook for language resolution
│   └── useExplanation.ts            # Hook for fetching/displaying explanation content
│
├── components/
│   ├── language-selector/
│   │   ├── LanguageSelector.tsx     # Main component (3 variants)
│   │   ├── LanguageSelectorButton.tsx
│   │   ├── LanguageOption.tsx
│   │   └── LanguageSelector.css
│   │
│   ├── explanation-panel/
│   │   ├── ExplanationPanel.tsx     # Shows explanation content
│   │   ├── ExplanationLoading.tsx   # Loading skeleton
│   │   ├── ExplanationError.tsx     # Error state
│   │   └── ExplanationPanel.css
│   │
│   └── result-panel/
│       └── ResultPanel.tsx          # Updated to include LanguageSelector
│
├── services/
│   └── explanationApi.ts            # API calls
│
├── store/
│   └── explanationStore.ts          # Zustand store
│
├── types/
│   └── explanation.ts               # TypeScript types
│
├── constants/
│   └── languages.ts                # Language config (flags, names, codes)
│
└── utils/
    └── languageUtils.ts            # Resolution helpers
```

---

## 5. Component Specification

### 5.1 Type Definitions

```typescript
// src/types/explanation.ts

export type LanguageCode = 'vi' | 'en' | 'ja' | 'zh' | 'ko' | 'fr';

export interface LanguageOption {
  code: LanguageCode;
  name: string;          // "Vietnamese"
  nativeName: string;    // "Tiếng Việt"
  flag: string;          // "🇻🇳"
  direction: 'ltr';      // All supported languages are LTR
}

export interface ExplanationContent {
  clipId: number;
  language: LanguageCode;
  explanation: string;   // AI feedback text (e.g., "Bạn thường bỏ sót mạo từ")
  vocabulary: VocabularyItem[];
  aiGenerated: boolean;
  generatedAt?: string;  // ISO timestamp
}

export interface VocabularyItem {
  word: string;
  translation: string;
  phonetic?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
}

export interface ExplanationState {
  language: LanguageCode;
  override: LanguageCode | null;
  content: ExplanationContent | null;
  isLoading: boolean;
  error: string | null;
  aiGenerating: boolean;
}

export type LanguageSelectorVariant =
  | 'button-group'   // ResultPanel — row of flag buttons
  | 'dropdown'        // Settings — dropdown select
  | 'inline-selector'; // LessonPage — inline with explanation
```

### 5.2 Language Constants

```typescript
// src/constants/languages.ts

import type { LanguageOption, LanguageCode } from '../types/explanation';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', direction: 'ltr' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'vi';

export const LANGUAGE_MAP: Record<string, LanguageCode> = {
  vi: 'vi', 'vi-vn': 'vi',
  en: 'en', 'en-us': 'en', 'en-gb': 'en',
  ja: 'ja', 'ja-jp': 'ja',
  zh: 'zh', 'zh-cn': 'zh', 'zh-tw': 'zh',
  ko: 'ko', 'ko-kr': 'ko',
  fr: 'fr', 'fr-fr': 'fr',
};

export function getLanguageByCode(code: LanguageCode): LanguageOption {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) ?? SUPPORTED_LANGUAGES[0];
}
```

### 5.3 LanguageSelector Component

#### Props Interface

```typescript
interface LanguageSelectorProps {
  value: LanguageCode | null;         // Current active language
  onChange: (code: LanguageCode) => void;
  variant: LanguageSelectorVariant;
  disabled?: boolean;
  showLabel?: boolean;                // Show language name below flag
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### Variant 1: `button-group` (Result Panel)

```
┌──────────────────────────────────────────────────────────┐
│ 🇻🇳  🇬🇧  🇯🇵  🇨🇳  🇰🇷  🇫🇷                             │
│ Vi   En   Ja   Zh   Ko   Fr                            │
└──────────────────────────────────────────────────────────┘
```

- Row of 6 buttons, each 44x44px minimum touch target
- Active button: primary color background, white text
- Inactive: transparent background, muted text
- Hover: light primary background
- Focus: 2px outline, visible focus ring

#### Variant 2: `dropdown` (Settings)

```
┌──────────────────────────────────────────────────────────┐
│ Ngôn ngữ giải thích                                ▼     │
│                                                          │
│  Chọn ngôn ngữ bạn muốn nhận feedback bằng:             │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🇬🇧  English                                  ▼    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  🇻🇳  Tiếng Việt                                       │
│  🇬🇧  English                                          │
│  🇯🇵  日本語                                            │
│  🇨🇳  中文                                               │
│  🇰🇷  한국어                                            │
│  🇫🇷  Français                                         │
└──────────────────────────────────────────────────────────┘
```

#### Variant 3: `inline-selector` (Lesson Page)

```
┌──────────────────────────────────────────────────────────┐
│ Giải thích bằng: [🇯🇵 日本語 ▼]                           │
└──────────────────────────────────────────────────────────┘
```

### 5.4 ExplanationPanel Component

```typescript
interface ExplanationPanelProps {
  clipId: number;
  className?: string;
  showVocabulary?: boolean;
}
```

#### Layout Structure

```
┌─ Explanation Panel ──────────────────────────────────────┐
│                                                             │
│  LanguageSelector (variant: inline-selector)               │
│  ─────────────────────────────────────────                  │
│                                                             │
│  ┌─ AI Feedback ───────────────────────────────────────┐  │
│  │                                                        │  │
│  │  Bạn thường bỏ sót mạo từ "a", "an", "the"          │  │
│  │                                                        │  │
│  │  Các lỗi phổ biến:                                    │  │
│  │  • "I am learn" → "I am learning" (thiếu -ing)        │  │
│  │  • "very much" → "very much" (đúng nhưng redundant)  │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Vocabulary ─────────────────────────────────────────┐  │
│  │                                                        │  │
│  │  frequently  /ˈfriːkwəntli/  thường xuyên            │  │
│  │  improve     /ɪmˈpruːv/       cải thiện             │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 ResultPanel Integration

The ResultPanel component (existing) will be updated to include the LanguageSelector at the top:

```
┌─ Result Panel ─────────────────────────────────────────────┐
│                                                              │
│  Accuracy Ring        85%                                   │
│  ────────────────    ───────────────                       │
│  Correct: 34         XP Earned: +85                        │
│  Wrong: 6             Streak: 5 🔥                         │
│  ──────────────────────────────────────────                 │
│                                                              │
│  🇻🇳 🇬🇧 🇯🇵 🇨🇳 🇰🇷 🇫🇷   ← LanguageSelector (button-group) │
│                                                              │
│  ┌─ AI Feedback ─────────────────────────────────────────┐  │
│  │  Bạn thường bỏ sót mạo từ "a", "an", "the"...       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Vocabulary ─────────────────────────────────────────┐  │
│  │  frequently  thường xuyên                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [ 🔄 Thử lại ]   [ ▶️ Tiếp theo ]                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Data Flow & API

### 6.1 Priority Resolution Algorithm

```typescript
// src/hooks/useExplanationLanguage.ts

export function useExplanationLanguage(): {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  setOverride: (code: LanguageCode | null) => void;
  clearOverride: () => void;
} {
  const { override, setLanguage } = useExplanationStore();
  const { user } = useAuth();
  const browserLang = useBrowserLanguage();

  const language = useMemo(() => {
    // Priority 1: Local override (per-lesson)
    if (override !== null) {
      return override;
    }
    // Priority 2: User preference from database
    if (user?.explanation_language) {
      return user.explanation_language as LanguageCode;
    }
    // Priority 3: Browser language
    if (browserLang !== null) {
      return browserLang;
    }
    // Fallback
    return DEFAULT_LANGUAGE;
  }, [override, user?.explanation_language, browserLang]);

  return { language, setLanguage, setOverride, clearOverride };
}
```

### 6.2 API Endpoints

#### GET `/api/v1/explanation/{clipId}`

Fetch explanation for a specific clip.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `lang` | string | Yes | Language code (vi, en, ja, zh, ko, fr) |

**Response 200:**

```json
{
  "data": {
    "clip_id": 42,
    "language": "ja",
    "explanation": "「a」「an」「the」などの冠詞をよく忘れます。",
    "vocabulary": [
      {
        "word": "frequently",
        "translation": "頻繁に",
        "phonetic": "/ˈfriːkwəntli/"
      },
      {
        "word": "improve",
        "translation": "改善する",
        "phonetic": "/ɪmˈpruːv/"
      }
    ],
    "ai_generated": false,
    "generated_at": "2026-06-09T01:00:00Z",
    "cached": true
  }
}
```

**Response 404:**

```json
{
  "error": "EXPLANATION_NOT_FOUND",
  "message": "Transcript not available for this clip"
}
```

**Response 503 (AI unavailable):**

```json
{
  "error": "AI_SERVICE_UNAVAILABLE",
  "message": "Translation service temporarily unavailable",
  "retry_after": 30
}
```

#### PATCH `/api/v1/user/settings`

Update user's default explanation language.

**Request Body:**

```json
{
  "explanation_language": "ja"
}
```

**Response 200:**

```json
{
  "data": {
    "explanation_language": "ja",
    "updated_at": "2026-06-09T01:05:00Z"
  },
  "message": "Language preference updated"
}
```

#### POST `/api/v1/explanation/{clipId}/generate` (Admin/Internal)

Trigger AI generation for a clip in a specific language.

**Request Body:**

```json
{
  "language": "ja",
  "force_regenerate": false
}
```

**Response 202:**

```json
{
  "job_id": "gen_abc123",
  "status": "queued",
  "estimated_completion": "2026-06-09T01:10:00Z"
}
```

### 6.3 Frontend Service Layer

```typescript
// src/services/explanationApi.ts

import type { LanguageCode, ExplanationContent } from '../types/explanation';

const API_BASE = '/api/v1';

class ExplanationApi {
  async getExplanation(clipId: number, lang: LanguageCode): Promise<ExplanationContent> {
    const cacheKey = `explanation_${clipId}_${lang}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const response = await fetch(`${API_BASE}/explanation/${clipId}?lang=${lang}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) throw new ExplanationNotFoundError(clipId, lang);
      if (response.status === 503) throw new AIServiceUnavailableError();
      throw new ApiError(response.status, await response.text());
    }

    const { data } = await response.json();
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  }

  async updateDefaultLanguage(lang: LanguageCode): Promise<void> {
    const response = await fetch(`${API_BASE}/user/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explanation_language: lang }),
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
  }
}

export const explanationApi = new ExplanationApi();
```

### 6.4 Backend Service (Laravel)

```php
// app/Services/ExplanationService.php

class ExplanationService {
    public function getExplanation(int $clipId, string $lang): array {
        // Validate language
        if (!in_array($lang, ['vi', 'en', 'ja', 'zh', 'ko', 'fr'])) {
            throw new \InvalidArgumentException("Unsupported language: $lang");
        }

        // 1. Try pre-translated cache
        $cached = LessonExplanation::where('clip_id', $clipId)
            ->where('language_code', $lang)
            ->first();

        if ($cached) {
            return [
                'data' => $cached,
                'ai_generated' => false,
                'cached' => true,
            ];
        }

        // 2. AI translate via Gemini
        try {
            $gemini = app(GeminiService::class);
            $result = $gemini->translateAndExplain(
                clipId: $clipId,
                targetLang: $lang,
            );

            // 3. Save for next time
            $explanation = LessonExplanation::create([
                'clip_id' => $clipId,
                'language_code' => $lang,
                'explanation' => $result['explanation'],
                'vocabulary_translations' => $result['vocabulary'],
            ]);

            return [
                'data' => $explanation,
                'ai_generated' => true,
                'cached' => false,
            ];

        } catch (GeminiException $e) {
            // If AI fails, return default Vietnamese if available
            $fallback = LessonExplanation::where('clip_id', $clipId)
                ->where('language_code', 'vi')
                ->first();

            if ($fallback) {
                return [
                    'data' => $fallback,
                    'ai_generated' => false,
                    'cached' => true,
                    'fallback' => true,
                ];
            }

            throw new AIServiceUnavailableError();
        }
    }
}
```

### 6.5 AI Translation Prompt (Gemini)

```python
# Backend: Gemini prompt template

TRANSLATION_PROMPT = """
You are an English learning assistant. Translate the following dictation
explanation and vocabulary into {target_language}.

Original explanation (Vietnamese):
{original_explanation}

Original vocabulary:
{original_vocabulary}

Output format (JSON):
{{
  "explanation": "[translated explanation in {target_language}]",
  "vocabulary": [
    {{
      "word": "english_word",
      "translation": "[translation in {target_language}]",
      "phonetic": "[IPA phonetic]"
    }}
  ]
}}

Rules:
- Keep explanation concise (2-4 sentences)
- Focus on the most important learning points
- Vocabulary translations should be natural and common
- Preserve English words that are the same in {target_language}
"""
```

---

## 7. State Management

### 7.1 Zustand Store

```typescript
// src/store/explanationStore.ts

import { create } from 'zustand';
import type { LanguageCode, ExplanationContent } from '../types/explanation';
import { explanationApi } from '../services/explanationApi';
import { DEFAULT_LANGUAGE } from '../constants/languages';

interface ExplanationStore {
  // Language state
  currentLanguage: LanguageCode;
  localOverride: LanguageCode | null;
  pendingLanguage: LanguageCode | null;

  // Content state
  contentCache: Record<string, ExplanationContent>; // key: `${clipId}_${lang}`
  currentContent: ExplanationContent | null;
  isLoading: boolean;
  aiGenerating: boolean;
  error: string | null;

  // Actions
  setLanguage: (lang: LanguageCode) => void;
  setOverride: (lang: LanguageCode | null) => void;
  clearOverride: () => void;
  fetchExplanation: (clipId: number, lang: LanguageCode) => Promise<void>;
  clearCache: () => void;
}

export const useExplanationStore = create<ExplanationStore>((set, get) => ({
  currentLanguage: DEFAULT_LANGUAGE,
  localOverride: null,
  pendingLanguage: null,
  contentCache: {},
  currentContent: null,
  isLoading: false,
  aiGenerating: false,
  error: null,

  setLanguage: (lang) => set({ currentLanguage: lang }),

  setOverride: (lang) => set({ localOverride: lang }),

  clearOverride: () => set({ localOverride: null }),

  fetchExplanation: async (clipId, lang) => {
    const cacheKey = `${clipId}_${lang}`;

    // Return from cache if available
    if (get().contentCache[cacheKey]) {
      set({ currentContent: get().contentCache[cacheKey], currentLanguage: lang });
      return;
    }

    set({ isLoading: true, error: null, pendingLanguage: lang });

    try {
      const content = await explanationApi.getExplanation(clipId, lang);

      set((state) => ({
        contentCache: { ...state.contentCache, [cacheKey]: content },
        currentContent: content,
        currentLanguage: lang,
        isLoading: false,
        pendingLanguage: null,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, isLoading: false, pendingLanguage: null });
    }
  },

  clearCache: () => set({ contentCache: {}, currentContent: null }),
}));
```

### 7.2 React Context

```typescript
// src/contexts/ExplanationContext.tsx

import { createContext, useContext, type ReactNode } from 'react';
import { useExplanationStore } from '../store/explanationStore';

interface ExplanationContextValue {
  language: LanguageCode;
  content: ExplanationContent | null;
  isLoading: boolean;
  error: string | null;
  setLanguage: (lang: LanguageCode) => void;
  setOverride: (lang: LanguageCode | null) => void;
  clearOverride: () => void;
  fetchExplanation: (clipId: number) => Promise<void>;
}

const ExplanationContext = createContext<ExplanationContextValue | null>(null);

export function ExplanationProvider({ children }: { children: ReactNode }) {
  const store = useExplanationStore();

  const value: ExplanationContextValue = {
    language: store.currentLanguage,
    content: store.currentContent,
    isLoading: store.isLoading,
    error: store.error,
    setLanguage: store.setLanguage,
    setOverride: store.setOverride,
    clearOverride: store.clearOverride,
    fetchExplanation: (clipId) => store.fetchExplanation(clipId, store.localOverride ?? store.currentLanguage),
  };

  return (
    <ExplanationContext.Provider value={value}>
      {children}
    </ExplanationContext.Provider>
  );
}

export function useExplanationContext() {
  const ctx = useContext(ExplanationContext);
  if (!ctx) throw new Error('useExplanationContext must be used within ExplanationProvider');
  return ctx;
}
```

---

## 8. Error Handling & Edge Cases

### 8.1 Edge Cases Matrix

| Scenario | Detection | Behavior |
|----------|-----------|----------|
| User chưa login, chưa set language | `user.explanation_language === null` | Dùng browser language → fallback 'vi' |
| AI translation fail | Gemini returns error | Show fallback Vietnamese if available; else error state |
| API timeout (>10s) | `AbortSignal.timeout` fires | Skeleton → error state → retry button |
| Clip không có transcript gốc | API 404 `EXPLANATION_NOT_FOUND` | Ẩn explanation feature, log analytics |
| AI chưa generate xong (async) | `ai_generated: null` | Show "Đang tạo giải thích..." spinner |
| User đổi language giữa chừng | Multiple `onChange` calls | Cancel pending request via `AbortController` |
| Rate limit AI | API 429 | Queue + exponential backoff (2s, 4s, 8s) |
| User chuyển lesson mới | `clipId` changes | Clear `localOverride`, fetch new content |
| Language không supported | Invalid code in response | Ẩn option đó trong UI |
| Network offline | `navigator.onLine === false` | Show cached explanation if available; else offline message |
| Session expired mid-request | HTTP 401 | Redirect to login, preserve language preference in URL param |
| Explanation too long (>5000 chars) | AI response validation | Truncate + add "Xem thêm" button |
| Empty explanation | AI returns empty string | Show generic "Keep practicing!" message |

### 8.2 Error States UI

#### Error State (Network/API)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ⚠️ Không thể tải giải thích bằng Tiếng Nhật                │
│                                                              │
│  Có thể do kết nối mạng hoặc máy chủ đang bận.              │
│                                                              │
│  [ 🔄 Thử lại ]            [ 📝 Dùng Tiếng Việt ]           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Loading State (First Request — AI Generating)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  🔄 Đang tạo giải thích bằng Tiếng Hàn...                   │
│     (Lần đầu có thể mất 3-5 giây)                           │
│                                                              │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  │
│  │  ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Loading State (Cache Hit — Instant)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Đang tải giải thích... (0.2s)                              │
│                                                              │
│  [Animated skeleton — 3 lines of text]                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Offline State

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  📴 Bạn đang offline                                        │
│                                                              │
│  Hiển thị giải thích đã lưu trước đó:                       │
│                                                              │
│  Bạn thường bỏ sót mạo từ...                                │
│                                                              │
│  [ 🔄 Thử lại khi có mạng ]                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 8.3 Rate Limiting Strategy

| Tier | Limit | Window | Response |
|------|-------|--------|----------|
| Anonymous | 5 requests | per minute | 429 + `retry_after` |
| Authenticated (free) | 10 requests | per minute | 429 + `retry_after` |
| Authenticated (premium) | 60 requests | per minute | 429 + `retry_after` |
| AI generation | 1 per `(clipId, lang)` | lifetime | Cache hit (instant) |

### 8.4 Retry Strategy

```typescript
async function fetchWithRetry(
  clipId: number,
  lang: LanguageCode,
  maxRetries = 3
): Promise<ExplanationContent> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await explanationApi.getExplanation(clipId, lang);
    } catch (err) {
      lastError = err as Error;

      if (isNetworkError(err) || isTimeoutError(err)) {
        // Exponential backoff: 1s, 2s, 4s
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }

      // Non-retryable error (404, 401, etc.)
      throw err;
    }
  }

  throw lastError!;
}
```

---

## 9. Performance Optimization

### 9.1 Caching Strategy

| Layer | Strategy | TTL | Scope |
|-------|----------|-----|-------|
| Session storage | Explanation JSON | Session lifetime | Per `(clipId, lang)` |
| Zustand store | In-memory map | Until page refresh | Global |
| Backend DB | Pre-translated explanations | Permanent | Per `(clipId, lang)` |
| AI service | Gemini response | Permanent (after first generate) | Per `(clipId, lang)` |

### 9.2 Prefetch Strategy

When user is on lesson `N` and completes it, prefetch explanation for lesson `N+1` in the background:

```typescript
// After user submits answer for lesson N
useEffect(() => {
  if (currentLesson.completed) {
    const nextLessonId = currentLesson.nextId;
    const lang = useExplanationStore.getState().localOverride
      ?? useExplanationStore.getState().currentLanguage;

    // Prefetch in background (non-blocking)
    explanationApi.getExplanation(nextLessonId, lang).catch(() => {});
  }
}, [currentLesson.id]);
```

### 9.3 Bundle Optimization

- `LanguageSelector` component: code-split from main bundle
- `explanationApi` service: lazy loaded
- Language constants: static, tree-shakeable
- CSS: colocated per component, purged in production

---

## 10. Accessibility

### 10.1 Keyboard Navigation

| Element | Key | Action |
|---------|-----|--------|
| LanguageSelector | `Tab` | Move focus between options |
| LanguageSelector | `Enter` / `Space` | Select focused language |
| LanguageSelector | `Arrow Left/Right` | Move between adjacent languages |
| LanguageSelector | `Escape` | Close dropdown (if variant=dropdown), clear override |
| Retry button | `Enter` | Retry fetch |
| Explanation panel | `Tab` | Move between explanation → vocabulary → buttons |

### 10.2 Screen Reader Support

```tsx
// LanguageSelector button
<button
  role="radio"
  aria-checked={isActive}
  aria-label={`Explanation language: ${language.nativeName}`}
  title={`Change explanation to ${language.nativeName}`}
>
  <span aria-hidden="true">{language.flag}</span>
  <span>{language.nativeName}</span>
</button>
```

```tsx
// Explanation panel
<div
  role="region"
  aria-label="Lesson explanation"
  aria-live="polite"
  aria-busy={isLoading}
>
  {isLoading && <span className="sr-only">Loading explanation...</span>}
  {error && <span className="sr-only">Error loading explanation</span>}
  {content && (
    <>
      <h3>AI Feedback</h3>
      <p>{content.explanation}</p>
      <h3>Vocabulary</h3>
      <dl>
        {content.vocabulary.map((v) => (
          <div key={v.word}>
            <dt>{v.word}</dt>
            <dd>{v.translation}</dd>
          </div>
        ))}
      </dl>
    </>
  )}
</div>
```

### 10.3 Color Contrast

- Primary active button: `#35375B` (text) on `#FFFFFF` (background) — ratio 11.8:1 ✓
- Error text `#FF3257` on white background — ratio 4.6:1 ✓
- Muted text `#6B7280` on white — ratio 5.9:1 ✓ (meets AA)

---

## 11. Responsive Design

### 11.1 Breakpoints

| Breakpoint | Width | LanguageSelector Behavior |
|------------|-------|---------------------------|
| Mobile | 320px - 767px | button-group: scroll horizontally if needed, 6 buttons in 2 rows of 3 |
| Tablet | 768px - 1024px | button-group: full row, smaller buttons |
| Desktop | 1025px+ | button-group: full row with labels below flags |

### 11.2 Mobile Layout

```
┌─ Mobile 375px ─────────────────────────────────────────────┐
│                                                              │
│  ResultPanel                                                │
│  ─────────────────────────────────────                      │
│  85%                                                        │
│  Correct: 34  Wrong: 6                                     │
│  ─────────────────────────────────────                      │
│                                                              │
│  🇻🇳 🇬🇧 🇯🇵         (row 1: 3 buttons)              │
│  🇨🇳 🇰🇷 🇫🇷         (row 2: 3 buttons)              │
│                                                              │
│  ─────────────────────────────────────                      │
│                                                              │
│  ┌─ Explanation ───────────────────────────────────────┐   │
│  │  Bạn thường bỏ sót mạo từ...                       │   │
│  │  Các lỗi phổ biến:                                  │   │
│  │  • "I am learn" → "I am learning"                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Vocabulary ────────────────────────────────────────┐   │
│  │  frequently  thường xuyên                           │   │
│  │  improve      cải thiện                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [ 🔄 Thử lại ]          [ ▶️ Tiếp theo ]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

#### `useExplanationLanguage` hook

```typescript
// __tests__/hooks/useExplanationLanguage.test.ts

describe('useExplanationLanguage', () => {
  it('returns local override when set', () => {
    const { result } = renderHook(() => useExplanationLanguage(), {
      wrapper: ({ children }) => (
        <UserProvider mockUser={{ explanation_language: 'vi' }}>
          <ExplanationProvider mockOverride="ja">
            {children}
          </ExplanationProvider>
        </UserProvider>
      )
    });
    expect(result.current.language).toBe('ja');
  });

  it('falls back to user preference when no override', () => {
    const { result } = renderHook(() => useExplanationLanguage(), {
      wrapper: ({ children }) => (
        <UserProvider mockUser={{ explanation_language: 'en' }}>
          <ExplanationProvider>{children}</ExplanationProvider>
        </UserProvider>
      )
    });
    expect(result.current.language).toBe('en');
  });

  it('falls back to browser language when no preference', () => {
    const { result } = renderHook(() => useExplanationLanguage(), {
      wrapper: ({ children }) => (
        <UserProvider mockUser={{ explanation_language: null }}>
          <MockBrowserLanguage value="ko">
            <ExplanationProvider>{children}</ExplanationProvider>
          </MockBrowserLanguage>
        </UserProvider>
      )
    });
    expect(result.current.language).toBe('ko');
  });

  it('falls back to Vietnamese when browser language not supported', () => {
    const { result } = renderHook(() => useExplanationLanguage(), {
      wrapper: ({ children }) => (
        <UserProvider mockUser={{ explanation_language: null }}>
          <MockBrowserLanguage value="de">
            <ExplanationProvider>{children}</ExplanationProvider>
          </MockBrowserLanguage>
        </UserProvider>
      )
    });
    expect(result.current.language).toBe('vi');
  });

  it('clearOverride reverts to user preference', () => {
    const { result } = renderHook(() => useExplanationLanguage(), {
      wrapper: ({ children }) => (
        <UserProvider mockUser={{ explanation_language: 'fr' }}>
          <ExplanationProvider mockOverride="ko">{children}</ExplanationProvider>
        </UserProvider>
      )
    });

    expect(result.current.language).toBe('ko');
    act(() => result.current.clearOverride());
    expect(result.current.language).toBe('fr');
  });
});
```

#### `LanguageSelector` component

```typescript
// __tests__/components/LanguageSelector.test.tsx

describe('LanguageSelector', () => {
  describe('button-group variant', () => {
    it('renders all 6 language options', () => {
      render(<LanguageSelector value="vi" onChange={fn()} variant="button-group" />);
      expect(screen.getAllByRole('radio')).toHaveLength(6);
    });

    it('calls onChange with correct code on click', () => {
      const onChange = fn();
      render(<LanguageSelector value="vi" onChange={onChange} variant="button-group" />);

      fireEvent.click(screen.getByLabelText('Explanation language: 日本語'));
      expect(onChange).toHaveBeenCalledWith('ja');
    });

    it('shows active state for selected language', () => {
      render(<LanguageSelector value="ko" onChange={fn()} variant="button-group" />);
      const koButton = screen.getByRole('radio', { checked: true });
      expect(koButton).toHaveAttribute('aria-label', 'Explanation language: 한국어');
    });

    it('is keyboard navigable with arrow keys', () => {
      const onChange = fn();
      render(<LanguageSelector value="vi" onChange={onChange} variant="button-group" />);

      const viButton = screen.getByRole('radio', { checked: true });
      viButton.focus();
      fireEvent.keyDown(viButton, { key: 'ArrowRight' });

      expect(onChange).toHaveBeenCalledWith('en');
    });

    it('wraps from last to first with arrow key', () => {
      const onChange = fn();
      render(<LanguageSelector value="fr" onChange={onChange} variant="button-group" />);

      const frButton = screen.getByRole('radio', { checked: true });
      frButton.focus();
      fireEvent.keyDown(frButton, { key: 'ArrowRight' });

      expect(onChange).toHaveBeenCalledWith('vi');
    });
  });

  describe('dropdown variant', () => {
    it('opens dropdown on click', async () => {
      render(<LanguageSelector value="vi" onChange={fn()} variant="dropdown" />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeVisible();
    });

    it('closes dropdown on selection', async () => {
      render(<LanguageSelector value="vi" onChange={fn()} variant="dropdown" />);
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Tiếng Việt'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
```

#### Explanation content display

```typescript
// __tests__/components/ExplanationPanel.test.tsx

describe('ExplanationPanel', () => {
  it('displays explanation text', () => {
    const content: ExplanationContent = {
      clipId: 42,
      language: 'vi',
      explanation: 'Bạn thường bỏ sót mạo từ "a", "an", "the"',
      vocabulary: [],
      aiGenerated: false,
    };

    render(<ExplanationPanel clipId={42} content={content} />);
    expect(screen.getByText(/Bạn thường bỏ sót mạo từ/)).toBeInTheDocument();
  });

  it('displays vocabulary items', () => {
    const content: ExplanationContent = {
      clipId: 42,
      language: 'vi',
      explanation: 'Test',
      vocabulary: [
        { word: 'frequently', translation: 'thường xuyên', phonetic: '/ˈfriːkwəntli/' },
        { word: 'improve', translation: 'cải thiện', phonetic: '/ɪmˈpruːv/' },
      ],
      aiGenerated: false,
    };

    render(<ExplanationPanel clipId={42} content={content} showVocabulary={true} />);
    expect(screen.getByText('frequently')).toBeInTheDocument();
    expect(screen.getByText('/ˈfriːkwəntli/')).toBeInTheDocument();
    expect(screen.getByText('thường xuyên')).toBeInTheDocument();
  });
});
```

### 12.2 Integration Tests

```typescript
// __tests__/integration/explanationLanguageFlow.test.ts

describe('Explanation Language Flow', () => {
  it('user changes language from result panel and sees updated content', async () => {
    // Setup: complete a lesson
    render(<LessonPage clipId={42} />);
    await completeLesson();

    // Step 1: Default is Vietnamese
    await waitFor(() => {
      expect(screen.getByText(/Bạn thường bỏ sót/)).toBeInTheDocument();
    });

    // Step 2: User clicks Korean
    fireEvent.click(screen.getByLabelText('Explanation language: 한국어'));

    // Step 3: Loading state shows
    expect(screen.getByRole('status')).toHaveTextText(/Đang tải/);

    // Step 4: Korean explanation appears
    await waitFor(() => {
      expect(screen.getByText(/자주 놓치는/)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Step 5: Language preference is cached
    const cached = sessionStorage.getItem('explanation_42_ko');
    expect(cached).not.toBeNull();
  });

  it('language change in settings persists across page reload', async () => {
    await page.goto('/settings');
    await page.click('[aria-label="Explanation language: English"]');
    await page.click('button:has-text("Lưu")');
    await page.reload();
    const enButton = page.locator('[aria-label*="English"]');
    await expect(enButton).toHaveAttribute('aria-checked', 'true');
  });

  it('per-lesson override does not affect next lesson default', async () => {
    // User default is Vietnamese
    // Lesson 42: user overrides to Korean
    await page.goto('/lesson/42');
    await completeLesson();
    await page.click('[aria-label="Explanation language: 한국어"]');
    await waitFor(() => expect(page.getByText(/자주 놓치는/)).toBeInTheDocument());

    // Lesson 43: should be back to Vietnamese
    await page.goto('/lesson/43');
    await completeLesson();
    await waitFor(() => expect(screen.getByText(/Bạn thường/)).toBeInTheDocument());
  });
});
```

### 12.3 E2E Tests (Playwright)

```typescript
// e2e/explanation-language.spec.ts

test.describe('Multi-Language Explanation', () => {
  test('complete lesson and switch through all 6 languages', async ({ page }) => {
    await page.goto('/lesson/1');
    await completeLesson(page);

    const languages = ['vi', 'en', 'ja', 'zh', 'ko', 'fr'];

    for (const lang of languages) {
      await page.click(`[aria-label*="${lang}"]`);
      await page.waitForResponse(
        (resp) => resp.url().includes(`/explanation/1?lang=${lang}`),
        { timeout: 15000 }
      );
      // No crash, explanation content visible
      await expect(page.locator('[role="region"][aria-label="Lesson explanation"]')).toBeVisible();
    }
  });

  test('settings page language change reflects in lesson', async ({ page }) => {
    await page.goto('/settings');
    await page.click('button[role="combobox"]');
    await page.click('text=日本語');
    await page.click('button:has-text("Lưu")');

    await page.goto('/lesson/5');
    await completeLesson(page);

    // Default should be Japanese
    const jaButton = page.locator('[aria-label*="日本語"][aria-checked="true"]');
    await expect(jaButton).toBeVisible();
  });

  test('error state shows retry and fallback options', async ({ page }) => {
    await page.route('**/api/v1/explanation/999**', (route) => {
      route.fulfill({ status: 503, body: JSON.stringify({ error: 'AI_SERVICE_UNAVAILABLE' }) });
    });

    await page.goto('/lesson/999');
    await completeLesson(page);
    await page.click('[aria-label*="English"]');

    await expect(page.getByText(/Không thể tải giải thích/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Thử lại/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tiếng Việt/ })).toBeVisible();
  });
});
```

### 12.4 Test Coverage Target

| Layer | Target | Priority |
|-------|--------|----------|
| `useExplanationLanguage` hook | 95% | High |
| `LanguageSelector` component | 85% | High |
| `ExplanationPanel` component | 80% | Medium |
| `explanationStore` (Zustand) | 90% | Medium |
| `explanationApi` service | 80% | Medium |
| API integration | 70% | Medium |
| E2E flows | 5 key flows | High |

---

## 13. Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Define TypeScript types (`src/types/explanation.ts`)
- [ ] Create language constants (`src/constants/languages.ts`)
- [ ] Build Zustand store (`src/store/explanationStore.ts`)
- [ ] Build `LanguageSelector` component (all 3 variants)
- [ ] Integrate `LanguageSelector` into existing ResultPanel
- [ ] Mock API responses for development

### Phase 2: API Integration (Week 2)

- [ ] Create `explanationApi` service
- [ ] Build `ExplanationPanel` component
- [ ] Build `ExplanationContext` provider
- [ ] Connect components to store
- [ ] Error states and loading states
- [ ] Backend: `ExplanationService`, API endpoints

### Phase 3: AI & Polish (Week 3)

- [ ] Gemini integration for translations
- [ ] Caching strategy implementation
- [ ] Prefetch next lesson explanation
- [ ] Accessibility audit
- [ ] Responsive layout verification
- [ ] Performance: lazy loading, code splitting

### Phase 4: Testing & Launch (Week 4)

- [ ] Unit tests (Vitest + React Testing Library)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Rate limiting implementation
- [ ] Monitoring: error tracking, analytics
- [ ] Production deployment

---

## Appendix A: Design Reference

### Color Variables (from Design System)

```css
--primary: #35375B;
--accent: #FF5632;
--success: #00BE7C;
--error: #FF3257;
--light: #EFEFEF;
--dark: #2B2727;
--cream: #F0E7DF;
```

### Animation Specs

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Language switch fade | 200ms | ease-out | on language change |
| Loading skeleton pulse | 1500ms | ease-in-out | on load |
| Error shake | 300ms | ease-out | on error |
| Progress ring fill | 800ms | cubic-bezier(0.4, 0, 0.2, 1) | on mount |
| Dropdown open | 150ms | ease-out | on click |

---

*Document generated: 2026-06-09*
*Status: Draft — Pending review*
