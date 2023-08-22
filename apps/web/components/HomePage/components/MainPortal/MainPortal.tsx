import { NodeJSIcon } from '@sdlgr/assets'

import { AnimatedItem, Portals } from '@web/components/Portals/Portals'

import {
  FirstWall,
  LastWall,
  MiddleWall,
  PortalContainer,
} from './MainPortal.styles'

export function MainPortal() {
  const items: AnimatedItem[] = [
    {
      svg: <NodeJSIcon color="red" />,
      rotate: true,
      colorSwap: true,
    },
    // { path: '/assets/react-logo.png', rotate: true, size: 'S' },
    // { path: '/assets/github-logo.png', size: 'M' },
    // { path: '/assets/reactQuery-logo.png', rotate: true },
    // { path: '/assets/nextjs-logo.png' },
    // { path: '/assets/css3-logo.png' },
    // { path: '/assets/typescript-logo.png' },
    // {},
    // {},
    // {},
    // {},
    // {},
    // {},
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
