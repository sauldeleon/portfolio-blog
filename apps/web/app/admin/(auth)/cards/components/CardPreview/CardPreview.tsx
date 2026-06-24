'use client'

import axios, { isAxiosError } from 'axios'
import { useCallback, useRef, useState } from 'react'

import { Button } from '@sdlgr/button'

import { useClientTranslation } from '@web/i18n/client'

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
  /** Suggested filename without extension. */
  filename?: string
}

export function CardPreview({
  svg,
  cardWidth,
  cardHeight,
  filename = 'card',
}: CardPreviewProps) {
  const { t } = useClientTranslation('admin')
  const [exportError, setExportError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const svgRef = useRef<HTMLDivElement>(null)

  const exportPng = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = cardWidth * 2
        canvas.height = cardHeight * 2
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error('Canvas not available'))
          return
        }
        ctx.scale(2, 2)
        ctx.drawImage(img, 0, 0, cardWidth, cardHeight)
        URL.revokeObjectURL(url)
        canvas.toBlob((b) => {
          if (b) resolve(b)
          else reject(new Error('toBlob failed'))
        }, 'image/png')
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Image load failed'))
      }
      img.src = url
    })
  }, [svg, cardWidth, cardHeight])

  async function handleDownload() {
    setExportError(null)
    try {
      const blob = await exportPng()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${filename}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      setExportError(t('cards.errors.pngExport'))
    }
  }

  async function handleUpload() {
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
  }

  return (
    <StyledWrapper data-testid="card-preview">
      <StyledPreviewFrame>
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
          disabled={uploading}
          data-testid="upload-button"
        >
          {uploading ? t('cards.actions.uploading') : t('cards.actions.upload')}
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
}
