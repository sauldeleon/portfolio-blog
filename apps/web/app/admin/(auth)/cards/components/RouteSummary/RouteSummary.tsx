'use client'

import axios from 'axios'
import { useState } from 'react'

import { Button } from '@sdlgr/button'

import {
  RouteSummaryMap,
  useRouteSummaryPng,
} from '@web/components/RouteSummary'
import { useClientTranslation } from '@web/i18n/client'
import type { SummaryRouteData } from '@web/lib/cards'
import { axiosErrorMessage } from '@web/lib/cards/gpxImport'

// Same layout as the via-ferrata preview.
import {
  StyledActionBar,
  StyledError,
  StyledUploadedLink,
  StyledWrapper,
} from '../FerrataSummary/FerrataSummary.styles'

interface RouteSummaryProps {
  data: SummaryRouteData
  /** Base name (no extension) for the PNG download and Cloudinary upload. */
  filename?: string
}

/**
 * Admin route-summary preview: the interactive card plus a PNG export /
 * Cloudinary upload bar. The card itself is the shared, read-only
 * RouteSummaryMap.
 */
export function RouteSummary({ data, filename = 'route' }: RouteSummaryProps) {
  const { t } = useClientTranslation('admin')

  const [exportError, setExportError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const { exportPng, downloadPng } = useRouteSummaryPng(data)

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
    <StyledWrapper data-testid="route-summary">
      <RouteSummaryMap data={data} />

      <StyledActionBar>
        <Button
          type="button"
          variant="contained"
          colorScheme="success"
          size="sm"
          onClick={() => void handleDownload()}
          data-testid="route-summary-download"
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
          data-testid="route-summary-upload"
        >
          {uploading ? t('cards.actions.uploading') : t('cards.actions.upload')}
        </Button>
        {uploadedUrl && (
          <StyledUploadedLink
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="route-summary-upload-link"
          >
            {t('cards.actions.uploaded')}
          </StyledUploadedLink>
        )}
      </StyledActionBar>

      {exportError && (
        <StyledError data-testid="route-summary-export-error">
          {exportError}
        </StyledError>
      )}
      {uploadError && (
        <StyledError data-testid="route-summary-upload-error">
          {uploadError}
        </StyledError>
      )}
    </StyledWrapper>
  )
}
