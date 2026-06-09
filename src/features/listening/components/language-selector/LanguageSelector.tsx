// ============================================================
// LanguageSelector — VinaListen
// Renders language selection in 3 variants: button-group, dropdown, inline-selector
// ============================================================

import { memo, useRef, useCallback, useState } from 'react'
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
            aria-label={`Explanation language: ${lang.nativeName}`}
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
            <span className="text-base leading-none" aria-hidden="true">
              {lang.flag}
            </span>
            {showLabel && (
              <span className="text-[10px] leading-none mt-0.5">{lang.code.toUpperCase()}</span>
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

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select explanation language"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-bg-primary',
          'hover:bg-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'min-h-[44px] min-w-[200px]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="text-base">{activeLang.flag}</span>
        <span className="flex-1 text-sm text-text-primary">{activeLang.nativeName}</span>
        <ChevronDown
          size={16}
          className={cn('text-text-secondary transition-transform', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
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
            aria-label="Language options"
            className={cn(
              'absolute top-full left-0 mt-1 z-20 w-full rounded-lg border border-border',
              'bg-bg-primary shadow-lg py-1 max-h-[300px] overflow-auto',
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
                    'w-full flex items-center gap-2 px-3 py-2.5 text-sm',
                    'hover:bg-light transition-colors',
                    'focus-visible:outline-none focus-visible:bg-light',
                    lang.code === value ? 'text-primary font-semibold' : 'text-text-primary',
                  )}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  {lang.name !== lang.nativeName && (
                    <span className="ml-auto text-xs text-text-muted">{lang.name}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
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
        <span className="text-sm">{activeLang.flag}</span>
        <span className="text-text-primary font-medium">{activeLang.nativeName}</span>
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
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  {lang.name !== lang.nativeName && (
                    <span className="ml-auto text-xs text-text-muted">{lang.name}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
})