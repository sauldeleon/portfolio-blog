'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile } from '@marsidev/react-turnstile'
import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@sdlgr/button'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledError,
  StyledFieldGroup,
  StyledForm,
  StyledFormHeader,
  StyledHoneypot,
  StyledInput,
  StyledLabel,
  StyledSubtitle,
  StyledSuccessMessage,
  StyledSuccessText,
  StyledSuccessTitle,
  StyledTitle,
  StyledTurnstileWrapper,
} from './SubscribeForm.styles'

const subscribeFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  honeypot: z.string().max(0).optional(),
})

type SubscribeFormValues = z.infer<typeof subscribeFormSchema>

export interface SubscribeFormProps {
  lng: string
  showTitles?: boolean
}

type FormStatus =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'alreadySubscribed'
  | 'error'

export function SubscribeForm({ lng, showTitles = true }: SubscribeFormProps) {
  const { t } = useClientTranslation('subscribe')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileError, setTurnstileError] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeFormSchema),
  })

  const onSubmit = async (values: SubscribeFormValues) => {
    /* istanbul ignore next */
    if (!turnstileToken && !turnstileError) return
    setStatus('submitting')
    setSubmittedEmail(values.email)

    try {
      const { data } = await axios.post<{ alreadySubscribed?: boolean }>(
        '/api/subscribe/',
        {
          ...values,
          turnstileToken: turnstileToken ?? '__cf_error__',
          locale: lng,
          translations: {
            subject: t('email.subject'),
            previewText: t('email.previewText'),
            heading: t('email.heading'),
            body: t('email.body'),
            buttonLabel: t('email.buttonLabel'),
            footerText: t('email.footerText'),
            unsubscribeText: t('email.unsubscribeText'),
          },
        },
      )

      setStatus(data.alreadySubscribed ? 'alreadySubscribed' : 'success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <StyledSuccessMessage role="status">
        <StyledSuccessTitle>{t('successTitle')}</StyledSuccessTitle>
        <StyledSuccessText>
          {t('successMessage', { email: submittedEmail })}
        </StyledSuccessText>
      </StyledSuccessMessage>
    )
  }

  if (status === 'alreadySubscribed') {
    return (
      <StyledSuccessMessage role="status">
        <StyledSuccessTitle>{t('alreadySubscribed')}</StyledSuccessTitle>
      </StyledSuccessMessage>
    )
  }

  const isSubmitting = status === 'submitting'
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate>
      {showTitles && (
        <StyledFormHeader>
          <StyledTitle>{t('title')}</StyledTitle>
          <StyledSubtitle>{t('subtitle')}</StyledSubtitle>
        </StyledFormHeader>
      )}

      <StyledHoneypot
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        {...register('honeypot')}
      />

      <StyledFieldGroup>
        <StyledLabel htmlFor="subscribe-name">{t('nameLabel')}</StyledLabel>
        <StyledInput
          id="subscribe-name"
          type="text"
          placeholder={t('namePlaceholder')}
          autoComplete="name"
          aria-invalid={errors.name ? 'true' : undefined}
          {...register('name')}
        />
        {errors.name && (
          <StyledError role="alert">{errors.name.message}</StyledError>
        )}
      </StyledFieldGroup>

      <StyledFieldGroup>
        <StyledLabel htmlFor="subscribe-email">{t('emailLabel')}</StyledLabel>
        <StyledInput
          id="subscribe-email"
          type="email"
          placeholder={t('emailPlaceholder')}
          autoComplete="email"
          aria-invalid={errors.email ? 'true' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <StyledError role="alert">{errors.email.message}</StyledError>
        )}
      </StyledFieldGroup>

      {siteKey && (
        <StyledTurnstileWrapper>
          <Turnstile
            siteKey={siteKey}
            onSuccess={(token) => {
              setTurnstileToken(token)
              setTurnstileError(false)
            }}
            onError={() => {
              setTurnstileToken(null)
              setTurnstileError(true)
            }}
            onExpire={() => {
              setTurnstileToken(null)
              setTurnstileError(false)
            }}
            options={{ theme: 'dark', language: lng, size: 'flexible' }}
          />
        </StyledTurnstileWrapper>
      )}

      {status === 'error' && (
        <StyledError role="alert">{t('error')}</StyledError>
      )}

      <Button
        type="submit"
        variant="inverted"
        disabled={
          isSubmitting ||
          (!siteKey ? false : !turnstileToken && !turnstileError)
        }
      >
        {isSubmitting ? t('submitting') : t('submitLabel')}
      </Button>
    </StyledForm>
  )
}
