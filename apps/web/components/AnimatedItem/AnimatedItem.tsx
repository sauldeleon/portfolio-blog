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
  parentHeight: number
  seed: string
  path?: string
  rotate?: boolean
  size?: number
  customAnimation?: CustomAnimation
}

export function AnimatedItem({
  seed,
  parentHeight,
  path,
  rotate,
  customAnimation,
  size = 50,
}: AnimatedItemProps) {
  return (
    <HorizontalMovement
      role="presentation"
      $customAnimation={customAnimation?.horizontal}
      $size={size}
      $seed={seed}
    >
      <VerticalMovement
        $customAnimation={customAnimation?.vertical}
        $parentHeight={parentHeight}
        $size={size}
        $seed={seed}
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
