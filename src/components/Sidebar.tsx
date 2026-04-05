import React, { useMemo } from 'react';
import { Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import type { Question } from '../types';

interface SidebarProps {
  totalQuestions: number;
  currentQuestionNumber: number;
  questions: Question[];
  confirmedAnswers: (string | null)[];
  onCurrentQuestionNumberChange: (n: number) => void;
  collapsedSidebar: boolean;
}

const CHAPTER_COLORS: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  'Khái niệm': { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-400', hex: '#3B82F6' },
  'Quy tắc': { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-400', hex: '#22C55E' },
  'Sa hình': { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-400', hex: '#F59E0B' },
  'Hệ thống': { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-400', hex: '#A855F7' },
  'Văn hóa': { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-400', hex: '#EC4899' },
  'Kỹ thuật': { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-400', hex: '#06B6D4' },
};

const getChapterColor = (chapter: string) => {
  return CHAPTER_COLORS[chapter] || { bg: 'bg-slate-500', text: 'text-white', border: 'border-slate-400', hex: '#64748B' };
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

  const chapterGroups: Record<string, number[]> = {};
  questions.forEach((q, i) => {
    const ch = q.chapter || 'Khác';
    if (!chapterGroups[ch]) chapterGroups[ch] = [];
    chapterGroups[ch].push(i + 1);
  });

  const chapterList = Object.keys(chapterGroups);

  const chapterStats = useMemo(() => {
    return chapterList.map((chapter) => {
      const nums = chapterGroups[chapter];
      const total = nums.length;
      const answered = nums.filter((n) => confirmedAnswers[n - 1] !== null).length;
      const correct = nums.filter((n) => {
        const q = questions[n - 1];
        const a = confirmedAnswers[n - 1];
        return a !== null && q && a === q.correctAnswer;
      }).length;
      const mastery = total > 0 ? Math.round((correct / total) * 100) : 0;
      return { chapter, total, correct, answered, mastery };
    });
  }, [confirmedAnswers, chapterGroups, chapterList, questions]);

  const answeredCount = confirmedAnswers.filter(Boolean).length;
  const correctCount = confirmedAnswers.reduce((acc, a, i) => {
    if (a !== null && questions[i] && a === questions[i].correctAnswer) return acc + 1;
    return acc;
  }, 0);
  const incorrectCount = answeredCount - correctCount;
  const remainingCount = totalQuestions - answeredCount;

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col gap-4 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-4 pb-28 lg:w-80 lg:pb-6 lg:p-5">
      {!collapsedSidebar && (
        <>
          {/* Progress summary */}
          <div className="rounded-2xl bg-[var(--bg-tertiary)] p-4 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Tiến độ</span>
              <span className="text-base font-black text-[var(--text-primary)] tabular-nums">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--bg-hover)] overflow-hidden flex">
              {totalQuestions > 0 && (
                <>
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(correctCount / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="h-full bg-rose-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(incorrectCount / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Question Grid by Chapter */}
          <div className="space-y-3">
            {chapterList.map((chapter) => {
              const stats = chapterStats.find((s) => s.chapter === chapter);
              const nums = chapterGroups[chapter];
              const color = getChapterColor(chapter);
              return (
                <div key={chapter} className="rounded-2xl bg-[var(--bg-tertiary)] p-3.5 border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${color.bg}`} />
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate">{chapter}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] shrink-0">
                      {stats?.answered ?? 0}/{nums.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {nums.map((num) => {
                      const isCurrent = num === currentQuestionNumber;
                      const q = questions[num - 1];
                      const a = confirmedAnswers[num - 1];
                      const isAnswered = a !== null;
                      const isCorrect = isAnswered && q ? a === q.correctAnswer : false;
                      const qColor = getChapterColor(q?.chapter || 'Khác');
                      const btnBg = !isAnswered
                        ? { backgroundColor: `${qColor.hex}20`, color: qColor.hex, borderColor: `${qColor.hex}30` }
                        : isCorrect
                        ? { backgroundColor: '#22C55E', color: '#fff', borderColor: '#16A34A' }
                        : { backgroundColor: '#EF4444', color: '#fff', borderColor: '#DC2626' };
                      return (
                        <motion.button
                          key={num}
                          type="button"
                          onClick={() => onCurrentQuestionNumberChange(num)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.92 }}
                          style={{
                            ...btnBg,
                            borderWidth: 1,
                            borderStyle: 'solid',
                          }}
                          className={`w-full aspect-square rounded-xl text-[11px] font-bold leading-none transition-all flex items-center justify-center ${
                            isCurrent ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-[var(--bg-tertiary)]' : ''
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
          {isSelectedAnswered && selectedQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[var(--border)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2 bg-[var(--bg-tertiary)]">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
                  <h3 className="text-[var(--text-primary)] font-bold text-sm">{t('explanation')}</h3>
                </div>
                <span className="text-[10px] font-bold text-[var(--text-muted)]">Q{currentQuestionNumber}</span>
              </div>
              <div className="px-4 py-4 bg-[var(--bg-secondary)] space-y-3">
                {selectedQuestion.isCritical && (
                  <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-lg px-3 py-2">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Câu nghiêm trọng — Sai = trượt</span>
                  </div>
                )}
                <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed font-normal">
                  {selectedQuestion.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;
