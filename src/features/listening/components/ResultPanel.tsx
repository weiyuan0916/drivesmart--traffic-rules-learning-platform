// ============================================================
// ResultPanel — VinaListen
// Word-by-word dictation result display with animations
// ============================================================

import { memo } from 'react'
import { Star, CheckCircle2, XCircle, ChevronRight, RotateCcw, ChevronLeft } from 'lucide-react'
import { cn } from '../lib/utils'
import type { CheckData, CheckWordResult } from '../types/lesson'
import { ExplanationPanel } from './explanation-panel/ExplanationPanel'

interface ResultPanelProps {
  result: CheckData
  onRetry?: () => void
  onNext?: () => void
  hasNextClip?: boolean
  hasPrevClip?: boolean
  onPrev?: () => void
}

interface WordDisplayProps {
  word: CheckWordResult
}

const WordDisplay = memo(function WordDisplay({ word }: WordDisplayProps) {
  const isMissing = word.status === 'missing'
  const isExtra = word.status === 'extra'
  const isWrong = word.status === 'wrong'
  const isCorrect = word.status === 'correct'

  const baseClass = 'inline-flex flex-col items-center px-1 py-0.5 rounded-sm'

  if (isMissing) {
    return (
      <span
        key={`missing-${word.word}`}
        className={cn(baseClass, 'opacity-70')}
        aria-label={`Từ thiếu: ${word.expected}`}
      >
        <span
          className={cn(
            'text-base md:text-lg font-mono underline underline-offset-2 decoration-[1.5px]',
            'text-error dark:text-error',
          )}
        >
          {word.expected}
        </span>
        <span className="text-[10px] text-error/60 dark:text-error/50 font-normal">
          thiếu
        </span>
      </span>
    )
  }

  if (isExtra) {
    return (
      <span
        key={`extra-${word.word}`}
        className={cn(baseClass, 'bg-warning/20 dark:bg-warning/20 rounded-sm')}
        aria-label={`Từ thừa: ${word.word}`}
      >
        <span className="text-base md:text-lg font-mono text-warning dark:text-warning line-through">
          {word.word}
        </span>
        <span className="text-[10px] text-warning/70 font-normal">thừa</span>
      </span>
    )
  }

  if (isWrong) {
    return (
      <span
        key={`wrong-${word.word}`}
        className={cn(baseClass, 'flex-col items-start')}
        aria-label={`Sai: đã nhập ${word.actual}, đúng là ${word.expected}`}
      >
        <span className="text-base md:text-lg font-mono text-error dark:text-error line-through decoration-error/50">
          {word.actual}
        </span>
        <span className="text-base md:text-lg font-mono text-success dark:text-success no-underline">
          {word.expected}
        </span>
      </span>
    )
  }

  // Correct
  return (
    <span
      key={`correct-${word.word}`}
      className={cn(baseClass, 'text-success dark:text-success')}
      aria-label={`Đúng: ${word.word}`}
    >
      <span className="text-base md:text-lg font-mono">{word.word}</span>
    </span>
  )
})

export const ResultPanel = memo(function ResultPanel({
  result,
  onRetry,
  onNext,
  hasNextClip,
  onPrev,
}: ResultPanelProps) {
  const { accuracy, words_total, words_correct, words_wrong, words_missing, xp_earned, is_new_best, best_accuracy } = result

  const isPerfect = accuracy === 100
  const isGood = accuracy >= 70
  const isPassing = accuracy >= 50

  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      {/* Result Header */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0',
            isPerfect || isGood
              ? 'bg-success/10 dark:bg-success/20'
              : isPassing
                ? 'bg-warning/10 dark:bg-warning/20'
                : 'bg-error/10 dark:bg-error/20'
          )}
        >
          {isPerfect || isGood ? (
            <CheckCircle2 size={28} className="text-success dark:text-success" />
          ) : (
            <XCircle size={28} className={cn(isPassing ? 'text-warning dark:text-warning' : 'text-error dark:text-error')} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'text-3xl md:text-4xl font-bold',
                isPerfect || isGood
                  ? 'text-success dark:text-success'
                  : isPassing
                    ? 'text-warning dark:text-warning'
                    : 'text-error dark:text-error'
              )}
            >
              {Math.round(accuracy)}%
            </span>
            {is_new_best && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent text-xs font-semibold animate-pulse">
                <Star size={12} aria-hidden="true" />
                Kỷ lục mới!
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">
            {isPerfect
              ? 'Hoàn hảo! Bạn đã nghe chính xác!'
              : isGood
                ? 'Tốt lắm! Bạn đang tiến bộ!'
                : isPassing
                  ? 'Cố gắng hơn nữa nhé!'
                  : 'Hãy nghe lại và thử lại.'}
          </p>
        </div>
      </div>

      {/* Word-by-word result */}
      <div
        className="flex flex-wrap gap-x-1 gap-y-2 p-4 md:p-5 rounded-2xl bg-bg-tertiary dark:bg-dark border border-border dark:border-border-strong"
        aria-label="Kết quả từng từ"
      >
        {result.word_results.map((word) => (
          <WordDisplay key={`${word.word}-${word.status}`} word={word} />
        ))}
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-success dark:text-success" />
          <span className="text-text-secondary dark:text-text-secondary">
            Đúng: <span className="font-semibold text-success dark:text-success">{words_correct}</span>
          </span>
        </div>
        {words_wrong > 0 && (
          <div className="flex items-center gap-2">
            <XCircle size={16} className="text-error dark:text-error" />
            <span className="text-text-secondary dark:text-text-secondary">
              Sai: <span className="font-semibold text-error dark:text-error">{words_wrong}</span>
            </span>
          </div>
        )}
        {words_missing > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-error dark:text-error">−</span>
            <span className="text-text-secondary dark:text-text-secondary">
              Thiếu: <span className="font-semibold text-error dark:text-error">{words_missing}</span>
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Star size={16} className="text-accent dark:text-accent" />
          <span className="text-text-secondary dark:text-text-secondary">
            XP: <span className="font-semibold text-accent dark:text-accent">+{xp_earned}</span>
          </span>
        </div>
      </div>

      {/* Best score */}
      <div className="text-sm text-text-muted dark:text-text-muted">
        Kỷ lục cá nhân: <span className="font-medium">{Math.round(best_accuracy)}%</span>
      </div>

      {/* Error summary */}
      {(words_wrong > 0 || words_missing > 0) && (
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-error/5 dark:bg-error/10 border border-error/20 dark:border-error/30">
          <p className="text-sm font-medium text-error dark:text-error">Lỗi thường gặp:</p>
          {result.word_results
            .filter((w) => w.status === 'wrong')
            .map((w) => (
              <p key={`err-${w.word}`} className="text-sm text-text-secondary dark:text-text-secondary">
                <span className="font-mono text-error dark:text-error line-through">
                  {w.actual}
                </span>
                {' → '}
                <span className="font-mono text-success dark:text-success">{w.expected}</span>
              </p>
            ))}
          {result.word_results
            .filter((w) => w.status === 'missing')
            .map((w) => (
              <p key={`miss-${w.word}`} className="text-sm text-text-secondary dark:text-text-secondary">
                Thiếu:{' '}
                <span className="font-mono text-error dark:text-error">{w.expected}</span>
              </p>
            ))}
        </div>
      )}

      {/* Multi-Language Explanation */}
      {result.clip_completed && (
        <ExplanationPanel clipId={result.clip_id.toString()} />
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            'flex-1 h-12 md:h-14 rounded-xl font-semibold text-base',
            'flex items-center justify-center gap-2',
            'bg-bg-tertiary dark:bg-dark text-text-primary dark:text-white',
            'border border-border dark:border-border-strong',
            'hover:bg-bg-hover dark:hover:bg-dark-surface active:scale-[0.98]',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          )}
        >
          <RotateCcw size={18} aria-hidden="true" />
          Nghe lại
        </button>

        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className={cn(
              'h-12 md:h-14 px-5 rounded-xl font-medium',
              'flex items-center justify-center gap-1',
              'bg-bg-tertiary dark:bg-dark text-text-secondary dark:text-text-secondary',
              'border border-border dark:border-border-strong',
              'hover:bg-bg-hover dark:hover:bg-dark-surface active:scale-[0.98]',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            )}
            aria-label="Câu trước"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
        )}

        {hasNextClip && onNext && (
          <button
            type="button"
            onClick={onNext}
            className={cn(
              'flex-1 h-12 md:h-14 rounded-xl font-semibold text-base',
              'flex items-center justify-center gap-2',
              'bg-gradient-to-r from-primary to-primary-dark text-white',
              'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30',
              'hover:scale-[1.02] active:scale-[0.98]',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            )}
          >
            Câu tiếp theo
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
})
