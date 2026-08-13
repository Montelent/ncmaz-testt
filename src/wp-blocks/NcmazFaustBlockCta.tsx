import { NcmazFaustBlockCtaFragmentFragment } from '@/__generated__/graphql'
import { gql } from '@apollo/client'
import { WordPressBlock } from '@faustwp/blocks'
import dynamic from 'next/dynamic'

// Client-only: uses useMutation — must not run during SSG
const NcmazFaustBlockCtaClient = dynamic(
	() => import('./NcmazFaustBlockCtaClient'),
	{ ssr: false },
)

const NcmazFaustBlockCta: WordPressBlock<NcmazFaustBlockCtaFragmentFragment> = (
	props,
) => {
	const { renderedHtml } = props || {}

	if (!renderedHtml) {
		return null
	}

	return <NcmazFaustBlockCtaClient {...props} />
}

export const NcmazFaustBlockCtaFragments = {
	entry: gql`
		fragment NcmazFaustBlockCtaFragment on NcmazFaustBlockCta {
			renderedHtml
		}
	`,
	key: `NcmazFaustBlockCtaFragment`,
}

NcmazFaustBlockCta.displayName = 'NcmazFaustBlockCta'
export default NcmazFaustBlockCta
