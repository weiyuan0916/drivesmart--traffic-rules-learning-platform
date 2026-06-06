import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AgriCanvas } from './Canvas';
import { useScrollProgress } from './hooks/useScrollProgress';

interface ImmersiveLandingProps {
  onBack: () => void;
}

const sceneLabels = [
  { id: 'highlands', label: "The Highlands", sub: "Vietnam's Finest Soil" },
  { id: 'farms', label: 'Coffee Farms', sub: 'Where Quality Begins' },
  { id: 'bean', label: 'Premium Beans', sub: 'Hand-Selected Excellence' },
  { id: 'craft', label: 'Artisan Craft', sub: 'From Bean to Package' },
  { id: 'products', label: 'Our Products', sub: 'Premium Selection' },
  { id: 'farmers', label: 'Our Farmers', sub: 'The Heart of AgriVietnam' },
  { id: 'impact', label: 'Global Impact', sub: '20+ Export Markets' },
  { id: 'connect', label: "Let's Connect", sub: 'Partner With Us' },
];

export function ImmersiveLanding({ onBack }: ImmersiveLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress(containerRef);
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const sceneIndex = Math.min(
      Math.floor(scrollProgress * sceneLabels.length),
      sceneLabels.length - 1
    );
    setCurrentScene(sceneIndex);
  }, [scrollProgress]);

  // Inject styles
  useEffect(() => {
    const styleId = 'agri-imm-style-v2';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .agri-root {
        position: fixed;
        inset: 0;
        z-index: 9999;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
        background: #FAF8F3;
      }
      .agri-root::-webkit-scrollbar { display: none; }
      .agri-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1;
        pointer-events: none;
      }
      .agri-back {
        position: fixed;
        top: 24px;
        left: 24px;
        z-index: 100;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: rgba(255,255,255,0.95);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0,0,0,0.08);
        border-radius: 100px;
        font-weight: 600;
        font-size: 14px;
        color: #1E1E1E;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        min-height: 48px;
      }
      .agri-back:hover { background: white; transform: translateY(-2px); }
      .agri-progress {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #3D2B1F, #C4956A);
        z-index: 100;
      }
      .agri-dots {
        position: fixed;
        right: 24px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 100;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .agri-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
        padding: 0;
      }
      .agri-dot.active {
        background: white;
        transform: scale(1.4);
        box-shadow: 0 0 12px rgba(255,255,255,0.5);
      }
      .agri-label {
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;
        text-align: center;
        pointer-events: none;
        white-space: nowrap;
      }
      .agri-label-title {
        color: rgba(255,255,255,0.85);
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        text-shadow: 0 2px 16px rgba(0,0,0,0.3);
      }
      .agri-label-sub {
        color: rgba(255,255,255,0.5);
        font-size: 11px;
        margin-top: 4px;
      }
      .agri-hint {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        pointer-events: none;
      }
      .agri-hint-text {
        color: rgba(255,255,255,0.5);
        font-size: 11px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }
      .agri-hint-arrow {
        color: rgba(255,255,255,0.5);
        animation: agri-bounce 2s ease-in-out infinite;
      }
      @keyframes agri-bounce {
        0%, 100% { transform: translateY(0); opacity: 0.7; }
        50% { transform: translateY(8px); opacity: 0.3; }
      }
      .agri-title {
        font-size: clamp(2.5rem, 8vw, 6rem);
        font-weight: 900;
        line-height: 1;
        letter-spacing: -0.03em;
        color: white;
        text-shadow: 0 4px 40px rgba(0,0,0,0.3);
      }
      .agri-sub {
        font-size: clamp(1rem, 2.5vw, 1.35rem);
        color: rgba(255,255,255,0.8);
        text-shadow: 0 2px 16px rgba(0,0,0,0.2);
      }
      .agri-cta {
        padding: 14px 32px;
        border-radius: 100px;
        font-weight: 700;
        font-size: 15px;
        background: white;
        color: #1E1E1E;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        min-height: 52px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .agri-cta:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.2); }
      .agri-cta-outline {
        background: transparent;
        border: 2px solid rgba(255,255,255,0.35);
        color: white;
      }
      .agri-cta-outline:hover { background: rgba(255,255,255,0.1); }
      .agri-stat-card {
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 20px;
        padding: 20px;
        text-align: center;
      }
      .agri-stat-value {
        font-size: 2.5rem;
        font-weight: 900;
        color: white;
        line-height: 1;
      }
      .agri-stat-label {
        font-size: 0.7rem;
        color: rgba(255,255,255,0.65);
        margin-top: 6px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      .agri-form {
        background: rgba(255,255,255,0.97);
        backdrop-filter: blur(24px);
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 24px 64px rgba(0,0,0,0.25);
        max-width: 460px;
        width: calc(100% - 32px);
      }
      .agri-input {
        width: 100%;
        padding: 14px 16px;
        border: 1.5px solid #E0D8CC;
        border-radius: 12px;
        font-size: 15px;
        background: white;
        color: #1E1E1E;
        outline: none;
        min-height: 48px;
        transition: border-color 0.3s ease;
      }
      .agri-input:focus { border-color: #3D2B1F; }
      .agri-input::placeholder { color: #A09888; }
      .agri-submit {
        width: 100%;
        padding: 16px;
        background: #1E1E1E;
        color: white;
        border: none;
        border-radius: 12px;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        min-height: 52px;
      }
      .agri-submit:hover { background: #000; transform: translateY(-2px); }
      .agri-chip {
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(12px);
        border-radius: 16px;
        padding: 16px;
      }
      @media (max-width: 768px) {
        .agri-dots { display: none !important; }
        .agri-title { font-size: clamp(2rem, 12vw, 3.5rem); }
        .agri-stat-value { font-size: 2rem; }
        .agri-form { padding: 24px; }
        .agri-back { top: 16px; left: 16px; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  const scrollToScene = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const target = (index / sceneLabels.length) * maxScroll;
    container.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  const isHero = scrollProgress < 0.12;

  return (
    <>
      {/* Scrollable root container */}
      <div ref={containerRef} className="agri-root">
        {/* 3D Canvas (fixed within scroll) */}
        <div className="agri-canvas">
          <AgriCanvas
            scrollProgress={scrollProgress}
            onLoaded={() => setCanvasLoaded(true)}
          />
        </div>

        {/* Scene content - positioned within scrollable container */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* Scene 1: Hero */}
          {currentScene === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-6 text-center flex flex-col items-center justify-center min-h-screen"
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-semibold mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-[#C4956A] animate-pulse" />
                Premium Vietnamese Agriculture
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="agri-title mb-6"
              >
                Vietnam's Finest
                <br />
                <span className="text-[#C4956A]">Agricultural Products</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="agri-sub max-w-2xl mx-auto mb-10"
              >
                Specialty Coffee, Macadamia, Black Pepper and Durian
                <br className="hidden sm:block" />
                {' '}from the pristine highlands of Vietnam
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button onClick={() => scrollToScene(5)} className="agri-cta">
                  Explore Products
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button onClick={() => scrollToScene(7)} className="agri-cta agri-cta-outline">
                  Contact Us
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Scene 2: Coffee Farms */}
          {currentScene === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-6 text-center flex flex-col items-center justify-center min-h-screen"
            >
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="agri-title text-4xl md:text-6xl mb-6"
              >
                Coffee Farms
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="agri-sub text-lg md:text-xl max-w-xl"
              >
                Grown in Vietnam's Central Highlands where altitude
                and climate create the perfect conditions for
                exceptional beans.
              </motion.p>
            </motion.div>
          )}

          {/* Scene 3: Premium Beans */}
          {currentScene === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-6 text-center flex flex-col items-center justify-center min-h-screen"
            >
              <motion.h2 className="agri-title text-4xl md:text-6xl mb-6">
                Hand-Selected
                <br />Premium Beans
              </motion.h2>
              <motion.p className="agri-sub text-lg md:text-xl max-w-xl">
                Every bean is carefully selected by experienced
                farmers to ensure only the finest quality reaches you.
              </motion.p>
            </motion.div>
          )}

          {/* Scene 4: Artisan Craft */}
          {currentScene === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-6 text-center flex flex-col items-center justify-center min-h-screen"
            >
              <motion.h2 className="agri-title text-4xl md:text-6xl mb-6">
                From Bean
                <br />to Package
              </motion.h2>
              <motion.p className="agri-sub text-lg md:text-xl max-w-xl">
                Traditional processing combined with modern quality
                control ensures every product meets our exacting standards.
              </motion.p>
            </motion.div>
          )}

          {/* Scene 5: Products */}
          {currentScene === 4 && (
            <motion.div
              key="s4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-6 text-center flex flex-col items-center justify-center min-h-screen"
            >
              <motion.h2 className="agri-title text-4xl md:text-6xl mb-4">
                Our Products
              </motion.h2>
              <motion.p className="agri-sub text-lg mb-8">
                Discover our complete range of premium Vietnamese agricultural products
              </motion.p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {['Specialty Coffee', 'Macadamia', 'Black Pepper', 'Durian'].map((p, i) => (
                  <motion.div
                    key={p}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="agri-chip"
                  >
                    <p className="text-white font-bold text-sm md:text-base">{p}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Scene 6: Farmers */}
          {currentScene === 5 && (
            <motion.div
              key="s5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-6 flex items-center justify-center min-h-screen"
            >
              <div className="max-w-2xl">
                <motion.h2 className="agri-title text-4xl md:text-5xl mb-6 text-left">
                  The Heart of
                  <br />AgriVietnam
                </motion.h2>
                <motion.p className="agri-sub text-base md:text-lg text-left mb-8">
                  Our partnership with over 1,000 farming families across Vietnam
                  is the foundation of our business. Fair prices, sustainable
                  practices, and community development.
                </motion.p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { emoji: '👨‍🌾', label: '1,000+ Farmers' },
                    { emoji: '🌱', label: '500+ Hectares' },
                    { emoji: '🌍', label: '20+ Markets' },
                    { emoji: '⭐', label: '15+ Years' },
                  ].map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="agri-stat-card"
                    >
                      <p className="text-2xl mb-2">{s.emoji}</p>
                      <p className="text-white font-bold text-sm">{s.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Scene 7: Impact */}
          {currentScene === 6 && (
            <motion.div
              key="s6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-6 text-center flex flex-col items-center justify-center min-h-screen"
            >
              <motion.h2 className="agri-title text-4xl md:text-5xl mb-8">
                Our Global Impact
              </motion.h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {[
                  { value: '1,000+', label: 'Partner Farmers' },
                  { value: '500+', label: 'Hectares' },
                  { value: '20+', label: 'Export Markets' },
                  { value: '15+', label: 'Years' },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="agri-stat-card"
                  >
                    <p className="agri-stat-value">{s.value}</p>
                    <p className="agri-stat-label">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Scene 8: Contact */}
          {currentScene === 7 && (
            <motion.div
              key="s7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-4 flex items-center justify-center min-h-screen"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="agri-form"
              >
                <h2 className="text-2xl md:text-3xl font-black text-[#1E1E1E] mb-1">
                  Let's Connect
                </h2>
                <p className="text-gray-500 mb-6 text-sm">
                  Wholesale inquiries or partnership opportunities.
                </p>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                  <input type="text" placeholder="Your Name" className="agri-input" required />
                  <input type="email" placeholder="Email Address" className="agri-input" required />
                  <select className="agri-input" defaultValue="">
                    <option value="" disabled>Inquiry Type</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="distribution">Distribution</option>
                    <option value="export">Export</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    placeholder="Your Message"
                    className="agri-input min-h-[100px] resize-none"
                    required
                  />
                  <button type="submit" className="agri-submit">
                    Send Message
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Scroll spacer */}
        <div style={{ height: '700vh' }} />
      </div>

      {/* Fixed UI elements (outside scroll container) */}
      <div
        className="agri-progress"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <button onClick={onBack} className="agri-back" aria-label="Back to DriveSmart">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      <div className="agri-dots">
        {sceneLabels.map((scene, i) => (
          <button
            key={scene.id}
            onClick={() => scrollToScene(i)}
            className={`agri-dot ${i === currentScene ? 'active' : ''}`}
            aria-label={`Go to ${scene.label}`}
          />
        ))}
      </div>

      {isHero && canvasLoaded && (
        <motion.div
          className="agri-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="agri-hint-text">Scroll</span>
          <svg className="agri-hint-arrow w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      )}

      <div className="agri-label">
        <p className="agri-label-title">{sceneLabels[currentScene]?.label}</p>
        <p className="agri-label-sub">{sceneLabels[currentScene]?.sub}</p>
      </div>

      {/* Loading screen */}
      <AnimatePresence>
        {!canvasLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[99999] bg-[#FAF8F3] flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-[#3D2B1F] border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-[#3D2B1F] font-semibold">Loading Experience...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
