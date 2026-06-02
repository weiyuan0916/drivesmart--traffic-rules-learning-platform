export interface RawQuestion {
  id: number;
  question: string;
  image: string | null;
  options: string[];
  answer: number | null;
  chapterNumber: number;
  chapter: string;
  isCritical: boolean;
  explanation: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  chapterNumber: number;
  chapter: string;
  isCritical: boolean;
  text: string;
  image: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
}

export interface ChapterStat {
  chapterNumber: number;
  chapter: string;
  correct: number;
  total: number;
}

export interface ExamResult {
  score: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  chapterStats: ChapterStat[];
}
