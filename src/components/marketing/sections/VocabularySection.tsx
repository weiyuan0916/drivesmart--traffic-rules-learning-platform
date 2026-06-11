import { motion } from 'motion/react';
import { useLanguage } from '../../../context/LanguageContext';
import { useReducedMotion } from '../../../hooks/useScrollAnimation';
import { BookOpen, ArrowRight, Layers, Mic, CheckCircle } from 'lucide-react';

interface VocabularySectionProps {
  onStart: () => void;
}

const SAMPLE_WORDS = [
  { word: 'ephemeral', phonetic: '/ɪˈfem.ər.əl/', meaning: 'tồn tại trong thời gian ngắn' },
  { word: 'ubiquitous', phonetic: '/juːˈbɪk.wɪ.təs/', meaning: 'có mặt khắp nơi' },
  { word: 'pragmatic', phonetic: '/præɡˈmæt.ɪk/', meaning: 'thực dụng, thiết thực' },
];

export function VocabularySection({ onStart }: VocabularySectionProps) {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="py-16 lg:py-24 bg-[var(--bg-primary)]"
      aria-labelledby="vocab-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Text + CTA */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
          >
            {/* Icon badge */}
            <div className="w-12 h-12 bg-[var(--success)]/10 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-[var(--success)]" aria-hidden="true" />
            </div>

            <h2
              id="vocab-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] mb-4 leading-tight"
            >
              {language === 'vi' ? (
                <>Học từ vựng với<br /><span className="text-[var(--success)]">Flashcard tương tác</span></>
              ) : (
                <>Learn Vocabulary with<br /><span className="text-[var(--success)]">Interactive Flashcards</span></>
              )}
            </h2>

            <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-6">
              {language === 'vi'
                ? '5,000+ từ vựng từ Oxford Dictionary. Mỗi flashcard có phát âm chuẩn, ví dụ thực tế và ghi nhớ bằng spaced repetition.'
                : '5,000+ vocabulary words from Oxford Dictionary. Each flashcard includes native pronunciation, real examples, and spaced repetition for long-term retention.'}
            </p>

            {/* Feature list */}
            <ul className="space-y-2 mb-8" aria-label={language === 'vi' ? 'Tính năng' : 'Features'}>
              {[
                language === 'vi' ? 'Phát âm chuẩn Oxford' : 'Native Oxford pronunciation',
                language === 'vi' ? '4 cấp độ: Beginner → Advanced' : '4 levels: Beginner → Advanced',
                language === 'vi' ? 'Spaced repetition — nhớ lâu hơn' : 'Spaced repetition — learn smarter',
                language === 'vi' ? 'Theo dõi tiến độ theo chủ đề' : 'Track progress by topic',
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0" aria-hidden="true" />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              onClick={onStart}
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--success)] hover:bg-[#00a86d] text-white font-semibold text-sm rounded-xl transition-all duration-200 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--success)] focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {language === 'vi' ? 'Học thử miễn phí' : 'Try for Free'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </motion.div>

          {/* Right: Flashcard preview */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' as const, delay: 0.1 }}
            className="flex justify-center"
          >
            <div
              className="w-full max-w-sm space-y-4"
              role="img"
              aria-label={language === 'vi' ? 'Giao diện flashcard từ vựng' : 'Vocabulary flashcard interface'}
            >
              {/* Stat pills */}
              <div className="flex gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--success)]/10 text-[var(--success)] text-xs font-semibold rounded-full">
                  <Layers className="w-3 h-3" aria-hidden="true" />
                  5,000+ {language === 'vi' ? 'từ' : 'words'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-medium rounded-full border border-[var(--border)]">
                  <Mic className="w-3 h-3" aria-hidden="true" />
                  {language === 'vi' ? 'Audio chuẩn' : 'Native audio'}
                </span>
              </div>

              {/* Flashcard stack */}
              {SAMPLE_WORDS.map((w, i) => (
                <motion.div
                  key={w.word}
                  initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className={`
                    bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5 shadow-sm
                    ${i === 0 ? 'shadow-md' : ''}
                  `}
                  style={{ transform: `translateY(${i * -6}px)`, zIndex: 3 - i, position: 'relative' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">{w.word}</h3>
                      <p className="text-xs text-[var(--text-muted)] font-mono">{w.phonetic}</p>
                    </div>
                    <button
                      className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--success)]/10 text-[var(--text-muted)] hover:text-[var(--success)] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      aria-label={`${language === 'vi' ? 'Phát âm' : 'Pronounce'} ${w.word}`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{w.meaning}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
