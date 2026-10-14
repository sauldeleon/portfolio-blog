import styled from 'styled-components'

import { Button } from '@sdlgr/button'

import {
  StyledAdminBackdrop,
  StyledAdminModal,
  StyledAdminModalContent,
  StyledAdminModalTitle,
} from '../../../components/AdminModal/AdminModal.styles'

export const StyledBackdrop = styled(StyledAdminBackdrop)``

export const StyledModal = styled(StyledAdminModal).attrs({
  $maxWidth: '420px',
})``

export const StyledModalContent = styled(StyledAdminModalContent)`
  gap: 1.25rem;
`

export const StyledModalTitle = styled(StyledAdminModalTitle)``

export const StyledCurrentName = styled.p`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.45;
  margin: 0;
  word-break: break-all;
`

export const StyledNameInput = styled.input`
  background: transparent;
  border: 1px solid rgba(251, 251, 251, 0.2);
  border-radius: 2px;
  padding: 0.5rem 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.75rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    opacity: 0.4;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

export const StyledSaveButton = styled(Button).attrs({
  variant: 'contained',
  size: 'sm',
  colorScheme: 'success',
})`
  transition:
    background 0.15s,
    color 0.15s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.green};
    color: ${({ theme }) => theme.colors.black};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

export const StyledCancelButton = styled(Button).attrs({
  variant: 'contained',
  size: 'sm',
})`
  border-color: rgba(251, 251, 251, 0.2);
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
`

export const StyledError = styled.p`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0;
`
