import { NextSeo } from 'next-seo'
import Head from 'next/head'

export type RankMathSeo = {
	title?: string | null
	description?: string | null
	canonicalUrl?: string | null
	robots?: string | string[] | Record<string, string> | null
	jsonLd?: {
		raw?: string | null
	} | null
	openGraph?: {
		title?: string | null
		description?: string | null
		url?: string | null
		type?: string | null
		siteName?: string | null
		twitterMeta?: {
			card?: string | null
		} | null
	} | null
}

/** Canonical public frontend — never leave blank or point at old domain. */
const DEFAULT_FRONTEND = 'https://samsverge.cc'
const LEGACY_HOSTS = [
	'sammyguru.online',
	'www.sammyguru.online',
	'bd.sammyguru.online',
]

function getFrontend(): string {
	const raw = (process.env.NEXT_PUBLIC_URL || DEFAULT_FRONTEND).replace(/\/$/, '')
	// Guard against misconfigured env still pointing at the retired domain
	try {
		const host = new URL(raw).hostname.replace(/^www\./, '')
		if (host === 'sammyguru.online' || host.endsWith('.sammyguru.online')) {
			return DEFAULT_FRONTEND
		}
	} catch {
		return DEFAULT_FRONTEND
	}
	return raw || DEFAULT_FRONTEND
}

function getBackend(): string {
	return (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/$/, '')
}

function frontendHostname(): string {
	try {
		return new URL(getFrontend()).hostname.replace(/^www\./, '')
	} catch {
		return 'samsverge.cc'
	}
}

function toFrontendUrl(url?: string | null): string | undefined {
	if (!url) return undefined
	const frontend = getFrontend()
	const backend = getBackend()
	if (url.includes('/wp-content/')) return url

	// Rewrite known legacy hosts to the current public domain
	let out = url
	for (const host of LEGACY_HOSTS) {
		out = out.split(`https://${host}`).join(frontend)
		out = out.split(`http://${host}`).join(frontend)
		out = out.split(`//${host}`).join(`//${new URL(frontend).hostname}`)
	}

	if (frontend && backend && out.startsWith(backend)) {
		return frontend + out.slice(backend.length)
	}

	// Hostname-only leaks from current backend
	try {
		if (backend) {
			const bh = new URL(backend).hostname
			const fh = new URL(frontend).hostname
			if (out.includes(bh)) {
				out = out.split(bh).join(fh)
			}
		}
	} catch {
		/* ignore */
	}
	return out
}

/**
 * og:site_name must be the public brand/host, never the WP backend (bd.).
 * Rank Math often sends the WP home URL or backend host here.
 */
function toFrontendSiteName(name?: string | null): string {
	const frontend = getFrontend()
	const backend = getBackend()
	const fallback = frontendHostname()

	if (!name || !String(name).trim()) {
		return fallback
	}

	let out = String(name).trim()

	if (backend) {
		out = out.split(backend).join(frontend || fallback)
	}

	try {
		if (backend) {
			const bh = new URL(backend).hostname
			const fh = frontend ? new URL(frontend).hostname : fallback
			out = out.split(bh).join(fh)
		}
	} catch {
		/* ignore */
	}

	// If Rank Math sent a full URL as site_name, use public hostname
	if (/^https?:\/\//i.test(out)) {
		try {
			return new URL(frontend || out).hostname.replace(/^www\./, '')
		} catch {
			return fallback
		}
	}

	// Still contains backend / legacy host substring
	if (/bd\.sammyguru\.online|sammyguru\.online/i.test(out)) {
		return fallback
	}

	return out || fallback
}
