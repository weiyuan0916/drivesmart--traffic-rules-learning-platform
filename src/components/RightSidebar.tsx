import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
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

  return (
    <SmoothScroll className="w-full lg:w-96 bg-[var(--bg-secondary)] p-5 lg:p-7 pb-32 lg:pb-10 flex flex-col gap-6 lg:gap-8 border-l border-[var(--border)]">
      {!collapsedSidebar && (
        <>
          {/* Exam Info Header */}
          <div className="rounded-2xl bg-[var(--bg-tertiary)] px-4 py-3">
            <h4 className="text-[var(--text-primary)] font-bold text-xs uppercase tracking-wider">Bài thi B1</h4>
            <p className="text-[var(--text-secondary)] text-[10px] mt-1">{examQuestions.length} câu hỏi · 6 chương</p>
          </div>

          {/* Chapter Share */}
          <div className="bg-[var(--bg-tertiary)] p-5 lg:p-6 rounded-3xl mt-1">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[var(--text-primary)] font-bold text-sm">{t('recentChaptersShare')}</h4>
          <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>
        <p className="text-[10px] text-[var(--text-secondary)] mb-4 leading-relaxed">
          {examQuestions.length > 0
            ? `${examQuestions.length} ${t('chapterShareSuffix')}`
            : '—'}
        </p>
        <div className="space-y-5">
          {chapterShareRows.map((row) => (
            <div key={row.chapterNumber} className="space-y-2">
              <div className="flex justify-between gap-2 text-[11px]">
                <div className="min-w-0">
                  <p className="text-[var(--text-primary)] font-bold truncate" title={row.fullTitle}>
                    {row.label}
                  </p>
                  <p className="text-[var(--text-secondary)] text-[10px] line-clamp-2">{row.fullTitle}</p>
                </div>
                <p className="text-[var(--text-primary)] font-bold shrink-0">{row.percentage}%</p>
              </div>
              <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${row.percentage}%`, backgroundColor: row.barColor }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--bg-tertiary)] p-5 lg:p-6 rounded-3xl flex-1 min-h-[300px] flex flex-col mt-1">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[var(--text-primary)] font-bold text-sm">{t('masteryByChapter')}</h4>
          <span className="text-[var(--text-secondary)] text-[10px] font-bold">%</span>
        </div>

        <div className="h-[220px] w-full min-w-0 shrink-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={masteryData}>
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                {masteryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <XAxis hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as MasteryRow;
                  return (
                    <div className="max-w-[280px] rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs shadow-lg">
                      <p className="mb-1 font-semibold leading-snug text-[var(--text-primary)]">{row.fullTitle}</p>
                      <p className="font-bold text-[var(--text-primary)]">{row.percentage}%</p>
                    </div>
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6">
          {masteryData.map((area, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: area.color }} />
                <span className="text-[9px] text-[var(--text-secondary)] font-medium truncate" title={area.fullTitle}>
                  {area.label}
                </span>
              </div>
              <span className="text-[9px] text-[var(--text-secondary)]">
                {area.correctPercentage}% đúng · {area.incorrectPercentage}% sai
              </span>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </SmoothScroll>
  );
};

export default RightSidebar;
