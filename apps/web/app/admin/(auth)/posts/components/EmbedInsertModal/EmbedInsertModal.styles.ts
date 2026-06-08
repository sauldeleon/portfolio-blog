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

export const StyledEmbedInsertModal = styled(ModalOverlays)`
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

  ${({ theme }) => theme.media.up.md} {
    top: 5vh;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: auto;
    max-width: min(600px, 90vw);
    max-height: 90vh;
    overflow: hidden;
  }
`

export const StyledModalContent = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

export const StyledSegmentRow = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
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

export const StyledPreview = styled.pre`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  font-size: 0.72rem;
  line-height: 1.5;
  margin: 0;
  max-height: 5rem;
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
