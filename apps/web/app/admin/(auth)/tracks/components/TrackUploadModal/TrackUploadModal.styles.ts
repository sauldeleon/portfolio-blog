import { Modal as ModalOverlays } from 'react-overlays'
import styled from 'styled-components'

import { Input } from '@sdlgr/input'

export const StyledBackdrop = styled.div`
  position: fixed;
  z-index: 1040;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.black};
  opacity: 0.7;
`

export const StyledModal = styled(ModalOverlays)`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 1050;

  ${({ theme }) => theme.media.up.md} {
    top: 20%;
    left: 50%;
    transform: translate(-50%, 0);
    height: auto;
    max-width: 520px;
  }
`

export const StyledModalContent = styled.div`
  background: ${({ theme }) => theme.colors.black};
  border: 1px solid ${({ theme }) => theme.colors.green};
  border-radius: 2px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  color: ${({ theme }) => theme.colors.white};
`

export const StyledModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
`

export const StyledDropzone = styled.div<{ $isDragActive: boolean }>`
  border: 2px dashed
    ${({ $isDragActive, theme }) =>
      $isDragActive ? theme.colors.green : 'rgba(251, 251, 251, 0.2)'};
  border-radius: 2px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  font-size: 0.8rem;
  opacity: 0.8;
`

export const StyledFileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const StyledField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.65rem;

  > span {
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
`

export const StyledNameInput = styled(Input)`
  font-size: 0.85rem;
`

export const StyledHint = styled.p`
  margin: 0;
  font-size: 0.7rem;
  opacity: 0.6;
  overflow-wrap: anywhere;
`

export const StyledError = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.orange};
`

export const StyledButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;

  > button {
    text-transform: uppercase;
  }
`
