import { motion } from 'motion/react';
import { useInView, useReducedMotion } from '../../../hooks/useLandingAnimation';
import { useLanguage } from '../../../context/LanguageContext';

export function SocialProofSection() {
  const { ref, inView } = useInView();
  const reducedMotion = useReducedMotion();
  const { language } = useLanguage();

  const logos = [
    'HCMUT', 'FPT University', 'RMIT Vietnam', 'TVET', 'SGTVT HCMC', 'VN Road Admin',
  ];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-16 lg:py-20 bg-[var(--bg-primary)]"
      aria-labelledby="social-proof-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-bold text-[var(--accent)] uppercase tracking-wider mb-3">
            {language === 'vi' ? 'Được tin tưởng bởi' : 'Trusted by'}
          </p>
          <h2
            id="social-proof-heading"
            className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] mb-4"
          >
            {language === 'vi' ? (
              <>Học viên từ khắp <span className="text-[var(--accent)]">Việt Nam</span></>
            ) : (
              <>Learners from across <span className="text-[var(--accent)]">Vietnam</span></>
            )}
          </h2>
          <p className="text-base lg:text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            {language === 'vi'
              ? 'Từ sinh viên đại học đến người đi làm, DriveSmart đồng hành cùng hàng nghìn người chinh phục kỳ thi GPLX.'
              : 'From university students to working professionals, DriveSmart helps thousands pass their GPLX exam.'}
          </p>
        </motion.div>

        {/* Logo strip */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
        >
          {logos.map((name, i) => (
            <motion.div
              key={name}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5 flex items-center justify-center text-center hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-bold text-[var(--text-muted)]">{name}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* 3 key stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              value: '4.9',
              suffix: '/5',
              labelVi: 'trên App Store',
              labelEn: 'on App Store',
              color: 'text-green-500',
            },
            {
              value: '50.000+',
              suffix: '',
              labelVi: 'học viên đang hoạt động',
              labelEn: 'active learners',
              color: 'text-[var(--accent)]',
            },
            {
              value: '2M+',
              suffix: '',
              labelVi: 'bài thi đã được hoàn thành',
              labelEn: 'exams completed',
              color: 'text-purple-500',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.labelEn}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-8 text-center"
            >
              <p className={`text-5xl lg:text-6xl font-black mb-2 ${stat.color}`}>
                {stat.value}
                <span className="text-3xl font-bold text-[var(--text-muted)]">{stat.suffix}</span>
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {language === 'vi' ? stat.labelVi : stat.labelEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
