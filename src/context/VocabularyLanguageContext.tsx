import { createContext, useContext, useMemo, useEffect, useState, type ReactNode } from 'react'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_MAP } from '@/features/listening/constants/languages'
import type { LanguageCode } from '@/features/listening/types/explanation'

interface VocabularyLanguageContextValue {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  availableLanguages: typeof SUPPORTED_LANGUAGES
}

const VocabularyLanguageContext = createContext<VocabularyLanguageContextValue | null>(null)

export function VocabularyLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE
    const stored = localStorage.getItem('vocabulary_language') as LanguageCode | null
    if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) return stored

    const raw = navigator.language.toLowerCase()
    return LANGUAGE_MAP[raw] ?? DEFAULT_LANGUAGE
  })

  useEffect(() => {
    localStorage.setItem('vocabulary_language', language)
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
  }), [language])

  return (
    <VocabularyLanguageContext.Provider value={value}>
      {children}
    </VocabularyLanguageContext.Provider>
  )
}

export function useVocabularyLanguage(): VocabularyLanguageContextValue {
  const ctx = useContext(VocabularyLanguageContext)
  if (!ctx) {
    throw new Error('useVocabularyLanguage must be used within VocabularyLanguageProvider')
  }
  return ctx
}