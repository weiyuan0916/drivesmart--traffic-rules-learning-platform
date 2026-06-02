import React from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Question } from '../types';

interface RightSidebarProps {
  questions: Question[];
  confirmedAnswers: (string | null)[];
  isCollapsed: boolean;
  onToggle: () => void;
}

const CHAPTER_NAMES: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
};

const CHAPTER_COLORS: Record<number, string> = {
  1: '#3B82F6',
  2: '#10B981',
  3: '#F59E0B',
  4: '#F97316',
  5: '#8B5CF6',
  6: '#EC4899',
};

export default function RightSidebar({
  questions,
  confirmedAnswers,
  isCollapsed,
  onToggle,
}: RightSidebarProps) {
  const chapterStats = React.useMemo(() => {
    const stats: Record<number, { correct: number; total: number }> = {};

    for (let i = 1; i <= 6; i++) {
      stats[i] = { correct: 0, total: 0 };
    }

    questions.forEach((question, index) => {
      const chapter = question.chapterNumber;
      if (chapter >= 1 && chapter <= 6) {
        stats[chapter].total++;
        const answer = confirmedAnswers[index];
        if (answer && answer === question.correctAnswer) {
          stats[chapter].correct++;
        }
      }
    });

    return Object.entries(stats).map(([chapter, data]) => ({
      chapter: Number(chapter),
      name: CHAPTER_NAMES[Number(chapter)],
      correct: data.correct,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));
  }, [questions, confirmedAnswers]);

  const totalCorrect = chapterStats.reduce((sum, s) => sum + s.correct, 0);
  const totalAnswered = chapterStats.reduce((sum, s) => sum + s.total, 0);

  return (
    <div
      className={`
        flex flex-col bg-[var(--bg-secondary)] border-l border-[var(--border)]
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-80'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--text-secondary)]" />
            <h3 className="font-bold text-[var(--text-primary)]">Thống kê</h3>
          </div>
        )}
      </div>

      {/* Stats Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-auto p-4">
          {/* Overall Score */}
          <div className="mb-6 p-4 bg-[var(--bg-tertiary)] rounded-xl">
            <p className="text-sm text-[var(--text-secondary)] mb-1">Điểm hiện tại</p>
            <p className="text-3xl font-black text-[var(--text-primary)]">
              {totalCorrect}/{totalAnswered}
            </p>
            {totalAnswered > 0 && (
              <p className="text-sm text-[var(--text-secondary)]">
                {Math.round((totalCorrect / totalAnswered) * 100)}% đúng
              </p>
            )}
          </div>

          {/* Chapter Chart */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Theo chương
            </h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chapterStats} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" domain={[0, 30]} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={30}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'correct') return [`${value} đúng`, 'Đúng'];
                      return [value, 'Tổng'];
                    }}
                    labelFormatter={(label: string) => `Chương ${label}`}
                  />
                  <Bar dataKey="correct" radius={[0, 4, 4, 0]}>
                    {chapterStats.map((entry) => (
                      <Cell key={entry.chapter} fill={CHAPTER_COLORS[entry.chapter]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chapter List */}
          <div className="space-y-2">
            {chapterStats.map((stat) => (
              <div
                key={stat.chapter}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHAPTER_COLORS[stat.chapter] }}
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    Chương {stat.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {stat.correct}/{stat.total}
                  </span>
                  {stat.total > 0 && (
                    <span
                      className={`
                        text-xs font-medium px-2 py-0.5 rounded
                        ${stat.percentage >= 80 ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : ''}
                        ${stat.percentage >= 50 && stat.percentage < 80 ? 'bg-[var(--color-warning-light)] text-[var(--color-warning)]' : ''}
                        ${stat.percentage < 50 && stat.total > 0 ? 'bg-[var(--color-error-light)] text-[var(--color-error)]' : ''}
                        ${stat.total === 0 ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]' : ''}
                      `}
                    >
                      {stat.total > 0 ? `${stat.percentage}%` : '-'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsed mini indicator */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-2">
          <BarChart3 className="w-6 h-6 text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">
            {totalCorrect}/{totalAnswered}
          </span>
        </div>
      )}
    </div>
  );
}
