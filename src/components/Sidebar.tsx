import React from 'react';
import { Eye } from 'lucide-react';
import { motion } from 'motion/react';
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

const CHAPTER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Khái niệm': { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-400' },
  'Quy tắc': { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-400' },
  'Sa hình': { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-400' },
  'Hệ thống': { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-400' },
  'Văn hóa': { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-400' },
  'Kỹ thuật': { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-400' },
};

const getChapterColor = (chapter: string) => {
  return CHAPTER_COLORS[chapter] || { bg: 'bg-slate-500', text: 'text-white', border: 'border-slate-400' };
};

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

  // Group questions by chapter
  const chapterGroups: Record<string, number[]> = {};
  questions.forEach((q, i) => {
    const ch = q.chapter || 'Khác';
    if (!chapterGroups[ch]) chapterGroups[ch] = [];
    chapterGroups[ch].push(i + 1);
  });

  const chapterList = Object.keys(chapterGroups);

  return (
    <SmoothScroll className="flex h-full min-h-0 min-w-0 w-full flex-col gap-4 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-4 pb-28 lg:w-80 lg:pb-6 lg:p-5">
      {/* Content — hidden when sidebar is collapsed */}
      {!collapsedSidebar && (
        <>
          {/* Progress summary card */}
          <div className="rounded-2xl bg-[var(--bg-tertiary)] p-4 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Tiến độ</span>
              <span className="text-sm font-black text-[var(--text-primary)]">
                {confirmedAnswers.filter(Boolean).length}/{totalQuestions}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-[var(--bg-hover)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                initial={{ width: 0 }}
                animate={{ width: `${(confirmedAnswers.filter(Boolean).length / totalQuestions) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="mt-2.5 flex justify-between text-[10px] text-[var(--text-muted)] font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Đúng
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Sai
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--bg-hover)]" /> Chưa trả
              </span>
            </div>
          </div>

          {/* Question Grid by Chapter */}
          <div className="space-y-3">
            {chapterList.map((chapter) => {
              const nums = chapterGroups[chapter];
              const color = getChapterColor(chapter);
              const answered = nums.filter((n) => confirmedAnswers[n - 1] !== null).length;
              const correct = nums.filter((n) => {
                const q = questions[n - 1];
                const a = confirmedAnswers[n - 1];
                return a !== null && q && a === q.correctAnswer;
              }).length;
              return (
                <div key={chapter} className="rounded-2xl bg-[var(--bg-tertiary)] p-3.5 border border-[var(--border)]">
                  {/* Chapter header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${color.bg}`} />
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[100px]">{chapter}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {correct > 0 && (
                        <span className="text-[10px] font-bold text-emerald-500">{correct}</span>
                      )}
                      <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                        {answered}/{nums.length}
                      </span>
                    </div>
                  </div>
                  {/* Grid of buttons */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {nums.map((num) => {
                      const isCurrent = num === currentQuestionNumber;
                      const q = questions[num - 1];
                      const a = confirmedAnswers[num - 1];
                      const isAnswered = a !== null;
                      const isCorrect = isAnswered && q ? a === q.correctAnswer : false;
                      const qColor = getChapterColor(q?.chapter || 'Khác');
                      const btnBg = !isAnswered
                        ? `${qColor.bg}/15 text-${qColor.bg.replace('bg-', '')}-500 border border-${qColor.bg.replace('bg-', '')}-500/20`
                        : isCorrect
                        ? 'bg-emerald-500 text-white border border-emerald-500'
                        : 'bg-rose-500 text-white border border-rose-500';
                      return (
                        <motion.button
                          key={num}
                          type="button"
                          onClick={() => onCurrentQuestionNumberChange(num)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.92 }}
                          className={`w-full aspect-square rounded-xl text-[11px] font-bold leading-none transition-all flex items-center justify-center ${btnBg} ${
                            isCurrent ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-[var(--bg-tertiary)] shadow-lg' : ''
                          }`}
                          aria-label={`Question ${num}`}
                        >
                          {num}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation Section */}
          {isSelectedAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] px-4 py-4 rounded-2xl border border-[var(--border)]"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <h3 className="text-[var(--text-primary)] font-bold text-sm">{t('explanation')}</h3>
                </div>
                <span className="text-[10px] font-bold text-[var(--text-muted)]">Q{currentQuestionNumber}</span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-4">
                {selectedQuestion.explanation}
              </p>
            </motion.div>
          )}
        </>
      )}
    </SmoothScroll>
  );
};

export default Sidebar;
