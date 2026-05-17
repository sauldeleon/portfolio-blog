import { Modal as ModalOverlays } from 'react-overlays'
import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export type ModalVariant = 'danger' | 'warning'

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

export const StyledModal = styled(ModalOverlays)<{ $variant: ModalVariant }>`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 1040;
  border: 1px solid
    ${({ $variant, theme }) =>
      $variant === 'warning' ? theme.colors.green : theme.colors.orange};
  box-shadow: 0 0 16px 4px
    ${({ $variant }) =>
      $variant === 'warning'
        ? 'rgba(152, 223, 214, 0.5)'
        : 'rgba(176, 75, 47, 0.5)'};
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

export const StyledCancelButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  padding: 0.375rem 0.875rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    opacity: 1;
    border-color: rgba(251, 251, 251, 0.3);
  }
`

export const StyledConfirmButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})<{ $variant: ModalVariant }>`
  padding: 0.375rem 0.875rem;
  color: ${({ $variant, theme }) =>
    $variant === 'warning' ? theme.colors.green : theme.colors.orange};
  border-color: ${({ $variant, theme }) =>
    $variant === 'warning' ? theme.colors.green : theme.colors.orange};
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    box-shadow: 0 0 8px 1px
      ${({ $variant }) =>
        $variant === 'warning'
          ? 'rgba(152, 223, 214, 0.4)'
          : 'rgba(176, 75, 47, 0.4)'};
    border-color: ${({ $variant, theme }) =>
      $variant === 'warning' ? theme.colors.green : theme.colors.orange};
  }
`
