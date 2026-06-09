import styled from 'styled-components'

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 420px;
`

export const StyledFormHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

export const StyledTitle = styled.h2`
  font-family: var(--font-roboto-mono);
  font-weight: 400;
  color: #fbfbfb;
  font-size: 1.5rem;
  margin: 0;
`

export const StyledSubtitle = styled.p`
  font-family: var(--font-roboto-mono);
  font-weight: 300;
  color: rgba(251, 251, 251, 0.7);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.6;
`

export const StyledFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

export const StyledLabel = styled.label`
  font-family: var(--font-roboto-mono);
  font-weight: 500;
  color: #fbfbfb;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const StyledInput = styled.input`
  background: transparent;
  border: 1px solid rgba(251, 251, 251, 0.2);
  border-radius: 2px;
  color: #fbfbfb;
  font-family: var(--font-roboto-mono);
  font-size: 0.9rem;
  padding: 0.625rem 0.75rem;
  width: 100%;
  transition: border-color 0.15s ease;
  box-sizing: border-box;

  &:focus {
    border-color: #98dfd6;
    outline: none;
  }

  &::placeholder {
    color: rgba(251, 251, 251, 0.3);
  }

  &[aria-invalid='true'] {
    border-color: #b04b2f;
  }
`

export const StyledError = styled.p`
  font-family: var(--font-roboto-mono);
  font-size: 0.75rem;
  color: #b04b2f;
  margin: 0;
`

export const StyledHoneypot = styled.input`
  display: none;
`

export const StyledSuccessMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const StyledSuccessTitle = styled.p`
  font-family: var(--font-roboto-mono);
  font-weight: 500;
  color: #98dfd6;
  font-size: 1rem;
  margin: 0;
`

export const StyledSuccessText = styled.p`
  font-family: var(--font-roboto-mono);
  font-weight: 300;
  color: rgba(251, 251, 251, 0.7);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.6;
`

export const StyledTurnstileWrapper = styled.div`
  width: 100%;
  min-height: 65px;
`
