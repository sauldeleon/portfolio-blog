import { css } from 'styled-components'

import {
  AnimatedItem,
  CustomAnimationProps,
  Portals,
} from '@web/components/Portals/Portals'
import { animationItemSeedGenerator } from '@web/components/Portals/helpers'

import {
  FirstWall,
  LastWall,
  MiddleWall,
  PortalContainer,
} from './HomePagePortalGame.styles'
import { watcher } from './watcher'

export function HomePagePortalGame() {
  const items: AnimatedItem[] = [
    { id: 1, path: '/assets/react-logo.png', rotate: true, size: 100 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    {
      id: 'watcher',
      path: watcher,
      isHidden: true,
      customAnimation: /* istanbul ignore next */ ({
        parentWidth,
      }: CustomAnimationProps) => ({
        horizontal: css`
          top: 30px;
        `,
        vertical: css`
          transform: rotate(90deg);
          animation: moveWatcher 6s linear infinite;

          @keyframes moveWatcher {
            40% {
              transform: translateX(50px) rotate(90deg);
            }
            50% {
              transform: translateX(0px) rotate(90deg);
            }
            100% {
              transform: translateX(calc(${parentWidth}px + 50px))
                rotate(360deg);
            }
          }
        `,
      }),
    },
  ].map(animationItemSeedGenerator)

  return (
    <PortalContainer>
      <FirstWall />
      <MiddleWall>
        <Portals items={items} />
      </MiddleWall>
      <LastWall />
    </PortalContainer>
  )
}
