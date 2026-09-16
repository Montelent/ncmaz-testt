import { NextSeo } from 'next-seo'
import Head from 'next/head'

export type RankMathSeo = {
	title?: string | null
	description?: string | null
	canonicalUrl?: string | null
	robots?: string | string[] | Record<string, string> | null
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

/** Canonical public frontend — never leave blank or point at old domain. */
const DEFAULT_FRONTEND = 'https://samsverge.cc'
const LEGACY_HOSTS = [
	'sammyguru.online',
	'www.sammyguru.online',
	'bd.sammyguru.online',
]

function getFrontend(): string {
	const raw = (process.env.NEXT_PUBLIC_URL || DEFAULT_FRONTEND).replace(/\/$/, '')
	try {
		const host = new URL(raw).hostname.replace(/^www\./, '')
		if (host === 'sammyguru.online' || host.endsWith('.sammyguru.online')) {
			return DEFAULT_FRONTEND
		}
	} catch {
		return DEFAULT_FRONTEND
	}
	return raw || DEFAULT_FRONTEND
}

function getBackend(): string {
	return (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/$/, '')
}

function frontendHostname(): string {
	try {
		return new URL(getFrontend()).hostname.replace(/^www\./, '')
	} catch {
		return 'samsverge.cc'
	}
}

function toFrontendUrl(url?: string | null): string | undefined {
	if (!url) return undefined
	const frontend = getFrontend()
	const backend = getBackend()
	if (url.includes('/wp-content/')) return url
	let out = url
	for (const host of LEGACY_HOSTS) {
		out = out.split('https://' + host).join(frontend)
		out = out.split('http://' + host).join(frontend)
		out = out.split('//' + host).join('//' + new URL(frontend).hostname)
	}
	if (frontend && backend && out.startsWith(backend)) {
		return frontend + out.slice(backend.length)
	}
	try {
		if (backend) {
			const bh = new URL(backend).hostname
			const fh = new URL(frontend).hostname
			if (out.includes(bh)) {
				out = out.split(bh).join(fh)
			}
		}
	} catch {
		/* ignore */
	}
	return out
}

function toFrontendSiteName(name?: string | null): string {
	const frontend = getFrontend()
	const backend = getBackend()
	const fallback = frontendHostname()
	if (!name || !String(name).trim()) {
		return fallback
	}
	let out = String(name).trim()
	if (backend) {
		out = out.split(backend).join(frontend || fallback)
	}
	try {
		if (backend) {
			const bh = new URL(backend).hostname
			const fh = frontend ? new URL(frontend).hostname : fallback
			out = out.split(bh).join(fh)
		}
	} catch {
		/* ignore */
	}
	if (/^https?:\/\//i.test(out)) {
		try {
			return new URL(frontend || out).hostname.replace(/^www\./, '')
		} catch {
			return fallback
		}
	}
	if (/bd\.sammyguru\.online|sammyguru\.online/i.test(out)) {
		return fallback
	}
	return out || fallback
}

function resolveImageUrl(imageUrl?: string | null): string {
	if (!imageUrl) return ''
	if (imageUrl.includes('/wp-content/') || imageUrl.startsWith('http')) {
		return imageUrl
	}
	const backend = getBackend()
	if (backend && imageUrl.startsWith('/')) {
		return backend + imageUrl
	}
	return imageUrl
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

function robotsToString(
	robots?: string | string[] | Record<string, string> | null,
): string {
	if (!robots) return ''
	if (Array.isArray(robots)) {
		return robots.map(String).join(',').toLowerCase()
	}
	if (typeof robots === 'object') {
		return Object.values(robots)
			.map(String)
			.filter(Boolean)
			.join(',')
			.toLowerCase()
	}
	return String(robots).toLowerCase()
}

function isPlaceholder(value: unknown): boolean {
	if (typeof value !== 'string') return false
	return (
		value === 'FEATURED_IMAGE_URL' ||
		value === 'FEATURE_IMAGE_URL' ||
		value.includes('FEATURED_IMAGE_URL') ||
		value.includes('FEATURE_IMAGE_URL')
	)
}

function fixImageValue(value: unknown, realImage: string): unknown {
	if (!realImage) {
		if (isPlaceholder(value)) return undefined
		if (Array.isArray(value)) {
			return value
				.map((v) => fixImageValue(v, realImage))
				.filter((v) => v !== undefined)
		}
		if (value && typeof value === 'object') {
			const obj = { ...(value as Record<string, unknown>) }
			if (isPlaceholder(obj.url)) return undefined
			return obj
		}
		return value
	}
	if (isPlaceholder(value)) return realImage
	if (typeof value === 'string') return value
	if (Array.isArray(value)) {
		const mapped = value
			.map((v) => fixImageValue(v, realImage))
			.filter((v) => v !== undefined && v !== '')
		return mapped.length ? mapped : [realImage]
	}
	if (value && typeof value === 'object') {
		const obj = { ...(value as Record<string, unknown>) }
		if (isPlaceholder(obj.url) || !obj.url) {
			obj.url = realImage
		}
		return obj
	}
	return value
}

function walkAndFix(node: unknown, realImage: string): unknown {
	if (Array.isArray(node)) {
		return node.map((n) => walkAndFix(n, realImage))
	}
	if (!node || typeof node !== 'object') {
		return node
	}
	const obj = { ...(node as Record<string, unknown>) }
	if ('image' in obj) {
		obj.image = fixImageValue(obj.image, realImage)
		if (
			obj.image === undefined ||
			(Array.isArray(obj.image) && obj.image.length === 0)
		) {
			if (realImage) obj.image = [realImage]
			else delete obj.image
		}
	}
	if (typeof obj.url === 'string' && !obj.url.includes('/wp-content/')) {
		if (isPlaceholder(obj.url)) {
			if (realImage) obj.url = realImage
		} else {
			const rewritten = toFrontendUrl(obj.url)
			if (rewritten) obj.url = rewritten
		}
	}
	if (
		typeof obj['@id'] === 'string' &&
		!String(obj['@id']).includes('/wp-content/')
	) {
		const rewritten = toFrontendUrl(String(obj['@id']))
		if (rewritten) obj['@id'] = rewritten
	}
	if (typeof obj.name === 'string') {
		obj.name = toFrontendSiteName(obj.name)
	}
	for (const key of Object.keys(obj)) {
		if (key === 'image') continue
		const val = obj[key]
		if (val && typeof val === 'object') {
			obj[key] = walkAndFix(val, realImage)
		}
	}
	return obj
}

function sanitizeJsonLd(
	jsonText: string,
	imageUrl?: string | null,
): string | null {
	const frontend = getFrontend()
	const backend = getBackend()
	const realImage = resolveImageUrl(imageUrl || null)
	let out = jsonText
	if (frontend && backend) {
		const uploadToken = '___UPLOAD_URL___'
		const uploads: string[] = []
		out = out.replace(
			new RegExp(
				backend.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
					'/wp-content/[^"\\\\s]*',
				'g',
			),
			(match) => {
				uploads.push(match)
				return uploadToken + (uploads.length - 1) + '___'
			},
		)
		out = out.split(backend).join(frontend)
		uploads.forEach((url, i) => {
			out = out.split(uploadToken + i + '___').join(url)
		})
	}
	if (realImage) {
		out = out.split('FEATURED_IMAGE_URL').join(realImage)
		out = out.split('FEATURE_IMAGE_URL').join(realImage)
		out = out.split('%FEATURED_IMAGE_URL%').join(realImage)
	}
	try {
		const data = walkAndFix(JSON.parse(out), realImage)
		const finalText = JSON.stringify(data)
		if (!finalText || finalText === 'null' || finalText === '{}') {
			return null
		}
		if (
			finalText.includes('FEATURED_IMAGE_URL') ||
			finalText.includes('FEATURE_IMAGE_URL')
		) {
			if (!realImage) return null
			return finalText
				.split('FEATURED_IMAGE_URL')
				.join(realImage)
				.split('FEATURE_IMAGE_URL')
				.join(realImage)
		}
		return finalText
	} catch {
		const trimmed = out.trim()
		if (
			!trimmed ||
			trimmed.includes('FEATURED_IMAGE_URL') ||
			trimmed.includes('FEATURE_IMAGE_URL')
		) {
			return null
		}
		return trimmed
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
	const noindex = robotsStr.includes('noindex')
	const nofollow = robotsStr.includes('nofollow')
	const description =
		seo.description?.replace(/<[^>]*>?/gm, '').trim() || undefined
	const canonical = toFrontendUrl(seo.canonicalUrl)
	const ogUrl = toFrontendUrl(seo.openGraph?.url) || canonical
	const ogImage = resolveImageUrl(imageUrl || null)
	const siteName = toFrontendSiteName(seo.openGraph?.siteName)
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
	const robotsContent = [
		noindex ? 'noindex' : 'index',
		nofollow ? 'nofollow' : 'follow',
	].join(',')
	return (
		<>
			<Head>
				<meta name="robots" content={robotsContent} />
				{noindex ? (
					<meta name="googlebot" content={robotsContent} />
				) : null}
			</Head>
			<NextSeo
				title={seo.title || undefined}
				description={description}
				canonical={noindex ? undefined : canonical}
				noindex={noindex}
				nofollow={nofollow}
				openGraph={{
					title: seo.openGraph?.title || seo.title || undefined,
					description:
						seo.openGraph?.description?.replace(/<[^>]*>?/gm, '').trim() ||
						description,
					url: ogUrl,
					type: ogType,
					siteName,
					images: ogImage ? [{ url: ogImage }] : undefined,
				}}
				twitter={{
					cardType:
						twitterCard === 'SUMMARY_LARGE_IMAGE'
							? 'summaryLargeImage'
							: 'summary',
				}}
			/>
			{!noindex && jsonLdFinal && jsonLdFinal.trim().length > 2 ? (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: jsonLdFinal }}
				/>
			) : null}
		</>
	)
}
