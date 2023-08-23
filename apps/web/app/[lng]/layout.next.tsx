import { dir } from 'i18next'
import { ScriptProps } from 'next/script'
import { Metadata, ResolvingMetadata } from 'next/types'

import { LanguageContextProvider } from '@sdlgr/i18n-config'

import { MainLayout } from '@web/components/MainLayout/MainLayout'
import StyledComponentsRegistry from '@web/components/StyledComponentsRegistry/StyledComponentsRegistry'
import { getServerTranslation } from '@web/i18n/server'
import { languages } from '@web/i18n/settings'

interface RootLayoutProps {
  children: React.ReactNode
  params: {
    lng: string
  }
}

export async function generateMetadata(
  props: ScriptProps,
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const { t } = await getServerTranslation()

  return {
    title: 'Saúl de León Guerrero',
    description: t('metadata.description'),
  }
}

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export default function RootLayout({
  children,
  params: { lng },
}: RootLayoutProps) {
  return (
    <html lang={lng} dir={dir(lng)} data-testid="root-html">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100;300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          <LanguageContextProvider value={{ language: lng }}>
            <MainLayout>{children}</MainLayout>
          </LanguageContextProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
