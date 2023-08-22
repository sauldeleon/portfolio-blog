import { Particle } from './Particle'
import { StyledParticles } from './Particles.styles'

interface ParticlesProps {
  numParticles?: number
}

export function Particles({ numParticles = 50 }: ParticlesProps) {
  return (
    <StyledParticles role="presentation">
      {[...Array(numParticles).keys()].map((id) => (
        <Particle key={id} />
      ))}
    </StyledParticles>
  )
}
