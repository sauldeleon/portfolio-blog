import { mainTheme } from '@sdlgr/main-theme'

import { AnimatedItem, AnimatedItemProps } from '../AnimatedItem/AnimatedItem'
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

export type AnimatedItem = AnimatedItemProps & {
  isHidden?: boolean
}

interface PortalsProps {
  enableParticles?: boolean
  enableCylinder?: boolean
  children?: React.ReactNode
}

export function Portals({
  enableCylinder = false,
  children,
  enableParticles,
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
        <PortalFirstGlow />
        <PortalLastGlow />
        {enableParticles && <Particles />}
        {children}
        {enableCylinder && (
          <StyledCylinderShape data-testid="cylinder-wrapper" />
        )}
      </PortalPath>
    </StyledPortals>
  )
}
