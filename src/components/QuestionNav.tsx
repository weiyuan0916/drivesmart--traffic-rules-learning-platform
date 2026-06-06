import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    skipSnaps: false,
    containScroll: 'trimSnaps',
    dragFree: true,
    slidesToScroll: 5,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const totalQuestions = questions.length;

  const getStatus = (num: number): 'current' | 'correct' | 'wrong' | 'unanswered' => {
    const idx = num - 1;
    const a = confirmedAnswers[idx];
    const q = questions[idx];
    const isAnswered = a !== null && a !== undefined;

    if (num === currentQuestionNumber) return 'current';
    if (!isAnswered) return 'unanswered';
    if (q && a === q.correctAnswer) return 'correct';
    return 'wrong';
  };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const selected = emblaApi.selectedScrollSnap();
    setSelectedIndex(selected);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const answeredCount = confirmedAnswers.filter((a) => a !== null).length;
  const correctCount = confirmedAnswers.filter((a, idx) => {
    const q = questions[idx];
    return a !== null && q && a === q.correctAnswer;
  }).length;
  const wrongCount = answeredCount - correctCount;

  const getBgClass = (status: string, isSelected: boolean) => {
    if (isSelected) return 'bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-1';
    if (status === 'current') return 'bg-blue-500 text-white';
    if (status === 'correct') return 'bg-emerald-500 text-white';
    if (status === 'wrong') return 'bg-rose-500 text-white';
    return 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]';
  };

  return (
    <div className="w-full px-2 py-3">
      {/* Stats bar */}
      <div className="flex justify-center gap-4 mb-3 text-xs">
        <span className="text-emerald-500">✓ {correctCount}</span>
        <span className="text-rose-500">✗ {wrongCount}</span>
        <span className="text-[var(--text-muted)]">○ {totalQuestions - answeredCount}</span>
      </div>

      {/* Horizontal carousel */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center gap-1.5 py-2 pl-6 pr-6 select-none touch-pan-y">
            {questions.map((_, idx) => {
              const num = idx + 1;
              const status = getStatus(num);
              const isSelected = num === currentQuestionNumber;
              const isLast = idx === questions.length - 1;
              
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onNavigate(num)}
                  className={`
                    shrink-0 rounded-full flex items-center justify-center 
                    font-bold leading-none transition-all duration-200
                    size-[32px] text-xs
                    ${isLast ? 'mr-6' : ''}
                    ${getBgClass(status, isSelected)}
                    ${isSelected ? 'scale-110' : 'hover:scale-105 active:scale-95'}
                  `}
                  title={`Câu ${num}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gradient fade indicators */}
        <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[var(--bg-secondary)]/90 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[var(--bg-secondary)]/90 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default QuestionNav;
