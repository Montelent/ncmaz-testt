const { withFaust, getWpHostname } = require('@faustwp/core')
const { createSecureHeaders } = require('next-secure-headers')

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withFaust({
	trailingSlash: true,
	reactStrictMode: true,
	typedRoutes: false,
	compress: true,
	poweredByHeader: false,

	// Shared Hostinger: WP GraphQL can 503 under parallel SSG.
	// Give each page more time and retry failed prerenders.
	staticPageGenerationTimeout: 180,
	experimental: {
		// Retry a failed static page a few times (transient 503s)
		staticGenerationRetryCount: 5,
		// Limit how many pages prerender at once (reduces GraphQL stampedes)
		staticGenerationMaxConcurrency: 2,
		// Fewer worker processes hitting bd.sammyguru.online together
		cpu: 1,
	},

	images: {
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'http',
				hostname: getWpHostname(),
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: getWpHostname(),
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '0.gravatar.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '1.gravatar.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '2.gravatar.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '3.gravatar.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'secure.gravatar.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'images.pexels.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname:
					process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTNAME_1 || '1.gravatar.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname:
					process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTNAME_2 || '1.gravatar.com',
				port: '',
				pathname: '/**',
			},
		],
	},
	async headers() {
		return [
			{
				source: '/:path*',
				headers: createSecureHeaders({
					xssProtection: false,
					frameGuard: [
						'allow-from',
						{ uri: process.env.NEXT_PUBLIC_WORDPRESS_URL },
					],
				}),
			},
			{
				source: '/_next/static/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/favicons/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=86400, stale-while-revalidate=604800',
					},
				],
			},
			{
				source: '/images/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=86400, stale-while-revalidate=604800',
					},
				],
			},
		]
	},
})
