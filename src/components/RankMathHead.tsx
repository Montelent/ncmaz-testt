import { NextSeo } from 'next-seo'

export type RankMathSeo = {
	title?: string | null
	description?: string | null
	canonicalUrl?: string | null
	robots?: string | string[] | null
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

function toFrontendUrl(url?: string | null): string | undefined {
	if (!url) return undefined
	const frontend = (process.env.NEXT_PUBLIC_URL || '').replace(/\/$/, '')
	const backend = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(
		/\/$/,
		'',
	)
	if (!frontend || !backend) return url
	if (url.startsWith(backend)) {
		return frontend + url.slice(backend.length)
	}
	return url
}

function extractJsonLd(raw?: string | null): string | null {
	if (!raw) return null
	const trimmed = raw.trim()
	const match = trimmed.match(
		/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
	)
	if (match?.[1]) return match[1].trim()
	if (trimmed.startsWith('{') || trimmed.startsWith('[')) return trimmed
	return null
}

function robotsToString(robots?: string | string[] | null): string {
	if (!robots) return ''
	if (Array.isArray(robots)) return robots.join(',').toLowerCase()
	return String(robots).toLowerCase()
}

export default function RankMathHead({
	seo,
	imageUrl,
}: {
	seo?: RankMathSeo | null
	imageUrl?: string | null
}) {
	if (!seo) return null

	const robotsStr = robotsToString(seo.robots)
	const description =
		seo.description?.replace(/<[^>]*>?/gm, '').trim() || undefined

	const canonical = toFrontendUrl(seo.canonicalUrl)
	const ogUrl = toFrontendUrl(seo.openGraph?.url) || canonical

	const ogType =
		seo.openGraph?.type === 'article' || seo.openGraph?.type === 'Article'
			? 'article'
			: seo.openGraph?.type === 'website'
				? 'website'
				: 'article'

	const twitterCard = (seo.openGraph?.twitterMeta?.card || '').toUpperCase()
	const jsonLdContent = extractJsonLd(seo.jsonLd?.raw || null)

	const frontend = (process.env.NEXT_PUBLIC_URL || '').replace(/\/$/, '')
	const backend = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(
		/\/$/,
		'',
	)
	const jsonLdFinal =
		jsonLdContent && frontend && backend
			? jsonLdContent.split(backend).join(frontend)
			: jsonLdContent

	return (
		<>
			<NextSeo
				title={seo.title || undefined}
				description={description}
				canonical={canonical}
				noindex={robotsStr.includes('noindex')}
				nofollow={robotsStr.includes('nofollow')}
				openGraph={{
					title: seo.openGraph?.title || seo.title || undefined,
					description:
						seo.openGraph?.description?.replace(/<[^>]*>?/gm, '').trim() ||
						description,
					url: ogUrl,
					type: ogType,
					siteName: seo.openGraph?.siteName || undefined,
					images: imageUrl ? [{ url: imageUrl }] : undefined,
				}}
				twitter={{
					cardType:
						twitterCard === 'SUMMARY_LARGE_IMAGE'
							? 'summaryLargeImage'
							: 'summary',
				}}
			/>

			{jsonLdFinal ? (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: jsonLdFinal }}
				/>
			) : null}
		</>
	)
}
