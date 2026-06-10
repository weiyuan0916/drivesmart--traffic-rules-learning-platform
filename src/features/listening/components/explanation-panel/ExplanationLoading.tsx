// ============================================================
// ExplanationLoading — VinaListen
// Skeleton loading state for explanation panel
// ============================================================

import { memo } from 'react'
import { cn } from '../../lib/utils'

interface ExplanationLoadingProps {
  className?: string
}

export const ExplanationLoading = memo(function ExplanationLoading({
  className,
}: ExplanationLoadingProps) {
  return (
    <div
      role="status"
      aria-label="Đang tải giải thích..."
      aria-busy="true"
      className={cn('flex flex-col gap-3 p-4', className)}
    >
      {/* Header skeleton */}
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-lg bg-light animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Body skeleton */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 rounded bg-light animate-pulse',
              i === 3 ? 'w-3/4' : 'w-full',
            )}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Vocabulary skeleton */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-24 h-4 rounded bg-light animate-pulse" aria-hidden="true" />
            <div className="w-16 h-4 rounded bg-light animate-pulse" aria-hidden="true" />
          </div>
        ))}
      </div>

      <span className="sr-only">Đang tải giải thích...</span>
    </div>
  )
})