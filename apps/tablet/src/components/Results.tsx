import React from 'react';
import { Trophy, RotateCcw, CheckCircle, XCircle, Award } from 'lucide-react';
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

interface ResultsProps {
  questions: Question[];
  confirmedAnswers: (string | null)[];
  onRetry: () => void;
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

export default function Results({ questions, confirmedAnswers, onRetry }: ResultsProps) {
  const results = React.useMemo(() => {
    const chapterData: Record<number, { correct: number; total: number }> = {};
    let totalCorrect = 0;
    let totalAnswered = 0;

    for (let i = 1; i <= 6; i++) {
      chapterData[i] = { correct: 0, total: 0 };
    }

    questions.forEach((question, index) => {
      const answer = confirmedAnswers[index];
      const chapter = question.chapterNumber;

      if (chapter >= 1 && chapter <= 6) {
        chapterData[chapter].total++;

        if (answer) {
          totalAnswered++;
          if (answer === question.correctAnswer) {
            chapterData[chapter].correct++;
            totalCorrect++;
          }
        }
      }
    });

    const chartData = Object.entries(chapterData).map(([chapter, data]) => ({
      chapter: Number(chapter),
      name: CHAPTER_NAMES[Number(chapter)],
      correct: data.correct,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));

    return {
      totalCorrect,
      totalAnswered,
      percentage: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
      chartData,
    };
  }, [questions, confirmedAnswers]);

  const passed = results.percentage >= 93;
  const unanswered = questions.length - results.totalAnswered;

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 bg-[var(--bg-primary)]">
      {/* Result Header */}
      <div className="text-center mb-8">
        <div
          className={`
            w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center
            ${passed ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'}
          `}
        >
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">
          {passed ? 'Chúc mừng!' : 'Chưa đạt'}
        </h1>
        <p className="text-[var(--text-secondary)]">
          {passed
            ? 'Bạn đã vượt qua bài thi!'
            : 'Hãy ôn tập thêm và thử lại nhé!'}
        </p>
      </div>

      {/* Score Card */}
      <div className="bg-[var(--bg-secondary)] rounded-3xl p-8 w-full max-w-md shadow-lg border border-[var(--border)] mb-8">
        <div className="text-center mb-6">
          <p className="text-sm text-[var(--text-secondary)] mb-2">Kết quả của bạn</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-6xl font-black text-[var(--text-primary)]">
              {results.percentage}
            </span>
            <span className="text-2xl font-bold text-[var(--text-secondary)]">%</span>
          </div>
          <p className="text-lg text-[var(--text-secondary)] mt-2">
            {results.totalCorrect}/{results.totalAnswered} câu đúng
          </p>
          {unanswered > 0 && (
            <p className="text-sm text-[var(--color-warning)] mt-2">
              ({unanswered} câu chưa trả lời)
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-[var(--color-success-light)] rounded-xl">
            <CheckCircle className="w-6 h-6 mx-auto mb-1 text-[var(--color-success)]" />
            <p className="text-xl font-bold text-[var(--color-success)]">{results.totalCorrect}</p>
            <p className="text-xs text-[var(--color-success)]">Đúng</p>
          </div>
          <div className="text-center p-3 bg-[var(--color-error-light)] rounded-xl">
            <XCircle className="w-6 h-6 mx-auto mb-1 text-[var(--color-error)]" />
            <p className="text-xl font-bold text-[var(--color-error)]">
              {results.totalAnswered - results.totalCorrect}
            </p>
            <p className="text-xs text-[var(--color-error)]">Sai</p>
          </div>
          <div className="text-center p-3 bg-[var(--bg-tertiary)] rounded-xl">
            <Award className="w-6 h-6 mx-auto mb-1 text-[var(--text-muted)]" />
            <p className="text-xl font-bold text-[var(--text-muted)]">{results.totalAnswered}</p>
            <p className="text-xs text-[var(--text-muted)]">Đã trả</p>
          </div>
        </div>

        {/* Chapter Chart */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 text-center">
            Kết quả theo chương
          </h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results.chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
                <XAxis type="number" domain={[0, 30]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={25} tick={{ fontSize: 10 }} />
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
                  {results.chartData.map((entry) => (
                    <Cell key={entry.chapter} fill={CHAPTER_COLORS[entry.chapter]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chapter breakdown */}
        <div className="space-y-2">
          {results.chartData
            .filter((s) => s.total > 0)
            .map((stat) => (
              <div
                key={stat.chapter}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHAPTER_COLORS[stat.chapter] }}
                  />
                  <span className="text-sm text-[var(--text-primary)]">Chương {stat.name}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {stat.correct}/{stat.total} ({stat.percentage}%)
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Retry Button */}
      <button
        onClick={onRetry}
        className="w-full max-w-md flex items-center justify-center gap-3 px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-lg rounded-2xl transition-all duration-200 shadow-lg"
      >
        <RotateCcw className="w-6 h-6" />
        <span>Thi lại</span>
      </button>
    </div>
  );
}
