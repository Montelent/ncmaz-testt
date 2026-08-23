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
import Script from 'next/script'
import dynamic from 'next/dynamic'
import SiteWrapperProvider from '@/container/SiteWrapperProvider'

const WPCodeShell = dynamic(() => import('@/components/WPCodeShell'), {
	ssr: false,
})

const ClientOnlyUI = dynamic(() => import('@/container/ClientOnlyUI'), {
	ssr: false,
})

// Fewer weights = less font download (helps GTmetrix / LCP)
const poppins = Poppins({
	subsets: ['latin'],
	display: 'swap',
	weight: ['400', '600'],
})

const GA_ID =
	process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
	process.env.NEXT_PUBLIC_GA_ID ||
	'G-VPJZK5TPPB'

export default function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter()

	return (
		<>
			{/* Load analytics after the page is interactive — reduces main-thread contention */}
			{GA_ID ? (
				<>
					<Script
						src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
						strategy="lazyOnload"
					/>
					<Script id="ga-init" strategy="lazyOnload">{
						`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});`
					}</Script>
				</>
			) : null}

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

						<Component {...pageProps} key={router.asPath} />

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
