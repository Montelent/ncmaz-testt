'use client'

import { useEffect } from 'react'

type Props = {
	src: string
	alt?: string
	onClose: () => void
}

export default function ImageLightbox({ src, alt = '', onClose }: Props) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKey)
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = prev
		}
	}, [onClose])

	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
			role="dialog"
			aria-modal="true"
			aria-label="Image preview"
			onClick={onClose}
		>
			<button
				type="button"
				className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
				onClick={onClose}
			>
				Close
			</button>
			{/* stop click from closing when clicking the image */}
			<img
				src={src}
				alt={alt}
				className="max-h-[90vh] max-w-[95vw] object-contain"
				onClick={(e) => e.stopPropagation()}
			/>
		</div>
	)
}
