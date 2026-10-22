import en from '../../public/lang/en'

/** Nested string map — allows T['any key'] without breaking the build if a key is missing. */
type TranslationTree = {
	[key: string]: string | TranslationTree
}

const getTrans = (): TranslationTree => {
	return en as TranslationTree
}

export default getTrans
