import { useContext } from 'react'

import {
  CactusIcon,
  GithubIcon,
  LinkedinIcon,
  MoonIcon,
  TelegramIcon,
} from '@sdlgr/assets'
import { Footer as FooterLib } from '@sdlgr/footer'
import { LanguageContext } from '@sdlgr/i18n-config'
import { mainTheme } from '@sdlgr/main-theme'

import { useClientTranslation } from '@web/i18n/client'

export function Footer() {
  const { t } = useClientTranslation('footer')
  const { language } = useContext(LanguageContext)
  return (
    <FooterLib
      tabIndex={-1}
      navProps={{ 'aria-label': t('siteMap') }}
      navItems={[
        {
          label: t('experience'),
          ariaLabel: t('experienceAria'),
          href: `/${language}/experience`,
        },
        {
          label: t('contact'),
          ariaLabel: t('contactAria'),
          href: `/${language}/contact`,
        },
        {
          label: t('portfolio'),
          ariaLabel: t('portfolioAria'),
          href: `/${language}/portfolio`,
        },
        {
          label: t('darkMode'),
          ariaLabel: t('darkModeAria'),
          href: '#',
          icon: (
            <MoonIcon color={mainTheme.colors.white} height={14} width={14} />
          ),
        },
        {
          label: t('painMode'),
          ariaLabel: t('painModeAria'),
          href: '#',
          icon: (
            <CactusIcon color={mainTheme.colors.white} height={14} width={14} />
          ),
        },
      ]}
      socialMediaItems={[
        {
          icon: <TelegramIcon color={mainTheme.colors.white} />,
          ariaLabel: t('telegramAria'),
          href: 'https://t.me/Sdlgr',
        },
        {
          icon: <GithubIcon color={mainTheme.colors.white} />,
          ariaLabel: t('githubAria'),
          href: 'https://github.com/sauldeleon',
        },
        {
          icon: <LinkedinIcon color={mainTheme.colors.white} />,
          ariaLabel: t('linkedInAria'),
          href: 'https://www.linkedin.com/in/sauldeleonguerrero',
        },
      ]}
    />
  )
}
