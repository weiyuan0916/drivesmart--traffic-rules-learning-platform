import { ReactLenis } from 'lenis/react';
import type { ComponentProps } from 'react';

const defaultOptions: NonNullable<ComponentProps<typeof ReactLenis>['options']> = {
  lerp: 0.1,
  smoothWheel: true,
  syncTouch: true,
  allowNestedScroll: true,
};

export function SmoothScroll({ options, className = '', ...rest }: ComponentProps<typeof ReactLenis>) {
  return (
    <ReactLenis
      options={{ ...defaultOptions, ...options }}
      className={`h-full min-h-0 flex flex-col overflow-y-auto ${className}`.trim()}
      {...rest}
    />
  );
}
