import {
  CactusIcon,
  GithubIcon,
  LinkedinIcon,
  MoonIcon,
  TelegramIcon,
} from '@sdlgr/assets'
import { Footer as FooterLib } from '@sdlgr/footer'
import { mainTheme } from '@sdlgr/main-theme'

import { useClientTranslation } from '@web/i18n/client'

export function Footer() {
  const { t } = useClientTranslation('footer')

  return (
    <FooterLib
      tabIndex={-1}
      navProps={{ 'aria-label': t('siteMap') }}
      navItems={[
        { label: t('experience'), href: '/experience' },
        { label: t('contact'), href: '/contact' },
        { label: t('portfolio'), href: '/portfolio' },
        {
          label: t('darkMode'),
          href: '#',
          icon: (
            <MoonIcon color={mainTheme.colors.white} height={14} width={14} />
          ),
        },
        {
          label: t('painMode'),
          href: '#',
          icon: (
            <CactusIcon color={mainTheme.colors.white} height={14} width={14} />
          ),
        },
      ]}
      socialMediaItems={[
        {
          icon: <TelegramIcon color={mainTheme.colors.white} />,
          label: 'Telegram',
          href: 'https://t.me/Sdlgr',
        },
        {
          icon: <GithubIcon color={mainTheme.colors.white} />,
          label: 'Github',
          href: 'https://github.com/sauldeleon',
        },
        {
          icon: <LinkedinIcon color={mainTheme.colors.white} />,
          label: 'LinkedIn',
          href: 'https://www.linkedin.com/in/sauldeleonguerrero',
        },
      ]}
    />
  )
}
