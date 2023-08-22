import {
  CSS3Icon,
  GithubIcon,
  JestIcon,
  MongoDBIcon,
  NextJSIcon,
  NodeJSIcon,
  NxIcon,
  ReactJSIcon,
  ReactQueryIcon,
  TypescriptIcon,
  XataIOIcon,
  YarnIcon,
} from '@sdlgr/assets'

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
      svg: <NodeJSIcon />,
      rotate: true,
      colorSwap: true,
    },
    {
      svg: <CSS3Icon />,
      rotate: true,
      colorSwap: true,
      size: 'S',
    },
    {
      svg: <GithubIcon />,
      rotate: true,
      colorSwap: true,
      size: 'S',
    },
    {
      svg: <TypescriptIcon />,
      rotate: true,
      colorSwap: true,
      size: 'S',
    },
    {
      svg: <NextJSIcon />,
      rotate: true,
      colorSwap: true,
    },
    {
      svg: <ReactJSIcon />,
      rotate: true,
      colorSwap: true,
    },
    {
      svg: <MongoDBIcon />,
      rotate: true,
      colorSwap: true,
      size: 'S',
    },
    {
      svg: <ReactQueryIcon />,
      rotate: true,
    },
    {
      svg: <JestIcon />,
      rotate: true,
      colorSwap: true,
    },
    {
      svg: <NxIcon />,
      rotate: true,
      size: 'S',
      colorSwap: true,
    },
    {
      svg: <YarnIcon />,
      rotate: true,
      size: 'S',
      colorSwap: true,
    },
    {
      svg: <XataIOIcon />,
      rotate: true,
      size: 'S',
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
