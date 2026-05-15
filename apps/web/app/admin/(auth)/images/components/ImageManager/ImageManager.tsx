'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'

import { useClientTranslation } from '@web/i18n/client'
import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal'
import { ImageCard } from '../ImageCard'
import { ImageEditModal } from '../ImageEditModal'
import { ImageUploadModal } from '../ImageUploadModal'
import {
  StyledActions,
  StyledEmptyState,
  StyledError,
  StyledGrid,
  StyledHeader,
  StyledLoading,
  StyledRefreshButton,
  StyledTitle,
  StyledUploadButton,
  StyledWrapper,
} from './ImageManager.styles'

const QUERY_KEY = ['admin-images'] as const

export function ImageManager() {
  const { t } = useClientTranslation('admin')
  const queryClient = useQueryClient()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)
  const [renameError, setRenameError] = useState<string | null>(null)

  const {
    data: images = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await axios.get<{ images: CloudinaryImage[] }>(
        '/api/images/',
      )
      return data.images
    },
  })

  const displayError =
    !isLoading && (isError || deleteError) ? t('images.upload.error') : null

  const editTarget = images.find((img) => img.publicId === editTargetId) ?? null

  const renameMutation = useMutation({
    mutationFn: async ({
      publicId,
      newName,
    }: {
      publicId: string
      newName: string
    }) => {
      const { data } = await axios.patch<CloudinaryImage>('/api/images/', {
        publicId,
        newName,
      })
      return data
    },
    onSuccess: (updated, { publicId }) => {
      queryClient.setQueryData<CloudinaryImage[]>(QUERY_KEY, (old) => {
        /* istanbul ignore next */
        if (!old) return []
        return old.map((img) => (img.publicId === publicId ? updated : img))
      })
      setEditTargetId(null)
      setRenameError(null)
    },
    onError: () => {
      setRenameError(t('images.renameModal.error'))
    },
  })

  function handleUploaded(image: CloudinaryImage) {
    queryClient.setQueryData<CloudinaryImage[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return [image]
      return [image, ...old]
    })
    setIsUploadOpen(false)
  }

  async function handleDeleteConfirm() {
    /* istanbul ignore next */
    if (!deleteTargetId) return
    const id = deleteTargetId
    setDeleteTargetId(null)
    try {
      const encodedId = id.split('/').map(encodeURIComponent).join('/')
      await axios.delete(`/api/images/${encodedId}/`)
      queryClient.setQueryData<CloudinaryImage[]>(QUERY_KEY, (old) => {
        /* istanbul ignore next */
        if (!old) return []
        return old.filter((img) => img.publicId !== id)
      })
    } catch {
      setDeleteError(t('images.upload.error'))
    }
  }

  function handleEditClose() {
    setEditTargetId(null)
    setRenameError(null)
    renameMutation.reset()
  }

  return (
    <StyledWrapper data-testid="image-manager">
      <StyledHeader>
        <StyledTitle>{t('images.title')}</StyledTitle>
        <StyledActions>
          <StyledRefreshButton
            variant="contained"
            size="sm"
            onClick={() => {
              setDeleteError(null)
              void refetch()
            }}
            data-testid="refresh-button"
          >
            {t('refresh')}
          </StyledRefreshButton>
          <StyledUploadButton
            variant="inverted"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            data-testid="upload-button"
          >
            {t('images.uploadButton')}
          </StyledUploadButton>
        </StyledActions>
      </StyledHeader>

      {isLoading && (
        <StyledLoading data-testid="loading-state">
          {t('images.picker.loading')}
        </StyledLoading>
      )}

      {displayError && (
        <StyledError data-testid="error-state">{displayError}</StyledError>
      )}

      {!isLoading && !displayError && images.length === 0 && (
        <StyledEmptyState data-testid="empty-state">
          {t('images.emptyState')}
        </StyledEmptyState>
      )}

      {!isLoading && !displayError && images.length > 0 && (
        <StyledGrid data-testid="image-grid">
          {images.map((image) => (
            <ImageCard
              key={image.publicId}
              image={image}
              onDelete={(publicId) => setDeleteTargetId(publicId)}
              onEdit={(publicId) => {
                setRenameError(null)
                renameMutation.reset()
                setEditTargetId(publicId)
              }}
            />
          ))}
        </StyledGrid>
      )}

      <ImageUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={handleUploaded}
      />

      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        message={t('images.deleteConfirm')}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteTargetId(null)}
      />

      <ImageEditModal
        key={editTargetId ?? 'closed'}
        isOpen={editTargetId !== null}
        image={editTarget}
        isSaving={renameMutation.isPending}
        error={renameError}
        onClose={handleEditClose}
        onSave={(newName) =>
          editTargetId &&
          renameMutation.mutate({ publicId: editTargetId, newName })
        }
      />
    </StyledWrapper>
  )
}
