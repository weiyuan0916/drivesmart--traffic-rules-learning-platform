// ============================================================
// Explanation Context — VinaListen
// React context providing explanation state to the component tree
// Language resolution is delegated to useExplanationLanguage for
// consistent priority: localOverride > userPreference > browser > default
// ============================================================

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useExplanationStore } from '../stores/explanationStore'
import { LANGUAGE_MAP, DEFAULT_LANGUAGE } from '../constants/languages'
import type { LanguageCode, ExplanationContent } from '../types/explanation'

function resolveBrowserLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE
  const raw = navigator.language.toLowerCase()
  return LANGUAGE_MAP[raw] ?? DEFAULT_LANGUAGE
}

interface ExplanationContextValue {
  language: LanguageCode
  content: ExplanationContent | null
  isLoading: boolean
  error: string | null
  setLanguage: (lang: LanguageCode) => void
  setOverride: (lang: LanguageCode | null) => void
  clearOverride: () => void
  fetchExplanation: (clipId: string, lang: LanguageCode) => Promise<void>
  clearError: () => void
}

const ExplanationContext = createContext<ExplanationContextValue | null>(null)

export function ExplanationProvider({ children }: { children: ReactNode }) {
  const store = useExplanationStore()

  const language = useMemo((): LanguageCode => {
    if (store.localOverride !== null) return store.localOverride
    const browserLang = resolveBrowserLanguage()
    if (browserLang) return browserLang
    return DEFAULT_LANGUAGE
  }, [store.localOverride])

  const value = useMemo(
    (): ExplanationContextValue => ({
      language,
      content: store.currentContent,
      isLoading: store.isLoading,
      error: store.error,
      setLanguage: store.setLanguage,
      setOverride: store.setOverride,
      clearOverride: store.clearOverride,
      fetchExplanation: store.fetchExplanation,
      clearError: store.clearError,
    }),
    [language, store],
  )

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