import styled from 'styled-components'

export const StyledNav = styled.nav`
  padding: 1rem 1.25rem;
  border: 1px solid rgba(251, 251, 251, 0.1);
`

export const StyledTitle = styled.p`
  font-family: var(--font-roboto-mono, monospace);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.5;
  margin: 0 0 0.75rem;
`

export const StyledList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

export const StyledLink = styled.a<{ $depth: number; $active: boolean }>`
  display: block;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.green : theme.colors.white};
  text-decoration: none;
  padding-left: ${({ $depth }) => ($depth - 2) * 0.75}rem;
  opacity: ${({ $active }) => ($active ? 1 : 0.6)};
  transition:
    color 0.15s,
    opacity 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.green};
    opacity: 1;
  }
`
