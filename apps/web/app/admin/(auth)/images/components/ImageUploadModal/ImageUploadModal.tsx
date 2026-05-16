'use client'

import axios from 'axios'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { useClientTranslation } from '@web/i18n/client'
import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import {
  StyledBackdrop,
  StyledDropzone,
  StyledError,
  StyledFileInfo,
  StyledFileName,
  StyledModal,
  StyledModalContent,
  StyledModalTitle,
  StyledNameInput,
  StyledUploadButton,
  StyledUploading,
} from './ImageUploadModal.styles'

export interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploaded: (image: CloudinaryImage) => void
}

function stripExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot <= 0) return filename
  return filename.slice(0, lastDot)
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onUploaded,
}: ImageUploadModalProps) {
  const { t } = useClientTranslation('admin')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setPendingFile(null)
    setName('')
    setError(null)
    onClose()
  }

  async function handleUpload(file: File) {
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('altText', '')
    formData.append('name', name)

    try {
      const { data: result } = await axios.post<{
        publicId: string
        url: string
        width: number
        height: number
        format: string
        createdAt: string
        bytes: number
      }>('/api/upload/', formData)
      onUploaded({
        publicId: result.publicId,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        createdAt: result.createdAt,
        bytes: result.bytes,
      })
    } catch {
      setError(t('images.upload.error'))
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/gif': [],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return
      setPendingFile(file)
      setName(stripExtension(file.name))
    },
  })

  return (
    <StyledModal
      show={isOpen}
      onHide={handleClose}
      renderBackdrop={(props: RenderModalBackdropProps) => (
        <StyledBackdrop {...props} />
      )}
      aria-labelledby="image-upload-modal"
    >
      <StyledModalContent>
        <StyledModalTitle>{t('images.upload.title')}</StyledModalTitle>
        {uploading ? (
          <StyledUploading data-testid="uploading-state">
            {t('images.upload.uploading')}
          </StyledUploading>
        ) : pendingFile ? (
          <StyledFileInfo>
            <StyledFileName data-testid="selected-filename">
              {pendingFile.name}
            </StyledFileName>
            <StyledNameInput
              data-testid="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('images.upload.namePlaceholder')}
            />
            <StyledUploadButton
              data-testid="upload-submit-button"
              onClick={() => void handleUpload(pendingFile)}
            >
              {t('images.upload.uploadButton')}
            </StyledUploadButton>
          </StyledFileInfo>
        ) : (
          <StyledDropzone
            {...getRootProps()}
            $isDragActive={isDragActive}
            data-testid="dropzone"
          >
            <input {...getInputProps()} data-testid="dropzone-input" />
            {isDragActive
              ? t('images.upload.dropzoneActive')
              : t('images.upload.dropzone')}
          </StyledDropzone>
        )}
        {error && <StyledError data-testid="upload-error">{error}</StyledError>}
      </StyledModalContent>
    </StyledModal>
  )
}
