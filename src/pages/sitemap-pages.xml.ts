import type { GetServerSideProps } from 'next'
import {
	SITE_URL,
	fetchContentNodes,
	isExcludedPath,
	renderUrlset,
	sendXml,
	toIso,
} from '@/utils/sitemap'

export default function SitemapPages() {}

// Static app routes that exist in the Next.js app but not in WordPress.
const STATIC_ROUTES = ['/', '/contact/', '/posts/']

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const nodes = await fetchContentNodes(['PAGE'])

	const wpEntries = nodes
		.filter((n) => n.uri && n.uri !== '/' && !isExcludedPath(n.uri))
		.map((n) => ({
			loc: `${SITE_URL}${n.uri}`,
			lastmod: toIso(n.modifiedGmt),
		}))

	const wpLocs = new Set(wpEntries.map((e) => e.loc))
	const staticEntries = STATIC_ROUTES.map((p) => ({
		loc: `${SITE_URL}${p}`,
	})).filter((e) => !wpLocs.has(e.loc))

	return sendXml(ctx, renderUrlset([...staticEntries, ...wpEntries]))
}
