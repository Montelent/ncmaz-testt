import Image, { ImageProps } from 'next/image'
import { FC } from 'react'

export interface Props extends ImageProps {
	enableDefaultPlaceholder?: boolean
	defaultPlaceholderDataUrl?: string
}

const MyImage: FC<Props> = ({
	enableDefaultPlaceholder = false,
	defaultPlaceholderDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+vx1PQAIqAM4jZDFJQAAAABJRU5ErkJggg==',
	quality = 70,
	...props
}) => {
	return (
		<Image
			{...props}
			quality={quality}
			className={`${props.className || ''} ${
				props.src ? '' : 'dark:brightness-75 dark:filter'
			}`}
			src={props.src || '/images/placeholder.png'}
			placeholder={
				enableDefaultPlaceholder
					? 'blur'
					: props.placeholder
			}
			blurDataURL={
				enableDefaultPlaceholder
					? defaultPlaceholderDataUrl
					: props.blurDataURL
			}
		/>
	)
}

export default MyImage
