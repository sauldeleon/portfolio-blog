import { usePathname } from 'next/navigation'
import { useContext } from 'react'

import { ArrowRightIcon } from '@sdlgr/assets'
import { Header as HeaderLib } from '@sdlgr/header'
import { LanguageContext } from '@sdlgr/i18n-client'

import { useClientTranslation } from '@web/i18n/client'

import { StyledCircleLink, StyledLogoLink, StyledSLLogo } from './Header.styles'

export function Header() {
  const { t } = useClientTranslation('header')
  const pathname = usePathname()
  const { language } = useContext(LanguageContext)

  const navItems = [
    {
      href: `/${language}/experience`,
      label: t('experience'),
      ariaLabel: t('experienceAria'),
    },
    {
      href: `/${language}/contact`,
      label: t('contact'),
      ariaLabel: t('contactAria'),
    },
    {
      href: `/${language}/portfolio`,
      label: t('portfolio'),
      ariaLabel: t('portfolioAria'),
    },
    {
      href: `/${language}/get-in-touch`,
      label: t('getInTouch'),
      ariaLabel: t('getInTouchAria'),
      hideOnDesktop: true,
    },
  ].map((navItem) => ({
    ...navItem,
    isActive: pathname?.includes(navItem.href),
  }))

  return (
    <HeaderLib
      aria-label={t('mainMenu')}
      logo={
        <StyledLogoLink href={`/${language}/`} aria-label={t('headerLogo')}>
          <StyledSLLogo height={55} width={106} />
        </StyledLogoLink>
      }
      navItems={navItems}
      actionItem={
        <StyledCircleLink
          href={`/${language}/get-in-touch`}
          label={t('getInTouch')}
          aria-label={t('getInTouchAria')}
          iconContent={<ArrowRightIcon />}
        />
      }
    />
  )
}
