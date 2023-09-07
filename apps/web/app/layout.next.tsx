import { ReactNode } from 'react'

import { getServerTranslation } from '@web/i18n/server'
import { fallbackLng } from '@web/i18n/settings'
import { sharedRootMetadata } from '@web/utils/metadata/metadata'

type RootLayoutProps = {
  children: ReactNode
}

export async function generateMetadata() {
  const { t } = await getServerTranslation({ language: fallbackLng })
  return {
    ...sharedRootMetadata(fallbackLng),
    description: t('metadata.description'),
  }
}

export default function RootLayout({ children }: RootLayoutProps) {
  return children
}
