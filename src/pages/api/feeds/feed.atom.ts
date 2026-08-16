import type { NextApiRequest, NextApiResponse } from 'next'
import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'

const FEED_QUERY = gql`
	query AtomFeedPosts {
		generalSettings {
			title
			description
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

function toIso(dateGmt?: string | null): string {
	if (!dateGmt) return new Date().toISOString()
	const iso = dateGmt.includes('T') ? dateGmt : dateGmt.replace(' ', 'T') + 'Z'
	const d = new Date(iso)
	return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
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

		const entries = posts
			.map((post: any) => {
				const link = `\( {siteUrl} \){post.uri || ''}`
				const desc = stripHtml(post.excerpt || '')
				return `
  <entry>
    <title>${escapeXml(post.title || '')}</title>
    <link href="${escapeXml(link)}" />
    <id>${escapeXml(link)}</id>
    <updated>${toIso(post.modifiedGmt || post.dateGmt)}</updated>
    <published>${toIso(post.dateGmt)}</published>
    **Summary:**
${escapeXml(desc)}
    ${
			post.author?.node?.name
				? `<author><name>${escapeXml(post.author.node.name)}</name></author>`
				: ''
		}
  </entry>`
			})
			.join('')

		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(title)}</title>
  <link href="${escapeXml(siteUrl)}" />
  <link href="${escapeXml(siteUrl)}/api/feeds/feed.atom" rel="self" />
  <updated>${new Date().toISOString()}</updated>
  <id>${escapeXml(siteUrl)}/</id>
  <subtitle>${escapeXml(description)}</subtitle>
  ${entries}
</feed>`

		res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8')
		res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate')
		res.status(200).send(xml)
	} catch (e) {
		console.error('Atom feed error', e)
		res.status(500).send('Failed to generate Atom feed')
	}
}
