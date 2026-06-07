import { cn } from '../../lib/utils'
import { Button } from './Button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Đã xảy ra lỗi',
  message = 'Đã có lỗi xảy ra. Vui lòng thử lại.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className,
      )}
    >
      <AlertCircle size={48} className="text-error mb-4" />
      <h3 className="text-lg font-semibold text-dark mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          leftIcon={<RefreshCw size={16} />}
        >
          Thử lại
        </Button>
      )}
    </div>
  )
}
