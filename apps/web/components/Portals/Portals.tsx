import { mainTheme } from '@sdlgr/main-theme'

import {
  PortalDoorFirst,
  PortalDoorLast,
  PortalFirstGlow,
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
  ...props
}: PortalsProps) {
  return (
    <StyledPortals role="presentation" {...props}>
      <PortalDoorFirst>
        <StyledPortalIcon color={mainTheme.colors.yellow} />
      </PortalDoorFirst>
      <PortalDoorLast>
        <StyledPortalIcon color={mainTheme.colors.green} />
      </PortalDoorLast>
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
