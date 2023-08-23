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
}

export function MainPortal({
  children,
  enableParticles,
  ...rest
}: MainPortalProps) {
  return (
    <PortalContainer {...rest}>
      <FirstWall />
      <MiddleWall>
        <Portals enableParticles={enableParticles}>{children}</Portals>
      </MiddleWall>
      <LastWall />
    </PortalContainer>
  )
}
