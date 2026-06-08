// ============================================================
// Language Constants — VinaListen
// ============================================================

import type { LanguageOption, LanguageCode } from '../types/explanation'

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', direction: 'ltr' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
]

export const DEFAULT_LANGUAGE: LanguageCode = 'vi'

export const LANGUAGE_MAP: Record<string, LanguageCode> = {
  vi: 'vi', 'vi-vn': 'vi',
  en: 'en', 'en-us': 'en', 'en-gb': 'en',
  ja: 'ja', 'ja-jp': 'ja',
  zh: 'zh', 'zh-cn': 'zh', 'zh-tw': 'zh',
  ko: 'ko', 'ko-kr': 'ko',
  fr: 'fr', 'fr-fr': 'fr',
}

export function getLanguageByCode(code: LanguageCode): LanguageOption {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) ?? SUPPORTED_LANGUAGES[0]
}