'use client'

import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledBackdrop,
  StyledButtons,
  StyledCancelButton,
  StyledConfirmButton,
  StyledMessage,
  StyledModal,
  StyledModalContent,
} from './ConfirmDeleteModal.styles'

export interface ConfirmDeleteModalProps {
  isOpen: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const { t } = useClientTranslation('admin')

  return (
    <StyledModal
      show={isOpen}
      onHide={onCancel}
      renderBackdrop={(props: RenderModalBackdropProps) => (
        <StyledBackdrop {...props} />
      )}
      aria-labelledby="confirm-delete-modal"
    >
      <StyledModalContent>
        <StyledMessage>{message}</StyledMessage>
        <StyledButtons>
          <StyledCancelButton
            onClick={onCancel}
            data-testid="confirm-delete-cancel"
          >
            {t('confirmDelete.cancel')}
          </StyledCancelButton>
          <StyledConfirmButton
            onClick={onConfirm}
            data-testid="confirm-delete-confirm"
          >
            {t('confirmDelete.confirm')}
          </StyledConfirmButton>
        </StyledButtons>
      </StyledModalContent>
    </StyledModal>
  )
}
