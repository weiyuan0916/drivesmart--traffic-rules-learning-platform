import type { ComponentProps } from 'react';

interface SmoothScrollProps extends ComponentProps<'div'> {
  children: React.ReactNode;
}

export function SmoothScroll({ children, className = '', ...rest }: SmoothScrollProps) {
  return (
    <div
      className={`flex-1 min-h-0 flex flex-col ${className}`.trim()}
      style={{ overflowY: 'auto' }}
      {...rest}
    >
      {children}
    </div>
  );
}
