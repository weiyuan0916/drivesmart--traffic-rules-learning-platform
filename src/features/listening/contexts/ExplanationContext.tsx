// ============================================================
// Explanation Context — VinaListen
// React context providing explanation state to the component tree
// ============================================================

import { createContext, useContext, type ReactNode } from 'react'
import { useExplanationStore } from '../stores/explanationStore'
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