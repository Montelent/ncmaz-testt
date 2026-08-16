import { getWordPressProps, WordPressTemplate } from '@faustwp/core'
import { GetStaticProps } from 'next'
import { WordPressTemplateProps } from '../types'

export default function Page(props: WordPressTemplateProps) {
	return <WordPressTemplate {...props} />
}

/**
 * ISR for homepage — cached HTML, refreshes in the background.
 * revalidate: seconds until the next request may rebuild this page.
 */
export const getStaticProps: GetStaticProps = async (ctx) => {
	return getWordPressProps({
		ctx,
		revalidate: 300, // 5 minutes — tune 60–600 if needed
	})
}
