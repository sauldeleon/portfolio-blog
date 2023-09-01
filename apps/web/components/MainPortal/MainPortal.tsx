import React from 'react'

import { Portals } from '@web/components/Portals/Portals'

import {
  FirstWall,
  LastWall,
  MiddleWall,
  PortalContainer,
} from './MainPortal.styles'

interface MainPortalProps {
  children?: React.ReactNode
  enableParticles?: boolean
  enableGlow?: boolean
}

export function MainPortal({
  children,
  enableParticles,
  enableGlow,
  ...rest
}: MainPortalProps) {
  return (
    <PortalContainer {...rest}>
      <FirstWall />
      <MiddleWall>
        <Portals enableGlow={enableGlow} enableParticles={enableParticles}>
          {children}
        </Portals>
      </MiddleWall>
      <LastWall />
    </PortalContainer>
  )
}
