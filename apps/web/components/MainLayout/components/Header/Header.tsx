import { usePathname, useSelectedLayoutSegments } from 'next/navigation'
import { useContext } from 'react'

import { ArrowRightIcon } from '@sdlgr/assets'
import { Header as HeaderLib } from '@sdlgr/header'
import { LanguageContext } from '@sdlgr/i18n-tools'

import { useClientTranslation } from '@web/i18n/client'

import { StyledCircleLink, StyledLogoLink, StyledSLLogo } from './Header.styles'

export function Header() {
  const { t } = useClientTranslation('header')
  const pathname = usePathname()
  const segments = useSelectedLayoutSegments()
  const { language } = useContext(LanguageContext)

  const isValidPath = !segments.some((segment) => segment.includes('/'))

  const navItems: {
    href: string
    label: string
    ariaLabel: string
    isActive: boolean
    hideOnDesktop?: boolean | undefined
  }[] = [
    {
      href: `/${language}/experience/`,
      label: t('experience'),
      ariaLabel: t('experienceAria'),
    },
    {
      href: `/${language}/contact/`,
      label: t('contact'),
      ariaLabel: t('contactAria'),
    },
    {
      href: `/${language}/portfolio/`,
      label: t('portfolio'),
      ariaLabel: t('portfolioAria'),
    },
    {
      href: `/${language}/blog/`,
      label: t('blog'),
      ariaLabel: t('blogAria'),
      hideOnDesktop: true,
      alternativeLinks: [new RegExp(`^/${language}/blog/`)],
    },
  ].map((navItem) => ({
    ...navItem,
    isActive:
      isValidPath &&
      (pathname?.startsWith(navItem.href) ||
        !!navItem.alternativeLinks?.some((regex) => regex.test(pathname))),
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
          label={t('blog')}
          aria-label={t('blogAria')}
          iconContent={<ArrowRightIcon />}
        />
      }
    />
  )
}
