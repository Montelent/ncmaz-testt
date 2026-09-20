import type { GetServerSideProps } from 'next'
import {
	SITE_URL,
	fetchContentNodes,
	newestLastmod,
	renderSitemapIndex,
	sendXml,
	toIso,
} from '@/utils/sitemap'

// Sitemap index: one entry per named child sitemap.
export default function SitemapIndex() {}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	let postsLastmod: string | undefined
	let pagesLastmod: string | undefined

	try {
		const [posts, pages] = await Promise.all([
			fetchContentNodes(['POST']),
			fetchContentNodes(['PAGE']),
		])
		postsLastmod = newestLastmod(posts.map((n) => toIso(n.modifiedGmt)))
		pagesLastmod = newestLastmod(pages.map((n) => toIso(n.modifiedGmt)))
	} catch (e) {
		console.error('Sitemap index lastmod error', e)
	}

	const xml = renderSitemapIndex([
		{ loc: `${SITE_URL}/sitemap-posts.xml`, lastmod: postsLastmod },
		{ loc: `${SITE_URL}/sitemap-pages.xml`, lastmod: pagesLastmod },
		{ loc: `${SITE_URL}/sitemap-categories.xml`, lastmod: postsLastmod },
		{ loc: `${SITE_URL}/sitemap-news.xml`, lastmod: postsLastmod },
	])

	return sendXml(ctx, xml)
}
