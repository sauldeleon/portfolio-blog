import React from 'react'
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

export interface AnimatedItemProps {
  seed: string
  path?: string
  rotate?: boolean
  size?: number
  customAnimation?: CustomAnimation
}

export function AnimatedItem({
  seed,
  path,
  rotate,
  customAnimation,
  size = 20,
}: AnimatedItemProps) {
  return (
    <HorizontalMovement
      role="presentation"
      $size={size}
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
