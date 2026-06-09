'use client'

import { useState } from 'react'

import { Modal } from '@sdlgr/modal'

import { SubscribeForm } from '@web/components/SubscribeForm'

import { StyledModalBody, StyledTriggerButton } from './SubscribeModal.styles'

export interface SubscribeModalProps {
  lng: string
  buttonLabel: string
  buttonAriaLabel: string
}

export function SubscribeModal({
  lng,
  buttonLabel,
  buttonAriaLabel,
}: SubscribeModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <StyledTriggerButton
        variant="contained"
        onClick={() => setIsOpen(true)}
        aria-label={buttonAriaLabel}
      >
        {buttonLabel}
      </StyledTriggerButton>

      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <StyledModalBody>
          <SubscribeForm lng={lng} />
        </StyledModalBody>
      </Modal>
    </>
  )
}
