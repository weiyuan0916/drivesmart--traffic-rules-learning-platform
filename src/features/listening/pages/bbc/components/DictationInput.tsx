// ============================================================
// DictationInput — VinaListen
// Textarea for dictation with submit and keyboard shortcuts
// ============================================================

import { useRef, useEffect } from 'react'
import { SendHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../../../lib/utils'
import { Button } from '../../../components/ui/Button'

interface DictationInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  isLoading?: boolean
  hasChecked?: boolean
  className?: string
}

export function DictationInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isLoading = false,
  hasChecked = false,
  className,
}: DictationInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus on mount and after checking
  useEffect(() => {
    if (!disabled && !hasChecked && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [disabled, hasChecked])

  // Ctrl+Enter / Cmd+Enter submits
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (value.trim() && !disabled && !isLoading) {
        onSubmit()
      }
    }
  }

  const handleSubmit = () => {
    if (!value.trim() && !isLoading) {
      // Trigger shake animation by briefly toggling a class
      textareaRef.current?.classList.add('animate-shake')
      setTimeout(() => textareaRef.current?.classList.remove('animate-shake'), 500)
      return
    }
    onSubmit()
  }

  const isEmpty = !value.trim()

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder="Nhập những gì bạn nghe được..."
          rows={6}
          className={cn(
            'w-full resize-none rounded-xl border bg-white px-4 py-3 font-mono text-base text-gray-800',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-[#35375B] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-shadow duration-150',
          )}
          aria-label="Nhập transcript"
          aria-describedby="dictation-hint"
        />

        <AnimatePresence>
          {isEmpty && !isLoading && !hasChecked && (
            <motion.p
              id="dictation-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-3 right-3 text-xs text-gray-400"
            >
              Ctrl+Enter để kiểm tra
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={disabled || isLoading}
        className={cn(
          'w-full sm:w-auto sm:self-end gap-2',
          isLoading && 'opacity-70',
        )}
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Đang kiểm tra...
          </span>
        ) : (
          <>
            <SendHorizontal size={18} />
            Kiểm tra
          </>
        )}
      </Button>
    </div>
  )
}
