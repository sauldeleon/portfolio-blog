import {
  StyledHardcoreParticles,
  StyledParticle,
  StyledParticleContainer,
} from './HardcoreParticles.styles'

interface HardcoreParticlesProps {
  numParticles?: number
}

export function HardcoreParticles({
  numParticles = 50,
}: HardcoreParticlesProps) {
  return (
    <StyledHardcoreParticles>
      {[...Array(numParticles).keys()].map((id) => (
        <StyledParticleContainer key={id} $numParticles={numParticles}>
          <StyledParticle role="presentation" $id={id} />
        </StyledParticleContainer>
      ))}
    </StyledHardcoreParticles>
  )
}
