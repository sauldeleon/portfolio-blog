import { rgba } from 'polished'
import styled, { css } from 'styled-components'

import { Portal } from '@sdlgr/assets'

export const StyledPortals = styled.div`
  z-index: 2;
  width: 147%;
  top: -34%;
  left: -24%;
  position: absolute;
  display: flex;
  justify-content: space-between;
  transform: rotate(90deg);

  ${({ theme }) => theme.media.up.md} {
    width: 152%;
    top: unset;
    left: -26%;
    margin: 18px auto;
    transform: unset;
  }
`

export const StyledPortalIcon = styled(Portal)`
  width: 130px;
  height: 249px;

  ${({ theme }) => theme.media.up.md} {
    width: unset;
    height: unset;
  }
`

export const PortalFirst = styled.div`
  background-color: ${({ theme }) => theme.colors.black};
  border-top-right-radius: 42px 50%;
  border-bottom-right-radius: 44px 50%;
  border-top-left-radius: 44px 50%;
  border-bottom-left-radius: 44px 50%;
  margin-bottom: 5px;
  line-height: 0px;

  ${({ theme }) => theme.media.up.md} {
    background-color: ${({ theme }) => theme.colors.black};
    border-top-right-radius: 59px 50%;
    border-bottom-right-radius: 61px 50%;
    border-top-left-radius: 62px 50%;
    border-bottom-left-radius: 62px 50%;
  }
`
export const PortalFirstGlow = styled.div`
  position: absolute;
  height: 212px;
  width: 62px;
  left: -43px;
  top: 2px;
  border-top-left-radius: 35px 50%;
  border-top-right-radius: 32px 50%;
  border-bottom-left-radius: 32px 50%;
  border-bottom-right-radius: 32px 50%;
  animation: 3s portal-first-glow ease-in-out infinite;

  @keyframes portal-first-glow {
    0% {
      box-shadow: inset 0px 0px 13px 1px ${({ theme }) => theme.colors.yellow};
    }
    50% {
      box-shadow: inset 0px 0px 20px 1px ${({ theme }) => theme.colors.yellow};
    }
    100% {
      box-shadow: inset 0px 0px 13px 1px ${({ theme }) => theme.colors.yellow};
    }
  }

  ${({ theme }) => theme.media.up.md} {
    height: 309px;
    width: 92px;
    left: -65px;
    top: -2px;
    border-top-left-radius: 44px 50%;
    border-top-right-radius: 45px 50%;
    border-bottom-left-radius: 42px 50%;
    border-bottom-right-radius: 43px 50%;
  }
`
export const PortalLastGlow = styled.div`
  position: absolute;
  height: 213px;
  width: 62px;
  right: -41px;
  top: -3px;
  border-top-left-radius: 34px 50%;
  border-top-right-radius: 29px 50%;
  border-bottom-left-radius: 28px 49%;
  border-bottom-right-radius: 28px 50%;

  animation: 3s portal-last-glow ease-in-out infinite;

  @keyframes portal-last-glow {
    0% {
      box-shadow: inset 0px 0px 13px 1px ${({ theme }) => theme.colors.green};
    }
    50% {
      box-shadow: inset 0px 0px 20px 1px ${({ theme }) => theme.colors.green};
    }
    100% {
      box-shadow: inset 0px 0px 13px 1px ${({ theme }) => theme.colors.green};
    }
  }

  ${({ theme }) => theme.media.up.md} {
    height: 308px;
    width: 89px;
    right: -63px;
    top: -1px;
    border-top-left-radius: 46px 50%;
    border-top-right-radius: 51px 50%;
    border-bottom-left-radius: 51px 50%;
    border-bottom-right-radius: 51px 50%;
  }
`

export const PortalLast = styled.div`
  border-top-right-radius: 41px 50%;
  border-bottom-right-radius: 44px 50%;
  border-top-left-radius: 43px 50%;
  border-bottom-left-radius: 45px 50%;

  background-color: ${({ theme }) => theme.colors.black};

  margin-bottom: 5px;
  line-height: 0px;
  transform: scaleX(-1);

  ${({ theme }) => theme.media.up.md} {
    border-top-right-radius: 59px 50%;
    border-bottom-right-radius: 62px 50%;
    border-top-left-radius: 61px 50%;
    border-bottom-left-radius: 63px 50%;
  }
`

export const StyledCylinderShape = styled.div`
  ${({ theme }) => css`
    position: relative;
    overflow: hidden;
    width: 100%;
    z-index: 5;
    height: 212px;
    border-top-left-radius: 30px 50%;
    border-bottom-left-radius: 30px 50%;
    border-top-right-radius: 31px 50%;
    border-bottom-right-radius: 32px 50%;
    /* background-image: linear-gradient(
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
    ); */

    ${theme.media.up.md} {
      height: 305px;
      border-top-left-radius: 45px 50%;
      border-bottom-left-radius: 45px 50%;
      border-top-right-radius: 40px 50%;
      border-bottom-right-radius: 40px 50%;
    }
  `}
`

export const PortalPath = styled.div`
  ${({ theme }) => css`
    position: absolute;
    overflow: hidden;
    margin: 30px auto;
    height: 212px;
    border-top-left-radius: 30px 50%;
    border-bottom-left-radius: 30px 50%;
    border-top-right-radius: 31px 50%;
    border-bottom-right-radius: 32px 50%;
    top: -12px;
    left: 62px;
    right: 61px;
    /* backdrop-filter: blur(2px); */
    /* background: linear-gradient(
        45deg,
        ${rgba(theme.colors.white, 0.1)},
        ${rgba(theme.colors.white, 0.01)}
      )
      border-box;

    background-size: 400% 400%;
    animation: gradient 5s ease infinite; */

    /* @keyframes gradient {
      0% {
        background-position: 0% 0%;
      }
      50% {
        background-position: 100% 100%;
      }
      100% {
        background-position: 0% 0%;
      }
    } */

    ${theme.media.up.md} {
      height: 305px;
      border-top-left-radius: 45px 50%;
      border-bottom-left-radius: 45px 50%;
      border-top-right-radius: 40px 50%;
      border-bottom-right-radius: 40px 50%;
      top: -4px;
      left: 91px;
      right: 91px;
    }
  `}
`
