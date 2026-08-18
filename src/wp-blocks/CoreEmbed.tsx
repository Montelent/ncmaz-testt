'use client'

import React, { useMemo } from 'react'
import { gql } from '@apollo/client'

function extractUrlFromHtml(html: string): string {
	if (!html) return ''
	// href first
	const href = html.match(/href=["']([^"']+)["']/i)
	if (href?.[1] && /youtu|vimeo|twitter\.com|x\.com/i.test(href[1])) {
		return href[1]
	}
	// bare URL in text
	const bare = html.match(
		/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s"'<]+|youtu\.be\/[^\s"'<]+|vimeo\.com\/[^\s"'<]+|twitter\.com\/[^\s"'<]+|x\.com\/[^\s"'<]+)/i,
	)
	return bare?.[0] || ''
}

function getYoutubeId(url: string): string | null {
	if (!url) return null
	try {
		const u = new URL(url)
		if (u.hostname.includes('youtu.be')) {
			return u.pathname.split('/').filter(Boolean)[0] || null
		}
		if (u.hostname.includes('youtube.com')) {
			const v = u.searchParams.get('v')
			if (v) return v
			const parts = u.pathname.split('/')
			const embedIdx = parts.indexOf('embed')
			if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1]
			const shortsIdx = parts.indexOf('shorts')
			if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1]
		}
	} catch {
		/* ignore */
	}
	const m = url.match(
		/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
	)
	return m?.[1] || null
}

function getVimeoId(url: string): string | null {
	const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
	return m?.[1] || null
}

function YoutubeFrame({ id, title }: { id: string; title?: string }) {
	return (
		<div className="wp-block-embed__wrapper relative aspect-video w-full overflow-hidden rounded-xl">
			<iframe
				title={title || 'YouTube video'}
				src={`https://www.youtube-nocookie.com/embed/${id}`}
				className="absolute inset-0 h-full w-full border-0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen
				loading="lazy"
			/>
		</div>
	)
}

function VimeoFrame({ id, title }: { id: string; title?: string }) {
	return (
		<div className="wp-block-embed__wrapper relative aspect-video w-full overflow-hidden rounded-xl">
			<iframe
				title={title || 'Vimeo video'}
				src={`https://player.vimeo.com/video/${id}`}
				className="absolute inset-0 h-full w-full border-0"
				allow="autoplay; fullscreen; picture-in-picture"
				allowFullScreen
				loading="lazy"
			/>
		</div>
	)
}

const CoreEmbed = (props: any) => {
	const attrs = props?.attributes || {}
	const renderedHtml: string = props?.renderedHtml || ''

	const url: string = useMemo(() => {
		return (
			attrs.url ||
			attrs.href ||
			extractUrlFromHtml(renderedHtml) ||
			''
		)
	}, [attrs.url, attrs.href, renderedHtml])

	const provider = (attrs.providerNameSlug || '').toLowerCase()
	const className = [
		'wp-block-embed',
		attrs.className,
		attrs.cssClassName,
	]
		.filter(Boolean)
		.join(' ')

	const youtubeId = useMemo(() => getYoutubeId(url), [url])
	const vimeoId = useMemo(() => getVimeoId(url), [url])

	// If WP already sent a real iframe, use it
	if (renderedHtml.includes('<iframe')) {
		return (
			<figure
				className={className}
				dangerouslySetInnerHTML={{ __html: renderedHtml }}
			/>
		)
	}

	if (youtubeId || provider === 'youtube') {
		const id = youtubeId || getYoutubeId(url)
		if (id) {
			return (
				<figure className={className + ' is-type-video is-provider-youtube'}>
					<YoutubeFrame id={id} title={attrs.title} />
					{attrs.caption ? (
						<figcaption className="wp-element-caption">
							{attrs.caption}
						</figcaption>
					) : null}
				</figure>
			)
		}
	}

	if (vimeoId || provider === 'vimeo') {
		const id = vimeoId || getVimeoId(url)
		if (id) {
			return (
				<figure className={className + ' is-type-video is-provider-vimeo'}>
					<VimeoFrame id={id} title={attrs.title} />
					{attrs.caption ? (
						<figcaption className="wp-element-caption">
							{attrs.caption}
						</figcaption>
					) : null}
				</figure>
			)
		}
	}

	// Twitter / X
	if (provider === 'twitter' || /twitter\.com|x\.com/i.test(url)) {
		return (
			<figure className={className + ' is-provider-twitter'}>
				<div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="break-all text-primary-600 underline"
					>
						{url}
					</a>
				</div>
			</figure>
		)
	}

	// Last resort: still try to detect youtube from raw html string only
	const htmlYoutubeId = getYoutubeId(extractUrlFromHtml(renderedHtml))
	if (htmlYoutubeId) {
		return (
			<figure className={className + ' is-type-video is-provider-youtube'}>
				<YoutubeFrame id={htmlYoutubeId} />
			</figure>
		)
	}

	if (url) {
		return (
			<figure className={className}>
				<a href={url} target="_blank" rel="noopener noreferrer">
					{url}
				</a>
			</figure>
		)
	}

	if (renderedHtml) {
		return (
			<figure
				className={className}
				dangerouslySetInnerHTML={{ __html: renderedHtml }}
			/>
		)
	}

	return null
}

export const CoreEmbedFragments = {
	entry: gql`
		fragment CoreEmbedFragment on CoreEmbed {
			attributes {
				url
				providerNameSlug
				type
				className
				cssClassName
				caption
			}
		}
	`,
	key: `CoreEmbedFragment`,
}

CoreEmbed.fragments = CoreEmbedFragments
CoreEmbed.displayName = 'CoreEmbed'
export default CoreEmbed
