import styled from 'styled-components'

import { Button } from '@sdlgr/button'

import {
  StyledAdminBackdrop,
  StyledAdminDialog,
  StyledAdminModalBody,
} from '../../../components/AdminModal/AdminModal.styles'

export const StyledBackdrop = styled(StyledAdminBackdrop)``

export const StyledImageInsertModal = styled(StyledAdminDialog).attrs({
  $maxWidth: 'min(700px, 90vw)',
  $placement: 'top' as const,
})`
  ${({ theme }) => theme.media.up.md} {
    overflow: hidden;
  }
`

export const StyledModalContent = styled(StyledAdminModalBody)``

export const StyledLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.7;
  color: ${({ theme }) => theme.colors.white};
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

export const StyledImageSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  min-height: 64px;
`

export const StyledImageThumb = styled.img`
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
`

export const StyledImagePlaceholder = styled.div`
  flex: 1;
  font-size: 0.78rem;
  opacity: 0.35;
  color: ${({ theme }) => theme.colors.white};
`

export const StyledPickButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  border-color: rgba(128, 128, 128, 0.35);
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.72rem;
  opacity: 0.75;
  padding: 0.4rem 0.7rem;
  white-space: nowrap;
  margin-left: auto;

  &:hover:not(:disabled) {
    opacity: 1;
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledSegmentRow = styled.div`
  display: flex;
  gap: 0.35rem;
`

export const StyledSegmentButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})<{ $active: boolean }>`
  background: ${({ $active }) =>
    $active ? 'rgba(152, 223, 214, 0.12)' : 'rgba(255, 255, 255, 0.04)'};
  border-color: ${({ $active, theme }) =>
    $active ? theme.colors.green : 'rgba(255, 255, 255, 0.15)'};
  border-radius: 2px;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.green : theme.colors.white};
  font-size: 0.72rem;
  opacity: ${({ $active }) => ($active ? 1 : 0.55)};
  padding: 0.3rem 0.65rem;
  text-transform: capitalize;

  &:hover:not(:disabled) {
    opacity: 1;
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledCheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.85;
  color: ${({ theme }) => theme.colors.white};

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  input[type='checkbox'] {
    cursor: pointer;
    accent-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledPreview = styled.pre`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  font-size: 0.72rem;
  line-height: 1.5;
  margin: 0;
  max-height: 4rem;
  opacity: 0.7;
  overflow: auto;
  padding: 0.6rem 0.75rem;
  white-space: pre-wrap;
  word-break: break-all;
`

export const StyledPhotoMetaInputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
`

export const StyledPhotoMetaField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`

export const StyledButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.25rem;
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
