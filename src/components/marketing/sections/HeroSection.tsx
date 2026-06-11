import { motion, type Easing } from 'motion/react';
import { useLanguage } from '../../../context/LanguageContext';
import { useReducedMotion } from '../../../hooks/useScrollAnimation';
import { CheckCircle, ArrowRight, BarChart3, BookOpen, BrainCircuit, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onStartTest: () => void;
  onExplore: () => void;
}

const TRUST_BADGES = [
  { icon: CheckCircle, labelVi: '600 câu hỏi chính thức', labelEn: '600 official questions' },
  { icon: BarChart3, labelVi: 'Theo dõi tiến độ', labelEn: 'Track your progress' },
  { icon: BrainCircuit, labelVi: 'AI phân tích tình huống', labelEn: 'AI situation analysis' },
  { icon: ShieldCheck, labelVi: 'Cập nhật 2024', labelEn: 'Updated for 2024' },
];

export function HeroSection({ onStartTest, onExplore }: HeroSectionProps) {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();

  const easeOut: Easing = 'easeOut';
  const stagger = reducedMotion ? 0 : 0.08;
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: 0.2 } },
  };
  const item = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-[var(--bg-primary)] pt-14 lg:pt-16"
      aria-label="Hero section — Driving Test"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Soft radial gradient top-left */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />
        {/* Soft radial gradient bottom-right */}
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Text content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            {/* Eyebrow badge */}
            <motion.div variants={item} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" aria-hidden="true" />
                {language === 'vi' ? 'Kỳ thi GPLX 2024' : 'GPLX Exam 2024'}
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {language === 'vi' ? (
                <>
                  Chinh phục bài thi{' '}
                  <span className="text-[var(--accent)]">GPLX</span>
                  <br />
                  Tự tin lái xe
                </>
              ) : (
                <>
                  Pass Your{' '}
                  <span className="text-[var(--accent)]">Driving Test</span>
                  <br />
                  With Confidence
                </>
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={item}
              className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl mb-8"
            >
              {language === 'vi'
                ? '600 câu hỏi chính thức từ Tổng cục Đường bộ Việt Nam. Theo dõi tiến độ theo chương. Vượt qua kỳ thi ngay lần đầu với AI phân tích tình huống giao thông.'
                : 'Practice with 600 official questions from Vietnam\'s Road Administration. Track progress by chapter. Pass your test on the first try with AI-powered traffic analysis.'}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center lg:justify-start"
            >
              <button
                onClick={onStartTest}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-semibold text-sm rounded-xl transition-all duration-200 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--accent)]/20"
              >
                {language === 'vi' ? 'Bắt đầu thi thử' : 'Start Free Test'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>

              <button
                onClick={onExplore}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold text-sm rounded-xl border border-[var(--border)] transition-all duration-200 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 hover:-translate-y-0.5"
              >
                {language === 'vi' ? 'Khám phá nền tảng' : 'Explore Platform'}
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={item}
              className="grid grid-cols-2 gap-x-6 gap-y-3 mt-8 w-full max-w-md"
            >
              {TRUST_BADGES.map(({ icon: Icon, labelVi, labelEn }) => (
                <div
                  key={labelEn}
                  className="flex items-center gap-2 text-xs text-[var(--text-muted)]"
                >
                  <Icon className="w-3.5 h-3.5 text-[var(--success)] flex-shrink-0" aria-hidden="true" />
                  <span>{language === 'vi' ? labelVi : labelEn}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' as const }}
            className="relative flex items-center justify-center"
          >
            {/* Illustration card — driving test visualization */}
            <div className="relative w-full max-w-md">
              {/* Card background */}
              <div
                className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border)] shadow-xl overflow-hidden"
                role="img"
                aria-label={language === 'vi'
                  ? 'Giao diện thi GPLX — hiển thị câu hỏi và tiến độ'
                  : 'GPLX exam interface — showing questions and progress'}
              >
                {/* Card header */}
                <div className="bg-[var(--primary)] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-xs font-medium">Kỳ thi GPLX B1</span>
                    <span className="text-white/60 text-xs">30/30 câu</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-5 pt-4">
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
                    <span>Câu hỏi 12/30</span>
                    <span>40% hoàn thành</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '40%' }}
                      transition={{ duration: 1, delay: 0.8, ease: 'easeOut' as const }}
                      className="h-full bg-[var(--accent)] rounded-full"
                    />
                  </div>
                </div>

                {/* Question preview */}
                <div className="px-5 py-5 space-y-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Khi gặp biển báo hiệu nguy hiểm, người lái xe phải làm gì?
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: 'Giảm tốc độ và quan sát kỹ', selected: true, correct: true },
                      { label: 'Tăng tốc độ để nhanh chóng vượt qua', selected: false, correct: false },
                      { label: 'Dừng xe ngay lập tức', selected: false, correct: false },
                      { label: 'Bấm còi liên tục', selected: false, correct: false },
                    ].map((opt, i) => (
                      <div
                        key={i}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors
                          ${opt.selected && opt.correct
                            ? 'bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]'
                            : opt.selected
                            ? 'bg-[var(--error)]/10 border-[var(--error)]/30 text-[var(--error)]'
                            : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)]'}
                        `}
                      >
                        <span className={`
                          w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border flex-shrink-0
                          ${opt.selected && opt.correct
                            ? 'bg-[var(--success)] text-white border-[var(--success)]'
                            : opt.selected
                            ? 'bg-[var(--error)] text-white border-[var(--error)]'
                            : 'bg-[var(--bg-secondary)] border-[var(--border)]'}
                        `}>
                          {opt.selected ? (opt.correct ? '✓' : '✗') : String.fromCharCode(65 + i)}
                        </span>
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chapter stats */}
                <div className="px-5 pb-5">
                  <div className="flex gap-2">
                    {[
                      { chapter: 'Ch.1', correct: 9, total: 9 },
                      { chapter: 'Ch.2', correct: 1, total: 1 },
                      { chapter: 'Ch.3', correct: 0, total: 3 },
                      { chapter: 'Ch.4', correct: 0, total: 2 },
                      { chapter: 'Ch.5', correct: 0, total: 9 },
                      { chapter: 'Ch.6', correct: 0, total: 6 },
                    ].map(({ chapter, correct, total }) => (
                      <div
                        key={chapter}
                        className={`
                          flex-1 min-w-0 px-1 py-1.5 rounded-lg text-center text-[9px] font-bold
                          ${correct === total && total > 0
                            ? 'bg-[var(--success)]/15 text-[var(--success)]'
                            : correct > 0
                            ? 'bg-[var(--warning)]/15 text-[var(--warning)]'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}
                        `}
                      >
                        {chapter}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating AI badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-2 top-8 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3 shadow-lg max-w-[160px]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <BrainCircuit className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">AI Assistant</span>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
                  {language === 'vi'
                    ? 'Phân tích tình huống giao thông bằng Gemini AI'
                    : 'Analyze traffic with Gemini AI'}
                </p>
              </motion.div>

              {/* Floating result badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="absolute -left-2 bottom-12 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--success)]" aria-hidden="true" />
                  <span className="text-[10px] font-bold text-[var(--success)]">
                    90% {language === 'vi' ? 'đạt' : 'accuracy'}
                  </span>
                </div>
                <p className="text-[9px] text-[var(--text-muted)] mt-0.5">
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
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-[10px] font-medium text-[var(--text-muted)] tracking-widest uppercase">
          {language === 'vi' ? 'Cuộn xuống' : 'Scroll'}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
