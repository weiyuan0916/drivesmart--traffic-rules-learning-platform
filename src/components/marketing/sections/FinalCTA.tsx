import { motion } from 'motion/react';
import { useInView, useReducedMotion } from '../../../hooks/useLandingAnimation';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowRight, CheckCircle, Users, BookOpen, TrendingUp, Car } from 'lucide-react';

interface FinalCTAProps {
  onStartLearning: () => void;
  onRegister: () => void;
}

const TRUST_STATS = [
  { value: '50.000+', label: 'Học viên', labelEn: 'Learners', Icon: Users },
  { value: '600', label: 'Câu hỏi GPLX', labelEn: 'GPLX Questions', Icon: Car },
  { value: '95%', label: 'Tỷ lệ đậu', labelEn: 'Pass Rate', Icon: TrendingUp },
  { value: '5.000+', label: 'Từ vựng', labelEn: 'Vocab Words', Icon: BookOpen },
];

export function FinalCTA({ onStartLearning, onRegister }: FinalCTAProps) {
  const { ref, inView } = useInView();
  const reducedMotion = useReducedMotion();
  const { language } = useLanguage();

  return (
    <section
      id="cta"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 lg:py-32 bg-[var(--primary)]"
      aria-labelledby="final-cta-heading"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white/80 text-sm font-semibold rounded-full">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white/60" />
              </span>
              {language === 'vi' ? 'Miễn phí — Không cần thẻ tín dụng' : 'Free — No credit card required'}
            </span>
          </div>

          <h2
            id="final-cta-heading"
            className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.02]"
          >
            {language === 'vi'
              ? 'Sẵn sàng vượt qua kỳ thi GPLX?'
              : 'Ready to pass your driving test?'}
          </h2>

          <p className="text-white/60 text-lg lg:text-2xl leading-relaxed mb-10 max-w-2xl mx-auto">
            {language === 'vi'
              ? 'Tham gia cùng 50.000+ học viên đã chinh phục kỳ thi GPLX. Bắt đầu học ngay hôm nay — hoàn toàn miễn phí.'
              : 'Join 50,000+ learners who have passed their GPLX exam. Start learning today — completely free.'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
            {TRUST_STATS.map(({ value, label, labelEn, Icon }, i) => (
              <motion.div
                key={label}
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/10"
              >
                <Icon className="w-6 h-6 text-white/50 mx-auto mb-2" aria-hidden="true" />
                <p className="text-2xl lg:text-3xl font-black text-white">{value}</p>
                <p className="text-xs text-white/50 mt-1">{language === 'vi' ? label : labelEn}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={onStartLearning}
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[var(--primary)] font-black text-lg rounded-2xl transition-all duration-200 min-h-[64px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/20"
            >
              {language === 'vi' ? 'Bắt đầu học ngay' : 'Start Learning Free'}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
            <button
              onClick={onRegister}
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-2xl transition-all duration-200 min-h-[64px] border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] hover:-translate-y-0.5"
            >
              {language === 'vi' ? 'Đăng ký miễn phí' : 'Register for Free'}
            </button>
          </div>

          {/* Trust signals */}
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3" aria-label={language === 'vi' ? 'Cam kết' : 'Commitments'}>
            {[
              language === 'vi' ? 'Miễn phí vĩnh viễn' : 'Always free',
              language === 'vi' ? 'Không cần thẻ tín dụng' : 'No credit card',
              language === 'vi' ? 'Không spam' : 'No spam',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-white/40">
                <CheckCircle className="w-4 h-4 text-white/25" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
