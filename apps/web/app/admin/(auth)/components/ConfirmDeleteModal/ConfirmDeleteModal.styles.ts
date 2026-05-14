import { Modal as ModalOverlays } from 'react-overlays'
import styled from 'styled-components'

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
  z-index: 1040;
  border: 1px solid ${({ theme }) => theme.colors.orange};
  box-shadow: 0 0 16px 4px rgba(176, 75, 47, 0.5);
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.black};

  ${({ theme }) => theme.media.up.md} {
    top: 30%;
    left: 50%;
    transform: translate(-51%, -40%);
    width: 100%;
    height: auto;
    max-width: 360px;
  }
`

export const StyledModalContent = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const StyledMessage = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.8;
  margin: 0;
`

export const StyledButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`

const actionButtonBase = `
  background: transparent;
  border: 1px solid transparent;
  padding: 0.375rem 0.875rem;
  font-family: inherit;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;
`

export const StyledCancelButton = styled.button`
  ${actionButtonBase}
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;

  &:hover {
    opacity: 1;
    border-color: rgba(251, 251, 251, 0.3);
  }
`

export const StyledConfirmButton = styled.button`
  ${actionButtonBase}
  color: ${({ theme }) => theme.colors.orange};
  border-color: ${({ theme }) => theme.colors.orange};

  &:hover {
    box-shadow: 0 0 8px 1px rgba(176, 75, 47, 0.4);
  }
`
