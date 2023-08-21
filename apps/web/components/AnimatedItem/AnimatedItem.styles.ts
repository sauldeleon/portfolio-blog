import { RuleSet, css, styled } from 'styled-components'

import { randomColor, randomIntFromInterval } from '@web/utils/random'

export const HorizontalMovement = styled.div<{
  $verticalStartPoint: number
  $size: number
  $durationSeed: string
  $delaySeed: string
  $customAnimation?: RuleSet<object>
}>`
  --itemSize: ${({ $size }) => `${$size}px`};
  top: ${({ $verticalStartPoint }) => `${$verticalStartPoint}px`};
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;

  ${({ $customAnimation, $durationSeed, $delaySeed }) =>
    $customAnimation
      ? $customAnimation
      : css`
          animation: ${randomIntFromInterval(6, 20, $durationSeed)}s
            horizontal-movement ${randomIntFromInterval(1, 5, $delaySeed)}s
            linear infinite;
        `}
`

export const VerticalMovement = styled.div<{
  $verticalStartPoint: number
  $size: number
  $parentHeight: number
  $durationSeed: string
  $verticalRangeSeed: string
  $customAnimation?: RuleSet<object>
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: top left;
  display: grid;
  place-items: start center;

  ${({
    $customAnimation,
    $verticalStartPoint,
    $parentHeight,
    $size,
    $durationSeed,
    $verticalRangeSeed,
  }) =>
    $customAnimation
      ? $customAnimation
      : css`
          --vertical-slide: ${randomIntFromInterval(
            0,
            $parentHeight - $verticalStartPoint - $size,
            $verticalRangeSeed
          )}px;
          animation: ${randomIntFromInterval(6, 10, $durationSeed)}s
            vertical-movement ease-in-out alternate infinite;
        `};
`

export const RotationMovement = styled.div<{
  $customAnimation?: RuleSet<object>
  $path?: string
  $zIndexSeed: string
  $colorSeed: string
  $durationSeed: string
  $rotationAmountSeed: string
  $rotate?: boolean
}>`
  position: absolute;
  z-index: ${({ $zIndexSeed }) => randomIntFromInterval(2, 5, $zIndexSeed)};
  transform-origin: center;

  &::after {
    content: '';
    width: var(--itemSize);
    height: var(--itemSize);
    border-radius: 50%;
    overflow: hidden;
    display: block;

    ${({ $path, $colorSeed }) =>
      $path
        ? css`
            background-image: url(${$path});
            background-size: contain;
          `
        : css`
            background: ${randomColor($colorSeed)};
          `}
  }

  ${({ $rotate, $customAnimation, $durationSeed, $rotationAmountSeed }) =>
    $rotate
      ? $customAnimation
        ? $customAnimation
        : css`
            --rotation: calc(
              ${randomIntFromInterval(1, 2, $rotationAmountSeed)} * 360deg
            );
            animation: ${randomIntFromInterval(2, 4, $durationSeed)}s
              rotate-movement linear infinite;
          `
      : css``}
`
