function youtubeIdFromUrl(url: string): string | null {
	const m = url.match(
		/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
	)
	return m?.[1] || null
}

/** Replace bare YouTube links/paragraphs with responsive iframes */
export function enhanceEmbedsInHtml(html: string): string {
	if (!html) return html

	// Already has iframe for youtube — leave alone
	if (/youtube\.com\/embed\//i.test(html) && /<iframe/i.test(html)) {
		return html
	}

	return html.replace(
		/(?:<p>)?\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s<]+|youtu\.be\/[^\s<]+))\s*(?:<\/p>)?/gi,
		(full, url: string) => {
			const id = youtubeIdFromUrl(url)
			if (!id) return full
			return (
				'<figure class="wp-block-embed is-type-video is-provider-youtube">' +
				'<div class="wp-block-embed__wrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px">' +
				`<iframe src="https://www.youtube-nocookie.com/embed/${id}" ` +
				'style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" ' +
				'allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" ' +
				'allowfullscreen loading="lazy" title="YouTube video"></iframe>' +
				'</div></figure>'
			)
		},
	)
}
