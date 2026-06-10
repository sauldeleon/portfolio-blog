import styled from 'styled-components'

import { Button } from '@sdlgr/button'
import { Modal } from '@sdlgr/modal'

export const StyledModal = styled(Modal)`
  ${({ theme }) => theme.helpers.border.gradientShared}
  ${({ theme }) => theme.helpers.border.gradientBottom}
  border-radius: 0;

  ${({ theme }) => theme.media.up.md} {
    max-width: 520px;
  }
`

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
