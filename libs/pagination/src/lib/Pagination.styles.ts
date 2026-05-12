import styled from 'styled-components'

export const StyledNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

export const StyledPageButton = styled.button<{ $current?: boolean }>`
  padding: 0.25rem 0.75rem;
  border: 1px solid currentColor;
  background: ${({ $current }) => ($current ? 'currentColor' : 'transparent')};
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`
