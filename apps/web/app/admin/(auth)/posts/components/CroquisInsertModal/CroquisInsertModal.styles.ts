import styled from 'styled-components'

import { Button } from '@sdlgr/button'

import {
  StyledAdminBackdrop,
  StyledAdminDialog,
  StyledAdminModalBody,
} from '../../../components/AdminModal/AdminModal.styles'

export const StyledBackdrop = styled(StyledAdminBackdrop)``

export const StyledCroquisModal = styled(StyledAdminDialog).attrs({
  $maxWidth: 'min(900px, 90vw)',
  $placement: 'top' as const,
})``

export const StyledModalContent = styled(StyledAdminModalBody)``

export const StyledSectionLabel = styled.p`
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.5;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`

export const StyledGpxRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: stretch;

  > *:first-child {
    flex: 1;
  }
`

export const StyledInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.45rem 0.75rem;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    opacity: 0.35;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledTextarea = styled.textarea`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  color: ${({ theme }) => theme.colors.white};
  font-family: monospace;
  font-size: 0.78rem;
  line-height: 1.5;
  padding: 0.6rem 0.75rem;
  width: 100%;
  min-height: 160px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledError = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0;
`

export const StyledParseButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  border-color: rgba(128, 128, 128, 0.35);
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.72rem;
  opacity: 0.75;
  padding: 0 0.7rem;
  white-space: nowrap;

  &:hover:not(:disabled) {
    opacity: 1;
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledThumbGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  flex: 1;
`

export const StyledThumbChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
`

export const StyledButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
`

export const StyledCancelButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  padding: 0.375rem 0.875rem;
  color: ${({ theme }) => theme.colors.white};
  border-color: rgba(255, 255, 255, 0.25);
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    opacity: 1;
    border-color: rgba(255, 255, 255, 0.5);
  }
`

export const StyledInsertButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  padding: 0.375rem 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.green};
  border-color: ${({ theme }) => theme.colors.green};

  &:hover:not(:disabled) {
    box-shadow: 0 0 8px 1px rgba(152, 223, 214, 0.4);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`
