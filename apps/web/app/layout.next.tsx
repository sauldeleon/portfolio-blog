import { Viewport } from 'next'
import { ReactNode } from 'react'

import { getServerTranslation } from '@web/i18n/server'
import { fallbackLng } from '@web/i18n/settings'
import {
  sharedRootMetadata,
  sharedRootViewport,
} from '@web/utils/metadata/metadata'

type RootLayoutProps = {
  children: ReactNode
}

export async function generateMetadata() {
  const { t } = await getServerTranslation({ language: fallbackLng })
  return {
    ...sharedRootMetadata,
    description: t('metadata.description'),
  }
}

export const viewport: Viewport = {
  ...sharedRootViewport,
}

export default function RootLayout({ children }: RootLayoutProps) {
  return children
}
