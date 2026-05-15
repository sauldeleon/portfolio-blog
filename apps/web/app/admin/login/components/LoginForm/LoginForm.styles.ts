import styled from 'styled-components'

import { Button } from '@sdlgr/button'
import { Input } from '@sdlgr/input'

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

export const StyledLabel = styled.label`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.6;
`

export const StyledInputRow = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(251, 251, 251, 0.25);
  transition: border-color 0.2s;

  &:focus-within {
    border-bottom-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledInput = styled(Input)`
  flex: 1;
  border-bottom: none;
  padding: 0.625rem 0;
  font-size: 0.9rem;

  &::placeholder {
    opacity: 0.2;
  }

  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme.colors.black} inset;
    -webkit-text-fill-color: ${({ theme }) => theme.colors.white};
  }

  &:focus {
    border-bottom-color: transparent;
  }
`

export const StyledToggleButton = styled(Button).attrs({ variant: 'text' })`
  padding: 0.25rem;
  opacity: 0.4;
  font-size: 0.75rem;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: opacity 0.2s;

  &::after {
    display: none;
  }

  &:hover {
    opacity: 0.8;
  }
`

export const StyledError = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.orange};
  border: 1px solid ${({ theme }) => theme.colors.orange};
  padding: 0.625rem 0.875rem;
  margin: 0;
  letter-spacing: 0.04em;
`

export const StyledSubmitButton = styled(Button)`
  margin-top: 0.5rem;
  width: 100%;
  justify-content: center;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
`
