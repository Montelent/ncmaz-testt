import { FC } from 'react'
import CardAuthor2 from '@/components/CardAuthor2/CardAuthor2'
import CategoryBadgeList from '@/components/CategoryBadgeList/CategoryBadgeList'
import Link from 'next/link'
import { CommonPostCardProps } from '../Card2/Card2'
import { getPostDataFromPostFragment } from '@/utils/getPostDataFromPostFragment'

export interface Card5Props extends CommonPostCardProps {}

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, '').trim()
}

const Card5: FC<Card5Props> = ({ className = '', post }) => {
	const { title, date, categories, author, ncPostMetaData, uri } =
		getPostDataFromPostFragment(post)

	const plainTitle = stripHtml(title || 'Read post')

	return (
		<div
			className={`nc-Card5 group relative rounded-3xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-900 ${className}`}
		>
			{/* Full-card hit area on top so title/text open the post (not text-select) */}
			<Link
				href={uri}
				className="absolute inset-0 z-10 rounded-3xl"
				aria-label={plainTitle}
			>
				<span className="sr-only">{plainTitle}</span>
			</Link>

			{/* pointer-events-none: clicks pass through to the stretch link */}
			<div className="relative z-0 flex select-none flex-col pointer-events-none">
				{/* Badges stay clickable (category pages) */}
				<div className="relative z-20 pointer-events-auto">
					<CategoryBadgeList categories={categories?.nodes || []} />
				</div>

				<h2
					className="my-4 block text-base font-semibold text-neutral-800 dark:text-neutral-300"
					title={plainTitle}
				>
					<span
						className="line-clamp-2"
						dangerouslySetInnerHTML={{ __html: title }}
					/>
				</h2>

				{/* Author stays clickable */}
				<div className="relative z-20 mt-auto pointer-events-auto">
					<CardAuthor2
						className="relative"
						readingTime={ncPostMetaData?.readingTime || 1}
						author={author}
						date={date}
					/>
				</div>
			</div>
		</div>
	)
}

export default Card5
