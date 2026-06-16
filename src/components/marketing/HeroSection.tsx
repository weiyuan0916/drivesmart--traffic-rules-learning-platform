import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { products } from './data/products';

interface HeroSectionProps {
  onExplore: () => void;
  onContact: () => void;
}

export function HeroSection({ onExplore, onContact }: HeroSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes agri-scroll-hint {
        0%, 100% { transform: translateY(0); opacity: 1; }
        50% { transform: translateY(8px); opacity: 0.5; }
      }
      .agri-scroll-hint {
        animation: agri-scroll-hint 2s ease-in-out infinite;
      }
      .agri-hero-bg {
        background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 60%, #EFF1F4 100%);
      }
      .agri-hero-title {
        font-size: clamp(2.5rem, 6vw, 5rem);
        line-height: 1.1;
        letter-spacing: -0.02em;
      }
      .agri-hero-sub {
        font-size: clamp(1rem, 2vw, 1.25rem);
        line-height: 1.6;
        color: #525252;
        max-width: 540px;
      }
      .agri-hero-cta {
        padding: 14px 32px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        min-height: 48px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: none;
        text-decoration: none;
      }
      .agri-hero-cta.primary {
        background: #1a1a1a;
        color: white;
      }
      .agri-hero-cta.primary:hover {
        background: #000;
        transform: translateY(-2px);
        box-shadow: 0 16px 40px rgba(0,0,0,0.18);
      }
      .agri-hero-cta.secondary {
        background: white;
        color: #1a1a1a;
        border: 1.5px solid #e0e0e0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      }
      .agri-hero-cta.secondary:hover {
        border-color: #1a1a1a;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      }
      .agri-hero-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #d0d0d0;
        transition: all 0.3s ease;
        cursor: pointer;
      }
      .agri-hero-dot.active {
        width: 24px;
        border-radius: 3px;
        background: #1a1a1a;
      }
      .agri-hero-image-wrap {
        position: relative;
        width: min(480px, 45vw);
        aspect-ratio: 1;
      }
      .agri-hero-image-inner {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 32px;
        overflow: hidden;
        box-shadow: 0 40px 80px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.05);
      }
      .agri-hero-image-inner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.6s ease-in-out;
      }
      .agri-hero-accent {
        position: absolute;
        border-radius: 50%;
        opacity: 0.08;
        filter: blur(80px);
      }
    `;
    document.head.appendChild(style);
    return function cleanup() {
      document.head.removeChild(style);
    };
  }, []);

  const currentProduct = products[currentImageIndex];

  return (
    <section
      ref={containerRef}
      className="agri-hero-bg relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Decorative accent blobs */}
      <motion.div
        className="agri-hero-accent w-96 h-96 -top-20 -right-20"
        style={{ backgroundColor: currentProduct.accentColor }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.18, 0.12] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="agri-hero-accent w-64 h-64 bottom-10 left-10"
        style={{ backgroundColor: currentProduct.accentColor }}
        animate={{ scale: [1, 0.9, 1], opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Background grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left: Text Content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            style={{ opacity: contentOpacity, y: contentY }}
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{ backgroundColor: `${currentProduct.accentColor}20`, color: currentProduct.bgColor }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentProduct.accentColor }} />
                Premium Vietnamese Products
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="agri-hero-title font-black mb-6"
              style={{ color: '#0a0a0a' }}
            >
              Vietnam's Finest
              <br />
              <span style={{ color: currentProduct.bgColor }}>Agricultural Products</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="agri-hero-sub mx-auto lg:mx-0 mb-10"
            >
              Premium Coffee, Macadamia, Black Pepper and Durian
              <br className="hidden sm:block" />
              {' '}from the pristine highlands of Vietnam.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button onClick={onExplore} className="agri-hero-cta primary">
                Explore Products
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button onClick={onContact} className="agri-hero-cta secondary">
                Contact Us
              </button>
            </motion.div>

            {/* Image dots */}
            <div className="flex items-center gap-2 mt-10 justify-center lg:justify-start">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`agri-hero-dot ${i === currentImageIndex ? 'active' : ''}`}
                  aria-label={`View ${p.name}`}
                  style={i === currentImageIndex ? { backgroundColor: p.bgColor } : {}}
                />
              ))}
            </div>
          </motion.div>

          {/* Right: Product Image */}
          <motion.div
            className="agri-hero-image-wrap flex-shrink-0"
            style={{ scale: imageScale }}
          >
            <div className="agri-hero-image-inner">
              {products.map((p, i) => (
                <motion.img
                  key={p.id}
                  src={p.image}
                  alt={p.name}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: i === currentImageIndex ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        aria-hidden="true"
      >
        <span className="text-xs text-gray-400 tracking-widest uppercase">Scroll</span>
        <div className="agri-scroll-hint">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
