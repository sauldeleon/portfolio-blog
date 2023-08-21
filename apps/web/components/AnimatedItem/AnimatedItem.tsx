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

export type AnimationSize = 14 | 20 | 26

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
  size = 20,
}: AnimatedItemProps) {
  const theKey = useId()
  return (
    <HorizontalMovement
      role="presentation"
      $size={size}
      $seed={theKey}
      $customAnimation={customAnimation?.horizontal}
    >
      <VerticalMovement
        $seed={theKey}
        $customAnimation={customAnimation?.vertical}
      >
        <RotationMovement
          role="none"
          $rotate={rotate}
          $path={path}
          $seed={theKey}
          $customAnimation={customAnimation?.rotate}
        />
      </VerticalMovement>
    </HorizontalMovement>
  )
}
