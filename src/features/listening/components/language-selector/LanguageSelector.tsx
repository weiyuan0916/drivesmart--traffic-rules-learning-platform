// ============================================================
// LanguageSelector — VinaListen
// Renders language selection in 3 variants: button-group, dropdown, inline-selector
// ============================================================

import { Fragment, memo, useRef, useCallback, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import { SUPPORTED_LANGUAGES } from '../../constants/languages'
import type { LanguageCode, LanguageSelectorVariant } from '../../types/explanation'

interface LanguageSelectorProps {
  value: LanguageCode | null
  onChange: (code: LanguageCode) => void
  variant: LanguageSelectorVariant
  disabled?: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const BUTTON_SIZE = {
  sm: 'min-w-[36px] min-h-[36px] text-xs gap-1',
  md: 'min-w-[44px] min-h-[44px] text-sm gap-1.5',
  lg: 'min-w-[52px] min-h-[52px] text-base gap-2',
}

export const LanguageSelector = memo(function LanguageSelector({
  value,
  onChange,
  variant,
  disabled = false,
  showLabel = false,
  size = 'md',
  className,
}: LanguageSelectorProps) {
  if (variant === 'button-group') {
    return (
      <ButtonGroup
        value={value}
        onChange={onChange}
        disabled={disabled}
        showLabel={showLabel}
        size={size}
        className={className}
      />
    )
  }
  if (variant === 'dropdown') {
    return (
      <Dropdown
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={className}
      />
    )
  }
  // inline-selector
  return (
    <InlineSelector
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  )
})

// ---- Variant 1: Button Group ----

interface ButtonGroupProps {
  value: LanguageCode | null
  onChange: (code: LanguageCode) => void
  disabled: boolean
  showLabel: boolean
  size: 'sm' | 'md' | 'lg'
  className?: string
}

const ButtonGroup = memo(function ButtonGroup({
  value,
  onChange,
  disabled,
  showLabel,
  size,
  className,
}: ButtonGroupProps) {
  const activeRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = SUPPORTED_LANGUAGES.findIndex((l) => l.code === value)
      let nextIndex = currentIndex

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length
      } else {
        return
      }

      e.preventDefault()
      onChange(SUPPORTED_LANGUAGES[nextIndex].code)
    },
    [value, onChange],
  )

  return (
    <div
      role="radiogroup"
      aria-label="Explanation language"
      className={cn('flex flex-wrap gap-2', className)}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = lang.code === value
        return (
          <button
            key={lang.code}
            ref={isActive ? activeRef : undefined}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`Explanation language: ${lang.displayName}`}
            disabled={disabled}
            onClick={() => onChange(lang.code)}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex flex-col items-center justify-center rounded-lg font-semibold transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'active:scale-[0.97]',
              BUTTON_SIZE[size],
              isActive
                ? 'bg-primary text-white'
                : 'bg-transparent text-text-secondary hover:bg-light border border-border',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {showLabel && (
              <span className="text-[10px] leading-none mt-0.5">{lang.displayName}</span>
            )}
          </button>
        )
      })}
    </div>
  )
})

// ---- Variant 2: Dropdown ----

interface DropdownProps {
  value: LanguageCode | null
  onChange: (code: LanguageCode) => void
  disabled: boolean
  className?: string
}

const Dropdown = memo(function Dropdown({
  value,
  onChange,
  disabled,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === value) ?? SUPPORTED_LANGUAGES[0]
  const listRef = useRef<HTMLUListElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    },
    [],
  )

  return (
    <div className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'dict-glass flex items-center gap-2 px-3 rounded-[var(--dict-radius-md)]',
          'text-[var(--dict-text-primary)] font-medium text-sm',
          'transition-all duration-200',
          'hover:bg-[var(--dict-surface-hover)] active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dict-accent-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dict-bg)]',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          isOpen && 'ring-1 ring-[var(--dict-accent-blue)]/40 bg-[var(--dict-surface-hover)]',
        )}
        style={{ minHeight: '44px', minWidth: '200px' }}
      >
        {/* Flag */}
        <span className="flex-1 text-sm leading-none truncate text-left">
          English - {activeLang.displayName}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={16}
          className={cn(
            'flex-shrink-0 transition-transform duration-200',
            isOpen ? 'rotate-180' : '',
          )}
          style={{ color: 'var(--dict-text-muted)' }}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <ul
            ref={listRef}
            role="listbox"
            aria-label="Language options"
            onKeyDown={handleKeyDown}
            className={cn(
              'absolute top-full left-0 mt-2 z-20 w-full',
              'dict-glass rounded-[var(--dict-radius-lg)] overflow-hidden',
              'shadow-[var(--dict-glow-blue)]',
              'max-h-[320px] overflow-y-auto dict-scrollbar',
            )}
          >
            {SUPPORTED_LANGUAGES.map((lang, idx) => {
              const isActive = lang.code === value
              return (
                <Fragment key={lang.code}>
                  <li>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        onChange(lang.code)
                        setIsOpen(false)
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3',
                        'text-sm transition-all duration-150',
                        'focus-visible:outline-none focus-visible:bg-[var(--dict-surface-hover)]',
                        isActive
                          ? 'text-[var(--dict-accent-blue)] bg-[var(--dict-accent-blue-dim)]'
                          : 'text-[var(--dict-text-primary)] hover:bg-[var(--dict-surface-hover)]',
                      )}
                      style={{ height: '44px' }}
                    >
                      {/* Flag */}
                      <span className="flex-1 text-left leading-tight">
                        English - {lang.displayName}
                      </span>

                      {/* Active check */}
                      {isActive && (
                        <CheckIcon className="flex-shrink-0" />
                      )}
                    </button>
                  </li>

                  {/* Separator after each item except the last */}
                  {idx < SUPPORTED_LANGUAGES.length - 1 && (
                    <li aria-hidden="true">
                      <div
                        className="mx-3"
                        style={{ height: '1px', background: 'var(--dict-border-subtle)' }}
                      />
                    </li>
                  )}
                </Fragment>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
})

// ---- Small inline check icon ----
const CheckIcon = memo(function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2.5 7L5.5 10L11.5 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

// ---- Variant 3: Inline Selector ----

interface InlineSelectorProps {
  value: LanguageCode | null
  onChange: (code: LanguageCode) => void
  disabled: boolean
  className?: string
}

const InlineSelector = memo(function InlineSelector({
  value,
  onChange,
  disabled,
  className,
}: InlineSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === value) ?? SUPPORTED_LANGUAGES[0]

  return (
    <div className={cn('relative inline-flex', className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Explanation language"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm',
          'border border-border hover:bg-light transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'min-h-[36px]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="text-text-primary font-medium">English - {activeLang.displayName}</span>
        <ChevronDown size={14} className="text-text-secondary" aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            className={cn(
              'absolute top-full left-0 mt-1 z-20 rounded-lg border border-border',
              'bg-bg-primary shadow-lg py-1 min-w-[160px]',
            )}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={lang.code === value}
                  onClick={() => {
                    onChange(lang.code)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm',
                    'hover:bg-light',
                    lang.code === value ? 'text-primary font-semibold' : 'text-text-primary',
                  )}
                >
                  <span>English - {lang.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
})