import { usePathname, useRouter } from 'next/navigation'
import { useContext } from 'react'

import {
  CactusIcon,
  GithubIcon,
  LanguageIcon,
  LinkedinIcon,
  MoonIcon,
  TelegramIcon,
} from '@sdlgr/assets'
import { Footer as FooterLib, NavItem, SocialMediaItem } from '@sdlgr/footer'
import { LanguageContext } from '@sdlgr/i18n-config'
import { mainTheme } from '@sdlgr/main-theme'

import { useClientTranslation } from '@web/i18n/client'

export function Footer() {
  const { t } = useClientTranslation('footer')
  const { language } = useContext(LanguageContext)
  const pathname = usePathname()
  const { push } = useRouter()

  const toggleLanguage = (path: string) => {
    const noLangPath = path.replace(/^\/[\w\d]+/, '')
    const newLanguage = language === 'en' ? 'es' : 'en'
    push(`/${newLanguage}${noLangPath}`)
  }

  const navItems: NavItem[] = [
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
      onClick: (e) => {
        e.preventDefault()
        console.log('dark mode')
      },
      icon: <MoonIcon color={mainTheme.colors.white} height={14} width={14} />,
    },
    {
      label: t('painMode'),
      ariaLabel: t('painModeAria'),
      onClick: (e) => {
        e.preventDefault()
        console.log('pain mode')
      },
      icon: (
        <CactusIcon color={mainTheme.colors.white} height={14} width={14} />
      ),
    },
    {
      label: language === 'en' ? 'EN' : 'ES',
      ariaLabel: t('toggleLanguage', {
        language: language === 'en' ? 'English' : 'Español',
      }),
      onClick: () => toggleLanguage(pathname),
      icon: (
        <LanguageIcon color={mainTheme.colors.white} height={22} width={22} />
      ),
    },
  ]

  const socialMediaItems: SocialMediaItem[] = [
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
  ]

  return (
    <FooterLib
      tabIndex={-1}
      navProps={{ 'aria-label': t('siteMap') }}
      navItems={navItems}
      socialMediaItems={socialMediaItems}
    />
  )
}
