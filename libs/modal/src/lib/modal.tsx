import React from 'react'

import { CloseIcon } from '@sdlgr/assets'

import {
  StyledBackdrop,
  StyledModal,
  StyledModalCloseButton,
  StyledModalContent,
} from './modal.styles'

export interface ModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactElement
}

export function Modal({ isOpen, setIsOpen, children }: ModalProps) {
  return (
    <StyledModal
      show={isOpen}
      onHide={() => setIsOpen(false)}
      renderBackdrop={(props) => <StyledBackdrop {...props} />}
      aria-labelledby="about-modal-label"
    >
      <StyledModalContent>
        <StyledModalCloseButton onClick={() => setIsOpen(false)}>
          <CloseIcon width={24} height={24} />
        </StyledModalCloseButton>
        {children}
      </StyledModalContent>
    </StyledModal>
  )
}

export default Modal
