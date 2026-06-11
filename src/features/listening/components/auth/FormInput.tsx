import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightElement?: ReactNode
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(
    { label, error, hint, leftIcon, rightElement, id, className = '', ...props },
    ref
  ) {
    const [focused, setFocused] = useState(false)
    const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
          {props.required && (
            <span className="text-[var(--error)] ml-0.5" aria-hidden="true">*</span>
          )}
        </label>

        <div
          className={`
            relative flex items-center rounded-xl border transition-all duration-200
            bg-[var(--bg-primary)]
            ${error
              ? 'border-[var(--error)] ring-1 ring-[var(--error)]/30'
              : focused
                ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/30'
                : 'border-[var(--border)] hover:border-[var(--border-strong)]'}
            focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]/30
          `}
        >
          {leftIcon && (
            <span className="pl-4 text-[var(--text-muted)] flex-shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              flex-1 bg-transparent px-4 py-3 text-sm text-[var(--text-primary)]
              placeholder:text-[var(--text-muted)]
              focus:outline-none focus:ring-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${leftIcon ? '' : 'pl-4'}
              ${rightElement ? 'pr-4' : 'pr-4'}
              ${className}
            `}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {rightElement && (
            <span className="pr-4 flex-shrink-0">{rightElement}</span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-[var(--error)] flex items-center gap-1"
            role="alert"
          >
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-[var(--text-muted)]">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
