import { cn } from '../../lib/utils'
import { Button } from './Button'
import { Search } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-dark mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          {description}
        </p>
      )}
      {action && (
        <div className="flex gap-3">
          <Button onClick={action.onClick}>{action.label}</Button>
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search size={48} className="opacity-30" />}
      title="Không tìm thấy kết quả"
      description={`Không có kết quả nào cho "${query}". Thử từ khóa khác.`}
    />
  )
}

export function NoLessons() {
  return (
    <EmptyState
      icon={<Search size={48} className="opacity-30" />}
      title="Chưa có bài học"
      description="Danh mục này hiện chưa có bài học nào. Quay lại sau nhé!"
    />
  )
}

export function NoHistory() {
  return (
    <EmptyState
      title="Chưa có lịch sử học tập"
      description="Hoàn thành bài học đầu tiên để bắt đầu theo dõi tiến độ của bạn."
    />
  )
}
