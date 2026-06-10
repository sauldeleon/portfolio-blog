import { SubscribeResultPage } from '@web/components/SubscribeResultPage'
import { getServerTranslation } from '@web/i18n/server'
import { unsubscribeByToken } from '@web/lib/db/queries/subscriptions'
import { Locale } from '@web/lib/db/schema'

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
    <SubscribeResultPage
      success={success}
      successTitle={t('unsubscribed.title')}
      successMessage={t('unsubscribed.message')}
      errorTitle={t('unsubscribed.error')}
      backToLabel={t('backToBlog')}
      backToHref={`/${lng}/blog`}
      imageSrc="/assets/unsubscribe.png"
      imageAlt={t('unsubscribed.imageAlt')}
    />
  )
}
