'use client'

import React, { useMemo, useState } from 'react'
import { gql } from '@apollo/client'
import ImageLightbox from '@/components/ImageLightbox'

function asObject(attrs: unknown): Record<string, any> {
	if (!attrs) return {}
	if (typeof attrs === 'string') {
		try {
			return JSON.parse(attrs)
		} catch {
			return {}
		}
	}
	if (typeof attrs === 'object') return attrs as Record<string, any>
	return {}
}

function stripTags(html: string): string {
	return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function pickImageData(props: any): {
	url: string
	alt: string
	caption: string
} {
	const attrs = asObject(props?.attributes)
	const html: string = props?.renderedHtml || ''

	let url = String(attrs.url || '')
	let alt = String(attrs.alt || '')
	let caption = String(attrs.caption || '')

	if (!url && html) {
		const srcMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i)
		url = srcMatch?.[1] || ''
	}
	if (!alt && html) {
		const altMatch = html.match(/<img[^>]+alt=["']([^"']*)["']/i)
		alt = altMatch?.[1] || ''
	}
	// Caption often only exists in renderedHtml, not GraphQL attributes
	if (!caption && html) {
		const capMatch = html.match(
			/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i,
		)
		if (capMatch?.[1]) {
			caption = stripTags(capMatch[1])
		}
	}

	return { url, alt, caption }
}

const CoreImage = (props: any) => {
	const [open, setOpen] = useState(false)
	const { url, alt, caption } = useMemo(() => pickImageData(props), [props])
	const attrs = asObject(props?.attributes)
	const className = [attrs.className, attrs.cssClassName]
		.filter(Boolean)
		.join(' ')

	// If we still cannot resolve a URL, fall back to raw WP HTML (keeps caption)
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
			<figure className={'wp-block-image my-6 ' + className}>
				<button
					type="button"
					className="block w-full cursor-zoom-in border-0 bg-transparent p-0"
					onClick={() => setOpen(true)}
					aria-label="Open image"
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={url}
						alt={alt}
						className="h-auto max-w-full rounded-lg"
					/>
				</button>
				{caption ? (
					<figcaption className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
						{caption}
					</figcaption>
				) : null}
			</figure>
			{open ? (
				<ImageLightbox src={url} alt={alt || caption} onClose={() => setOpen(false)} />
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
