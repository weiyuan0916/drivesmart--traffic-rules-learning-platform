import { motion } from 'motion/react';
import { useInView, useReducedMotion } from '../../../hooks/useLandingAnimation';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowRight, BookOpen, CheckCircle, Mic, Sparkles } from 'lucide-react';
import { VOCABULARY_FEATURES } from '../data/landingData';

interface VocabularySectionProps {
  onStart: () => void;
}

const SAMPLE_WORDS = [
  { word: 'ephemeral', phonetic: '/ɪˈfem.ər.əl/', meaning: 'tồn tại trong thời gian ngắn', category: 'Adj' },
  { word: 'ubiquitous', phonetic: '/juːˈbɪk.wɪ.təs/', meaning: 'có mặt khắp nơi', category: 'Adj' },
  { word: 'resilient', phonetic: '/rɪˈzɪl.i.ənt/', meaning: 'có khả năng phục hồi', category: 'Adj' },
];

export function VocabularySection({ onStart }: VocabularySectionProps) {
  const { ref, inView } = useInView();
  const reducedMotion = useReducedMotion();
  const { language } = useLanguage();

  return (
    <section
      id="vocabulary"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 lg:py-32 bg-[var(--bg-secondary)]"
      aria-labelledby="vocab-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Text + features */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--success)]/10 text-[var(--success)] text-sm font-bold rounded-full mb-6">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              {language === 'vi' ? 'Từ vựng Oxford' : 'Oxford Vocabulary'}
            </span>

            <h2
              id="vocab-heading"
              className="text-4xl lg:text-6xl font-black text-[var(--text-primary)] mb-6 leading-tight"
            >
              {language === 'vi' ? (
                <>5.000+ từ vựng<br /><span className="text-[var(--success)]">chuẩn Oxford</span></>
              ) : (
                <>5,000+ Vocabulary<br /><span className="text-[var(--success)]">Oxford Standard</span></>
              )}
            </h2>

            <p className="text-lg lg:text-xl text-[var(--text-secondary)] leading-relaxed mb-8">
              {language === 'vi'
                ? 'Học từ vựng với phát âm chuẩn, ví dụ thực tế và spaced repetition thông minh. Phù hợp cho IELTS, TOEIC, giao tiếp và công việc.'
                : 'Learn vocabulary with native pronunciation, real examples, and smart spaced repetition. Perfect for IELTS, TOEIC, communication, and work.'}
            </p>

            {/* Feature list */}
            <ul className="space-y-4 mb-10" aria-label={language === 'vi' ? 'Tính năng' : 'Features'}>
              {VOCABULARY_FEATURES.map((feat) => (
                <li key={feat.titleEn} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[var(--success)]/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-base">{feat.icon}</span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[var(--text-primary)]">
                      {language === 'vi' ? feat.titleVi : feat.titleEn}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      {language === 'vi' ? feat.descVi : feat.descEn}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={onStart}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[var(--success)] hover:bg-[#00a86d] text-white font-bold text-base rounded-2xl transition-all duration-200 min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--success)] focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--success)]/20"
            >
              {language === 'vi' ? 'Học từ vựng ngay' : 'Start Learning Vocab'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </motion.div>

          {/* Right: Flashcard visual */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="relative">
              {/* Top badges */}
              <div className="flex gap-3 mb-5 flex-wrap">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--success)]/10 text-[var(--success)] text-sm font-bold rounded-full">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  5.000+ {language === 'vi' ? 'từ' : 'words'}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm font-medium rounded-full border border-[var(--border)]">
                  <Mic className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  Oxford {language === 'vi' ? 'phát âm' : 'pronunciation'}
                </span>
              </div>

              {/* Flashcard stack */}
              <div className="space-y-4">
                {SAMPLE_WORDS.map((w, i) => (
                  <motion.div
                    key={w.word}
                    initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                    className={`
                      bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-6 shadow-md
                      ${i === 0 ? 'shadow-lg ring-1 ring-[var(--success)]/15' : ''}
                    `}
                    style={{ transform: `translateY(${i * -6}px)`, zIndex: 3 - i, position: 'relative' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-[var(--text-primary)]">{w.word}</h3>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-semibold rounded-full">
                          {w.category}
                        </span>
                      </div>
                      <button
                        className="p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--success)]/10 text-[var(--text-muted)] hover:text-[var(--success)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label={`${language === 'vi' ? 'Phát âm' : 'Pronounce'} ${w.word}`}
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] font-mono mb-3">{w.phonetic}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{w.meaning}</p>
                    {/* Mini progress */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--success)] rounded-full" style={{ width: `${55 + i * 15}%` }} />
                      </div>
                      <span className="text-xs text-[var(--text-muted)] font-medium">{55 + i * 15}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
