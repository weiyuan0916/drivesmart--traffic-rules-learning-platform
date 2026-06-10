// ============================================================
// Explanation Store — VinaListen
// Zustand store for multi-language explanation state
// ============================================================

import { create } from 'zustand'
import type { LanguageCode, ExplanationContent } from '../types/explanation'
import { explanationApi } from '../api/explanationApi'
import { DEFAULT_LANGUAGE } from '../constants/languages'

interface ExplanationStore {
  currentLanguage: LanguageCode
  localOverride: LanguageCode | null

  contentCache: Record<string, ExplanationContent> // key: `${clipId}_${lang}`
  currentContent: ExplanationContent | null
  isLoading: boolean
  error: string | null

  /** Sets the global default language (persisted to user profile). */
  setLanguage: (lang: LanguageCode) => void
  /** Sets a per-session language override for the current lesson (cleared on lesson change). */
  setOverride: (lang: LanguageCode | null) => void
  /** Clears the per-session language override. */
  clearOverride: () => void
  /** Fetches explanation for a clip in the given language. Uses cache, sets loading/error state. */
  fetchExplanation: (clipId: string, lang: LanguageCode) => Promise<void>
  /** Clears the content cache and current content. */
  clearCache: () => void
  /** Clears any error state. */
  clearError: () => void
}

export const useExplanationStore = create<ExplanationStore>((set, get) => ({
  currentLanguage: DEFAULT_LANGUAGE,
  localOverride: null,
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

    set({ currentContent: null, isLoading: true, error: null })

    try {
      const content = await explanationApi.getExplanation(clipId, lang)

      set((state) => ({
        contentCache: { ...state.contentCache, [cacheKey]: content },
        currentContent: content,
        currentLanguage: lang,
        isLoading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },

  clearCache: () => set({ contentCache: {}, currentContent: null }),
}))
