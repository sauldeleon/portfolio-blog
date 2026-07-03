'use client'

import axios from 'axios'
import { useState } from 'react'

import { Button } from '@sdlgr/button'

import { CroquisMap, useCroquisPng } from '@web/components/Croquis'
import { useClientTranslation } from '@web/i18n/client'
import type { CroquisObstacle, Lang } from '@web/lib/cards'
import { axiosErrorMessage } from '@web/lib/cards/gpxImport'

import {
  StyledActionBar,
  StyledError,
  StyledUploadedLink,
  StyledWrapper,
} from './Croquis.styles'

interface CroquisProps {
  obstacles: CroquisObstacle[]
  lang: Lang
  /** Base name (no extension) for the PNG download and Cloudinary upload. */
  filename?: string
  /** Optional card-style title shown above the map and in the export. */
  title?: string
}

/**
 * Admin croquis preview: the interactive map plus a PNG export / Cloudinary
 * upload bar. The map itself is the shared, read-only CroquisMap.
 */
export function Croquis({
  obstacles,
  lang,
  filename = 'croquis',
  title,
}: CroquisProps) {
  const { t } = useClientTranslation('admin')

  const [exportError, setExportError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const { exportPng, downloadPng } = useCroquisPng(obstacles, lang, title)

  async function handleDownload() {
    setExportError(null)
    try {
      await downloadPng(filename)
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
      setUploadError(axiosErrorMessage(err, t('cards.errors.upload')))
    } finally {
      setUploading(false)
    }
  }

  return (
    <StyledWrapper data-testid="croquis">
      <CroquisMap obstacles={obstacles} lang={lang} title={title} />

      <StyledActionBar>
        <Button
          type="button"
          variant="contained"
          colorScheme="success"
          size="sm"
          onClick={() => void handleDownload()}
          data-testid="croquis-download"
        >
          {t('cards.actions.download')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          colorScheme="success"
          size="sm"
          onClick={() => void handleUpload()}
          disabled={uploading}
          data-testid="croquis-upload"
        >
          {uploading ? t('cards.actions.uploading') : t('cards.actions.upload')}
        </Button>
        {uploadedUrl && (
          <StyledUploadedLink
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="croquis-upload-link"
          >
            {t('cards.actions.uploaded')}
          </StyledUploadedLink>
        )}
      </StyledActionBar>

      {exportError && (
        <StyledError data-testid="croquis-export-error">
          {exportError}
        </StyledError>
      )}
      {uploadError && (
        <StyledError data-testid="croquis-upload-error">
          {uploadError}
        </StyledError>
      )}
    </StyledWrapper>
  )
}
