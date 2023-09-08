import { usePathname, useRouter } from 'next/navigation'
import { useContext, useMemo } from 'react'

import {
  AboutIcon,
  CactusIcon,
  GithubIcon,
  LanguageIcon,
  LinkedInIcon,
  MoonIcon,
  TelegramIcon,
} from '@sdlgr/assets'
import { Footer as FooterLib, NavItem, SocialMediaItem } from '@sdlgr/footer'
import { STORAGE_I18N_KEY } from '@sdlgr/i18n-config'
import { LanguageContext } from '@sdlgr/i18n-tools'
import { mainTheme } from '@sdlgr/main-theme'
import { LocalStorage, useStorage } from '@sdlgr/storage'

import { getNextLanguage, useClientTranslation } from '@web/i18n/client'

export function Footer() {
  const { t } = useClientTranslation('footer')
  const { language } = useContext(LanguageContext)
  const pathname = usePathname()
  const router = useRouter()
  const storage = useMemo(() => new LocalStorage(), [])
  const [, setItem] = useStorage(storage)
  const nextLanguage = getNextLanguage(language)
  const nextLanguagePath = `/${nextLanguage}${pathname.replace(/^\/[\w]+/, '')}`

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
      label: t('blog'),
      ariaLabel: t('blogAria'),
      href: `/${language}/blog`,
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
      label: t('languageLabel'),
      ariaLabel: t('toggleLanguageAria'),
      onClick: (e) => {
        e.preventDefault()
        setItem(STORAGE_I18N_KEY, nextLanguage)
        router.push(nextLanguagePath)
      },
      href: nextLanguagePath,
      icon: (
        <LanguageIcon color={mainTheme.colors.white} height={22} width={22} />
      ),
    },
    {
      label: t('aboutLabel'),
      ariaLabel: t('aboutAria'),
      onClick: (e) => {
        e.preventDefault()
        console.log('About button clicked')
      },
      icon: <AboutIcon color={mainTheme.colors.white} height={18} width={18} />,
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
      icon: <LinkedInIcon color={mainTheme.colors.white} />,
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
