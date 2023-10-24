import styled, { css } from 'styled-components'

import { Portal } from '@sdlgr/assets'

export const StyledPortals = styled.div`
  --iconHeight: 249px;
  --iconWidth: 130px;
  --pathHeight: 212px;

  z-index: 2;
  display: flex;
  justify-content: space-between;
  transform: rotate(90deg);

  ${({ theme }) => theme.media.up.md} {
    --iconHeight: 358px;
    --iconWidth: 188px;
    --pathHeight: 305px;

    transform: unset;
  }
`

export const PortalPath = styled.div`
  position: absolute;
  overflow: clip;
  height: var(--pathHeight);

  border-top-left-radius: 30px 50%;
  border-bottom-left-radius: 30px 50%;
  border-top-right-radius: 30px 50%;
  border-bottom-right-radius: 30px 50%;

  top: calc((var(--iconHeight) - var(--pathHeight)) / 2);
  left: calc((var(--iconWidth) / 2) - 3px);
  right: calc((var(--iconWidth) / 2) - 3px);

  ${({ theme }) => theme.media.up.md} {
    border-top-left-radius: 40px 50%;
    border-bottom-left-radius: 40px 50%;
    border-top-right-radius: 40px 50%;
    border-bottom-right-radius: 40px 50%;
  }
`

export const StyledPortalIcon = styled(Portal)`
  width: var(--iconWidth);
  height: var(--iconHeight);
`

const portalDoorShared = css`
  background-color: ${({ theme }) => theme.colors.black};
  line-height: 0px;

  border-top-right-radius: 44px 50%;
  border-bottom-right-radius: 44px 50%;
  border-top-left-radius: 44px 50%;
  border-bottom-left-radius: 44px 50%;

  ${({ theme }) => theme.media.up.md} {
    border-top-right-radius: 60px 50%;
    border-bottom-right-radius: 60px 50%;
    border-top-left-radius: 60px 50%;
    border-bottom-left-radius: 60px 50%;
  }
`

export const PortalDoorFirst = styled.div`
  ${portalDoorShared}
`

export const PortalDoorLast = styled.div`
  ${portalDoorShared}
  transform: scaleX(-1);
`

const sharedPortalGlow = css`
  position: absolute;
  height: var(--pathHeight);
  width: 61px;

  border-top-left-radius: 32px 50%;
  border-top-right-radius: 32px 50%;
  border-bottom-left-radius: 32px 50%;
  border-bottom-right-radius: 32px 50%;

  animation: 3s ${({ theme }) => theme.animation.portalGlow} ease-in-out
    infinite;

  ${({ theme }) => theme.media.up.md} {
    width: 89px;

    border-top-left-radius: 44px 50%;
    border-top-right-radius: 44px 50%;
    border-bottom-left-radius: 44px 50%;
    border-bottom-right-radius: 44px 50%;
  }
`

export const PortalFirstGlow = styled.div`
  ${sharedPortalGlow}
  --portal-glow-color: ${({ theme }) => theme.colors.yellow};

  left: -41px;

  ${({ theme }) => theme.media.up.md} {
    left: -61px;
  }
`

export const PortalLastGlow = styled.div`
  ${sharedPortalGlow}
  --portal-glow-color: ${({ theme }) => theme.colors.green};

  right: -41px;

  ${({ theme }) => theme.media.up.md} {
    right: -61px;
  }
`

export const StyledCylinderShape = styled.div`
  ${({ theme }) => css`
    position: relative;
    overflow: hidden;
    width: 100%;
    height: var(--pathHeight);
    backdrop-filter: blur(2px);
    z-index: 5;
    background-image: linear-gradient(
      to top,
      rgb(255, 255, 255, 0.5) 0%,
      rgb(255, 255, 255, 0.35) 2%,
      rgb(255, 255, 255, 0.3) 3%,
      rgb(255, 255, 255, 0.25) 5%,
      rgb(255, 255, 255, 0.2) 10%,
      rgb(255, 255, 255, 0.1) 20%,
      rgb(255, 255, 255, 0.05) 30%,
      rgb(255, 255, 255, 0) 40%,
      rgb(255, 255, 255, 0) 60%,
      rgb(255, 255, 255, 0.05) 70%,
      rgb(255, 255, 255, 0.1) 80%,
      rgb(255, 255, 255, 0.2) 90%,
      rgb(255, 255, 255, 0.25) 95%,
      rgb(255, 255, 255, 0.3) 97%,
      rgb(255, 255, 255, 0.35) 98%,
      rgb(255, 255, 255, 0.5) 100%
    );

    border-top-left-radius: 32px 50%;
    border-bottom-left-radius: 32px 50%;
    border-top-right-radius: 32px 50%;
    border-bottom-right-radius: 32px 50%;

    ${theme.media.up.md} {
      border-top-left-radius: 44px 50%;
      border-bottom-left-radius: 44px 50%;
      border-top-right-radius: 44px 50%;
      border-bottom-right-radius: 44px 50%;
    }
  `}
`
