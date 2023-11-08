'use client'

import { PortfolioPage } from '@web/components/PortfolioPage/PortfolioPage'
import { getServerTranslation } from '@web/i18n/server'

interface RouteProps {
  params: {
    lng: string
  }
}

type GenerateMetadataProps = RouteProps

export async function generateMetadata({ params }: GenerateMetadataProps) {
  const { t } = await getServerTranslation({
    ns: 'portfolioPage',
    language: params.lng,
  })
  return {
    description: t('metadata.description'),
  }
}

export default function Page() {
  return <PortfolioPage />
}
