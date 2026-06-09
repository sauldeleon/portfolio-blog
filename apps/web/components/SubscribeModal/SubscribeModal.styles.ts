import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledTriggerButton = styled(Button)`
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.black};
  }
`

export const StyledModalBody = styled.div`
  width: 100%;
`
