export interface Question {
  id: number;
  text: string;
  image: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation: string;
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
