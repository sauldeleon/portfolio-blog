import { mainTheme } from '@sdlgr/main-theme'

import {
  PortalFirst,
  PortalFirstGlow,
  PortalLast,
  PortalLastGlow,
  PortalPath,
  StyledCylinderShape,
  StyledPortalIcon,
  StyledPortals,
} from './Portals.styles'
import { Particles } from './components/Particles/Particles'

interface PortalsProps {
  enableParticles?: boolean
  enableCylinder?: boolean
  enableGlow?: boolean
  children?: React.ReactNode
}

export function Portals({
  enableCylinder = false,
  children,
  enableParticles,
  enableGlow,
}: PortalsProps) {
  return (
    <StyledPortals role="presentation">
      <PortalFirst>
        <StyledPortalIcon color={mainTheme.colors.yellow} />
      </PortalFirst>
      <PortalLast>
        <StyledPortalIcon color={mainTheme.colors.green} />
      </PortalLast>
      <PortalPath>
        {enableGlow && (
          <>
            <PortalFirstGlow />
            <PortalLastGlow />
          </>
        )}
        {enableParticles && <Particles />}
        {children}
        {enableCylinder && (
          <StyledCylinderShape data-testid="cylinder-wrapper" />
        )}
      </PortalPath>
    </StyledPortals>
  )
}
