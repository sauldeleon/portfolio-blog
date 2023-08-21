import { css, styled } from 'styled-components'

import { randomIntFromInterval } from '@web/utils/random'

function generateParticlesGroup(
  numParticles: number,
  maxWidth: number,
  maxHeight: number,
  seed: string
) {
  let particleGroup = '0px 0px #fff'
  for (let i = 0; i < numParticles; i++) {
    particleGroup = particleGroup.concat(
      `, ${randomIntFromInterval(0, maxWidth)}px ${randomIntFromInterval(
        0,
        maxHeight
      )}px #fff`
    )
  }
  return particleGroup
}

const FirstParticleGroup = styled.div<{
  $numParticles: number
  $parentWidth: number
  $parentHeight: number
}>`
  ${({ $numParticles, $parentWidth, $parentHeight }) => css`
    animation: 30s move-first-particle-group linear forwards;
    box-shadow: ${generateParticlesGroup(
      $numParticles,
      $parentWidth,
      $parentHeight,
      'first-group'
    )};
    height: 1px;
    width: 1px;

    @keyframes move-first-particle-group {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(${$parentWidth}px);
      }
    }
  `}
`

const ParticleGroupA = styled.div<{
  $numParticles: number
  $parentWidth: number
  $parentHeight: number
}>`
  ${({ $numParticles, $parentWidth, $parentHeight }) => css`
    animation: 60s move-particle-group-a linear infinite;
    box-shadow: ${generateParticlesGroup(
      $numParticles,
      $parentWidth,
      $parentHeight,
      'group-a'
    )};
    height: 1px;
    width: 1px;

    @keyframes move-particle-group-a {
      0% {
        transform: translateX(-${$parentWidth}px);
      }
      100% {
        transform: translateX(${$parentWidth}px);
      }
    }
  `}
`

const ParticleGroupB = styled.div<{
  $numParticles: number
  $parentWidth: number
  $parentHeight: number
}>`
  ${({ $numParticles, $parentWidth, $parentHeight }) => css`
    opacity: 0;
    animation: 60s move-particle-group-b 30s linear infinite;
    box-shadow: ${generateParticlesGroup(
      $numParticles,
      $parentWidth,
      $parentHeight,
      'group-b'
    )};
    height: 1px;
    width: 1px;

    @keyframes move-particle-group-b {
      0% {
        opacity: 1;
        transform: translateX(-${$parentWidth}px);
      }
      99% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: translateX(${$parentWidth}px);
      }
    }
  `}
`

interface SoftParticlesProps {
  parentWidth: number
  parentHeight: number
  numParticles?: number
}

export function SoftParticles({
  parentWidth,
  parentHeight,
  numParticles = 100,
}: SoftParticlesProps) {
  return (
    <div>
      <FirstParticleGroup
        $parentWidth={parentWidth}
        $parentHeight={parentHeight}
        $numParticles={numParticles}
        role="presentation"
      />
      <ParticleGroupA
        $parentWidth={parentWidth}
        $parentHeight={parentHeight}
        $numParticles={numParticles}
        role="presentation"
      />
      <ParticleGroupB
        $parentWidth={parentWidth}
        $parentHeight={parentHeight}
        $numParticles={numParticles}
        role="presentation"
      />
    </div>
  )
}
