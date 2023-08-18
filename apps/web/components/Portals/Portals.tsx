import { useRef } from 'react'

import { mainTheme } from '@sdlgr/main-theme'

import {
  AnimatedItem,
  AnimatedItemSeeds,
  CustomAnimation,
} from './AnimatedItem'
import { HardcoreParticles } from './HardcoreParticles'
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
import { useContainerDimensions } from './useContainerDimensions'

export type CustomAnimationProps = {
  parentWidth?: number
  parentHeight?: number
  id?: number | string
}

export type AnimatedItem = {
  id: number | string
  path?: string
  isHidden?: boolean
  rotate?: boolean
  bounce?: boolean
  size?: number
  seeds: AnimatedItemSeeds
  customAnimation?: (props: CustomAnimationProps) => CustomAnimation
}

interface PortalsProps {
  items: AnimatedItem[]
}

export function Portals({ items }: PortalsProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { width, height } = useContainerDimensions(ref)

  return (
    <StyledPortals>
      <PortalFirst>
        <StyledPortalIcon color={mainTheme.colors.yellow} />
      </PortalFirst>
      <PortalLast>
        <StyledPortalIcon color={mainTheme.colors.green} />
      </PortalLast>
      <PortalPath ref={ref}>
        {items.length > 0 && height > 0 ? (
          <>
            <HardcoreParticles parentWidth={width} parentHeight={height} />
            <PortalFirstGlow />
            <PortalLastGlow />
            <StyledCylinderShape />
            {items
              .filter(({ isHidden }) => !isHidden)
              .map(
                ({ id, path, customAnimation, rotate, size, seeds }, index) => (
                  <AnimatedItem
                    key={index}
                    id={id}
                    seeds={seeds}
                    parentWidth={width}
                    parentHeight={height}
                    path={path}
                    rotate={rotate}
                    size={size}
                    customAnimation={customAnimation?.({
                      parentWidth: width,
                      parentHeight: height,
                      id,
                    })}
                  />
                )
              )}
          </>
        ) : null}
      </PortalPath>
    </StyledPortals>
  )
}
