import { useEffect } from 'react';
import { motion } from 'motion/react';
import { HeroSection } from './HeroSection';
import { ProductShowcase } from './ProductShowcase';
import { StorySection } from './StorySection';
import { CategoryGrid } from './CategoryGrid';

interface AgriVietnamLandingProps {
  onBack: () => void;
}

export function AgriVietnamLanding({ onBack }: AgriVietnamLandingProps) {
  useEffect(() => {
    // Inject global styles
    const style = document.createElement('style');
    style.textContent = `
      .agri-landing {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: #FAF8F3;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
      }
      .agri-landing::-webkit-scrollbar {
        width: 6px;
      }
      .agri-landing::-webkit-scrollbar-track {
        background: transparent;
      }
      .agri-landing::-webkit-scrollbar-thumb {
        background: rgba(0,0,0,0.15);
        border-radius: 3px;
      }

      /* Footer */
      .agri-footer {
        background: #1E1E1E;
        color: white;
      }
      .agri-footer-link {
        color: rgba(255,255,255,0.6);
        transition: color 0.3s ease;
        font-size: 14px;
      }
      .agri-footer-link:hover {
        color: white;
      }
      .agri-footer-input {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 12px;
        padding: 12px 16px;
        color: white;
        font-size: 14px;
        outline: none;
        width: 100%;
        transition: border-color 0.3s ease;
        min-height: 48px;
      }
      .agri-footer-input:focus {
        border-color: rgba(255,255,255,0.4);
      }
      .agri-footer-input::placeholder {
        color: rgba(255,255,255,0.4);
      }
      .agri-footer-btn {
        background: white;
        color: #1E1E1E;
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-height: 48px;
        white-space: nowrap;
      }
      .agri-footer-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(255,255,255,0.2);
      }

      /* Contact section */
      .agri-contact-card {
        background: white;
        border-radius: 24px;
        padding: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      }
      .agri-contact-input {
        width: 100%;
        padding: 14px 16px;
        border: 1.5px solid #E8E4DC;
        border-radius: 12px;
        font-size: 15px;
        color: #1E1E1E;
        outline: none;
        transition: border-color 0.3s ease;
        background: #FAF8F3;
        min-height: 48px;
      }
      .agri-contact-input:focus {
        border-color: #3D2B1F;
      }
      .agri-contact-input::placeholder {
        color: #A09888;
      }
      .agri-contact-textarea {
        min-height: 120px;
        resize: vertical;
      }
      .agri-contact-submit {
        width: 100%;
        padding: 14px 32px;
        background: #1E1E1E;
        color: white;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-height: 52px;
      }
      .agri-contact-submit:hover {
        background: #000;
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0,0,0,0.15);
      }
    `;
    document.head.appendChild(style);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.head.removeChild(style);
      document.body.style.overflow = '';
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExplore = () => {
    document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="agri-landing">
      {/* Back button fixed */}
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-5 left-5 z-[10000] flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-sm font-medium text-[#1E1E1E] hover:bg-white transition-colors min-h-[44px]"
        aria-label="Back to DriveSmart"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </motion.button>

      {/* Hero Section */}
      <HeroSection onExplore={handleExplore} onContact={handleContact} />

      {/* Product Showcase */}
      <div id="showcase">
        <ProductShowcase onExplore={handleExplore} />
      </div>

      {/* Story Section */}
      <StorySection />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Contact Section */}
      <section id="contact" className="bg-[#FAF8F3] py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-sm font-semibold tracking-widest uppercase text-[#8B7355]">
                Get In Touch
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1E1E1E] mt-4 mb-6 leading-tight">
                Let's Build Something
                <br />
                <span className="text-[#6F4E37]">Extraordinary Together</span>
              </h2>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                Whether you're a retailer, distributor, or restaurant looking for premium Vietnamese agricultural products, we'd love to hear from you.
              </p>

              <div className="space-y-4">
                {[
                  { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', iconPath: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z', label: '123 Nguyen Trai Street, District 1, Ho Chi Minh City', sublabel: 'Headquarters' },
                  { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'hello@agrivietnam.vn', sublabel: 'Email Us' },
                  { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', label: '+84 28 1234 5678', sublabel: 'Call Us' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#3D2B1F] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        {item.iconPath && <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />}
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1E1E1E]">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.sublabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="agri-contact-card"
            >
              <div className="bg-[#FAF8F3] rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-bold text-[#1E1E1E] mb-6">Send us a message</h3>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="agri-contact-input"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="agri-contact-input"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="agri-contact-input"
                  />
                  <select className="agri-contact-input" defaultValue="">
                    <option value="" disabled>Select Inquiry Type</option>
                    <option value="wholesale">Wholesale Inquiry</option>
                    <option value="distribution">Distribution Partnership</option>
                    <option value="export">Export Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    placeholder="Your Message"
                    className="agri-contact-input agri-contact-textarea"
                    required
                  />
                  <button type="submit" className="agri-contact-submit">
                    Send Message
                    <svg className="inline-block ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="agri-footer">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">AgriVietnam</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Premium Vietnamese agricultural products sourced directly from the highlands.
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-3">
                {['Coffee', 'Macadamia', 'Black Pepper', 'Durian', 'Organic Fruits'].map((item) => (
                  <li key={item}>
                    <a href="#" className="agri-footer-link">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                {['About Us', 'Our Farms', 'Sustainability', 'Certifications', 'Careers'].map((item) => (
                  <li key={item}>
                    <a href="#" className="agri-footer-link">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-semibold mb-4">Newsletter</h4>
              <p className="text-sm text-white/50 mb-4">Get updates on new products and offers.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="agri-footer-input flex-1"
                />
                <button className="agri-footer-btn">Subscribe</button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              © 2025 AgriVietnam. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a key={item} href="#" className="agri-footer-link text-xs">{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
