'use client'

import Image from 'next/image'
import { useState } from 'react'

import { useClientTranslation } from '@web/i18n/client'
import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import {
  StyledActions,
  StyledCard,
  StyledCopyButton,
  StyledDeleteButton,
  StyledEditButton,
  StyledFilename,
  StyledImageWrapper,
  StyledInfo,
  StyledMeta,
} from './ImageCard.styles'

export interface ImageCardProps {
  image: CloudinaryImage
  onDelete: (publicId: string) => void
  onEdit: (publicId: string) => void
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / 1024).toFixed(1)} KB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getFilename(publicId: string): string {
  const lastSlash = publicId.lastIndexOf('/')
  return lastSlash === -1 ? publicId : publicId.slice(lastSlash + 1)
}

export function ImageCard({ image, onDelete, onEdit }: ImageCardProps) {
  const { t } = useClientTranslation('admin')
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(image.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <StyledCard data-testid="image-card">
      <StyledImageWrapper>
        <Image
          src={image.url}
          alt=""
          width={image.width}
          height={image.height}
          data-testid="image-thumbnail"
        />
      </StyledImageWrapper>
      <StyledInfo>
        <StyledFilename title={image.publicId}>
          {getFilename(image.publicId)}
        </StyledFilename>
        <StyledMeta>
          {image.width}x{image.height}
        </StyledMeta>
        <StyledMeta>{formatBytes(image.bytes)}</StyledMeta>
        <StyledMeta>{formatDate(image.createdAt)}</StyledMeta>
      </StyledInfo>
      <StyledActions>
        <StyledCopyButton
          onClick={() => void handleCopy()}
          data-testid="copy-url-button"
        >
          {copied ? t('images.copied') : t('images.copyUrl')}
        </StyledCopyButton>
        <StyledEditButton
          onClick={() => onEdit(image.publicId)}
          data-testid="edit-button"
        >
          {t('images.rename')}
        </StyledEditButton>
        <StyledDeleteButton
          onClick={() => onDelete(image.publicId)}
          data-testid="delete-button"
        >
          {t('images.delete')}
        </StyledDeleteButton>
      </StyledActions>
    </StyledCard>
  )
}
