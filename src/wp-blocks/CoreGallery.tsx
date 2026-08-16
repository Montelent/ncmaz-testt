'use client'

import React, { useMemo, useState } from 'react'
import { gql } from '@apollo/client'
import MyWordPressBlockViewer from '@/components/MyWordPressBlockViewer'
import ImageLightbox from '@/components/ImageLightbox'

type GalleryImg = { url: string; alt?: string; caption?: string }

function imagesFromAttributes(attrs: any): GalleryImg[] {
	if (!attrs) return []

	// WPGraphQL sometimes returns JSON string
	let images = attrs.images
	if (typeof images === 'string') {
		try {
			images = JSON.parse(images)
		} catch {
			images = []
		}
	}

	if (!Array.isArray(images)) return []

	return images
		.map((img: any) => ({
			url: img.url || img.fullUrl || img.sourceUrl || '',
			alt: img.alt || img.altText || '',
			caption: img.caption || '',
		}))
		.filter((img: GalleryImg) => !!img.url)
}

function imagesFromHtml(html: string): GalleryImg[] {
	if (!html) return []
	const out: GalleryImg[] = []
	const re = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
	let m: RegExpExecArray | null
	while ((m = re.exec(html))) {
		const tag = m[0]
		const altMatch = tag.match(/alt=["']([^"']*)["']/i)
		out.push({ url: m[1], alt: altMatch?.[1] || '' })
	}
	return out
}

const CoreGallery = (props: any) => {
	const [active, setActive] = useState<number | null>(null)
	const attrs = props?.attributes || {}
	const className = (attrs.className || '') + ' ' + (attrs.cssClassName || '')

	const fromAttrs = useMemo(() => imagesFromAttributes(attrs), [attrs])
	const fromHtml = useMemo(
		() => imagesFromHtml(props?.renderedHtml || ''),
		[props?.renderedHtml],
	)

	const images = fromAttrs.length ? fromAttrs : fromHtml

	// Nested core/image blocks (flat editorBlocks hierarchy)
	const children = props?.children
	if (children && Array.isArray(children) && children.length > 0) {
		return (
			<figure
				className={
					'wp-block-gallery has-nested-images ' + className.trim()
				}
			>
				{/* @ts-ignore */}
				<MyWordPressBlockViewer blocks={children} />
			</figure>
		)
	}

	if (images.length > 0) {
		return (
			<>
				<figure
					className={
						'wp-block-gallery columns-default is-cropped ' +
						className.trim()
					}
				>
					{images.map((img, i) => (
						<figure key={img.url + i} className="wp-block-image">
							<button
								type="button"
								className="block w-full cursor-zoom-in border-0 bg-transparent p-0"
								onClick={() => setActive(i)}
								aria-label="Open image"
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={img.url}
									alt={img.alt || ''}
									className="h-auto max-w-full rounded-lg"
								/>
							</button>
							{img.caption ? <figcaption>{img.caption}</figcaption> : null}
						</figure>
					))}
				</figure>
				{active !== null && images[active] ? (
					<ImageLightbox
						src={images[active].url}
						alt={images[active].alt || ''}
						onClose={() => setActive(null)}
					/>
				) : null}
			</>
		)
	}

	// Last resort: raw HTML from WordPress
	if (props?.renderedHtml) {
		return (
			<figure
				className={'wp-block-gallery ' + className.trim()}
				dangerouslySetInnerHTML={{ __html: props.renderedHtml }}
			/>
		)
	}

	return null
}

export const CoreGalleryFragments = {
	entry: gql`
		fragment CoreGalleryFragment on CoreGallery {
			attributes {
				className
				cssClassName
				columns
				linkTo
				sizeSlug
				images
			}
		}
	`,
	key: `CoreGalleryFragment`,
}

CoreGallery.fragments = CoreGalleryFragments
CoreGallery.displayName = 'CoreGallery'
export default CoreGallery
