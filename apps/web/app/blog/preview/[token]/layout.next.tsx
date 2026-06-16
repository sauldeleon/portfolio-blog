import { ReactNode } from 'react'

import { LanguageContextProvider } from '@sdlgr/i18n-tools'
import { robotoMonoClassName } from '@sdlgr/main-theme'

import { MainLayout } from '@web/components/MainLayout/MainLayout'
import StyledComponentsRegistry from '@web/components/StyledComponentsRegistry/StyledComponentsRegistry'

import '../../../globals.css'

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={robotoMonoClassName}>
      <body>
        <StyledComponentsRegistry>
          <LanguageContextProvider value={{ language: 'en' }}>
            <MainLayout>{children}</MainLayout>
          </LanguageContextProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
