// ============================================================
// ProgressDots — VinaListen
// Visual clip progress indicator
// ○ = not attempted  ● = current  ◉ = completed  ✗ = failed
// ============================================================

import { memo } from 'react'
import { cn } from '../lib/utils'
import type { ClipStatus } from '../types/lesson'

interface ProgressDotsProps {
  total: number
  current: number
  statuses: Record<number, ClipStatus>
  onClipSelect?: (index: number) => void
}

export const ProgressDots = memo(function ProgressDots({
  total,
  current,
  statuses,
  onClipSelect,
}: ProgressDotsProps) {
  return (
    <div
      className="flex items-center justify-center gap-2 py-3"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Clip ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const status = statuses[i] ?? 'not_started'
        const isCurrent = i === current
        const isAccessible = onClipSelect !== undefined && status !== 'not_started'

        let dotClass = 'w-2.5 h-2.5 rounded-full transition-all duration-200'

        if (isCurrent) {
          dotClass = cn(dotClass, 'bg-primary w-3 h-3 ring-2 ring-primary/30')
        } else if (status === 'completed') {
          dotClass = cn(dotClass, 'bg-success')
        } else if (status === 'failed') {
          dotClass = cn(dotClass, 'bg-error')
        } else if (status === 'in_progress') {
          dotClass = cn(dotClass, 'bg-warning')
        } else {
          dotClass = cn(dotClass, 'bg-border')
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => isAccessible ? onClipSelect?.(i) : undefined}
            disabled={!isAccessible}
            aria-label={
              isAccessible
                ? `Clip ${i + 1}: ${status}`
                : `Clip ${i + 1}`
            }
            className={cn(
              dotClass,
              isAccessible && 'cursor-pointer hover:scale-125',
              !isAccessible && 'cursor-default',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
            )}
          />
        )
      })}
    </div>
  )
})
