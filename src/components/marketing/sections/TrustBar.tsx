import { motion } from 'motion/react';
import { useInView, useReducedMotion } from '../../../hooks/useLandingAnimation';

export function TrustBar() {
  const { ref, inView } = useInView();
  const reducedMotion = useReducedMotion();

  const items = [
    { value: '50.000+', label: 'Học viên', labelEn: 'Active Learners' },
    { value: '600', label: 'Câu hỏi GPLX', labelEn: 'GPLX Questions' },
    { value: '95%', label: 'Tỷ lệ đậu', labelEn: 'Pass Rate' },
    { value: '5.000+', label: 'Từ vựng Oxford', labelEn: 'Oxford Vocab Words' },
    { value: '1.200+', label: 'Bài luyện nghe', labelEn: 'Listening Exercises' },
    { value: '500+', label: 'Cụm từ OPAL', labelEn: 'OPAL Phrases' },
  ];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="bg-[var(--bg-secondary)] border-y border-[var(--border)] py-6 lg:py-8 overflow-hidden"
      aria-label="Platform statistics"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
              className="text-center"
            >
              <p className="text-2xl lg:text-3xl font-black text-[var(--accent)] mb-1">
                {item.value}
              </p>
              <p className="text-xs lg:text-sm text-[var(--text-muted)]">
                {item.labelEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
