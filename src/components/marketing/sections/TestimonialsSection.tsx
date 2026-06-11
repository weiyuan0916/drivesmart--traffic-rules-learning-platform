import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView, useReducedMotion } from '../../../hooks/useLandingAnimation';
import { useLanguage } from '../../../context/LanguageContext';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../data/landingData';

export function TestimonialsSection() {
  const { ref, inView } = useInView();
  const reducedMotion = useReducedMotion();
  const { language } = useLanguage();
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  const testimonial = TESTIMONIALS[current];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 lg:py-32 bg-[var(--bg-primary)]"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 text-sm font-bold rounded-full mb-5">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" aria-hidden="true" />
            {language === 'vi' ? 'Học viên thật' : 'Real Learners'}
          </span>
          <h2
            id="testimonials-heading"
            className="text-4xl lg:text-6xl font-black text-[var(--text-primary)] mb-4"
          >
            {language === 'vi' ? (
              <>Học viên <span className="text-[var(--accent)]">nói gì</span></>
            ) : (
              <>What learners <span className="text-[var(--accent)]">say</span></>
            )}
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            {language === 'vi'
              ? 'Hơn 50.000 học viên đã vượt qua kỳ thi GPLX cùng DriveSmart.'
              : 'Over 50,000 learners have passed their GPLX exam with DriveSmart.'}
          </p>
        </motion.div>

        {/* Testimonial cards — 2 column */}
        <div className="relative">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Main testimonial */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={reducedMotion ? false : { opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 shadow-lg relative overflow-hidden"
              >
                <Quote className="absolute top-6 right-6 w-12 h-12 text-[var(--border)]" aria-hidden="true" />
                <div className="flex gap-1 mb-5" aria-label={`${testimonial.rating} stars`}>
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote>
                  <p className="text-[var(--text-primary)] text-lg leading-relaxed mb-8">
                    "{language === 'vi' ? testimonial.textVi : testimonial.textEn}"
                  </p>
                </blockquote>
                <div className="flex items-center gap-4 pt-5 border-t border-[var(--border)]">
                  <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-2xl" role="img" aria-hidden="true">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base text-[var(--text-primary)]">{testimonial.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{testimonial.role}</p>
                  </div>
                  <span
                    className="px-3 py-1.5 text-xs font-bold rounded-full"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${testimonial.accentColor} 15%, transparent)`,
                      color: testimonial.accentColor,
                    }}
                  >
                    {testimonial.product}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Second testimonial (peek) */}
            {TESTIMONIALS[(current + 1) % TESTIMONIALS.length] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                transition={{ duration: 0.4 }}
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 hidden md:block"
              >
                {(() => {
                  const nextT = TESTIMONIALS[(current + 1) % TESTIMONIALS.length];
                  return (
                    <>
                      <div className="flex gap-1 mb-5" aria-label="Rating">
                        {Array.from({ length: nextT.rating }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" aria-hidden="true" />
                        ))}
                      </div>
                      <p className="text-[var(--text-primary)] text-lg leading-relaxed mb-8 line-clamp-3">
                        "{language === 'vi' ? nextT.textVi : nextT.textEn}"
                      </p>
                      <div className="flex items-center gap-4 pt-5 border-t border-[var(--border)]">
                        <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-2xl">
                          {nextT.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-base text-[var(--text-primary)]">{nextT.name}</p>
                          <p className="text-sm text-[var(--text-muted)]">{nextT.role}</p>
                        </div>
                        <span
                          className="px-3 py-1.5 text-xs font-bold rounded-full"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${nextT.accentColor} 15%, transparent)`,
                            color: nextT.accentColor,
                          }}
                        >
                          {nextT.product}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5" aria-label="Testimonial dots">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${i === current ? 'w-8 bg-[var(--accent)]' : 'w-2 bg-[var(--border)] hover:bg-[var(--text-muted)]'}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === current ? 'true' : undefined}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={prev}
                className="p-3 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center border border-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label={language === 'vi' ? 'Testimonial trước' : 'Previous'}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="p-3 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center border border-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label={language === 'vi' ? 'Testimonial tiếp' : 'Next'}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
