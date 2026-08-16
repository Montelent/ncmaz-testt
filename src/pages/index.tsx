import { getWordPressProps, WordPressTemplate } from '@faustwp/core'
import { GetStaticProps } from 'next'
import { WordPressTemplateProps } from '../types'

export default function Page(props: WordPressTemplateProps) {
	return <WordPressTemplate {...props} />
}

/**
 * ISR for homepage — fast TTFB like posts, still refreshes in the background.
 * revalidate: seconds until a new request may rebuild this page.
 */
export const getStaticProps: GetStaticProps = async (ctx) => {
	return getWordPressProps({
		ctx,
		// @ts-expect-error Faust passes through Next revalidate
		revalidate: 300, // 5 minutes — tune 60–600
	})
}
