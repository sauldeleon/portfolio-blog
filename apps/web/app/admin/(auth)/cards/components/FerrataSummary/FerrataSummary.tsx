'use client'

import axios from 'axios'
import { useState } from 'react'

import { Button } from '@sdlgr/button'

import {
  FerrataSummaryMap,
  useFerrataSummaryPng,
} from '@web/components/FerrataSummary'
import { useClientTranslation } from '@web/i18n/client'
import type { SummaryFerrataData } from '@web/lib/cards'
import { axiosErrorMessage } from '@web/lib/cards/gpxImport'

import {
  StyledActionBar,
  StyledError,
  StyledUploadedLink,
  StyledWrapper,
} from './FerrataSummary.styles'

interface FerrataSummaryProps {
  data: SummaryFerrataData
  /** Base name (no extension) for the PNG download and Cloudinary upload. */
  filename?: string
}

/**
 * Admin ferrata-summary preview: the interactive card plus a PNG export /
 * Cloudinary upload bar. The card itself is the shared, read-only
 * FerrataSummaryMap.
 */
export function FerrataSummary({
  data,
  filename = 'ferrata',
}: FerrataSummaryProps) {
  const { t } = useClientTranslation('admin')

  const [exportError, setExportError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const { exportPng, downloadPng } = useFerrataSummaryPng(data)

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
    <StyledWrapper data-testid="ferrata-summary">
      <FerrataSummaryMap data={data} />

      <StyledActionBar>
        <Button
          type="button"
          variant="contained"
          colorScheme="success"
          size="sm"
          onClick={() => void handleDownload()}
          data-testid="ferrata-summary-download"
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
          data-testid="ferrata-summary-upload"
        >
          {uploading ? t('cards.actions.uploading') : t('cards.actions.upload')}
        </Button>
        {uploadedUrl && (
          <StyledUploadedLink
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="ferrata-summary-upload-link"
          >
            {t('cards.actions.uploaded')}
          </StyledUploadedLink>
        )}
      </StyledActionBar>

      {exportError && (
        <StyledError data-testid="ferrata-summary-export-error">
          {exportError}
        </StyledError>
      )}
      {uploadError && (
        <StyledError data-testid="ferrata-summary-upload-error">
          {uploadError}
        </StyledError>
      )}
    </StyledWrapper>
  )
}
