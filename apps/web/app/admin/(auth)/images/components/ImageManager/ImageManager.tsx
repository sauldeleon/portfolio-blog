'use client'

import {
  type InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import axios from 'axios'
import { useRef, useState } from 'react'

import { useDebounce } from '@sdlgr/blog-filters'

import { useInfiniteScroll } from '@web/app/admin/(auth)/hooks/useInfiniteScroll'
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
  StyledSearchInput,
  StyledTitle,
  StyledToolbar,
  StyledUploadButton,
  StyledWrapper,
} from './ImageManager.styles'

const QUERY_KEY = ['admin-images'] as const
const SEARCH_DEBOUNCE_MS = 300

interface ImagesPage {
  images: CloudinaryImage[]
  nextCursor?: string
}

type ImagesData = InfiniteData<ImagesPage, string | undefined>

/** Applies `update` to the images of every loaded page, in every search. */
function updateImages(
  old: ImagesData | undefined,
  update: (images: CloudinaryImage[], pageIndex: number) => CloudinaryImage[],
): ImagesData | undefined {
  /* istanbul ignore next */
  if (!old) return old
  return {
    ...old,
    pages: old.pages.map((page, i) => ({
      ...page,
      images: update(page.images, i),
    })),
  }
}

export function ImageManager() {
  const { t } = useClientTranslation('admin')
  const queryClient = useQueryClient()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)
  const [renameError, setRenameError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Same paging as the post editor's image picker: Cloudinary pages by
  // cursor, so the list grows as the end scrolls into view.
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [...QUERY_KEY, debouncedSearch],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (pageParam) params.set('cursor', pageParam)
      const qs = params.toString()
      const { data } = await axios.get<ImagesPage>(
        `/api/images/${qs ? `?${qs}` : ''}`,
      )
      return data
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    // Keep showing the current images while a new search loads.
    placeholderData: keepPreviousData,
  })

  useInfiniteScroll(sentinelRef, () => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  })

  const seen = new Set<string>()
  const images = (data?.pages.flatMap((page) => page.images) ?? []).filter(
    (img) => {
      if (seen.has(img.publicId)) return false
      seen.add(img.publicId)
      return true
    },
  )

  const displayError = !isLoading
    ? isError
      ? t('images.listError')
      : (deleteError ?? null)
    : null

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
      queryClient.setQueriesData<ImagesData>({ queryKey: QUERY_KEY }, (old) =>
        updateImages(old, (images) =>
          images.map((img) => (img.publicId === publicId ? updated : img)),
        ),
      )
      setEditTargetId(null)
      setRenameError(null)
    },
    onError: () => {
      setRenameError(t('images.renameModal.error'))
    },
  })

  function handleUploaded(image: CloudinaryImage) {
    queryClient.setQueriesData<ImagesData>({ queryKey: QUERY_KEY }, (old) =>
      updateImages(old, (images, i) => (i === 0 ? [image, ...images] : images)),
    )
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
      queryClient.setQueriesData<ImagesData>({ queryKey: QUERY_KEY }, (old) =>
        updateImages(old, (images) =>
          images.filter((img) => img.publicId !== id),
        ),
      )
    } catch {
      setDeleteError(t('images.deleteError'))
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
        <StyledToolbar>
          <StyledSearchInput
            type="search"
            placeholder={t('images.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="search-input"
          />
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
        </StyledToolbar>
      </StyledHeader>

      {isLoading && (
        <StyledLoading data-testid="loading-state">
          {t('images.picker.loading')}
        </StyledLoading>
      )}

      {displayError && (
        <StyledError data-testid="error-state">{displayError}</StyledError>
      )}

      {!isLoading &&
        !displayError &&
        images.length === 0 &&
        debouncedSearch === '' && (
          <StyledEmptyState data-testid="empty-state">
            {t('images.emptyState')}
          </StyledEmptyState>
        )}

      {!isLoading &&
        !displayError &&
        images.length === 0 &&
        debouncedSearch !== '' && (
          <StyledEmptyState data-testid="no-results-state">
            {t('images.noResults')}
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

      <div ref={sentinelRef} data-testid="image-list-end" />
      {isFetchingNextPage && (
        <StyledLoading data-testid="loading-more">
          {t('images.picker.loading')}
        </StyledLoading>
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
