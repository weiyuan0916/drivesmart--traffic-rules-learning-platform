import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] disabled:bg-primary/50',
  secondary:
    'bg-light text-dark border border-border hover:bg-cream active:scale-[0.98] disabled:opacity-50',
  ghost:
    'bg-transparent text-primary hover:bg-light active:scale-[0.98] disabled:opacity-50',
  destructive:
    'bg-error text-white hover:bg-error/90 active:scale-[0.98] disabled:bg-error/50',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-md min-w-[44px]',
  md: 'h-11 px-5 text-base gap-2 rounded-lg min-w-[44px]',
  lg: 'h-13 px-7 text-lg gap-2.5 rounded-lg min-w-[44px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-semibold',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  },
)

Button.displayName = 'Button'
