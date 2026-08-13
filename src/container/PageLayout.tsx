import SEO from '@/components/SEO/SEO'
import React, { FC } from 'react'
import SiteHeader from './SiteHeader'
import Footer from '@/components/Footer/Footer'
import { FragmentType } from '@/__generated__'
import {
	NC_FOOTER_MENU_QUERY_FRAGMENT,
	NC_PRIMARY_MENU_QUERY_FRAGMENT,
} from '@/fragments/menu'
import { NcgeneralSettingsFieldsFragmentFragment } from '@/__generated__/graphql'

interface Props {
	children: React.ReactNode
	pageTitle?: string | null | undefined
	headerMenuItems?: FragmentType<typeof NC_PRIMARY_MENU_QUERY_FRAGMENT>[]
	footerMenuItems?: FragmentType<typeof NC_FOOTER_MENU_QUERY_FRAGMENT>[] | null
	pageFeaturedImageUrl?: string | null | undefined
	generalSettings?: NcgeneralSettingsFieldsFragmentFragment | null | undefined
	pageDescription?: string | null | undefined
	/** When true, RankMathHead owns title/description/canonical — skip default SEO tags */
	disableDefaultSeo?: boolean
}

const PageLayout: FC<Props> = ({
	children,
	footerMenuItems,
	headerMenuItems,
	pageFeaturedImageUrl,
	pageTitle,
	generalSettings,
	pageDescription,
	disableDefaultSeo = false,
}) => {
	return (
		<>
			{!disableDefaultSeo && (
				<SEO
					title={(pageTitle || '') + ' - ' + (generalSettings?.title || '')}
					description={pageDescription || generalSettings?.description || ''}
					imageUrl={pageFeaturedImageUrl}
				/>
			)}

			{/* Image-only fallback when Rank Math owns the rest of the head */}
			{disableDefaultSeo && pageFeaturedImageUrl ? (
				<SEO title={undefined} description={undefined} imageUrl={pageFeaturedImageUrl} />
			) : null}

			<SiteHeader
				siteTitle={generalSettings?.title}
				siteDescription={generalSettings?.description}
				menuItems={headerMenuItems || []}
			/>

			{children}

			<Footer menuItems={footerMenuItems || []} />
		</>
	)
}

export default PageLayout
