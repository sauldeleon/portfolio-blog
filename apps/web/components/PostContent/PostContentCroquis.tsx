'use client'

import { useState } from 'react'

import { DownloadIcon } from '@sdlgr/icons'

import { CroquisMap, useCroquisPng } from '@web/components/Croquis'
import { useClientTranslation } from '@web/i18n/client'
import type { CroquisObstacle, Lang } from '@web/lib/cards'
import { waypointSlug } from '@web/lib/cards'

import {
  StyledCroquisWrapper,
  StyledDownloadBar,
  StyledDownloadButton,
  StyledDownloadError,
} from './PostContentCroquis.styles'

/**
 * Renders an interactive canyon croquis embedded in post content. `obstacles`
 * arrives as a JSON string from the remark transform; the map itself is the
 * shared read-only CroquisMap, localised to the current post language, plus a
 * PNG export of the same static card the admin generator produces.
 */
export function PostContentCroquis({
  obstacles,
  title,
}: {
  obstacles?: string
  title?: string
}) {
  const { t, i18n } = useClientTranslation('common')
  const [downloadError, setDownloadError] = useState(false)

  const parsed: CroquisObstacle[] = obstacles
    ? (JSON.parse(obstacles) as CroquisObstacle[])
    : []
  const lang: Lang = i18n.language === 'es' ? 'es' : 'en'
  const { downloadPng } = useCroquisPng(parsed, lang, title)

  if (parsed.length === 0) return null

  const base = title?.trim() ? waypointSlug(title) : 'croquis'
  const filename = `croquis-${base}-${lang}`

  async function handleDownload() {
    setDownloadError(false)
    try {
      await downloadPng(filename)
    } catch {
      setDownloadError(true)
    }
  }

  return (
    <StyledCroquisWrapper data-testid="post-croquis">
      <CroquisMap
        obstacles={parsed}
        lang={lang}
        title={title}
        interaction="click"
      />
      <StyledDownloadBar>
        <StyledDownloadButton
          type="button"
          onClick={() => void handleDownload()}
          data-testid="post-croquis-download"
        >
          <DownloadIcon />
          {t('croquis.downloadPng')}
        </StyledDownloadButton>
      </StyledDownloadBar>
      {downloadError && (
        <StyledDownloadError data-testid="post-croquis-download-error">
          {t('croquis.downloadError')}
        </StyledDownloadError>
      )}
    </StyledCroquisWrapper>
  )
}
