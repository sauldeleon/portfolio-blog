import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledFilterNav = styled.nav`
  min-width: 0;
`

export const StyledFilterLabel = styled.span`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.6rem;
  line-height: 1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.42;
`

export const StyledChipList = styled.ul`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  max-width: 100%;
`

export const StyledChip = styled(Button).attrs({ variant: 'label' })``
