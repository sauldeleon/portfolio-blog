import React from 'react'
import { RuleSet } from 'styled-components'

import { randomIntFromInterval } from '@web/utils/random'

import {
  HorizontalMovement,
  RotationMovement,
  VerticalMovement,
} from './AnimatedItem.styles'

export type AnimatedItemSeeds = {
  zIndex: string
  color: string
  verticalStartPoint: string
  horizontalDuration: string
  horizontalDelay: string
  verticalDuration: string
  verticalRange: string
  rotationDuration: string
  rotationAmount: string
}

export type CustomAnimation = {
  horizontal?: RuleSet<object>
  vertical?: RuleSet<object>
  rotate?: RuleSet<object>
}

export interface AnimatedItemProps {
  seeds: AnimatedItemSeeds
  parentHeight: number
  path?: string
  rotate?: boolean
  size?: number
  customAnimation?: CustomAnimation
}

export function AnimatedItem({
  seeds,
  parentHeight,
  path,
  rotate,
  customAnimation,
  size = 50,
}: AnimatedItemProps) {
  const verticalStartPoint = randomIntFromInterval(
    0,
    parentHeight - 2 * size,
    seeds.verticalStartPoint
  )

  return (
    <HorizontalMovement
      role="presentation"
      $customAnimation={customAnimation?.horizontal}
      $size={size}
      $verticalStartPoint={verticalStartPoint}
      $delaySeed={seeds.horizontalDelay}
      $durationSeed={seeds.horizontalDuration}
    >
      <VerticalMovement
        $customAnimation={customAnimation?.vertical}
        $parentHeight={parentHeight}
        $size={size}
        $verticalStartPoint={verticalStartPoint}
        $durationSeed={seeds.verticalDuration}
        $verticalRangeSeed={seeds.verticalRange}
      >
        <RotationMovement
          role="none"
          $rotate={rotate}
          $path={path}
          $colorSeed={seeds.color}
          $durationSeed={seeds.rotationDuration}
          $zIndexSeed={seeds.zIndex}
          $rotationAmountSeed={seeds.rotationAmount}
          $customAnimation={customAnimation?.rotate}
        />
      </VerticalMovement>
    </HorizontalMovement>
  )
}
