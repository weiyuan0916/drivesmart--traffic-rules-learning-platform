import { useEffect } from 'react'
import { cn } from '../../lib/utils'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import type { Toast as ToastType } from '../../stores/uiStore'
import { useUIStore } from '../../stores/uiStore'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'bg-success/10 border-success text-success',
  error: 'bg-error/10 border-error text-error',
  warning: 'bg-warning/10 border-warning text-warning',
  info: 'bg-primary/10 border-primary text-primary',
}

interface ToastItemProps {
  toast: ToastType
}

function ToastItem({ toast }: ToastItemProps) {
  const removeToast = useUIStore((s) => s.removeToast)
  const Icon = icons[toast.type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg',
        'animate-in slide-in-from-right fade-in duration-300',
        styles[toast.type],
      )}
      role="alert"
    >
      <Icon size={20} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-dark">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-sm text-muted-foreground">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
