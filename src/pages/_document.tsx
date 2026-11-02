import { NC_SITE_SETTINGS } from '@/contains/site-settings'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'

const FAVICON_VERSION = 5
const SITE_URL = process.env.NEXT_PUBLIC_URL
const SITE_TITLE =
	NC_SITE_SETTINGS.site_info?.site_title || 'SamsVerge'
const APP_NAME = 'SamsVerge'

// Rank Math → Webmaster Tools codes (WP stores them; headless must output on the frontend).
// Override via env without a code change if the codes rotate.
const GOOGLE_SITE_VERIFICATION =
	process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
	'LfNFFEj1UVI_ZA7I3sYFgSvdpcrTH9EtGTJROyxwER8'
const YANDEX_VERIFICATION =
	process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || 'b8ca7a4414b5243c'
const BING_VERIFICATION = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || ''

function v(href: string) {
	return `${href}?v=${FAVICON_VERSION}`
}

export default class Document extends NextDocument {
	// @ts-ignore
	static async getInitialProps(ctx) {
		const initialProps = await NextDocument.getInitialProps(ctx)
		return { ...initialProps }
	}

	render() {
		return (
			<Html
				lang="en"
				className="[--scroll-mt:9.875rem] lg:[--scroll-mt:6.3125rem]"
				dir={process.env.NEXT_PUBLIC_SITE_DIRECTION}
			>
				<Head>
					{/* Search-engine ownership verification (from Rank Math Webmaster Tools) */}
					{GOOGLE_SITE_VERIFICATION ? (
						<meta
							name="google-site-verification"
							content={GOOGLE_SITE_VERIFICATION}
						/>
					) : null}
					{YANDEX_VERIFICATION ? (
						<meta
							name="yandex-verification"
							content={YANDEX_VERIFICATION}
						/>
					) : null}
					{BING_VERIFICATION ? (
						<meta name="msvalidate.01" content={BING_VERIFICATION} />
					) : null}

					<link
						rel="preconnect"
						href="https://bd.samsverge.cc"
						crossOrigin="anonymous"
					/>
					<link rel="dns-prefetch" href="https://bd.samsverge.cc" />
					<link
						href={`${SITE_URL}/api/feeds/feed.json`}
						rel="alternate"
						type="application/feed+json"
						title={SITE_TITLE + ' JSON Feed'}
					/>
					<link
						href={`${SITE_URL}/api/feeds/rss.xml`}
						rel="alternate"
						type="application/rss+xml"
						title={SITE_TITLE + ' XML Feed'}
					/>
					<link
						href={`${SITE_URL}/api/feeds/feed.atom`}
						rel="alternate"
						type="application/atom+xml"
						title={SITE_TITLE + ' Atom Feed'}
					/>
					<link
						rel="apple-touch-icon"
						sizes="180x180"
						href={v('/favicons/apple-touch-icon.png')}
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="32x32"
						href={v('/favicons/favicon-32x32.png')}
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="16x16"
						href={v('/favicons/favicon-16x16.png')}
					/>
					<link rel="manifest" href={v('/favicons/site.webmanifest')} />
					<link
						rel="mask-icon"
						href={v('/favicons/safari-pinned-tab.svg')}
						color="#38bdf8"
					/>
					<link rel="shortcut icon" href={v('/favicons/favicon.ico')} />
					<meta name="apple-mobile-web-app-title" content={APP_NAME} />
					<meta name="application-name" content={APP_NAME} />
					<meta name="theme-color" content="#172A53" />
					<script
						dangerouslySetInnerHTML={{
							__html: `
						try {
							if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
							document.documentElement.classList.add('dark')
							} else {
							document.documentElement.classList.remove('dark')
							}
						} catch (_) {}
						`,
						}}
					/>
					<script
						dangerouslySetInnerHTML={{
							__html: `
							try {
								if (localStorage.dismiss_top_banner === 'true' ) {
								document.documentElement.classList.add('dismiss_top_banner')
								} else {
								document.documentElement.classList.remove('dismiss_top_banner')
								}
							} catch (_) {}
							`,
						}}
					/>
				</Head>
				<body className="relative bg-white text-base text-neutral-900 dark:bg-neutral-900/95 dark:text-neutral-100">
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}
