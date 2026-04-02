import type { Question } from '../types';

export const CHAPTER_I = 'Chương I. Quy định chung và quy tắc giao thông đường bộ';
export const CHAPTER_II =
  'Chương II. Văn hóa giao thông, đạo đức người lái xe, kỹ năng phòng cháy, chữa cháy và cứu hộ, cứu nạn';
export const CHAPTER_III = 'Chương III. Kỹ thuật lái xe';
export const CHAPTER_IV = 'Chương IV. Cấu tạo và sửa chữa';
export const CHAPTER_V = 'Chương V. Báo hiệu đường bộ';
export const CHAPTER_VI = 'Chương VI. Giải thế sa hình và kỹ năng xử lý tình huống giao thông';

export const EXAM_CHAPTERS_ORDERED: readonly { chapterNumber: number; title: string }[] = [
  { chapterNumber: 1, title: CHAPTER_I },
  { chapterNumber: 2, title: CHAPTER_II },
  { chapterNumber: 3, title: CHAPTER_III },
  { chapterNumber: 4, title: CHAPTER_IV },
  { chapterNumber: 5, title: CHAPTER_V },
  { chapterNumber: 6, title: CHAPTER_VI },
];

const B1_TOTAL_QUESTIONS = 30;

const TARGETS_B1_BY_CHAPTER: Record<string, number> = {
  [CHAPTER_I]: 9,
  [CHAPTER_II]: 1,
  [CHAPTER_III]: 3,
  [CHAPTER_IV]: 2,
  [CHAPTER_V]: 9,
  [CHAPTER_VI]: 6,
};

function hashToUint32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function generateB1ExamQuestions(allQuestions: Question[], seedInput?: string): Question[] {
  const total = B1_TOTAL_QUESTIONS;
  const seed = seedInput ? hashToUint32(seedInput) : Date.now() >>> 0;
  const rng = mulberry32(seed);

  const selected: Question[] = [];
  const selectedIds = new Set<number>();

  const chapters = [CHAPTER_I, CHAPTER_II, CHAPTER_III, CHAPTER_IV, CHAPTER_V, CHAPTER_VI];
  for (const chapter of chapters) {
    const pool = allQuestions.filter((q) => q.chapter === chapter && !selectedIds.has(q.id));
    shuffleInPlace(pool, rng);
    const take = Math.min(TARGETS_B1_BY_CHAPTER[chapter] ?? 0, pool.length);
    for (const q of pool.slice(0, take)) {
      selected.push(q);
      selectedIds.add(q.id);
    }
  }

  if (selected.length < total) {
    const remaining = allQuestions.filter((q) => !selectedIds.has(q.id));
    shuffleInPlace(remaining, rng);
    selected.push(...remaining.slice(0, total - selected.length));
  }

  if (selected.length !== total) {
    throw new Error(`Not enough questions to generate B1 exam. Selected=${selected.length} Total=${total}`);
  }

  return selected;
}

