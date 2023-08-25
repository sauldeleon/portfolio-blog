'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

import { mainTheme } from '@sdlgr/main-theme'

import { StyledContent, StyledPage } from './MainLayout.styles'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'

interface LayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: LayoutProps) {
  return (
    <StyledPage>
      <ProgressBar
        color={mainTheme.colors.white}
        height="1px"
        options={{
          showSpinner: false,
          template: '<div class="bar" role="bar"><div class="peg"></div></div>',
        }}
        shallowRouting
      />
      <Header />
      <StyledContent>{children}</StyledContent>
      <Footer />
    </StyledPage>
  )
}
