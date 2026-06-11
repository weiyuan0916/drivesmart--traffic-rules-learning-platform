import { motion } from 'motion/react';
import { useLanguage } from '../../../context/LanguageContext';
import { useReducedMotion } from '../../../hooks/useScrollAnimation';
import { ArrowRight, CheckCircle, Globe, Leaf, Award, TrendingUp } from 'lucide-react';

interface AgriSectionProps {
  onExplore: () => void;
}

const PRODUCTS = [
  { name: 'Coffee', emoji: '☕', color: '#6F4E37', bg: 'bg-amber-50 dark:bg-amber-950/20', accent: 'text-amber-700', labelVi: 'Cà phê', labelEn: 'Coffee' },
  { name: 'Macadamia', emoji: '🌰', color: '#C4956A', bg: 'bg-orange-50 dark:bg-orange-950/20', accent: 'text-orange-700', labelVi: 'Macadamia', labelEn: 'Macadamia' },
  { name: 'Black Pepper', emoji: '🌶️', color: '#2D2D2D', bg: 'bg-stone-100 dark:bg-stone-900/20', accent: 'text-stone-700', labelVi: 'Tiêu đen', labelEn: 'Black Pepper' },
  { name: 'Passion Fruit', emoji: '🍋', color: '#F5C842', bg: 'bg-yellow-50 dark:bg-yellow-950/20', accent: 'text-yellow-700', labelVi: 'Chanh dây', labelEn: 'Passion Fruit' },
  { name: 'Durian', emoji: '🥭', color: '#8BC34A', bg: 'bg-lime-50 dark:bg-lime-950/20', accent: 'text-lime-700', labelVi: 'Sầu riêng', labelEn: 'Durian' },
];

const STATS = [
  { value: '1,000+', label: 'Nông dân đối tác', labelEn: 'Partner Farmers', icon: Leaf, color: 'text-emerald-500' },
  { value: '500+', label: 'Hecta canh tác', labelEn: 'Hectares', icon: TrendingUp, color: 'text-blue-500' },
  { value: '20+', label: 'Thị trường xuất khẩu', labelEn: 'Export Markets', icon: Globe, color: 'text-purple-500' },
  { value: '15+', label: 'Năm kinh nghiệm', labelEn: 'Years Experience', icon: Award, color: 'text-amber-500' },
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

        {/* Top: header + CTA in one row */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14"
        >
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 text-sm font-bold rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {language === 'vi' ? 'Sản phẩm nông nghiệp cao cấp' : 'Premium Agricultural Products'}
            </span>
            <h2
              id="agri-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] leading-[1.05] mb-3"
            >
              {language === 'vi' ? (
                <>Nông sản Việt Nam<br /><span className="text-emerald-500">cao cấp</span></>
              ) : (
                <>Premium Vietnamese<br /><span className="text-emerald-500">Agricultural Products</span></>
              )}
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mt-3">
              {language === 'vi'
                ? 'Khám phá cà phê, macadamia, tiêu đen, sầu riêng và trái cây hữu cơ từ vùng cao nguyên Việt Nam.'
                : 'Discover specialty coffee, macadamia, black pepper, durian and organic fruits from the pristine highlands of Vietnam.'}
            </p>
          </div>
          <button
            onClick={onExplore}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base rounded-2xl transition-all duration-200 min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20 flex-shrink-0"
          >
            {language === 'vi' ? 'Xem sản phẩm' : 'Explore Products'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>
        </motion.div>

        {/* Product grid — larger cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-14">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={product.name}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`
                ${product.bg} border border-[var(--border)] rounded-3xl p-6
                flex flex-col items-center text-center gap-4
                hover:shadow-xl hover:-translate-y-1 transition-all duration-200
                group cursor-pointer
              `}
              role="article"
              aria-label={product.name}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
                style={{ backgroundColor: `${product.color}20` }}
              >
                {product.emoji}
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)]">{product.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {language === 'vi' ? product.labelVi : product.labelEn}
                </p>
              </div>
              <span className={`text-xs font-semibold ${product.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
                {language === 'vi' ? 'Khám phá →' : 'Explore →'}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Stats row — large cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map(({ value, label, labelEn, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
              className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
            >
              <Icon className={`w-7 h-7 ${color} mx-auto mb-3`} aria-hidden="true" />
              <p className="text-3xl font-black text-[var(--accent)]">{value}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {language === 'vi' ? label : labelEn}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom trust row */}
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10" aria-label={language === 'vi' ? 'Đặc điểm' : 'Features'}>
          {[
            language === 'vi' ? 'Xuất khẩu 20+ quốc gia' : 'Exporting to 20+ countries',
            language === 'vi' ? 'Canh tác bền vững' : 'Sustainable farming',
            language === 'vi' ? 'Chứng nhận quốc tế' : 'International certifications',
          ].map((feat) => (
            <li key={feat} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              {feat}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
