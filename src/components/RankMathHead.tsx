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
	if (!jsonText || (!jsonText.startsWith('{') && !jsonText.startsWith('['))) {
		return null
	}
	return jsonText
}

function robotsToString(robots?: string | string[] | null): string {
	if (!robots) return ''
	if (Array.isArray(robots)) return robots.join(',').toLowerCase()
	return String(robots).toLowerCase()
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

	const realImage =
		imageUrl ||
		(frontend
			? null
			: null)

	// Rank Math sometimes leaves these placeholders in Article / HowTo
	if (realImage) {
		out = out
			.split('FEATURED_IMAGE_URL')
			.join(realImage)
			.split('FEATURE_IMAGE_URL')
			.join(realImage)
			.split('%FEATURED_IMAGE_URL%')
			.join(realImage)
	} else {
		// Remove placeholder strings so Google does not warn
		out = out
			.split('"FEATURED_IMAGE_URL"')
			.join('""')
			.split('"FEATURE_IMAGE_URL"')
			.join('""')
	}

	try {
		const data = JSON.parse(out)
		// If Article.image is still a bad placeholder array, fix with imageUrl
		if (realImage && data && Array.isArray(data['@graph'])) {
			for (const node of data['@graph']) {
				const types = node['@type']
				const isArticle =
					types === 'Article' ||
					(Array.isArray(types) && types.includes('Article'))
				const isHowTo =
					types === 'HowTo' ||
					(Array.isArray(types) && types.includes('HowTo'))

				if (isArticle || isHowTo) {
					const img = node.image
					if (
						img === 'FEATURED_IMAGE_URL' ||
						img === 'FEATURE_IMAGE_URL' ||
						(Array.isArray(img) &&
							img.some(
								(x: string) =>
									x === 'FEATURED_IMAGE_URL' || x === 'FEATURE_IMAGE_URL',
							)) ||
						(img &&
							typeof img === 'object' &&
							(img.url === 'FEATURED_IMAGE_URL' ||
								img.url === 'FEATURE_IMAGE_URL'))
					) {
						node.image =
							isHowTo
								? { '@type': 'ImageObject', url: realImage }
								: [realImage]
					}
				}
			}
			out = JSON.stringify(data)
		}
		return out
	} catch {
		// If parse fails but string is non-empty, still output replaced text
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
