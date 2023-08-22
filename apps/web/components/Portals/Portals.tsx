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
import {
  AnimatedItem,
  AnimatedItemProps,
} from './components/AnimatedItem/AnimatedItem'
import { Particles } from './components/Particles/Particles'

export type AnimatedItem = AnimatedItemProps & {
  isHidden?: boolean
}

interface PortalsProps {
  items: AnimatedItem[]
  enableParticles?: boolean
  enableCylinder?: boolean
}

export function Portals({
  items,
  enableParticles = false,
  enableCylinder = false,
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
        {items
          .filter(({ isHidden }) => !isHidden)
          .map((props, index) => (
            <AnimatedItem key={index} {...props} />
          ))}
        {enableCylinder && (
          <StyledCylinderShape data-testid="cylinder-wrapper" />
        )}
      </PortalPath>
    </StyledPortals>
  )
}
