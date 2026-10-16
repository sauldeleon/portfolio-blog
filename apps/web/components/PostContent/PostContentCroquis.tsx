'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'

import { DownloadIcon } from '@sdlgr/icons'

import { CroquisMap, useCroquisPng } from '@web/components/Croquis'
import { useClientTranslation } from '@web/i18n/client'
import { parseCanyonSummary, waypointSlug } from '@web/lib/cards'
import type { CanyoningCardData, CroquisObstacle, Lang } from '@web/lib/cards'

import { CroquisReportButtonPlaceholder } from './CroquisReportButtonPlaceholder'
import {
  StyledCroquisWrapper,
  StyledDownloadBar,
  StyledDownloadButton,
  StyledDownloadError,
} from './PostContentCroquis.styles'

// react-pdf is over a megabyte: load the PDF report only where a croquis is
// rendered, and only in the browser, instead of in every post's bundle.
const CroquisReportButton = dynamic(
  () => import('./CroquisReportButton').then((m) => m.CroquisReportButton),
  { ssr: false, loading: () => <CroquisReportButtonPlaceholder /> },
)

/**
 * Renders an interactive canyon croquis embedded in post content. `obstacles`
 * arrives as a JSON string from the remark transform; the map itself is the
 * shared read-only CroquisMap, localised to the current post language, plus a
 * PNG export of the same static card the admin generator produces and an
 * offline PDF canyon report (croquis + per-waypoint images + that day's
 * summary) built from `summary`.
 *
 * `lang` overrides the UI language — used by the admin preview, which renders a
 * given content locale while the admin UI stays in its own language.
 */
export function PostContentCroquis({
  obstacles,
  title,
  noDownload,
  noReport,
  summary,
  lang: langOverride,
}: {
  obstacles?: string
  title?: string
  /** When set (via the `no-download` fence flag), hides the PNG download. */
  noDownload?: boolean
  /** When set (via the `no-report` fence flag), hides the PDF report. */
  noReport?: boolean
  /** Canyon-summary JSON for the PDF report; absent when not provided. */
  summary?: string
  lang?: Lang
}) {
  const { t, i18n } = useClientTranslation('common')
  const [downloadError, setDownloadError] = useState(false)

  const parsed: CroquisObstacle[] = useMemo(
    () => (obstacles ? (JSON.parse(obstacles) as CroquisObstacle[]) : []),
    [obstacles],
  )
  const lang: Lang = langOverride ?? (i18n.language === 'es' ? 'es' : 'en')
  const summaryData: CanyoningCardData | null = useMemo(
    () => (summary ? (parseCanyonSummary(summary) ?? null) : null),
    [summary],
  )
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
      {(!noDownload || !noReport) && (
        <StyledDownloadBar>
          {!noDownload && (
            <StyledDownloadButton
              type="button"
              onClick={() => void handleDownload()}
              data-testid="post-croquis-download"
            >
              <DownloadIcon />
              {t('croquis.downloadPng')}
            </StyledDownloadButton>
          )}
          {!noReport && (
            <CroquisReportButton
              title={title}
              lang={lang}
              obstacles={parsed}
              summary={summaryData}
              fileBase={base}
            />
          )}
        </StyledDownloadBar>
      )}
      {downloadError && (
        <StyledDownloadError data-testid="post-croquis-download-error">
          {t('croquis.downloadError')}
        </StyledDownloadError>
      )}
    </StyledCroquisWrapper>
  )
}
