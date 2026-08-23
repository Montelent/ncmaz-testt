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
	const {
		title,
		date,
		categories,
		author,
		ncPostMetaData,
		uri,
	} = getPostDataFromPostFragment(post)

	const plainTitle = stripHtml(title || 'Read post')

	return (
		<div
			className={`nc-Card5 group relative rounded-3xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-900 ${className}`}
		>
			<Link
				href={uri}
				className="absolute inset-0 z-0 rounded-lg"
				aria-label={plainTitle}
			>
				<span className="sr-only">{plainTitle}</span>
			</Link>

			<div className="relative z-[1] flex flex-col">
				<CategoryBadgeList categories={categories?.nodes || []} />
				<h2
					className="my-4 block text-base font-semibold text-neutral-800 dark:text-neutral-300"
					title={plainTitle}
				>
					<span
						className="line-clamp-2"
						dangerouslySetInnerHTML={{ __html: title }}
					/>
				</h2>
				<CardAuthor2
					className="relative mt-auto"
					readingTime={ncPostMetaData?.readingTime || 1}
					author={author}
					date={date}
				/>
			</div>
		</div>
	)
}

export default Card5
