import { dir } from 'i18next'
import Script from 'next/script'

import { LanguageContextProvider } from '@sdlgr/i18n-tools'

import { LanguageGuard } from '@web/components/LanguageGuard/LanguageGuard'
import { MainLayout } from '@web/components/MainLayout/MainLayout'
import StyledComponentsRegistry from '@web/components/StyledComponentsRegistry/StyledComponentsRegistry'
import { getServerTranslation } from '@web/i18n/server'
import { languages } from '@web/i18n/settings'
import { sharedRootMetadata } from '@web/utils/metadata/metadata'

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
    ...sharedRootMetadata,
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
  const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID

  return (
    <html lang={lng} dir={dir(lng)} data-testid="root-html">
      <head>
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
            <LanguageGuard>
              <MainLayout>{children}</MainLayout>
            </LanguageGuard>
          </LanguageContextProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
