import { PortfolioPage } from '@web/components/PortfolioPage/PortfolioPage'
import { getServerTranslation } from '@web/i18n/server'

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
  return { description: t('metadata.description') }
}

export default function Page() {
  return <PortfolioPage />
}
