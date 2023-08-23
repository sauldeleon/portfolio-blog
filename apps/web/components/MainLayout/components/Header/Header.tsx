import { ArrowRightIcon } from '@sdlgr/assets'
import { Header as HeaderLib } from '@sdlgr/header'

import { useClientTranslation } from '@web/i18n/client'

import { StyledCircleLink, StyledLogoLink, StyledSLLogo } from './Header.styles'

export function Header() {
  const { t } = useClientTranslation('header')
  return (
    <HeaderLib
      aria-label={t('mainMenu')}
      logo={
        <StyledLogoLink href="/" aria-label={t('headerLogo')}>
          <StyledSLLogo height={55} width={106} />
        </StyledLogoLink>
      }
      navItems={[
        { href: '/experience', label: t('experience') },
        { href: '/contact', label: t('contact') },
        { href: '/portfolio', label: t('portfolio') },
        { href: '/portfolio', label: t('getInTouch'), hideOnDesktop: true },
      ]}
      actionItem={
        <StyledCircleLink
          href="/portfolio"
          label={t('getInTouch')}
          iconContent={<ArrowRightIcon />}
        />
      }
    />
  )
}
