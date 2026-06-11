import React from 'react';
import { motion } from 'motion/react';
import { useInView, useReducedMotion } from '../../../hooks/useLandingAnimation';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowRight, BookOpen, CheckCircle, PenTool, MessageSquare, BookMarked } from 'lucide-react';
import { OPAL_CATEGORIES } from '../data/landingData';

interface OPALSectionProps {
  onStart: () => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Writing: PenTool,
  Speaking: MessageSquare,
  Reading: BookMarked,
};

export function OPALSection({ onStart }: OPALSectionProps) {
  const { ref, inView } = useInView();
  const reducedMotion = useReducedMotion();
  const { language } = useLanguage();

  return (
    <section
      id="opal"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 lg:py-32 bg-[var(--bg-primary)]"
      aria-labelledby="opal-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Visual — phrase cards */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-500 text-sm font-bold rounded-full mb-6">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Oxford Phrase Academy
            </span>

            <div className="space-y-4">
              {OPAL_CATEGORIES.map((cat, catIdx) => {
                const IconComp = CATEGORY_ICONS[cat.titleEn] ?? BookOpen;
                return (
                  <motion.div
                    key={cat.titleEn}
                    initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1 + catIdx * 0.08, duration: 0.4 }}
                    className="border border-[var(--border)] rounded-2xl p-5 bg-[var(--bg-secondary)]"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold"
                        style={{ backgroundColor: cat.color }}
                      >
                        <IconComp className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {language === 'vi' ? cat.titleVi : cat.titleEn}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {cat.phrases.map((p, i) => (
                        <div key={i} className="bg-[var(--bg-tertiary)] rounded-xl p-3 border border-[var(--border)]">
                          <p className="text-sm font-medium italic text-[var(--text-primary)] leading-relaxed">
                            {p.phrase}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">{p.vi}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Text + CTA */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          >
            <h2
              id="opal-heading"
              className="text-4xl lg:text-6xl font-black text-[var(--text-primary)] mb-6 leading-tight"
            >
              {language === 'vi' ? (
                <>500+ cụm từ<br /><span className="text-purple-500">học thuật chuẩn</span></>
              ) : (
                <>500+ Academic<br /><span className="text-purple-500">Phrases Standard</span></>
              )}
            </h2>

            <p className="text-lg lg:text-xl text-[var(--text-secondary)] leading-relaxed mb-8">
              {language === 'vi'
                ? 'Tự tin viết essay, thuyết trình và giao tiếp chuyên nghiệp bằng tiếng Anh. Các cụm từ từ Oxford Phrase Academy — chuẩn quốc tế.'
                : 'Confidently write essays, deliver presentations, and communicate professionally in English. Phrases from Oxford Phrase Academy — the international standard.'}
            </p>

            <ul className="space-y-4 mb-10" aria-label={language === 'vi' ? 'Tính năng' : 'Features'}>
              {[
                language === 'vi' ? 'Phân loại theo ngữ cảnh: Viết, Nói, Đọc' : 'Organized by context: Writing, Speaking, Reading',
                language === 'vi' ? 'Ví dụ trong bài luận thực tế từ Oxford' : 'Real essay examples from Oxford',
                language === 'vi' ? 'Phát âm chuẩn từng cụm từ' : 'Native pronunciation for each phrase',
                language === 'vi' ? 'Bài tập ôn luyện kèm AI feedback' : 'Practice exercises with AI feedback',
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-base text-[var(--text-secondary)]">
                  <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" aria-hidden="true" />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              onClick={onStart}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold text-base rounded-2xl transition-all duration-200 min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/20"
            >
              {language === 'vi' ? 'Khám phá OPAL' : 'Explore OPAL Phrases'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
