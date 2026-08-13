import { NextSeo } from 'next-seo'

type RankMathSeo = {
  title?: string | null
  description?: string | null
  canonicalUrl?: string | null
  robots?: string | null
  jsonLd?: {
    raw?: string | null
  } | null
  openGraph?: {
    title?: string | null
    description?: string | null
    url?: string | null
    type?: string | null
    siteName?: string | null
    twitterMeta?: {
      card?: string | null
    } | null
  } | null
}

export default function RankMathHead({
  seo,
}: {
  seo?: RankMathSeo | null
}) {
  if (!seo) return null

  const robots = seo.robots?.toLowerCase() || ''

  return (
    <>
      <NextSeo
        title={seo.title || undefined}
        description={seo.description || undefined}
        canonical={seo.canonicalUrl || undefined}
        noindex={robots.includes('noindex')}
        nofollow={robots.includes('nofollow')}
        openGraph={{
          title: seo.openGraph?.title || seo.title || undefined,
          description:
            seo.openGraph?.description ||
            seo.description ||
            undefined,
          url: seo.openGraph?.url || seo.canonicalUrl || undefined,
          type:
            seo.openGraph?.type === 'article'
              ? 'article'
              : 'website',
          siteName: seo.openGraph?.siteName || undefined,
        }}
        twitter={{
          cardType:
            seo.openGraph?.twitterMeta?.card ===
            'summary_large_image'
              ? 'summaryLargeImage'
              : 'summary',
        }}
      />

      {seo.jsonLd?.raw && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: seo.jsonLd.raw,
          }}
        />
      )}
    </>
  )
}
