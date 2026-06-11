import { motion } from 'motion/react';
import { useLanguage } from '../../../context/LanguageContext';
import { useReducedMotion } from '../../../hooks/useScrollAnimation';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface AgriSectionProps {
  onExplore: () => void;
}

const PRODUCTS = [
  { name: 'Coffee', emoji: '☕', color: '#6F4E37', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  { name: 'Macadamia', emoji: '🌰', color: '#C4956A', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  { name: 'Black Pepper', emoji: '🌶️', color: '#2D2D2D', bg: 'bg-stone-100 dark:bg-stone-900/20' },
  { name: 'Passion Fruit', emoji: '🍋', color: '#F5C842', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
  { name: 'Durian', emoji: '🥭', color: '#8BC34A', bg: 'bg-lime-50 dark:bg-lime-950/20' },
];

export function AgriSection({ onExplore }: AgriSectionProps) {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="py-16 lg:py-24 bg-[var(--bg-secondary)]"
      aria-labelledby="agri-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
          className="text-center mb-12 lg:mb-16"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 text-xs font-semibold rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {language === 'vi' ? 'Sản phẩm nông nghiệp' : 'Agricultural Products'}
          </span>

          <h2
            id="agri-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] mb-4"
          >
            {language === 'vi' ? (
              <>Nông sản Việt Nam<br /><span className="text-emerald-500">cao cấp</span></>
            ) : (
              <>Premium Vietnamese<br /><span className="text-emerald-500">Agricultural Products</span></>
            )}
          </h2>

          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            {language === 'vi'
              ? 'Khám phá cà phê, macadamia, tiêu đen, sầu riêng và trái cây hữu cơ từ vùng cao nguyên Việt Nam.'
              : 'Discover specialty coffee, macadamia, black pepper, durian and organic fruits from the pristine highlands of Vietnam.'}
          </p>
        </motion.div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={product.name}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`
                ${product.bg} border border-[var(--border)] rounded-2xl p-5
                flex flex-col items-center text-center gap-3
                hover:shadow-md transition-shadow duration-200
                group cursor-pointer
              `}
              role="article"
              aria-label={product.name}
            >
              <span className="text-4xl" aria-hidden="true">{product.emoji}</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{product.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {[
            { value: '1,000+', labelVi: 'Nông dân đối tác', labelEn: 'Partner Farmers' },
            { value: '500+', labelVi: 'Hecta canh tác', labelEn: 'Hectares' },
            { value: '20+', labelVi: 'Thị trường xuất khẩu', labelEn: 'Export Markets' },
            { value: '15+', labelVi: 'Năm kinh nghiệm', labelEn: 'Years Experience' },
          ].map((stat) => (
            <div key={stat.labelEn} className="text-center p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)]">
              <p className="text-2xl font-black text-[var(--accent)]">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {language === 'vi' ? stat.labelVi : stat.labelEn}
              </p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <button
            onClick={onExplore}
            className="group inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            {language === 'vi' ? 'Xem sản phẩm' : 'Explore Products'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4" aria-label={language === 'vi' ? 'Đặc điểm' : 'Features'}>
            {[
              language === 'vi' ? 'Xuất khẩu 20+ quốc gia' : 'Exporting to 20+ countries',
              language === 'vi' ? 'Canh tác bền vững' : 'Sustainable farming',
              language === 'vi' ? 'Chứng nhận quốc tế' : 'International certifications',
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                {feat}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
