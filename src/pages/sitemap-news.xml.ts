import type { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'
import { SITE_URL, escapeXml, sendXml, toIso } from '@/utils/sitemap'

export default function SitemapNews() {}

// Google News sitemap: only posts published in the last 48 hours.
const NEWS_QUERY = gql`
	query SitemapNews {
		generalSettings {
			title
			language
		}
		posts(
			first: 100
			where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
		) {
			nodes {
				title
				uri
				dateGmt
			}
		}
	}
`

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const client = getApolloClient()
	const cutoff = Date.now() - 48 * 60 * 60 * 1000

	let publication = 'SamsVerge'
	let lang = 'en'
	let items = ''

	try {
		const { data } = await client.query({
			query: NEWS_QUERY,
			fetchPolicy: 'no-cache',
		})

		publication = data?.generalSettings?.title || publication
		const rawLang: string = data?.generalSettings?.language || 'en'
		lang = rawLang.split(/[-_]/)[0].toLowerCase() || 'en'

		items = (data?.posts?.nodes || [])
			.filter((p: { uri?: string | null; dateGmt?: string | null }) => {
				const iso = toIso(p.dateGmt)
				return !!p.uri && !!iso && new Date(iso).getTime() >= cutoff
			})
			.map(
				(p: { uri: string; title?: string | null; dateGmt: string }) =>
					'  <url>\n' +
					`    <loc>${escapeXml(SITE_URL + p.uri)}</loc>\n` +
					'    <news:news>\n' +
					'      <news:publication>\n' +
					`        <news:name>${escapeXml(publication)}</news:name>\n` +
					`        <news:language>${escapeXml(lang)}</news:language>\n` +
					'      </news:publication>\n' +
					`      <news:publication_date>${toIso(p.dateGmt)}</news:publication_date>\n` +
					`      <news:title>${escapeXml(p.title || '')}</news:title>\n` +
					'    </news:news>\n' +
					'  </url>',
			)
			.join('\n')
	} catch (e) {
		console.error('News sitemap error', e)
	}

	const xml =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
		'xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n' +
		items +
		'\n</urlset>\n'

	return sendXml(ctx, xml)
}
