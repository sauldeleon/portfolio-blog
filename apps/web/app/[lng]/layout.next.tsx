import { dir } from 'i18next'
import { Metadata } from 'next'

import { LanguageContextProvider } from '@sdlgr/i18n-config'

import { MainLayout } from '@web/components/MainLayout/MainLayout'
import StyledComponentsRegistry from '@web/components/StyledComponentsRegistry/StyledComponentsRegistry'
import { languages } from '@web/i18n/settings'

interface RootLayoutProps {
  children: React.ReactNode
  params: {
    lng: string
  }
}

export const metadata: Metadata = {
  title: 'Saúl de León Guerrero',
  description: 'Developer portfolio',
  colorScheme: 'dark',
  metadataBase: new URL('https://www.sawl.dev'),
  alternates: {
    canonical: '/es',
    languages: {
      'es-ES': '/es',
      'en-US': '/en',
    },
  },
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
