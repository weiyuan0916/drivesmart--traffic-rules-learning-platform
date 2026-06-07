import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  snapPoints?: ('25%' | '50%' | '75%' | '100%')[]
  defaultSnap?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0',
          'bg-white rounded-t-2xl shadow-2xl',
          'animate-in slide-in-from-bottom duration-300',
          'max-h-[90vh] overflow-y-auto',
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-border">
          {title && <h2 className="text-lg font-semibold text-dark">{title}</h2>}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-dark hover:bg-light transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
