import styled from 'styled-components'

import {
  StyledAdminBackdrop,
  StyledAdminModal,
  StyledAdminModalContent,
  StyledAdminModalTitle,
} from '../../../components/AdminModal/AdminModal.styles'

// Same frame as the other admin edit modals (e.g. image rename).
export const StyledBackdrop = styled(StyledAdminBackdrop)``

export const StyledModal = styled(StyledAdminModal).attrs({
  $maxWidth: '420px',
})``

export const StyledBody = styled(StyledAdminModalContent)`
  gap: 1.25rem;
`

export const StyledTitle = styled(StyledAdminModalTitle)``

export const StyledEmail = styled.p`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.45;
  margin: 0;
  word-break: break-all;
`
