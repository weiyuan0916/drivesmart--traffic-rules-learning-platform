import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../../context/LanguageContext';
import { useReducedMotion } from '../../../hooks/useScrollAnimation';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  textVi: string;
  textEn: string;
  product: string;
  accentColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Nguyễn Minh Hoàng',
    role: 'Nhân viên văn phòng',
    avatar: '👨‍💼',
    rating: 5,
    textVi: 'Mình thi GPLX B1 lần đầu và đậu ngay với 95 điểm. Giao diện rất dễ dùng, câu hỏi sát thực tế. AI phân tích tình huống giao thông rất hữu ích.',
    textEn: 'Passed B1 GPLX on first try with 95 points. Easy interface, realistic questions. AI traffic analysis is very helpful.',
    product: 'Thi GPLX',
    accentColor: 'var(--accent)',
  },
  {
    name: 'Trần Thị Lan',
    role: 'Giảng viên đại học',
    avatar: '👩‍🏫',
    rating: 5,
    textVi: 'Tôi dùng flashcard từ vựng mỗi sáng. Đã học được hơn 2,000 từ mới. Spaced repetition giúp nhớ lâu hơn rất nhiều so với cách học truyền thống.',
    textEn: 'Using vocabulary flashcards every morning. Learned 2,000+ new words. Spaced repetition makes remembering so much easier.',
    product: 'Từ vựng',
    accentColor: 'var(--success)',
  },
  {
    name: 'Lê Văn Đức',
    role: 'Kỹ sư phần mềm',
    avatar: '👨‍💻',
    rating: 5,
    textVi: 'Phần luyện nghe chép chính tả rất tốt. Tôi cải thiện được kỹ năng nghe từ IELTS 5.0 lên 7.0 sau 3 tháng. Bài tập đa dạng từ dễ đến khó.',
    textEn: 'Dictation exercises are excellent. Improved listening from IELTS 5.0 to 7.0 in 3 months. Exercises vary from easy to hard.',
    product: 'Luyện nghe',
    accentColor: 'var(--primary)',
  },
  {
    name: 'Phạm Thu Hà',
    role: 'Du học sinh',
    avatar: '👩‍🎓',
    rating: 5,
    textVi: 'OPAL phrases giúp tôi tự tin hơn khi viết essay và thuyết trình ở trường. Các cụm từ học thuật rất chuẩn và dễ áp dụng.',
    textEn: 'OPAL phrases helped me feel more confident writing essays and presenting. Academic phrases are very standard and easy to apply.',
    product: 'OPAL',
    accentColor: '#9333ea',
  },
];

export function SocialProof() {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);

  const testimonial = TESTIMONIALS[current];
  const nextTestimonial = TESTIMONIALS[(current + 1) % TESTIMONIALS.length];

  return (
    <section
      className="py-16 lg:py-24 bg-[var(--bg-primary)]"
      aria-labelledby="social-proof-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2
            id="social-proof-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] mb-4"
          >
            {language === 'vi' ? (
              <>Học viên <span className="text-[var(--accent)]">nói gì</span></>
            ) : (
              <>What learners <span className="text-[var(--accent)]">say</span></>
            )}
          </h2>
          <p className="text-[var(--text-secondary)] text-lg lg:text-xl max-w-xl mx-auto">
            {language === 'vi'
              ? 'Hơn 50,000 học viên đã vượt qua kỳ thi GPLX cùng DriveSmart.'
              : 'Over 50,000 learners have passed their GPLX exam with DriveSmart.'}
          </p>
        </motion.div>

        {/* Testimonial cards — 2 at a time on desktop */}
        <div className="relative">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Current testimonial */}
            <motion.div
              key={current}
              initial={reducedMotion ? false : { opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: 'easeInOut' as const }}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 shadow-lg relative overflow-hidden"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-[var(--border)]" aria-hidden="true" />
              <div className="flex gap-1 mb-5" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <blockquote>
                <p className="text-[var(--text-primary)] text-lg leading-relaxed mb-8">
                  "{language === 'vi' ? testimonial.textVi : testimonial.textEn}"
                </p>
              </blockquote>
              <div className="flex items-center gap-4 pt-5 border-t border-[var(--border)]">
                <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-2xl" role="img" aria-hidden="true">
                  {testimonial.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base text-[var(--text-primary)]">{testimonial.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">{testimonial.role}</p>
                </div>
                <span
                  className="px-3 py-1.5 text-xs font-bold rounded-full"
                  style={{ backgroundColor: `color-mix(in srgb, ${testimonial.accentColor} 15%, transparent)`, color: testimonial.accentColor }}
                >
                  {testimonial.product}
                </span>
              </div>
            </motion.div>

            {/* Next testimonial — faded */}
            <motion.div
              key={`next-${current}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.4 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 opacity-40 hidden md:block"
            >
              <div className="flex gap-1 mb-5" aria-label={`${nextTestimonial.rating} stars`}>
                {Array.from({ length: nextTestimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <p className="text-[var(--text-primary)] text-lg leading-relaxed mb-8 line-clamp-3">
                "{language === 'vi' ? nextTestimonial.textVi : nextTestimonial.textEn}"
              </p>
              <div className="flex items-center gap-4 pt-5 border-t border-[var(--border)]">
                <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-2xl">
                  {nextTestimonial.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base text-[var(--text-primary)]">{nextTestimonial.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">{nextTestimonial.role}</p>
                </div>
                <span
                  className="px-3 py-1.5 text-xs font-bold rounded-full"
                  style={{ backgroundColor: `color-mix(in srgb, ${nextTestimonial.accentColor} 15%, transparent)`, color: nextTestimonial.accentColor }}
                >
                  {nextTestimonial.product}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5" aria-label="Testimonial indicators">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`
                    h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                    ${i === current ? 'w-8 bg-[var(--accent)]' : 'w-2 bg-[var(--border)] hover:bg-[var(--text-muted)]'}
                  `}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === current ? 'true' : undefined}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={prev}
                className="p-3 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center border border-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label={language === 'vi' ? 'Testimonial trước' : 'Previous testimonial'}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="p-3 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center border border-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label={language === 'vi' ? 'Testimonial tiếp theo' : 'Next testimonial'}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
