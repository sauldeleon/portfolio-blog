import { HomePage } from '@web/components/HomePage/HomePage'
import { JsonLd } from '@web/components/JsonLd'
import { getServerTranslation } from '@web/i18n/server'
import {
  buildAlternates,
  inLanguage,
  ogLocale,
  ogLocaleAlternate,
} from '@web/utils/metadata/inLanguage'

interface RouteProps {
  params: Promise<{ lng: string }>
}

export async function generateMetadata({ params }: RouteProps) {
  const { lng } = await params
  return {
    title: { absolute: 'Saúl de León Guerrero — Front-End Software Engineer' },
    alternates: buildAlternates(lng, ''),
    openGraph: {
      url: `https://www.sawl.dev/${lng}/`,
      locale: ogLocale(lng),
      alternateLocale: ogLocaleAlternate(lng),
    },
  }
}

export const revalidate = 86400

export default async function Page({ params }: RouteProps) {
  const { lng } = await params
  const { t } = await getServerTranslation({ ns: 'homepage', language: lng })

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Saúl de León Guerrero',
    url: 'https://www.sawl.dev',
    description:
      'Personal portfolio of Saúl de León Guerrero, Software Engineer',
    inLanguage: inLanguage(lng),
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Saúl de León Guerrero',
    url: 'https://www.sawl.dev',
    jobTitle: 'Front-End Software Engineer',
    description:
      'Experienced Software Engineer skilled in translating code into polished and efficient digital solutions.',
    inLanguage: inLanguage(lng),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Asturias',
      addressCountry: 'ES',
    },
    sameAs: [
      'https://github.com/sauldeleon',
      'https://www.linkedin.com/in/sauldeleonguerrero',
    ],
    knowsAbout: [
      'React',
      'Next.js',
      'TypeScript',
      'Node.js',
      'Styled Components',
      'Jest',
      'Cypress',
    ],
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: 'Saúl de León Guerrero — Front-End Software Engineer',
    url: `https://www.sawl.dev/${lng}/`,
    description:
      'Personal portfolio of Saúl de León Guerrero, Software Engineer',
    inLanguage: inLanguage(lng),
    isPartOf: { '@type': 'WebSite', url: 'https://www.sawl.dev' },
  }

  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={personSchema} />
      <JsonLd data={webPageSchema} />
      <HomePage skillListLabel={t('skillList')} />
    </>
  )
}
