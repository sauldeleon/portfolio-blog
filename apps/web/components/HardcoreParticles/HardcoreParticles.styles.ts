import { css, styled } from 'styled-components'

import { randomIntFromInterval } from '@web/utils/random'

export const StyledHardcoreParticles = styled.div`
  @keyframes particle-movement {
    from {
      transform: translate(-50%, var(--begin-y));
    }
    to {
      transform: translate(50%, var(--end-y));
    }
  }

  @keyframes particle-fade {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0.7;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes particle-scale {
    0% {
      transform: scale3d(0.4, 0.4, 1);
    }

    50% {
      transform: scale3d(1, 1, 1);
    }

    100% {
      transform: scale3d(0.4, 0.4, 1);
    }
  }
`

const generateParticles = (numParticles: number) =>
  Array.from(Array(numParticles).keys()).map(
    (i) =>
      css`
        &:nth-child(${i}) {
          --particleSize: ${randomIntFromInterval(1, 10, `size${i}`)}px;
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          transform: translateX(-60%);
          --begin-y: ${randomIntFromInterval(-46, 46, `translate3DFromY${i}`)}%;
          --end-y: ${randomIntFromInterval(-46, 46, `translate3DToY${i}`)}%;
          animation-name: particle-movement;
          animation-duration: ${3000 +
          randomIntFromInterval(0, 4000, `moveDuration${i}`)}ms;
          animation-delay: ${randomIntFromInterval(
            0,
            11000,
            `childAnimationDelay${i}`
          )}ms;
        }
      `
  )

export const StyledParticle = styled.div<{ $id: number }>`
  ${({ $id }) => css`
    width: var(--particleSize);
    height: var(--particleSize);
    border-radius: 50%;
    mix-blend-mode: screen;
    background-image: radial-gradient(
      hsl(180, 100%, 80%),
      hsl(180, 100%, 80%) 10%,
      hsla(180, 100%, 80%, 0) 56%
    );

    animation: particle-fade
        ${randomIntFromInterval(500, 1000, `particleFadeFrames${$id}`)}ms
        infinite,
      particle-scale
        ${randomIntFromInterval(1000, 2000, `particleScaleFrames${$id}`)}ms
        infinite;

    animation-delay: ${randomIntFromInterval(
      0,
      100,
      `particleAnimationDelay${$id}`
    )}ms;
  `}
`

export const StyledParticleContainer = styled.div<{
  $numParticles: number
}>`
  position: absolute;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  ${({ $numParticles }) => generateParticles($numParticles)}
`
