import { RuleSet, css, styled } from 'styled-components'

import {
  randomDecimalFromInterval,
  randomIntFromInterval,
} from '@web/utils/random'

export const HorizontalMovement = styled.div<{
  $size: number
  $seed: string
  $customAnimation?: RuleSet<object>
}>`
  --itemSize: ${({ $size }) => `${$size}%`};
  position: absolute;
  transform: translateX(-60%);
  width: 100%;
  height: 100%;

  ${({ $customAnimation, $seed }) =>
    $customAnimation
      ? $customAnimation
      : css`
          animation: ${randomDecimalFromInterval(
              6,
              20,
              `${$seed}-item-horizontal-duration`
            )}s
            horizontal-movement
            ${randomDecimalFromInterval(
              1,
              5,
              `${$seed}-item-horizontal-delay`
            )}s
            linear infinite;
        `}
`

export const VerticalMovement = styled.div<{
  $seed: string
  $customAnimation?: RuleSet<object>
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  ${({ $customAnimation, $seed }) =>
    $customAnimation
      ? $customAnimation
      : css`
          --translateY-begin: ${randomIntFromInterval(
            -37,
            20,
            `${$seed}-y-begin`
          )}%;
          --translateY-end: ${randomIntFromInterval(
            -20,
            37,
            `${$seed}-y-end`
          )}%;
          animation: ${randomDecimalFromInterval(
              2,
              10,
              `${$seed}-item-vertical-duration`
            )}s
            vertical-movement ease-in-out alternate infinite;
        `};
`

export const RotationMovement = styled.div<{
  $customAnimation?: RuleSet<object>
  $seed: string
  $rotate?: boolean
}>`
  z-index: ${({ $seed }) =>
    randomIntFromInterval(2, 5, `${$seed}-item-z-index`)};
  height: var(--itemSize);
  aspect-ratio: 1/1;
  position: absolute;

  ${({ $rotate, $customAnimation, $seed }) =>
    $rotate
      ? $customAnimation
        ? $customAnimation
        : css`
            --rotation: calc(
              ${randomIntFromInterval(1, 2, `${$seed}-rotation-amount`)} *
                360deg
            );
            animation: ${randomDecimalFromInterval(
                4,
                6,
                `${$seed}-item-rotation-duration`
              )}s
              rotate-movement linear infinite;
          `
      : css``}
`

export const StyledSVGWrapper = styled.div<{
  $seed: string
  $colorSwap?: boolean
}>`
  ${({ theme, $seed, $colorSwap }) => css`
    svg {
      width: 100%;
      height: 100%;

      ${$colorSwap &&
      css`
        color: ${theme.colors.yellow};
        animation: ${randomDecimalFromInterval(
            6,
            20,
            `${$seed}-item-horizontal-duration`
          )}s
          color-swap
          ${randomDecimalFromInterval(1, 5, `${$seed}-item-horizontal-delay`)}s
          linear infinite;
      `}
    }
  `}
`
