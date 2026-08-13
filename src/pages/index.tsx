import { getWordPressProps, WordPressTemplate } from '@faustwp/core'
import { WordPressTemplateProps } from '../types'
import { GetServerSideProps } from 'next'

export default function Page(props: WordPressTemplateProps) {
	return <WordPressTemplate {...props} />
}

// SSR instead of SSG – avoids Apollo invariant 31 during build
export const getServerSideProps: GetServerSideProps = (ctx) => {
	return getWordPressProps({ ctx })
}
