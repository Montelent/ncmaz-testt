import { getWordPressProps, WordPressTemplate } from '@faustwp/core'
import { GetStaticProps } from 'next'
import { WordPressTemplateProps } from '../types'
import { REVALIDATE_TIME } from '@/contains/contants'

export default function Page(props: WordPressTemplateProps) {
	return <WordPressTemplate {...props} />
}

/**
 * ISR for homepage — cached HTML, refreshes in the background.
 * Uses shared REVALIDATE_TIME to limit GraphQL hits on bd.sammyguru.online.
 */
export const getStaticProps: GetStaticProps = async (ctx) => {
	return getWordPressProps({
		ctx,
		revalidate: REVALIDATE_TIME,
	})
}
