// ============================================================
// ProgressDots — VinaListen
// Horizontal timeline clip progress indicator
// ○ = not started  ◐ = in progress  ● = completed  ✕ = failed
// ============================================================

import { memo, useRef, useEffect } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const currentRef = useRef<HTMLButtonElement>(null)

  // Auto-scroll to keep current dot visible
  useEffect(() => {
    if (currentRef.current && containerRef.current) {
      const container = containerRef.current
      const dot = currentRef.current
      const containerRect = container.getBoundingClientRect()
      const dotRect = dot.getBoundingClientRect()

      // Check if dot is outside visible area
      if (dotRect.left < containerRect.left || dotRect.right > containerRect.right) {
        dot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [current])

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-1 py-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Câu ${current + 1} trong ${total}`}
    >
      {/* Progress line background */}
      <div className="absolute left-4 right-4 h-0.5 bg-border dark:bg-border-strong rounded-full pointer-events-none" />
      
      {Array.from({ length: total }, (_, i) => {
        const status = statuses[i] ?? 'not_started'
        const isCurrent = i === current
        const isAccessible = onClipSelect !== undefined && status !== 'not_started'
        const isClickable = onClipSelect !== undefined

        return (
          <button
            key={i}
            ref={isCurrent ? currentRef : null}
            type="button"
            onClick={() => isClickable ? onClipSelect?.(i) : undefined}
            disabled={!isClickable}
            aria-label={
              isAccessible
                ? `Câu ${i + 1}: ${status === 'completed' ? 'Đã hoàn thành' : status === 'failed' ? 'Chưa đạt' : 'Đang làm'}`
                : `Câu ${i + 1}`
            }
            className={cn(
              'relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center',
              'text-sm md:text-base font-semibold transition-all duration-200 snap-center',
              // Default
              'bg-white dark:bg-dark-surface border-2 border-border dark:border-border-strong',
              'text-text-secondary dark:text-text-secondary',
              // Current
              isCurrent && 'bg-primary dark:bg-primary text-white border-2 border-primary dark:border-primary scale-110 shadow-lg shadow-primary/30',
              // Completed
              !isCurrent && status === 'completed' && 'bg-success dark:bg-success text-white border-2 border-success dark:border-success',
              // Failed
              !isCurrent && status === 'failed' && 'bg-error dark:bg-error text-white border-2 border-error dark:border-error',
              // In progress
              !isCurrent && status === 'in_progress' && 'bg-warning dark:bg-warning text-white border-2 border-warning dark:border-warning',
              // Clickable
              isClickable && !isCurrent && 'cursor-pointer hover:scale-105 active:scale-95',
              !isClickable && 'cursor-default',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            )}
          >
            {/* Status icon */}
            {status === 'completed' && (
              <span className="text-white" aria-hidden="true">✓</span>
            )}
            {status === 'failed' && (
              <span className="text-white" aria-hidden="true">✗</span>
            )}
            {status === 'in_progress' && (
              <span className="text-white" aria-hidden="true">◐</span>
            )}
            {status === 'not_started' && (
              <span aria-hidden="true">{i + 1}</span>
            )}
            
            {/* Active ring animation */}
            {isCurrent && (
              <span 
                className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary"
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}
    </div>
  )
})
