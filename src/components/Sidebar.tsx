import React from 'react';
import { Scale, Shield, BookOpen, ChevronRight, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Question } from '../types';
import { SmoothScroll } from './SmoothScroll';

interface SidebarProps {
  totalQuestions: number;
  currentQuestionNumber: number;
  questions: Question[];
  confirmedAnswers: (string | null)[];
  onCurrentQuestionNumberChange: (n: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  totalQuestions,
  currentQuestionNumber,
  questions,
  confirmedAnswers,
  onCurrentQuestionNumberChange,
}) => {
  const { t } = useLanguage();

  const safeSelectedIndex =
    totalQuestions > 0 ? Math.min(Math.max(currentQuestionNumber - 1, 0), totalQuestions - 1) : 0;
  const selectedQuestion = questions[safeSelectedIndex];
  const selectedAnswer = confirmedAnswers[safeSelectedIndex];
  const isSelectedAnswered = selectedAnswer !== null && selectedAnswer !== undefined;

  return (
    <SmoothScroll className="flex h-full min-h-0 min-w-0 w-full flex-col gap-10 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-4 pb-28 lg:w-80 lg:pb-6 lg:p-6">
      {/* Question Grid */}
      <div className="min-w-0 rounded-2xl bg-[var(--bg-tertiary)] p-3 sm:p-4">
        {/* lg 侧栏约 320px：10 列 + 24px 圆 + gap 会挤爆；xl 才用 10 列 */}
        <div className="grid min-w-0 grid-cols-5 gap-x-2 gap-y-2.5 sm:grid-cols-6 sm:gap-2.5 lg:grid-cols-6 xl:grid-cols-10">
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
            <div className="w-3 h-3 rounded-full bg-[var(--bg-hover)]" /> {Math.max(0, totalQuestions - 1)} {t('unanswered')}
          </div>
        </div>
      </div>

      {/* Explanation Section */}
      <div className="bg-[var(--bg-tertiary)] px-6 py-7 rounded-2xl flex-1 mt-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--text-primary)] font-bold text-sm">{t('explanation')}</h3>
          <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>
        {selectedQuestion && isSelectedAnswered ? (
          <div className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed space-y-2">
            <p>{selectedQuestion.explanation}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-1 bg-[var(--bg-hover)] rounded-full w-full opacity-50" />
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="space-y-3 mt-2">
        <button className="w-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors p-4 rounded-2xl flex items-center gap-4 group">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">{t('republicOfSerbia')}</p>
            <p className="text-[var(--text-primary)] font-bold">{t('laws')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
        </button>

        <button className="w-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors p-4 rounded-2xl flex items-center gap-4 group">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">{t('republicOfSerbia')}</p>
            <p className="text-[var(--text-primary)] font-bold">{t('regulations')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 transition-transform" />
        </button>

        <button className="w-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors p-4 rounded-2xl flex items-center gap-4 group">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Zajednica Auto škola Srbije</p>
            <p className="text-[var(--text-primary)] font-bold">{t('studyLiterature')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </SmoothScroll>
  );
};

export default Sidebar;
