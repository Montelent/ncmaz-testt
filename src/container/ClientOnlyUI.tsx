import React from 'react'
import { SiteWrapperChild } from './SiteWrapperChild'
import LoginModal from './LoginModal'

/**
 * Client-only UI that must not run during SSG/SSR.
 * Loaded with dynamic(..., { ssr: false }) from _app.
 */
export default function ClientOnlyUI(props: {
	__TEMPLATE_QUERY_DATA__?: any
}) {
	return (
		<>
			<SiteWrapperChild {...props} />
			<LoginModal />
		</>
	)
}
