// ============================================================
// SegmentResults — VinaListen
// Word-by-word comparison with color-coded results
// ============================================================

import { useState } from 'react'
import { Check, X, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { BbcSegmentScore } from '../../../types/bbc'

interface SegmentResultsProps {
  reference: string
  score: BbcSegmentScore
  showReference?: boolean
  className?: string
}

function WordBadge({
  word,
  status,
}: {
  word: string
  status: 'correct' | 'wrong' | 'missing' | 'extra'
}) {
  const configs = {
    correct: {
      class: 'bg-green-50 text-green-700 border-green-200',
      icon: <Check size={10} className="shrink-0" aria-hidden />,
      label: `Đúng: ${word}`,
    },
    wrong: {
      class: 'bg-red-50 text-red-700 border-red-200 line-through opacity-75',
      icon: <X size={10} className="shrink-0" aria-hidden />,
      label: `Sai: ${word}`,
    },
    missing: {
      class: 'bg-yellow-50 text-yellow-700 border-yellow-200 border-dashed',
      icon: <AlertTriangle size={10} className="shrink-0" aria-hidden />,
      label: `Thiếu: ${word}`,
    },
    extra: {
      class: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: <AlertTriangle size={10} className="shrink-0" aria-hidden />,
      label: `Thừa: ${word}`,
    },
  }

  const cfg = configs[status]

  return (
    <span
      title={cfg.label}
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-sm font-mono font-medium',
        cfg.class,
      )}
      aria-label={cfg.label}
    >
      {cfg.icon}
      {word}
    </span>
  )
}

function buildWordComparison(
  reference: string,
  score: BbcSegmentScore
): Array<{ word: string; status: 'correct' | 'wrong' | 'missing' | 'extra' }> {
  const refWords = reference.toLowerCase().replace(/[.,!?;:]/g, '').trim().split(/\s+/)
  const correctSet = new Set(score.correct.map((w) => w.toLowerCase()))
  const wrongSet = new Set(score.wrong.map((w) => w.toLowerCase()))
  const missingSet = new Set(score.missing.map((w) => w.toLowerCase()))

  const result: Array<{ word: string; status: 'correct' | 'wrong' | 'missing' | 'extra' }> = []

  for (const word of refWords) {
    if (correctSet.has(word)) {
      result.push({ word, status: 'correct' })
    } else if (missingSet.has(word)) {
      result.push({ word, status: 'missing' })
    } else {
      result.push({ word, status: 'wrong' })
    }
  }

  for (const word of score.wrong) {
    if (!correctSet.has(word.toLowerCase()) && !missingSet.has(word.toLowerCase())) {
      result.push({ word, status: 'extra' })
    }
  }

  return result
}

export function SegmentResults({
  reference,
  score,
  showReference = false,
  className,
}: SegmentResultsProps) {
  const [showAnswer, setShowAnswer] = useState(showReference)

  const comparison = buildWordComparison(reference, score)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Accuracy banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
        <div
          className={cn(
            'text-3xl font-bold',
            score.accuracy >= 80 && 'text-green-600',
            score.accuracy >= 50 && score.accuracy < 80 && 'text-yellow-600',
            score.accuracy < 50 && 'text-red-600',
          )}
          aria-label={`Độ chính xác: ${Math.round(score.accuracy)}%`}
        >
          {Math.round(score.accuracy)}%
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-green-600">
              <Check size={14} /> {score.correctCount} đúng
            </span>
            <span className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle size={14} /> {score.missingCount} thiếu
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <X size={14} /> {score.wrongCount} thừa
            </span>
          </div>
          <span className="text-gray-400">{score.totalWords} từ / {score.correctCount + score.wrongCount + score.missingCount} tổng</span>
        </div>
      </div>

      {/* Word-by-word display */}
      <div
        className="flex flex-wrap gap-1.5 p-4 rounded-xl bg-white border border-gray-200"
        aria-label="So sánh từng từ"
        role="region"
        aria-live="polite"
      >
        {comparison.map((item, i) => (
          <WordBadge key={`${item.word}-${i}`} word={item.word} status={item.status} />
        ))}
      </div>

      {/* Show reference */}
      <button
        type="button"
        onClick={() => setShowAnswer((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        aria-expanded={showAnswer}
      >
        {showAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
        {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
      </button>

      {showAnswer && (
        <div
          className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900 font-mono"
          aria-label="Đoạn gốc"
        >
          {reference}
        </div>
      )}
    </div>
  )
}
