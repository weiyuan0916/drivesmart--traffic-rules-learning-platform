import React from 'react';
import { Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Question } from '../types';
import { SmoothScroll } from './SmoothScroll';

interface SidebarProps {
  totalQuestions: number;
  currentQuestionNumber: number;
  questions: Question[];
  confirmedAnswers: (string | null)[];
  onCurrentQuestionNumberChange: (n: number) => void;
  collapsedSidebar: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  totalQuestions,
  currentQuestionNumber,
  questions,
  confirmedAnswers,
  onCurrentQuestionNumberChange,
  collapsedSidebar,
}) => {
  const { t } = useLanguage();

  const safeSelectedIndex =
    totalQuestions > 0 ? Math.min(Math.max(currentQuestionNumber - 1, 0), totalQuestions - 1) : 0;
  const selectedQuestion = questions[safeSelectedIndex];
  const selectedAnswer = confirmedAnswers[safeSelectedIndex];
  const isSelectedAnswered = selectedAnswer !== null && selectedAnswer !== undefined;

  return (
    <SmoothScroll className="flex h-full min-h-0 min-w-0 w-full flex-col gap-6 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-4 pb-28 lg:w-80 lg:pb-6 lg:p-6">
      {/* Content — hidden when sidebar is collapsed */}
      {!collapsedSidebar && (
        <>
          <div className="min-w-0 rounded-2xl bg-[var(--bg-tertiary)] p-3 sm:p-4">
            {/* Question Grid */}
            <div className="grid min-w-0 grid-cols-5 gap-3 sm:grid-cols-6 sm:gap-3">
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const num = i + 1;
                const isCurrent = num === currentQuestionNumber;
                const q = questions[i];
                const a = confirmedAnswers[i];
                const isAnswered = a !== null && a !== undefined;
                const isCorrect = isAnswered && q ? a === q.correctAnswer : false;
                const bgClass = !isAnswered
                  ? 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                  : isCorrect
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white';
                return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onCurrentQuestionNumberChange(num)}
                  className={`mx-auto flex size-[26px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none transition-colors sm:text-xs md:text-sm ${
                    bgClass
                  } ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--bg-tertiary)]' : ''}`}
                  aria-label={`Question ${num}`}
                >
                  {num}
                </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-semibold text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" /> {currentQuestionNumber} {t('current')}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[var(--bg-hover)]" /> {Math.max(0, totalQuestions - confirmedAnswers.filter(Boolean).length)} {t('unanswered')}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500" /> {confirmedAnswers.filter(Boolean).length} answered
              </div>
            </div>
          </div>

          {/* Explanation Section */}
          {isSelectedAnswered ? (
            <div className="bg-[var(--bg-tertiary)] px-4 py-4 rounded-2xl flex-1 mt-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[var(--text-primary)] font-bold text-xs">{t('explanation')}</h3>
                <Eye className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              </div>
              <div className="text-[var(--text-secondary)] text-xs leading-relaxed">
                <p>{selectedQuestion.explanation}</p>
              </div>
            </div>
          ) : null}
        </>
      )}
    </SmoothScroll>
  );
};

export default Sidebar;
