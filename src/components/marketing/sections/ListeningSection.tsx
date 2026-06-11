import { motion } from 'motion/react';
import { useInView, useReducedMotion } from '../../../hooks/useLandingAnimation';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowRight, CheckCircle, Play, Clock, Target, Zap } from 'lucide-react';
import { LISTENING_FEATURES } from '../data/landingData';

interface ListeningSectionProps {
  onStart: () => void;
}

const LEVELS = [
  { label: 'Beginner', color: 'bg-green-500/10 text-green-600 border-green-500/20', progress: 35 },
  { label: 'Intermediate', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', progress: 55 },
  { label: 'Advanced', color: 'bg-red-500/10 text-red-600 border-red-500/20', progress: 75 },
];

export function ListeningSection({ onStart }: ListeningSectionProps) {
  const { ref, inView } = useInView();
  const reducedMotion = useReducedMotion();
  const { language } = useLanguage();

  return (
    <section
      id="listening"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 lg:py-32 bg-[var(--bg-secondary)]"
      aria-labelledby="listening-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Text + features */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-500 text-sm font-bold rounded-full mb-6">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
              </svg>
              {language === 'vi' ? 'Luyện nghe' : 'Listening Practice'}
            </span>

            <h2
              id="listening-heading"
              className="text-4xl lg:text-6xl font-black text-[var(--text-primary)] mb-6 leading-tight"
            >
              {language === 'vi' ? (
                <>1.200+ bài<br /><span className="text-indigo-500">luyện nghe chép chính tả</span></>
              ) : (
                <>1,200+ Dictation<br /><span className="text-indigo-500">Exercises</span></>
              )}
            </h2>

            <p className="text-lg lg:text-xl text-[var(--text-secondary)] leading-relaxed mb-8">
              {language === 'vi'
                ? 'Từ DailyDictation. Xem transcript, kiểm tra độ chính xác từng từ và nhận feedback AI cá nhân hóa. Phù hợp cho IELTS, TOEIC và giao tiếp.'
                : 'From DailyDictation. View transcripts, check word-by-word accuracy, and receive personalized AI feedback. Perfect for IELTS, TOEIC, and communication.'}
            </p>

            <ul className="space-y-4 mb-10" aria-label={language === 'vi' ? 'Tính năng' : 'Features'}>
              {LISTENING_FEATURES.map((feat) => (
                <li key={feat.titleEn} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-base">
                    {feat.icon}
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
              className="group inline-flex items-center gap-3 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base rounded-2xl transition-all duration-200 min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/20"
            >
              {language === 'vi' ? 'Bắt đầu luyện nghe' : 'Start Listening Practice'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </motion.div>

          {/* Right: Audio player mockup */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-3xl p-8 shadow-xl">
              {/* Waveform */}
              <div className="flex items-center gap-0.5 h-20 mb-8" aria-hidden="true">
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={reducedMotion ? {} : {
                      height: [8, Math.random() * 56 + 16, 8],
                    }}
                    transition={{
                      duration: 1.4 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: i * 0.04,
                      ease: 'easeInOut',
                    }}
                    className="flex-1 bg-indigo-400/30 rounded-full"
                    style={{ minWidth: 4 }}
                  />
                ))}
              </div>

              {/* Lesson info */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">DailyDictation</p>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">Business Conversation #47</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  3:24
                </div>
              </div>

              {/* Play controls */}
              <div className="flex items-center justify-center gap-5 mb-6">
                <button className="p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label={language === 'vi' ? 'Quay lại 5s' : 'Rewind 5s'}>
                  <span className="text-sm font-bold text-[var(--text-secondary)]">-5</span>
                </button>
                <button className="p-5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors min-w-[64px] min-h-[64px] flex items-center justify-center shadow-lg shadow-indigo-500/30" aria-label={language === 'vi' ? 'Phát' : 'Play'}>
                  <Play className="w-7 h-7 ml-0.5" fill="currentColor" />
                </button>
                <button className="p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label={language === 'vi' ? 'Tiến 5s' : 'Forward 5s'}>
                  <span className="text-sm font-bold text-[var(--text-secondary)]">+5</span>
                </button>
              </div>

              {/* Speed control */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {['0.5x', '0.75x', '1x', '1.25x', '1.5x'].map((speed) => (
                  <button
                    key={speed}
                    className={`
                      px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px]
                      ${speed === '1x'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}
                    `}
                    aria-pressed={speed === '1x'}
                  >
                    {speed}
                  </button>
                ))}
              </div>

              {/* Transcript preview */}
              <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 mb-5">
                <p className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  {language === 'vi' ? 'Nhập transcript:' : 'Type transcript:'}
                </p>
                <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
                  <p className="text-sm text-[var(--text-muted)] italic leading-relaxed">
                    The quarterly results show significant growth in our Asian markets...
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: language === 'vi' ? 'Độ chính xác' : 'Accuracy', value: '85%', icon: Target, color: 'text-green-500' },
                  { label: language === 'vi' ? 'Từ đúng' : 'Correct', value: '34', icon: CheckCircle, color: 'text-indigo-500' },
                  { label: 'XP', value: '+120', icon: Zap, color: 'text-amber-500' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[var(--bg-tertiary)] rounded-xl p-3 text-center">
                    <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} aria-hidden="true" />
                    <p className="text-base font-bold text-[var(--text-primary)]">{stat.value}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
