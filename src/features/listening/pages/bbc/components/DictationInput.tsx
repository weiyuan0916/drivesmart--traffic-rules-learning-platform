// ============================================================
// DictationInput — VinaListen
// Textarea for dictation with submit and keyboard shortcuts
// ============================================================

import { useRef, useEffect } from 'react'
import { SendHorizontal, Clock } from 'lucide-react'
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
  elapsedMs?: number
  showHint?: boolean
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function DictationInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isLoading = false,
  hasChecked = false,
  className,
  elapsedMs = 0,
  showHint = true,
}: DictationInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus on mount and after checking (always focus when not disabled)
  useEffect(() => {
    if (!disabled && textareaRef.current) {
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
    // R key to replay - handled by parent
    if (e.key === 'r' || e.key === 'R') {
      // Allow parent to handle replay shortcut
      const event = new CustomEvent('dictation-replay')
      window.dispatchEvent(event)
    }
  }

  const handleSubmit = () => {
    if (!value.trim() && !isLoading && !hasChecked) {
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
          {isEmpty && !isLoading && !hasChecked && showHint && (
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
          {!isEmpty && !isLoading && hasChecked && showHint && (
            <motion.p
              id="dictation-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-3 right-3 text-xs text-green-500"
            >
              Sửa và kiểm tra lại
            </motion.p>
          )}
        </AnimatePresence>

        {/* Timer display */}
        <AnimatePresence>
          {elapsedMs > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-[#35375B]/10 rounded-full text-xs font-medium text-[#35375B]"
            >
              <Clock size={12} className="shrink-0" />
              <span className="font-mono tabular-nums">{formatTime(elapsedMs)}</span>
            </motion.div>
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
