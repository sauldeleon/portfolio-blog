import styled from 'styled-components'

import {
  StyledAdminActions,
  StyledAdminBackLink,
  StyledAdminError,
  StyledAdminFieldGroup,
  StyledAdminForm,
  StyledAdminFormHeading,
  StyledAdminInput,
  StyledAdminPageHeader,
  StyledAdminSubmitButton,
} from '../../../components/AdminForm/AdminForm.styles'

export const StyledForm = styled(StyledAdminForm)``

export const StyledFieldGroup = styled(StyledAdminFieldGroup)`
  label {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.5;
  }
`

export const StyledInput = styled(StyledAdminInput)``

export const StyledError = styled(StyledAdminError)``

export const StyledActions = styled(StyledAdminActions)``

export const StyledSubmitButton = styled(StyledAdminSubmitButton)``

export const StyledBackLink = styled(StyledAdminBackLink)``

export const StyledPageHeader = styled(StyledAdminPageHeader)``

export const StyledHeading = styled(StyledAdminFormHeading)``
