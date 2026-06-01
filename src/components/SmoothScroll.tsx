import type { ComponentProps } from 'react';

interface SmoothScrollProps extends ComponentProps<'div'> {
  children: React.ReactNode;
}

export function SmoothScroll({ 
  children, 
  className = '', 
  ...rest 
}: SmoothScrollProps) {
  return (
    <div
      className={`flex-1 overflow-y-auto ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
