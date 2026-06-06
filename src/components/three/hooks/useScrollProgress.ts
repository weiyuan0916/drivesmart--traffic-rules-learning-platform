import { useEffect, useRef, useState } from 'react';

export function useScrollProgress(containerRef?: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        if (containerRef?.current) {
          // Use container scroll
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
          const maxScroll = scrollHeight - clientHeight;
          const currentProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;
          setProgress(Math.min(Math.max(currentProgress, 0), 1));
        } else {
          // Fallback to window scroll
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
          setProgress(Math.min(Math.max(currentProgress, 0), 1));
        }
        rafRef.current = null;
      });
    };

    const container = containerRef?.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial call
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial call
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [containerRef]);

  return progress;
}
