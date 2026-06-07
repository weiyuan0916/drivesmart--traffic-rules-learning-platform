import { cn } from '../../lib/utils'

type SpinnerSize = 'sm' | 'md' | 'lg'

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-3',
}

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full border-muted-foreground border-t-transparent',
        sizeStyles[size],
        className,
      )}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <Spinner size="lg" />
      <p className="text-muted-foreground text-sm">Đang tải...</p>
    </div>
  )
}
