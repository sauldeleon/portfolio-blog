import styled from 'styled-components'

import { Button } from '@sdlgr/button'

import {
  StyledAdminBackdrop,
  StyledAdminDialog,
  StyledAdminModalBody,
} from '../AdminModal/AdminModal.styles'

export const StyledBackdrop = styled(StyledAdminBackdrop)``

export const StyledModal = styled(StyledAdminDialog).attrs({
  $maxWidth: '580px',
  $placement: 'center' as const,
})``

export const StyledModalContent = styled(StyledAdminModalBody)`
  gap: 1.5rem;
`

export const StyledMessage = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.8;
  margin: 0;
`

export const StyledButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
`

export const StyledCancelButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  padding: 0.375rem 0.875rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    opacity: 1;
    border-color: rgba(251, 251, 251, 0.3);
  }
`

export const StyledPublishOnlyButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  padding: 0.375rem 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    border-color: rgba(251, 251, 251, 0.3);
  }
`

export const StyledPublishAndNotifyButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
  colorScheme: 'success',
})`
  padding: 0.375rem 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    box-shadow: 0 0 8px 1px rgba(152, 223, 214, 0.4);
  }
`
