import {
  StyledHardcoreParticles,
  StyledParticle,
  StyledParticleContainer,
} from './HardcoreParticles.styles'

interface HardcoreParticlesProps {
  parentHeight: number
  numParticles?: number
}

export function HardcoreParticles({
  parentHeight,
  numParticles = 50,
}: HardcoreParticlesProps) {
  return (
    <StyledHardcoreParticles>
      {[...Array(numParticles).keys()].map((id) => (
        <StyledParticleContainer
          key={id}
          $parentHeight={parentHeight}
          $numParticles={numParticles}
        >
          <StyledParticle role="presentation" $id={id} />
        </StyledParticleContainer>
      ))}
    </StyledHardcoreParticles>
  )
}
