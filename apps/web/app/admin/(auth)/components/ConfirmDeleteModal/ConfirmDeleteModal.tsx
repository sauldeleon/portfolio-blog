'use client'

import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { useClientTranslation } from '@web/i18n/client'

import {
  type ModalVariant,
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
  variant?: ModalVariant
}

export function ConfirmDeleteModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDeleteModalProps) {
  const { t } = useClientTranslation('admin')

  return (
    <StyledModal
      show={isOpen}
      onHide={onCancel}
      $variant={variant}
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
            $variant={variant}
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
