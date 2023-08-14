import styled, { css } from 'styled-components'

import { CircleButtonIcon } from '@sdlgr/assets'
import { Body } from '@sdlgr/typography'

export const StyledCircleLink = styled.a<{ $size: number }>`
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  max-height: ${({ $size }) => `${$size}px`};

  &:hover {
    circle.loading {
      stroke: white;
      stroke-width: 6px;
      stroke-dasharray: 110;
      /* stroke-dashoffset: 110; */
      /* animation: clock-loading 1s steps(4, end) forwards; */
      stroke-dashoffset: 82;
      animation: clock-loading 0.5s steps(4, jump-none) forwards;
      transform: rotate(-90deg);
      transform-origin: center;
    }

    @keyframes clock-loading {
      0% {
        stroke-dashoffset: 82;
      }
      100% {
        stroke-dashoffset: 0;
      }
    }
  }
`
export const StyledIconWrapper = styled.div<{ $size: number }>`
  ${({ $size }) => css`
    position: relative;
    width: ${$size}px;
    height: ${$size}px;
  `}
`

export const StyledCircleButtonIcon = styled(CircleButtonIcon)`
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
`

export const StyledIconContent = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  display: flex;
`
export const StyledBody = styled(Body)`
  margin-left: 8px;
`
