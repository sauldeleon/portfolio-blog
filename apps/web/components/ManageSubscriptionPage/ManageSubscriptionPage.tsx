'use client'

import axios from 'axios'
import Link from 'next/link'

import { SubscriptionDetailsForm } from '@web/components/SubscriptionDetailsForm'
import { useClientTranslation } from '@web/i18n/client'
import type { Locale, SubscriptionStatus } from '@web/lib/db/schema'
import type { SubscriptionDetails } from '@web/lib/subscriptions/schema'

import {
  StyledLink,
  StyledPage,
  StyledText,
  StyledTitle,
} from './ManageSubscriptionPage.styles'

export interface ManageSubscriptionPageProps {
  lng: Locale
  token: string
  /** Signed expiry of this link, sent back so the API can check it. */
  expires: string
  signature: string
  email: string
  status: SubscriptionStatus
  defaultValues: SubscriptionDetails
}

export function ManageSubscriptionPage({
  lng,
  token,
  expires,
  signature,
  email,
  status,
  defaultValues,
}: ManageSubscriptionPageProps) {
  const { t } = useClientTranslation('subscribe')

  async function handleSubmit(values: SubscriptionDetails) {
    await axios.patch('/api/subscribe/manage/', {
      token,
      expires,
      signature,
      ...values,
    })
  }

  return (
    <StyledPage data-testid="manage-subscription-page">
      <StyledTitle>{t('manage.title')}</StyledTitle>
      <StyledText>{t('manage.subtitle', { email })}</StyledText>

      <SubscriptionDetailsForm
        idPrefix="manage-subscription"
        defaultValues={defaultValues}
        labels={{
          name: t('nameLabel'),
          locale: t('manage.localeLabel'),
          localeOptions: {
            en: t('manage.locale.en'),
            es: t('manage.locale.es'),
          },
          submit: t('manage.submit'),
          submitting: t('manage.submitting'),
          success: t('manage.success'),
          error: t('error'),
        }}
        onSubmit={handleSubmit}
      />

      {status !== 'unsubscribed' && (
        <StyledText>
          {t('manage.unsubscribeHint')}{' '}
          <StyledLink
            as={Link}
            href={`/${lng}/subscribe/unsubscribed?token=${encodeURIComponent(token)}`}
            data-testid="manage-unsubscribe-link"
          >
            {t('notification.unsubscribeText')}
          </StyledLink>
        </StyledText>
      )}

      <StyledLink as={Link} href={`/${lng}/blog`}>
        {t('backToBlog')}
      </StyledLink>
    </StyledPage>
  )
}
