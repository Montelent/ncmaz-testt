import type { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'
import {
	SITE_URL,
	isExcludedPath,
	renderUrlset,
	sendXml,
} from '@/utils/sitemap'

export default function SitemapCategories() {}

const CATEGORIES_QUERY = gql`
	query SitemapCategories($after: String) {
		categories(first: 100, after: $after, where: { hideEmpty: true }) {
			pageInfo {
				hasNextPage
				endCursor
			}
			nodes {
				uri
			}
		}
	}
`

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const client = getApolloClient()
	const uris: string[] = []
	let after: string | null = null

	try {
		while (true) {
			const { data } = await client.query({
				query: CATEGORIES_QUERY,
				variables: { after },
				fetchPolicy: 'no-cache',
			})
			const conn = data?.categories
			if (!conn) break
			for (const n of conn.nodes || []) {
				if (n?.uri) uris.push(n.uri)
			}
			if (!conn.pageInfo?.hasNextPage) break
			after = conn.pageInfo.endCursor
		}
	} catch (e) {
		console.error('Category sitemap error', e)
	}

	const entries = uris
		.filter((u) => !isExcludedPath(u))
		.map((u) => ({ loc: `${SITE_URL}${u}` }))

	return sendXml(ctx, renderUrlset(entries))
}
