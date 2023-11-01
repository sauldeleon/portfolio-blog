import React from 'react'

import {
  FirstWall,
  LastWall,
  MiddleWall,
  PortalContainer,
  StyledPortals,
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
        <StyledPortals
          enableGlow={enableGlow}
          enableParticles={enableParticles}
        >
          {children}
        </StyledPortals>
      </MiddleWall>
      <LastWall />
    </PortalContainer>
  )
}
