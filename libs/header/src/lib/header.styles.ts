import styled, { css } from 'styled-components'

import { Link } from '@sdlgr/link'
import { Body } from '@sdlgr/typography'

export const StyledNav = styled.nav`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  height: 130px;
  max-width: 1440px;
  width: 100%;
  padding: 0 10px;
  margin: 0 auto;
  display: flex;
  justify-items: center;
  align-items: end;
  overflow-x: auto;

  ${({ theme }) => theme.media.up.md} {
    align-items: center;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.white};
    height: 115px;
    padding: 0 10px;
  }

  ${({ theme }) => theme.media.up.lg} {
    padding: 0 30px;
  }
`

export const StyledNavLink = styled(Link)<{ $isActive: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: 25px;

  &::after {
    content: none;
  }

  ${({ theme }) => theme.media.up.md} {
    position: relative;
    padding-bottom: 0;

    ${({ theme }) => theme.helpers.textBottomBorder.afterShared}
    ${({ $isActive, theme }) =>
      !$isActive && theme.helpers.textBottomBorder.transform()}
  }
`

export const StyledList = styled.ul`
  display: flex;
  align-items: end;
  flex-grow: 1;
  justify-content: space-around;
  height: 100%;
  overflow-x: visible;

  ${({ theme }) => theme.media.up.md} {
    gap: 30px;
    align-items: center;
    justify-content: center;
    height: unset;
  }
`

export const StyledListItem = styled.li<{
  $hideOnDesktop?: boolean
  $isActive: boolean
}>`
  width: 59px;
  display: flex;
  justify-content: center;
  height: 100%;

  ${({ $isActive }) =>
    $isActive &&
    css`
      background-color: ${({ theme }) => theme.colors.black};
    `}

  ${Body} {
    ${({ theme }) => theme.typography.body.XS}
    color: ${({ theme }) => theme.colors.black};
    writing-mode: tb-rl;
    transform: rotate(-180deg);

    ${({ $isActive }) =>
      $isActive &&
      css`
        color: ${({ theme }) => theme.colors.white};
      `}
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.black};
    cursor: pointer;

    ${Body} {
      color: ${({ theme }) => theme.colors.white};
    }
  }

  ${({ theme }) => theme.media.up.md} {
    ${({ $hideOnDesktop }) =>
      $hideOnDesktop &&
      css`
        display: none;
      `};
    width: auto;
    padding-bottom: 0;

    ${Body} {
      ${({ theme }) => theme.typography.body.M}
      color: ${({ theme }) => theme.colors.white};
      writing-mode: unset;
      transform: unset;

      ${({ $isActive, theme }) =>
        $isActive && theme.helpers.textBottomBorder.afterShared}
    }
  }
`
