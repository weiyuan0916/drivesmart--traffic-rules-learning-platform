// ============================================================
// MicroLessonProgress — VinaListen
// Horizontal progress bar with segment indicators
// ============================================================

import { cn } from '../../../lib/utils'

interface SegmentScore {
  accuracy: number
}

interface MicroLessonProgressProps {
  current: number
  total: number
  scores: SegmentScore[]
  onJumpTo?: (index: number) => void
  className?: string
}

function accuracyColor(accuracy: number): string {
  if (accuracy >= 80) return 'bg-green-500'
  if (accuracy >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function MicroLessonProgress({
  current,
  total,
  scores,
  onJumpTo,
  className,
}: MicroLessonProgressProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Đoạn {current + 1} / {total}
        </span>
        <span>
          {scores.length} đã hoàn thành
        </span>
      </div>
      <div className="flex gap-1.5" role="list" aria-label="Tiến trình bài học">
        {Array.from({ length: total }).map((_, i) => {
          const score = scores[i]
          const isCompleted = score !== undefined
          const isCurrent = i === current
          const isPending = !isCompleted && !isCurrent

          let dotClass = 'bg-gray-200'
          if (isCompleted) dotClass = accuracyColor(score.accuracy)
          if (isCurrent) dotClass = 'bg-[#35375B] ring-2 ring-[#35375B] ring-offset-1'

          return (
            <button
              key={i}
              role="listitem"
              aria-label={`Đoạn ${i + 1}${isCompleted ? ` — ${Math.round(score.accuracy)}%` : isCurrent ? ' — hiện tại' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => onJumpTo && onJumpTo(i)}
              disabled={!onJumpTo}
              className={cn(
                'h-2.5 flex-1 rounded-full transition-all duration-200 min-w-[24px]',
                dotClass,
                isCurrent && 'animate-pulse',
                onJumpTo && 'cursor-pointer hover:opacity-75',
                !onJumpTo && 'cursor-default',
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
