import styled from 'styled-components'

import { Textarea } from '@sdlgr/input'

import {
  StyledAdminActions,
  StyledAdminBackLink,
  StyledAdminError,
  StyledAdminFieldGroup,
  StyledAdminForm,
  StyledAdminFormHeading,
  StyledAdminInput,
  StyledAdminLabel,
  StyledAdminPageHeader,
  StyledAdminSubmitButton,
} from '../../../components/AdminForm/AdminForm.styles'

export const StyledForm = styled(StyledAdminForm)``

export const StyledFieldGroup = styled(StyledAdminFieldGroup)``

export const StyledLabel = styled(StyledAdminLabel)``

export const StyledInput = styled(StyledAdminInput)`
  &[aria-readonly='true'] {
    opacity: 0.4;
    cursor: default;
  }
`

export const StyledTextarea = styled(Textarea)`
  font-size: 0.875rem;
  min-height: 80px;
`

export const StyledHelper = styled.p`
  font-size: 0.65rem;
  opacity: 0.35;
  margin: 0;
`

export const StyledError = styled(StyledAdminError)``

export const StyledActions = styled(StyledAdminActions)``

export const StyledSubmitButton = styled(StyledAdminSubmitButton)``

export const StyledBackLink = styled(StyledAdminBackLink)``

export const StyledPageHeader = styled(StyledAdminPageHeader)``

export const StyledHeading = styled(StyledAdminFormHeading)``
