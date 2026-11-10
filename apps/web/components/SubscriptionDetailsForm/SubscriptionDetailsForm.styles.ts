import type { ElementType } from 'react'
import styled from 'styled-components'

import { Button } from '@sdlgr/button'

import {
  StyledAdminActions,
  StyledAdminError,
  StyledAdminFieldGroup,
  StyledAdminForm,
  StyledAdminInput,
  StyledAdminLabel,
  StyledAdminSubmitButton,
} from '@web/app/admin/(auth)/components/AdminForm/AdminForm.styles'
import { StyledAdminCancelButton } from '@web/app/admin/(auth)/components/AdminTable/AdminTable.styles'

import {
  StyledError,
  StyledFieldGroup,
  StyledForm,
  StyledInput,
  StyledLabel,
  StyledSuccessText,
} from '../SubscribeForm/SubscribeForm.styles'

const StyledActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`

/**
 * Shared react-select, restyled to match the boxed inputs of the public
 * subscribe forms (the library default is the admin's underlined look).
 */
const StyledPublicSelectField = styled.div`
  && .select__control {
    border: 1px solid rgba(251, 251, 251, 0.2);
    border-radius: 2px;
    padding: 0.625rem 0.75rem;
    transition: border-color 0.15s ease;

    &:hover,
    &.select__control--is-focused {
      border-color: #98dfd6;
    }
  }

  && .select__single-value,
  && .select__input-container,
  && .select__option {
    font-family: var(--font-roboto-mono);
    font-size: 0.9rem;
  }

  && .select__single-value {
    color: #fbfbfb;
  }
`

const StyledPublicSubmitButton = styled(Button).attrs({ variant: 'inverted' })``
const StyledPublicCancelButton = styled(Button).attrs({ variant: 'ghost' })``

const StyledAdminSuccess = styled(StyledAdminError)`
  color: ${({ theme }) => theme.colors.green};
`

export interface SubscriptionFormStyles {
  Form: ElementType
  FieldGroup: ElementType
  Label: ElementType
  Input: ElementType
  SelectField: ElementType
  Error: ElementType
  Success: ElementType
  Actions: ElementType
  SubmitButton: ElementType
  CancelButton: ElementType
}

/** Public pages: same pieces as the subscribe form. */
export const publicFormStyles: SubscriptionFormStyles = {
  Form: StyledForm,
  FieldGroup: StyledFieldGroup,
  Label: StyledLabel,
  Input: StyledInput,
  SelectField: StyledPublicSelectField,
  Error: StyledError,
  Success: StyledSuccessText,
  Actions: StyledActions,
  SubmitButton: StyledPublicSubmitButton,
  CancelButton: StyledPublicCancelButton,
}

/** Admin: same pieces as the other admin forms. */
export const adminFormStyles: SubscriptionFormStyles = {
  Form: StyledAdminForm,
  FieldGroup: StyledAdminFieldGroup,
  Label: StyledAdminLabel,
  Input: StyledAdminInput,
  SelectField: 'div',
  Error: StyledAdminError,
  Success: StyledAdminSuccess,
  Actions: StyledAdminActions,
  SubmitButton: StyledAdminSubmitButton,
  CancelButton: StyledAdminCancelButton,
}
