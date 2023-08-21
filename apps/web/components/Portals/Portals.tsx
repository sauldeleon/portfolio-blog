import { mainTheme } from '@sdlgr/main-theme'

import {
  AnimatedItem,
  AnimationSize,
  CustomAnimation,
} from '@web/components/AnimatedItem/AnimatedItem'
import { Particles } from '@web/components/Particles/Particles'

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

export type AnimatedItem = {
  path?: string
  isHidden?: boolean
  rotate?: boolean
  bounce?: boolean
  size?: AnimationSize
  customAnimation?: () => CustomAnimation
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
    <StyledPortals>
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
          .map(({ path, customAnimation, rotate, size }, index) => (
            <AnimatedItem
              key={index}
              size={size}
              path={path}
              rotate={rotate}
              customAnimation={customAnimation?.()}
            />
          ))}
        {enableCylinder && <StyledCylinderShape />}
      </PortalPath>
    </StyledPortals>
  )
}
