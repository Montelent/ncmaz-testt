'use client'

import React, { useMemo, useState } from 'react'
import { gql } from '@apollo/client'
import ImageLightbox from '@/components/ImageLightbox'

function pickUrl(props: any): { url: string; alt: string } {
	const attrs = props?.attributes || {}
	if (attrs.url) {
		return { url: attrs.url, alt: attrs.alt || '' }
	}

	const html = props?.renderedHtml || ''
	const srcMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i)
	const altMatch = html.match(/<img[^>]+alt=["']([^"']*)["']/i)
	return {
		url: srcMatch?.[1] || '',
		alt: altMatch?.[1] || attrs.alt || '',
	}
}

const CoreImage = (props: any) => {
	const [open, setOpen] = useState(false)
	const { url, alt } = useMemo(() => pickUrl(props), [props])
	const className =
		(props?.attributes?.className || '') +
		' ' +
		(props?.attributes?.cssClassName || '')

	if (!url && props?.renderedHtml) {
		return (
			<figure
				className={'wp-block-image ' + className}
				dangerouslySetInnerHTML={{ __html: props.renderedHtml }}
			/>
		)
	}

	if (!url) return null

	return (
		<>
			<figure className={'wp-block-image ' + className.trim()}>
				<button
					type="button"
					className="block w-full cursor-zoom-in border-0 bg-transparent p-0"
					onClick={() => setOpen(true)}
					aria-label="Open image"
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={url} alt={alt} className="h-auto max-w-full rounded-lg" />
				</button>
				{props?.attributes?.caption ? (
					<figcaption>{props.attributes.caption}</figcaption>
				) : null}
			</figure>
			{open ? (
				<ImageLightbox src={url} alt={alt} onClose={() => setOpen(false)} />
			) : null}
		</>
	)
}

export const CoreImageFragments = {
	entry: gql`
		fragment CoreImageFragment on CoreImage {
			attributes {
				url
				alt
				caption
				href
				className
				cssClassName
				linkDestination
				sizeSlug
				width
				height
			}
		}
	`,
	key: `CoreImageFragment`,
}

CoreImage.fragments = CoreImageFragments
CoreImage.displayName = 'CoreImage'
export default CoreImage
