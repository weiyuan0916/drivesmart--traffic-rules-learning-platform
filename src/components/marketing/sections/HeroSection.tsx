import { motion } from 'motion/react';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowRight, CheckCircle, Car, BrainCircuit, BarChart3, ShieldCheck } from 'lucide-react';
import { useReducedMotion } from '../../../hooks/useLandingAnimation';

interface HeroSectionProps {
  onStartTest: () => void;
  onExplore: () => void;
}

const TRUST_BADGES = [
  { icon: Car, labelVi: '600 câu hỏi chính thức', labelEn: '600 official questions' },
  { icon: BrainCircuit, labelVi: 'AI phân tích tình huống', labelEn: 'AI traffic analyzer' },
  { icon: BarChart3, labelVi: 'Theo dõi tiến độ', labelEn: 'Progress tracking' },
  { icon: ShieldCheck, labelVi: 'Cập nhật 2024', labelEn: 'Updated 2024' },
];

export function HeroSection({ onStartTest, onExplore }: HeroSectionProps) {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-[var(--primary)] pt-14"
      aria-label="Hero section"
    >
      {/* ── Background decorations ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Large soft glow top-right */}
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,86,50,0.15) 0%, transparent 70%)' }}
        />
        {/* Medium glow bottom-left */}
        <div
          className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(90,93,139,0.5) 0%, transparent 70%)' }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, transparent, var(--primary))' }} />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Text content ── */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            {/* Eyebrow badge */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white/80 border border-white/10 backdrop-blur-sm">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                </span>
                {language === 'vi' ? 'Kỳ thi GPLX 2024 — Miễn phí' : 'GPLX Exam 2024 — Free'}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.02] tracking-tight mb-8"
            >
              {language === 'vi' ? (
                <>
                  Chinh phục
                  <br />
                  <span className="text-[var(--accent)]">kỳ thi GPLX</span>
                  <br />
                  từ lần đầu
                </>
              ) : (
                <>
                  Pass Your
                  <br />
                  <span className="text-[var(--accent)]">Driving Test</span>
                  <br />
                  First Try
                </>
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
              className="text-lg lg:text-xl text-white/60 leading-relaxed max-w-xl mb-10"
            >
              {language === 'vi'
                ? '600 câu hỏi chính thức, AI phân tích tình huống giao thông, và theo dõi tiến độ thông minh. Đậu kỳ thi ngay lần đầu — hoàn toàn miễn phí.'
                : '600 official questions, AI traffic analysis, and smart progress tracking. Pass your test the first time — completely free.'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start mb-10"
            >
              <button
                onClick={onStartTest}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-bold text-lg rounded-2xl transition-all duration-200 min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--accent)]/25"
              >
                {language === 'vi' ? 'Thi thử ngay' : 'Start Free Test'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
              <button
                onClick={onExplore}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-base rounded-2xl transition-all duration-200 min-h-[60px] border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] hover:-translate-y-0.5"
              >
                {language === 'vi' ? 'Khám phá nền tảng' : 'Explore Platform'}
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="grid grid-cols-2 gap-x-8 gap-y-3 w-full max-w-md"
            >
              {TRUST_BADGES.map(({ icon: Icon, labelVi, labelEn }) => (
                <div key={labelEn} className="flex items-center gap-2 text-sm text-white/50">
                  <Icon className="w-4 h-4 text-white/30 flex-shrink-0" aria-hidden="true" />
                  <span>{language === 'vi' ? labelVi : labelEn}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Product mockup ── */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">

              {/* Main card */}
              <div className="bg-[var(--bg-secondary)] rounded-3xl shadow-2xl overflow-hidden border border-white/10">
                {/* Card header */}
                <div className="bg-[var(--primary)] px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                      <Car className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-xs font-medium">Kỳ thi GPLX B1</p>
                      <p className="text-white/40 text-[10px]">30 câu hỏi</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[var(--accent)]/20 text-[var(--accent)] text-xs font-bold rounded-full">
                    90%
                  </span>
                </div>

                {/* Progress */}
                <div className="px-6 pt-5 pb-3">
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
                    <span>Câu 12 / 30</span>
                    <span>40% hoàn thành</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '40%' }}
                      transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
                      className="h-full bg-[var(--accent)] rounded-full"
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="px-6 pb-5 space-y-4">
                  <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                    Khi gặp biển báo hiệu nguy hiểm, người lái xe phải làm gì?
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: 'Giảm tốc độ và quan sát kỹ', selected: true, correct: true },
                      { label: 'Tăng tốc để nhanh chóng vượt qua', selected: false },
                      { label: 'Dừng xe ngay lập tức', selected: false },
                      { label: 'Bấm còi liên tục', selected: false },
                    ].map((opt, i) => (
                      <div
                        key={i}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium border transition-colors
                          ${opt.selected && opt.correct
                            ? 'bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]'
                            : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)]'}
                        `}
                      >
                        <span className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border flex-shrink-0
                          ${opt.selected && opt.correct
                            ? 'bg-[var(--success)] text-white border-[var(--success)]'
                            : 'bg-[var(--bg-secondary)] border-[var(--border)]'}
                        `}>
                          {opt.selected ? '✓' : String.fromCharCode(65 + i)}
                        </span>
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chapter stats */}
                <div className="px-6 pb-5">
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { label: 'Ch.1', done: true },
                      { label: 'Ch.2', done: true },
                      { label: 'Ch.3', done: false },
                      { label: 'Ch.4', done: false },
                      { label: 'Ch.5', done: false },
                      { label: 'Ch.6', done: false },
                    ].map(({ label, done }) => (
                      <div
                        key={label}
                        className={`
                          px-1 py-2 rounded-lg text-center text-[10px] font-bold
                          ${done
                            ? 'bg-[var(--success)]/15 text-[var(--success)]'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}
                        `}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating AI badge — top right */}
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -right-4 top-6 bg-[var(--bg-secondary)] border border-white/10 rounded-2xl px-4 py-3 shadow-xl max-w-[170px]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <BrainCircuit className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
                  <span className="text-[11px] font-bold text-[var(--text-muted)]">AI Assistant</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                  {language === 'vi'
                    ? 'Gemini AI phân tích tình huống giao thông'
                    : 'Gemini AI analyzes traffic situations'}
                </p>
              </motion.div>

              {/* Floating score badge — bottom left */}
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="absolute -left-4 bottom-16 bg-[var(--bg-secondary)] border border-white/10 rounded-2xl px-4 py-3 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--success)]" aria-hidden="true" />
                  <span className="text-[11px] font-bold text-[var(--success)]">
                    95% {language === 'vi' ? 'đạt' : 'accuracy'}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {language === 'vi' ? 'Đậu kỳ thi' : 'Pass threshold'}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-[10px] font-medium text-white/30 tracking-widest uppercase">
          {language === 'vi' ? 'Cuộn xuống' : 'Scroll'}
        </span>
        <motion.div
          animate={reducedMotion ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
