'use client'

import { useState } from 'react'

import { SubscribeForm } from '@web/components/SubscribeForm'

import {
  StyledModal,
  StyledModalBody,
  StyledTriggerButton,
} from './SubscribeModal.styles'

export interface SubscribeModalProps {
  lng: string
  buttonLabel: string
  buttonAriaLabel: string
  compact?: boolean
}

export function SubscribeModal({
  lng,
  buttonLabel,
  buttonAriaLabel,
  compact,
}: SubscribeModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <StyledTriggerButton
        variant="contained"
        onClick={() => setIsOpen(true)}
        aria-label={buttonAriaLabel}
        $compact={compact}
      >
        {buttonLabel}
      </StyledTriggerButton>

      <StyledModal isOpen={isOpen} setIsOpen={setIsOpen}>
        <StyledModalBody>
          <SubscribeForm lng={lng} />
        </StyledModalBody>
      </StyledModal>
    </>
  )
}
