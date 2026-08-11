import { GetServerSideProps } from 'next'
import { getServerSideSitemapLegacy } from 'next-sitemap'
import { gql } from '@apollo/client'
import { getApolloClient } from '@faustwp/core'

const client = getApolloClient()

const SITEMAP_QUERY = gql`
	query SitemapQuery($after: String) {
		contentNodes(
			where: { contentTypes: [POST, PAGE] }
			first: 50
			after: $after
		) {
			pageInfo {
				hasNextPage
				endCursor
			}
			nodes {
				uri
				modifiedGmt
			}
		}
	}
`

async function getAllWPContent(after = null, acc: any[] = []) {
	const { data } = await client.query({
		query: SITEMAP_QUERY,
		variables: {
			after,
		},
	})

	acc = [...acc, ...data.contentNodes.nodes]

	if (data.contentNodes.pageInfo.hasNextPage) {
		acc = await getAllWPContent(data.contentNodes.pageInfo.endCursor, acc)
	}

	return acc
}

// Convert WPGraphQL's modifiedGmt ("YYYY-MM-DD HH:mm:ss", implicitly UTC)
// into a valid W3C Datetime / ISO 8601 string for sitemap lastmod
function formatDate(dateString: string): string | undefined {
	if (!dateString) return undefined

	const isoString = dateString.includes('T')
		? dateString
		: `${dateString.replace(' ', 'T')}Z`

	const date = new Date(isoString)
	return isNaN(date.getTime()) ? undefined : date.toISOString()
}

// Sitemap component
export default function WPSitemap() {}

// Collect all the posts and pages
export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const nodes = await getAllWPContent()

	// Define your WordPress base URL
	const BASE_URL = process.env.NEXT_PUBLIC_URL

	const allRoutes = nodes.reduce((acc, node) => {
		if (!node.uri) {
			return acc
		}

		// Prepend the BASE_URL to the `uri`
		acc.push({
			loc: `${BASE_URL}${node.uri}`, // Ensure full URL is used
			lastmod: node.modifiedGmt ? formatDate(node.modifiedGmt) : undefined, // Valid ISO 8601 lastmod
			changefreq: 'daily', // Set the change frequency to daily
			priority: 0.8, // Set the priority to 0.8
		})

		return acc
	}, [])

	return await getServerSideSitemapLegacy(ctx, allRoutes)
}
