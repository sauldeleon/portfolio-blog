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
    width: 100%;
    height: auto;
    max-width: 480px;
  }
`

export const StyledModalContent = styled.div`
  background: ${({ theme }) => theme.colors.black};
  border: 1px solid ${({ theme }) => theme.colors.green};
  border-radius: 2px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const StyledModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  color: ${({ theme }) => theme.colors.white};
`

export const StyledDropzone = styled.div<{ $isDragActive: boolean }>`
  border: 2px dashed
    ${({ $isDragActive, theme }) =>
      $isDragActive ? theme.colors.green : 'rgba(251, 251, 251, 0.2)'};
  border-radius: 2px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.7;
  font-size: 0.75rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.green};
    opacity: 1;
  }
`

export const StyledError = styled.p`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0;
`

export const StyledUploading = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.6;
  margin: 0;
  text-align: center;
`

export const StyledFileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const StyledFileName = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.7;
  margin: 0;
  word-break: break-all;
`

export const StyledNameInput = styled.input`
  background: transparent;
  border: 1px solid rgba(251, 251, 251, 0.2);
  border-radius: 2px;
  padding: 0.5rem 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.75rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    opacity: 0.4;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledUploadButton = styled(Button).attrs({
  variant: 'contained',
  size: 'sm',
})`
  align-self: flex-start;
  color: ${({ theme }) => theme.colors.green};
  border-color: ${({ theme }) => theme.colors.green};
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.green};
    color: ${({ theme }) => theme.colors.black};
  }
`
