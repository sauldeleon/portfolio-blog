import styled, { css } from 'styled-components'

import { CircleButtonIcon } from '@sdlgr/assets'
import { Link } from '@sdlgr/link'
import { Body } from '@sdlgr/typography'

export const StyledBody = styled(Body)`
  margin-left: 8px;
  position: relative;

  &:hover,
  &:focus {
    text-decoration: none;
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: ${({ theme }) => theme.colors.white};
    transform-origin: bottom right;
    transition: transform 0.5s ease-out;
  }
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

    ${StyledBody} {
      &::after {
        transform: scaleX(1);
        transform-origin: bottom left;
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
