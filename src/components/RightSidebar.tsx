import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { SmoothScroll } from './SmoothScroll';
import type { ChapterStat, Question } from '../types';
import { EXAM_CHAPTERS_ORDERED } from '../services/examGenerator';

interface RightSidebarProps {
  chapterStats?: ChapterStat[] | null;
  examQuestions: Question[];
  collapsedSidebar: boolean;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;

function chapterRomanLabel(chapterNumber: number): string {
  if (chapterNumber >= 1 && chapterNumber <= 6) {
    return `Chương ${ROMAN[chapterNumber - 1]}`;
  }
  return `Chương ${chapterNumber}`;
}

type MasteryRow = {
  label: string;
  fullTitle: string;
  percentage: number;
  color: string;
  correctPercentage: number;
  incorrectPercentage: number;
};

type ChapterShareRow = {
  chapterNumber: number;
  label: string;
  fullTitle: string;
  count: number;
  percentage: number;
  barColor: string;
};

const SHARE_BAR_COLORS = ['#22C55E', '#3B82F6', '#F97316', '#A855F7', '#EAB308', '#EC4899'];

const RightSidebar: React.FC<RightSidebarProps> = ({ chapterStats, examQuestions, collapsedSidebar }) => {
  const { t } = useLanguage();

  const masteryData: MasteryRow[] = useMemo(() => {
    if (chapterStats && chapterStats.length > 0) {
      return chapterStats.map((stat) => {
        const correctPercentage =
          stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
        let color = '#F97316';
        if (correctPercentage >= 80) color = '#22C55E';
        else if (correctPercentage < 50) color = '#EF4444';

        return {
          label: chapterRomanLabel(stat.chapterNumber),
          fullTitle: stat.chapter,
          percentage: correctPercentage,
          color,
          correctPercentage,
          incorrectPercentage: 100 - correctPercentage,
        };
      });
    }

    return EXAM_CHAPTERS_ORDERED.map(({ chapterNumber, title }) => ({
      label: chapterRomanLabel(chapterNumber),
      fullTitle: title,
      percentage: 0,
      color: '#64748B',
      correctPercentage: 0,
      incorrectPercentage: 100,
    }));
  }, [chapterStats]);

  const chapterShareRows: ChapterShareRow[] = useMemo(() => {
    const total = examQuestions.length;
    if (total === 0) {
      return EXAM_CHAPTERS_ORDERED.map(({ chapterNumber, title }, i) => ({
        chapterNumber,
        label: chapterRomanLabel(chapterNumber),
        fullTitle: title,
        count: 0,
        percentage: 0,
        barColor: SHARE_BAR_COLORS[i % SHARE_BAR_COLORS.length],
      }));
    }

    const counts = new Map<number, number>();
    for (const q of examQuestions) {
      counts.set(q.chapterNumber, (counts.get(q.chapterNumber) ?? 0) + 1);
    }

    const rows: ChapterShareRow[] = EXAM_CHAPTERS_ORDERED.map(({ chapterNumber, title }, i) => {
      const count = counts.get(chapterNumber) ?? 0;
      return {
        chapterNumber,
        label: chapterRomanLabel(chapterNumber),
        fullTitle: title,
        count,
        percentage: Math.round((count / total) * 100),
        barColor: SHARE_BAR_COLORS[i % SHARE_BAR_COLORS.length],
      };
    });

    rows.sort((a, b) => {
      if (a.percentage !== b.percentage) return b.percentage - a.percentage;
      return a.chapterNumber - b.chapterNumber;
    });

    return rows;
  }, [examQuestions]);

  const hasStarted = chapterStats && chapterStats.some(s => s.total > 0);

  const overallScore = useMemo(() => {
    if (!chapterStats || chapterStats.length === 0) return null;
    const totalCorrect = chapterStats.reduce((sum, s) => sum + s.correct, 0);
    const totalAnswered = chapterStats.reduce((sum, s) => sum + s.total, 0);
    if (totalAnswered === 0) return null;
    return { correct: totalCorrect, total: totalAnswered, percentage: Math.round((totalCorrect / totalAnswered) * 100) };
  }, [chapterStats]);

  return (
    <SmoothScroll className="w-full lg:w-96 bg-[var(--bg-secondary)] p-5 lg:p-5 pb-32 lg:pb-10 flex flex-col gap-5 lg:gap-6 border-l border-[var(--border)]">
      {!collapsedSidebar && (
        <>
          {/* Exam Info Header */}
          <div className="rounded-2xl bg-[var(--bg-tertiary)] px-4 py-3">
            <h4 className="text-[var(--text-primary)] font-semibold text-xs uppercase tracking-wider">Bài thi B1</h4>
            <p className="text-[var(--text-secondary)] text-xs mt-1">{examQuestions.length} câu hỏi · 6 chương</p>
          </div>

          {/* Unified Stats Card */}
          <div className="bg-[var(--bg-tertiary)] p-5 rounded-2xl border border-[var(--border)]">
            {/* Overall score header */}
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-[var(--text-primary)] font-bold text-sm">Điểm số theo chương</h4>
              {overallScore && (
                <span className={`text-sm font-black ${
                  overallScore.percentage >= 80 ? 'text-emerald-500' :
                  overallScore.percentage >= 50 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {overallScore.percentage}%
                </span>
              )}
            </div>

            {/* Chapter mastery as stacked bars */}
            <div className="space-y-3">
              {masteryData.map((row, idx) => {
                const isEmpty = row.correctPercentage === 0 && row.incorrectPercentage === 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                        <span className="text-xs font-bold text-[var(--text-primary)] truncate">{row.label}</span>
                      </div>
                      {isEmpty ? (
                        <span className="text-[10px] text-[var(--text-muted)] font-medium shrink-0">—</span>
                      ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {row.correctPercentage > 0 && (
                            <span className="text-[10px] font-bold text-emerald-500">{row.correctPercentage}%</span>
                          )}
                          {row.incorrectPercentage > 0 && (
                            <span className="text-[10px] font-semibold text-rose-500">{row.incorrectPercentage}%</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden bg-[var(--bg-hover)] flex">
                      {isEmpty ? (
                        <div className="h-full w-full rounded-full bg-[var(--bg-hover)]" />
                      ) : (
                        <>
                          {row.correctPercentage > 0 && (
                            <motion.div
                              className="h-full rounded-l-full bg-emerald-500 shrink-0"
                              initial={{ width: 0 }}
                              animate={{ width: `${row.correctPercentage}%` }}
                              transition={{ duration: 0.5, delay: idx * 0.06 }}
                            />
                          )}
                          {row.incorrectPercentage > 0 && (
                            <motion.div
                              className="h-full rounded-r-full bg-rose-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${row.incorrectPercentage}%` }}
                              transition={{ duration: 0.5, delay: idx * 0.06 }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chapter share — compact list */}
            <div className="mt-6 pt-5 border-t border-[var(--border)]">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Phân bổ câu hỏi</h5>
              <div className="space-y-2">
                {chapterShareRows.map((row) => (
                  <div key={row.chapterNumber} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.barColor }} />
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] min-w-0 truncate flex-1">
                      {row.label}
                    </span>
                    <span className="text-[11px] font-bold text-[var(--text-primary)] shrink-0">
                      {row.count > 0 ? `${row.count} câu` : '—'}
                    </span>
                    <div className="w-14 h-1.5 rounded-full overflow-hidden bg-[var(--bg-hover)] shrink-0">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${row.percentage}%`, backgroundColor: row.barColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </SmoothScroll>
  );
};

export default RightSidebar;
