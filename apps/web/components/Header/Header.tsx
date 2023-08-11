import { Header as HeaderLib } from '@sdlgr/header'

import { useClientTranslation } from '@web/i18n/client'

export function Header() {
  const { t } = useClientTranslation('header')
  return (
    <HeaderLib
      items={[
        { href: '/experience', label: t('experience') },
        { href: '/contact', label: t('contact') },
        { href: '/portfolio', label: t('portfolio') },
      ]}
      actionButtonLabel={t('getInTouch')}
    />
  )
}
