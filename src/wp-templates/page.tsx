import EntryHeader from '../components/entry-header'
import {
	GetPageQuery,
	GetPageDocument,
	NcgeneralSettingsFieldsFragmentFragment,
} from '../__generated__/graphql'
import { FaustTemplate, flatListToHierarchical } from '@faustwp/core'
import { FOOTER_LOCATION, PRIMARY_LOCATION } from '@/contains/menu'
import PageLayout from '@/container/PageLayout'
import MyWordPressBlockViewer from '@/components/MyWordPressBlockViewer'
import RankMathHead from '@/components/RankMathHead'

const Page: FaustTemplate<GetPageQuery> = (props) => {
	if (props.loading) {
		return <>Loading...</>
	}

	const { title, editorBlocks, featuredImage, ncPageMeta, seo } =
		(props.data?.page as any) || {}

	const isGutenbergPage =
		!!props.__SEED_NODE__?.isFrontPage || ncPageMeta?.isFullWithPage

	const blocks = flatListToHierarchical(editorBlocks as any, {
		idKey: 'clientId',
		parentKey: 'parentClientId',
	})

	// Fallback if Rank Math seo is not in the generated document yet
	const pageSeo =
		seo ??
		(title
			? {
					title,
					description: props.data?.generalSettings?.description || null,
				}
			: null)

	return (
		<>
			<RankMathHead seo={pageSeo} />

			<PageLayout
				headerMenuItems={props.data?.primaryMenuItems?.nodes || []}
				footerMenuItems={props.data?.footerMenuItems?.nodes || []}
				pageFeaturedImageUrl={featuredImage?.node?.sourceUrl}
				pageTitle={title}
				generalSettings={
					props.data?.generalSettings as NcgeneralSettingsFieldsFragmentFragment
				}
			>
				<div className="nc-BgGlassmorphism absolute inset-x-0 z-[-1] flex min-h-0 overflow-hidden py-24 pl-20 md:top-10 xl:top-20">
					<span className="block h-72 w-72 rounded-full bg-[#ef233c] opacity-10 mix-blend-multiply blur-3xl filter lg:h-96 lg:w-96"></span>
					<span className="nc-animation-delay-2000 -ml-20 mt-40 block h-72 w-72 rounded-full bg-[#04868b] opacity-10 mix-blend-multiply blur-3xl filter lg:h-96 lg:w-96"></span>
				</div>
				<div
					className={`container ${
						isGutenbergPage ? '' : 'pb-20 pt-5 sm:pt-10'
					}`}
				>
					<main
						className={`prose mx-auto lg:prose-lg dark:prose-invert ${
							isGutenbergPage ? 'max-w-none' : ''
						}`}
					>
						{isGutenbergPage && (
							<h1 className="sr-only">
								{/* @ts-ignore */}
								{props.data?.generalSettings?.title || title || ''}
							</h1>
						)}

						{title && !isGutenbergPage && (
							<>
								<EntryHeader title={title} />
								<hr />
							</>
						)}

						<MyWordPressBlockViewer blocks={blocks} />
					</main>
				</div>
			</PageLayout>
		</>
	)
}

Page.variables = ({ databaseId }, ctx) => {
	return {
		databaseId,
		asPreview: ctx?.asPreview,
		headerLocation: PRIMARY_LOCATION,
		footerLocation: FOOTER_LOCATION,
	}
}

Page.query = GetPageDocument as any

export default Page
