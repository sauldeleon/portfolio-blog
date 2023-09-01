import { Particle } from './Particle'

interface ParticlesProps {
  numParticles?: number
}

export function Particles({ numParticles = 50 }: ParticlesProps) {
  return (
    <div role="presentation">
      {[...Array(numParticles).keys()].map((id) => (
        <Particle key={id} />
      ))}
    </div>
  )
}
