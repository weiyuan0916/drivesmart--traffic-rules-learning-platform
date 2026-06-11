import { useCallback } from 'react';
import { motion } from 'motion/react';
import { SEO } from './SEO';
import { StickyHeader } from './StickyHeader';
import { HeroSection } from './sections/HeroSection';
import { VocabularySection } from './sections/VocabularySection';
import { OPALSection } from './sections/OPALSection';
import { ListeningSection } from './sections/ListeningSection';
import { AgriSection } from './sections/AgriSection';
import { SocialProof } from './sections/SocialProof';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './sections/Footer';
import { useInViewSection, useReducedMotion } from '../../hooks/useScrollAnimation';

const SECTION_IDS = ['hero', 'vocabulary', 'opal', 'listening', 'agri', 'social-proof', 'cta'];

const PAGE_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export function Homepage() {
  const activeSection = useInViewSection(SECTION_IDS);
  const reducedMotion = useReducedMotion();

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <>
      <SEO />

      <StickyHeader activeSection={activeSection} onNavigate={scrollToSection} />

      <motion.main
        id="main-content"
        variants={reducedMotion ? undefined : PAGE_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-[var(--bg-primary)] text-[var(--text-primary)]"
        role="main"
      >
        {/* Skip to content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-white focus:rounded-lg focus:font-semibold focus:text-sm"
        >
          Skip to main content
        </a>

        {/* Section 1: Hero — Driving Test */}
        <section id="hero" aria-label="Hero — Driving Test">
          <HeroSection onStartTest={() => scrollToSection('vocabulary')} onExplore={() => scrollToSection('vocabulary')} />
        </section>

        {/* Section 2: Vocabulary */}
        <section id="vocabulary" aria-label="English Vocabulary">
          <VocabularySection onStart={() => scrollToSection('opal')} />
        </section>

        {/* Section 3: OPAL */}
        <section id="opal" aria-label="OPAL Phrases">
          <OPALSection onStart={() => scrollToSection('listening')} />
        </section>

        {/* Section 4: Listening */}
        <section id="listening" aria-label="Practice Listening">
          <ListeningSection onStart={() => scrollToSection('agri')} />
        </section>

        {/* Section 5: AgriVietnam */}
        <section id="agri" aria-label="AgriVietnam Products">
          <AgriSection onExplore={() => scrollToSection('social-proof')} />
        </section>

        {/* Section 6: Social Proof */}
        <section id="social-proof" aria-label="Social Proof">
          <SocialProof />
        </section>

        {/* Section 7: Final CTA */}
        <section id="cta" aria-label="Call to Action">
          <FinalCTA />
        </section>

        {/* Footer */}
        <Footer />
      </motion.main>
    </>
  );
}
