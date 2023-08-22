import React, { useId } from 'react'
import { RuleSet } from 'styled-components'

import {
  HorizontalMovement,
  RotationMovement,
  VerticalMovement,
} from './AnimatedItem.styles'

export type CustomAnimation = {
  horizontal?: RuleSet<object>
  vertical?: RuleSet<object>
  rotate?: RuleSet<object>
}

export type AnimationSize = 'S' | 'M' | 'L'

interface AnimatedItemProps {
  path?: string
  rotate?: boolean
  size?: AnimationSize
  customAnimation?: CustomAnimation
}

export function AnimatedItem({
  path,
  rotate,
  customAnimation,
  size = 'M',
  ...rest
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
          $path={path}
          $seed={seed}
          $customAnimation={customAnimation?.rotate}
        />
      </VerticalMovement>
    </HorizontalMovement>
  )
}
