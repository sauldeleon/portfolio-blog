import styled, { RuleSet, css } from 'styled-components'

import { randomIntFromInterval } from './helpers'

function generateParticles(
  parentWidth: number,
  parentHeight: number,
  max: number
) {
  const circles: RuleSet<object>[] = []
  for (let i = 0; i < max; i++) {
    const circleSize = randomIntFromInterval(0, 10, `size${i}`)
    const framesName = `move-frames-${i}`
    const moveDuration =
      3000 + randomIntFromInterval(0, 4000, `moveDuration${i}`)

    const temp = css`
      &:nth-child(${i}) {
        width: ${circleSize}px;
        height: ${circleSize}px;

        animation-name: ${framesName};
        animation-duration: ${moveDuration}ms;
        animation-delay: ${randomIntFromInterval(
          0,
          11000,
          `childAnimationDelay${i}`
        )}ms;

        @keyframes ${framesName} {
          from {
            transform: translate3d(
              0px,
              ${randomIntFromInterval(
                0,
                parentHeight,
                `translate3DFromY${i}`
              )}px,
              0
            );
          }
          to {
            transform: translate3d(
              ${parentWidth}px,
              ${randomIntFromInterval(0, parentHeight, `translate3DToY${i}`)}px,
              0
            );
          }
        }

        .circle {
          animation-delay: ${randomIntFromInterval(
            0,
            100,
            `circleAnimationDelay${i}`
          )}ms;
        }
      }
    `
    circles.push(temp)
  }

  return circles
}

const StyledParticles = styled.div<{
  $parentWidth: number
  $parentHeight: number
  $numParticles: number
}>`
  .circle-container {
    position: absolute;
    transform: translateX(-27px);
    animation-iteration-count: infinite;
    animation-timing-function: linear;

    .circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      mix-blend-mode: screen;
      background-image: radial-gradient(
        hsl(180, 100%, 80%),
        hsl(180, 100%, 80%) 10%,
        hsla(180, 100%, 80%, 0) 56%
      );

      animation: fade-frames 200ms infinite, scale-frames 2s infinite;

      @keyframes fade-frames {
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

      @keyframes scale-frames {
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
    }

    ${({ $parentWidth, $parentHeight, $numParticles }) =>
      generateParticles($parentWidth, $parentHeight, $numParticles)}
  }
`

interface HardcoreParticlesProps {
  parentHeight: number
  parentWidth: number
}

export function HardcoreParticles({
  parentWidth,
  parentHeight,
}: HardcoreParticlesProps) {
  const numParticles = 50
  return (
    <StyledParticles
      $parentHeight={parentHeight}
      $parentWidth={parentWidth}
      $numParticles={numParticles}
    >
      {[...Array(numParticles).keys()].map((id) => (
        <div key={id} className="circle-container">
          <div className="circle" />
        </div>
      ))}
    </StyledParticles>
  )
}
