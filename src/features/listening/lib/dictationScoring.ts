// ============================================================
// DictationScoring — VinaListen
// Client-side mirror of backend DictationScoringService. Used by
// BbcDictationEmptyState and any other client-side dictation flow
// that does not post to the backend (e.g. when the user supplies
// their own transcript for a BBC lesson, or for a DailyDictation
// offline practice session).
//
// Compliance: .cursor/rules/bbc-feature.mdc
// This module never reaches out to BBC. It is a pure string
// comparison utility.
// ============================================================

export interface DictationScore {
  correct: string[]
  wrong: string[]
  missing: string[]
  accuracy: number
  totalWords: number
  correctCount: number
  wrongCount: number
  missingCount: number
}

const SKIP_WORDS = new Set([
  'um', 'uh', 'er', 'eh',
  'yeah', 'ok', 'okay',
  'mm', 'mmm', 'hmm',
])

function normalize(text: string): string[] {
  const lowered = text.toLowerCase()
  // Normalize all apostrophe variants to ASCII
  const apostrophes = lowered.replace(/[\u2018\u2019\u201B\u02BC]/g, "'")
  const tokens = apostrophes.split(/\s+/).filter(Boolean)
  const out: string[] = []
  for (const raw of tokens) {
    let word = raw
    const hasApostrophe = word.includes("'")
    // Strip leading non-letter, non-digit, non-apostrophe
    word = word.replace(/^[^\p{L}\p{N}']+/gu, '')
    if (hasApostrophe && word.endsWith("'")) {
      word = word.replace(/[^\p{L}\p{N}]+$/gu, '') + "'"
    } else {
      word = word.replace(/[^\p{L}\p{N}']+$/gu, '')
    }
    if (word === '' || word === "'") {
      continue
    }
    if (SKIP_WORDS.has(word)) {
      continue
    }
    out.push(word)
  }
  return out
}

function buildMultiset(words: string[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const w of words) {
    m.set(w, (m.get(w) ?? 0) + 1)
  }
  return m
}

export const DictationScoring = {
  scoreSegment(reference: string, userInput: string): DictationScore {
    const refWords = normalize(reference)
    const userWords = normalize(userInput)
    const totalWords = refWords.length

    if (totalWords === 0) {
      return {
        correct: [],
        wrong: [],
        missing: [],
        accuracy: 100,
        totalWords: 0,
        correctCount: 0,
        wrongCount: 0,
        missingCount: 0,
      }
    }

    const refMultiset = buildMultiset(refWords)
    const userMultiset = buildMultiset(userWords)
    const correct: string[] = []
    const wrong: string[] = []
    const missing: string[] = []

    for (const [word, refCount] of refMultiset.entries()) {
      const userCount = userMultiset.get(word) ?? 0
      const matched = Math.min(refCount, userCount)
      for (let i = 0; i < matched; i++) {
        correct.push(word)
      }
      for (let i = 0; i < refCount - matched; i++) {
        missing.push(word)
      }
      const extra = userCount - matched
      for (let i = 0; i < extra; i++) {
        wrong.push(word)
      }
    }

    for (const [word, userCount] of userMultiset.entries()) {
      if (!refMultiset.has(word)) {
        for (let i = 0; i < userCount; i++) {
          wrong.push(word)
        }
      }
    }

    const correctCount = correct.length
    const accuracy = Math.round((correctCount / totalWords) * 1000) / 10

    return {
      correct,
      wrong,
      missing,
      accuracy,
      totalWords,
      correctCount,
      wrongCount: wrong.length,
      missingCount: missing.length,
    }
  },
}
