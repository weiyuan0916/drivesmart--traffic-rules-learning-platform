import React, { useMemo } from 'react';
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

const RightSidebar: React.FC<RightSidebarProps> = ({ chapterStats, examQuestions, collapsedSidebar }) => {
  const { t } = useLanguage();

  const masteryData = useMemo(() => {
    return EXAM_CHAPTERS_ORDERED.map(({ chapterNumber, title }) => {
      const stat = chapterStats?.find(s => s.chapterNumber === chapterNumber);
      const total = stat?.total ?? 0;
      const correct = stat?.correct ?? 0;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

      let statusColor = '#9CA3AF';
      if (stat && stat.total > 0) {
        if (pct >= 80) statusColor = '#22C55E';
        else if (pct >= 50) statusColor = '#F59E0B';
        else statusColor = '#EF4444';
      }

      return { chapterNumber, chapter: title, pct, correct, total, statusColor };
    });
  }, [chapterStats]);

  const overallScore = useMemo(() => {
    if (!chapterStats || chapterStats.length === 0) return null;
    const totalCorrect = chapterStats.reduce((sum, s) => sum + s.correct, 0);
    const totalAnswered = chapterStats.reduce((sum, s) => sum + s.total, 0);
    if (totalAnswered === 0) return null;
    return { correct: totalCorrect, total: totalAnswered, pct: Math.round((totalCorrect / totalAnswered) * 100) };
  }, [chapterStats]);

  const hasStarted = chapterStats && chapterStats.some(s => s.total > 0);

  return (
    <SmoothScroll className="w-full lg:w-80 shrink-0 bg-[var(--bg-secondary)] lg:p-5 pb-32 lg:pb-10 flex flex-col gap-4 border-l border-[var(--border)]">
      {!collapsedSidebar && (
        <>
          {/* Overall Score */}
          {overallScore && hasStarted && (
            <div className={`rounded-2xl p-4 border ${
              overallScore.pct >= 80
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                : overallScore.pct >= 50
                  ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
                  : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-base font-black ${
                    overallScore.pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                    overallScore.pct >= 50 ? 'text-amber-600 dark:text-amber-400' :
                    'text-rose-600 dark:text-rose-400'
                  }`}>
                    {overallScore.pct}%
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-medium tabular-nums">
                    ({overallScore.correct}/{overallScore.total} đúng)
                  </span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  overallScore.pct >= 80 ? 'bg-emerald-500 text-white' :
                  overallScore.pct >= 50 ? 'bg-amber-500 text-white' :
                  'bg-rose-500 text-white'
                }`}>
                  {overallScore.pct >= 80 ? 'Tốt' : overallScore.pct >= 50 ? 'Cần cố gắng' : 'Yếu'}
                </span>
              </div>
            </div>
          )}

          {/* Chapter Mastery */}
          <div className="bg-[var(--bg-tertiary)] p-4 rounded-2xl border border-[var(--border)]">
            <h4 className="text-[var(--text-primary)] font-bold text-sm mb-4">Điểm theo chương</h4>
            <div className="space-y-3">
              {masteryData.map((row) => {
                const isEmpty = row.total === 0;
                return (
                  <div key={row.chapterNumber} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.statusColor }} />
                        <span className="text-xs font-bold text-[var(--text-primary)] truncate">{chapterRomanLabel(row.chapterNumber)}</span>
                      </div>
                      {isEmpty ? (
                        <span className="text-[10px] text-[var(--text-muted)] font-medium shrink-0">—</span>
                      ) : (
                        <span className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums shrink-0">
                          {row.correct}/{row.total}
                        </span>
                      )}
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-[var(--bg-hover)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${row.total > 0 ? row.pct : 0}%`, backgroundColor: row.statusColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </SmoothScroll>
  );
};

export default RightSidebar;
