import { CheckCircle, XCircle, RotateCcw, Trophy, AlertTriangle } from 'lucide-react';
import type { ExamResult } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ResultsProps {
  result: ExamResult;
  onRetry: () => void;
  onBackToSetup: () => void;
}

export function Results({ result, onRetry, onBackToSetup }: ResultsProps) {
  const { t } = useLanguage();
  const isPass = result.score >= 26;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`p-6 ${isPass ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'}`}>
        <div className="text-center text-white">
          {isPass ? (
            <>
              <Trophy size={48} className="mx-auto mb-3 opacity-90" />
              <h2 className="text-2xl font-bold mb-1">Chúc mừng!</h2>
              <p className="text-sm opacity-90">Bạn đã đạt bài thi</p>
            </>
          ) : (
            <>
              <AlertTriangle size={48} className="mx-auto mb-3 opacity-90" />
              <h2 className="text-2xl font-bold mb-1">Chưa đạt</h2>
              <p className="text-sm opacity-90">Cần {26 - result.correctCount} câu nữa để đạt</p>
            </>
          )}
        </div>
      </div>

      {/* Score Display */}
      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold ${isPass ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
            {result.score}
          </div>
          <p className="text-[var(--text-muted)] mt-1">/{result.totalQuestions}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[var(--color-success)]/10 text-center">
            <CheckCircle size={24} className="mx-auto mb-2 text-[var(--color-success)]" />
            <div className="text-2xl font-bold text-[var(--color-success)]">{result.correctCount}</div>
            <div className="text-xs text-[var(--color-success)]">{t('correctAnswers')}</div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-error)]/10 text-center">
            <XCircle size={24} className="mx-auto mb-2 text-[var(--color-error)]" />
            <div className="text-2xl font-bold text-[var(--color-error)]">{result.wrongCount}</div>
            <div className="text-xs text-[var(--color-error)]">{t('wrongAnswers')}</div>
          </div>
        </div>

        {/* Chapter Stats */}
        {result.chapterStats && result.chapterStats.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">{t('stats')}</h3>
            <div className="space-y-2">
              {result.chapterStats.map((stat) => {
                const percentage = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                return (
                  <div key={stat.chapterNumber} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[var(--text-muted)] w-20">
                      {t('chapter')} {stat.chapterNumber}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          stat.correct >= stat.total * 0.8
                            ? 'bg-[var(--color-success)]'
                            : stat.correct >= stat.total * 0.5
                              ? 'bg-[var(--color-warning)]'
                              : 'bg-[var(--color-error)]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-muted)] w-12 text-right">
                      {stat.correct}/{stat.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full py-4 rounded-xl font-semibold text-base bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all min-h-[52px] flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            {t('tryAgain')}
          </button>
          <button
            onClick={onBackToSetup}
            className="w-full py-4 rounded-xl font-medium text-base bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all min-h-[52px]"
          >
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
}
