import React from 'react'
import { RuleSet } from 'styled-components'

import {
  HorizontalMovement,
  RotationMovement,
  VerticalMovement,
} from './AnimatedItem.styles'
import { randomIntFromInterval } from './helpers'

export type AnimatedItemSeeds = {
  keyframe: string
  verticalStartPoint: string
  horizontalDuration: string
  horizontalDelay: string
  verticalZIndex: string
  verticalDuration: string
  verticalDelay: string
  verticalRange: string
  verticalColor: string
  rotationZIndex: string
  rotationColor: string
  rotationDuration: string
  rotationDelay: string
}

export type CustomAnimation = {
  horizontal?: RuleSet<object>
  vertical?: RuleSet<object>
  rotate?: RuleSet<object>
}

export interface AnimatedItemProps {
  id: number
  seeds: AnimatedItemSeeds
  parentWidth: number
  parentHeight: number
  path?: string
  rotate?: boolean
  size?: number
  customAnimation?: CustomAnimation
}

export function AnimatedItem({
  id,
  seeds,
  parentWidth,
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

  const innerElement: React.ReactNode = rotate ? (
    <VerticalMovement
      $customAnimation={customAnimation?.vertical}
      $id={id}
      $parentHeight={parentHeight}
      $rotate={rotate}
      $size={size}
      $verticalStartPoint={verticalStartPoint}
      $colorSeed={seeds.verticalColor}
      $delaySeed={seeds.verticalDelay}
      $durationSeed={seeds.verticalDuration}
      $verticalRangeSeed={seeds.verticalRange}
      $zIndexSeed={seeds.verticalZIndex}
    >
      <RotationMovement
        $customAnimation={customAnimation?.rotate}
        $id={id}
        $path={path}
        $colorSeed={seeds.rotationZIndex}
        $delaySeed={seeds.rotationDelay}
        $durationSeed={seeds.rotationDuration}
        $zIndexSeed={seeds.rotationZIndex}
      />
    </VerticalMovement>
  ) : (
    <VerticalMovement
      $customAnimation={customAnimation?.vertical}
      $id={id}
      $parentHeight={parentHeight}
      $path={path}
      $size={size}
      $verticalStartPoint={verticalStartPoint}
      $colorSeed={seeds.verticalColor}
      $delaySeed={seeds.verticalDelay}
      $durationSeed={seeds.verticalDuration}
      $verticalRangeSeed={seeds.verticalRange}
      $zIndexSeed={seeds.verticalZIndex}
    />
  )

  return (
    <HorizontalMovement
      $customAnimation={customAnimation?.horizontal}
      $id={id}
      $parentWidth={parentWidth}
      $size={size}
      $verticalStartPoint={verticalStartPoint}
      $delaySeed={seeds.horizontalDelay}
      $durationSeed={seeds.horizontalDuration}
    >
      {innerElement}
    </HorizontalMovement>
  )
}
