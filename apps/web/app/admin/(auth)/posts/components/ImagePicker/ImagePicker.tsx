'use client'

import axios from 'axios'
import Image from 'next/image'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { useClientTranslation } from '@web/i18n/client'
import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import {
  StyledCloseButton,
  StyledContent,
  StyledEmptyState,
  StyledGrid,
  StyledHeader,
  StyledImageItem,
  StyledImageMeta,
  StyledImageName,
  StyledImagePreview,
  StyledMetaRow,
  StyledSearch,
  StyledSearchWrapper,
  StyledSidebar,
  StyledTitle,
  StyledUploadError,
  StyledUploadSection,
  StyledUploadZone,
} from './ImagePicker.styles'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export interface ImagePickerProps {
  open: boolean
  onClose: () => void
  onPick: (image: CloudinaryImage) => void
  zIndex?: number
}

export function ImagePicker({
  open,
  onClose,
  onPick,
  zIndex = 900,
}: ImagePickerProps) {
  const { t } = useClientTranslation('admin')
  const inputId = useId()
  const [images, setImages] = useState<CloudinaryImage[]>([])
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const nextCursorRef = useRef<string | undefined>(undefined)
  const loadingMoreRef = useRef(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef(search)

  useEffect(() => {
    nextCursorRef.current = nextCursor
  }, [nextCursor])

  useEffect(() => {
    loadingMoreRef.current = loadingMore
  }, [loadingMore])

  useEffect(() => {
    searchRef.current = search
  }, [search])

  const fetchSearch = useCallback(async (term: string) => {
    setLoading(true)
    try {
      const { data } = await axios.get<{
        images: CloudinaryImage[]
        nextCursor?: string
      }>(`/api/images/?search=${encodeURIComponent(term)}`)
      setImages(data.images)
      setNextCursor(data.nextCursor)
    } catch {
      // leave images empty on error
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchImages = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get<{
        images: CloudinaryImage[]
        nextCursor?: string
      }>('/api/images/')
      setImages((prev) => {
        // Preserve images uploaded while this fetch was in flight
        const serverIds = new Set(data.images.map((img) => img.publicId))
        const freshUploads = prev.filter((img) => !serverIds.has(img.publicId))
        return [...freshUploads, ...data.images]
      })
      setNextCursor(data.nextCursor)
    } catch {
      // leave images empty on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
      searchTimerRef.current = null
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImages([])
    nextCursorRef.current = undefined
    if (searchRef.current.trim()) {
      void fetchSearch(searchRef.current.trim())
    } else {
      void fetchImages()
    }
  }, [open, fetchImages, fetchSearch])

  const loadMore = useCallback(async () => {
    const cursor = nextCursorRef.current
    /* istanbul ignore next */
    if (!cursor) return
    /* istanbul ignore next */
    if (loadingMoreRef.current) return
    setLoadingMore(true)
    loadingMoreRef.current = true
    try {
      const { data } = await axios.get<{
        images: CloudinaryImage[]
        nextCursor?: string
      }>(`/api/images/?cursor=${cursor}`)
      setImages((prev) => {
        const existingIds = new Set(prev.map((img) => img.publicId))
        return [
          ...prev,
          ...data.images.filter((img) => !existingIds.has(img.publicId)),
        ]
      })
      setNextCursor(data.nextCursor)
    } catch {
      // leave current images on error
    } finally {
      setLoadingMore(false)
      loadingMoreRef.current = false
    }
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    /* istanbul ignore next */
    if (!sentinel) return

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (
        entry.isIntersecting &&
        nextCursorRef.current &&
        !loadingMoreRef.current
      ) {
        void loadMore()
      }
    })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  async function handleUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
    try {
      const { data: uploaded } = await axios.post<CloudinaryImage>(
        '/api/upload',
        formData,
      )
      // Show immediately — Cloudinary indexing has latency
      setImages((prev) => [uploaded, ...prev])
      // Silent background refresh — always keep uploaded at top regardless of server sort
      void axios
        .get<{ images: CloudinaryImage[]; nextCursor?: string }>('/api/images/')
        .then(({ data }) => {
          setImages([
            uploaded,
            ...data.images.filter((img) => img.publicId !== uploaded.publicId),
          ])
          setNextCursor(data.nextCursor)
        })
        .catch(() => undefined)
    } catch {
      setUploadError(t('images.upload.error'))
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleUpload(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleUpload(file)
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setSearch(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      searchTimerRef.current = null
      setImages([])
      nextCursorRef.current = undefined
      if (value.trim()) {
        void fetchSearch(value.trim())
      } else {
        void fetchImages()
      }
    }, 300)
  }

  const displayImages = [...images].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <StyledSidebar
      $open={open}
      $zIndex={zIndex}
      data-testid="image-picker-sidebar"
    >
      <StyledHeader>
        <StyledTitle>{t('images.picker.title')}</StyledTitle>
        <StyledCloseButton
          onClick={onClose}
          data-testid="image-picker-close"
          aria-label="Close"
        >
          ✕
        </StyledCloseButton>
      </StyledHeader>
      <StyledUploadSection>
        <StyledUploadZone
          as="label"
          htmlFor={inputId}
          $active={isDragging}
          $uploading={uploading}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-testid="upload-dropzone"
        >
          {uploading
            ? t('images.upload.uploading')
            : isDragging
              ? t('images.upload.dropzoneActive')
              : t('images.upload.dropzone')}
        </StyledUploadZone>
        {uploadError && (
          <StyledUploadError data-testid="upload-error">
            {uploadError}
          </StyledUploadError>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          data-testid="upload-file-input"
        />
      </StyledUploadSection>
      <StyledSearchWrapper>
        <StyledSearch
          type="text"
          placeholder={t('images.picker.search')}
          value={search}
          onChange={handleSearchChange}
          data-testid="image-picker-search"
        />
      </StyledSearchWrapper>
      <StyledContent>
        {loading && (
          <StyledEmptyState data-testid="picker-loading">
            {t('images.picker.loading')}
          </StyledEmptyState>
        )}
        {!loading && displayImages.length === 0 && (
          <StyledEmptyState data-testid="picker-empty">
            {t('images.picker.empty')}
          </StyledEmptyState>
        )}
        {!loading && displayImages.length > 0 && (
          <StyledGrid>
            {displayImages.map((image) => (
              <StyledImageItem
                key={image.publicId}
                onClick={() => onPick(image)}
                data-testid="image-picker-item"
              >
                <StyledImagePreview>
                  <Image
                    src={image.url}
                    alt=""
                    width={image.width}
                    height={image.height}
                  />
                </StyledImagePreview>
                <StyledImageName
                  data-testid="image-name"
                  title={image.publicId.split('/').pop()}
                >
                  {image.publicId.split('/').pop()}
                </StyledImageName>
                <StyledImageMeta>
                  <StyledMetaRow>
                    {image.width}×{image.height}
                  </StyledMetaRow>
                  <StyledMetaRow>{formatBytes(image.bytes)}</StyledMetaRow>
                </StyledImageMeta>
              </StyledImageItem>
            ))}
          </StyledGrid>
        )}
        {loadingMore && (
          <StyledEmptyState data-testid="load-more-loading">
            {t('images.picker.loading')}
          </StyledEmptyState>
        )}
        <div ref={sentinelRef} data-testid="scroll-sentinel" />
      </StyledContent>
    </StyledSidebar>
  )
}
