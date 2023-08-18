import styled, { RuleSet, css } from 'styled-components'

import { randomIntFromInterval } from './helpers'

function generateParticles(
  parentWidth: number,
  parentHeight: number,
  numParticles: number
) {
  const circles: RuleSet<object>[] = []
  for (let i = 0; i < numParticles; i++) {
    const circleSize = randomIntFromInterval(1, 10, `size${i}`)
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

        ${Circle} {
          animation: fade-frames
              ${randomIntFromInterval(500, 1000, `circleFadeFrames${i}`)}ms
              infinite,
            scale-frames
              ${randomIntFromInterval(1000, 2000, `circleScaleFrames${i}`)}ms
              infinite;

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

const Circle = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  mix-blend-mode: screen;
  background-image: radial-gradient(
    hsl(180, 100%, 80%),
    hsl(180, 100%, 80%) 10%,
    hsla(180, 100%, 80%, 0) 56%
  );

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
`

const CircleContainer = styled.div<{
  $parentWidth: number
  $parentHeight: number
  $numParticles: number
}>`
  position: absolute;
  transform: translateX(-27px);
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  ${({ $parentWidth, $parentHeight, $numParticles }) =>
    generateParticles($parentWidth, $parentHeight, $numParticles)}

  ${Circle}
`

interface HardcoreParticlesProps {
  parentHeight: number
  parentWidth: number
  numParticles?: number
}

export function HardcoreParticles({
  parentWidth,
  parentHeight,
  numParticles = 70,
}: HardcoreParticlesProps) {
  return (
    <div>
      {[...Array(numParticles).keys()].map((id) => (
        <CircleContainer
          key={id}
          $parentHeight={parentHeight}
          $parentWidth={parentWidth}
          $numParticles={numParticles}
        >
          <Circle role="presentation" />
        </CircleContainer>
      ))}
    </div>
  )
}
