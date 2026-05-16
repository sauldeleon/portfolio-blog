import styled from 'styled-components'

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
  display: flex;
  align-items: center;
  gap: 0.2rem;
`

export const StyledRequiredMarker = styled.span`
  color: ${({ theme }) => theme.colors.green};
  opacity: 1;
  font-size: 0.65rem;
  line-height: 1;
`

export const StyledInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(251, 251, 251, 0.2);
  padding: 0.5rem 0;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.7rem;
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.25;
  }

  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledTextarea = styled.textarea`
  background: transparent;
  border: 1px solid rgba(251, 251, 251, 0.2);
  border-radius: 2px;
  padding: 0.5rem;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.8rem;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
  line-height: 1.6;

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
