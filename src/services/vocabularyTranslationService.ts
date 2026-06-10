// ============================================================
// Vocabulary Translation Service — VinaListen
// Translates WordInfo definitions/examples to target language
// ============================================================

import type { WordInfo, Definition, NamespaceDefinition, Idiom, Pronunciation } from './oxfordDictionaryService'
import type { LanguageCode } from '@/features/listening/types/explanation'
import { SUPPORTED_LANGUAGES } from '@/features/listening/constants/languages'

interface TranslationPrompt {
  word: string
  definitions: string[]
  examples: string[]
  idioms: string[]
}

interface TranslatedWordInfo extends WordInfo {
  translated: boolean
  targetLanguage: LanguageCode
}

// Build translation prompt for Gemini
function buildTranslationPrompt(data: TranslationPrompt, targetLang: LanguageCode): string {
  const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)
  const langName = langInfo?.nativeName || 'Vietnamese'

  return `
You are a professional English dictionary translator. Translate the following dictionary content for "${data.word}" into ${langName}.

Source content (English):
${JSON.stringify({
  definitions: data.definitions,
  examples: data.examples,
  idioms: data.idioms
}, null, 2)}

Output format (JSON only):
{
  "definitions": [
    {
      "namespace": "namespace or null",
      "definitions": [
        {
          "property": "part of speech",
          "label": "usage label",
          "description": "translated definition",
          "examples": ["translated example 1", "translated example 2"],
          "extra_example": ["extra example"]
        }
      ]
    }
  ],
  "idioms": [
    {
      "name": "idiom phrase",
      "summary": { "label": "translated label", "refer": "translated refer" },
      "definitions": [
        { "description": "translated idiom definition", "examples": ["translated example"] }
      ]
    }
  ]
}

Rules:
- Translate ONLY definition.description, definition.examples, definition.extra_example, idiom.name, idiom.summary.label/refer
- Keep property (part of speech) in English
- Keep namespace names in English
- Keep pronunciation/IPA unchanged
- Keep wordform unchanged
- Return natural, dictionary-quality translations
- If no translation needed (target is English), return original
`
}

// Parse translated response
function parseTranslatedResponse(response: string, original: WordInfo): Partial<WordInfo> {
  try {
    const parsed = JSON.parse(response)
    const result: Partial<WordInfo> = {}

    if (parsed.definitions) {
      result.definitions = parsed.definitions.map((ns: any) => ({
        namespace: ns.namespace,
        definitions: ns.definitions.map((d: any) => ({
          property: d.property,
          label: d.label,
          refer: d.refer,
          description: d.description,
          examples: d.examples || [],
          extra_example: d.extra_example || [],
        }))
      }))
    }

    if (parsed.idioms) {
      result.idioms = parsed.idioms.map((i: any) => ({
        name: i.name,
        summary: i.summary,
        definitions: i.definitions?.map((d: any) => ({
          description: d.description,
          examples: d.examples || [],
        })) || [],
      }))
    }

    return result
  } catch (error) {
    console.error('Failed to parse translation response:', error)
    return {}
  }
}

// Translate WordInfo using Gemini
export async function translateWordInfo(
  wordInfo: WordInfo,
  targetLang: LanguageCode,
  geminiApiKey: string
): Promise<WordInfo> {
  if (targetLang === 'en') return wordInfo

  // Extract text to translate
  const definitions: string[] = []
  const examples: string[] = []
  const idioms: string[] = []

  wordInfo.definitions?.forEach(ns => {
    ns.definitions?.forEach(d => {
      if (d.description) definitions.push(d.description)
      d.examples?.forEach(ex => examples.push(ex))
      d.extra_example?.forEach(ex => examples.push(ex))
    })
  })

  wordInfo.idioms?.forEach(i => {
    if (i.name) idioms.push(i.name)
    if (i.summary?.label) idioms.push(i.summary.label)
    if (i.summary?.refer) idioms.push(i.summary.refer)
    i.definitions?.forEach(d => {
      if (d.description) definitions.push(d.description)
      d.examples?.forEach(ex => examples.push(ex))
    })
  })

  const prompt = buildTranslationPrompt({
    word: wordInfo.name,
    definitions,
    examples,
    idioms,
  }, targetLang)

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) throw new Error('Empty translation response')

    const translated = parseTranslatedResponse(text, wordInfo)

    return {
      ...wordInfo,
      definitions: translated.definitions ?? wordInfo.definitions,
      idioms: translated.idioms ?? wordInfo.idioms,
      translated: true,
      targetLanguage: targetLang,
    }
  } catch (error) {
    console.error('Translation failed:', error)
    return wordInfo // Fallback to original
  }
}

// Batch translate multiple words (for flashcards)
export async function translateMultipleWords(
  words: WordInfo[],
  targetLang: LanguageCode,
  geminiApiKey: string
): Promise<WordInfo[]> {
  if (targetLang === 'en') return words

  const results: WordInfo[] = []
  for (const word of words) {
    const translated = await translateWordInfo(word, targetLang, geminiApiKey)
    results.push(translated)
  }
  return results
}