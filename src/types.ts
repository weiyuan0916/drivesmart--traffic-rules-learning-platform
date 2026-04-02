export interface RawQuestion {
  id: number;
  question: string;
  image: string | null;
  options: string[];
  answer: number | null;
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
  chapter: string;
  isCritical: boolean;
  text: string;
  image: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
}

export interface ChapterStat {
  chapter: string;
  correct: number;
  total: number;
}

export interface UserStats {
  correct: number;
  incorrect: number;
  current: number;
  unanswered: number;
  lastExercises: {
    name: string;
    score: number;
    category: string;
  }[];
  masteryByArea: {
    area: string;
    percentage: number;
    color: string;
  }[];
}
