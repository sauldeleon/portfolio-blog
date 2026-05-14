import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 480px;
`

export const StyledFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

export const StyledLabel = styled.label`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
`

export const StyledInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(251, 251, 251, 0.2);
  padding: 0.5rem 0;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.25;
  }

  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.green};
  }

  &[aria-readonly='true'] {
    opacity: 0.4;
    cursor: default;
  }
`

export const StyledTextarea = styled.textarea`
  background: transparent;
  border: 1px solid rgba(251, 251, 251, 0.2);
  border-radius: 2px;
  padding: 0.5rem;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.25;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledHelper = styled.p`
  font-size: 0.65rem;
  opacity: 0.35;
  margin: 0;
`

export const StyledError = styled.p`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0;
`

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 0.5rem;
`

export const StyledSubmitButton = styled(Button).attrs({ variant: 'inverted' })`
  padding: 0.625rem 1.25rem;
  font-family: inherit;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const StyledBackLink = styled.a`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.45;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    opacity: 0.8;
  }
`

export const StyledPageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
  margin-bottom: 2rem;
`

export const StyledHeading = styled.h1`
  font-size: 1.25rem;
  font-weight: 400;
  margin: 0;
  color: ${({ theme }) => theme.colors.white};
`
