import '@/../faust.config'
import React from 'react'
import { useRouter } from 'next/router'
import { FaustProvider } from '@faustwp/core'
import '@/styles/globals.css'
import '@/styles/index.scss'
import { AppProps } from 'next/app'
import { WordPressBlocksProvider, fromThemeJson } from '@faustwp/blocks'
import blocks from '@/wp-blocks'
import { Poppins } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import NextNProgress from 'nextjs-progressbar'
import themeJson from '@/../theme.json'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import dynamic from 'next/dynamic'
import SiteWrapperProvider from '@/container/SiteWrapperProvider'

// Client-only shells (do NOT wrap the page Component)
const WPCodeShell = dynamic(() => import('@/components/WPCodeShell'), {
	ssr: false,
})

const ClientOnlyUI = dynamic(() => import('@/container/ClientOnlyUI'), {
	ssr: false,
})

const poppins = Poppins({
	subsets: ['latin'],
	display: 'swap',
	weight: ['300', '400', '500', '600', '700'],
})

export default function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter()

	return (
		<>
			<GoogleAnalytics trackPageViews />

			<FaustProvider pageProps={pageProps}>
				<WordPressBlocksProvider
					config={{
						blocks,
						theme: fromThemeJson(themeJson),
					}}
				>
					<SiteWrapperProvider {...pageProps}>
						<style jsx global>{`
							html {
								font-family: ${poppins.style.fontFamily};
							}
						`}</style>
						<NextNProgress color="#818cf8" />

						{/* Page must SSR / SSG under FaustProvider */}
						<Component {...pageProps} key={router.asPath} />

						{/* Client-only extras */}
						<WPCodeShell />
						<ClientOnlyUI
							__TEMPLATE_QUERY_DATA__={
								(pageProps as any).__TEMPLATE_QUERY_DATA__
							}
						/>

						<Toaster
							position="bottom-left"
							toastOptions={{
								style: {
									fontSize: '14px',
									borderRadius: '0.75rem',
								},
							}}
							containerClassName="text-sm"
						/>
					</SiteWrapperProvider>
				</WordPressBlocksProvider>
			</FaustProvider>
		</>
	)
}
