// ============================================================
// Explanation API — VinaListen
// API calls for fetching explanations and updating language preference
// Includes local fallback when backend is unavailable
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

// Local fallback content translations — shown when backend is unavailable
const LOCAL_EXPLANATIONS: Record<LanguageCode, string> = {
  vi: 'Giải thích đang được tải. Vui lòng đợi trong giây lát.',
  en: 'Loading explanation... Please wait a moment.',
  ja: '解説を読み込み中입니다。しばらくお待ちください。',
  zh: '正在加载解释。请稍候。',
  ko: '해설을 로딩 중입니다. 잠시만 기다려 주세요.',
  fr: 'Chargement de l\'explication... Veuillez patienter.',
}

const LOCAL_VOCABULARY: Record<LanguageCode, VocabularyItem[]> = {
  vi: [
    { word: 'frequently', translation: 'thường xuyên', phonetic: '/ˈfriːkwəntli/' },
    { word: 'improve', translation: 'cải thiện', phonetic: '/ɪmˈpruːv/' },
    { word: 'essential', translation: 'thiết yếu', phonetic: '/ɪˈsenʃl/' },
  ],
  en: [
    { word: 'frequently', translation: 'often, regularly', phonetic: '/ˈfriːkwəntli/' },
    { word: 'improve', translation: 'to make better', phonetic: '/ɪmˈpruːv/' },
    { word: 'essential', translation: 'absolutely necessary', phonetic: '/ɪˈsenʃl/' },
  ],
  ja: [
    { word: 'frequently', translation: '頻繁に', phonetic: '/ˈfriːkwəntli/' },
    { word: 'improve', translation: '改善する', phonetic: '/ɪmˈpruːv/' },
    { word: 'essential', translation: '必須の', phonetic: '/ɪˈsenʃl/' },
  ],
  zh: [
    { word: 'frequently', translation: '频繁地', phonetic: '/ˈfriːkwəntli/' },
    { word: 'improve', translation: '改善', phonetic: '/ɪmˈpruːv/' },
    { word: 'essential', translation: '必要的', phonetic: '/ɪˈsenʃl/' },
  ],
  ko: [
    { word: 'frequently', translation: '자주', phonetic: '/ˈfriːkwəntli/' },
    { word: 'improve', translation: '개선하다', phonetic: '/ɪmˈpruːv/' },
    { word: 'essential', translation: '필수적인', phonetic: '/ɪˈsenʃl/' },
  ],
  fr: [
    { word: 'frequently', translation: 'fréquemment', phonetic: '/ˈfriːkwəntli/' },
    { word: 'improve', translation: 'améliorer', phonetic: '/ɪmˈpruːv/' },
    { word: 'essential', translation: 'essentiel', phonetic: '/ɪˈsenʃl/' },
  ],
}

type VocabularyItem = { word: string; translation: string; phonetic?: string; partOfSpeech?: string; exampleSentence?: string }

function createFallbackContent(clipId: string, lang: LanguageCode): ExplanationContent {
  return {
    clipId,
    language: lang,
    explanation: LOCAL_EXPLANATIONS[lang],
    vocabulary: LOCAL_VOCABULARY[lang],
    aiGenerated: false,
    generatedAt: new Date().toISOString(),
    cached: false,
    fallback: true,
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
        const fallback = createFallbackContent(clipId, lang)
        sessionStorage.setItem(cacheKey, JSON.stringify(fallback))
        return fallback
      }
      const response = (err as { response?: { status?: number } }).response
      if (response?.status === 503) {
        const fallback = createFallbackContent(clipId, lang)
        sessionStorage.setItem(cacheKey, JSON.stringify(fallback))
        return fallback
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