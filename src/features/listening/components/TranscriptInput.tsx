// ============================================================
// TranscriptInput — VinaListen
// Dictation text input with word counter
// Backend validates max:1000 chars
// ============================================================

import { forwardRef, useId, useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'

interface TranscriptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  error?: string
  showResult?: boolean
  resultStatus?: 'correct' | 'wrong' | 'partial'
  className?: string
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
    },
    ref,
  ) => {
    const id = useId()

    const wordCount = countWords(value)

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Enforce 1000 char limit client-side for UX (backend also validates)
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
        // Prevent Tab from changing focus
        if (e.key === 'Tab') {
          e.preventDefault()
        }
      },
      [disabled, wordCount, onSubmit],
    )

    const borderColor = error
      ? 'border-error focus-visible:ring-error'
      : showResult && resultStatus
        ? resultStatus === 'correct'
          ? 'border-success'
          : resultStatus === 'wrong'
            ? 'border-error'
            : 'border-warning'
        : 'border-border hover:border-primary/50'

    const bgColor = showResult && resultStatus
      ? resultStatus === 'correct'
        ? 'bg-success/5'
        : resultStatus === 'wrong'
          ? 'bg-error/5'
          : 'bg-warning/5'
      : 'bg-white'

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <div className="relative">
          <textarea
            ref={ref}
            id={id}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type what you hear..."
            rows={4}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Dictation transcript input"
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={!!error}
            className={cn(
              'w-full rounded-lg border-2 px-4 py-3 text-base resize-none',
              'transition-colors duration-150',
              'placeholder:text-text-muted',
              'focus-visible:outline-none focus-visible:ring-0',
              borderColor,
              bgColor,
              disabled && 'opacity-50 cursor-not-allowed bg-light',
              'dark:bg-dark-surface dark:border-border-strong dark:text-text-primary',
              // Font size 16px prevents iOS auto-zoom
              'text-[16px]',
            )}
          />
        </div>

        {/* Footer: word count + clear */}
        <div className="flex justify-between items-center">
          {error ? (
            <p id={`${id}-error`} className="text-sm text-error" role="alert">
              {error}
            </p>
          ) : (
            <span className="text-sm text-text-muted" aria-live="polite">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          )}

          {value.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear input"
              className={cn(
                'flex items-center gap-1 text-sm text-text-muted',
                'hover:text-text-primary transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                'min-w-[44px] min-h-[44px] px-2',
              )}
            >
              <X size={14} aria-hidden="true" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Keyboard hint */}
        {!disabled && (
          <p className="text-xs text-text-muted">
            Press{' '}
            <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-light text-text-secondary font-mono text-[11px]">
              Ctrl + Enter
            </kbd>{' '}
            to check
          </p>
        )}
      </div>
    )
  },
)

TranscriptInput.displayName = 'TranscriptInput'
