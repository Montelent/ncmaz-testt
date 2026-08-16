import type { NextApiRequest, NextApiResponse } from 'next'
import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'

const FEED_QUERY = gql`
	query RssFeedPosts {
		generalSettings {
			title
			description
			language
		}
		posts(first: 50, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
			nodes {
				title
				uri
				excerpt
				dateGmt
				modifiedGmt
				author {
					node {
						name
					}
				}
				featuredImage {
					node {
						sourceUrl
					}
				}
			}
		}
	}
`

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, '').trim()
}

function toRfc822(dateGmt?: string | null): string {
	if (!dateGmt) return new Date().toUTCString()
	const iso = dateGmt.includes('T') ? dateGmt : dateGmt.replace(' ', 'T') + 'Z'
	const d = new Date(iso)
	return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString()
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	try {
		const siteUrl = (process.env.NEXT_PUBLIC_URL || 'https://sammyguru.online').replace(
			/\/$/,
			'',
		)
		const client = getApolloClient()
		const { data } = await client.query({
			query: FEED_QUERY,
			fetchPolicy: 'no-cache',
		})

		const title = data?.generalSettings?.title || 'SammyGuru'
		const description =
			data?.generalSettings?.description || 'Latest posts from SammyGuru'
		const posts = data?.posts?.nodes || []

		const items = posts
			.map((post: any) => {
				const link = `\( {siteUrl} \){post.uri || ''}`
				const desc = stripHtml(post.excerpt || '')
				const img = post.featuredImage?.node?.sourceUrl
				const enclosure = img
					? `<enclosure url="${escapeXml(img)}" type="image/jpeg" />`
					: ''

				return `
    <item>
      <title>${escapeXml(post.title || '')}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${toRfc822(post.dateGmt)}</pubDate>
      <description>${escapeXml(desc)}</description>
      ${post.author?.node?.name ? \`<author>${escapeXml(post.author.node.name)}</author>\` : ''}
      ${enclosure}
    </item>`
			})
			.join('')

		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(siteUrl)}/api/feeds/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

		res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
		res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate')
		res.status(200).send(xml)
	} catch (e) {
		console.error('RSS feed error', e)
		res.status(500).send('Failed to generate RSS feed')
	}
}
