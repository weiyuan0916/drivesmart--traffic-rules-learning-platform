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
    vi: 'DriveSmart — Chinh phục bài thi GPLX 2024',
    en: 'DriveSmart — Vietnam Driving License Practice 2024',
  },
  description: {
    vi: 'Học 600 câu hỏi GPLX, 5.000+ từ vựng Oxford, 1.200+ bài luyện nghe. Miễn phí, cập nhật 2024. AI phân tích tình huống giao thông.',
    en: 'Practice for your Vietnam driving license exam with 600 official questions. Learn 5,000+ Oxford vocabulary words and 1,200+ listening exercises. Free, 2024 updated. AI traffic analysis.',
  },
};

const FAQ_SCHEMA_VI = [
  {
    '@type': 'Question',
    name: 'DriveSmart có miễn phí không?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Có, DriveSmart hoàn toàn miễn phí. Bạn có thể học tất cả 600 câu hỏi GPLX, 5.000+ từ vựng, 500+ cụm từ OPAL và 1.200+ bài luyện nghe mà không cần trả bất kỳ phí nào.',
    },
  },
  {
    '@type': 'Question',
    name: 'Nội dung có cập nhật theo đề thi mới nhất không?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Có. Chúng tôi cập nhật câu hỏi GPLX theo phiên bản mới nhất từ Tổng cục Đường bộ Việt Nam. Các thay đổi về biển báo, làn đường và quy tắc giao thông luôn được phản ánh nhanh chóng.',
    },
  },
  {
    '@type': 'Question',
    name: 'AI phân tích tình huống giao thông hoạt động như thế nào?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Bạn chụp hoặc tải lên ảnh tình huống giao thông thực tế. Gemini AI sẽ nhận diện biển báo, phân tích làn đường, đối tượng tham gia giao thông và đưa ra giải thích chi tiết bằng tiếng Việt và tiếng Anh.',
    },
  },
  {
    '@type': 'Question',
    name: 'Tôi cần bao lâu để vượt qua kỳ thi GPLX?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Hầu hết học viên đạt kết quả tốt sau 1-2 tuần luyện tập 30 phút mỗi ngày. Với DriveSmart, bạn tập trung vào đúng những phần yếu thay vì học thuộc toàn bộ 600 câu.',
    },
  },
  {
    '@type': 'Question',
    name: 'Tôi có thể học trên điện thoại không?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Có. DriveSmart được thiết kế mobile-first, hoạt động mượt mà trên mọi thiết bị iOS và Android. Giao diện tối ưu cho màn hình nhỏ, thao tác dễ dàng bằng một tay.',
    },
  },
];

const FAQ_SCHEMA_EN = [
  {
    '@type': 'Question',
    name: 'Is DriveSmart free?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes, DriveSmart is completely free. You can practice all 600 GPLX questions, 5,000+ vocabulary words, 500+ OPAL phrases, and 1,200+ listening exercises without paying anything.',
    },
  },
  {
    '@type': 'Question',
    name: 'Is the content updated with the latest exam format?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes. We update GPLX questions according to the latest version from Vietnam Road Administration. Changes in traffic signs, lanes, and rules are always reflected quickly.',
    },
  },
  {
    '@type': 'Question',
    name: 'How does the AI traffic analyzer work?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Upload or take a photo of a real traffic situation. Gemini AI recognizes signs, analyzes lanes, traffic participants, and gives detailed explanations in both Vietnamese and English.',
    },
  },
  {
    '@type': 'Question',
    name: 'How long does it take to pass the GPLX exam?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Most learners achieve good results after 1-2 weeks of 30-minute daily practice. With DriveSmart, you focus on weak areas instead of memorizing all 600 questions.',
    },
  },
  {
    '@type': 'Question',
    name: 'Can I study on my phone?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes. DriveSmart is built mobile-first, works smoothly on all iOS and Android devices. Interface is optimized for small screens with one-handed operation.',
    },
  },
];

export function SEO({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const fullTitle = title ?? DEFAULT_META.title[language];
  const fullDesc = description ?? DEFAULT_META.description[language];
  const canonical = `${BASE_URL}${path}`;
  const ogImage = image ?? DEFAULT_IMAGE;

  const faqSchema = isVi ? FAQ_SCHEMA_VI : FAQ_SCHEMA_EN;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DriveSmart',
    url: BASE_URL,
    description: fullDesc,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    about: {
      '@type': 'Thing',
      name: 'Vietnam Driving License Exam (GPLX)',
      description: 'Practice for Vietnam driving license exam with 600 official questions',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
    },
  };

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqSchema,
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DriveSmart',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      'https://facebook.com/drivesmartvn',
      'https://youtube.com/@drivesmart',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@drivesmart.vn',
      contactType: 'customer service',
      availableLanguage: ['Vietnamese', 'English'],
    },
  };

  return (
    <Helmet>
      <html lang={isVi ? 'vi' : 'en'} />
      <title>{fullTitle}</title>
      <meta name="description" content={fullDesc} />
      <meta name="keywords" content="GPLX, bằng lái xe Việt Nam, thi bằng lái, 600 câu hỏi, từ vựng Oxford, luyện nghe tiếng Anh, driving license Vietnam" />
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
      <meta property="og:locale" content={isVi ? 'vi_VN' : 'en_US'} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="DriveSmart — Chinh phục bài thi GPLX" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="DriveSmart — Vietnam Driving License Practice" />
      <meta name="twitter:site" content="@drivesmartvn" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqPageSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>

      {/* Preconnect */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
}
