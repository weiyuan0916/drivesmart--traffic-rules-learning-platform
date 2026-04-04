import React from 'react';
import type { Question } from '../types';

interface QuestionNavProps {
  questions: Question[];
  currentQuestionNumber: number;
  confirmedAnswers: (string | null)[];
  onNavigate: (num: number) => void;
}

const QuestionNav: React.FC<QuestionNavProps> = ({
  questions,
  currentQuestionNumber,
  confirmedAnswers,
  onNavigate,
}) => {
  const getNumberBadgeClass = (num: number): string => {
    const idx = num - 1;
    const q = questions[idx];
    const a = confirmedAnswers[idx];
    const isAnswered = a !== null && a !== undefined;
    const isCorrect = isAnswered && q ? a === q.correctAnswer : false;

    if (!isAnswered) {
      return num === currentQuestionNumber
        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]';
    }
    if (isCorrect) {
      return num === currentQuestionNumber
        ? 'bg-emerald-500 text-white'
        : 'bg-emerald-500/70 text-white';
    }
    return num === currentQuestionNumber
      ? 'bg-rose-500 text-white'
      : 'bg-rose-500/70 text-white';
  };

  return (
    <div className="w-full px-2 py-2">
      <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
        {questions.map((_, idx) => {
          const num = idx + 1;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onNavigate(num)}
              className={`size-[30px] rounded-full flex items-center justify-center text-xs font-bold leading-none transition-colors ${getNumberBadgeClass(num)}`}
              title={`Câu ${num}`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionNav;
