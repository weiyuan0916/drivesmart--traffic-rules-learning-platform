// ============================================================
// useExplanationLanguage Hook — VinaListen
// Priority resolution: localOverride > userPreference > browserLanguage > default
// ============================================================

import { useMemo } from 'react'
import { useExplanationStore } from '../stores/explanationStore'
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