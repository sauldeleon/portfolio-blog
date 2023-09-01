import { useId } from 'react'

import { StyledParticle, StyledParticleContainer } from './Particle.styles'

export function Particle() {
  const seed = useId()
  return (
    <StyledParticleContainer $seed={seed}>
      <StyledParticle $seed={seed} />
    </StyledParticleContainer>
  )
}
