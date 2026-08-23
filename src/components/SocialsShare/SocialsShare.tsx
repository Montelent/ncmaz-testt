import { FC } from 'react'
import { NcDropDownItem } from '../NcDropDown/NcDropDown'
import {
	buildShareHref,
	buildSharePayload,
	type SharePayloadInput,
} from '@/utils/buildSharePayload'

export interface SocialsShareProps {
	className?: string
	itemClass?: string
	link?: string
	title?: string | null
	excerpt?: string | null
	categories?: string[] | null
	imageUrl?: string | null
}

export type TSocialShareItem =
	| 'Facebook'
	| 'Twitter'
	| 'Threads'
	| 'Linkedin'
	| 'WhatsApp'
	| 'Telegram'
	| 'Reddit'
	| 'Pinterest'
	| 'Email'

interface SocialShareType extends NcDropDownItem<TSocialShareItem> {}

export const SOCIALS_DATA: SocialShareType[] = [
	{
		id: 'Facebook',
		name: 'Facebook',
		icon: `<svg class="w-5 h-5" fill="currentColor" height="1em" viewBox="0 0 512 512" aria-hidden="true"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/></svg>`,
		href: '#',
		isTargetBlank: true,
	},
	{
		id: 'Twitter',
		name: 'X / Twitter',
		icon: `<svg class="w-5 h-5" fill="currentColor" height="1em" viewBox="0 0 512 512" aria-hidden="true"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>`,
		href: '#',
		isTargetBlank: true,
	},
	{
		id: 'Threads',
		name: 'Threads',
		icon: `<svg class="w-5 h-5" fill="currentColor" height="1em" viewBox="0 0 192 192" aria-hidden="true"><path d="M141.537 88.988c-1.271-0.804-2.576-1.54-3.913-2.208 0.37-1.529 0.688-3.09 0.945-4.68 2.995-18.48 0.152-32.875-8.46-42.738-8.143-9.314-21.348-14.051-39.22-14.07h-0.07c-17.762 0-31.022 4.76-39.393 14.14-7.93 8.885-10.99 21.53-9.09 37.58 0.32 2.7 0.78 5.41 1.37 8.11-13.4 3.67-24.05 10.53-31.14 20.11-8.53 11.53-12.87 26.66-12.87 44.99v0.17c0 18.35 4.34 33.5 12.87 45.03 7.09 9.58 17.74 16.44 31.14 20.11-0.59 2.7-1.05 5.41-1.37 8.11-1.9 16.05 1.16 28.7 9.09 37.58 8.37 9.38 21.63 14.14 39.39 14.14h0.07c17.87-0.02 31.08-4.76 39.22-14.07 8.61-9.86 11.45-24.26 8.46-42.74-0.26-1.59-0.57-3.15-0.94-4.68 1.34-0.67 2.64-1.4 3.91-2.21 15.64-9.92 24.55-25.42 24.55-43.69v-0.17c0-18.27-8.91-33.77-24.55-43.69zm-51.6-49.64c13.55 0.01 22.5 3.37 27.38 10.04 4.67 6.39 6.03 15.96 4.12 29.13-0.18 1.22-0.4 2.44-0.65 3.66-8.83-1.77-18.33-2.68-28.36-2.68h-5.04c-10.03 0-19.53 0.91-28.36 2.68-0.25-1.22-0.47-2.44-0.65-3.66-1.91-13.17-0.55-22.74 4.12-29.13 4.88-6.67 13.83-10.03 27.38-10.04h0.06zm0 142.36c-13.55-0.01-22.5-3.37-27.38-10.04-4.67-6.39-6.03-15.96-4.12-29.13 0.18-1.22 0.4-2.44 0.65-3.66 8.83 1.77 18.33 2.68 28.36 2.68h5.04c10.03 0 19.53-0.91 28.36-2.68 0.25 1.22 0.47 2.44 0.65 3.66 1.91 13.17 0.55 22.74-4.12 29.13-4.88 6.67-13.83 10.03-27.38 10.04h-0.06zm56.66-56.57c0 13.28-6.56 24.67-18.12 31.34-7.61-5.82-16.92-10.17-27.55-12.78-0.6-0.15-1.2-0.29-1.81-0.42 3.39-4.3 5.27-9.7 5.27-15.55v-5.04c0-5.85-1.88-11.25-5.27-15.55 0.61-0.13 1.21-0.27 1.81-0.42 10.63-2.61 19.94-6.96 27.55-12.78 11.56 6.67 18.12 18.06 18.12 31.34v0.17c0 0.28 0 0.56-0.01 0.84v-1.15z"/></svg>`,
		href: '#',
		isTargetBlank: true,
	},
	{
		id: 'WhatsApp',
		name: 'WhatsApp',
		icon: `<svg class="w-5 h-5" fill="currentColor" height="1em" viewBox="0 0 448 512" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`,
		href: '#',
		isTargetBlank: true,
	},
	{
		id: 'Telegram',
		name: 'Telegram',
		icon: `<svg class="w-5 h-5" fill="currentColor" height="1em" viewBox="0 0 496 512" aria-hidden="true"><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm121.8 169.9l-40.7 191.8c-3 13.6-11.1 16.9-22.4 10.5l-62-45.7-29.9 28.8c-3.3 3.3-6.1 6.1-12.5 6.1l4.4-63.1 114.9-103.8c5-4.4-1.1-6.9-7.7-2.5l-142 89.4-61.2-19.1c-13.3-4.2-13.6-13.3 2.8-19.7l239.1-92.2c11.1-4 20.8 2.7 17.2 19.5z"/></svg>`,
		href: '#',
		isTargetBlank: true,
	},
	{
		id: 'Linkedin',
		name: 'LinkedIn',
		icon: `<svg class="w-5 h-5" fill="currentColor" height="1em" viewBox="0 0 448 512" aria-hidden="true"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/></svg>`,
		href: '#',
		isTargetBlank: true,
	},
	{
		id: 'Reddit',
		name: 'Reddit',
		icon: `<svg class="w-5 h-5" fill="currentColor" height="1em" viewBox="0 0 512 512" aria-hidden="true"><path d="M201.2 342.1c-17.5 0-31.8-14.3-31.8-31.8s14.3-31.8 31.8-31.8 31.8 14.3 31.8 31.8-14.3 31.8-31.8 31.8zm109.7 0c-17.5 0-31.8-14.3-31.8-31.8s14.3-31.8 31.8-31.8 31.8 14.3 31.8 31.8-14.4 31.8-31.8 31.8zM440.6 193.6c-3.4 0-6.7.4-9.9 1.1-12.1-17.3-31.7-28.5-53.7-28.5-7.1 0-14 1.1-20.5 3.2-15.1-27.9-44.2-46.9-77.5-49.3l13.1-61.5 42.5 9c0 17.5 14.3 31.8 31.8 31.8s31.8-14.3 31.8-31.8S384.1 36.3 366.6 36.3c-12.3 0-23.1 7-28.2 17.3l-50.2-10.6c-3.9-.8-7.8.9-9.6 4.5l-16.2 76.1c-33.3 2.5-62.4 21.5-77.5 49.3-6.5-2.1-13.4-3.2-20.5-3.2-22 0-41.6 11.2-53.7 28.5-3.2-.7-6.5-1.1-9.9-1.1-35.1 0-63.6 28.5-63.6 63.6 0 26.2 15.9 48.7 38.6 58.3 2.5 59.1 61.8 106.5 132.1 106.5 70.3 0 129.6-47.4 132.1-106.5 22.7-9.6 38.6-32.1 38.6-58.3.1-35.1-28.4-63.6-63.5-63.6zM256 414.9c-47.8 0-89.3-26.6-104.5-65.2 13.3 4.9 28.6 7.7 44.5 7.7 58.2 0 106.4-31.5 116.1-74.1 9.7 42.6 57.9 74.1 116.1 74.1 15.9 0 31.2-2.8 44.5-7.7-15.3 38.6-56.8 65.2-104.6 65.2h-112.1z"/></svg>`,
		href: '#',
		isTargetBlank: true,
	},
	{
		id: 'Pinterest',
		name: 'Pinterest',
		icon: `<svg class="w-5 h-5" fill="currentColor" height="1em" viewBox="0 0 496 512" aria-hidden="true"><path d="M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.9 71.8-163.9 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5-20.3 6.9-28.1.6-2.5.3-4.7-1.7-7.1-10.1-12.5-18.3-35.3-18.3-56.6 0-54.7 41.4-107.6 112-107.6 60.9 0 103.6 41.5 103.6 100.9 0 67.1-33.9 113.6-78 113.6-24.3 0-42.6-20.1-36.7-44.8 7-28.5 20.5-59.2 20.5-79.8 0-18.4-9.9-33.7-30.4-33.7-24.1 0-43.5 24.9-43.5 58.3 0 21.3 7.2 35.7 7.2 35.7L184 401.9c-3.9 15.1-2 36.4-.5 50.1-75.1-32.2-128.3-106-128.3-195.9C55.2 119 166.2 8 303.2 8S496 119 496 256z"/></svg>`,
		href: '#',
		isTargetBlank: true,
	},
	{
		id: 'Email',
		name: 'Email',
		icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>`,
		href: '#',
		isTargetBlank: true,
	},
]

const SocialsShare: FC<SocialsShareProps> = ({
	className = 'grid gap-[6px]',
	itemClass = 'w-7 h-7 text-base hover:bg-neutral-100',
	link = '',
	title,
	excerpt,
	categories,
	imageUrl,
}) => {
	const payload = buildSharePayload({
		title,
		excerpt,
		url: link,
		categories,
		imageUrl,
	} satisfies SharePayloadInput)

	const actions = SOCIALS_DATA.map((item) => ({
		...item,
		href: buildShareHref(item.id, payload),
	}))

	const renderItem = (item: SocialShareType, index: number) => {
		const label = `Share on ${item.name}`
		return (
			<a
				key={index}
				href={item.href}
				target="_blank"
				rel="noopener noreferrer"
				className={`flex items-center justify-center rounded-full leading-none text-neutral-600 ${itemClass} `}
				title={label}
				aria-label={label}
			>
				<span className="sr-only">{label}</span>
				<div dangerouslySetInnerHTML={{ __html: item.icon }} />
			</a>
		)
	}

	return (
		<div className={`nc-SocialsShare ${className}`}>
			{actions.map(renderItem)}
		</div>
	)
}

export default SocialsShare
