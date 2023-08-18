import { RuleSet, css, styled } from 'styled-components'

import { randomColor, randomIntFromInterval } from './helpers'

export const HorizontalMovement = styled.div<{
  $parentWidth: number
  $verticalStartPoint: number
  $id: number | string
  $size: number
  $customAnimation?: RuleSet<object>
  $durationSeed: string
  $delaySeed: string
}>`
  --size: ${({ $size }) => `${$size}px`};
  left: calc(0px - var(--size));
  top: ${({ $verticalStartPoint }) => `${$verticalStartPoint}px`};
  position: absolute;
  ${({ $customAnimation, $id, $parentWidth, $durationSeed, $delaySeed }) =>
    $customAnimation
      ? $customAnimation
      : css`
          animation: ${randomIntFromInterval(6, 20, $durationSeed)}s horizontal-${$id}
            ${randomIntFromInterval(1, 5, $delaySeed)}s linear infinite;
          @keyframes horizontal-${$id} {
            100% {
              transform: translateX(calc(${$parentWidth}px + var(--size)));
            }
          }
        `}
`

const sharedStyles = css`
  position: absolute;
  overflow: hidden;
  border-radius: 50%;
  width: var(--size);
  height: var(--size);
`

export const VerticalMovement = styled.div<{
  $id: number | string
  $verticalStartPoint: number
  $parentHeight: number
  $size: number
  $path?: string
  $customAnimation?: RuleSet<object>
  $rotate?: boolean
  $zIndexSeed: string
  $colorSeed: string
  $durationSeed: string
  $verticalRangeSeed: string
}>`
  ${sharedStyles}

  z-index: ${({ $zIndexSeed }) => randomIntFromInterval(2, 5, $zIndexSeed)};

  ${({ $path, $rotate, $colorSeed }) =>
    !$rotate
      ? $path
        ? css`
            background-image: url(${$path});
            background-size: contain;
          `
        : css`
            background: ${randomColor($colorSeed)};
          `
      : css``}

  ${({
    $customAnimation,
    $id,
    $verticalStartPoint,
    $parentHeight,
    $size,
    $durationSeed,
    $verticalRangeSeed,
  }) =>
    $customAnimation
      ? $customAnimation
      : css`
          animation: ${randomIntFromInterval(6, 10, $durationSeed)}s vertical-${$id}
            ease-in-out alternate infinite;

          @keyframes vertical-${$id} {
            100% {
              transform: translateY(
                ${randomIntFromInterval(
                  0,
                  $parentHeight - $verticalStartPoint - $size,
                  $verticalRangeSeed
                )}px
              );
            }
          }
        `}
`

export const RotationMovement = styled.div<{
  $id: number | string
  $customAnimation?: RuleSet<object>
  $path?: string
  $zIndexSeed: string
  $colorSeed: string
  $durationSeed: string
  $rotationAmountSeed: string
}>`
  ${sharedStyles}

  z-index: ${({ $zIndexSeed }) => randomIntFromInterval(2, 5, $zIndexSeed)};

  ${({ $path, $colorSeed }) =>
    $path
      ? css`
          background-image: url(${$path});
          background-size: contain;
        `
      : css`
          border-radius: 0%;
          background: ${randomColor($colorSeed)};
        `}

  ${({ $customAnimation, $id, $durationSeed, $rotationAmountSeed }) =>
    $customAnimation
      ? $customAnimation
      : css`
          animation: ${randomIntFromInterval(2, 4, $durationSeed)}s rotate-${$id}
            linear infinite;

          @keyframes rotate-${$id} {
            from {
              rotate: 0deg;
            }
            to {
              rotate: ${randomIntFromInterval(1, 3, $rotationAmountSeed) *
              360}deg;
            }
          }
        `}
`
