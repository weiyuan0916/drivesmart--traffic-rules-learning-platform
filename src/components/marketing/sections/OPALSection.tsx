import { motion } from 'motion/react';
import { useLanguage } from '../../../context/LanguageContext';
import { useReducedMotion } from '../../../hooks/useScrollAnimation';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface OPALSectionProps {
  onStart: () => void;
}

const SAMPLE_PHRASES = [
  {
    phrase: '"The findings suggest that..."',
    usage: language => language === 'vi' ? 'Trích dẫn kết quả nghiên cứu' : 'Citing research findings',
  },
  {
    phrase: '"It is widely acknowledged that..."',
    usage: language => language === 'vi' ? 'Trình bày quan điểm phổ biến' : 'Presenting common viewpoints',
  },
];

export function OPALSection({ onStart }: OPALSectionProps) {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="py-16 lg:py-24 bg-[var(--bg-secondary)]"
      aria-labelledby="opal-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Visual — Phrase showcase */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
            className="flex justify-center order-2 lg:order-1"
          >
            <div
              className="w-full max-w-sm space-y-4"
              role="img"
              aria-label={language === 'vi' ? 'Giao diện OPAL phrases' : 'OPAL phrases interface'}
            >
              {/* OPAL pill */}
              <span className="inline-flex items-center px-3 py-1.5 bg-purple-500/10 text-purple-600 text-xs font-bold rounded-full">
                📚 Oxford Phrase Academy
              </span>

              {/* Phrase cards */}
              {[
                {
                  level: language === 'vi' ? 'Học thuật' : 'Academic',
                  levelColor: 'text-purple-600 bg-purple-100',
                  phrase: 'The findings suggest that\nclimate change has accelerated\nin the past decade.',
                  vi: 'Nghiên cứu chỉ ra rằng\nbiến đổi khí hậu đã tăng tốc\ntrong thập kỷ qua.',
                },
                {
                  level: language === 'vi' ? 'Học thuật' : 'Academic',
                  levelColor: 'text-purple-600 bg-purple-100',
                  phrase: 'It is widely acknowledged\nthat sustainable practices\nbenefit future generations.',
                  vi: 'Được công nhận rộng rãi rằng\nthực hành bền vững\nmang lại lợi ích cho thế hệ tương lai.',
                },
                {
                  level: language === 'vi' ? 'Viết' : 'Writing',
                  levelColor: 'text-blue-600 bg-blue-100',
                  phrase: 'This approach enables\nresearchers to identify\npatterns across datasets.',
                  vi: 'Phương pháp này cho phép\nnghiên cứu xác định\ncác mô hình trong dữ liệu.',
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-4 shadow-sm"
                  style={{ transform: `translateY(${i * -4}px)`, position: 'relative', zIndex: 3 - i }}
                >
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full mb-2 ${card.levelColor}`}>
                    {card.level}
                  </span>
                  <p className="text-sm font-medium text-[var(--text-primary)] italic leading-relaxed whitespace-pre-line">
                    {card.phrase}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed whitespace-pre-line">
                    {card.vi}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Text + CTA */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
            className="order-1 lg:order-2"
          >
            {/* Icon badge */}
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-2xl" aria-hidden="true">📚</span>
            </div>

            <h2
              id="opal-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] mb-4 leading-tight"
            >
              {language === 'vi' ? (
                <>Thành ngữ học thuật<br /><span className="text-purple-500">từ Oxford</span></>
              ) : (
                <>Academic Phrases<br /><span className="text-purple-500">from Oxford</span></>
              )}
            </h2>

            <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-6">
              {language === 'vi'
                ? '500+ cụm từ học thuật chuẩn quốc tế từ Oxford Phrase Academy. Tự tin viết essay, thuyết trình và giao tiếp chuyên nghiệp.'
                : '500+ academic phrases from Oxford Phrase Academy. Write essays, deliver presentations, and communicate professionally with confidence.'}
            </p>

            <ul className="space-y-2 mb-8" aria-label={language === 'vi' ? 'Tính năng' : 'Features'}>
              {[
                language === 'vi' ? 'Phát âm chuẩn từng cụm từ' : 'Native pronunciation for each phrase',
                language === 'vi' ? 'Phân loại theo ngữ cảnh: Viết, Nói, Đọc' : 'Organized by context: Writing, Speaking, Reading',
                language === 'vi' ? 'Ví dụ trong bài luận thực tế' : 'Real essay examples',
                language === 'vi' ? 'Bài tập ôn luyện kèm feedback' : 'Practice exercises with feedback',
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" aria-hidden="true" />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              onClick={onStart}
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-purple-500 hover:bg-purple-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20"
            >
              {language === 'vi' ? 'Khám phá OPAL' : 'Explore OPAL'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
