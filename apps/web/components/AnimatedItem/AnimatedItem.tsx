import React, { useId } from 'react'
import { RuleSet } from 'styled-components'

import {
  ColorSwapping,
  HorizontalMovement,
  RotationMovement,
  StyledExternalLink,
  VerticalMovement,
} from './AnimatedItem.styles'

export type CustomAnimation = {
  horizontal?: RuleSet<object>
  vertical?: RuleSet<object>
  rotate?: RuleSet<object>
}

export type AnimationSize = 'S' | 'M' | 'L'

export interface AnimatedItemProps {
  svg: React.ReactNode
  size?: AnimationSize
  rotate?: boolean
  colorSwap?: boolean
  customAnimation?: CustomAnimation
  isHidden?: boolean
  path?: string
  ariaLabel?: string
}

export function AnimatedItem({
  svg,
  rotate = true,
  colorSwap = true,
  customAnimation,
  size = 'M',
  path,
  ariaLabel,
}: AnimatedItemProps) {
  const seed = useId()

  let itemSize
  switch (size) {
    case 'S':
      itemSize = 25
      break
    case 'L':
      itemSize = 55
      break
    default:
      itemSize = 40
  }

  const ColorSwappingItem = (
    <ColorSwapping
      data-testid="color-swapping"
      $seed={seed}
      $colorSwap={colorSwap}
    >
      {svg}
    </ColorSwapping>
  )

  return (
    <HorizontalMovement
      data-testid="horizontal-movement"
      $size={itemSize}
      $seed={seed}
      $customAnimation={customAnimation?.horizontal}
    >
      <VerticalMovement
        data-testid="vertical-movement"
        $seed={seed}
        $customAnimation={customAnimation?.vertical}
      >
        <RotationMovement
          data-testid="rotation-movement"
          $rotate={rotate}
          $seed={seed}
          $customAnimation={customAnimation?.rotate}
        >
          {path ? (
            <StyledExternalLink href={path} aria-label={ariaLabel}>
              {ColorSwappingItem}
            </StyledExternalLink>
          ) : (
            ColorSwappingItem
          )}
        </RotationMovement>
      </VerticalMovement>
    </HorizontalMovement>
  )
}
