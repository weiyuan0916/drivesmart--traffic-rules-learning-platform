import { useCallback } from 'react';
import { motion } from 'motion/react';
import { SEO } from './SEO';
import { StickyHeader } from './StickyHeader';
import { HeroSection } from './sections/HeroSection';
import { TrustBar } from './sections/TrustBar';
import { SocialProofSection } from './sections/SocialProofSection';
import { DrivingTestSection } from './sections/DrivingTestSection';
import { VocabularySection } from './sections/VocabularySection';
import { OPALSection } from './sections/OPALSection';
import { ListeningSection } from './sections/ListeningSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { FAQSection } from './sections/FAQSection';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './sections/Footer';

export interface HomepageNavCallbacks {
  onNavigateDriving: () => void;
  onNavigateVocabulary: () => void;
  onNavigateOPAL: () => void;
  onNavigateListening: () => void;
  onNavigateAgri: () => void;
}

const SECTION_IDS = [
  'hero',
  'driving',
  'vocabulary',
  'opal',
  'listening',
  'testimonials',
  'faq',
  'cta',
];

const PAGE_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

export function Homepage({ nav }: { nav: HomepageNavCallbacks }) {
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <>
      <SEO />

      <StickyHeader
        onNavigate={scrollToSection}
      />

      <motion.main
        id="main-content"
        variants={PAGE_VARIANTS}
        initial="hidden"
        animate="visible"
        className="bg-[var(--bg-primary)]"
        role="main"
      >
        {/* Skip to content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-white focus:rounded-lg focus:font-semibold focus:text-sm"
        >
          Skip to main content
        </a>

        {/* 1. Hero */}
        <HeroSection
          onStartTest={nav.onNavigateDriving}
          onExplore={() => scrollToSection('driving')}
        />

        {/* 2. Trust bar */}
        <TrustBar />

        {/* 3. Social proof */}
        <SocialProofSection />

        {/* 4. Driving Test */}
        <DrivingTestSection onStart={nav.onNavigateDriving} />

        {/* 5. Vocabulary */}
        <VocabularySection onStart={nav.onNavigateVocabulary} />

        {/* 6. OPAL */}
        <OPALSection onStart={nav.onNavigateOPAL} />

        {/* 7. Listening */}
        <ListeningSection onStart={nav.onNavigateListening} />

        {/* 8. Testimonials */}
        <TestimonialsSection />

        {/* 9. FAQ */}
        <FAQSection />

        {/* 10. Final CTA */}
        <FinalCTA
          onStartLearning={nav.onNavigateDriving}
          onRegister={nav.onNavigateDriving}
        />

        {/* Footer */}
        <Footer />
      </motion.main>
    </>
  );
}
