import { JsonLd } from '@web/components/JsonLd'
import { PortfolioPage } from '@web/components/PortfolioPage/PortfolioPage'
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
  const { t } = await getServerTranslation({
    ns: 'portfolioPage',
    language: lng,
  })
  return {
    title: t('title'),
    description: t('metadata.description'),
    alternates: buildAlternates(lng, 'portfolio/'),
    openGraph: {
      url: `https://www.sawl.dev/${lng}/portfolio/`,
      locale: ogLocale(lng),
    },
  }
}

export default async function Page({ params }: RouteProps) {
  const { lng } = await params

  const profilePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: 'Portfolio — Saúl de León Guerrero',
    url: `https://www.sawl.dev/${lng}/portfolio`,
    inLanguage: inLanguage(lng),
    mainEntity: {
      '@type': 'Person',
      name: 'Saúl de León Guerrero',
      jobTitle: 'Front-End Software Engineer',
      description:
        'Experienced Software Engineer skilled in translating code into polished and efficient digital solutions.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Asturias',
        addressCountry: 'ES',
      },
      sameAs: [
        'https://github.com/sauldeleon',
        'https://www.linkedin.com/in/sauldeleonguerrero',
      ],
    },
  }

  return (
    <>
      <JsonLd data={profilePageSchema} />
      <PortfolioPage />
    </>
  )
}
