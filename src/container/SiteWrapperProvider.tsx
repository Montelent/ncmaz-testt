import React, { FC } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/stores/store'

interface SiteWrapperProviderProps {
	children: React.ReactNode
	__TEMPLATE_QUERY_DATA__?: any
}

const SiteWrapperProvider: FC<SiteWrapperProviderProps> = ({
	children,
}) => {
	return <Provider store={store}>{children}</Provider>
}

export default SiteWrapperProvider
