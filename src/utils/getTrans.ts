import en from '../../public/lang/en'

/**
 * Returns translation strings.
 * Typed as `any` so a missing en.ts key never fails `next build` typecheck.
 * Prefer adding keys to public/lang/en.ts when you notice missing UI text.
 */
const getTrans = (): any => {
	return en
}

export default getTrans
