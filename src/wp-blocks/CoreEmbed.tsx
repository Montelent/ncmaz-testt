'use client'

import React, { useEffect, useId, useRef } from 'react'
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
		return href[1].trim()
	}

	const bare = html.match(
		/https?:\/\/(?:www\.)?(?:youtube\.com\/[^\s"'<>]+|youtu\.be\/[^\s"'<>]+|vimeo\.com\/[^\s"'<>]+|twitter\.com\/[^\s"'<>]+|x\.com\/[^\s"'<>]+)/i,
	)
	return bare?.[0]?.trim() || ''
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

function isTwitterUrl(url: string): boolean {
	return /(?:twitter\.com|x\.com)\//i.test(url)
}

/** Normalize status URLs so widgets.js can render them */
function normalizeTwitterUrl(url: string): string {
	try {
		const u = new URL(url)
		// https://twitter.com/i/status/ID or x.com/i/status/ID
		const parts = u.pathname.split('/').filter(Boolean)
		const statusIdx = parts.indexOf('status')
		if (statusIdx >= 0 && parts[statusIdx + 1]) {
			const id = parts[statusIdx + 1].replace(/[^0-9]/g, '')
			if (id) return `https://twitter.com/i/status/${id}`
		}
		return url.replace('https://x.com/', 'https://twitter.com/')
	} catch {
		return url
	}
}

declare global {
	interface Window {
		twts?: {
			widgets?: {
				load?: (el?: HTMLElement) => void
			}
		}
	}
}

function loadTwitterWidgets(container?: HTMLElement | null) {
	if (typeof window === 'undefined') return

	const run = () => {
		try {
			window.twttr?.widgets?.load?.(container || undefined)
		} catch {
			/* ignore */
		}
	}

	if (window.twttr?.widgets?.load) {
		run()
		return
	}

	const existing = document.querySelector(
		'script[src="https://platform.twitter.com/widgets.js"]',
	) as HTMLScriptElement | null

	if (existing) {
		existing.addEventListener('load', run)
		// script may already be loaded
		run()
		return
	}

	const script = document.createElement('script')
	script.src = 'https://platform.twitter.com/widgets.js'
	script.async = true
	script.charset = 'utf-8'
	script.onload = run
	document.body.appendChild(script)
}

function TwitterEmbed({ url, className }: { url: string; className: string }) {
	const ref = useRef<HTMLDivElement>(null)
	const normalized = normalizeTwitterUrl(url)

	useEffect(() => {
		loadTwitterWidgets(ref.current)
		const t = window.setTimeout(() => loadTwitterWidgets(ref.current), 500)
		return () => window.clearTimeout(t)
	}, [normalized])

	return (
		<figure className={className + ' is-provider-twitter'}>
			<div ref={ref} className="wp-block-embed__wrapper flex justify-center">
				<blockquote className="twitter-tweet" data-dnt="true">
					<a href={normalized}>{normalized}</a>
				</blockquote>
			</div>
		</figure>
	)
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

	// WP already gave a real iframe embed
	if (renderedHtml && /<iframe/i.test(renderedHtml)) {
		return (
			<figure
				className={className}
				dangerouslySetInnerHTML={{ __html: renderedHtml }}
			/>
		)
	}

	// WP already gave a twitter blockquote
	if (renderedHtml && /twitter-tweet/i.test(renderedHtml)) {
		return <TwitterEmbedFromHtml html={renderedHtml} className={className} />
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
						<figcaption className="mt-2 text-center text-sm text-neutral-500">
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

	// X / Twitter — full widget embed
	if (
		provider === 'twitter' ||
		provider === 'x' ||
		isTwitterUrl(url)
	) {
		return <TwitterEmbed url={url} className={className} />
	}

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

	return null
}

function TwitterEmbedFromHtml({
	html,
	className,
}: {
	html: string
	className: string
}) {
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		loadTwitterWidgets(ref.current)
		const t = window.setTimeout(() => loadTwitterWidgets(ref.current), 500)
		return () => window.clearTimeout(t)
	}, [html])

	return (
		<figure className={className + ' is-provider-twitter'}>
			<div
				ref={ref}
				className="wp-block-embed__wrapper flex justify-center"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</figure>
	)
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
