import { getWordPressProps, WordPressTemplate } from '@faustwp/core'
import { WordPressTemplateProps } from '../types'
import { GetServerSideProps } from 'next'

export default function Page(props: WordPressTemplateProps) {
	return <WordPressTemplate {...props} />
}

// Use SSR instead of SSG for the homepage.
// This completely avoids the Apollo invariant 31 during "faust build".
export const getServerSideProps: GetServerSideProps = (ctx) => {
	return getWordPressProps({ ctx })
}
