import { ExperiencePage } from '@web/components/ExperiencePage/ExperiencePage'
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
  const { t } = await getServerTranslation({
    ns: 'experiencePage',
    language: lng,
  })
  return {
    title: t('title'),
    description: t('metadata.description'),
    alternates: buildAlternates(lng, 'experience/'),
    openGraph: {
      url: `https://www.sawl.dev/${lng}/experience/`,
      locale: ogLocale(lng),
    },
  }
}

export default async function Page({ params }: RouteProps) {
  const { lng } = await params

  const workHistorySchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Saúl de León Guerrero',
    url: 'https://www.sawl.dev',
    jobTitle: 'Front-End Software Engineer',
    inLanguage: inLanguage(lng),
    worksFor: {
      '@type': 'Organization',
      name: 'Bonhams',
      url: 'https://www.bonhams.com/',
    },
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Front-End Software Engineer',
      occupationLocation: {
        '@type': 'Country',
        name: 'Spain',
      },
      skills:
        'React, Next.js, TypeScript, Node.js, Jest, Cypress, Styled Components',
    },
    alumniOf: [
      {
        '@type': 'Organization',
        name: 'Smart Protection',
        url: 'https://www.smartprotection.com/',
      },
      { '@type': 'Organization', name: 'ING', url: 'https://www.ing.es/' },
      { '@type': 'Organization', name: 'Keytree' },
      {
        '@type': 'Organization',
        name: 'Babel S.I',
        url: 'https://www.babelgroup.com/',
      },
      {
        '@type': 'Organization',
        name: 'Ioon Technologies',
        url: 'https://ioon.es/',
      },
      { '@type': 'Organization', name: 'Clarive', url: 'https://clarive.com/' },
      {
        '@type': 'Organization',
        name: 'idealista.com',
        url: 'https://www.idealista.com/',
      },
    ],
  }

  return (
    <>
      <JsonLd data={workHistorySchema} />
      <ExperiencePage />
    </>
  )
}
