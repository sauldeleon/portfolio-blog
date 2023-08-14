import { ArrowRightIcon } from '@sdlgr/assets'
import { Header as HeaderLib } from '@sdlgr/header'

import { useClientTranslation } from '@web/i18n/client'

import { StyledCircleLink } from './Header.styles'

export function Header() {
  const { t } = useClientTranslation('header')
  return (
    <HeaderLib
      items={[
        { href: '/experience', label: t('experience') },
        { href: '/contact', label: t('contact') },
        { href: '/portfolio', label: t('portfolio') },
        { href: '/contact', label: t('getInTouch'), hideOnDesktop: true },
      ]}
      actionItem={
        <StyledCircleLink
          href="/contact"
          label={t('getInTouch')}
          iconContent={<ArrowRightIcon />}
        />
      }
    />
  )
}
