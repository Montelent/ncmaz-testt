import { NextSeo } from 'next-seo'

export type RankMathSeo = {
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
	imageUrl,
}: {
	seo?: RankMathSeo | null
	imageUrl?: string | null
}) {
	if (!seo) return null

	const robots = seo.robots?.toLowerCase() || ''
	const description =
		seo.description?.replace(/<[^>]*>?/gm, '').trim() || undefined

	const ogType =
		seo.openGraph?.type === 'article' || seo.openGraph?.type === 'Article'
			? 'article'
			: seo.openGraph?.type === 'website'
				? 'website'
				: 'article'

	return (
		<>
			<NextSeo
				title={seo.title || undefined}
				description={description}
				canonical={seo.canonicalUrl || undefined}
				noindex={robots.includes('noindex')}
				nofollow={robots.includes('nofollow')}
				openGraph={{
					title: seo.openGraph?.title || seo.title || undefined,
					description:
						seo.openGraph?.description?.replace(/<[^>]*>?/gm, '').trim() ||
						description,
					url: seo.openGraph?.url || seo.canonicalUrl || undefined,
					type: ogType,
					siteName: seo.openGraph?.siteName || undefined,
					images: imageUrl ? [{ url: imageUrl }] : undefined,
				}}
				twitter={{
					cardType:
						seo.openGraph?.twitterMeta?.card === 'summary_large_image'
							? 'summaryLargeImage'
							: 'summary',
				}}
			/>

			{seo.jsonLd?.raw ? (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: seo.jsonLd.raw }}
				/>
			) : null}
		</>
	)
}
