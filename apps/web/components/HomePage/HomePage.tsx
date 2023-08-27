'use client'

import { useId } from 'react'

import { Label } from '@sdlgr/typography'

import { AnimatedItem } from '@web/components/AnimatedItem/AnimatedItem'
import { MainPortal } from '@web/components/MainPortal/MainPortal'
import { useClientTranslation } from '@web/i18n/client'

import { StyledCircleLink } from './HomePage.styles'
import { useMainPortalItems } from './useMainPortalItems'

export function HomePage() {
  const { t } = useClientTranslation('homepage')
  const id = useId()
  const items = useMainPortalItems()
  return (
    <>
      <StyledCircleLink
        href="/explore"
        iconContent={<Label $level="XS">{t('explore')}</Label>}
        iconSize={76}
      />
      <MainPortal enableParticles enableGlow>
        {items
          .filter(({ isHidden }) => !isHidden)
          .map((props, index) => (
            <AnimatedItem key={`${id}-${index}`} {...props} />
          ))}
      </MainPortal>
    </>
  )
}
