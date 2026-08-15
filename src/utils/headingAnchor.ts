export function slugifyHeading(text: string, index: number): string {
	const base = text
		.toLowerCase()
		.trim()
		.replace(/['"]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
	return base || `heading-${index + 1}`
}

/** Assign missing ids on h2–h4 inside a root element (browser only). */
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
			id = `\( {slugifyHeading(el.textContent || '', index)}- \){n}`
			n++
		}
		used.add(id)
		el.setAttribute('id', id)
	})
}
