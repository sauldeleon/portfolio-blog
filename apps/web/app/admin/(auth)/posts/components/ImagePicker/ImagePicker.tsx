'use client'

import axios from 'axios'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

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
}

export function ImagePicker({ open, onClose, onPick }: ImagePickerProps) {
  const { t } = useClientTranslation('admin')
  const [images, setImages] = useState<CloudinaryImage[]>([])
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const nextCursorRef = useRef<string | undefined>(undefined)
  const loadingMoreRef = useRef(false)

  useEffect(() => {
    nextCursorRef.current = nextCursor
  }, [nextCursor])

  useEffect(() => {
    loadingMoreRef.current = loadingMore
  }, [loadingMore])

  useEffect(() => {
    async function fetchImages() {
      setLoading(true)
      try {
        const { data } = await axios.get<{
          images: CloudinaryImage[]
          nextCursor?: string
        }>('/api/images/')
        setImages(data.images)
        setNextCursor(data.nextCursor)
      } catch {
        // leave images empty on error
      } finally {
        setLoading(false)
      }
    }
    void fetchImages()
  }, [])

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
      setImages((prev) => [...prev, ...data.images])
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

  const filtered = images.filter((img) =>
    img.publicId.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <StyledSidebar $open={open} data-testid="image-picker-sidebar">
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
      <StyledSearchWrapper>
        <StyledSearch
          type="text"
          placeholder={t('images.picker.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="image-picker-search"
        />
      </StyledSearchWrapper>
      <StyledContent>
        {loading && (
          <StyledEmptyState data-testid="picker-loading">
            {t('images.picker.loading')}
          </StyledEmptyState>
        )}
        {!loading && filtered.length === 0 && (
          <StyledEmptyState data-testid="picker-empty">
            {t('images.picker.empty')}
          </StyledEmptyState>
        )}
        {!loading && filtered.length > 0 && (
          <StyledGrid>
            {filtered.map((image) => (
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
                    style={{
                      objectFit: 'contain',
                      width: '100%',
                      height: '100%',
                    }}
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
