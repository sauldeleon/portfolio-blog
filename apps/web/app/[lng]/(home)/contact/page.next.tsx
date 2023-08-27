import { ContactPage } from '@web/components/ContactPage/ContactPage'
import { getServerTranslation } from '@web/i18n/server'

export async function generateMetadata() {
  const { t } = await getServerTranslation('contactPage')
  return {
    description: t('metadata.description'),
  }
}

export default function Page() {
  return <ContactPage />
}
