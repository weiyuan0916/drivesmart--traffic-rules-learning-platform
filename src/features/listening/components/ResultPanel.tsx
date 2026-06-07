// ============================================================
// ResultPanel — VinaListen
// Word-by-word dictation result display
// Contraction matching is strict: don't ≠ dont (backend enforces)
// ============================================================

import { memo } from 'react'
import { Star } from 'lucide-react'
import { cn } from '../lib/utils'
import type { CheckData, CheckWordResult } from '../types/lesson'

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

  const baseClass =
    'inline-flex flex-col items-center px-1 py-0.5 rounded-sm'

  if (isMissing) {
    return (
      <span
        key={`missing-${word.word}`}
        className={cn(baseClass, 'opacity-40')}
        aria-label={`Missing word: ${word.expected}`}
      >
        <span
          className={cn(
            'text-base font-mono underline underline-offset-2 decoration-[1.5px]',
            'text-error',
          )}
        >
          {word.expected}
        </span>
        <span className="text-[10px] text-error/60 font-normal">
          missing
        </span>
      </span>
    )
  }

  if (isExtra) {
    return (
      <span
        key={`extra-${word.word}`}
        className={cn(baseClass, 'bg-warning/20 rounded-sm')}
        aria-label={`Extra word: ${word.word}`}
      >
        <span className="text-base font-mono text-warning line-through">
          {word.word}
        </span>
        <span className="text-[10px] text-warning/70 font-normal">extra</span>
      </span>
    )
  }

  if (isWrong) {
    return (
      <span
        key={`wrong-${word.word}`}
        className={cn(baseClass, 'flex-col items-start')}
        aria-label={`Wrong: got ${word.actual}, expected ${word.expected}`}
      >
        <span className="text-base font-mono text-error line-through decoration-error/50">
          {word.actual}
        </span>
        <span className="text-base font-mono text-success no-underline">
          {word.expected}
        </span>
      </span>
    )
  }

  // Correct
  return (
    <span
      key={`correct-${word.word}`}
      className={cn(baseClass, 'text-success')}
      aria-label={`Correct: ${word.word}`}
    >
      <span className="text-base font-mono">{word.word}</span>
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

  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      {/* Word-by-word result */}
      <div
        className="flex flex-wrap gap-x-1 gap-y-2 p-4 rounded-lg bg-bg-secondary border border-border"
        aria-label="Transcription result"
      >
        {result.word_results.map((word) => (
          <WordDisplay key={`${word.word}-${word.status}`} word={word} />
        ))}
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-text-secondary">
          Correct:{' '}
          <span className="font-semibold text-success">{words_correct}</span>
        </span>
        <span className="text-text-secondary">
          Wrong:{' '}
          <span className="font-semibold text-error">{words_wrong}</span>
        </span>
        {words_missing > 0 && (
          <span className="text-text-secondary">
            Missing:{' '}
            <span className="font-semibold text-error">{words_missing}</span>
          </span>
        )}
        <span className="text-text-secondary">
          Accuracy:{' '}
          <span className="font-semibold text-primary">{Math.round(accuracy)}%</span>
        </span>
        <span className="text-text-secondary">
          XP: <span className="font-semibold text-accent">+{xp_earned}</span>
        </span>
      </div>

      {/* Best score + new best */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-muted">
          Best: {Math.round(best_accuracy)}%
        </span>
        {is_new_best && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold"
            aria-label="New personal best!"
          >
            <Star size={12} aria-hidden="true" />
            NEW BEST!
          </span>
        )}
      </div>

      {/* Error summary */}
      {(words_wrong > 0 || words_missing > 0) && (
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-error/5 border border-error/20">
          {result.word_results
            .filter((w) => w.status === 'wrong')
            .map((w) => (
              <p key={`err-${w.word}`} className="text-sm text-text-secondary">
                <span className="font-mono text-error line-through">
                  {w.actual}
                </span>
                {' → '}
                <span className="font-mono text-success">{w.expected}</span>
              </p>
            ))}
          {result.word_results
            .filter((w) => w.status === 'missing')
            .map((w) => (
              <p key={`miss-${w.word}`} className="text-sm text-text-secondary">
                Missing:{' '}
                <span className="font-mono text-error">{w.expected}</span>
              </p>
            ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            'flex-1 h-11 rounded-lg border border-border text-primary font-semibold',
            'flex items-center justify-center gap-2',
            'hover:bg-light active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'min-h-[44px]',
          )}
        >
          Try Again
        </button>

        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className={cn(
              'h-11 px-4 rounded-lg border border-border text-primary',
              'flex items-center justify-center gap-1',
              'hover:bg-light active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'min-w-[44px] min-h-[44px]',
            )}
            aria-label="Previous clip"
          >
            ←
          </button>
        )}

        {hasNextClip && onNext && (
          <button
            type="button"
            onClick={onNext}
            className={cn(
              'flex-1 h-11 rounded-lg bg-primary text-white font-semibold',
              'flex items-center justify-center gap-2',
              'hover:bg-primary-dark active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'min-h-[44px]',
            )}
          >
            Next Clip →
          </button>
        )}
      </div>
    </div>
  )
})
