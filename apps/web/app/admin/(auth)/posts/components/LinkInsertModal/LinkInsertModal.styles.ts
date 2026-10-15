import styled from 'styled-components'

import { StyledAdminDialog } from '../../../components/AdminModal/AdminModal.styles'

// Same fields and buttons as the embed modal.
export {
  StyledBackdrop,
  StyledButtons,
  StyledCancelButton,
  StyledInput,
  StyledInsertButton,
  StyledLabel,
  StyledModalContent,
  StyledPreview,
} from '../EmbedInsertModal/EmbedInsertModal.styles'

export const StyledLinkInsertModal = styled(StyledAdminDialog).attrs({
  $maxWidth: 'min(520px, 90vw)',
  $placement: 'top' as const,
})``

export const StyledHint = styled.p`
  margin: 0;
  font-size: 0.72rem;
  opacity: 0.55;
  color: ${({ theme }) => theme.colors.white};
`
