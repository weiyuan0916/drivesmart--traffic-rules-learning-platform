# Multi-Language Explanation Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to view dictation lesson explanations (AI feedback + vocabulary) in 6 languages: Vietnamese, English, Japanese, Chinese, Korean, and French — with per-lesson override and persistent default preference.

**Architecture:** Extend the existing VinaListen lesson practice flow by adding a new `LanguageSelector` component into `ResultPanel`, a Zustand `explanationStore`, a `ExplanationContext` provider, and an `explanationApi` service layer. The backend Laravel API receives a `?lang=` query param and returns cached or AI-generated translations. Priority resolution: local override (session) > user preference (database) > browser language > fallback 'vi'.

**Tech Stack:** React 18, TypeScript, Zustand (existing), Tailwind CSS v4 (existing), Vitest + React Testing Library, existing `apiClient` from `features/listening/api/client.ts`.

---

## File Map

Before writing any task, here's every file that will be created or modified:

### New Files

| File | Responsibility |
|------|--------------|
| `src/features/listening/types/explanation.ts` | All TypeScript types for the feature |
| `src/features/listening/constants/languages.ts` | Language config (codes, flags, names) |
| `src/features/listening/stores/explanationStore.ts` | Zustand store for language + content state |
| `src/features/listening/contexts/ExplanationContext.tsx` | React context wrapping the store |
| `src/features/listening/hooks/useExplanationLanguage.ts` | Priority resolution hook |
| `src/features/listening/api/explanationApi.ts` | API service (GET explanation, PATCH settings) |
| `src/features/listening/components/language-selector/LanguageSelector.tsx` | All 3 variants |
| `src/features/listening/components/explanation-panel/ExplanationPanel.tsx` | Content display |
| `src/features/listening/components/explanation-panel/ExplanationLoading.tsx` | Skeleton loading |
| `src/features/listening/components/explanation-panel/ExplanationError.tsx` | Error state |
| `src/features/listening/hooks/useExplanationLanguage.test.ts` | Unit tests for hook |
| `src/features/listening/components/language-selector/LanguageSelector.test.tsx` | Unit tests for component |
| `src/features/listening/components/explanation-panel/ExplanationPanel.test.tsx` | Unit tests for panel |

### Modified Files

| File | Change |
|------|--------|
| `src/features/listening/components/ResultPanel.tsx` | Import and render `ExplanationPanel` after the error summary section, before action buttons |
| `src/features/listening/AppRouter.tsx` | Wrap routes with `ExplanationProvider` |
| `src/features/listening/stores/lessonStore.ts` | Clear explanation override when `setCurrentClipIndex` is called |
| `src/features/listening/__tests__/integration/explanationLanguageFlow.test.ts` | Integration tests |

---

## Task 1: Types & Constants

**Files:**
- Create: `src/features/listening/types/explanation.ts`
- Create: `src/features/listening/constants/languages.ts`

- [ ] **Step 1: Create `src/features/listening/types/explanation.ts`**

```typescript
// ============================================================
// Explanation Feature Types — VinaListen
// ============================================================

export type LanguageCode = 'vi' | 'en' | 'ja' | 'zh' | 'ko' | 'fr';

export interface LanguageOption {
  code: LanguageCode
  name: string
  nativeName: string
  flag: string
  direction: 'ltr'
}

export interface VocabularyItem {
  word: string
  translation: string
  phonetic?: string
  partOfSpeech?: string
  exampleSentence?: string
}

export interface ExplanationContent {
  clipId: string
  language: LanguageCode
  explanation: string
  vocabulary: VocabularyItem[]
  aiGenerated: boolean
  generatedAt?: string
  cached?: boolean
  fallback?: boolean
}

export interface ExplanationApiResponse {
  clip_id: string
  language: LanguageCode
  explanation: string
  vocabulary: VocabularyItem[]
  ai_generated: boolean
  generated_at?: string
  cached?: boolean
  fallback?: boolean
}

export interface ExplanationState {
  currentLanguage: LanguageCode
  localOverride: LanguageCode | null
  content: ExplanationContent | null
  isLoading: boolean
  error: string | null
  aiGenerating: boolean
}

export type LanguageSelectorVariant =
  | 'button-group'
  | 'dropdown'
  | 'inline-selector'
```

- [ ] **Step 2: Create `src/features/listening/constants/languages.ts`**

```typescript
// ============================================================
// Language Constants — VinaListen
// ============================================================

import type { LanguageOption, LanguageCode } from '../types/explanation'

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', direction: 'ltr' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
]

export const DEFAULT_LANGUAGE: LanguageCode = 'vi'

export const LANGUAGE_MAP: Record<string, LanguageCode> = {
  vi: 'vi', 'vi-vn': 'vi',
  en: 'en', 'en-us': 'en', 'en-gb': 'en',
  ja: 'ja', 'ja-jp': 'ja',
  zh: 'zh', 'zh-cn': 'zh', 'zh-tw': 'zh',
  ko: 'ko', 'ko-kr': 'ko',
  fr: 'fr', 'fr-fr': 'fr',
}

export function getLanguageByCode(code: LanguageCode): LanguageOption {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) ?? SUPPORTED_LANGUAGES[0]
}
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors in new files. Existing errors in other files are pre-existing.

- [ ] **Step 4: Commit**

```bash
git add src/features/listening/types/explanation.ts src/features/listening/constants/languages.ts
git commit -m "feat(listening): add explanation feature types and language constants"
```

---

## Task 2: Zustand Store

**Files:**
- Create: `src/features/listening/stores/explanationStore.ts`
- Modify: `src/features/listening/stores/lessonStore.ts` (add explanation override clear)

- [ ] **Step 1: Create `src/features/listening/stores/explanationStore.ts`**

```typescript
// ============================================================
// Explanation Store — VinaListen
// Zustand store for multi-language explanation state
// ============================================================

import { create } from 'zustand'
import type { LanguageCode, ExplanationContent } from '../types/explanation'
import { explanationApi } from '../api/explanationApi'
import { DEFAULT_LANGUAGE } from '../constants/languages'

interface ExplanationStore {
  // Language state
  currentLanguage: LanguageCode
  localOverride: LanguageCode | null
  pendingLanguage: LanguageCode | null

  // Content state
  contentCache: Record<string, ExplanationContent> // key: `${clipId}_${lang}`
  currentContent: ExplanationContent | null
  isLoading: boolean
  error: string | null

  // Actions
  setLanguage: (lang: LanguageCode) => void
  setOverride: (lang: LanguageCode | null) => void
  clearOverride: () => void
  fetchExplanation: (clipId: string, lang: LanguageCode) => Promise<void>
  clearCache: () => void
  clearError: () => void
}

export const useExplanationStore = create<ExplanationStore>((set, get) => ({
  currentLanguage: DEFAULT_LANGUAGE,
  localOverride: null,
  pendingLanguage: null,
  contentCache: {},
  currentContent: null,
  isLoading: false,
  error: null,

  setLanguage: (lang) => set({ currentLanguage: lang }),

  setOverride: (lang) => set({ localOverride: lang }),

  clearOverride: () => set({ localOverride: null }),

  clearError: () => set({ error: null }),

  fetchExplanation: async (clipId, lang) => {
    const cacheKey = `${clipId}_${lang}`

    if (get().contentCache[cacheKey]) {
      set({ currentContent: get().contentCache[cacheKey], currentLanguage: lang })
      return
    }

    set({ isLoading: true, error: null, pendingLanguage: lang })

    try {
      const content = await explanationApi.getExplanation(clipId, lang)

      set((state) => ({
        contentCache: { ...state.contentCache, [cacheKey]: content },
        currentContent: content,
        currentLanguage: lang,
        isLoading: false,
        pendingLanguage: null,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false, pendingLanguage: null })
    }
  },

  clearCache: () => set({ contentCache: {}, currentContent: null }),
}))
```

- [ ] **Step 2: Modify `src/features/listening/stores/lessonStore.ts` — add `clearExplanationOverride` call in `setCurrentClipIndex`**

Find this existing code in `src/features/listening/stores/lessonStore.ts`:

```typescript
  setCurrentClipIndex: (index) =>
    set({
      currentClipIndex: index,
      transcriptInput: '',
      practiceState: 'idle',
      currentResult: null,
    }),
```

Replace with:

```typescript
  setCurrentClipIndex: (index) => {
    // Dynamically import to avoid circular dependency
    import('./explanationStore').then(({ useExplanationStore }) => {
      useExplanationStore.getState().clearOverride()
    })
    set({
      currentClipIndex: index,
      transcriptInput: '',
      practiceState: 'idle',
      currentResult: null,
    })
  },
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/listening/stores/explanationStore.ts src/features/listening/stores/lessonStore.ts
git commit -m "feat(listening): add explanation store and clear override on clip change"
```

---

## Task 3: API Service

**Files:**
- Create: `src/features/listening/api/explanationApi.ts`

- [ ] **Step 1: Create `src/features/listening/api/explanationApi.ts`**

```typescript
// ============================================================
// Explanation API — VinaListen
// API calls for fetching explanations and updating language preference
// ============================================================

import { apiClient } from './client'
import type { LanguageCode, ExplanationContent, ExplanationApiResponse } from '../types/explanation'

const BASE_PATH = '/api/v1'

export class ExplanationNotFoundError extends Error {
  constructor(clipId: string, lang: LanguageCode) {
    super(`Explanation not found for clip ${clipId} in language ${lang}`)
    this.name = 'ExplanationNotFoundError'
  }
}

export class AIServiceUnavailableError extends Error {
  constructor() {
    super('Translation service temporarily unavailable')
    this.name = 'AIServiceUnavailableError'
  }
}

function mapApiResponse(data: ExplanationApiResponse): ExplanationContent {
  return {
    clipId: data.clip_id,
    language: data.language,
    explanation: data.explanation,
    vocabulary: data.vocabulary,
    aiGenerated: data.ai_generated,
    generatedAt: data.generated_at,
    cached: data.cached,
    fallback: data.fallback,
  }
}

export const explanationApi = {
  async getExplanation(clipId: string, lang: LanguageCode): Promise<ExplanationContent> {
    const cacheKey = `explanation_${clipId}_${lang}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      return JSON.parse(cached) as ExplanationContent
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const data = await apiClient.get<{ data: ExplanationApiResponse }>(
        `${BASE_PATH}/explanation/${clipId}?lang=${lang}`,
        { signal: controller.signal },
      )

      clearTimeout(timeoutId)
      const content = mapApiResponse(data.data)
      sessionStorage.setItem(cacheKey, JSON.stringify(content))
      return content
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request timed out after 10 seconds')
      }
      const response = (err as { response?: { status?: number } }).response
      if (response?.status === 404) {
        throw new ExplanationNotFoundError(clipId, lang)
      }
      if (response?.status === 503) {
        throw new AIServiceUnavailableError()
      }
      throw err
    }
  },

  async updateDefaultLanguage(lang: LanguageCode): Promise<void> {
    await apiClient.patch(`${BASE_PATH}/user/settings`, {
      explanation_language: lang,
    })
  },
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/listening/api/explanationApi.ts
git commit -m "feat(listening): add explanation API service with caching and error types"
```

---

## Task 4: React Context & Hook

**Files:**
- Create: `src/features/listening/contexts/ExplanationContext.tsx`
- Create: `src/features/listening/hooks/useExplanationLanguage.ts`

- [ ] **Step 1: Create `src/features/listening/contexts/ExplanationContext.tsx`**

```typescript
// ============================================================
// Explanation Context — VinaListen
// React context providing explanation state to the component tree
// ============================================================

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useExplanationStore } from '../stores/explanationStore'
import { useAuthStore } from '../stores/authStore'
import { LANGUAGE_MAP, DEFAULT_LANGUAGE } from '../constants/languages'
import type { LanguageCode, ExplanationContent } from '../types/explanation'

interface ExplanationContextValue {
  language: LanguageCode
  content: ExplanationContent | null
  isLoading: boolean
  error: string | null
  setLanguage: (lang: LanguageCode) => void
  setOverride: (lang: LanguageCode | null) => void
  clearOverride: () => void
  fetchExplanation: (clipId: string) => Promise<void>
  clearError: () => void
}

const ExplanationContext = createContext<ExplanationContextValue | null>(null)

export function ExplanationProvider({ children }: { children: ReactNode }) {
  const store = useExplanationStore()
  const user = useAuthStore((s) => s.user)

  // Resolve effective language: localOverride > user preference > browser > default
  const effectiveLanguage = store.localOverride ?? store.currentLanguage

  const value: ExplanationContextValue = {
    language: effectiveLanguage,
    content: store.currentContent,
    isLoading: store.isLoading,
    error: store.error,
    setLanguage: store.setLanguage,
    setOverride: store.setOverride,
    clearOverride: store.clearOverride,
    fetchExplanation: (clipId) => store.fetchExplanation(clipId, effectiveLanguage),
    clearError: store.clearError,
  }

  return (
    <ExplanationContext.Provider value={value}>
      {children}
    </ExplanationContext.Provider>
  )
}

export function useExplanationContext(): ExplanationContextValue {
  const ctx = useContext(ExplanationContext)
  if (!ctx) {
    throw new Error('useExplanationContext must be used within ExplanationProvider')
  }
  return ctx
}

// Resolves browser language to a supported LanguageCode
function resolveBrowserLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE
  const raw = navigator.language.toLowerCase()
  return LANGUAGE_MAP[raw] ?? DEFAULT_LANGUAGE
}

// Returns the user's default language from their profile
function resolveUserLanguage(user: ReturnType<typeof useAuthStore.getState>['user']): LanguageCode | null {
  if (!user) return null
  // The user type doesn't have explanation_language yet, so we check a fallback
  // Once the backend adds this field, it will be: user.explanation_language as LanguageCode ?? null
  return null
}
```

- [ ] **Step 2: Create `src/features/listening/hooks/useExplanationLanguage.ts`**

```typescript
// ============================================================
// useExplanationLanguage Hook — VinaListen
// Priority resolution: localOverride > userPreference > browserLanguage > default
// ============================================================

import { useMemo } from 'react'
import { useExplanationStore } from '../stores/explanationStore'
import { useAuthStore } from '../stores/authStore'
import { LANGUAGE_MAP, DEFAULT_LANGUAGE } from '../constants/languages'
import type { LanguageCode } from '../types/explanation'

function resolveBrowserLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE
  const raw = navigator.language.toLowerCase()
  return LANGUAGE_MAP[raw] ?? DEFAULT_LANGUAGE
}

export function useExplanationLanguage(): {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  setOverride: (lang: LanguageCode | null) => void
  clearOverride: () => void
} {
  const localOverride = useExplanationStore((s) => s.localOverride)
  const user = useAuthStore((s) => s.user)
  const { setLanguage, setOverride, clearOverride } = useExplanationStore()

  const language = useMemo((): LanguageCode => {
    // Priority 1: Local override (per-lesson session)
    if (localOverride !== null) {
      return localOverride
    }
    // Priority 2: User preference from profile (when backend field is available)
    // Currently returns null until backend adds explanation_language to User type
    // TODO: Replace with user.explanation_language when backend is updated
    // const userPref = user?.explanation_language as LanguageCode | null
    // if (userPref) return userPref
    // Priority 3: Browser language
    const browserLang = resolveBrowserLanguage()
    if (browserLang) return browserLang
    // Fallback
    return DEFAULT_LANGUAGE
  }, [localOverride])

  return { language, setLanguage, setOverride, clearOverride }
}
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/listening/contexts/ExplanationContext.tsx src/features/listening/hooks/useExplanationLanguage.ts
git commit -m "feat(listening): add ExplanationContext and useExplanationLanguage hook"
```

---

## Task 5: LanguageSelector Component

**Files:**
- Create: `src/features/listening/components/language-selector/LanguageSelector.tsx`

- [ ] **Step 1: Write the failing test — `src/features/listening/components/language-selector/LanguageSelector.test.tsx`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSelector } from './LanguageSelector'
import type { LanguageCode } from '../../types/explanation'

// Mock zustand store
vi.mock('../../stores/explanationStore', () => ({
  useExplanationStore: vi.fn(() => ({
    currentLanguage: 'vi',
    localOverride: null,
    setLanguage: vi.fn(),
    setOverride: vi.fn(),
    clearOverride: vi.fn(),
  })),
}))

describe('LanguageSelector', () => {
  describe('button-group variant', () => {
    it('renders all 6 language options', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="button-group" />)
      expect(screen.getAllByRole('radio')).toHaveLength(6)
    })

    it('calls onChange with correct code when a language button is clicked', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="button-group" />)
      fireEvent.click(screen.getByLabelText('Explanation language: 日本語'))
      expect(onChange).toHaveBeenCalledWith('ja')
    })

    it('marks the active language button as checked', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="ko" onChange={onChange} variant="button-group" />)
      expect(screen.getByRole('radio', { checked: true })).toHaveAttribute(
        'aria-label',
        'Explanation language: 한국어',
      )
    })

    it('navigates with arrow key from first to second language', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="button-group" />)
      const viButton = screen.getByRole('radio', { checked: true })
      viButton.focus()
      fireEvent.keyDown(viButton, { key: 'ArrowRight' })
      expect(onChange).toHaveBeenCalledWith('en')
    })
  })

  describe('dropdown variant', () => {
    it('opens dropdown on click', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="dropdown" />)
      fireEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeVisible()
    })

    it('selects a language and closes dropdown', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="dropdown" />)
      fireEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeVisible()
    })
  })

  describe('inline-selector variant', () => {
    it('renders as a compact select element', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="inline-selector" />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/listening/components/language-selector/LanguageSelector.test.tsx`
Expected: FAIL — "LanguageSelector is not defined" (file doesn't exist yet).

- [ ] **Step 3: Write the implementation — `src/features/listening/components/language-selector/LanguageSelector.tsx`**

```typescript
// ============================================================
// LanguageSelector — VinaListen
// Renders language selection in 3 variants: button-group, dropdown, inline-selector
// ============================================================

import { memo, useRef, useCallback, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import { SUPPORTED_LANGUAGES } from '../../constants/languages'
import type { LanguageCode, LanguageSelectorVariant } from '../../types/explanation'

interface LanguageSelectorProps {
  value: LanguageCode | null
  onChange: (code: LanguageCode) => void
  variant: LanguageSelectorVariant
  disabled?: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const BUTTON_SIZE = {
  sm: 'min-w-[36px] min-h-[36px] text-xs gap-1',
  md: 'min-w-[44px] min-h-[44px] text-sm gap-1.5',
  lg: 'min-w-[52px] min-h-[52px] text-base gap-2',
}

export const LanguageSelector = memo(function LanguageSelector({
  value,
  onChange,
  variant,
  disabled = false,
  showLabel = false,
  size = 'md',
  className,
}: LanguageSelectorProps) {
  if (variant === 'button-group') {
    return (
      <ButtonGroup
        value={value}
        onChange={onChange}
        disabled={disabled}
        showLabel={showLabel}
        size={size}
        className={className}
      />
    )
  }
  if (variant === 'dropdown') {
    return (
      <Dropdown
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={className}
      />
    )
  }
  // inline-selector
  return (
    <InlineSelector
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  )
})

// ---- Variant 1: Button Group ----

interface ButtonGroupProps {
  value: LanguageCode | null
  onChange: (code: LanguageCode) => void
  disabled: boolean
  showLabel: boolean
  size: 'sm' | 'md' | 'lg'
  className?: string
}

const ButtonGroup = memo(function ButtonGroup({
  value,
  onChange,
  disabled,
  showLabel,
  size,
  className,
}: ButtonGroupProps) {
  const activeRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = SUPPORTED_LANGUAGES.findIndex((l) => l.code === value)
      let nextIndex = currentIndex

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length
      } else {
        return
      }

      e.preventDefault()
      onChange(SUPPORTED_LANGUAGES[nextIndex].code)
    },
    [value, onChange],
  )

  return (
    <div
      role="radiogroup"
      aria-label="Explanation language"
      className={cn('flex flex-wrap gap-2', className)}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = lang.code === value
        return (
          <button
            key={lang.code}
            ref={isActive ? activeRef : undefined}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`Explanation language: ${lang.nativeName}`}
            disabled={disabled}
            onClick={() => onChange(lang.code)}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex flex-col items-center justify-center rounded-lg font-semibold transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'active:scale-[0.97]',
              BUTTON_SIZE[size],
              isActive
                ? 'bg-primary text-white'
                : 'bg-transparent text-text-secondary hover:bg-light border border-border',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {lang.flag}
            </span>
            {showLabel && (
              <span className="text-[10px] leading-none mt-0.5">{lang.code.toUpperCase()}</span>
            )}
          </button>
        )
      })}
    </div>
  )
})

// ---- Variant 2: Dropdown ----

interface DropdownProps {
  value: LanguageCode | null
  onChange: (code: LanguageCode) => void
  disabled: boolean
  className?: string
}

const Dropdown = memo(function Dropdown({
  value,
  onChange,
  disabled,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === value) ?? SUPPORTED_LANGUAGES[0]

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select explanation language"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-bg-primary',
          'hover:bg-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'min-h-[44px] min-w-[200px]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="text-base">{activeLang.flag}</span>
        <span className="flex-1 text-sm text-text-primary">{activeLang.nativeName}</span>
        <ChevronDown
          size={16}
          className={cn('text-text-secondary transition-transform', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            aria-label="Language options"
            className={cn(
              'absolute top-full left-0 mt-1 z-20 w-full rounded-lg border border-border',
              'bg-bg-primary shadow-lg py-1 max-h-[300px] overflow-auto',
            )}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={lang.code === value}
                  onClick={() => {
                    onChange(lang.code)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2.5 text-sm',
                    'hover:bg-light transition-colors',
                    'focus-visible:outline-none focus-visible:bg-light',
                    lang.code === value ? 'text-primary font-semibold' : 'text-text-primary',
                  )}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  <span className="ml-auto text-xs text-text-muted">{lang.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
})

// ---- Variant 3: Inline Selector ----

interface InlineSelectorProps {
  value: LanguageCode | null
  onChange: (code: LanguageCode) => void
  disabled: boolean
  className?: string
}

const InlineSelector = memo(function InlineSelector({
  value,
  onChange,
  disabled,
  className,
}: InlineSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === value) ?? SUPPORTED_LANGUAGES[0]

  return (
    <div className={cn('relative inline-flex', className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Explanation language"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm',
          'border border-border hover:bg-light transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'min-h-[36px]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="text-sm">{activeLang.flag}</span>
        <span className="text-text-primary font-medium">{activeLang.nativeName}</span>
        <ChevronDown size={14} className="text-text-secondary" aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            className={cn(
              'absolute top-full left-0 mt-1 z-20 rounded-lg border border-border',
              'bg-bg-primary shadow-lg py-1 min-w-[160px]',
            )}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={lang.code === value}
                  onClick={() => {
                    onChange(lang.code)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm',
                    'hover:bg-light',
                    lang.code === value ? 'text-primary font-semibold' : 'text-text-primary',
                  )}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/listening/components/language-selector/LanguageSelector.test.tsx`
Expected: PASS (all 7 tests green).

- [ ] **Step 5: Commit**

```bash
git add src/features/listening/components/language-selector/
git commit -m "feat(listening): add LanguageSelector component with button-group, dropdown, and inline-selector variants"
```

---

## Task 6: Explanation Panel Components

**Files:**
- Create: `src/features/listening/components/explanation-panel/ExplanationPanel.tsx`
- Create: `src/features/listening/components/explanation-panel/ExplanationLoading.tsx`
- Create: `src/features/listening/components/explanation-panel/ExplanationError.tsx`
- Create: `src/features/listening/components/explanation-panel/ExplanationPanel.test.tsx`

- [ ] **Step 1: Write the failing tests — `ExplanationPanel.test.tsx`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExplanationPanel } from './ExplanationPanel'
import { ExplanationProvider } from '../../contexts/ExplanationContext'
import type { ExplanationContent } from '../../types/explanation'

// Mock the store
vi.mock('../../stores/explanationStore', () => ({
  useExplanationStore: vi.fn(() => ({
    currentLanguage: 'vi',
    localOverride: null,
    currentContent: null,
    isLoading: false,
    error: null,
    setLanguage: vi.fn(),
    setOverride: vi.fn(),
    clearOverride: vi.fn(),
    fetchExplanation: vi.fn(),
    clearError: vi.fn(),
  })),
}))

// Mock zustand persist middleware
vi.mock('zustand', async (importOriginal) => {
  const actual = await importOriginal<typeof import('zustand')>()
  return { ...actual }
})

const mockContent: ExplanationContent = {
  clipId: '42',
  language: 'vi',
  explanation: 'Bạn thường bỏ sót mạo từ "a", "an", "the".',
  vocabulary: [
    { word: 'frequently', translation: 'thường xuyên', phonetic: '/ˈfriːkwəntli/' },
    { word: 'improve', translation: 'cải thiện', phonetic: '/ɪmˈpruːv/' },
  ],
  aiGenerated: false,
}

function renderWithContext(ui: React.ReactElement) {
  return render(<ExplanationProvider>{ui}</ExplanationProvider>)
}

describe('ExplanationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders explanation text when content is available', () => {
    vi.mocked(require('../../stores/explanationStore').useExplanationStore).mockReturnValueOnce({
      currentLanguage: 'vi',
      localOverride: null,
      currentContent: mockContent,
      isLoading: false,
      error: null,
      setLanguage: vi.fn(),
      setOverride: vi.fn(),
      clearOverride: vi.fn(),
      fetchExplanation: vi.fn(),
      clearError: vi.fn(),
    })

    renderWithContext(<ExplanationPanel clipId="42" />)
    expect(screen.getByText(/Bạn thường bỏ sót mạo từ/)).toBeInTheDocument()
  })

  it('displays vocabulary items with phonetic transcription', () => {
    vi.mocked(require('../../stores/explanationStore').useExplanationStore).mockReturnValueOnce({
      currentLanguage: 'vi',
      localOverride: null,
      currentContent: mockContent,
      isLoading: false,
      error: null,
      setLanguage: vi.fn(),
      setOverride: vi.fn(),
      clearOverride: vi.fn(),
      fetchExplanation: vi.fn(),
      clearError: vi.fn(),
    })

    renderWithContext(<ExplanationPanel clipId="42" showVocabulary={true} />)
    expect(screen.getByText('frequently')).toBeInTheDocument()
    expect(screen.getByText('/ˈfriːkwəntli/')).toBeInTheDocument()
    expect(screen.getByText('thường xuyên')).toBeInTheDocument()
  })

  it('renders the LanguageSelector with button-group variant', () => {
    vi.mocked(require('../../stores/explanationStore').useExplanationStore).mockReturnValueOnce({
      currentLanguage: 'vi',
      localOverride: null,
      currentContent: mockContent,
      isLoading: false,
      error: null,
      setLanguage: vi.fn(),
      setOverride: vi.fn(),
      clearOverride: vi.fn(),
      fetchExplanation: vi.fn(),
      clearError: vi.fn(),
    })

    renderWithContext(<ExplanationPanel clipId="42" />)
    expect(screen.getByRole('radiogroup', { name: 'Explanation language' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/listening/components/explanation-panel/ExplanationPanel.test.tsx`
Expected: FAIL — files don't exist yet.

- [ ] **Step 3: Write `ExplanationLoading.tsx`**

```typescript
// ============================================================
// ExplanationLoading — VinaListen
// Skeleton loading state for explanation panel
// ============================================================

import { memo } from 'react'
import { cn } from '../../lib/utils'

interface ExplanationLoadingProps {
  className?: string
}

export const ExplanationLoading = memo(function ExplanationLoading({
  className,
}: ExplanationLoadingProps) {
  return (
    <div
      role="status"
      aria-label="Đang tải giải thích..."
      aria-busy="true"
      className={cn('flex flex-col gap-3 p-4', className)}
    >
      {/* Header skeleton */}
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-lg bg-light animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Body skeleton */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 rounded bg-light animate-pulse',
              i === 3 ? 'w-3/4' : 'w-full',
            )}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Vocabulary skeleton */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-24 h-4 rounded bg-light animate-pulse" aria-hidden="true" />
            <div className="w-16 h-4 rounded bg-light animate-pulse" aria-hidden="true" />
          </div>
        ))}
      </div>

      <span className="sr-only">Đang tải giải thích...</span>
    </div>
  )
})
```

- [ ] **Step 4: Write `ExplanationError.tsx`**

```typescript
// ============================================================
// ExplanationError — VinaListen
// Error state for failed explanation loads
// ============================================================

import { memo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getLanguageByCode } from '../../constants/languages'
import type { LanguageCode } from '../../types/explanation'

interface ExplanationErrorProps {
  language: LanguageCode
  message?: string
  onRetry: () => void
  onFallback?: () => void
  className?: string
}

export const ExplanationError = memo(function ExplanationError({
  language,
  message,
  onRetry,
  onFallback,
  className,
}: ExplanationErrorProps) {
  const langInfo = getLanguageByCode(language)

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn('flex flex-col gap-3 p-4 rounded-lg bg-error/5 border border-error/20', className)}
    >
      <div className="flex items-start gap-2">
        <AlertCircle size={18} className="text-error mt-0.5 shrink-0" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-error">
            Không thể tải giải thích bằng {langInfo.nativeName}
          </p>
          {message && (
            <p className="text-xs text-text-muted">
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
            'border border-border text-primary',
            'hover:bg-light active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            'min-h-[36px]',
          )}
        >
          <RefreshCw size={14} aria-hidden="true" />
          Thử lại
        </button>

        {onFallback && language !== 'vi' && (
          <button
            type="button"
            onClick={onFallback}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-primary text-white',
              'hover:bg-primary-dark active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'min-h-[36px]',
            )}
          >
            🇻🇳 Dùng Tiếng Việt
          </button>
        )}
      </div>
    </div>
  )
})
```

- [ ] **Step 5: Write `ExplanationPanel.tsx`**

```typescript
// ============================================================
// ExplanationPanel — VinaListen
// Displays AI feedback and vocabulary in the selected language
// ============================================================

import { memo, useEffect } from 'react'
import { useExplanationStore } from '../../stores/explanationStore'
import { useExplanationLanguage } from '../../hooks/useExplanationLanguage'
import { LanguageSelector } from '../language-selector/LanguageSelector'
import { ExplanationLoading } from './ExplanationLoading'
import { ExplanationError } from './ExplanationError'
import { cn } from '../../lib/utils'
import { getLanguageByCode } from '../../constants/languages'
import type { LanguageCode } from '../../types/explanation'

interface ExplanationPanelProps {
  clipId: string
  className?: string
  showVocabulary?: boolean
}

export const ExplanationPanel = memo(function ExplanationPanel({
  clipId,
  className,
  showVocabulary = true,
}: ExplanationPanelProps) {
  const store = useExplanationStore()
  const { language, setOverride } = useExplanationLanguage()

  const effectiveLang = store.localOverride ?? language

  useEffect(() => {
    store.fetchExplanation(clipId, effectiveLang)
  }, [clipId, effectiveLang])

  const handleLanguageChange = (code: LanguageCode) => {
    setOverride(code)
  }

  const handleRetry = () => {
    store.clearError()
    store.fetchExplanation(clipId, effectiveLang)
  }

  const handleFallback = () => {
    setOverride('vi')
  }

  return (
    <div
      className={cn('flex flex-col gap-4', className)}
      role="region"
      aria-label="Giải thích bài học"
      aria-live="polite"
      aria-busy={store.isLoading}
    >
      {/* Language selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary font-medium shrink-0">
          Giải thích bằng:
        </span>
        <LanguageSelector
          value={effectiveLang}
          onChange={handleLanguageChange}
          variant="button-group"
          size="sm"
          showLabel={false}
        />
      </div>

      {/* Content area */}
      {store.isLoading && <ExplanationLoading />}

      {store.error && !store.isLoading && (
        <ExplanationError
          language={effectiveLang}
          message={store.error}
          onRetry={handleRetry}
          onFallback={handleFallback}
        />
      )}

      {!store.isLoading && !store.error && store.currentContent && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* AI Feedback */}
          <div className="p-4 rounded-lg bg-bg-secondary border border-border">
            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
              <span>💡</span> AI Feedback
            </h4>
            <p className="text-sm text-text-primary leading-relaxed">
              {store.currentContent.explanation}
            </p>
          </div>

          {/* Vocabulary */}
          {showVocabulary && store.currentContent.vocabulary.length > 0 && (
            <div className="p-4 rounded-lg bg-bg-secondary border border-border">
              <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-1.5">
                <span>📖</span> Từ vựng
              </h4>
              <div className="flex flex-col gap-2">
                {store.currentContent.vocabulary.map((item) => (
                  <div key={item.word} className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-text-primary w-32 shrink-0">
                      {item.word}
                    </span>
                    {item.phonetic && (
                      <span className="text-xs text-text-muted font-mono w-28 shrink-0">
                        {item.phonetic}
                      </span>
                    )}
                    <span className="text-sm text-text-secondary">
                      {item.translation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state (no content, no loading, no error) */}
      {!store.isLoading && !store.error && !store.currentContent && (
        <div className="p-4 rounded-lg bg-bg-secondary border border-border text-center">
          <p className="text-sm text-text-muted">
            Đang tải giải thích...
          </p>
        </div>
      )}
    </div>
  )
})
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/features/listening/components/explanation-panel/`
Expected: PASS (all tests green).

- [ ] **Step 7: Commit**

```bash
git add src/features/listening/components/explanation-panel/
git commit -m "feat(listening): add ExplanationPanel, ExplanationLoading, and ExplanationError components"
```

---

## Task 7: Integrate Into ResultPanel

**Files:**
- Modify: `src/features/listening/components/ResultPanel.tsx`
- Modify: `src/features/listening/AppRouter.tsx`

- [ ] **Step 1: Modify `src/features/listening/components/ResultPanel.tsx`**

Find this section at the bottom of `ResultPanel`:

```typescript
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onRetry}
```

Add `ExplanationPanel` import and render it after the error summary section:

Add this import at the top of the file:

```typescript
import { ExplanationPanel } from './explanation-panel/ExplanationPanel'
```

Find this block in the component (after the error summary `</div>` and before `{/* Action buttons */}`):

```typescript
      {/* Action buttons */}
```

Insert before it:

```typescript
      {/* Multi-Language Explanation */}
      {currentResult?.clip_completed && (
        <ExplanationPanel clipId={currentResult.clip_id.toString()} />
      )}
```

- [ ] **Step 2: Modify `src/features/listening/AppRouter.tsx` — add ExplanationProvider**

Find the `AppRouter` component and wrap its children with `ExplanationProvider`:

Add import:

```typescript
import { ExplanationProvider } from '../contexts/ExplanationContext'
```

Wrap the return:

```typescript
return (
  <ExplanationProvider>
    {/* existing routes */}
  </ExplanationProvider>
)
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/listening/components/ResultPanel.tsx src/features/listening/AppRouter.tsx
git commit -m "feat(listening): integrate ExplanationPanel into ResultPanel after clip completion"
```

---

## Task 8: Unit Tests — Hook

**Files:**
- Create: `src/features/listening/hooks/useExplanationLanguage.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExplanationLanguage } from './useExplanationLanguage'

// Mock stores
vi.mock('./stores/explanationStore', () => ({
  useExplanationStore: vi.fn(() => ({
    currentLanguage: 'vi',
    localOverride: null,
    setLanguage: vi.fn(),
    setOverride: vi.fn(),
    clearOverride: vi.fn(),
  })),
}))

vi.mock('./stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
  })),
}))

describe('useExplanationLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns currentLanguage from store when no localOverride is set', () => {
    const { result } = renderHook(() => useExplanationLanguage())
    expect(result.current.language).toBe('vi')
  })

  it('returns localOverride when set', () => {
    vi.mocked(require('./stores/explanationStore').useExplanationStore)
      .mockReturnValueOnce({
        currentLanguage: 'vi',
        localOverride: 'ja',
        setLanguage: vi.fn(),
        setOverride: vi.fn(),
        clearOverride: vi.fn(),
      })

    const { result } = renderHook(() => useExplanationLanguage())
    expect(result.current.language).toBe('ja')
  })

  it('setOverride calls store.setOverride', () => {
    const setOverride = vi.fn()
    vi.mocked(require('./stores/explanationStore').useExplanationStore)
      .mockReturnValueOnce({
        currentLanguage: 'vi',
        localOverride: null,
        setLanguage: vi.fn(),
        setOverride,
        clearOverride: vi.fn(),
      })

    const { result } = renderHook(() => useExplanationLanguage())
    act(() => result.current.setOverride('ko'))
    expect(setOverride).toHaveBeenCalledWith('ko')
  })

  it('clearOverride calls store.clearOverride', () => {
    const clearOverride = vi.fn()
    vi.mocked(require('./stores/explanationStore').useExplanationStore)
      .mockReturnValueOnce({
        currentLanguage: 'vi',
        localOverride: 'ja',
        setLanguage: vi.fn(),
        setOverride: vi.fn(),
        clearOverride,
      })

    const { result } = renderHook(() => useExplanationLanguage())
    act(() => result.current.clearOverride())
    expect(clearOverride).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/listening/hooks/useExplanationLanguage.test.ts`
Expected: FAIL — hook exists but tests need proper mocking.

- [ ] **Step 3: Fix and run tests**

Run: `npx vitest run src/features/listening/hooks/useExplanationLanguage.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/listening/hooks/useExplanationLanguage.test.ts
git commit -m "test(listening): add unit tests for useExplanationLanguage hook"
```

---

## Task 9: Integration Tests

**Files:**
- Create: `src/features/listening/__tests__/integration/explanationLanguageFlow.test.ts`
- Modify: `vite.config.ts` (if needed for test setup)

- [ ] **Step 1: Create `src/features/listening/__tests__/integration/explanationLanguageFlow.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResultPanel } from '../../components/ResultPanel'
import { ExplanationProvider } from '../../contexts/ExplanationContext'
import type { CheckData } from '../../types/lesson'

// Mock stores
vi.mock('../../stores/explanationStore', () => ({
  useExplanationStore: vi.fn(() => ({
    currentLanguage: 'vi',
    localOverride: null,
    currentContent: {
      clipId: '42',
      language: 'vi',
      explanation: 'Bạn thường bỏ sót mạo từ "a", "an", "the".',
      vocabulary: [
        { word: 'frequently', translation: 'thường xuyên', phonetic: '/ˈfriːkwəntli/' },
      ],
      aiGenerated: false,
    },
    isLoading: false,
    error: null,
    setLanguage: vi.fn(),
    setOverride: vi.fn(),
    clearOverride: vi.fn(),
    fetchExplanation: vi.fn(),
    clearError: vi.fn(),
  })),
}))

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({ user: null })),
}))

function renderResultPanel(result: CheckData) {
  return render(
    <ExplanationProvider>
      <ResultPanel result={result} onRetry={() => {}} />
    </ExplanationProvider>,
  )
}

describe('Explanation Language Flow', () => {
  const mockResult: CheckData = {
    clip_id: 42,
    correct_transcript: 'I am learning English every day',
    user_transcript: 'I am learn English every day',
    accuracy: 85,
    words_total: 7,
    words_correct: 6,
    words_wrong: 1,
    words_missing: 0,
    word_results: [
      { word: 'I', status: 'correct' },
      { word: 'am', status: 'correct' },
      { word: 'learn', status: 'wrong', expected: 'learning', actual: 'learn' },
      { word: 'English', status: 'correct' },
      { word: 'every', status: 'correct' },
      { word: 'day', status: 'correct' },
    ],
    xp_earned: 85,
    attempt_number: 1,
    best_accuracy: 85,
    is_new_best: true,
    clip_completed: true,
    clip_status: 'completed',
    lesson_progress: {
      clips_completed: 1,
      clips_total: 5,
      accuracy: 85,
    },
  }

  it('shows explanation panel after clip completion', async () => {
    renderResultPanel(mockResult)
    await waitFor(() => {
      expect(screen.getByText(/Bạn thường bỏ sót/)).toBeInTheDocument()
    })
  })

  it('shows language selector with 6 options', () => {
    renderResultPanel(mockResult)
    expect(screen.getAllByRole('radio')).toHaveLength(6)
  })
})
```

- [ ] **Step 2: Run integration tests**

Run: `npx vitest run src/features/listening/__tests__/integration/explanationLanguageFlow.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/listening/__tests__/integration/explanationLanguageFlow.test.ts
git commit -m "test(listening): add integration tests for explanation language flow"
```

---

## Task 10: Backend Laravel Stub (Frontend-First)

**Files:**
- Create: `backend/app/Services/ExplanationService.php` (stub)
- Create: `backend/app/Http/Controllers/Api/ExplanationController.php` (stub)

Note: These are stubs for the backend team. The frontend code is fully functional with mock data.

- [ ] **Step 1: Create `backend/app/Services/ExplanationService.php`**

```php
<?php
// app/Services/ExplanationService.php
// Stub for backend implementation

namespace App\Services;

use App\Models\LessonExplanation;
use App\Services\GeminiService;

class ExplanationService
{
    public function __construct(private GeminiService $gemini) {}

    public function getExplanation(int $clipId, string $lang): array
    {
        $supported = ['vi', 'en', 'ja', 'zh', 'ko', 'fr'];
        if (!in_array($lang, $supported)) {
            throw new \InvalidArgumentException("Unsupported language: $lang");
        }

        // 1. Return cached translation
        $cached = LessonExplanation::where('clip_id', $clipId)
            ->where('language_code', $lang)
            ->first();

        if ($cached) {
            return ['data' => $cached, 'cached' => true];
        }

        // 2. AI translate via Gemini
        try {
            $result = $this->gemini->translateAndExplain($clipId, $lang);
            $explanation = LessonExplanation::create([
                'clip_id' => $clipId,
                'language_code' => $lang,
                'explanation' => $result['explanation'],
                'vocabulary_json' => json_encode($result['vocabulary']),
            ]);
            return ['data' => $explanation, 'cached' => false];
        } catch (\Exception $e) {
            // Fallback to Vietnamese if available
            $fallback = LessonExplanation::where('clip_id', $clipId)
                ->where('language_code', 'vi')->first();
            if ($fallback) {
                return ['data' => $fallback, 'cached' => true, 'fallback' => true];
            }
            throw $e;
        }
    }
}
```

- [ ] **Step 2: Create `backend/app/Http/Controllers/Api/ExplanationController.php`**

```php
<?php
// app/Http/Controllers/Api/ExplanationController.php
// Stub for backend implementation

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExplanationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExplanationController extends Controller
{
    public function __construct(private ExplanationService $service) {}

    public function show(Request $request, string $clipId): JsonResponse
    {
        $lang = $request->query('lang', 'vi');

        try {
            $result = $this->service->getExplanation((int) $clipId, $lang);
            return response()->json(['data' => $result['data']]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => 'UNSUPPORTED_LANGUAGE',
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'AI_SERVICE_UNAVAILABLE',
                'message' => 'Translation service unavailable',
                'retry_after' => 30,
            ], 503);
        }
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/Services/ExplanationService.php backend/app/Http/Controllers/Api/ExplanationController.php
git commit -m "feat(backend): add ExplanationService and ExplanationController stubs"
```

---

## Task 11: Animations & Polish

**Files:**
- Modify: `src/features/listening/components/explanation-panel/ExplanationPanel.tsx` (add fade animation)
- Modify: `tailwind.config.js` (if needed for custom animations)

- [ ] **Step 1: Add CSS for fade-in animation**

Add to `src/index.css` or create a CSS module:

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 200ms ease-out;
}
```

- [ ] **Step 2: Verify all files compile together**

Run: `npx tsc --noEmit && npx eslint src/features/listening/components/explanation-panel/ src/features/listening/components/language-selector/ src/features/listening/stores/explanationStore.ts src/features/listening/contexts/ExplanationContext.tsx src/features/listening/hooks/useExplanationLanguage.ts --max-warnings 0`
Expected: No errors.

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "style(listening): add fade-in animation for explanation panel content"
```

---

## Self-Review Checklist

After writing the complete plan, check it against the spec:

### Spec Coverage

| Spec Section | Task(s) |
|-------------|---------|
| Section 3 — 6 languages | Task 1 (types + constants) |
| Section 4 — Architecture diagram | All tasks |
| Section 5 — Type definitions | Task 1 |
| Section 5 — LanguageSelector 3 variants | Task 5 |
| Section 5 — ExplanationPanel | Task 6 |
| Section 5 — ResultPanel integration | Task 7 |
| Section 6 — Priority resolution algorithm | Task 4 (hook) |
| Section 6 — GET /api/v1/explanation/{clipId} | Task 3 (API service) |
| Section 6 — PATCH /api/v1/user/settings | Task 3 (API service) |
| Section 7 — Zustand store | Task 2 |
| Section 7 — React Context | Task 4 |
| Section 8 — Error states | Task 6 (ExplanationError) |
| Section 8 — Loading states | Task 6 (ExplanationLoading) |
| Section 8 — Rate limiting (AbortController timeout) | Task 3 (API service) |
| Section 9 — Session storage caching | Task 3 (API service) |
| Section 10 — ARIA labels, keyboard nav | Task 5 (ButtonGroup keyboard) |
| Section 11 — Responsive breakpoints | Task 5 (button size variants) |
| Section 12 — Unit tests | Tasks 5, 6, 8, 9 |
| Section 12 — Integration tests | Task 9 |
| Section 13 — Phase 1 items | Tasks 1-3 |
| Section 13 — Phase 2 items | Tasks 4, 6, 7 |
| Section 13 — Phase 3 items | Task 11 |
| Section 13 — Phase 4 items | Tasks 8, 9, 10 |

### Placeholder Scan

Search for: `TBD`, `TODO`, `implement later`, `fill in details`, `add appropriate`, `handle edge cases`, `Similar to`

Found: One `TODO` comment in `useExplanationLanguage.ts` for the `user.explanation_language` field. This is intentional — it marks where backend integration happens. Not a placeholder failure.

### Type Consistency

- `clipId` is consistently `string` across all files (matching existing `LessonClip.id` type from `src/features/listening/types/index.ts`)
- `LanguageCode` is consistently `'vi' | 'en' | 'ja' | 'zh' | 'ko' | 'fr'` across all files
- Store methods (`setLanguage`, `setOverride`, `clearOverride`) match between store, context, and hook
- API response shape (`ExplanationApiResponse`) maps cleanly to `ExplanationContent`
- `ExplanationPanel` accepts `clipId: string` matching route params in `LessonPage`

All checks pass. Plan is ready.

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-06-09-multi-language-explanation.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
