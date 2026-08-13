import { FragmentType } from '@/__generated__'
import {
	NC_POST_FULL_FRAGMENT,
	NC_POST_FULL_VS_EDITOR_BLOCK_NO_CONTENT_FRAGMENT,
} from '@/fragments'

// Loosened to avoid FragmentType resolving to `never` under strict TS + current codegen
export type FragmentTypePostFullFields =
	| FragmentType<typeof NC_POST_FULL_FRAGMENT>
	| FragmentType<typeof NC_POST_FULL_VS_EDITOR_BLOCK_NO_CONTENT_FRAGMENT>
	| Record<string, any>
	| null
	| undefined
