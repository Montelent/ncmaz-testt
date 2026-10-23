'use client'

import { FC, useEffect, useState } from 'react'
import getTrans from '@/utils/getTrans'
import { TocHeading } from '@/utils/headingAnchor'
import { ListBulletIcon } from '@heroicons/react/24/outline'

const T = getTrans()

export interface TableOfContentsProps {
	headings: TocHeading[]
	className?: string
}

const TableOfContents: FC<TableOfContentsProps> = ({
	headings,
	className = '',
}) => {
	const [activeId, setActiveId] = useState<string>('')

	useEffect(() => {
		if (!headings.length) return

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort(
						(a, b) =>
							(a.boundingClientRect.top || 0) -
							(b.boundingClientRect.top || 0),
					)
				if (visible[0]?.target?.id) {
					setActiveId(visible[0].target.id)
				}
			},
			{
				rootMargin: '-80px 0px -60% 0px',
				threshold: [0, 0.25, 1],
			},
		)

		headings.forEach(({ id }) => {
			const el = document.getElementById(id)
			if (el) observer.observe(el)
		})

		return () => observer.disconnect()
	}, [headings])

	if (!headings.length) return null

	const minLevel = Math.min(...headings.map((h) => h.level))

	const handleClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		id: string,
	) => {
		e.preventDefault()
		const el = document.getElementById(id)
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' })
			window.history.replaceState(null, '', `#${id}`)
			setActiveId(id)
		}
	}

	return (
		<nav
			aria-label={T['On this page'] ?? 'On this page'}
			className={`nc-TableOfContents not-prose ${className}`}
		>
			<div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 shadow-sm dark:border-neutral-700 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800/80">
				<div className="flex items-center gap-2.5 border-b border-neutral-200/80 bg-white/60 px-4 py-3.5 dark:border-neutral-700 dark:bg-neutral-900/60 sm:px-5">
					<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
						<ListBulletIcon className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden />
					</span>
					<div>
						<p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
							Contents
						</p>
						<h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
							{T['On this page'] ?? 'On this page'}
						</h2>
					</div>
				</div>

				<ol className="m-0 list-none space-y-0.5 p-3 sm:p-4">
					{headings.map((heading, i) => {
						const indent = Math.max(0, heading.level - minLevel)
						const isActive = activeId === heading.id
						return (
							<li
								key={heading.id}
								style={{ paddingLeft: indent * 14 }}
								className="m-0"
							>
								<a
									href={`#${heading.id}`}
									onClick={(e) => handleClick(e, heading.id)}
									className={`group flex items-start gap-2.5 rounded-xl px-3 py-2 text-[13px] leading-snug no-underline transition-colors sm:text-sm ${
										isActive
											? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
											: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
									}`}
								>
									<span
										className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-semibold tabular-nums ${
											isActive
												? 'bg-primary-500 text-white'
												: 'bg-neutral-200/80 text-neutral-500 group-hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-400'
										}`}
										aria-hidden
									>
										{i + 1}
									</span>
									<span className="pt-0.5">{heading.text}</span>
								</a>
							</li>
						)
					})}
				</ol>
			</div>
		</nav>
	)
}

export default TableOfContents
