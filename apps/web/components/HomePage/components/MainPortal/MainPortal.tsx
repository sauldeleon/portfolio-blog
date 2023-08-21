import { AnimatedItem, Portals } from '@web/components/Portals/Portals'
import { animationItemSeedGenerator } from '@web/components/Portals/helpers'

import {
  FirstWall,
  LastWall,
  MiddleWall,
  PortalContainer,
} from './MainPortal.styles'
import { watcher } from './watcher'

export function MainPortal() {
  const items: AnimatedItem[] = [
    { path: '/assets/react-logo.png', rotate: true },
    // { path: '/assets/andromeda.jpg', size: 75 },
    // { path: '/assets/nodejs-logo.png' },
    // { path: '/assets/github-logo.png', size: 60 },
    // { path: '/assets/reactQuery-logo.png', rotate: true, size: 60 },
    // { path: '/assets/nextjs-logo.png', size: 75 },
    // { path: '/assets/css3-logo.png', size: 50 },
    // { path: '/assets/typescript-logo.png', size: 50 },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {
      path: watcher,
      isHidden: true,
    },
  ].map(animationItemSeedGenerator)

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
