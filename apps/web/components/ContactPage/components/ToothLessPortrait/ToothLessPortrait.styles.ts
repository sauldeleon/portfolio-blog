import Image from 'next/image'
import { css, keyframes, styled } from 'styled-components'

import { randomIntFromInterval } from '@web/utils/random'

import { portraitStyles } from '../Portrait/Portrait.styles'

const TEETH_DELAY_FACTOR = 5

/**                           
 *   
  Each 2 values, it doubles the previous increment
  t(0) = 5*1 + 0 = 5
  t(1) = 5*1 + t(n-1) = 10 
  t(2) = 5*2 + t(n-1) = 20
  t(3) = 5*2 + t(n-1) = 30
  t(4) = 5*4 + t(n-1) = 50
  t(5) = 5*4 + t(n-1) = 70
  t(6) = 5*8 + t(n-1) = 110
  t(7) = 5*8 + t(n-1) = 150

  t(0) = 5
  t(n) = t(n - 1) + 5 * 2^(n // 2)
*/
export const getDelay = (n: number): number => {
  if (n === 0) {
    return TEETH_DELAY_FACTOR
  } else {
    return getDelay(n - 1) + TEETH_DELAY_FACTOR * Math.pow(2, Math.floor(n / 2))
  }
}

export const getWeightedDelay = (delay: number, totalDelay: number) =>
  (delay * 100) / totalDelay

export const getAdditiveBackgroundUrl = (images: string[], index: number) =>
  images
    .slice(0, index + 1)
    .map((image) => `url(${image})`)
    .join(', ')

export const generateKeyframeStep = ({
  images,
  totalImagesDelay,
  index,
}: {
  images: string[]
  totalImagesDelay: number
  index: number
}) => {
  const weightedDelay = getWeightedDelay(getDelay(index), totalImagesDelay)
  return css`
    ${weightedDelay - 0.0001}% {
      background-image: ${index > 0
        ? getAdditiveBackgroundUrl(images, index - 1)
        : 'none'};
    }

    ${weightedDelay}% {
      background-image: ${getAdditiveBackgroundUrl(images, index)};
    }
  `
}

const swapImageAnimation = (
  images: string[],
  totalImagesDelay: number
) => keyframes`
      0% {
        background-image: none;
      }
      ${images.map((_, index) =>
        generateKeyframeStep({ images, totalImagesDelay, index })
      )}
`

export const StyledPortraitContainer = styled.div`
  position: relative;
  z-index: -1;
  height: 70px;
  width: 70px;
  overflow: hidden;

  ${({ theme }) => theme.media.up.md} {
    height: 140px;
    width: 140px;
  }
`

export const StyledToothLessPortrait = styled(Image)`
  ${portraitStyles};
`

export const RotateTooth = styled.div`
  position: absolute;
  animation: 2s ${({ theme }) => theme.animation.moveToothRotate} 1s linear
    infinite;
  top: 50px;
  left: 49.1%;
  transform: rotate(180deg);
`

interface StyledToothProps {
  $p1h?: number
  $p1v?: number
  $p2h?: number
  $p2v?: number
  $cp1h?: number
  $cp1v?: number
  $cp2h?: number
  $cp2v?: number
  $index: number
}

export const StyledTooth = styled.div<StyledToothProps>`
  ${({
    $p1h = 0,
    $p1v = 0,
    $p2h = -558,
    $p2v = 220,
    $cp1h = 0,
    $cp1v = 250,
    $cp2h = -280,
    $cp2v = 200,
    $index,
    theme,
  }) => css`
    position: absolute;
    width: 100%;
    height: 100%;
    top: -200%;
    left: -6px;
    animation-name: ${theme.animation.moveToothFall};
    animation-duration: 5s;
    animation-delay: ${getDelay($index)}s;
    animation-iteration-count: 1;

    ${theme.media.up.md} {
      --p1h: ${$p1h}; //initial x position
      --p1v: ${$p1v}; //initial y position
      --p2h: ${$p2h}; //final x position
      --p2v: ${$p2v}; //final y position
      --cp1h: ${$cp1h}; //initial x control curve position
      --cp1v: ${$cp1v}; //initial y control curve position
      --cp2h: ${$cp2h}; //final x control curve position
      --cp2v: ${$cp2v}; //final y control curve position
      --final-tooth-top: ${randomIntFromInterval(
        10,
        90,
        `tooth-height-${$index}`
      )}%;

      top: 0;
      left: -70%;
      animation-name: ${theme.animation.moveToothHorizontal},
        ${theme.animation.moveToothVertical};
      animation-timing-function: cubic-bezier(
          calc(1 / 3),
          calc((var(--cp1h) - var(--p1h)) / (var(--p2h) - var(--p1h))),
          calc(2 / 3),
          calc((var(--cp2h) - var(--p1h)) / (var(--p2h) - var(--p1h)))
        ),
        cubic-bezier(
          calc(1 / 3),
          calc((var(--cp1v) - var(--p1v)) / (var(--p2v) - var(--p1v))),
          calc(2 / 3),
          calc((var(--cp2v) - var(--p1v)) / (var(--p2v) - var(--p1v)))
        );
    }
  `}
`

export const ToothHoleImage = styled.div<{
  $images: string[]
}>`
  position: absolute;
  background-image: none;
  background-size: contain;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  ${({ $images }) => {
    const totalImagesDelay = getDelay($images.length - 1)

    return css`
      animation: ${totalImagesDelay}s
        ${swapImageAnimation($images, totalImagesDelay)} linear forwards;
    `
  }}
`
