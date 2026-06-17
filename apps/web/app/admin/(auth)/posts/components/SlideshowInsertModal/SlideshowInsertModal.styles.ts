import { Modal as ModalOverlays } from 'react-overlays'
import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledBackdrop = styled.div`
  position: fixed;
  z-index: 1040;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.black};
  opacity: 0.7;
`

export const StyledSlideshowInsertModal = styled(ModalOverlays)`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 1040;
  border: 1px solid ${({ theme }) => theme.colors.green};
  box-shadow: 0 0 16px 4px rgba(152, 223, 214, 0.5);
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.black};
  overflow-y: auto;

  ${({ theme }) => theme.media.up.md} {
    top: 5vh;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: auto;
    max-width: min(720px, 90vw);
    max-height: 90vh;
    overflow-y: auto;
  }
`

export const StyledModalContent = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const StyledModalTitle = styled.h2`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.green};
  margin: 0;
`

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

export const StyledSlideCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const StyledSlideCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const StyledSlideNumber = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.green};
  opacity: 0.8;
`

export const StyledSlideHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

export const StyledMoveButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  color: rgba(251, 251, 251, 0.35);
  border-color: transparent;
  font-size: 0.7rem;
  padding: 0.15rem 0.35rem;
  min-width: unset;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.white};
    border-color: rgba(251, 251, 251, 0.3);
  }

  &:disabled {
    opacity: 0.15;
    cursor: not-allowed;
  }
`

export const StyledRemoveSlideButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  color: rgba(251, 251, 251, 0.4);
  border-color: rgba(251, 251, 251, 0.15);
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.white};
    border-color: rgba(251, 251, 251, 0.5);
  }
`

export const StyledInsertBetweenRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.25rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.07);
  }
`

export const StyledInsertBetweenButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  border-color: rgba(152, 223, 214, 0.2);
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.65rem;
  opacity: 0.5;
  padding: 0.1rem 0.5rem;

  &:hover:not(:disabled) {
    opacity: 1;
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

export const StyledAddSlideButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  align-self: flex-start;
  border-color: rgba(152, 223, 214, 0.3);
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.72rem;
  opacity: 0.75;
  padding: 0.4rem 0.9rem;

  &:hover:not(:disabled) {
    opacity: 1;
    border-color: ${({ theme }) => theme.colors.green};
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
