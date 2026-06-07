import { useEffect, useRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full mx-4',
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, closeOnEscape])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full rounded-2xl bg-white shadow-2xl',
          'animate-in zoom-in-95 fade-in duration-200',
          'max-h-[90vh] overflow-y-auto',
          sizeStyles[size],
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 pb-0">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-dark">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-dark hover:bg-light transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
