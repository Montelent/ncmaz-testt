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

	compiler: {
		removeConsole:
			process.env.NODE_ENV === 'production'
				? { exclude: ['error', 'warn'] }
				: false,
	},

	modularizeImports: {
		lodash: {
			transform: 'lodash/{{member}}',
		},
	},

	staticPageGenerationTimeout: 180,
	experimental: {
		staticGenerationRetryCount: 5,
		staticGenerationMaxConcurrency: 2,
		cpu: 1,
		optimizePackageImports: [
			'@heroicons/react',
			'framer-motion',
			'lodash',
		],
	},

	images: {
		unoptimized: true,
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
				hostname: 'bd.samsverge.cc',
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

	async redirects() {
		return [
			// Path aliases only — host/domain redirects belong in Cloudflare DNS
			{
				source: '/:path*',
				has: [{ type: 'host', value: 'www.samsverge.cc' }],
				destination: 'https://samsverge.cc/:path*',
				permanent: true,
			},
			{
				source: '/terms',
				destination: '/tos/',
				permanent: true,
			},
			{
				source: '/terms/',
				destination: '/tos/',
				permanent: true,
			},
			{
				source: '/terms-of-use',
				destination: '/tos/',
				permanent: true,
			},
			{
				source: '/terms-of-use/',
				destination: '/tos/',
				permanent: true,
			},
			{
				source: '/blog',
				destination: '/posts/',
				permanent: true,
			},
			{
				source: '/blog/',
				destination: '/posts/',
				permanent: true,
			},
			{
				source: '/news',
				destination: '/category/news/',
				permanent: true,
			},
			{
				source: '/news/',
				destination: '/category/news/',
				permanent: true,
			},
			{
				source: '/all-posts',
				destination: '/posts/',
				permanent: true,
			},
			{
				source: '/all-posts/',
				destination: '/posts/',
				permanent: true,
			},
		]
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
