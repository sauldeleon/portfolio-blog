import {
  StyledParticle,
  StyledParticleContainer,
  StyledParticles,
} from './Particles.styles'

interface ParticlesProps {
  numParticles?: number
}

export function Particles({ numParticles = 50 }: ParticlesProps) {
  return (
    <StyledParticles>
      {[...Array(numParticles).keys()].map((id) => (
        <StyledParticleContainer key={id} $numParticles={numParticles}>
          <StyledParticle role="presentation" $id={id} />
        </StyledParticleContainer>
      ))}
    </StyledParticles>
  )
}
