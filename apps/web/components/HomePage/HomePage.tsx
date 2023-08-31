'use client'

import { useId } from 'react'

import { AnimatedItem } from '@web/components/AnimatedItem/AnimatedItem'
import { MainPortal } from '@web/components/MainPortal/MainPortal'

import { useMainPortalItems } from './useMainPortalItems'

export function HomePage() {
  const id = useId()
  const items = useMainPortalItems()
  return (
    <MainPortal enableParticles enableGlow>
      {items
        .filter(({ isHidden }) => !isHidden)
        .map((props, index) => (
          <AnimatedItem key={`${id}-${index}`} {...props} />
        ))}
    </MainPortal>
  )
}
