import { Modal as ModalOverlays } from 'react-overlays'
import styled from 'styled-components'

/** Base pieces shared by the admin's upload modals. */

export const StyledAdminBackdrop = styled.div`
  position: fixed;
  z-index: 1040;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.black};
  opacity: 0.7;
`

export const StyledAdminModal = styled(ModalOverlays)`
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

export const StyledAdminModalContent = styled.div`
  background: ${({ theme }) => theme.colors.black};
  border: 1px solid ${({ theme }) => theme.colors.green};
  border-radius: 2px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const StyledAdminModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  color: ${({ theme }) => theme.colors.white};
`

export const StyledAdminDropzone = styled.div<{ $isDragActive: boolean }>`
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
