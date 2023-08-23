import styled, { css } from 'styled-components'

import { CircleButtonIcon } from '@sdlgr/assets'
import { Link } from '@sdlgr/link'
import { Body } from '@sdlgr/typography'

const underlineAnimationDuration = 0.5

export const StyledBody = styled(Body)`
  margin-left: 8px;
  position: relative;

  &:hover,
  &:focus {
    text-decoration: none;
  }

  ${({ theme }) => theme.helpers.textBottomBorder.shared}
  ${({ theme }) =>
    theme.helpers.textBottomBorder.after(underlineAnimationDuration)}
`

export const StyledCircleLink = styled(Link)<{ $size: number }>`
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  max-height: ${({ $size }) => `${$size}px`};

  &:hover,
  &:focus {
    text-decoration: none;
  }

  &:hover {
    circle.loading {
      stroke: white;
      stroke-width: 6px;
      stroke-dasharray: 110;
      stroke-dashoffset: 82;
      animation: ${({ theme }) => theme.animation['clock-loading']}
        ${underlineAnimationDuration}s steps(4, jump-none) forwards;
      transform: rotate(-90deg);
      transform-origin: center;
    }

    ${StyledBody} {
      ${({ theme }) => theme.helpers.textBottomBorder.hoverAfter}
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
