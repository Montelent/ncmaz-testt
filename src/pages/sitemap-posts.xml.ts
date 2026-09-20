import type { GetServerSideProps } from 'next'
import {
	SITE_URL,
	fetchContentNodes,
	isExcludedPath,
	renderUrlset,
	sendXml,
	toIso,
} from '@/utils/sitemap'

export default function SitemapPosts() {}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const nodes = await fetchContentNodes(['POST'])

	const entries = nodes
		.filter((n) => n.uri && !isExcludedPath(n.uri))
		.map((n) => ({
			loc: `${SITE_URL}${n.uri}`,
			lastmod: toIso(n.modifiedGmt),
		}))

	return sendXml(ctx, renderUrlset(entries))
}
