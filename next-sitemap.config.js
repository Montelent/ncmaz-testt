/** @type {import('next-sitemap').IConfig} */

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://sammyguru.online'

module.exports = {
	siteUrl: SITE_URL,
	generateRobotsTxt: true,
	exclude: [
		'/submission',
		'/dashboard/posts/published',
		'/dashboard/posts/draft',
		'/dashboard/posts/pending',
		'/dashboard/posts/trash',
		'/dashboard/posts/schedule',
		'/dashboard/edit-profile/general',
		'/dashboard/edit-profile/profile',
		'/dashboard/edit-profile/password',
		'/dashboard/edit-profile/socials',
		'/ncmaz_for_ncmazfc_preview_blocks',
		'/preview',
		'/reset-password',
		'/readinglist',
		'/dashboard',
		'/dashboard/edit-profile',
		'/dashboard/posts',
		'/wordpress-sitemap.xml',
	],
	robotsTxtOptions: {
		additionalSitemaps: [`${SITE_URL}/wordpress-sitemap.xml`],
	},
	transform: async (config, path) => {
		// Google requires W3C Datetime / ISO 8601 for lastmod (NOT "8/15/2026 3:30 PM")
		const lastmod = new Date().toISOString()

		const lowPriorityPaths = ['/contact', '/login', '/sign-up']
		const isLowPriority = lowPriorityPaths.includes(path.replace(/\/$/, ''))
		const isHomePage = path === '/'

		let changefreq = 'daily'
		if (isHomePage) {
			changefreq = 'daily'
		} else if (isLowPriority) {
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
