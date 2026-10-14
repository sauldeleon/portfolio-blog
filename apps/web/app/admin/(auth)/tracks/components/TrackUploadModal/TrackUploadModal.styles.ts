import styled from 'styled-components'

import { Input } from '@sdlgr/input'

import { StyledAdminError } from '../../../components/AdminForm/AdminForm.styles'
import {
  StyledAdminBackdrop,
  StyledAdminDropzone,
  StyledAdminModal,
  StyledAdminModalContent,
  StyledAdminModalTitle,
} from '../../../components/AdminModal/AdminModal.styles'

export const StyledBackdrop = styled(StyledAdminBackdrop)``

export const StyledModal = styled(StyledAdminModal)``

export const StyledModalContent = styled(StyledAdminModalContent)`
  color: ${({ theme }) => theme.colors.white};
`

export const StyledModalTitle = styled(StyledAdminModalTitle)``

export const StyledDropzone = styled(StyledAdminDropzone)``

export const StyledFileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const StyledField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.65rem;

  > span {
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
`

export const StyledNameInput = styled(Input)`
  font-size: 0.85rem;
`

export const StyledHint = styled.p`
  margin: 0;
  font-size: 0.7rem;
  opacity: 0.6;
  overflow-wrap: anywhere;
`

export const StyledError = styled(StyledAdminError)``

export const StyledButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;

  > button {
    text-transform: uppercase;
  }
`
