import Link from 'next/link'

import { getServerTranslation } from '@web/i18n/server'
import { unsubscribeByToken } from '@web/lib/db/queries/subscriptions'
import { Locale } from '@web/lib/db/schema'

import {
  StyledConfirmLink,
  StyledConfirmPage,
  StyledConfirmText,
  StyledConfirmTitle,
} from '../confirmed/page.next.styles'

interface RouteProps {
  params: Promise<{ lng: Locale }>
  searchParams: Promise<{ token?: string }>
}

export async function generateMetadata({ params }: RouteProps) {
  const { lng } = await params
  const { t } = await getServerTranslation({ ns: 'subscribe', language: lng })
  return { title: t('unsubscribed.title') }
}

export default async function UnsubscribedPage({
  params,
  searchParams,
}: RouteProps) {
  const { lng } = await params
  const { token } = await searchParams
  const { t } = await getServerTranslation({ ns: 'subscribe', language: lng })

  let success = false
  if (token) {
    const result = await unsubscribeByToken(token)
    success = result !== null
  }

  return (
    <StyledConfirmPage>
      <StyledConfirmTitle>
        {success ? t('unsubscribed.title') : t('unsubscribed.error')}
      </StyledConfirmTitle>
      {success && (
        <StyledConfirmText>{t('unsubscribed.message')}</StyledConfirmText>
      )}
      <StyledConfirmLink as={Link} href={`/${lng}/blog`}>
        {t('backToBlog')}
      </StyledConfirmLink>
    </StyledConfirmPage>
  )
}
