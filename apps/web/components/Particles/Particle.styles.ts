import { css, styled } from 'styled-components'

import { randomIntFromInterval } from '@web/utils/random'

export const StyledParticleContainer = styled.div<{ $seed: string }>`
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translateX(-60%);
  display: grid;
  place-items: center;

  ${({ $seed }) => css`
    --particleSize: ${randomIntFromInterval(1, 10, `${$seed}-size`)}px;
    --begin-y: ${randomIntFromInterval(-46, 46, `${$seed}-translate-begin-y`)}%;
    --end-y: ${randomIntFromInterval(-46, 46, `${$seed}-translate-end-y`)}%;
    animation: ${3000 +
      randomIntFromInterval(0, 4000, `${$seed}-particle-movement-duration`)}ms
      particle-movement
      ${randomIntFromInterval(0, 11000, `${$seed}-particle-movement-delay`)}ms
      infinite linear;
  `}
`

export const StyledParticle = styled.div<{ $seed: string }>`
  width: var(--particleSize);
  height: var(--particleSize);
  border-radius: 50%;
  mix-blend-mode: screen;
  background-image: radial-gradient(
    hsl(180, 100%, 80%),
    hsl(180, 100%, 80%) 10%,
    hsla(180, 100%, 80%, 0) 56%
  );

  ${({ $seed }) => css`
    animation: particle-fade
        ${randomIntFromInterval(500, 1000, `${$seed}-particle-fade-frames`)}ms
        infinite,
      particle-scale
        ${randomIntFromInterval(1000, 2000, `${$seed}-particle-scale-frames`)}ms
        infinite;

    animation-delay: ${randomIntFromInterval(
      0,
      100,
      `${$seed}-particle-animation-delay`
    )}ms;
  `}
`
