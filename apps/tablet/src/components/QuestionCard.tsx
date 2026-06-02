import { useState } from 'react';
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  isSubmitted: boolean;
  onSelectAnswer: (answerId: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const CHAPTER_COLORS: Record<number, string> = {
  1: 'bg-blue-500',
  2: 'bg-green-500',
  3: 'bg-yellow-500',
  4: 'bg-orange-500',
  5: 'bg-purple-500',
  6: 'bg-pink-500',
};

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isSubmitted,
  onSelectAnswer,
  onSubmit,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: QuestionCardProps) {
  const [imageError, setImageError] = useState(false);

  const isCorrect = selectedAnswer === question.correctAnswer;
  const chapterColor = CHAPTER_COLORS[question.chapterNumber] || 'bg-gray-500';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-[var(--text-primary)]">
            Câu {questionNumber}/{totalQuestions}
          </span>
          <span className={`${chapterColor} text-white text-xs font-semibold px-2 py-1 rounded-lg`}>
            Chương {question.chapterNumber}
          </span>
          {question.isCritical && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-lg">
              Quan trọng
            </span>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-auto">
        {/* Question Image */}
        {question.image && !imageError && (
          <div className="mb-4 rounded-xl overflow-hidden bg-[var(--bg-tertiary)]">
            <img
              src={question.image}
              alt={`Câu hỏi ${questionNumber}`}
              className="w-full max-h-64 object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Question Text */}
        <div className="mb-6">
          <p className="text-xl font-semibold text-[var(--text-primary)] leading-relaxed">
            {question.text}
          </p>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrectOption = option.id === question.correctAnswer;

            let bgClass = 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]';
            let borderClass = 'border-[var(--border)]';
            let textClass = 'text-[var(--text-primary)]';
            let checkmark = '';

            if (isSubmitted) {
              if (isCorrectOption) {
                bgClass = 'bg-[var(--color-success-light)]';
                borderClass = 'border-[var(--color-success)]';
                checkmark = '✓';
              } else if (isSelected && !isCorrectOption) {
                bgClass = 'bg-[var(--color-error-light)]';
                borderClass = 'border-[var(--color-error)]';
                checkmark = '✗';
              }
            } else if (isSelected) {
              bgClass = 'bg-[var(--color-primary)]/10';
              borderClass = 'border-[var(--color-primary)]';
            }

            return (
              <button
                key={option.id}
                onClick={() => !isSubmitted && onSelectAnswer(option.id)}
                disabled={isSubmitted}
                className={`
                  relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${bgClass} ${borderClass}
                  ${!isSubmitted && isSelected ? 'ring-2 ring-[var(--color-primary)]' : ''}
                  ${!isSubmitted ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {/* Option Letter */}
                <span className={`
                  flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                  ${isSelected && !isSubmitted ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}
                  ${isSubmitted && isCorrectOption ? 'bg-[var(--color-success)] text-white' : ''}
                  ${isSubmitted && isSelected && !isCorrectOption ? 'bg-[var(--color-error)] text-white' : ''}
                `}>
                  {String.fromCharCode(65 + idx)}
                </span>

                {/* Option Text */}
                <span className={`flex-1 font-medium ${textClass}`}>
                  {option.text}
                </span>

                {/* Checkmark for submitted state */}
                {isSubmitted && checkmark && (
                  <span className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${isCorrectOption ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'}
                  `}>
                    {checkmark}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after submit) */}
        {isSubmitted && (
          <div className={`
            p-4 rounded-xl mb-6
            ${isCorrect ? 'bg-[var(--color-success-light)] border border-[var(--color-success)]' : 'bg-[var(--color-warning-light)] border border-[var(--color-warning)]'}
          `}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-bold ${isCorrect ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                {isCorrect ? 'Đúng!' : 'Sai!'}
              </span>
            </div>
            <p className="text-[var(--text-primary)] leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className={`
            flex-1 py-3 px-4 rounded-xl font-semibold transition-colors
            ${isFirst 
              ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed' 
              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border)]'}
          `}
        >
          ← Câu trước
        </button>

        {!isSubmitted ? (
          <button
            onClick={onSubmit}
            disabled={!selectedAnswer}
            className={`
              flex-1 py-3 px-4 rounded-xl font-semibold transition-colors
              ${!selectedAnswer 
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed' 
                : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'}
            `}
          >
            Xác nhận
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={isLast}
            className={`
              flex-1 py-3 px-4 rounded-xl font-semibold transition-colors
              ${isLast 
                ? 'bg-[var(--color-success)] text-white' 
                : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'}
            `}
          >
            {isLast ? 'Xem kết quả' : 'Câu tiếp →'}
          </button>
        )}
      </div>
    </div>
  );
}
