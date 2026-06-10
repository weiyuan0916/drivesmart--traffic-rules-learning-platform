// ============================================================
// ExplanationError — VinaListen
// Error state for failed explanation loads
// ============================================================

import { memo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getLanguageByCode } from '../../constants/languages'
import type { LanguageCode } from '../../types/explanation'

interface ExplanationErrorProps {
  language: LanguageCode
  message?: string
  onRetry: () => void
  onFallback?: () => void
  className?: string
}

export const ExplanationError = memo(function ExplanationError({
  language,
  message,
  onRetry,
  onFallback,
  className,
}: ExplanationErrorProps) {
  const langInfo = getLanguageByCode(language)

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn('flex flex-col gap-3 p-4 rounded-lg bg-error/5 border border-error/20', className)}
    >
      <div className="flex items-start gap-2">
        <AlertCircle size={18} className="text-error mt-0.5 shrink-0" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-error">
            Không thể tải giải thích bằng {langInfo.name}
          </p>
          {message && (
            <p className="text-xs text-text-muted">
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
            'border border-border text-primary',
            'hover:bg-light active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            'min-h-[36px]',
          )}
        >
          <RefreshCw size={14} aria-hidden="true" />
          Thử lại
        </button>

        {onFallback && language !== 'vi' && (
          <button
            type="button"
            onClick={onFallback}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-primary text-white',
              'hover:bg-primary-dark active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'min-h-[36px]',
            )}
          >
            🇻🇳 Dùng Tiếng Việt
          </button>
        )}
      </div>
    </div>
  )
})