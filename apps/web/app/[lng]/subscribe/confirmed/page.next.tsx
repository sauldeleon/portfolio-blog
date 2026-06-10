import { SubscribeResultPage } from '@web/components/SubscribeResultPage'
import { getServerTranslation } from '@web/i18n/server'
import { confirmSubscription } from '@web/lib/db/queries/subscriptions'
import { Locale } from '@web/lib/db/schema'

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
    <SubscribeResultPage
      success={success}
      successTitle={t('confirmed.title')}
      successMessage={t('confirmed.message')}
      errorTitle={t('confirmed.error')}
      backToLabel={t('backToBlog')}
      backToHref={`/${lng}/blog`}
      imageSrc="/assets/subscribe.png"
      imageAlt={t('confirmed.imageAlt')}
    />
  )
}
