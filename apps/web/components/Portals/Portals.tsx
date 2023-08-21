import { useRef } from 'react'

import { mainTheme } from '@sdlgr/main-theme'
import { useContainerDimensions } from '@sdlgr/use-container-dimensions'

import {
  AnimatedItem,
  CustomAnimation,
} from '@web/components/AnimatedItem/AnimatedItem'
import { HardcoreParticles } from '@web/components/HardcoreParticles/HardcoreParticles'

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

export type CustomAnimationProps = {
  parentHeight?: number
}

export type AnimatedItem = {
  path?: string
  isHidden?: boolean
  rotate?: boolean
  bounce?: boolean
  size?: number
  seed: string
  customAnimation?: (props: CustomAnimationProps) => CustomAnimation
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
  const ref = useRef<HTMLDivElement>(null)

  const { height, width } = useContainerDimensions({ myRef: ref })

  return (
    <StyledPortals>
      <PortalFirst>
        <StyledPortalIcon color={mainTheme.colors.yellow} />
      </PortalFirst>
      <PortalLast>
        <StyledPortalIcon color={mainTheme.colors.green} />
      </PortalLast>
      <PortalPath ref={ref}>
        <PortalFirstGlow />
        <PortalLastGlow />
        {items.length > 0 && width > 0 && height > 0 ? (
          <>
            {enableParticles && <HardcoreParticles parentHeight={height} />}
            {items
              .filter(({ isHidden }) => !isHidden)
              .map(({ path, customAnimation, rotate, size, seed }, index) => (
                <AnimatedItem
                  key={index}
                  seed={seed}
                  size={size}
                  path={path}
                  rotate={rotate}
                  customAnimation={customAnimation?.({
                    parentHeight: height,
                  })}
                />
              ))}
          </>
        ) : null}
        {enableCylinder && <StyledCylinderShape />}
      </PortalPath>
    </StyledPortals>
  )
}
