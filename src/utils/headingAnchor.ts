export function slugifyHeading(text: string, index: number): string {
	const base = text
		.toLowerCase()
		.trim()
		.replace(/['"]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
	return base || 'heading-' + (index + 1)
}

/** Assign missing ids on h2–h4 inside a root element (browser). */
export function ensureHeadingIds(root: HTMLElement): void {
	const used = new Set<string>()
	const headings = root.querySelectorAll('h2, h3, h4')
	headings.forEach((el, index) => {
		const current = el.getAttribute('id')
		if (current) {
			used.add(current)
			return
		}
		let id = slugifyHeading(el.textContent || '', index)
		let n = 2
		while (used.has(id)) {
			id = slugifyHeading(el.textContent || '', index) + '-' + n
			n++
		}
		used.add(id)
		el.setAttribute('id', id)
	})
}

/**
 * Inject id attributes into heading tags in an HTML string (SSR-safe).
 * Used on CoreHeading renderedHtml so TOC anchors exist in first HTML.
 */
export function addHeadingIdsToHtml(html: string): string {
	if (!html) return html

	const used = new Set<string>()
	let index = 0

	return html.replace(
		/<h([2-4])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
		(full, level: string, attrs: string | undefined, inner: string) => {
			const attrStr = attrs || ''
			if (/\sid\s*=/i.test(attrStr)) {
				const m = attrStr.match(/\sid\s*=\s*["']([^"']+)["']/i)
				if (m?.[1]) used.add(m[1])
				return full
			}
			const text = inner.replace(/<[^>]+>/g, '').trim()
			let id = slugifyHeading(text, index++)
			let n = 2
			while (used.has(id)) {
				id = slugifyHeading(text, index) + '-' + n
				n++
			}
			used.add(id)
			return '<h' + level + attrStr + ' id="' + id + '">' + inner + '</h' + level + '>'
		},
	)
}
