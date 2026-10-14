import styled from 'styled-components'

import { Button } from '@sdlgr/button'

import {
  StyledAdminBackdrop,
  StyledAdminDropzone,
  StyledAdminModal,
  StyledAdminModalContent,
  StyledAdminModalTitle,
} from '../../../components/AdminModal/AdminModal.styles'

export const StyledBackdrop = styled(StyledAdminBackdrop)``

export const StyledModal = styled(StyledAdminModal)``

export const StyledModalContent = styled(StyledAdminModalContent)``

export const StyledModalTitle = styled(StyledAdminModalTitle)``

export const StyledDropzone = styled(StyledAdminDropzone)``

export const StyledError = styled.p`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0;
`

export const StyledUploading = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.6;
  margin: 0;
  text-align: center;
`

export const StyledFileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const StyledFileName = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.7;
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

export const StyledUploadButton = styled(Button).attrs({
  variant: 'contained',
  size: 'sm',
  colorScheme: 'success',
})`
  align-self: flex-start;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.green};
    color: ${({ theme }) => theme.colors.black};
  }
`
