import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
`

export const StyledPageButton = styled(Button).attrs({ variant: 'ghost' })<{
  $current?: boolean
}>`
  ${({ theme }) => theme.typography.body.S}
  padding: 0.375rem 0.875rem;
  border-color: ${({ $current, theme }) =>
    $current ? theme.colors.green : 'rgba(251, 251, 251, 0.2)'};
  background: ${({ $current, theme }) =>
    $current ? theme.colors.green : 'transparent'};
  color: ${({ $current, theme }) =>
    $current ? theme.colors.black : theme.colors.white};
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.green};
    background: ${({ $current, theme }) =>
      $current ? theme.colors.green : 'rgba(152, 223, 214, 0.1)'};
  }

  &:disabled {
    opacity: 0.3;
  }
`
