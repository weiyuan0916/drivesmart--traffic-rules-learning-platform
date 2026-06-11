import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../../context/LanguageContext';
import { useReducedMotion } from '../../../hooks/useScrollAnimation';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  textVi: string;
  textEn: string;
  product: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Nguyễn Minh Hoàng',
    role: 'Nhân viên văn phòng',
    avatar: '👨‍💼',
    rating: 5,
    textVi: 'Mình thi GPLX B1 lần đầu và đậu ngay với 95 điểm. Giao diện rất dễ dùng, câu hỏi sát thực tế. Đặc biệt là AI phân tích tình huống giao thông rất hữu ích.',
    textEn: 'I passed my B1 GPLX test on the first try with 95 points. The interface is very easy to use and the questions are realistic.',
    product: 'Thi GPLX',
  },
  {
    name: 'Trần Thị Lan',
    role: 'Giảng viên đại học',
    avatar: '👩‍🏫',
    rating: 5,
    textVi: 'Tôi dùng flashcard từ vựng mỗi sáng. Đã học được hơn 2,000 từ mới. Tính năng spaced repetition giúp nhớ lâu hơn rất nhiều so với cách học truyền thống.',
    textEn: 'I use the vocabulary flashcards every morning. I have learned over 2,000 new words. Spaced repetition helps me remember so much better.',
    product: 'Từ vựng',
  },
  {
    name: 'Lê Văn Đức',
    role: 'Kỹ sư phần mềm',
    avatar: '👨‍💻',
    rating: 5,
    textVi: 'Phần luyện nghe chép chính tả rất tốt. Tôi cải thiện được kỹ năng nghe từ IELTS 5.0 lên 7.0 sau 3 tháng. Bài tập đa dạng, từ dễ đến khó.',
    textEn: 'The dictation exercises are excellent. I improved my listening from IELTS 5.0 to 7.0 in 3 months. The exercises are varied from easy to hard.',
    product: 'Luyện nghe',
  },
  {
    name: 'Phạm Thu Hà',
    role: 'Du học sinh',
    avatar: '👩‍🎓',
    rating: 5,
    textVi: 'OPAL phrases giúp tôi tự tin hơn khi viết essay và thuyết trình ở trường. Các cụm từ học thuật rất chuẩn và dễ áp dụng.',
    textEn: 'OPAL phrases helped me feel more confident writing essays and presenting at school. The academic phrases are very standard and easy to apply.',
    product: 'OPAL',
  },
  {
    name: 'Hoàng Anh Tuấn',
    role: 'Doanh nhân',
    avatar: '👨‍🍳',
    rating: 5,
    textVi: 'AgriVietnam là cách tuyệt vời để giới thiệu sản phẩm cà phê Việt Nam đến khách hàng quốc tế. Trang web rất chuyên nghiệp và đẹp mắt.',
    textEn: 'AgriVietnam is a wonderful way to introduce Vietnamese coffee products to international customers. The website is very professional and beautiful.',
    product: 'AgriVietnam',
  },
];

export function SocialProof() {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);

  const testimonial = TESTIMONIALS[current];

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
          className="text-center mb-12"
        >
          <h2
            id="social-proof-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] mb-3"
          >
            {language === 'vi' ? (
              <>Học viên nói gì về <span className="text-[var(--accent)]">DriveSmart</span></>
            ) : (
              <>What learners say about <span className="text-[var(--accent)]">DriveSmart</span></>
            )}
          </h2>
          <p className="text-[var(--text-secondary)] text-base">
            {language === 'vi'
              ? 'Hơn 50,000 học viên đã vượt qua kỳ thi GPLX cùng DriveSmart.'
              : 'Over 50,000 learners have passed their GPLX exam with DriveSmart.'}
          </p>
        </motion.div>

        {/* Testimonial carousel */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={reducedMotion ? {} : { opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: 'easeInOut' as const }}
                className="space-y-5"
              >
                {/* Stars */}
                <div className="flex gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote>
                  <p className="text-[var(--text-primary)] text-base sm:text-lg leading-relaxed">
                    {language === 'vi' ? testimonial.textVi : testimonial.textEn}
                  </p>
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)]">
                  <div
                    className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-xl flex-shrink-0"
                    role="img"
                    aria-hidden="true"
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{testimonial.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{testimonial.role}</p>
                  </div>
                  <span className="ml-auto px-2.5 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold rounded-full">
                    {testimonial.product}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]">
              <div className="flex gap-1.5" aria-label="Testimonial indicators">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`
                      w-1.5 h-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                      ${i === current
                        ? 'bg-[var(--accent)] w-5'
                        : 'bg-[var(--border)] hover:bg-[var(--text-muted)]'}
                    `}
                    aria-label={`Go to testimonial ${i + 1}`}
                    aria-current={i === current ? 'true' : undefined}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  aria-label={language === 'vi' ? 'Testimonial trước' : 'Previous testimonial'}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={next}
                  className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  aria-label={language === 'vi' ? 'Testimonial tiếp theo' : 'Next testimonial'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
