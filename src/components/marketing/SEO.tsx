import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../context/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

const BASE_URL = 'https://drivesmart.vn';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

const DEFAULT_META: Record<string, { vi: string; en: string }> = {
  title: {
    vi: 'DriveSmart — Chinh phục bài thi GPLX',
    en: 'DriveSmart — Vietnam Driving License Practice',
  },
  description: {
    vi: 'Học 600 câu hỏi GPLX, từ vựng Oxford, luyện nghe tiếng Anh. Trực tuyến, miễn phí, cập nhật 2024.',
    en: 'Practice for your Vietnam driving license exam with 600 official theory questions. Also learn English vocabulary and listening.',
  },
};

export function SEO({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const { language } = useLanguage();

  const fullTitle = title ?? DEFAULT_META.title[language];
  const fullDesc = description ?? DEFAULT_META.description[language];
  const canonical = `${BASE_URL}${path}`;
  const ogImage = image ?? DEFAULT_IMAGE;

  return (
    <Helmet>
      <html lang={language === 'vi' ? 'vi' : 'en'} />
      <title>{fullTitle}</title>
      <meta name="description" content={fullDesc} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="DriveSmart" />
      <meta property="og:locale" content={language === 'vi' ? 'vi_VN' : 'en_US'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Preconnect to external origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
}
