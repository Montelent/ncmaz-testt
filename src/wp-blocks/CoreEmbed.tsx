'use client'

import React from 'react'
import { gql } from '@apollo/client'

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

function extractUrl(html: string, attrs: Record<string, any>): string {
	const direct = attrs.url || attrs.href || ''
	if (direct) return String(direct).trim()

	if (!html) return ''

	const href = html.match(/href=["']([^"']+)["']/i)
	if (href?.[1] && /youtu|vimeo|twitter\.com|x\.com/i.test(href[1])) {
		return href[1]
	}

	const bare = html.match(
		/https?:\/\/(?:www\.)?(?:youtube\.com\/[^\s"'<>]+|youtu\.be\/[^\s"'<>]+|vimeo\.com\/[^\s"'<>]+|twitter\.com\/[^\s"'<>]+|x\.com\/[^\s"'<>]+)/i,
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
			const parts = u.pathname.split('/').filter(Boolean)
			const embed = parts.indexOf('embed')
			if (embed >= 0 && parts[embed + 1]) return parts[embed + 1]
			const shorts = parts.indexOf('shorts')
			if (shorts >= 0 && parts[shorts + 1]) return parts[shorts + 1]
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

const wrapperStyle: React.CSSProperties = {
	position: 'relative',
	width: '100%',
	paddingBottom: '56.25%',
	height: 0,
	overflow: 'hidden',
	borderRadius: 12,
	background: '#000',
}

const iframeStyle: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	left: 0,
	width: '100%',
	height: '100%',
	border: 0,
}

const CoreEmbed = (props: any) => {
	const attrs = asObject(props?.attributes)
	const renderedHtml: string = props?.renderedHtml || ''
	const url = extractUrl(renderedHtml, attrs)
	const provider = String(attrs.providerNameSlug || '').toLowerCase()

	const className = [
		'wp-block-embed',
		'my-6',
		attrs.className,
		attrs.cssClassName,
	]
		.filter(Boolean)
		.join(' ')

	// WP already gave a real embed
	if (renderedHtml && /<iframe/i.test(renderedHtml)) {
		return (
			<figure
				className={className}
				dangerouslySetInnerHTML={{ __html: renderedHtml }}
			/>
		)
	}

	const youtubeId = getYoutubeId(url)
	if (youtubeId || provider === 'youtube') {
		const id = youtubeId || getYoutubeId(url)
		if (id) {
			return (
				<figure className={className + ' is-type-video is-provider-youtube'}>
					<div className="wp-block-embed__wrapper" style={wrapperStyle}>
						<iframe
							title={attrs.title || 'YouTube video'}
							src={`https://www.youtube.com/embed/${id}`}
							style={iframeStyle}
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowFullScreen
							loading="lazy"
						/>
					</div>
					{attrs.caption ? (
						<figcaption className="mt-2 text-sm text-neutral-500">
							{attrs.caption}
						</figcaption>
					) : null}
				</figure>
			)
		}
	}

	const vimeoId = getVimeoId(url)
	if (vimeoId || provider === 'vimeo') {
		const id = vimeoId || getVimeoId(url)
		if (id) {
			return (
				<figure className={className + ' is-type-video is-provider-vimeo'}>
					<div className="wp-block-embed__wrapper" style={wrapperStyle}>
						<iframe
							title={attrs.title || 'Vimeo video'}
							src={`https://player.vimeo.com/video/${id}`}
							style={iframeStyle}
							allow="autoplay; fullscreen; picture-in-picture"
							allowFullScreen
							loading="lazy"
						/>
					</div>
				</figure>
			)
		}
	}

	// Visible fallback — never disappear silently
	if (url) {
		return (
			<figure className={className}>
				<p className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="break-all text-blue-600 underline"
					>
						{url}
					</a>
				</p>
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

	// Debug-friendly placeholder so you can see the block is mounting
	if (process.env.NODE_ENV === 'development') {
		return (
			<figure className={className}>
				<p className="text-sm text-red-500">Embed block: no URL found</p>
			</figure>
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
