import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'
import type { GetServerSidePropsContext } from 'next'

export const SITE_URL = (
	process.env.NEXT_PUBLIC_URL || 'https://samsverge.cc'
).replace(/\/$/, '')

// Paths that must never appear in a sitemap (private / app / demo areas)
const EXCLUDED_PREFIXES = [
	'/submission',
	'/dashboard',
	'/preview',
	'/reset-password',
	'/readinglist',
	'/login',
	'/sign-up',
	'/ncmaz_for_ncmazfc_preview_blocks',
	'/api',
	// Theme demo / variation preview pages (not real content)
	'/block-term-variations-preview',
	'/magazine-variations-preview',
	'/documents',
	'/helps',
]

export function isExcludedPath(uri: string): boolean {
	const clean = uri.replace(/\/$/, '') || '/'
	if (EXCLUDED_PREFIXES.some((p) => clean === p || clean.startsWith(p + '/'))) {
		return true
	}
	// Demo home layouts: /home-1 … /home-6
	if (/^\/home-[0-9]+$/.test(clean)) return true
	return false
}

/** Decode entities that WP/GraphQL sometimes already embeds, then escape once. */
function decodeXmlEntities(str: string): string {
	return str
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&apos;/g, "'")
}

export function escapeXml(str: string): string {
	return decodeXmlEntities(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

// WPGraphQL returns modifiedGmt as "YYYY-MM-DD HH:mm:ss" (implicitly UTC).
// Convert to a valid W3C Datetime / ISO 8601 string.
export function toIso(dateString?: string | null): string | undefined {
	if (!dateString) return undefined
	const iso = dateString.includes('T')
		? dateString
		: `${dateString.replace(' ', 'T')}Z`
	const d = new Date(iso)
	return isNaN(d.getTime()) ? undefined : d.toISOString()
}

export type SitemapEntry = {
	loc: string
	lastmod?: string
}

export function renderUrlset(entries: SitemapEntry[]): string {
	const body = entries
		.map((e) => {
			let row = `  <url>\n    <loc>${escapeXml(e.loc)}</loc>`
			if (e.lastmod) row += `\n    <lastmod>${e.lastmod}</lastmod>`
			row += '\n  </url>'
			return row
		})
		.join('\n')
	return (
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<?xml-stylesheet type="text/xsl" href="' +
		SITE_URL +
		'/sitemap.xsl"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		body +
		'\n</urlset>\n'
	)
}

export function renderSitemapIndex(
	entries: Array<{ loc: string; lastmod?: string }>,
): string {
	const body = entries
		.map((e) => {
			let row = `  <sitemap>\n    <loc>${escapeXml(e.loc)}</loc>`
			if (e.lastmod) row += `\n    <lastmod>${e.lastmod}</lastmod>`
			row += '\n  </sitemap>'
			return row
		})
		.join('\n')
	return (
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<?xml-stylesheet type="text/xsl" href="' +
		SITE_URL +
		'/sitemap.xsl"?>\n' +
		'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		body +
		'\n</sitemapindex>\n'
	)
}

export function sendXml(
	ctx: GetServerSidePropsContext,
	xml: string,
): { props: Record<string, never> } {
	ctx.res.setHeader('Content-Type', 'application/xml; charset=utf-8')
	ctx.res.setHeader(
		'Cache-Control',
		'public, s-maxage=600, stale-while-revalidate=86400',
	)
	// Help crawlers; avoid accidental noindex on XML
	ctx.res.setHeader('X-Robots-Tag', 'noindex')
	ctx.res.write(xml)
	ctx.res.end()
	return { props: {} }
}

const CONTENT_QUERY = gql`
	query SitemapContent($types: [ContentTypeEnum], $after: String) {
		contentNodes(
			where: { contentTypes: $types, status: PUBLISH }
			first: 100
			after: $after
		) {
			pageInfo {
				hasNextPage
				endCursor
			}
			nodes {
				uri
				modifiedGmt
				dateGmt
			}
		}
	}
`

export type ContentNode = {
	uri?: string | null
	modifiedGmt?: string | null
	dateGmt?: string | null
}

type ContentNodesResult = {
	data?: {
		contentNodes?: {
			pageInfo?: { hasNextPage?: boolean; endCursor?: string | null }
			nodes?: ContentNode[]
		}
	}
}

// Paginate through every published node of the given content types.
export async function fetchContentNodes(
	types: Array<'POST' | 'PAGE'>,
): Promise<ContentNode[]> {
	const client = getApolloClient()
	const all: ContentNode[] = []
	let after: string | null = null

	while (true) {
		const result: ContentNodesResult = await client.query({
			query: CONTENT_QUERY,
			variables: { types, after },
			fetchPolicy: 'no-cache',
		})

		const conn = result.data?.contentNodes
		if (!conn) break
		all.push(...(conn.nodes || []))
		if (!conn.pageInfo?.hasNextPage) break
		after = conn.pageInfo.endCursor ?? null
	}

	return all
}

export function newestLastmod(
	dates: Array<string | undefined>,
): string | undefined {
	const valid = dates.filter((d): d is string => !!d).sort()
	return valid.length ? valid[valid.length - 1] : undefined
}
