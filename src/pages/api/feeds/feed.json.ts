import type { NextApiRequest, NextApiResponse } from 'next'
import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'

const FEED_QUERY = gql`
	query JsonFeedPosts {
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

		const feed = {
			version: 'https://jsonfeed.org/version/1.1',
			title: data?.generalSettings?.title || 'SammyGuru',
			home_page_url: siteUrl,
			feed_url: `${siteUrl}/api/feeds/feed.json`,
			description:
				data?.generalSettings?.description || 'Latest posts from SammyGuru',
			items: (data?.posts?.nodes || []).map((post: any) => {
				const url = `\( {siteUrl} \){post.uri || ''}`
				return {
					id: url,
					url,
					title: post.title || '',
					content_text: stripHtml(post.excerpt || ''),
					date_published: toIso(post.dateGmt),
					authors: post.author?.node?.name
						? [{ name: post.author.node.name }]
						: undefined,
					image: post.featuredImage?.node?.sourceUrl || undefined,
				}
			}),
		}

		res.setHeader('Content-Type', 'application/feed+json; charset=utf-8')
		res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate')
		res.status(200).json(feed)
	} catch (e) {
		console.error('JSON feed error', e)
		res.status(500).json({ error: 'Failed to generate JSON feed' })
	}
}
