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

// Theo Dự thảo Công văn 2333/C08-P5 (5/2026)
export type LicenseType = 'A1' | 'A' | 'B1' | 'B' | 'C1' | 'C' | 'D1' | 'D2' | 'D' | 'BE' | 'C1E' | 'CE' | 'D1E' | 'D2E' | 'DE';

export interface ExamConfig {
  totalQuestions: number;
  timeMinutes: number;
  passingScore: number;
  // Chapter distribution (proportional to 600 questions)
  chapterTargets: Record<string, number>;
}

export const EXAM_CONFIGS: Record<LicenseType, ExamConfig> = {
  // Mô tô - 50 câu (tổng = 50)
  'A1': { totalQuestions: 50, timeMinutes: 25, passingScore: 45, chapterTargets: { [CHAPTER_I]: 15, [CHAPTER_II]: 2, [CHAPTER_III]: 2, [CHAPTER_IV]: 1, [CHAPTER_V]: 15, [CHAPTER_VI]: 15 } },
  'A': { totalQuestions: 50, timeMinutes: 25, passingScore: 45, chapterTargets: { [CHAPTER_I]: 15, [CHAPTER_II]: 2, [CHAPTER_III]: 2, [CHAPTER_IV]: 1, [CHAPTER_V]: 15, [CHAPTER_VI]: 15 } },
  
  // Ô tô - 60 câu (tổng = 60)
  'B1': { totalQuestions: 60, timeMinutes: 30, passingScore: 54, chapterTargets: { [CHAPTER_I]: 18, [CHAPTER_II]: 2, [CHAPTER_III]: 6, [CHAPTER_IV]: 4, [CHAPTER_V]: 19, [CHAPTER_VI]: 11 } },
  'B': { totalQuestions: 60, timeMinutes: 30, passingScore: 54, chapterTargets: { [CHAPTER_I]: 18, [CHAPTER_II]: 2, [CHAPTER_III]: 6, [CHAPTER_IV]: 4, [CHAPTER_V]: 19, [CHAPTER_VI]: 11 } },
  
  // Ô tô C1 - 70 câu (tổng = 70)
  'C1': { totalQuestions: 70, timeMinutes: 35, passingScore: 63, chapterTargets: { [CHAPTER_I]: 21, [CHAPTER_II]: 3, [CHAPTER_III]: 7, [CHAPTER_IV]: 4, [CHAPTER_V]: 22, [CHAPTER_VI]: 13 } },
  
  // Ô tô C - 80 câu (tổng = 80)
  'C': { totalQuestions: 80, timeMinutes: 40, passingScore: 72, chapterTargets: { [CHAPTER_I]: 24, [CHAPTER_II]: 3, [CHAPTER_III]: 8, [CHAPTER_IV]: 5, [CHAPTER_V]: 25, [CHAPTER_VI]: 15 } },
  
  // Ô tô D1, D2, D - 90 câu (tổng = 90)
  'D1': { totalQuestions: 90, timeMinutes: 45, passingScore: 81, chapterTargets: { [CHAPTER_I]: 27, [CHAPTER_II]: 4, [CHAPTER_III]: 9, [CHAPTER_IV]: 5, [CHAPTER_V]: 28, [CHAPTER_VI]: 17 } },
  'D2': { totalQuestions: 90, timeMinutes: 45, passingScore: 81, chapterTargets: { [CHAPTER_I]: 27, [CHAPTER_II]: 4, [CHAPTER_III]: 9, [CHAPTER_IV]: 5, [CHAPTER_V]: 28, [CHAPTER_VI]: 17 } },
  'D': { totalQuestions: 90, timeMinutes: 45, passingScore: 81, chapterTargets: { [CHAPTER_I]: 27, [CHAPTER_II]: 4, [CHAPTER_III]: 9, [CHAPTER_IV]: 5, [CHAPTER_V]: 28, [CHAPTER_VI]: 17 } },
  
  // Ô tô có kéo rơ moóc - 100 câu (tổng = 100)
  'BE': { totalQuestions: 100, timeMinutes: 50, passingScore: 90, chapterTargets: { [CHAPTER_I]: 30, [CHAPTER_II]: 4, [CHAPTER_III]: 10, [CHAPTER_IV]: 6, [CHAPTER_V]: 31, [CHAPTER_VI]: 19 } },
  'C1E': { totalQuestions: 100, timeMinutes: 50, passingScore: 90, chapterTargets: { [CHAPTER_I]: 30, [CHAPTER_II]: 4, [CHAPTER_III]: 10, [CHAPTER_IV]: 6, [CHAPTER_V]: 31, [CHAPTER_VI]: 19 } },
  'CE': { totalQuestions: 100, timeMinutes: 50, passingScore: 90, chapterTargets: { [CHAPTER_I]: 30, [CHAPTER_II]: 4, [CHAPTER_III]: 10, [CHAPTER_IV]: 6, [CHAPTER_V]: 31, [CHAPTER_VI]: 19 } },
  'D1E': { totalQuestions: 100, timeMinutes: 50, passingScore: 90, chapterTargets: { [CHAPTER_I]: 30, [CHAPTER_II]: 4, [CHAPTER_III]: 10, [CHAPTER_IV]: 6, [CHAPTER_V]: 31, [CHAPTER_VI]: 19 } },
  'D2E': { totalQuestions: 100, timeMinutes: 50, passingScore: 90, chapterTargets: { [CHAPTER_I]: 30, [CHAPTER_II]: 4, [CHAPTER_III]: 10, [CHAPTER_IV]: 6, [CHAPTER_V]: 31, [CHAPTER_VI]: 19 } },
  'DE': { totalQuestions: 100, timeMinutes: 50, passingScore: 90, chapterTargets: { [CHAPTER_I]: 30, [CHAPTER_II]: 4, [CHAPTER_III]: 10, [CHAPTER_IV]: 6, [CHAPTER_V]: 31, [CHAPTER_VI]: 19 } },
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

export function generateExamQuestions(
  allQuestions: Question[], 
  licenseType: LicenseType,
  seedInput?: string
): Question[] {
  const config = EXAM_CONFIGS[licenseType];
  const total = config.totalQuestions;
  const seed = seedInput ? hashToUint32(seedInput) : Date.now() >>> 0;
  const rng = mulberry32(seed);

  const selected: Question[] = [];
  const selectedIds = new Set<number>();

  const chapters = [CHAPTER_I, CHAPTER_II, CHAPTER_III, CHAPTER_IV, CHAPTER_V, CHAPTER_VI];
  for (const chapter of chapters) {
    const pool = allQuestions.filter((q) => q.chapter === chapter && !selectedIds.has(q.id));
    shuffleInPlace(pool, rng);
    const take = Math.min(config.chapterTargets[chapter] ?? 0, pool.length);
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
    throw new Error(`Not enough questions. Selected=${selected.length} Total=${total}`);
  }

  return selected;
}

// Keep old function for backward compatibility
export function generateB1ExamQuestions(allQuestions: Question[], seedInput?: string): Question[] {
  return generateExamQuestions(allQuestions, 'B1', seedInput);
}

