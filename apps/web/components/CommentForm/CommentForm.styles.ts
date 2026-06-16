import styled from 'styled-components'

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const StyledFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

export const StyledLabel = styled.label`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.6;
`

export const StyledInput = styled.input`
  background: rgba(251, 251, 251, 0.04);
  border: 1px solid rgba(251, 251, 251, 0.12);
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.875rem;
  padding: 0.625rem 0.75rem;
  border-radius: 2px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.green};
  }

  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.colors.orange};
  }
`

export const StyledTextarea = styled.textarea`
  background: rgba(251, 251, 251, 0.04);
  border: 1px solid rgba(251, 251, 251, 0.12);
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.875rem;
  padding: 0.625rem 0.75rem;
  border-radius: 2px;
  width: 100%;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.green};
  }

  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.colors.orange};
  }
`

export const StyledError = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.orange};
`

export const StyledSuccess = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.green};
  padding: 0.75rem 0;
`

export const StyledHoneypot = styled.input`
  display: none;
`

export const StyledTurnstileWrapper = styled.div`
  margin-top: 0.25rem;
`

export const StyledReplyBanner = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.green};
  background: rgba(152, 223, 214, 0.08);
  border: 1px solid rgba(152, 223, 214, 0.2);
  border-radius: 2px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const StyledCancelReplyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
  padding: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    opacity: 1;
  }
`
