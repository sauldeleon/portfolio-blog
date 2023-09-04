import { dir } from 'i18next'
import Script from 'next/script'

import { LanguageContextProvider } from '@sdlgr/i18n-tools'

import { MainLayout } from '@web/components/MainLayout/MainLayout'
import StyledComponentsRegistry from '@web/components/StyledComponentsRegistry/StyledComponentsRegistry'
import { getServerTranslation } from '@web/i18n/server'
import { languages } from '@web/i18n/settings'

interface RouteProps {
  params: {
    lng: string
  }
}

interface RootLayoutProps extends RouteProps {
  children: React.ReactNode
}

type GenerateMetadataProps = RouteProps

export async function generateMetadata({ params }: GenerateMetadataProps) {
  const { t } = await getServerTranslation({ language: params.lng })
  return {
    title: 'Saúl de León Guerrero',
    description: t('metadata.description'),
    colorScheme: 'dark',
    metadataBase: new URL('https://www.sawl.dev'),
    alternates: {
      canonical: '/en',
      languages: {
        'en-US': '/en',
        'en-UK': '/en',
        'es-ES': '/es',
      },
    },
  }
}

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export default function RootLayout({
  children,
  params: { lng },
}: RootLayoutProps) {
  const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID
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
        <Script
          async
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        />
        <Script
          id={googleAnalyticsId}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []
              function gtag(){window.dataLayer.push(arguments)}
              gtag('js', new Date()); gtag('config', '${googleAnalyticsId}')`,
          }}
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
