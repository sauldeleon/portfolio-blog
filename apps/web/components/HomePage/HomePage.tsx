'use client'

import { AnimatedItem } from '@web/components/AnimatedItem/AnimatedItem'
import { MainPortal } from '@web/components/MainPortal/MainPortal'

import { getMainPortalItems } from './mainPortalItems'

interface HomePageProps {
  skillListLabel: string
}

export function HomePage({ skillListLabel }: HomePageProps) {
  const items = getMainPortalItems()
  return (
    <MainPortal enableParticles enableGlow>
      <ul aria-label={skillListLabel}>
        {items
          .filter(({ isHidden }) => !isHidden)
          .map((props, index) => (
            <AnimatedItem key={index} increaseOnDesktop {...props} />
          ))}
      </ul>
    </MainPortal>
  )
}
