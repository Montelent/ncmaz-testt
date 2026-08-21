/** Shared helpers for post social sharing */

export type SharePayloadInput = {
	title?: string | null
	excerpt?: string | null
	url: string
	categories?: string[] | null
	imageUrl?: string | null
}

export type SharePayload = {
	title: string
	excerpt: string
	url: string
	hashtags: string
	hashtagList: string[]
	imageUrl: string
	/** Full body for WhatsApp / Telegram / Email / copy */
	fullText: string
	/** Shorter body for X (character-limited) */
	twitterText: string
}

function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\s+/g, ' ')
		.trim()
}

function toHashtag(name: string): string {
	return (
		'#' +
		name
			.replace(/[^a-zA-Z0-9\s]/g, '')
			.split(/\s+/)
			.filter(Boolean)
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join('')
	)
}

function truncate(text: string, max: number): string {
	if (text.length <= max) return text
	const cut = text.slice(0, max - 1)
	const lastSpace = cut.lastIndexOf(' ')
	return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + '…'
}

export function buildSharePayload(input: SharePayloadInput): SharePayload {
	const title = (input.title || '').trim()
	const excerpt = truncate(stripHtml(input.excerpt || ''), 155)
	const url = (input.url || '').trim()
	const imageUrl = (input.imageUrl || '').trim()

	const hashtagList = (input.categories || [])
		.map((c) => toHashtag(String(c)))
		.filter((h) => h.length > 1)
		.slice(0, 5)

	const hashtags = hashtagList.join(' ')

	const fullText = [title, excerpt, hashtags, url].filter(Boolean).join('\n\n')

	// X/Twitter: leave room for URL (~23 chars) + hashtags
	const twitterCore = [title, excerpt].filter(Boolean).join('\n\n')
	const twitterText = truncate(
		[twitterCore, hashtags].filter(Boolean).join('\n\n'),
		220,
	)

	return {
		title,
		excerpt,
		url,
		hashtags,
		hashtagList,
		imageUrl,
		fullText,
		twitterText,
	}
}

export function buildShareHref(
	network: string,
	payload: SharePayload,
): string {
	const { title, excerpt, url, fullText, twitterText, hashtagList, imageUrl } =
		payload
	const enc = encodeURIComponent

	switch (network) {
		case 'Facebook':
			// Preview image comes from Open Graph on the URL
			return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`
		case 'Twitter':
			return `https://twitter.com/intent/tweet?text=${enc(twitterText)}&url=${enc(url)}`
		case 'Linkedin':
			return `https://www.linkedin.com/shareArticle?mini=true&url=${enc(url)}&title=${enc(title)}&summary=${enc(excerpt)}`
		case 'WhatsApp':
			return `https://api.whatsapp.com/send?text=${enc(fullText)}`
		case 'Telegram':
			return `https://t.me/share/url?url=${enc(url)}&text=${enc([title, excerpt, hashtagList.join(' ')].filter(Boolean).join('\n\n'))}`
		case 'Reddit':
			return `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}`
		case 'Pinterest':
			return `https://pinterest.com/pin/create/button/?url=${enc(url)}&media=${enc(imageUrl)}&description=${enc([title, excerpt, hashtagList.join(' ')].filter(Boolean).join(' — '))}`
		case 'Email':
			return `mailto:?subject=${enc(title)}&body=${enc(fullText)}`
		default:
			return url
	}
}
