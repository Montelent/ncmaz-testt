'use client'

import React from 'react'
import { useQuery } from '@apollo/client'
import {
	WPCODE_SNIPPETS_QUERY,
	WPCodeHeaderSnippets,
	WPCodeBodyOpenSnippets,
	WPCodeFooterSnippets,
} from '@/components/WPCodeSnippets'

export default function WPCodeShell({ children }: { children: React.ReactNode }) {
	const { data, error } = useQuery(WPCODE_SNIPPETS_QUERY, {
		errorPolicy: 'ignore',
		ssr: false,
	})

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
