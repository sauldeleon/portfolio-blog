'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Select } from '@sdlgr/select'

import type { Locale } from '@web/lib/db/schema'
import {
  type SubscriptionDetails,
  subscriptionDetailsSchema,
} from '@web/lib/subscriptions/schema'

import {
  adminFormStyles,
  publicFormStyles,
} from './SubscriptionDetailsForm.styles'

const LOCALES: Locale[] = ['en', 'es']

export interface SubscriptionDetailsFormLabels {
  name: string
  locale: string
  localeOptions: Record<Locale, string>
  submit: string
  submitting: string
  success: string
  error: string
  cancel?: string
}

export interface SubscriptionDetailsFormProps {
  /** Prefix for input ids, so two forms can share a page. */
  idPrefix: string
  defaultValues: SubscriptionDetails
  labels: SubscriptionDetailsFormLabels
  onSubmit: (values: SubscriptionDetails) => Promise<void>
  onCancel?: () => void
  /** `admin` renders with the admin form pieces; `public` (default) with the subscribe form's. */
  variant?: 'public' | 'admin'
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Name and email-language fields of a subscription. Used by subscribers on
 * the manage page (via their email link) and by admins in the edit modal.
 */
export function SubscriptionDetailsForm({
  idPrefix,
  defaultValues,
  labels,
  onSubmit,
  onCancel,
  variant = 'public',
}: SubscriptionDetailsFormProps) {
  const S = variant === 'admin' ? adminFormStyles : publicFormStyles
  const [status, setStatus] = useState<Status>('idle')
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriptionDetails>({
    resolver: zodResolver(subscriptionDetailsSchema),
    defaultValues,
  })

  const submit = async (values: SubscriptionDetails) => {
    setStatus('submitting')
    try {
      await onSubmit(values)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const isSubmitting = status === 'submitting'

  return (
    <S.Form
      onSubmit={handleSubmit(submit)}
      noValidate
      data-testid="subscription-details-form"
    >
      <S.FieldGroup>
        <S.Label htmlFor={`${idPrefix}-name`}>{labels.name}</S.Label>
        <S.Input
          id={`${idPrefix}-name`}
          type="text"
          autoComplete="name"
          aria-invalid={errors.name ? 'true' : undefined}
          {...register('name')}
        />
        {errors.name && <S.Error role="alert">{errors.name.message}</S.Error>}
      </S.FieldGroup>

      <S.FieldGroup>
        <S.Label htmlFor={`${idPrefix}-locale`}>{labels.locale}</S.Label>
        <S.SelectField>
          <Controller
            name="locale"
            control={control}
            render={({ field }) => (
              <Select
                id={`${idPrefix}-locale`}
                value={field.value}
                onChange={(value) => field.onChange(value as Locale)}
                options={LOCALES.map((locale) => ({
                  value: locale,
                  label: labels.localeOptions[locale],
                }))}
                data-testid={`${idPrefix}-locale-select`}
              />
            )}
          />
        </S.SelectField>
      </S.FieldGroup>

      {status === 'success' && (
        <S.Success role="status">{labels.success}</S.Success>
      )}
      {status === 'error' && <S.Error role="alert">{labels.error}</S.Error>}

      <S.Actions>
        <S.SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? labels.submitting : labels.submit}
        </S.SubmitButton>
        {onCancel && (
          <S.CancelButton type="button" onClick={onCancel}>
            {labels.cancel}
          </S.CancelButton>
        )}
      </S.Actions>
    </S.Form>
  )
}
