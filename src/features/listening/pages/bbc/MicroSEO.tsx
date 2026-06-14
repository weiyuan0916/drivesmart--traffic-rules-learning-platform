// ============================================================
// MicroSEO — VinaListen
// SEO metadata for micro dictation pages
// ============================================================

import { Helmet } from 'react-helmet-async'

interface MicroSEOProps {
  title: string
  slug: string
  level?: string | null
  description?: string
}

export function MicroSEO({ title, slug, level, description }: MicroSEOProps) {
  const defaultDescription =
    description ||
    `Luyện nghe chép BBC 6 Minute English — "${title}". Nghe từng đoạn ngắn, nhập transcript, kiểm tra độ chính xác.`

  return (
    <Helmet>
      <title>{title} — Micro Dictation | DriveSmart</title>
      <meta name="description" content={defaultDescription} />
      <link rel="canonical" href={`/listening/bbc/${slug}/dictation`} />
      <meta property="og:title" content={`${title} — Micro Dictation | DriveSmart`} />
      <meta property="og:description" content={defaultDescription} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`/listening/bbc/${slug}/dictation`} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={`${title} — Micro Dictation | DriveSmart`} />
      <meta name="twitter:description" content={defaultDescription} />
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'EducationalOccupationalProgram',
        name: `${title} — Micro Dictation`,
        description: defaultDescription,
        provider: {
          '@type': 'Organization',
          name: 'BBC Learning English',
          url: 'https://www.bbc.co.uk/learningenglish',
        },
        educationalLevel: level || 'intermediate',
        courseMode: 'online',
        url: `/listening/bbc/${slug}/dictation`,
      })}</script>
    </Helmet>
  )
}
