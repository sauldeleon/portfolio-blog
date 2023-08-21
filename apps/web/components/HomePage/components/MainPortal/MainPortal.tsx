import { AnimatedItem, Portals } from '@web/components/Portals/Portals'

import {
  FirstWall,
  LastWall,
  MiddleWall,
  PortalContainer,
} from './MainPortal.styles'
import { watcher } from './watcher'

export function MainPortal() {
  const items: AnimatedItem[] = [
    { path: '/assets/react-logo.png', rotate: true, size: 'S' },
    { path: '/assets/nodejs-logo.png', size: 'L' },
    { path: '/assets/github-logo.png', size: 'M' },
    { path: '/assets/reactQuery-logo.png', rotate: true },
    { path: '/assets/nextjs-logo.png' },
    { path: '/assets/css3-logo.png' },
    { path: '/assets/typescript-logo.png' },
    {
      path: watcher,
      isHidden: true,
    },
  ]

  return (
    <PortalContainer>
      <FirstWall />
      <MiddleWall>
        <Portals items={items} enableParticles />
      </MiddleWall>
      <LastWall />
    </PortalContainer>
  )
}
