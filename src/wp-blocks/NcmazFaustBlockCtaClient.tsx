import { NcmazFaustBlockCtaFragmentFragment } from '@/__generated__/graphql'
import { NC_SITE_SETTINGS } from '@/contains/site-settings'
import { MUTATION_ADD_SUBCRIBER_TO_MAILPOET } from '@/fragments/mutations'
import errorHandling from '@/utils/errorHandling'
import { useMutation } from '@apollo/client'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'

type Props = NcmazFaustBlockCtaFragmentFragment & {
	renderedHtml?: string | null
}

export default function NcmazFaustBlockCtaClient(props: Props) {
	const { renderedHtml } = props || {}

	const initErrorMessage = NC_SITE_SETTINGS.subcription_widget?.error_message
	const initSuccessMessage =
		NC_SITE_SETTINGS.subcription_widget?.success_message || 'Thank you!'
	const blockRef = React.useRef<HTMLDivElement>(null)

	const [mutationAddSubscriber, { data, loading, called }] = useMutation(
		MUTATION_ADD_SUBCRIBER_TO_MAILPOET,
		{
			variables: {
				listId: NC_SITE_SETTINGS.mailpoet_list_id,
			},
			onCompleted: (data) => {
				if (data?.ncmazFaustAddSubscriberToMailpoet?.success) {
					toast.success(initSuccessMessage)
					const successNode = blockRef.current?.querySelector(
						'.ncmazfaust-block-CTA__subcribe_success',
					)
					if (successNode) {
						successNode.innerHTML = initSuccessMessage
					}
				} else {
					toast.error(
						data?.ncmazFaustAddSubscriberToMailpoet?.errors ||
							initErrorMessage ||
							'Error',
					)
					const errorNode = blockRef.current?.querySelector(
						'.ncmazfaust-block-CTA__subcribe_success',
					)
					if (errorNode) {
						errorNode.innerHTML =
							data?.ncmazFaustAddSubscriberToMailpoet?.errors ||
							initErrorMessage ||
							'Error'
					}
				}
			},
			onError: (error) => {
				errorHandling(error)

				const errorNode = blockRef.current?.querySelector(
					'.ncmazfaust-block-CTA__subcribe_success',
				)
				if (errorNode) {
					errorNode.innerHTML = error.message || initErrorMessage || 'Error'
				}
			},
		},
	)

	// Accessibility: the WordPress-rendered form has an icon-only submit button
	// and an unlabeled email input. Give them accessible names so screen readers
	// and AI agents can identify them.
	useEffect(() => {
		const formNode = blockRef.current?.querySelector(
			'.ncmazfaust-block-CTA__subcribe_form',
		)
		if (!formNode) {
			return
		}

		const submitButton = formNode.querySelector<HTMLButtonElement>(
			"button[type='submit']",
		)
		if (
			submitButton &&
			!submitButton.getAttribute('aria-label') &&
			!submitButton.textContent?.trim()
		) {
			submitButton.setAttribute('aria-label', 'Subscribe')
			submitButton.querySelector('svg')?.setAttribute('aria-hidden', 'true')
		}

		const emailInput =
			formNode.querySelector<HTMLInputElement>("input[type='email']")
		if (
			emailInput &&
			!emailInput.getAttribute('aria-label') &&
			!emailInput.getAttribute('aria-labelledby') &&
			!emailInput.id
		) {
			emailInput.setAttribute('aria-label', 'Email address')
		}
	}, [renderedHtml])

	useEffect(() => {
		if (!called) {
			return
		}
		const subcribeFormNode = blockRef.current?.querySelector(
			'.ncmazfaust-block-CTA__subcribe_form',
		)
		if (!subcribeFormNode) {
			return
		}
		const submitButton = subcribeFormNode.querySelector("button[type='submit']")
		const errorNode = blockRef.current?.querySelector(
			'.ncmazfaust-block-CTA__subcribe_success',
		)
		const successNode = blockRef.current?.querySelector(
			'.ncmazfaust-block-CTA__subcribe_success',
		)

		if (loading) {
			submitButton?.setAttribute('disabled', 'disabled')
			!!errorNode && errorNode.innerHTML && (errorNode.innerHTML = '')
			!!successNode && successNode.innerHTML && (successNode.innerHTML = '')
		} else {
			submitButton?.removeAttribute('disabled')
		}
	}, [loading, called])

	useEffect(() => {
		const subcribeFormNode = blockRef.current?.querySelector(
			'.ncmazfaust-block-CTA__subcribe_form',
		)
		if (!subcribeFormNode) {
			return
		}

		const handleSubmit = (e: Event) => {
			e.preventDefault()
			const email = subcribeFormNode.querySelector<HTMLInputElement>(
				"input[type='email']",
			)?.value

			if (
				!email ||
				!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
			) {
				toast.error('Email is invalid')
				return
			}

			mutationAddSubscriber({
				variables: {
					user_email: email,
				},
			})
		}

		subcribeFormNode.addEventListener('submit', handleSubmit)
		return () => {
			subcribeFormNode.removeEventListener('submit', handleSubmit)
		}
	}, [blockRef])

	return (
		<div
			ref={blockRef}
			className="not-prose"
			dangerouslySetInnerHTML={{ __html: renderedHtml || '' }}
		/>
	)
}
