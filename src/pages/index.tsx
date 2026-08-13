import { getWordPressProps, WordPressTemplate } from '@faustwp/core'
import { WordPressTemplateProps } from '../types'
import { GetServerSideProps } from 'next'

export default function Page(props: WordPressTemplateProps) {
	return <WordPressTemplate {...props} />
}

/**
 * SSR for "/" — avoids Apollo invariant #31 during Hostinger static generation.
 */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
	return getWordPressProps({ ctx })
}
