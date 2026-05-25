import styled from 'styled-components'

import { Button } from '@sdlgr/button'
import { Input } from '@sdlgr/input'

export const StyledAdminForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 480px;
`

export const StyledAdminFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

export const StyledAdminLabel = styled.label`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
`

export const StyledAdminInput = styled(Input)``

export const StyledAdminError = styled.p`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0;
`

export const StyledAdminActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 0.5rem;
`

export const StyledAdminSubmitButton = styled(Button).attrs({
  variant: 'inverted',
})`
  padding: 0.625rem 1.25rem;
  font-family: inherit;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const StyledAdminBackLink = styled.a`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.45;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    opacity: 0.8;
  }
`

export const StyledAdminPageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
  margin-bottom: 2rem;
`

export const StyledAdminFormHeading = styled.h1`
  font-size: 1.25rem;
  font-weight: 400;
  margin: 0;
  color: ${({ theme }) => theme.colors.white};
`
