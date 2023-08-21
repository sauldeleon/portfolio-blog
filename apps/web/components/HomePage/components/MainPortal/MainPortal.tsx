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
    { path: '/assets/react-logo.png', rotate: true, size: 100 },
    { path: '/assets/andromeda.jpg', size: 75 },
    { path: '/assets/nodejs-logo.png', size: 75 },
    { path: '/assets/github-logo.png', size: 75 },
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
