import styled from 'styled-components'

import { SLLogo } from '@sdlgr/assets'
import { Link } from '@sdlgr/link'
import { Body } from '@sdlgr/typography'

export const StyledNav = styled.nav`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  height: 130px;
  max-width: 1440px;
  width: 100%;
  padding: 0 15px;
  margin: 0 auto;
  display: flex;
  justify-items: center;
  align-items: end;

  ${({ theme }) => theme.media.up.md} {
    align-items: center;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.white};
    height: 115px;
  }

  ${({ theme }) => theme.media.up.lg} {
    padding: 0 30;
  }

  ${({ theme }) => theme.media.up.xl} {
    padding: 0;
  }
`
export const StyledLogoLink = styled(Link)`
  display: flex;
`

export const StyledNavLink = styled(Link)`
  display: flex;

  ${({ theme }) => theme.media.up.md} {
    display: unset;
  }
`

export const StyledSLLogo = styled(SLLogo)`
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 25px;

  ${({ theme }) => theme.media.up.md} {
    color: ${({ theme }) => theme.colors.white};
    margin-bottom: 0;
  }
`

export const StyledList = styled.ul`
  display: flex;
  align-items: end;
  flex-grow: 1;
  justify-content: center;
  height: 100%;

  ${({ theme }) => theme.media.up.md} {
    gap: 30px;
    align-items: center;
    height: unset;
  }
`

export const StyledListItem = styled.li<{ $hideOnDesktop?: boolean }>`
  width: 59px;
  display: flex;
  justify-content: center;
  height: 100%;
  padding-bottom: 25px;

  ${Body} {
    ${({ theme }) => theme.typography.body.XS}
    color: ${({ theme }) => theme.colors.black};
    writing-mode: tb-rl;
    transform: rotate(-180deg);
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.black};
    cursor: pointer;

    ${Body} {
      color: ${({ theme }) => theme.colors.white};
    }
  }

  ${({ theme }) => theme.media.up.md} {
    ${({ $hideOnDesktop }) => $hideOnDesktop && `display: none`};
    width: auto;
    padding-bottom: 0;

    ${Body} {
      ${({ theme }) => theme.typography.body.M}
      color: ${({ theme }) => theme.colors.white};
      writing-mode: unset;
      transform: unset;
    }
  }
`
