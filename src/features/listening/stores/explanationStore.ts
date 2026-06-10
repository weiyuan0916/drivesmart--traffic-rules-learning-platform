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

    set({ currentContent: null, isLoading: true, error: null, pendingLanguage: lang })

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