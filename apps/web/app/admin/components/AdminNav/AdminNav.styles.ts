import Link from 'next/link'
import styled from 'styled-components'

export const StyledNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
`

export const StyledBrand = styled.span`
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: ${({ theme }) => theme.colors.green};
  margin-right: auto;
  padding-right: 2rem;
`

export const StyledNavLink = styled(Link)<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.6rem;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-decoration: none;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.green : theme.colors.white};
  opacity: ${({ $active }) => ($active ? 1 : 0.45)};
  border-bottom: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.green : 'transparent')};
  transition:
    color 0.15s,
    opacity 0.15s,
    border-color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.green};
    opacity: 1;
  }
`

export const StyledDivider = styled.span`
  width: 1px;
  height: 1rem;
  background: rgba(251, 251, 251, 0.1);
  margin: 0 0.5rem;
`

export const StyledLogoutButton = styled.button`
  background: transparent;
  border: none;
  padding: 0.375rem 0.75rem;
  font-family: inherit;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;
  cursor: pointer;
  transition:
    color 0.15s,
    opacity 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.orange};
    opacity: 1;
  }
`
