'use client'

import { useId } from 'react'

import { AnimatedItem } from '@web/components/AnimatedItem/AnimatedItem'
import { MainPortal } from '@web/components/MainPortal/MainPortal'
import { useClientTranslation } from '@web/i18n/client'

import { useMainPortalItems } from './useMainPortalItems'

export function HomePage() {
  const id = useId()
  const items = useMainPortalItems()
  const { t } = useClientTranslation('homepage')
  return (
    <MainPortal enableParticles enableGlow>
      <ul aria-label={t('skillList')}>
        {items
          .filter(({ isHidden }) => !isHidden)
          .map((props, index) => (
            <AnimatedItem key={`${id}-${index}`} increaseOnDesktop {...props} />
          ))}
      </ul>
    </MainPortal>
  )
}
