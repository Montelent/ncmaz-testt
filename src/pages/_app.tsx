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
import SiteWrapperProvider from '@/container/SiteWrapperProvider'
import { Toaster } from 'react-hot-toast'
import NextNProgress from 'nextjs-progressbar'
import themeJson from '@/../theme.json'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import { useQuery } from '@apollo/client'
import {
	WPCODE_SNIPPETS_QUERY,
	WPCodeHeaderSnippets,
	WPCodeBodyOpenSnippets,
	WPCodeFooterSnippets,
} from '@/components/WPCodeSnippets'

const poppins = Poppins({
	subsets: ['latin'],
	display: 'swap',
	weight: ['300', '400', '500', '600', '700'],
})

// Fetches active WPCode snippets and places them around whatever this
// wraps. Must sit inside <FaustProvider> so useQuery has Apollo context.
// We skip the query during static generation (server) to prevent
// Apollo invariant #31 on Hostinger / shared hosting builds.
function WPCodeShell({ children }: { children: React.ReactNode }) {
	const { data, error } = useQuery(WPCODE_SNIPPETS_QUERY, {
		skip: typeof window === 'undefined', // never run on the server during SSG
		errorPolicy: 'ignore',
	})

	// If the query was skipped or failed, just render children (no snippets)
	if (error || !data) {
		return <>{children}</>
	}

	const snippets = data?.wpcodeSnippets ?? []

	return (
		<>
			<WPCodeHeaderSnippets snippets={snippets} />
			<WPCodeBodyOpenSnippets snippets={snippets} />
			{children}
			<WPCodeFooterSnippets snippets={snippets} />
		</>
	)
}

export default function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter()

	return (
		<>
			<GoogleAnalytics trackPageViews />

			<FaustProvider pageProps={pageProps}>
				<WPCodeShell>
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
				</WPCodeShell>
			</FaustProvider>
		</>
	)
}
