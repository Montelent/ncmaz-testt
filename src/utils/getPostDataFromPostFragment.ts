import { TPostCard } from '@/components/Card2/Card2'
import { FragmentType, useFragment } from '../__generated__'
import {
	NC_IMAGE_MEDIA_HAS_DETAIL_FRAGMENT,
	NC_POST_CARD_FRAGMENT,
	NC_POST_CARD_NOT_NCMAZGALLERY_FRAGMENT,
	NC_POST_FULL_FRAGMENT,
	NC_POST_META_DATA_FULL_FRAGMENT,
} from '../fragments'
import { getCatgoryDataFromCategoryFragment } from './getCatgoryDataFromCategoryFragment'
import { getTagDataFromTagFragment } from './getTagDataFromTagFragment'
import { getUserDataFromUserCardFragment } from './getUserDataFromUserCardFragment'
import { NcmazFcImageHasDetailFieldsFragment } from '@/__generated__/graphql'
import { FragmentTypePostFullFields } from '@/container/type'

export type PostFormatNameType =
	| ''
	| 'audio'
	| 'gallery'
	| 'video'
	| 'aside'
	| 'chat'
	| 'image'
	| 'quote'
	| 'status'
	| 'standard'

export function getPostDataFromPostFragment(
	post:
		| FragmentType<typeof NC_POST_CARD_FRAGMENT>
		| FragmentType<typeof NC_POST_CARD_NOT_NCMAZGALLERY_FRAGMENT>
		| FragmentTypePostFullFields
		| TPostCard
		| any,
) {
	// Cast to any to avoid FragmentType resolving to `never` under strict TS + current codegen
	const query = useFragment(
		NC_POST_FULL_FRAGMENT as any,
		post as any,
	) as any

	//
	const postFormats = (
		query.postFormats?.nodes?.[0]?.name || ''
	).toLowerCase() as PostFormatNameType
	const postFormatSlug = (
		query.postFormats?.nodes?.[0]?.slug || ''
	).toLowerCase()
	const postFormatsArr = query.postFormats?.nodes
	//
	const featuredImage = useFragment(
		NC_IMAGE_MEDIA_HAS_DETAIL_FRAGMENT as any,
		query.featuredImage?.node as any,
	) as any
	//
	const ncPostMetaData = useFragment(
		NC_POST_META_DATA_FULL_FRAGMENT as any,
		query.ncPostMetaData as any,
	) as any

	// ncmazGalleryImgs is a list of 8 images
	const ncmazGalleryImg1 = useFragment(
		NC_IMAGE_MEDIA_HAS_DETAIL_FRAGMENT as any,
		query.ncmazGalleryImgs?.image1?.node as any,
	) as any
	const ncmazGalleryImg2 = useFragment(
		NC_IMAGE_MEDIA_HAS_DETAIL_FRAGMENT as any,
		query.ncmazGalleryImgs?.image2?.node as any,
	) as any
	const ncmazGalleryImg3 = useFragment(
		NC_IMAGE_MEDIA_HAS_DETAIL_FRAGMENT as any,
		query.ncmazGalleryImgs?.image3?.node as any,
	) as any
	const ncmazGalleryImg4 = useFragment(
		NC_IMAGE_MEDIA_HAS_DETAIL_FRAGMENT as any,
		query.ncmazGalleryImgs?.image4?.node as any,
	) as any
	const ncmazGalleryImg5 = useFragment(
		NC_IMAGE_MEDIA_HAS_DETAIL_FRAGMENT as any,
		query.ncmazGalleryImgs?.image5?.node as any,
	) as any
	const ncmazGalleryImg6 = useFragment(
		NC_IMAGE_MEDIA_HAS_DETAIL_FRAGMENT as any,
		query.ncmazGalleryImgs?.image6?.node as any,
	) as any
	const ncmazGalleryImg7 = useFragment(
		NC_IMAGE_MEDIA_HAS_DETAIL_FRAGMENT as any,
		query.ncmazGalleryImgs?.image7?.node as any,
	) as any
	const ncmazGalleryImg8 = useFragment(
		NC_IMAGE_MEDIA_HAS_DETAIL_FRAGMENT as any,
		query.ncmazGalleryImgs?.image8?.node as any,
	) as any

	const ncmazGalleryImgs = [
		ncmazGalleryImg1,
		ncmazGalleryImg2,
		ncmazGalleryImg3,
		ncmazGalleryImg4,
		ncmazGalleryImg5,
		ncmazGalleryImg6,
		ncmazGalleryImg7,
		ncmazGalleryImg8,
	].filter((img) => img) as NcmazFcImageHasDetailFieldsFragment[]

	return {
		...query,
		uri: query.uri || '',
		link: '',
		title: query.title || '',
		excerpt: query.excerpt || '',
		date: query.date || '',
		content: query.content || '',
		postFormats,
		postFormatSlug,
		postFormatsArr,
		featuredImage,
		ncPostMetaData,
		ncmazGalleryImgs,
		categories: {
			nodes: query.categories?.nodes?.map((term: any) =>
				getCatgoryDataFromCategoryFragment(term),
			),
		},
		tags: {
			nodes: query.tags?.nodes?.map((term: any) => getTagDataFromTagFragment(term)),
		},
		author: getUserDataFromUserCardFragment({ ...query.author?.node }),
		// @ts-ignore
		editorBlocks: query.editorBlocks || undefined,
	}
}
