// ============================================================
// Vocabulary Translation Service — VinaListen
// Translates WordInfo definitions/examples using MyMemory API
// Free, no API key required, CORS-friendly
// ============================================================

import type { WordInfo, NamespaceDefinition, Idiom } from './oxfordDictionaryService'
import type { LanguageCode } from '@/features/listening/types/explanation'

// MyMemory language code mapping
const LANG_MAP: Record<LanguageCode, string> = {
  en: 'en',
  vi: 'vi',
  ja: 'ja',
  zh: 'zh',
  ko: 'ko',
  fr: 'fr',
}

// Cache for translation results (avoids re-translating same text)
const translationCache = new Map<string, string>()

// Translate a single text snippet via MyMemory
async function translateText(text: string, targetLang: LanguageCode): Promise<string> {
  if (targetLang === 'en') return text

  const cacheKey = `${text.toLowerCase().trim()}|${targetLang}`
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!
  }

  const langPair = `${LANG_MAP['en']}|${LANG_MAP[targetLang]}`
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error(`MyMemory error: ${response.status}`)

    const data = await response.json() as {
      responseData?: { translatedText?: string }
      responseStatus?: number
    }

    const translated = data.responseData?.translatedText
    if (!translated || data.responseStatus !== 200) {
      throw new Error('MyMemory returned empty response')
    }

    translationCache.set(cacheKey, translated)
    return translated
  } catch (error) {
    console.warn(`MyMemory translation failed for "${text}":`, error)
    return text // Fallback to original
  }
}

// Translate a full WordInfo object to target language
export async function translateWordInfo(
  wordInfo: WordInfo,
  targetLang: LanguageCode,
): Promise<WordInfo> {
  if (targetLang === 'en') return wordInfo

  // Translate all definition descriptions and examples in parallel
  const translatedDefinitions: NamespaceDefinition[] = await Promise.all(
    (wordInfo.definitions ?? []).map(async (ns): Promise<NamespaceDefinition> => {
      const translatedDefs = await Promise.all(
        ns.definitions.map(async (def) => ({
          ...def,
          description: def.description
            ? await translateText(def.description, targetLang)
            : def.description,
          examples: await Promise.all(
            def.examples.map((ex) => translateText(ex, targetLang))
          ),
          extra_example: await Promise.all(
            def.extra_example.map((ex) => translateText(ex, targetLang))
          ),
        }))
      )
      return { namespace: ns.namespace, definitions: translatedDefs }
    })
  )

  // Translate idioms
  const translatedIdioms: Idiom[] = await Promise.all(
    (wordInfo.idioms ?? []).map(async (idiom): Promise<Idiom> => ({
      ...idiom,
      name: await translateText(idiom.name, targetLang),
      definitions: await Promise.all(
        idiom.definitions.map(async (def) => ({
          ...def,
          description: def.description
            ? await translateText(def.description, targetLang)
            : def.description,
          examples: await Promise.all(
            def.examples.map((ex) => translateText(ex, targetLang))
          ),
        }))
      ),
    }))
  )

  return {
    ...wordInfo,
    definitions: translatedDefinitions,
    idioms: translatedIdioms,
  }
}

// Batch translate multiple WordInfo objects
export async function translateMultipleWords(
  words: WordInfo[],
  targetLang: LanguageCode,
): Promise<WordInfo[]> {
  return Promise.all(words.map((w) => translateWordInfo(w, targetLang)))
}
