import Link from 'next/link'

import { getServerTranslation } from '@web/i18n/server'
import { confirmSubscription } from '@web/lib/db/queries/subscriptions'
import { Locale } from '@web/lib/db/schema'

import {
  StyledConfirmLink,
  StyledConfirmPage,
  StyledConfirmText,
  StyledConfirmTitle,
} from './page.next.styles'

interface RouteProps {
  params: Promise<{ lng: Locale }>
  searchParams: Promise<{ token?: string }>
}

export async function generateMetadata({ params }: RouteProps) {
  const { lng } = await params
  const { t } = await getServerTranslation({ ns: 'subscribe', language: lng })
  return { title: t('confirmed.title') }
}

export default async function ConfirmedPage({
  params,
  searchParams,
}: RouteProps) {
  const { lng } = await params
  const { token } = await searchParams
  const { t } = await getServerTranslation({ ns: 'subscribe', language: lng })

  let success = false
  if (token) {
    const result = await confirmSubscription(token)
    success = result !== null
  }

  return (
    <StyledConfirmPage>
      <StyledConfirmTitle>
        {success ? t('confirmed.title') : t('confirmed.error')}
      </StyledConfirmTitle>
      {success && (
        <StyledConfirmText>{t('confirmed.message')}</StyledConfirmText>
      )}
      <StyledConfirmLink as={Link} href={`/${lng}/blog`}>
        {t('backToBlog')}
      </StyledConfirmLink>
    </StyledConfirmPage>
  )
}
