'use client'

import { useState } from 'react'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { useClientTranslation } from '@web/i18n/client'
import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import {
  StyledActions,
  StyledBackdrop,
  StyledCancelButton,
  StyledCurrentName,
  StyledError,
  StyledModal,
  StyledModalContent,
  StyledModalTitle,
  StyledNameInput,
  StyledSaveButton,
} from './ImageEditModal.styles'

export interface ImageEditModalProps {
  isOpen: boolean
  image: CloudinaryImage | null
  isSaving: boolean
  error: string | null
  onClose: () => void
  onSave: (newName: string) => void
}

function getFilename(publicId: string): string {
  const lastSlash = publicId.lastIndexOf('/')
  return lastSlash === -1 ? publicId : publicId.slice(lastSlash + 1)
}

export function ImageEditModal({
  isOpen,
  image,
  isSaving,
  error,
  onClose,
  onSave,
}: ImageEditModalProps) {
  const { t } = useClientTranslation('admin')
  const [name, setName] = useState(image ? getFilename(image.publicId) : '')

  function handleClose() {
    setName('')
    onClose()
  }

  const currentName = image ? getFilename(image.publicId) : ''
  const isUnchanged = name.trim() === currentName
  const isEmpty = name.trim() === ''

  return (
    <StyledModal
      show={isOpen}
      onHide={handleClose}
      renderBackdrop={(props: RenderModalBackdropProps) => (
        <StyledBackdrop {...props} />
      )}
      aria-labelledby="image-edit-modal"
    >
      <StyledModalContent>
        <StyledModalTitle>{t('images.renameModal.title')}</StyledModalTitle>
        <StyledCurrentName data-testid="current-name">
          {currentName}
        </StyledCurrentName>
        <StyledNameInput
          data-testid="rename-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('images.renameModal.placeholder')}
          disabled={isSaving}
        />
        {error && <StyledError data-testid="rename-error">{error}</StyledError>}
        <StyledActions>
          <StyledSaveButton
            data-testid="rename-save-button"
            onClick={() => onSave(name.trim())}
            disabled={isSaving || isUnchanged || isEmpty}
          >
            {isSaving
              ? t('images.renameModal.saving')
              : t('images.renameModal.save')}
          </StyledSaveButton>
          <StyledCancelButton
            data-testid="rename-cancel-button"
            onClick={handleClose}
            disabled={isSaving}
          >
            {t('confirmDelete.cancel')}
          </StyledCancelButton>
        </StyledActions>
      </StyledModalContent>
    </StyledModal>
  )
}
