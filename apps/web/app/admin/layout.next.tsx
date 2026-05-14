import { dir } from 'i18next'

import { LanguageContextProvider } from '@sdlgr/i18n-tools'
import { robotoMonoClassName } from '@sdlgr/main-theme'

import { MainLayout } from '@web/components/MainLayout/MainLayout'
import StyledComponentsRegistry from '@web/components/StyledComponentsRegistry/StyledComponentsRegistry'

import '../globals.css'
import { StyledAdminLayout } from './layout.styles'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <html lang="en" dir={dir('en')} className={robotoMonoClassName}>
      <body>
        <StyledComponentsRegistry>
          <LanguageContextProvider value={{ language: 'en' }}>
            <MainLayout>
              <StyledAdminLayout data-testid="admin-layout">
                {children}
              </StyledAdminLayout>
            </MainLayout>
          </LanguageContextProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
