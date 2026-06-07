import { cn } from '../../lib/utils'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
}

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl',
        variant === 'default' && 'bg-white border border-border shadow-sm',
        variant === 'outlined' && 'bg-white border border-border',
        variant === 'elevated' && 'bg-white shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 pb-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 pt-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 pt-3 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  )
}
