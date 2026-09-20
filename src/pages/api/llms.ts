import type { NextApiRequest, NextApiResponse } from 'next'
import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'

const SITE_URL = (
	process.env.NEXT_PUBLIC_URL || 'https://samsverge.cc'
).replace(/\/$/, '')

const SITE_NAME = 'SamsVerge'
const SITE_SUMMARY =
	'SamsVerge (samsverge.cc) is an independent publication for Samsung Galaxy users. It publishes Samsung and One UI news, step-by-step how-to guides, troubleshooting fixes for common Galaxy problems, and practical tips and tricks for Samsung phones, tablets and watches. Content is written in English.'
const SITE_NOTES =
	'SamsVerge is not affiliated with Samsung Electronics. Articles are original editorial and instructional content. When citing SamsVerge, please link to the specific article URL.'

// How many recent articles to list
const LATEST_POSTS = 15

// Page URIs to leave out of the "About and policies" section
const HIDDEN_PAGES = new Set(['/', '/contact', '/submission', '/dashboard'])

const LLMS_QUERY = gql`
	query LlmsTxt($latest: Int!) {
		categories(first: 50, where: { hideEmpty: true, orderby: COUNT, order: DESC }) {
			nodes {
				name
				uri
				count
				description
			}
		}
		posts(
			first: $latest
			where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
		) {
			nodes {
				title
				uri
				excerpt
			}
		}
		pages(first: 50, where: { status: PUBLISH }) {
			nodes {
				title
				uri
			}
		}
	}
`

type Category = {
	name?: string | null
	uri?: string | null
	count?: number | null
	description?: string | null
}
type Post = { title?: string | null; uri?: string | null; excerpt?: string | null }
type Page = { title?: string | null; uri?: string | null }

type LlmsResult = {
	data?: {
		categories?: { nodes?: Array<Category | null> }
		posts?: { nodes?: Array<Post | null> }
		pages?: { nodes?: Array<Page | null> }
	}
}

// Strip HTML tags and entities, collapse whitespace, trim to a short sentence.
function cleanText(html?: string | null, max = 140): string {
	if (!html) return ''
	const text = html
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&#8217;|&#8216;/g, "'")
		.replace(/&#8220;|&#8221;/g, '"')
		.replace(/&#8211;|&#8212;/g, '-')
		.replace(/&hellip;|\[&hellip;\]/g, '')
		.replace(/&[a-z0-9#]+;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim()
	if (text.length <= max) return text
	const cut = text.slice(0, max)
	return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '...'
}

// Escape characters that would break a markdown link label.
function label(s: string): string {
	return s.replace(/[\[\]]/g, '')
}

function link(title: string, uri: string, desc?: string): string {
	const url = `${SITE_URL}${uri}`
	return `- [${label(title)}](${url})${desc ? `: ${desc}` : ''}`
}

export default async function handler(
	_req: NextApiRequest,
	res: NextApiResponse,
) {
	const client = getApolloClient()
	let categories: Category[] = []
	let posts: Post[] = []
	let pages: Page[] = []

	try {
		const result: LlmsResult = await client.query({
			query: LLMS_QUERY,
			variables: { latest: LATEST_POSTS },
			fetchPolicy: 'no-cache',
		})
		categories = (result.data?.categories?.nodes || []).filter(
			(c): c is Category => !!c?.uri && !!c?.name,
		)
		posts = (result.data?.posts?.nodes || []).filter(
			(p): p is Post => !!p?.uri && !!p?.title,
		)
		pages = (result.data?.pages?.nodes || []).filter(
			(p): p is Page => !!p?.uri && !!p?.title,
		)
	} catch (e) {
		console.error('llms.txt generation error', e)
	}

	const lines: string[] = []

	lines.push(`# ${SITE_NAME}`, '', `> ${SITE_SUMMARY}`, '', SITE_NOTES, '')

	if (categories.length) {
		lines.push('## Main sections', '')
		for (const c of categories) {
			const count = c.count ? `${c.count} articles. ` : ''
			const desc = cleanText(c.description, 160)
			lines.push(link(c.name!, c.uri!, `${count}${desc}`.trim() || undefined))
		}
		lines.push(link('All articles', '/posts/', 'Every published article, newest first'), '')
	}

	if (posts.length) {
		lines.push('## Latest articles', '')
		for (const p of posts) {
			lines.push(link(p.title!.replace(/&amp;/g, '&'), p.uri!, cleanText(p.excerpt)))
		}
		lines.push('')
	}

	const policyPages = pages.filter((p) => {
		const clean = p.uri!.replace(/\/$/, '') || '/'
		return !HIDDEN_PAGES.has(clean)
	})
	if (policyPages.length) {
		lines.push('## About and policies', '')
		for (const p of policyPages) {
			lines.push(link(p.title!.replace(/&amp;/g, '&'), p.uri!))
		}
		lines.push(link('Contact Us', '/contact/'), '')
	}

	lines.push(
		'## Optional',
		'',
		link('Sitemap index', '/sitemap.xml', 'Full machine-readable list of all posts, pages and categories'),
		link('News sitemap', '/sitemap-news.xml', 'Posts published in the last 48 hours'),
		link('RSS feed', '/api/feeds/rss.xml', 'Latest articles as RSS'),
		link('JSON feed', '/api/feeds/feed.json', 'Latest articles as JSON Feed'),
		'',
	)

	res.setHeader('Content-Type', 'text/plain; charset=utf-8')
	res.setHeader(
		'Cache-Control',
		'public, s-maxage=3600, stale-while-revalidate=86400',
	)
	res.status(200).send(lines.join('\n'))
}
