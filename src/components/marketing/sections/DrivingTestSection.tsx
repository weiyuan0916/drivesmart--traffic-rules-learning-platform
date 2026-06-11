import { motion } from 'motion/react';
import { useInView, useReducedMotion } from '../../../hooks/useLandingAnimation';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowRight, Car, BrainCircuit, BarChart3, Target } from 'lucide-react';
import { DRIVING_TEST_FEATURES } from '../data/landingData';

interface DrivingTestSectionProps {
  onStart: () => void;
}

export function DrivingTestSection({ onStart }: DrivingTestSectionProps) {
  const { ref, inView } = useInView();
  const reducedMotion = useReducedMotion();
  const { language } = useLanguage();

  const features = DRIVING_TEST_FEATURES;

  return (
    <section
      id="driving"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 lg:py-32 bg-[var(--bg-primary)]"
      aria-labelledby="driving-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-bold rounded-full mb-5">
            <Car className="w-4 h-4" aria-hidden="true" />
            {language === 'vi' ? 'Thi GPLX B1' : 'GPLX B1 Exam'}
          </span>
          <h2
            id="driving-heading"
            className="text-4xl lg:text-6xl font-black text-[var(--text-primary)] mb-5 leading-tight"
          >
            {language === 'vi' ? (
              <>600 câu hỏi GPLX<br /><span className="text-[var(--accent)]">chuẩn như đề thi thật</span></>
            ) : (
              <>600 GPLX Questions<br /><span className="text-[var(--accent)]">Just Like the Real Exam</span></>
            )}
          </h2>
          <p className="text-lg lg:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            {language === 'vi'
              ? 'Bám sát đề thi thực tế từ Tổng cục Đường bộ Việt Nam. Cập nhật 2024 với AI phân tích tình huống giao thông thông minh.'
              : 'Aligned with official exams from Vietnam Road Administration. 2024 updated with smart AI traffic situation analysis.'}
          </p>
        </motion.div>

        {/* Feature grid — 2x2 */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {features.map((feat, i) => (
            <motion.article
              key={feat.titleEn}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl group-hover:bg-[var(--accent)]/20 transition-colors">
                  {feat.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">
                    {language === 'vi' ? feat.titleVi : feat.titleEn}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {language === 'vi' ? feat.descVi : feat.descEn}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom CTA row */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onStart}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-bold text-base rounded-2xl transition-all duration-200 min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--accent)]/20"
          >
            {language === 'vi' ? 'Thi thử GPLX ngay' : 'Try GPLX Exam Now'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>
          <p className="text-sm text-[var(--text-muted)]">
            {language === 'vi' ? 'Miễn phí — Không cần đăng ký' : 'Free — No registration required'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
