import React, { useId } from 'react'
import { RuleSet } from 'styled-components'

import {
  HorizontalMovement,
  RotationMovement,
  StyledSVGWrapper,
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
}

export function AnimatedItem({
  svg,
  rotate,
  colorSwap,
  customAnimation,
  size = 'M',
}: AnimatedItemProps) {
  const seed = useId()

  let itemSize
  switch (size) {
    case 'S':
      itemSize = 16
      break
    case 'L':
      itemSize = 26
      break
    default:
      itemSize = 20
  }

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
          <StyledSVGWrapper
            data-testid="color-swapping"
            $seed={seed}
            $colorSwap={colorSwap}
          >
            {svg}
          </StyledSVGWrapper>
        </RotationMovement>
      </VerticalMovement>
    </HorizontalMovement>
  )
}
