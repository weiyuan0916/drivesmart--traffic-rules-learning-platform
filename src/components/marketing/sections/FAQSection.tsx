import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useInView, useReducedMotion } from '../../../hooks/useLandingAnimation';
import { useLanguage } from '../../../context/LanguageContext';
import { FAQ_ITEMS } from '../data/landingData';

export function FAQSection() {
  const { ref, inView } = useInView();
  const reducedMotion = useReducedMotion();
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 lg:py-32 bg-[var(--bg-secondary)]"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2
            id="faq-heading"
            className="text-4xl lg:text-6xl font-black text-[var(--text-primary)] mb-4"
          >
            {language === 'vi' ? (
              <>Câu hỏi <span className="text-[var(--accent)]">thường gặp</span></>
            ) : (
              <>Frequently <span className="text-[var(--accent)]">Asked Questions</span></>
            )}
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            {language === 'vi'
              ? 'Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất.'
              : 'Find quick answers to the most common questions.'}
          </p>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-3" role="list">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                role="listitem"
                className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span className="text-base font-bold text-[var(--text-primary)] pr-2">
                    {language === 'vi' ? item.questionVi : item.questionEn}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5">
                        <p className="text-base text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)] pt-4">
                          {language === 'vi' ? item.answerVi : item.answerEn}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
