import { rgba } from 'polished'
import styled, { css } from 'styled-components'

import { SLLogo } from '@sdlgr/assets'
import { Link } from '@sdlgr/link'

export const StyledFooter = styled.footer`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 120px;
  margin-top: 50px;
`

export const StyledTopLines = styled.div`
  position: relative;
  width: 100%;
  height: 15px;
`
export const StyledSLLogo = styled(SLLogo)`
  position: absolute;
  top: -61px;
  left: 30px;
`

export const StyledBorderLine = styled.div`
  ${({ theme }) => css`
    height: 7px;
    width: 100%;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      width: 100%;
      height: 3px;
      background: linear-gradient(
        to bottom,
        ${rgba(theme.colors.black, 0.3)},
        ${rgba(theme.colors.green, 0.3)}
      );
    }
  `}
`

export const StyledInteractiveSection = styled.div<{
  $socialMediaIconsCount: number
}>`
  position: relative;
  max-width: 1440px;
  min-height: 120px;
  align-items: center;
  justify-content: unset;
  width: 100%;
  display: grid;
  padding: 30px;

  ${({ theme }) => theme.media.up.lg} {
    justify-content: space-between;
    grid-template-columns:
      1fr
      ${({ $socialMediaIconsCount }) =>
        20 * (2 * $socialMediaIconsCount - 1)}px;
  }
`

export const StyledNav = styled.nav`
  display: flex;
  align-items: center;
  position: relative;
`

export const StyledList = styled.ul`
  display: flex;
  align-items: center;
  flex-grow: 1;
  flex-direction: row;
  width: 100%;
  gap: 30px;
  flex-wrap: wrap;
`

export const StyledNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover,
  &:focus {
    text-decoration: none;
  }

  ${({ theme }) => theme.media.up.md} {
    display: flex;
    position: relative;

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
      transition: transform 0.25s ease-out;
    }
    &:hover::after {
      transform: scaleX(1);
      transform-origin: bottom left;
    }
  }
`

export const StyledSocialMediaIcons = styled.div`
  height: 20px;
  display: flex;
  gap: 20px;
  justify-self: end;
  padding: 30px 0;

  ${({ theme }) => theme.media.up.lg} {
    justify-self: end;
    padding: 0;
  }
`

export const StyledSocialMediaLink = styled(Link)``
