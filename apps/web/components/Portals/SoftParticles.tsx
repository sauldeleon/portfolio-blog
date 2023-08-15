import { css, styled } from 'styled-components'

import { randomIntFromInterval } from './helpers'

function generateParticlesShadow(max: number) {
  let shadow = '0px 0px #fff'
  for (let i = 0; i < max; i++) {
    shadow = shadow.concat(
      `, ${randomIntFromInterval(0, 1000)}px ${randomIntFromInterval(
        0,
        1000
      )}px #fff`
    )
  }
  return shadow
}

const particlesMixin = (max: number) => css`
  box-shadow: ${generateParticlesShadow(max)};
`

export const StyledParticles = styled.div<{ $parentWidth: number }>`
  ${({ $parentWidth }) => css`
    .particle-first {
      animation: 30s animParticle-first linear forwards;
      ${particlesMixin(100)}
      height: 1px;
      width: 1px;
    }

    .particle-1 {
      animation: 60s animParticle-1 linear infinite;
      ${particlesMixin(100)}
      height: 1px;
      width: 1px;
    }

    .particle-2 {
      opacity: 0;
      animation: 60s animParticle-2 30s linear infinite;
      ${particlesMixin(100)}
      height: 1px;
      width: 1px;
    }

    @keyframes animParticle-first {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(${$parentWidth}px);
      }
    }

    @keyframes animParticle-1 {
      0% {
        transform: translateX(-${$parentWidth}px);
      }
      100% {
        transform: translateX(${$parentWidth}px);
      }
    }

    @keyframes animParticle-2 {
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
}

export function SoftParticles({ parentWidth }: SoftParticlesProps) {
  return (
    <StyledParticles $parentWidth={parentWidth}>
      <div className="particle-first" />
      <div className="particle-1" />
      <div className="particle-2" />
    </StyledParticles>
  )
}
