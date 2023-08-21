import { RuleSet, css, styled } from 'styled-components'

import { randomColor, randomIntFromInterval } from '@web/utils/random'

export const HorizontalMovement = styled.div<{
  $size: number
  $seed: string
  $customAnimation?: RuleSet<object>
}>`
  --itemSize: ${({ $size }) => `${$size}px`};
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;

  ${({ $customAnimation, $seed }) =>
    $customAnimation
      ? $customAnimation
      : css`
          animation: ${randomIntFromInterval(6, 20, `${$seed}-x-duration`)}s
            horizontal-movement
            ${randomIntFromInterval(1, 5, `${$seed}-x-delay`)}s linear infinite;
        `}
`

export const VerticalMovement = styled.div<{
  $size: number
  $parentHeight: number
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
            -50,
            0,
            `${$seed}-y-begin`
          )}%;
          --translateY-end: ${randomIntFromInterval(0, 50, `${$seed}-y-end`)}%;
          animation: ${randomIntFromInterval(6, 10, `${$seed}-y-duration`)}s
            vertical-movement ease-in-out alternate infinite;
        `};
`

export const RotationMovement = styled.div<{
  $customAnimation?: RuleSet<object>
  $path?: string
  $seed: string
  $rotate?: boolean
}>`
  position: absolute;
  z-index: ${({ $seed }) =>
    randomIntFromInterval(2, 5, `${$seed}-z-indez-rotate`)};
  transform-origin: center;

  &::after {
    content: '';
    width: var(--itemSize);
    height: var(--itemSize);
    border-radius: 50%;
    overflow: hidden;
    display: block;

    ${({ $path, $seed }) =>
      $path
        ? css`
            background-image: url(${$path});
            background-size: contain;
          `
        : css`
            background: ${randomColor(`${$seed}-color`)};
          `}
  }

  ${({ $rotate, $customAnimation, $seed }) =>
    $rotate
      ? $customAnimation
        ? $customAnimation
        : css`
            --rotation: calc(
              ${randomIntFromInterval(1, 2, `${$seed}-rotation-amount`)} *
                360deg
            );
            animation: ${randomIntFromInterval(
                2,
                4,
                `${$seed}-rotation-duration`
              )}s
              rotate-movement linear infinite;
          `
      : css``}
`
