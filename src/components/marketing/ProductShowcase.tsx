import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { products } from './data/products';

interface ProductShowcaseProps {
  onExplore: () => void;
}

export function ProductShowcase({ onExplore }: ProductShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, 5000);
  }, []);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    startAutoplay();
  }, [activeIndex, startAutoplay]);

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % products.length);
    startAutoplay();
  }, [startAutoplay]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
    startAutoplay();
  }, [startAutoplay]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const product = products[activeIndex];

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .agri-showcase {
        min-height: 100vh;
        transition: background 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .agri-showcase-image {
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 32px 64px rgba(0,0,0,0.12);
      }
      .agri-showcase-image img {
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .agri-showcase-image:hover img {
        transform: scale(1.05);
      }
      .agri-showcase-cta {
        padding: 12px 28px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        min-height: 48px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: none;
      }
      .agri-showcase-cta.primary {
        background: white;
        color: #1E1E1E;
      }
      .agri-showcase-cta.primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0,0,0,0.15);
      }
      .agri-showcase-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255,255,255,0.4);
        transition: all 0.3s ease;
        cursor: pointer;
        border: none;
      }
      .agri-showcase-dot.active {
        width: 28px;
        border-radius: 4px;
        background: white;
      }
      .agri-nav-circle {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: rgba(255,255,255,0.15);
        border: 1px solid rgba(255,255,255,0.25);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(8px);
        min-height: 52px;
      }
      .agri-nav-circle:hover {
        background: rgba(255,255,255,0.25);
        transform: scale(1.05);
      }
      .agri-nav-circle:active {
        transform: scale(0.95);
      }
    `;
    document.head.appendChild(style);
    return function cleanup() {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section
      className="agri-showcase relative overflow-hidden"
      style={{ backgroundColor: product.bgColor }}
      aria-label="Product showcase"
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl py-20 md:py-28">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold tracking-widest uppercase opacity-60"
            style={{ color: product.textColor }}>
            Our Products
          </span>
          <h2 className="text-4xl md:text-5xl font-black mt-3"
            style={{ color: product.textColor }}>
            Premium Selection
          </h2>
        </motion.div>

        {/* Product Slider */}
        <div className="relative min-h-[500px] md:min-h-[560px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={product.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 flex items-center"
            >
              <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center w-full">
                {/* Image Side */}
                <motion.div
                  className="agri-showcase-image relative aspect-square max-w-md mx-auto md:mx-0 w-full"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {product.badge && (
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                      style={{ backgroundColor: product.accentColor, color: product.bgColor }}>
                      {product.badge}
                    </span>
                  )}
                </motion.div>

                {/* Content Side */}
                <div className="text-center md:text-left">
                  <span className="text-sm font-semibold tracking-widest uppercase opacity-70 mb-4 block"
                    style={{ color: product.textColor }}>
                    {product.category}
                  </span>
                  <h3 className="text-4xl md:text-5xl font-black mb-3"
                    style={{ color: product.textColor }}>
                    {product.name}
                  </h3>
                  <p className="text-lg md:text-xl font-medium mb-4 opacity-80"
                    style={{ color: product.accentColor }}>
                    {product.tagline}
                  </p>
                  <p className="text-base md:text-lg mb-8 leading-relaxed max-w-md mx-auto md:mx-0"
                    style={{ color: product.textColor, opacity: 0.8 }}>
                    {product.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 justify-center md:justify-start">
                    <div>
                      <span className="text-3xl md:text-4xl font-black"
                        style={{ color: product.textColor }}>
                        {product.price}
                      </span>
                      <span className="text-base ml-2 opacity-70"
                        style={{ color: product.textColor }}>
                        VND / {product.unit}
                      </span>
                    </div>
                  </div>
                  <button onClick={onExplore} className="agri-showcase-cta primary">
                    View Details
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center md:justify-between mt-12">
          <button
            onClick={goPrev}
            className="agri-nav-circle hidden md:flex"
            aria-label="Previous product"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {products.map((p, i) => (
              <button
                key={p.id}
                onClick={() => goToSlide(i)}
                className={`agri-showcase-dot ${i === activeIndex ? 'active' : ''}`}
                aria-label={`Go to ${p.name}`}
                style={i === activeIndex ? { backgroundColor: product.textColor } : {}}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="agri-nav-circle hidden md:flex"
            aria-label="Next product"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/2 -translate-y-1/2 -right-20 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ backgroundColor: product.accentColor }} />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-5 pointer-events-none"
        style={{ backgroundColor: product.accentColor }} />
    </section>
  );
}
