import type { ChapterStat } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ChapterStatsProps {
  stats: ChapterStat[];
  totalCorrect: number;
  totalQuestions: number;
}

export function ChapterStats({ stats, totalCorrect, totalQuestions }: ChapterStatsProps) {
  const { t } = useLanguage();
  const scorePercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const isPass = totalCorrect >= 26;

  return (
    <div className="p-4">
      {/* Overall Score */}
      <div className="mb-6 p-6 rounded-2xl bg-[var(--bg-secondary)]">
        <div className="text-center">
          <div className={`text-5xl font-bold mb-2 ${isPass ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
            {scorePercentage}%
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {totalCorrect}/{totalQuestions} {t('correctAnswers').toLowerCase()}
          </p>
          <div className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-medium ${
            isPass
              ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
              : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
          }`}>
            {isPass ? t('passScore') : t('failScore')}
          </div>
        </div>
      </div>

      {/* Chapter Breakdown */}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t('masteryByChapter')}</h3>
      
      <div className="space-y-4">
        {stats.map((stat) => {
          const percentage = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
          const barColor = percentage >= 80 
            ? 'bg-[var(--color-success)]' 
            : percentage >= 50 
              ? 'bg-[var(--color-warning)]' 
              : 'bg-[var(--color-error)]';

          return (
            <div key={stat.chapterNumber} className="p-4 rounded-xl bg-[var(--bg-secondary)]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {t('chapter')} {stat.chapterNumber}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[var(--text-secondary)]">
                  {stat.correct}/{stat.total}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[var(--text-muted)]">
                  {stat.chapter.replace(/^Chương \d+\. /, '').slice(0, 30)}...
                </span>
                <span className="text-xs font-medium text-[var(--text-muted)]">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[var(--color-success)]/10 text-center">
          <div className="text-2xl font-bold text-[var(--color-success)]">{totalCorrect}</div>
          <div className="text-xs text-[var(--color-success)]">{t('correctAnswers')}</div>
        </div>
        <div className="p-4 rounded-xl bg-[var(--color-error)]/10 text-center">
          <div className="text-2xl font-bold text-[var(--color-error)]">{totalQuestions - totalCorrect}</div>
          <div className="text-xs text-[var(--color-error)]">{t('wrongAnswers')}</div>
        </div>
      </div>
    </div>
  );
}
