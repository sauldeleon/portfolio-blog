import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledFormatBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
`

export const StyledFormatButton = styled(Button).attrs({
  variant: 'label',
  type: 'button',
})`
  min-width: 2rem;
  padding: 0.25rem 0.5rem;
  font-family: inherit;
  font-size: 0.75rem;
  justify-content: center;
`

export const StyledFormatSeparator = styled.span`
  width: 1px;
  margin: 0.2rem 0.35rem;
  background: rgba(251, 251, 251, 0.15);
`
