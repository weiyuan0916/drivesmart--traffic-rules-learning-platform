import { motion } from 'motion/react';
import { useLanguage } from '../../../context/LanguageContext';
import { useReducedMotion } from '../../../hooks/useScrollAnimation';
import { ArrowRight, CheckCircle, Play } from 'lucide-react';

interface ListeningSectionProps {
  onStart: () => void;
}

const DIFFICULTY_LEVELS = [
  { labelVi: 'Beginner', labelEn: 'Beginner', color: 'bg-green-500/10 text-green-600', progress: 30 },
  { labelVi: 'Intermediate', labelEn: 'Intermediate', color: 'bg-amber-500/10 text-amber-600', progress: 30 },
  { labelVi: 'Advanced', labelEn: 'Advanced', color: 'bg-red-500/10 text-red-600', progress: 30 },
  { labelVi: 'Expert', labelEn: 'Expert', color: 'bg-purple-500/10 text-purple-600', progress: 30 },
];

export function ListeningSection({ onStart }: ListeningSectionProps) {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="py-16 lg:py-24 bg-[var(--bg-primary)]"
      aria-labelledby="listening-heading"
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
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
              </svg>
            </div>

            <h2
              id="listening-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] mb-4 leading-tight"
            >
              {language === 'vi' ? (
                <>Luyện nghe<br /><span className="text-indigo-500">chép chính tả</span></>
              ) : (
                <>Practice English<br /><span className="text-indigo-500">Listening & Dictation</span></>
              )}
            </h2>

            <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-6">
              {language === 'vi'
                ? '1,200+ bài luyện tập từ DailyDictation. Từ cấp độ Beginner đến Expert. Xem transcript, kiểm tra độ chính xác và nhận feedback AI cá nhân hóa.'
                : '1,200+ dictation exercises from DailyDictation. From Beginner to Expert. View transcripts, check accuracy, and receive personalized AI feedback.'}
            </p>

            {/* Difficulty levels */}
            <div className="space-y-3 mb-8">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {language === 'vi' ? 'Cấp độ' : 'Difficulty Levels'}
              </p>
              {DIFFICULTY_LEVELS.map((level, i) => (
                <motion.div
                  key={level.labelEn}
                  initial={reducedMotion ? false : { opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full min-w-[80px] text-center ${level.color}`}>
                    {language === 'vi' ? level.labelVi : level.labelEn}
                  </span>
                  <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${level.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-indigo-500/50 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] w-12 text-right">
                    {language === 'vi' ? 'Miễn phí' : 'Free'}
                  </span>
                </motion.div>
              ))}
            </div>

            <ul className="space-y-2 mb-8" aria-label={language === 'vi' ? 'Tính năng' : 'Features'}>
              {[
                language === 'vi' ? 'Điều khiển tốc độ: 0.5x → 1.5x' : 'Speed control: 0.5x → 1.5x',
                language === 'vi' ? 'So sánh transcript tự động' : 'Automatic transcript comparison',
                language === 'vi' ? 'Feedback AI cá nhân hóa' : 'Personalized AI feedback',
                language === 'vi' ? 'Xem lịch sử và bookmark' : 'History and bookmarks',
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              onClick={onStart}
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              {language === 'vi' ? 'Bắt đầu luyện nghe' : 'Start Listening Practice'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </motion.div>

          {/* Right: Audio player preview */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' as const, delay: 0.1 }}
            className="flex justify-center"
          >
            <div
              className="w-full max-w-sm"
              role="img"
              aria-label={language === 'vi' ? 'Giao diện luyện nghe' : 'Listening practice interface'}
            >
              {/* Audio player card */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 shadow-lg">
                {/* Waveform visual */}
                <div className="flex items-center gap-1 h-16 mb-5" aria-hidden="true">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [8, Math.random() * 48 + 8, 8],
                      }}
                      transition={{
                        duration: 1.2 + Math.random() * 0.5,
                        repeat: Infinity,
                        delay: i * 0.05,
                        ease: 'easeInOut' as const,
                      }}
                      className="flex-1 bg-indigo-400/40 rounded-full"
                      style={{ minWidth: 3 }}
                    />
                  ))}
                </div>

                {/* Play button */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button className="p-3 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label={language === 'vi' ? 'Quay lại 5 giây' : 'Rewind 5 seconds'}>
                    <span className="text-lg font-bold text-[var(--text-secondary)]">-5</span>
                  </button>
                  <button className="p-4 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors min-w-[56px] min-h-[56px] flex items-center justify-center shadow-lg shadow-indigo-500/30" aria-label={language === 'vi' ? 'Phát audio' : 'Play audio'}>
                    <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                  </button>
                  <button className="p-3 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label={language === 'vi' ? 'Tiến 5 giây' : 'Forward 5 seconds'}>
                    <span className="text-lg font-bold text-[var(--text-secondary)]">+5</span>
                  </button>
                </div>

                {/* Speed control */}
                <div className="flex items-center justify-center gap-2 mb-5">
                  {['0.5x', '0.75x', '1x', '1.25x', '1.5x'].map((speed) => (
                    <button
                      key={speed}
                      className={`
                        px-2 py-1 text-[10px] font-semibold rounded-md transition-colors
                        min-h-[28px]
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

                {/* Transcript input preview */}
                <div className="bg-[var(--bg-tertiary)] rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-[var(--text-muted)] mb-2">
                    {language === 'vi' ? 'Nhập transcript của bạn:' : 'Type your transcript:'}
                  </p>
                  <div className="bg-[var(--bg-primary)] rounded-lg p-3 border border-[var(--border)]">
                    <p className="text-xs text-[var(--text-muted)] italic">
                      {language === 'vi' ? 'Tôi đang học tiếng Anh mỗi ngày...' : 'I am learning English every day...'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: language === 'vi' ? 'Độ chính xác' : 'Accuracy', value: '85%' },
                    { label: language === 'vi' ? 'Từ đúng' : 'Correct', value: '34' },
                    { label: language === 'vi' ? 'XP' : 'XP', value: '+120' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[var(--bg-tertiary)] rounded-xl p-3 text-center">
                      <p className="text-sm font-bold text-[var(--text-primary)]">{stat.value}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
