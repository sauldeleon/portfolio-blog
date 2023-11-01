import styled, { RuleSet, css } from 'styled-components'

import { Link } from '@sdlgr/link'

import {
  randomDecimalFromInterval,
  randomIntFromInterval,
} from '@web/utils/random'

export const VerticalMovement = styled.div.attrs<{
  $seed: string
  $customAnimation?: RuleSet<object>
}>(({ $seed }) => ({
  style: {
    '--translateY-begin':
      randomIntFromInterval(-37, 20, `${$seed}-y-begin`) + '%',
    '--translateY-end': randomIntFromInterval(-20, 37, `${$seed}-y-end`) + '%',
    animationDuration:
      randomDecimalFromInterval(2, 10, `${$seed}-item-vertical-duration`) + 's',
  },
}))`
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  pointer-events: none;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  ${({ $customAnimation, theme }) =>
    $customAnimation ||
    css`
      animation-name: ${theme.animation.verticalMovement};
    `};
`

export const RotationMovement = styled.div.attrs<{
  $customAnimation?: RuleSet<object>
  $seed: string
  $rotate?: boolean
}>(({ $rotate, $seed }) => ({
  style: $rotate
    ? {
        '--rotation':
          'calc(' +
          randomIntFromInterval(1, 2, `${$seed}-rotation-amount`) +
          ' * 360deg)',
        zIndex: randomIntFromInterval(2, 5, `${$seed}-item-z-index`),
        animationDuration:
          randomDecimalFromInterval(4, 6, `${$seed}-item-rotation-duration`) +
          's',
      }
    : undefined,
}))`
  height: var(--itemSize);
  aspect-ratio: 1/1;
  position: absolute;
  pointer-events: none;

  ${({ $rotate, $customAnimation, theme }) =>
    $rotate
      ? $customAnimation ||
        css`
          animation-name: ${theme.animation.rotateMovement};
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        `
      : null}
`
export const StyledExternalLink = styled(Link)`
  pointer-events: all;
  cursor: pointer;
  ${({ theme }) => theme.helpers.textBottomBorder.removeAfter};
`

export const ColorSwapping = styled.div.attrs<{
  $seed: string
  $colorSwap?: boolean
  $fastDelay?: boolean
}>(({ $seed, $fastDelay }) => ({
  style: {
    animationDuration:
      randomDecimalFromInterval(
        6,
        $fastDelay ? 5 : 20,
        `${$seed}-item-initial-duration`,
      ) + 's',
    animationDelay:
      randomDecimalFromInterval(
        1,
        $fastDelay ? 5 : 20,
        `${$seed}-item-initial-delay`,
      ) + 's',
  },
}))`
  ${({ theme, $colorSwap }) => css`
    color: ${theme.colors.yellow};
    ${$colorSwap &&
    css`
      animation-name: ${theme.animation.colorSwap};
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    `}

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `}
`

export const HorizontalMovement = styled.li.attrs<{
  $size: number
  $seed: string
  $customAnimation?: RuleSet<object>
  $increaseOnDesktop?: boolean
  $fastDelay?: boolean
}>(({ $seed, $fastDelay }) => ({
  style: {
    animationDuration:
      randomDecimalFromInterval(
        6,
        $fastDelay ? 5 : 20,
        `${$seed}-item-initial-duration`,
      ) + 's',
    animationDelay:
      randomDecimalFromInterval(
        1,
        $fastDelay ? 5 : 20,
        `${$seed}-item-initial-delay`,
      ) + 's',
  },
}))`
  --itemSize: ${({ $size }) => `${$size}px`};
  --translateX-begin: calc(-50% - var(--itemSize));
  --translateX-end: calc(50% + var(--itemSize));
  list-style: none;
  position: absolute;
  transform: translateX(-70%);
  width: 100%;
  height: 100%;
  pointer-events: none;

  ${({ $customAnimation, theme }) =>
    $customAnimation ||
    css`
      animation-name: ${theme.animation.horizontalMovement};
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    `}

  &:hover {
    z-index: 200;
    animation-play-state: paused;
    ${VerticalMovement},${RotationMovement},${ColorSwapping} {
      animation-play-state: paused;
    }
  }

  ${({ $increaseOnDesktop, $size, theme }) =>
    $increaseOnDesktop &&
    css`
      ${theme.media.up.md} {
        --itemSize: ${$size + 15}px;
      }
    `}
`
