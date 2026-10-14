import styled from 'styled-components'

import { StyledAdminBackLink } from '../../../components/AdminForm/AdminForm.styles'
import { StyledAdminEmpty } from '../../../components/AdminTable/AdminTable.styles'

export const StyledMessage = styled(StyledAdminEmpty)<{ $error?: boolean }>`
  color: ${({ theme, $error }) =>
    $error ? theme.colors.orange : theme.colors.white};
`

export const StyledBackLink = styled(StyledAdminBackLink)``
