'use client'

import {
	Popover,
	Transition,
	PopoverButton,
	PopoverPanel,
} from '@headlessui/react'
import { Fragment, useEffect } from 'react'
import Avatar from '@/components/Avatar/Avatar'
import SwitchDarkMode2 from '@/components/SwitchDarkMode/SwitchDarkMode2'
import Link from 'next/link'
import {
	BookmarkIcon,
	FingerPrintIcon,
	HeartIcon,
	LightBulbIcon,
	PlusCircleIcon,
	PowerIcon,
	UserIcon as TwUserIcon,
	UserPlusIcon,
} from '@heroicons/react/24/outline'
import { useLogout } from '@faustwp/core'
import { useSelector } from 'react-redux'
import { RootState } from '@/stores/store'
import { useLoginModal } from '@/hooks/useLoginModal'
import { getImageDataFromImageFragment } from '@/utils/getImageDataFromImageFragment'
import { NC_SITE_SETTINGS } from '@/contains/site-settings'
import CircleLoading from '../Loading/CircleLoading'
import { useRouter } from 'next/router'
import getTrans from '@/utils/getTrans'
import { UserIcon } from '../Icons/Icons'

interface Props {
	className?: string
}
export default function AvatarDropdown({ className = '' }: Props) {
	const { isReady, isAuthenticated } = useSelector(
		(state: RootState) => state.viewer.authorizedUser,
	)
	const { viewer } = useSelector((state: RootState) => state.viewer)
	const { logout } = useLogout()
	const { openLoginModal } = useLoginModal()
	const router = useRouter()
	const T = getTrans()

	useEffect(() => {
		//
	}, [])

	return (
		<div className={`AvatarDropdown ${className}`}>
			<Popover className="relative">
				{({ open, close }) => (
					<>
						<PopoverButton
							className={`flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 focus:outline-none dark:text-neutral-300 dark:hover:bg-neutral-800 sm:h-12 sm:w-12`}
						>
							{viewer?.ncUserMeta?.featuredImage?.node ? (
								<Avatar
									imgUrl={
										getImageDataFromImageFragment(
											viewer?.ncUserMeta?.featuredImage?.node,
										).sourceUrl || ''
									}
									userName={viewer?.name || 'R'}
									sizeClass="h-8 w-8 sm:h-9 sm:w-9"
								/>
							) : (
								<UserIcon className="h-6 w-6" />
							)}
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
							<PopoverPanel className="absolute -end-2 z-50 mt-3.5 w-screen max-w-[260px] px-4 sm:end-0 sm:px-0">
								<div className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-black ring-opacity-5">
									<div className="relative grid grid-cols-1 gap-6 bg-white px-6 py-7 dark:bg-neutral-800">
										{isAuthenticated && viewer ? (
											<div className="flex items-center space-x-3">
												<Avatar
													imgUrl={
														getImageDataFromImageFragment(
															viewer?.ncUserMeta?.featuredImage?.node,
														).sourceUrl || ''
													}
													userName={viewer?.name || 'R'}
													sizeClass="h-12 w-12"
												/>

												<div className="grow">
													<h4 className="font-semibold">{viewer?.name}</h4>
													<p className="mt-0.5 text-xs">{viewer?.email}</p>
												</div>
											</div>
										) : null}

										{isAuthenticated && viewer ? (
											<div className="w-full border-b border-neutral-200 dark:border-neutral-700" />
										) : null}

										{isReady && !isAuthenticated && (
											<button
												type="button"
												onClick={() => {
													close()
													openLoginModal()
												}}
												className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:hover:bg-neutral-700"
											>
												<div className="flex flex-shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
													<FingerPrintIcon className="h-6 w-6" />
												</div>
												<div className="ms-4">
													<p className="text-sm font-medium">{T['Sign in']}</p>
												</div>
											</button>
										)}

										{isReady && !isAuthenticated && (
											<Link
												href="/sign-up"
												className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:hover:bg-neutral-700"
												onClick={() => close()}
											>
												<div className="flex flex-shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
													<UserPlusIcon className="h-6 w-6" />
												</div>
												<div className="ms-4">
													<p className="text-sm font-medium">{T['Sign up']}</p>
												</div>
											</Link>
										)}

										{isReady &&
										NC_SITE_SETTINGS['submissions-settings']?.enable &&
										isAuthenticated && (
											<Link
												href="/submission/post-submission"
												className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:hover:bg-neutral-700"
												onClick={() => close()}
											>
												<div className="flex flex-shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
													<PlusCircleIcon className="h-6 w-6" />
												</div>
												<div className="ms-4">
													<p className="text-sm font-medium">{T.Create || 'Create'}</p>
												</div>
											</Link>
										)}

										{isAuthenticated && (
											<Link
												href="/dashboard/edit-profile/general"
												className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:hover:bg-neutral-700"
												onClick={() => close()}
											>
												<div className="flex flex-shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
													<TwUserIcon className="h-6 w-6" />
												</div>
												<div className="ms-4">
													<p className="text-sm font-medium">{T['Edit profile']}</p>
												</div>
											</Link>
										)}

										{isAuthenticated && (
											<Link
												href="/dashboard/posts/published"
												className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:hover:bg-neutral-700"
												onClick={() => close()}
											>
												<div className="flex flex-shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
													<svg
														className="h-6 w-6"
														fill="none"
														viewBox="0 0 24 24"
														strokeWidth={1.5}
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
														/>
													</svg>
												</div>
												<div className="ms-4">
													<p className="text-sm font-medium">{T['My Posts']}</p>
												</div>
											</Link>
										)}

										{isAuthenticated && (
											<Link
												href="/dashboard/posts/wishlist"
												className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:hover:bg-neutral-700"
												onClick={() => close()}
											>
												<div className="flex flex-shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
													<HeartIcon className="h-6 w-6" />
												</div>
												<div className="ms-4">
													<p className="text-sm font-medium">{T.Wishlist}</p>
												</div>
											</Link>
										)}

										{isAuthenticated && (
											<Link
												href="/readinglist"
												className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:hover:bg-neutral-700"
												onClick={() => close()}
											>
												<div className="flex flex-shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
													<BookmarkIcon className="h-6 w-6" />
												</div>
												<div className="ms-4">
													<span className="text-sm font-medium">{T['Reading list']}</span>
												</div>
											</Link>
										)}

										<div className="w-full border-b border-neutral-200 dark:border-neutral-700" />

										<div className="-m-3 flex items-center justify-between rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:hover:bg-neutral-700">
											<div className="flex items-center">
												<div className="flex flex-shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
													<LightBulbIcon className="h-6 w-6" />
												</div>
												<div className="ms-4">
													<p className="text-sm font-medium">{T['Dark theme']}</p>
												</div>
											</div>
											<SwitchDarkMode2 />
										</div>

										{isAuthenticated && (
											<button
												type="button"
												onClick={() => {
													close()
													logout()
												}}
												className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:hover:bg-neutral-700"
											>
												<div className="flex flex-shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
													<PowerIcon className="h-6 w-6" />
												</div>
												<div className="ms-4">
													<p className="text-sm font-medium">{T['Sign out']}</p>
												</div>
											</button>
										)}
									</div>
								</div>
							</PopoverPanel>
						</Transition>
					</>
				)}
			</Popover>
		</div>
	)
}
