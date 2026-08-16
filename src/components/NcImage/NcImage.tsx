import { FC } from 'react'
import MyImage, { Props as MyImageProps } from '../MyImage'

export interface NcImageProps extends MyImageProps {
	containerClassName?: string
}

const NcImage: FC<NcImageProps> = ({
	containerClassName = '',
	alt = 'nc-imgs',
	className = 'object-cover w-full h-full',
	sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
	quality = 70,
	...args
}) => {
	return (
		<div className={containerClassName}>
			<MyImage
				className={className}
				alt={alt}
				sizes={sizes}
				quality={quality}
				{...args}
			/>
		</div>
	)
}

export default NcImage
