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
	if (!trimmed) return null

	const match = trimmed.match(
		/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
	)
	const jsonText = (match?.[1] || trimmed).trim()
	if (!jsonText.startsWith('{') && !jsonText.startsWith('[')) {
		return null
	}
	return jsonText
}

function robotsToString(robots?: string | string[] | null): string {
	if (!robots) return ''
	if (Array.isArray(robots)) return robots.join(',').toLowerCase()
	return String(robots).toLowerCase()
}

function isPlaceholderImage(value: unknown): boolean {
	if (typeof value === 'string') {
		return (
			value === 'FEATURED_IMAGE_URL' ||
			value === 'FEATURE_IMAGE_URL' ||
			value.includes('FEATURED_IMAGE_URL') ||
			value.includes('FEATURE_IMAGE_URL')
		)
	}
	if (Array.isArray(value)) {
		return value.some(isPlaceholderImage)
	}
	if (value && typeof value === 'object' && 'url' in value) {
		return isPlaceholderImage((value as { url?: unknown }).url)
	}
	return false
}

/** Fix Rank Math placeholders + rewrite backend domain */
function sanitizeJsonLd(
	jsonText: string,
	imageUrl?: string | null,
): string | null {
	const frontend = (process.env.NEXT_PUBLIC_URL || '').replace(/\/$/, '')
	const backend = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(
		/\/$/,
		'',
	)

	let out = jsonText
	if (frontend && backend) {
		out = out.split(backend).join(frontend)
	}

	const realImage = imageUrl || ''

	if (realImage) {
		out = out.split('FEATURED_IMAGE_URL').join(realImage)
		out = out.split('FEATURE_IMAGE_URL').join(realImage)
		out = out.split('%FEATURED_IMAGE_URL%').join(realImage)
	} else {
		out = out.split('"FEATURED_IMAGE_URL"').join('""')
		out = out.split('"FEATURE_IMAGE_URL"').join('""')
	}

	try {
		const data = JSON.parse(out)

		if (realImage && data && Array.isArray(data['@graph'])) {
			for (const node of data['@graph']) {
				const types = node['@type']
				const typeList = Array.isArray(types) ? types : [types]
				const isArticle = typeList.includes('Article')
				const isHowTo = typeList.includes('HowTo')

				if ((isArticle || isHowTo) && isPlaceholderImage(node.image)) {
					if (isHowTo) {
						node.image = { '@type': 'ImageObject', url: realImage }
					} else {
						node.image = [realImage]
					}
				}
			}
			out = JSON.stringify(data)
		}

		return out
	} catch {
		return out.trim() ? out : null
	}
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

	const extracted = extractJsonLd(seo.jsonLd?.raw || null)
	const jsonLdFinal = extracted
		? sanitizeJsonLd(extracted, imageUrl || null)
		: null

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

			{jsonLdFinal && jsonLdFinal.trim() ? (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: jsonLdFinal }}
				/>
			) : null}
		</>
	)
}
