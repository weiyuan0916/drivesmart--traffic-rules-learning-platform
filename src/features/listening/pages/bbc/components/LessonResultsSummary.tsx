// ============================================================
// LessonResultsSummary — VinaListen
// Final results screen with count-up animation
// ============================================================

import { useState } from 'react'
import { RotateCcw, ArrowRight, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../../lib/utils'
import { Button } from '../../../components/ui/Button'
import type { BbcDictationSummary } from '../../../types/bbc'

interface LessonResultsSummaryProps {
  summary: BbcDictationSummary
  lessonTitle: string
  onRetry: () => void
  onNextEpisode?: () => void
  sourceUrl?: string | null
  className?: string
}

function AccuracyRing({ accuracy }: { accuracy: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (accuracy / 100) * circumference
  const color = accuracy >= 80 ? '#00BE7C' : accuracy >= 50 ? '#F59E0B' : '#FF3257'

  return (
    <div className="relative flex items-center justify-center" aria-label={`Độ chính xác: ${Math.round(accuracy)}%`}>
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold text-gray-900"
        >
          {Math.round(accuracy)}%
        </motion.span>
        <span className="text-xs text-gray-500">độ chính xác</span>
      </div>
    </div>
  )
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s} giây`
  return `${m} phút ${s} giây`
}

export function LessonResultsSummary({
  summary,
  lessonTitle,
  onRetry,
  onNextEpisode,
  sourceUrl,
  className,
}: LessonResultsSummaryProps) {
  const [mistakesExpanded, setMistakesExpanded] = useState(false)

  const allMistakes = summary.segmentScores.flatMap((score, i) => [
    ...score.missing.map((w) => ({ word: w, type: 'Thiếu' as const, segment: i })),
    ...score.wrong.map((w) => ({ word: w, type: 'Thừa' as const, segment: i })),
  ])

  const accuracy = summary.overallAccuracy
  const isPass = accuracy >= 80
  const colorClass = isPass ? 'text-green-600' : accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{lessonTitle}</h2>
        <p className="text-sm text-gray-500">Kết quả luyện nghe chép</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
        <AccuracyRing accuracy={accuracy} />
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Đoạn hoàn thành</span>
              <p className="font-semibold text-gray-900">{summary.segmentsCompleted}</p>
            </div>
            <div>
              <span className="text-gray-500">Độ chính xác</span>
              <p className={cn('font-bold', colorClass)}>{Math.round(accuracy)}%</p>
            </div>
            <div>
              <span className="text-gray-500">Thời gian</span>
              <p className="font-semibold text-gray-900">{formatDuration(summary.totalTimeMs)}</p>
            </div>
            <div>
              <span className="text-gray-500">Từ đúng</span>
              <p className="font-semibold text-green-600">
                {summary.segmentScores.reduce((sum, s) => sum + s.correctCount, 0)} từ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 justify-center">
        {summary.segmentScores.map((score, i) => (
          <div
            key={i}
            className={cn(
              'w-8 h-8 rounded text-xs font-medium flex items-center justify-center',
              score.accuracy >= 80 && 'bg-green-100 text-green-700',
              score.accuracy >= 50 && score.accuracy < 80 && 'bg-yellow-100 text-yellow-700',
              score.accuracy < 50 && 'bg-red-100 text-red-700',
            )}
            title={`Đoạn ${i + 1}: ${Math.round(score.accuracy)}%`}
            aria-label={`Đoạn ${i + 1}: ${Math.round(score.accuracy)}%`}
          >
            {Math.round(score.accuracy)}
          </div>
        ))}
      </div>

      {allMistakes.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setMistakesExpanded((v) => !v)}
            className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            aria-expanded={mistakesExpanded}
          >
            <span>Xem lỗi sai ({allMistakes.length} từ)</span>
            {mistakesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {mistakesExpanded && (
            <div className="p-3 bg-gray-50 flex flex-wrap gap-1.5">
              {allMistakes.map((m, i) => (
                <span
                  key={i}
                  title={`Đoạn ${m.segment + 1}`}
                  className={cn(
                    'text-xs px-2 py-1 rounded-full border',
                    m.type === 'Thiếu' && 'border-yellow-200 bg-yellow-50 text-yellow-700',
                    m.type === 'Thừa' && 'border-red-200 bg-red-50 text-red-700',
                  )}
                >
                  {m.word} ({m.type})
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onRetry} variant="secondary" size="lg" className="flex-1 gap-2">
          <RotateCcw size={18} />
          Học lại bài này
        </Button>
        {onNextEpisode && (
          <Button onClick={onNextEpisode} size="lg" className="flex-1 gap-2">
            Bài tiếp theo
            <ArrowRight size={18} />
          </Button>
        )}
        {sourceUrl && (
          <Button
            variant="ghost"
            size="lg"
            onClick={() => window.open(sourceUrl, '_blank')}
            className="flex-1 gap-2"
          >
            <ExternalLink size={18} />
            Mở transcript BBC
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        Transcript: BBC Learning English — Used for educational purposes only.
      </p>
    </div>
  )
}
