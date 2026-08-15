'use client'

import { MyTask01Icon } from '@/components/Icons/Icons'
import getTrans from '@/utils/getTrans'
import { slugifyHeading } from '@/utils/headingAnchor'
import { ContentBlock } from '@faustwp/blocks/dist/mjs/components/WordPressBlocksViewer'
import { flatListToHierarchical } from '@faustwp/core'
import {
	Popover,
	PopoverButton,
	PopoverPanel,
	Transition,
} from '@headlessui/react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Fragment, useMemo } from 'react'

const T = getTrans()

type HeadingNode = {
	tag: string
	id: string
	text: string
	level: number
	parentIndex: number
	parentId: string
	children?: HeadingNode[]
}

interface TableContentProps {
	content: string
	className?: string
	btnClassName?: string
	editorBlocks?: (ContentBlock | null)[]
}

const TableContent: React.FC<TableContentProps> = ({
	editorBlocks,
	content: oldContent,
	className = '',
	btnClassName = 'relative rounded-full flex items-center justify-center h-9 w-9 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700',
}) => {
	const content =
		editorBlocks
			?.map((block) => {
				if (block?.__typename === 'CoreHeading') {
					return block.renderedHtml || ''
				}
				return ''
			})
			.join('') || oldContent

	const headingsWrapList = useMemo(() => {
		if (typeof window === 'undefined') {
			// SSR: parse with regex-ish fallback via simple approach — DOMParser is browser-only
			return [] as HeadingNode[]
		}
		return extractHeadings(content)
	}, [content])

	function extractHeadings(html: string): HeadingNode[] {
		const parser = new DOMParser()
		const doc = parser.parseFromString(html, 'text/html')
		const headingElements = Array.from(
			doc.querySelectorAll('h2, h3, h4'),
		)

		const used = new Set<string>()
		let headingsWithId: HeadingNode[] = headingElements.map(
			(element, index) => {
				let id = element.getAttribute('id') || ''
				if (!id) {
					id = slugifyHeading(element.textContent || '', index)
					let n = 2
					while (used.has(id)) {
						id = `\( {slugifyHeading(element.textContent || '', index)}- \){n}`
						n++
					}
				}
				used.add(id)
				return {
					tag: element.tagName.toLowerCase(),
					id,
					level: parseInt(element.tagName.charAt(1), 10),
					parentIndex: -1,
					parentId: '',
					text: (element.textContent || '').trim(),
				}
			},
		)

		headingsWithId = headingsWithId.filter((item) => !!item.id && !!item.text)

		headingsWithId = headingsWithId.map((item, index) => {
			let parentIndex = index - 1
			while (parentIndex >= 0) {
				if (item.level > headingsWithId[parentIndex].level) {
					item.parentIndex = parentIndex
					item.parentId = headingsWithId[parentIndex].id
					break
				}
				parentIndex--
			}
			return item
		})

		return flatListToHierarchical(headingsWithId, {
			idKey: 'id',
			parentKey: 'parentId',
		}) as HeadingNode[]
	}

	// Prefer live DOM headings from article (always has real structure)
	const liveHeadings = useMemo(() => {
		if (typeof window === 'undefined') return [] as HeadingNode[]
		const root = document.getElementById('single-entry-content')
		if (!root) return headingsWrapList
		const els = Array.from(root.querySelectorAll('h2, h3, h4'))
		if (!els.length) return headingsWrapList

		const used = new Set<string>()
		let list: HeadingNode[] = els.map((element, index) => {
			let id = element.getAttribute('id') || ''
			if (!id) {
				id = slugifyHeading(element.textContent || '', index)
				let n = 2
				while (used.has(id)) {
					id = `\( {slugifyHeading(element.textContent || '', index)}- \){n}`
					n++
				}
				element.setAttribute('id', id)
			}
			used.add(id)
			return {
				tag: element.tagName.toLowerCase(),
				id,
				level: parseInt(element.tagName.charAt(1), 10),
				parentIndex: -1,
				parentId: '',
				text: (element.textContent || '').trim(),
			}
		})

		list = list.map((item, index) => {
			let parentIndex = index - 1
			while (parentIndex >= 0) {
				if (item.level > list[parentIndex].level) {
					item.parentIndex = parentIndex
					item.parentId = list[parentIndex].id
					break
				}
				parentIndex--
			}
			return item
		})

		return flatListToHierarchical(list, {
			idKey: 'id',
			parentKey: 'parentId',
		}) as HeadingNode[]
	}, [headingsWrapList, content])

	const tree = liveHeadings.length ? liveHeadings : headingsWrapList

	const renderHeadings = (headings: HeadingNode[]) => (
		<>
			{headings.map((heading) => (
				<li key={heading.id}>
					<a
						className="inline-flex gap-2 hover:text-neutral-800 dark:hover:text-neutral-200"
						href={`#${heading.id}`}
						onClick={(e) => {
							e.preventDefault()
							const el = document.getElementById(heading.id)
							if (el) {
								el.scrollIntoView({ behavior: 'smooth', block: 'start' })
								window.history.replaceState(null, '', `#${heading.id}`)
							}
						}}
					>
						<ArrowRightIcon className="h-3 w-3 flex-shrink-0 self-center rtl:rotate-180" />
						{heading.text}
					</a>
					{heading?.children?.length ? (
						<ol className="mt-2 space-y-3 ps-4 text-neutral-500 dark:text-neutral-300">
							{renderHeadings(heading.children)}
						</ol>
					) : null}
				</li>
			))}
		</>
	)

	if (!tree?.length) {
		return null
	}

	return (
		<div className={className}>
			<Popover className="relative z-40">
				{({ open }) => (
					<>
						<PopoverButton
							className={`${
								open ? '' : 'text-opacity-90'
							} group ${btnClassName} focus:outline-none focus-visible:ring-0`}
							title="Table of contents"
						>
							<MyTask01Icon className="h-[18px] w-[18px]" />
						</PopoverButton>

						<Transition
							as={Fragment}
							enter="transition ease-out duration-200"
							enterFrom="opacity-0 translate-y-1"
							enterTo="opacity-100 translate-y-0"
							leave="transition ease-in duration-150"
							leaveFrom="opacity-100 translate-y-0"
							leaveTo="opacity-0 translate-y-1"
						>
							<PopoverPanel className="hiddenScrollbar absolute -end-2.5 bottom-full z-40 mb-5 max-h-[min(70vh,600px)] w-screen max-w-[min(90vw,20rem)] overflow-y-auto rounded-xl bg-white shadow-xl ring-1 ring-black/5 lg:end-auto lg:max-w-md lg:-translate-x-1/2 rtl:lg:translate-x-1/2 dark:bg-neutral-800 dark:ring-neutral-600">
								<div className="relative p-4 sm:p-7">
									<nav>
										<h2 className="font-display text-sm font-medium text-slate-900 dark:text-white">
											{T['On this page']}
										</h2>
										<ol className="mt-4 space-y-3 text-sm">
											{renderHeadings(tree)}
										</ol>
									</nav>
								</div>
							</PopoverPanel>
						</Transition>
					</>
				)}
			</Popover>
		</div>
	)
}

export default TableContent
