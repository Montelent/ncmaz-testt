import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'
import type { GetServerSidePropsContext } from 'next'

export const SITE_URL = (
	process.env.NEXT_PUBLIC_URL || 'https://samsverge.cc'
).replace(/\/$/, '')

// Paths that must never appear in a sitemap (private / app areas)
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
]

export function isExcludedPath(uri: string): boolean {
	const clean = uri.replace(/\/$/, '')
	return EXCLUDED_PREFIXES.some(
		(p) => clean === p || clean.startsWith(p + '/'),
	)
}

export function escapeXml(str: string): string {
	return str
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
	const urls = entries
		.map(
			(e) =>
				'  <url>\n' +
				`    <loc>${escapeXml(e.loc)}</loc>\n` +
				(e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : '') +
				'  </url>',
		)
		.join('\n')

	return (
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		`<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap.xsl"?>\n` +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		urls +
		'\n</urlset>\n'
	)
}

export function renderSitemapIndex(entries: SitemapEntry[]): string {
	const items = entries
		.map(
			(e) =>
				'  <sitemap>\n' +
				`    <loc>${escapeXml(e.loc)}</loc>\n` +
				(e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : '') +
				'  </sitemap>',
		)
		.join('\n')

	return (
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		`<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap.xsl"?>\n` +
		'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		items +
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

// Paginate through every published node of the given content types.
// Iterative (not recursive) so large sites don't grow the call stack.
export async function fetchContentNodes(
	types: Array<'POST' | 'PAGE'>,
): Promise<ContentNode[]> {
	const client = getApolloClient()
	const all: ContentNode[] = []
	let after: string | null = null

	while (true) {
		const { data } = await client.query({
			query: CONTENT_QUERY,
			variables: { types, after },
			fetchPolicy: 'no-cache',
		})
		const conn = data?.contentNodes
		if (!conn) break
		all.push(...(conn.nodes || []))
		if (!conn.pageInfo?.hasNextPage) break
		after = conn.pageInfo.endCursor
	}

	return all
}

export function newestLastmod(dates: Array<string | undefined>): string | undefined {
	const valid = dates.filter((d): d is string => !!d).sort()
	return valid.length ? valid[valid.length - 1] : undefined
}
