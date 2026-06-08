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