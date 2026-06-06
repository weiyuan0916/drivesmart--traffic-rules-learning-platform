import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useGSAP(options?: {
  scope?: React.RefObject<HTMLElement | null>;
  cleanup?: boolean;
}) {
  const ctxRef = useRef<gsap.Context | null>(null);

  const createTimeline = useCallback((vars?: gsap.TimelineVars) => {
    return gsap.timeline(vars);
  }, []);

  const fromTo = useCallback((
    targets: gsap.TweenTarget,
    fromVars: gsap.TweenVars,
    toVars: gsap.TweenVars
  ) => {
    return gsap.fromTo(targets, fromVars, toVars);
  }, []);

  const to = useCallback((
    targets: gsap.TweenTarget,
    vars: gsap.TweenVars
  ) => {
    return gsap.to(targets, vars);
  }, []);

  const from = useCallback((
    targets: gsap.TweenTarget,
    vars: gsap.TweenVars
  ) => {
    return gsap.from(targets, vars);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    ctxRef.current = gsap.context(() => {}, options?.scope?.current);

    return () => {
      if (options?.cleanup !== false) {
        ctxRef.current?.revert();
      }
    };
  }, [options?.scope, options?.cleanup]);

  return {
    gsap,
    ScrollTrigger,
    timeline: createTimeline,
    fromTo,
    to,
    from,
    ctx: ctxRef.current,
  };
}

export { gsap, ScrollTrigger };
