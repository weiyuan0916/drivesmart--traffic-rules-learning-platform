// Dictation comparison service
import type { DictationResult, WordResult, WordStatus } from '@/types/listening';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text).split(' ').filter(Boolean);
}

function longestCommonSubsequence(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

function alignWithLCS(
  expected: string[],
  userInput: string[],
): WordResult[] {
  const dp = longestCommonSubsequence(expected, userInput);
  const results: WordResult[] = [];

  let i = expected.length;
  let j = userInput.length;
  const aligned: Array<{ expIdx: number; userIdx: number } | null> = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && expected[i - 1] === userInput[j - 1]) {
      aligned.unshift({ expIdx: i - 1, userIdx: j - 1 });
      i--;
      j--;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      aligned.unshift({ expIdx: i - 1, userIdx: -1 });
      i--;
    } else {
      aligned.unshift({ expIdx: -1, userIdx: j - 1 });
      j--;
    }
  }

  let userPos = 0;
  for (const item of aligned) {
    if (item === null) continue;

    if (item.expIdx !== -1 && item.userIdx !== -1) {
      results.push({ word: expected[item.expIdx], status: 'correct', index: item.expIdx });
    } else if (item.expIdx !== -1) {
      results.push({ word: expected[item.expIdx], status: 'missing', index: item.expIdx });
    } else if (item.userIdx !== -1) {
      results.push({ word: userInput[item.userIdx], status: 'extra', index: -1 });
    }
  }

  return results;
}

function markWrongPositions(results: WordResult[], expected: string[]): WordResult[] {
  let expIdx = 0;
  let resultIdx = 0;

  while (resultIdx < results.length && expIdx < expected.length) {
    const r = results[resultIdx];

    if (r.status === 'correct') {
      resultIdx++;
      expIdx++;
    } else if (r.status === 'missing') {
      expIdx++;
    } else if (r.status === 'extra') {
      resultIdx++;
    } else if (r.status === 'wrong') {
      const correctWord = expected[expIdx];
      const userWord = r.word;

      const cleanCorrect = normalizeText(correctWord);
      const cleanUser = normalizeText(userWord);

      if (cleanCorrect === cleanUser) {
        results[resultIdx] = { ...r, status: 'correct' };
      } else {
        const distance = levenshteinDistance(cleanCorrect, cleanUser);
        if (distance <= Math.max(cleanCorrect.length, cleanUser.length) * 0.3) {
          results[resultIdx] = { ...r, status: 'wrong' };
        } else {
          results[resultIdx] = { ...r, status: 'wrong' };
        }
      }
      resultIdx++;
      expIdx++;
    }
  }

  return results;
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function splitIntoWords(text: string): string[] {
  return text
    .replace(/[^a-zA-Z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

export function checkDictation(
  transcript: string,
  userInput: string,
): DictationResult {
  const expectedWords = splitIntoWords(transcript);
  const userWords = splitIntoWords(userInput);

  if (expectedWords.length === 0) {
    return {
      accuracy: 0,
      correctWords: 0,
      wrongWords: 0,
      missingWords: 0,
      extraWords: 0,
      completionRate: 0,
      wordResults: [],
    };
  }

  const rawResults = alignWithLCS(expectedWords, userWords);

  const results: WordResult[] = [];
  let ei = 0;
  let ui = 0;

  while (ei < expectedWords.length || ui < userWords.length) {
    const expWord = ei < expectedWords.length ? expectedWords[ei] : null;
    const userWord = ui < userWords.length ? userWords[ui] : null;

    if (expWord === null) {
      results.push({ word: userWord!, status: 'extra', index: -1 });
      ui++;
      continue;
    }
    if (userWord === null) {
      results.push({ word: expWord, status: 'missing', index: ei });
      ei++;
      continue;
    }

    if (expWord.toLowerCase() === userWord.toLowerCase()) {
      results.push({ word: userWord, status: 'correct', index: ei });
    } else {
      results.push({ word: userWord, status: 'wrong', index: ei });
    }
    ei++;
    ui++;
  }

  const correctWords = results.filter((r) => r.status === 'correct').length;
  const wrongWords = results.filter((r) => r.status === 'wrong').length;
  const missingWords = results.filter((r) => r.status === 'missing').length;
  const extraWords = results.filter((r) => r.status === 'extra').length;

  const totalWords = expectedWords.length;
  const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;
  const completionRate =
    totalWords > 0
      ? Math.round(((correctWords + wrongWords) / totalWords) * 100)
      : 0;

  return {
    accuracy,
    correctWords,
    wrongWords,
    missingWords,
    extraWords,
    completionRate,
    wordResults: results,
  };
}

export function getWordStatusColor(status: WordStatus): string {
  switch (status) {
    case 'correct':
      return 'var(--listening-success, #00BE7C)';
    case 'wrong':
      return 'var(--listening-error, #FF3257)';
    case 'missing':
      return 'var(--listening-accent, #FF5632)';
    case 'extra':
      return '#FF9800';
    default:
      return 'var(--text-primary)';
  }
}
