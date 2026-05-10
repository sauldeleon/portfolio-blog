import { HomePage } from '@web/components/HomePage/HomePage'
import { JsonLd } from '@web/components/JsonLd'

interface RouteProps {
  params: Promise<{ lng: string }>
}

const inLanguage = (lng: string) => (lng === 'es' ? 'es-ES' : 'en-US')

export default async function Page({ params }: RouteProps) {
  const { lng } = await params

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

  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={personSchema} />
      <HomePage />
    </>
  )
}
