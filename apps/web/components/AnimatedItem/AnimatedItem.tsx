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

export interface AnimatedItemProps {
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
      role="presentation"
      $size={itemSize}
      $seed={seed}
      $customAnimation={customAnimation?.horizontal}
    >
      <VerticalMovement
        $seed={seed}
        $customAnimation={customAnimation?.vertical}
      >
        <RotationMovement
          role="none"
          $rotate={rotate}
          $path={path}
          $seed={seed}
          $customAnimation={customAnimation?.rotate}
        />
      </VerticalMovement>
    </HorizontalMovement>
  )
}
