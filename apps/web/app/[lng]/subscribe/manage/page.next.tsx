import type { Metadata } from 'next'

import { ManageSubscriptionPage } from '@web/components/ManageSubscriptionPage'
import { SubscribeResultPage } from '@web/components/SubscribeResultPage'
import { getServerTranslation } from '@web/i18n/server'
import { getSubscriptionByToken } from '@web/lib/db/queries/subscriptions'
import { Locale } from '@web/lib/db/schema'
import { verifyManageLink } from '@web/lib/subscriptions/manageLink'

interface RouteProps {
  params: Promise<{ lng: Locale }>
  searchParams: Promise<{
    token?: string
    expires?: string
    signature?: string
  }>
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { lng } = await params
  const { t } = await getServerTranslation({ ns: 'subscribe', language: lng })
  // Personal, token-based page: keep it out of search results.
  return { title: t('manage.title'), robots: { index: false, follow: false } }
}

export default async function ManageSubscriptionRoute({
  params,
  searchParams,
}: RouteProps) {
  const { lng } = await params
  const { token, expires, signature } = await searchParams
  const linkStatus = verifyManageLink({ token, expires, signature })
  const subscription =
    linkStatus === 'valid' && token ? await getSubscriptionByToken(token) : null

  if (!token || !expires || !signature || !subscription) {
    const { t } = await getServerTranslation({
      ns: 'subscribe',
      language: lng,
    })
    return (
      <SubscribeResultPage
        success={false}
        successTitle=""
        successMessage=""
        errorTitle={
          linkStatus === 'expired' ? t('manage.expired') : t('manage.error')
        }
        backToLabel={t('backToBlog')}
        backToHref={`/${lng}/blog`}
      />
    )
  }

  return (
    <ManageSubscriptionPage
      lng={lng}
      token={token}
      expires={expires}
      signature={signature}
      email={subscription.email}
      status={subscription.status}
      defaultValues={{ name: subscription.name, locale: subscription.locale }}
    />
  )
}
