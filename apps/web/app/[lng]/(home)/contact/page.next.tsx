import { ContactPage } from '@web/components/ContactPage/ContactPage'
import { getServerTranslation } from '@web/i18n/server'
import { buildAlternates, ogLocale } from '@web/utils/metadata/inLanguage'

interface RouteProps {
  params: Promise<{ lng: string }>
}

type GenerateMetadataProps = RouteProps

export async function generateMetadata({ params }: GenerateMetadataProps) {
  const { lng } = await params
  const { t } = await getServerTranslation({ ns: 'contactPage', language: lng })
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    alternates: buildAlternates(lng, 'contact/'),
    openGraph: {
      url: `https://www.sawl.dev/${lng}/contact/`,
      locale: ogLocale(lng),
    },
  }
}

export default function Page() {
  return <ContactPage />
}
