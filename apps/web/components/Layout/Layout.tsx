import { Header } from '@sdlgr/header'

import { useTranslation } from '@web/i18n/client'

import { StyledContent, StyledPage } from './Layout.styles'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation('header')
  return (
    <StyledPage>
      <Header
        items={[
          { href: '/experience', label: t('experience') },
          { href: '/contact', label: t('contact') },
          { href: '/portfolio', label: t('portfolio') },
        ]}
      />
      <StyledContent>{children}</StyledContent>
    </StyledPage>
  )
}
