/** @type {import('next-sitemap').IConfig} */

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://sammyguru.online'

module.exports = {
	siteUrl: SITE_URL,
	generateRobotsTxt: true,
	// Styled sitemap view in browsers (optional for humans; ignored by Google)
	xslUrl: `${SITE_URL}/sitemap.xsl`,
	exclude: [
		'/submission',
		'/submission/*',
		'/dashboard',
		'/dashboard/*',
		'/preview',
		'/preview/*',
		'/reset-password',
		'/reset-password/*',
		'/readinglist',
		'/readinglist/*',
		'/login',
		'/sign-up',
		'/ncmaz_for_ncmazfc_preview_blocks',
		'/api/*',
		'/server-sitemap.xml',
	],
	robotsTxtOptions: {
		policies: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/dashboard',
					'/dashboard/*',
					'/preview',
					'/preview/*',
					'/submission',
					'/submission/*',
					'/login',
					'/sign-up',
					'/reset-password',
					'/readinglist',
					'/api/',
					'/ncmaz_for_ncmazfc_preview_blocks',
				],
			},
			// Optional: be explicit for major crawlers (same rules)
			{
				userAgent: 'Googlebot',
				allow: '/',
				disallow: [
					'/dashboard',
					'/dashboard/*',
					'/preview',
					'/preview/*',
					'/submission',
					'/submission/*',
					'/login',
					'/sign-up',
					'/reset-password',
					'/readinglist',
					'/api/',
				],
			},
		],
		additionalSitemaps: [
			`${SITE_URL}/sitemap.xml`,
			`${SITE_URL}/wordpress-sitemap.xml`,
		],
	},
	transform: async (config, path) => {
		// Valid W3C / ISO 8601 lastmod (Google-safe)
		const lastmod = new Date().toISOString()

		const lowPriorityPaths = ['/contact', '/about-us', '/disclaimer', '/privacy-policy', '/tos']
		const isLowPriority = lowPriorityPaths.includes(path.replace(/\/$/, ''))
		const isHomePage = path === '/'

		let changefreq = 'daily'
		if (isLowPriority) {
			changefreq = 'monthly'
		}

		const priority = isLowPriority ? 0.3 : isHomePage ? 1.0 : 0.7

		return {
			loc: path,
			lastmod,
			changefreq,
			priority,
		}
	},
}
