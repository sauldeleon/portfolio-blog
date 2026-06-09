import { SubscribePage } from '@web/components/SubscribePage/SubscribePage'
import { getServerTranslation } from '@web/i18n/server'
import { Locale } from '@web/lib/db/schema'
import { buildAlternates } from '@web/utils/metadata/inLanguage'

interface RouteProps {
  params: Promise<{ lng: Locale }>
}

export async function generateMetadata({ params }: RouteProps) {
  const { lng } = await params
  const { t } = await getServerTranslation({ ns: 'subscribe', language: lng })

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: buildAlternates(lng, 'subscribe/'),
  }
}

export default async function Page({ params }: RouteProps) {
  const { lng } = await params
  return <SubscribePage lng={lng} />
}
