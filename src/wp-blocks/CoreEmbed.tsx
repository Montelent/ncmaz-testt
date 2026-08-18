'use client'

import React, { useMemo } from 'react'
import { gql } from '@apollo/client'

function getYoutubeId(url: string): string | null {
	try {
		const u = new URL(url)
		if (u.hostname.includes('youtu.be')) {
			return u.pathname.replace('/', '') || null
		}
		if (u.hostname.includes('youtube.com')) {
			return u.searchParams.get('v')
		}
	} catch {
		/* ignore */
	}
	const m = url.match(
		/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
	)
	return m?.[1] || null
}

function getVimeoId(url: string): string | null {
	const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
	return m?.[1] || null
}

function isTwitter(url: string): boolean {
	return /(?:twitter\.com|x\.com)\//i.test(url)
}

const CoreEmbed = (props: any) => {
	const attrs = props?.attributes || {}
	const url: string = attrs.url || attrs.href || ''
	const provider = (attrs.providerNameSlug || '').toLowerCase()
	const className = [attrs.className, attrs.cssClassName, 'wp-block-embed']
		.filter(Boolean)
		.join(' ')

	const renderedHtml: string = props?.renderedHtml || ''

	// Prefer WP-rendered embed HTML when it already has an iframe / twitter blockquote
	const hasUsefulHtml =
		renderedHtml.includes('<iframe') ||
		renderedHtml.includes('twitter-tweet') ||
		renderedHtml.includes('wp-block-embed__wrapper')

	const youtubeId = useMemo(() => {
		if (provider === 'youtube' || /youtu/.test(url)) return getYoutubeId(url)
		return null
	}, [provider, url])

	const vimeoId = useMemo(() => {
		if (provider === 'vimeo' || /vimeo/.test(url)) return getVimeoId(url)
		return null
	}, [provider, url])

	if (hasUsefulHtml) {
		return (
			<figure
				className={className}
				dangerouslySetInnerHTML={{ __html: renderedHtml }}
			/>
		)
	}

	// YouTube
	if (youtubeId) {
		return (
			<figure className={className + ' wp-block-embed-youtube'}>
				<div className="wp-block-embed__wrapper aspect-video overflow-hidden rounded-xl">
					<iframe
						title={attrs.title || 'YouTube video'}
						src={`https://www.youtube.com/embed/${youtubeId}`}
						className="h-full w-full"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						loading="lazy"
					/>
				</div>
				{attrs.caption ? (
					<figcaption className="wp-element-caption">{attrs.caption}</figcaption>
				) : null}
			</figure>
		)
	}

	// Vimeo
	if (vimeoId) {
		return (
			<figure className={className + ' wp-block-embed-vimeo'}>
				<div className="wp-block-embed__wrapper aspect-video overflow-hidden rounded-xl">
					<iframe
						title={attrs.title || 'Vimeo video'}
						src={`https://player.vimeo.com/video/${vimeoId}`}
						className="h-full w-full"
						allow="autoplay; fullscreen; picture-in-picture"
						allowFullScreen
						loading="lazy"
					/>
				</div>
				{attrs.caption ? (
					<figcaption className="wp-element-caption">{attrs.caption}</figcaption>
				) : null}
			</figure>
		)
	}

	// Twitter / X — show linked card; full widget needs their script
	if (provider === 'twitter' || isTwitter(url)) {
		return (
			<figure className={className + ' wp-block-embed-twitter'}>
				<div className="wp-block-embed__wrapper rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary-600 underline"
					>
						{url}
					</a>
					<p className="mt-2 text-sm text-neutral-500">
						Open on X / Twitter
					</p>
				</div>
			</figure>
		)
	}

	// Generic fallback: clickable URL (better than raw text with no link)
	if (url) {
		return (
			<figure className={className}>
				<div className="wp-block-embed__wrapper">
					<a href={url} target="_blank" rel="noopener noreferrer">
						{url}
					</a>
				</div>
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
				allowResponsive
				responsive
			}
		}
	`,
	key: `CoreEmbedFragment`,
}

CoreEmbed.fragments = CoreEmbedFragments
CoreEmbed.displayName = 'CoreEmbed'
export default CoreEmbed
