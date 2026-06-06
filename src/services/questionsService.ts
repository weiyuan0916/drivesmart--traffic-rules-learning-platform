import type { Question, QuestionOption, RawQuestion } from '../types';

let cachedRaw: RawQuestion[] | null = null;
let cachedQuestions: Question[] | null = null;

const LOCAL_QUESTION_IMAGES = import.meta.glob('../../images/cau_*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function indexToOptionId(idx: number): string {
  const base = 'A'.charCodeAt(0);
  return String.fromCharCode(base + idx);
}

// Convert "phương án 1/2/3/4" to "phương án A/B/C/D" in explanations
function normalizeExplanation(explanation: string): string {
  return explanation
    .replace(/\bphương án\s*1\b/gi, 'phương án A')
    .replace(/\bphương án\s*2\b/gi, 'phương án B')
    .replace(/\bphương án\s*3\b/gi, 'phương án C')
    .replace(/\bphương án\s*4\b/gi, 'phương án D');
}

export function chapterNumberFromQuestionId(id: number): number | null {
  if (id >= 1 && id <= 180) return 1;
  if (id >= 181 && id <= 205) return 2;
  if (id >= 206 && id <= 263) return 3;
  if (id >= 264 && id <= 300) return 4;
  if (id >= 301 && id <= 485) return 5;
  if (id >= 486 && id <= 600) return 6;
  return null;
}

function questionIdToLocalImageUrl(id: number): string | null {
  const three = String(id).padStart(3, '0');
  const candidates = [
    `../../images/cau_${three}.jpg`,
    `../../images/cau_${three}.jpeg`,
    `../../images/cau_${three}.png`,
    `../../images/cau_${three}.webp`,
  ];

  for (const key of candidates) {
    const url = LOCAL_QUESTION_IMAGES[key];
    if (typeof url === 'string' && url.length > 0) return url;
  }

  return null;
}

function mapRawToQuestion(raw: RawQuestion): Question | null {
  if (!raw || typeof raw.id !== 'number') return null;
  if (typeof raw.question !== 'string' || !raw.question.trim()) return null;
  if (!Array.isArray(raw.options) || raw.options.length < 2) return null;
  if (typeof raw.answer !== 'number') return null;
  if (raw.answer < 0 || raw.answer >= raw.options.length) return null;
  if (typeof raw.chapter !== 'string' || !raw.chapter.trim()) return null;
  const expectedChapter = chapterNumberFromQuestionId(raw.id);
  const chapterNumber =
    typeof raw.chapterNumber === 'number' && Number.isInteger(raw.chapterNumber)
      ? raw.chapterNumber
      : expectedChapter;
  if (chapterNumber === null || chapterNumber < 1 || chapterNumber > 6) return null;
  if (expectedChapter !== null && chapterNumber !== expectedChapter) return null;
  if (typeof raw.explanation !== 'string') return null;

  const options: QuestionOption[] = raw.options.map((text, idx) => ({
    id: indexToOptionId(idx),
    text: String(text),
  }));

  const correctAnswer = options[raw.answer]?.id;
  if (!correctAnswer) return null;

  const localImage = questionIdToLocalImageUrl(raw.id);
  const image = localImage ?? raw.image ?? null;

  return {
    id: raw.id,
    chapterNumber,
    chapter: raw.chapter,
    isCritical: Boolean(raw.isCritical),
    text: raw.question,
    image,
    options,
    correctAnswer,
    explanation: normalizeExplanation(raw.explanation),
  };
}

export async function loadRawQuestions(): Promise<RawQuestion[]> {
  if (cachedRaw) return cachedRaw;
  const url = new URL('../../bo-600-cau-hoi.json', import.meta.url).toString();
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load questions json: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error('Invalid questions json: root is not an array');
  }
  cachedRaw = data as RawQuestion[];
  return cachedRaw;
}

export async function loadExamQuestions(): Promise<Question[]> {
  if (cachedQuestions) return cachedQuestions;
  const raws = await loadRawQuestions();
  const mapped = raws.map(mapRawToQuestion).filter((q): q is Question => q !== null);
  cachedQuestions = mapped;
  return mapped;
}

