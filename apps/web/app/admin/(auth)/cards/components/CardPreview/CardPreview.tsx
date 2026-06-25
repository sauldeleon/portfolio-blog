'use client'

import axios, { isAxiosError } from 'axios'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { Button } from '@sdlgr/button'

import { useClientTranslation } from '@web/i18n/client'
import { svgToPng } from '@web/lib/cards'

import {
  StyledActionBar,
  StyledError,
  StyledPreviewFrame,
  StyledSvgWrap,
  StyledUploadedLink,
  StyledWrapper,
} from './CardPreview.styles'

interface CardPreviewProps {
  svg: string
  /** Native width of the SVG canvas (e.g. 1600). */
  cardWidth: number
  /** Native height of the SVG canvas (e.g. 900). */
  cardHeight: number
  /** Base name (no extension) shared by the PNG download and Cloudinary upload. */
  filename?: string
  /** Disables the Cloudinary upload (e.g. when the card has no name yet). */
  disableUpload?: boolean
  /** When set, the preview becomes a button that calls this on click. */
  onSelect?: () => void
  /** Highlights the preview frame (e.g. while being edited). */
  selected?: boolean
}

/** Imperative handle used by parents for bulk upload. */
export interface CardPreviewHandle {
  upload: () => Promise<void>
}

export const CardPreview = forwardRef<CardPreviewHandle, CardPreviewProps>(
  function CardPreview(
    {
      svg,
      cardWidth,
      cardHeight,
      filename = 'card',
      disableUpload = false,
      onSelect,
      selected = false,
    },
    ref,
  ) {
    const { t } = useClientTranslation('admin')
    const [exportError, setExportError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
    const svgRef = useRef<HTMLDivElement>(null)

    const exportPng = useCallback(
      () => svgToPng(svg, cardWidth, cardHeight),
      [svg, cardWidth, cardHeight],
    )

    async function handleDownload() {
      setExportError(null)
      try {
        const blob = await exportPng()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.png`
        a.click()
        URL.revokeObjectURL(url)
      } catch {
        setExportError(t('cards.errors.pngExport'))
      }
    }

    const handleUpload = useCallback(async () => {
      if (disableUpload) return
      setUploadError(null)
      setUploadedUrl(null)
      setUploading(true)
      try {
        const blob = await exportPng()
        const formData = new FormData()
        formData.append(
          'file',
          new File([blob], `${filename}.png`, { type: 'image/png' }),
        )
        formData.append('name', filename)
        formData.append('altText', filename)
        const res = await axios.post<{ url?: string }>('/api/upload', formData)
        if (!res.data.url) {
          setUploadError(t('cards.errors.upload'))
          return
        }
        setUploadedUrl(res.data.url)
      } catch (err) {
        setUploadError(
          isAxiosError(err)
            ? (err.response?.data?.error ?? t('cards.errors.upload'))
            : t('cards.errors.upload'),
        )
      } finally {
        setUploading(false)
      }
    }, [disableUpload, exportPng, filename, t])

    useImperativeHandle(ref, () => ({ upload: handleUpload }), [handleUpload])

    return (
      <StyledWrapper data-testid="card-preview">
        <StyledPreviewFrame
          as={onSelect ? 'button' : 'div'}
          type={onSelect ? 'button' : undefined}
          onClick={onSelect}
          $clickable={Boolean(onSelect)}
          $selected={selected}
          data-testid={onSelect ? 'card-select' : undefined}
        >
          <StyledSvgWrap
            ref={svgRef}
            $aspectRatio={cardWidth / cardHeight}
            dangerouslySetInnerHTML={{ __html: svg }}
            data-testid="svg-container"
          />
        </StyledPreviewFrame>

        <StyledActionBar>
          <Button
            variant="contained"
            colorScheme="success"
            type="button"
            size="sm"
            onClick={() => void handleDownload()}
            data-testid="download-button"
          >
            {t('cards.actions.download')}
          </Button>
          <Button
            variant="ghost"
            colorScheme="success"
            type="button"
            size="sm"
            onClick={() => void handleUpload()}
            disabled={uploading || disableUpload}
            data-testid="upload-button"
          >
            {uploading
              ? t('cards.actions.uploading')
              : t('cards.actions.upload')}
          </Button>
          {uploadedUrl && (
            <StyledUploadedLink
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="upload-link"
            >
              {t('cards.actions.uploaded')}
            </StyledUploadedLink>
          )}
        </StyledActionBar>

        {exportError && (
          <StyledError data-testid="export-error">{exportError}</StyledError>
        )}
        {uploadError && (
          <StyledError data-testid="upload-error">{uploadError}</StyledError>
        )}
      </StyledWrapper>
    )
  },
)

CardPreview.displayName = 'CardPreview'
