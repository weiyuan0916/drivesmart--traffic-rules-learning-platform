import { useEffect, useRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        className,
      )}
      style={{
        width: width ?? (variant === 'circular' ? height ?? 40 : '100%'),
        height: height ?? (variant === 'text' ? 16 : 40),
        ...style,
      }}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-white p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={120} />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  )
}

export function SkeletonLessonCard() {
  return (
    <div className="rounded-xl border border-border bg-white p-4 space-y-3">
      <Skeleton variant="text" width="70%" height={20} />
      <Skeleton variant="text" width="50%" />
      <div className="flex items-center gap-2">
        <Skeleton variant="rectangular" width={60} height={24} />
        <Skeleton variant="rectangular" width={60} height={24} />
      </div>
    </div>
  )
}

export function SkeletonTopicCard() {
  return (
    <div className="rounded-xl border border-border bg-white p-5 space-y-3">
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="rectangular" height={80} />
    </div>
  )
}
