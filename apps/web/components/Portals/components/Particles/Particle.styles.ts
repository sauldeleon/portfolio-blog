import styled, { css } from 'styled-components'

import { randomIntFromInterval } from '@web/utils/random'

export const StyledParticleContainer = styled.div.attrs<{ $seed: string }>(
  ({ $seed }) => ({
    style: {
      '--particleSize': randomIntFromInterval(1, 10, `${$seed}-size`) + 'px',
      '--begin-y':
        randomIntFromInterval(-46, 46, `${$seed}-translate-begin-y`) + '%',
      '--end-y':
        randomIntFromInterval(-46, 46, `${$seed}-translate-end-y`) + '%',
      animationDuration:
        3000 +
        randomIntFromInterval(0, 4000, `${$seed}-particle-movement-duration`) +
        'ms',
      animationDelay:
        randomIntFromInterval(0, 11000, `${$seed}-particle-movement-delay`) +
        'ms',
    },
  }),
)`
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translateX(-60%);
  display: grid;
  place-items: center;
  animation-name: ${({ theme }) => theme.animation.particleMovement};
  animation-iteration-count: infinite;
  animation-timing-function: linear;
`

export const StyledParticle = styled.div.attrs<{ $seed: string }>(
  ({ $seed }) => ({
    style: {
      animationDuration:
        randomIntFromInterval(500, 1000, `${$seed}-particle-fade-frames`) +
        'ms, ' +
        randomIntFromInterval(1000, 2000, `${$seed}-particle-scale-frames`) +
        'ms',
      animationDelay:
        randomIntFromInterval(0, 100, `${$seed}-particle-animation-delay`) +
        'ms',
    },
  }),
)`
  width: var(--particleSize);
  height: var(--particleSize);
  border-radius: 50%;
  mix-blend-mode: screen;
  background-image: radial-gradient(
    hsl(180, 100%, 80%),
    hsl(180, 100%, 80%) 10%,
    hsla(180, 100%, 80%, 0) 56%
  );

  ${({ theme }) => css`
    animation-name: ${theme.animation.particleFade},
      ${theme.animation.particleScale};
  `}
  animation-iteration-count: infinite;
`
