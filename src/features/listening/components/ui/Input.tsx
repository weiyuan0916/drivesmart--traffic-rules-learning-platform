import { forwardRef, type InputHTMLAttributes, useId } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id: propId, ...props }, ref) => {
    const generatedId = useId()
    const id = propId ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-dark">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-base',
              'transition-colors duration-150',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-error focus-visible:ring-error'
                : 'border-border hover:border-primary/50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${id}-error`} className="text-sm text-error">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
