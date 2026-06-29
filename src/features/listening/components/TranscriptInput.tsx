// ============================================================
// TranscriptInput — VinaListen
// Premium dictation input with dark theme support
// ============================================================

import { forwardRef, useId, useCallback } from 'react'
import { X, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'

interface TranscriptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  error?: string | null
  showResult?: boolean
  resultStatus?: 'correct' | 'wrong' | 'partial'
  className?: string
  isChecking?: boolean
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export const TranscriptInput = forwardRef<HTMLTextAreaElement, TranscriptInputProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      disabled = false,
      error,
      showResult = false,
      resultStatus,
      className,
      isChecking = false,
    },
    ref,
  ) => {
    const id = useId()

    const wordCount = countWords(value)

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value.slice(0, 1000)
        onChange(text)
      },
      [onChange],
    )

    const handleClear = useCallback(() => {
      onChange('')
    }, [onChange])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault()
          if (!disabled && wordCount > 0) {
            onSubmit()
          }
        }
        if (e.key === 'Tab') {
          e.preventDefault()
        }
      },
      [disabled, wordCount, onSubmit],
    )

    const borderColor = error
      ? 'border-error focus:border-error'
      : showResult && resultStatus
        ? resultStatus === 'correct'
          ? 'border-success'
          : resultStatus === 'wrong'
            ? 'border-error'
            : 'border-warning'
        : 'border-border dark:border-border-strong hover:border-primary/50 focus:border-primary'

    const bgColor = showResult && resultStatus
      ? resultStatus === 'correct'
        ? 'bg-success/5 dark:bg-success/10'
        : resultStatus === 'wrong'
          ? 'bg-error/5 dark:bg-error/10'
          : 'bg-warning/5 dark:bg-warning/10'
      : 'bg-white dark:bg-dark-surface'

    const isDisabled = disabled || isChecking

    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {/* Header with icon */}
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" style={{ color: 'var(--accent)' }} aria-hidden="true" />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Nhập những gì bạn nghe được
          </h3>
        </div>

        {/* Textarea container */}
        <div className="relative">
          <textarea
            ref={ref}
            id={id}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder="Nghe cẩn thận và nhập vào đây..."
            rows={6}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Dictation transcript input"
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={!!error}
            className={cn(
              'w-full min-h-[180px] md:min-h-[220px] rounded-2xl border-2 px-4 py-4 text-base resize-none',
              'transition-all duration-200',
              'placeholder:text-text-muted dark:placeholder:text-text-muted/70',
              'focus:outline-none focus:ring-4 focus:ring-primary/10',
              borderColor,
              bgColor,
              isDisabled && 'opacity-60 cursor-not-allowed',
              'dark:bg-dark-surface dark:text-white dark:border-border-strong',
              'text-[16px]',
            )}
          />
        </div>

        {/* Footer: word count + clear */}
        <div className="flex justify-between items-center px-1">
          {error ? (
            <p id={`${id}-error`} className="text-sm text-error" role="alert">
              {error}
            </p>
          ) : (
            <span className="text-sm text-text-muted" aria-live="polite">
              {wordCount} từ
            </span>
          )}

          {value.length > 0 && !isDisabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Xóa nội dung"
              className={cn(
                'flex items-center gap-1.5 text-sm text-text-muted',
                'hover:text-text-primary dark:hover:text-white',
                'transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                'min-w-[44px] min-h-[44px] px-2',
              )}
            >
              <X size={14} aria-hidden="true" />
              <span>Xóa</span>
            </button>
          )}
        </div>

        {/* Keyboard hint */}
        {!isDisabled && (
          <p className="text-xs text-text-muted text-center">
            Nhấn{' '}
            <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-bg-tertiary dark:bg-dark text-text-secondary dark:text-text-secondary font-mono text-[11px] border border-border dark:border-border-strong">
              Ctrl + Enter
            </kbd>{' '}
            để kiểm tra
          </p>
        )}
      </div>
    )
  },
)

TranscriptInput.displayName = 'TranscriptInput'
