import { forwardRef, type TextareaHTMLAttributes, useId, useState, useEffect } from 'react'
import { cn } from '../../lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  showWordCount?: boolean
  maxWords?: number
  autoGrow?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showWordCount = false,
      maxWords,
      autoGrow = false,
      className,
      value,
      id: propId,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const id = propId ?? generatedId
    const [wordCount, setWordCount] = useState(0)

    useEffect(() => {
      if (typeof value === 'string') {
        const words = value.trim().split(/\s+/).filter(Boolean).length
        setWordCount(words)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoGrow) {
        const target = e.target
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
      }
      onChange?.(e)
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-dark">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={handleChange}
          className={cn(
            'flex min-h-[120px] w-full rounded-lg border bg-white px-3 py-2.5 text-base',
            'transition-colors duration-150 resize-none',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-error focus-visible:ring-error'
              : 'border-border hover:border-primary/50',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        <div className="flex justify-between items-center">
          <div>
            {error && (
              <p id={`${id}-error`} className="text-sm text-error">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={`${id}-helper`} className="text-sm text-muted-foreground">
                {helperText}
              </p>
            )}
          </div>
          {showWordCount && (
            <p
              className={cn(
                'text-sm text-muted-foreground',
                maxWords && wordCount > maxWords && 'text-warning',
              )}
            >
              {wordCount}
              {maxWords && ` / ${maxWords}`} words
            </p>
          )}
        </div>
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
