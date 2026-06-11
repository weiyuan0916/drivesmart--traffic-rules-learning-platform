import { motion } from 'motion/react';
import { useLanguage } from '../../../context/LanguageContext';
import { useReducedMotion } from '../../../hooks/useScrollAnimation';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function FinalCTA() {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="py-16 lg:py-24 bg-[var(--primary)]"
      aria-labelledby="final-cta-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white/80 text-xs font-semibold rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" aria-hidden="true" />
            {language === 'vi' ? 'Miễn phí — Không cần thẻ tín dụng' : 'Free — No credit card required'}
          </span>

          <h2
            id="final-cta-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 leading-tight"
          >
            {language === 'vi'
              ? 'Sẵn sàng vượt qua bài thi GPLX?'
              : 'Ready to pass your driving test?'}
          </h2>

          <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            {language === 'vi'
              ? 'Tham gia cùng 50,000+ học viên đã chinh phục kỳ thi GPLX. Bắt đầu học ngay hôm nay — hoàn toàn miễn phí.'
              : 'Join 50,000+ learners who have passed their GPLX exam. Start learning today — completely free.'}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[var(--primary)] font-bold text-base rounded-xl transition-all duration-200 min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10">
              {language === 'vi' ? 'Bắt đầu học ngay' : 'Start Learning Free'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
            <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-base rounded-xl transition-all duration-200 min-h-[52px] border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 hover:-translate-y-0.5">
              {language === 'vi' ? 'Đăng ký' : 'Register'}
            </button>
          </div>

          {/* Trust signals */}
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label={language === 'vi' ? 'Cam kết của chúng tôi' : 'Our commitments'}>
            {[
              language === 'vi' ? 'Miễn phí vĩnh viễn' : 'Always free',
              language === 'vi' ? 'Không cần thẻ tín dụng' : 'No credit card',
              language === 'vi' ? 'Không spam' : 'No spam',
              language === 'vi' ? 'Hủy bất kỳ lúc nào' : 'Cancel anytime',
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-xs text-white/50">
                <CheckCircle className="w-3.5 h-3.5 text-white/40" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
