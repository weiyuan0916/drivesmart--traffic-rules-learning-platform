import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://drivesmart.vn'

interface BbcSEOListProps {
  totalLessons?: number
}

export function BbcSEOList({ totalLessons }: BbcSEOListProps) {
  const title = 'BBC Learning English — Luyện nghe tiếng Anh với BBC | DriveSmart'
  const description = `Học tiếng Anh chuẩn với BBC Learning English trên DriveSmart. ${totalLessons ? `${totalLessons} bài học ` : ''}Từ sơ cấp đến nâng cao. Không lưu nội dung gốc BBC.`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${BASE_URL}/listening/bbc`,
    about: {
      '@type': 'Thing',
      name: 'BBC Learning English',
      description: 'English language learning resources from BBC',
    },
    provider: {
      '@type': 'Organization',
      name: 'DriveSmart',
      url: BASE_URL,
    },
  }

  const learningResource = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: 'BBC Learning English on DriveSmart',
    description,
    url: `${BASE_URL}/listening/bbc`,
    provider: {
      '@type': 'Organization',
      name: 'DriveSmart',
      url: BASE_URL,
    },
    educationalLevel: 'Beginner to Advanced',
    inLanguage: 'en',
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="BBC Learning English, học tiếng Anh, luyện nghe, English listening, British English, BBC English" />
      <link rel="canonical" href={`${BASE_URL}/listening/bbc`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${BASE_URL}/listening/bbc`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="DriveSmart" />
      <meta property="og:locale" content="vi_VN" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(learningResource)}</script>
    </Helmet>
  )
}

interface BbcSEOWorkspaceProps {
  lessonTitle: string
  slug: string
}

export function BbcSEOWorkspace({ lessonTitle, slug }: BbcSEOWorkspaceProps) {
  const fullTitle = `Học bài: ${lessonTitle} — BBC Learning English | DriveSmart`
  const description = `Không gian học tập cho bài "${lessonTitle}" từ BBC Learning English. Ghi chú, từ vựng và luyện nghe chép trên DriveSmart.`
  const canonicalUrl = `${BASE_URL}/listening/bbc/${slug}/practice`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="DriveSmart" />
      <meta property="og:locale" content="vi_VN" />
    </Helmet>
  )
}
