import Link from 'next/link'
import Head from 'next/head'

export type Crumb = {
	label: string
	href?: string
}

type Props = {
	items: Crumb[]
	className?: string
}

export default function Breadcrumbs({ items, className = '' }: Props) {
	if (!items?.length) return null

	const siteUrl = (process.env.NEXT_PUBLIC_URL || '').replace(/\/$/, '')

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.label,
			...(item.href && siteUrl
				? {
						item: item.href.startsWith('http')
							? item.href
							: siteUrl + item.href,
					}
				: {}),
		})),
	}

	const jsonLdString = JSON.stringify(jsonLd)

	return (
		<>
			{jsonLdString ? (
				<Head>
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: jsonLdString }}
					/>
				</Head>
			) : null}

			<nav
				aria-label="Breadcrumb"
				className={
					'text-sm text-neutral-500 dark:text-neutral-400 ' + className
				}
			>
				<ol className="flex flex-wrap items-center gap-1.5">
					{items.map((item, index) => {
						const isLast = index === items.length - 1
						return (
							<li
								key={item.label + '-' + index}
								className="flex items-center gap-1.5"
							>
								{index > 0 && (
									<span
										className="text-neutral-300 dark:text-neutral-600"
										aria-hidden
									>
										/
									</span>
								)}
								{!isLast && item.href ? (
									<Link
										href={item.href}
										className="hover:text-neutral-800 dark:hover:text-neutral-200"
									>
										{item.label}
									</Link>
								) : (
									<span
										className={
											isLast
												? 'font-medium text-neutral-800 dark:text-neutral-200'
												: undefined
										}
										aria-current={isLast ? 'page' : undefined}
									>
										{item.label}
									</span>
								)}
							</li>
						)
					})}
				</ol>
			</nav>
		</>
	)
}
