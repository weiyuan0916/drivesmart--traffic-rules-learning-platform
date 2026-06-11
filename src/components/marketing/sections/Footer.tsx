import { useLanguage } from '../../../context/LanguageContext';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = {
  products: {
    labelVi: 'Sản phẩm',
    labelEn: 'Products',
    links: [
      { labelVi: 'Thi GPLX', labelEn: 'Driving Test', href: '/driving-test' },
      { labelVi: 'Từ vựng', labelEn: 'Vocabulary', href: '/vocabulary' },
      { labelVi: 'OPAL', labelEn: 'OPAL', href: '/opal' },
      { labelVi: 'Luyện nghe', labelEn: 'Listening', href: '/listening' },
      { labelVi: 'AgriVietnam', labelEn: 'AgriVietnam', href: '/agri-vietnam' },
    ],
  },
  support: {
    labelVi: 'Hỗ trợ',
    labelEn: 'Support',
    links: [
      { labelVi: 'Liên hệ', labelEn: 'Contact', href: '/contact' },
      { labelVi: 'FAQ', labelEn: 'FAQ', href: '/faq' },
      { labelVi: 'Trung tâm trợ giúp', labelEn: 'Help Center', href: '/help' },
      { labelVi: 'Báo lỗi', labelEn: 'Report a Bug', href: '/bugs' },
    ],
  },
  company: {
    labelVi: 'Công ty',
    labelEn: 'Company',
    links: [
      { labelVi: 'Giới thiệu', labelEn: 'About', href: '/about' },
      { labelVi: 'Blog', labelEn: 'Blog', href: '/blog' },
      { labelVi: 'Tuyển dụng', labelEn: 'Careers', href: '/careers' },
      { labelVi: 'Báo chí', labelEn: 'Press', href: '/press' },
    ],
  },
  legal: {
    labelVi: 'Pháp lý',
    labelEn: 'Legal',
    links: [
      { labelVi: 'Chính sách bảo mật', labelEn: 'Privacy Policy', href: '/privacy' },
      { labelVi: 'Điều khoản sử dụng', labelEn: 'Terms of Service', href: '/terms' },
      { labelVi: 'Chính sách cookie', labelEn: 'Cookie Policy', href: '/cookies' },
    ],
  },
};

const CONTACT = [
  {
    icon: MapPin,
    labelVi: '123 Nguyễn Trãi, Quận 1, TP.HCM',
    labelEn: '123 Nguyen Trai St., District 1, HCMC',
  },
  {
    icon: Mail,
    labelVi: 'hello@drivesmart.vn',
    labelEn: 'hello@drivesmart.vn',
    href: 'mailto:hello@drivesmart.vn',
  },
  {
    icon: Phone,
    labelVi: '+84 28 1234 5678',
    labelEn: '+84 28 1234 5678',
    href: 'tel:+842812345678',
  },
];

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer
      className="bg-[var(--bg-secondary)] border-t border-[var(--border)]"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">

          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-[var(--text-primary)]">DriveSmart</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4 max-w-xs">
              {language === 'vi'
                ? 'Nền tảng học tập hàng đầu Việt Nam cho kỳ thi GPLX, từ vựng tiếng Anh và luyện nghe.'
                : 'Vietnam\'s leading learning platform for driving tests, English vocabulary, and listening practice.'}
            </p>

            {/* Contact info */}
            <div className="space-y-2">
              {CONTACT.map(({ icon: Icon, labelVi, labelEn, href }) => (
                <div key={labelEn} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                  <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                  {href ? (
                    <a href={href} className="hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:underline">
                      {language === 'vi' ? labelVi : labelEn}
                    </a>
                  ) : (
                    <span>{language === 'vi' ? labelVi : labelEn}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                {language === 'vi' ? section.labelVi : section.labelEn}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:underline"
                    >
                      {language === 'vi' ? link.labelVi : link.labelEn}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} DriveSmart. {language === 'vi' ? 'Mọi quyền được bảo lưu.' : 'All rights reserved.'}
          </p>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {[
              {
                label: 'Facebook',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                ),
              },
              {
                label: 'YouTube',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                ),
              },
              {
                label: 'GitHub',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <a
                key={label}
                href="#"
                className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label={label}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
