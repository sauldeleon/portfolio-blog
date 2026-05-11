import { ContactPage } from '@web/components/ContactPage/ContactPage'
import { JsonLd } from '@web/components/JsonLd'
import { getServerTranslation } from '@web/i18n/server'
import {
  buildAlternates,
  inLanguage,
  ogLocale,
} from '@web/utils/metadata/inLanguage'

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

export const revalidate = 86400

export default async function Page({ params }: RouteProps) {
  const { lng } = await params
  const { t } = await getServerTranslation({ ns: 'contactPage', language: lng })

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `https://www.sawl.dev/${lng}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('metadata.title'),
        item: `https://www.sawl.dev/${lng}/contact/`,
      },
    ],
  }

  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: t('metadata.title') + ' — Saúl de León Guerrero',
    url: `https://www.sawl.dev/${lng}/contact/`,
    inLanguage: inLanguage(lng),
    description: t('metadata.description'),
    mainEntity: {
      '@type': 'Person',
      name: 'Saúl de León Guerrero',
      url: 'https://www.sawl.dev',
      sameAs: [
        'https://github.com/sauldeleon',
        'https://www.linkedin.com/in/sauldeleonguerrero',
      ],
    },
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={contactPageSchema} />
      <ContactPage />
    </>
  )
}
