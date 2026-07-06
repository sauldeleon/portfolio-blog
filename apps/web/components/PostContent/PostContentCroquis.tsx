'use client'

import { usePDF } from '@react-pdf/renderer'
import { useEffect, useMemo, useState } from 'react'

import { DownloadIcon } from '@sdlgr/icons'

import { CanyonReportDocument } from '@web/components/CanyonReport/CanyonReportDocument'
import { CroquisMap, useCroquisPng } from '@web/components/Croquis'
import { useClientTranslation } from '@web/i18n/client'
import { parseCanyonSummary, waypointSlug } from '@web/lib/cards'
import type { CanyoningCardData, CroquisObstacle, Lang } from '@web/lib/cards'

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

  const reportDoc = (
    <CanyonReportDocument
      title={title ?? ''}
      lang={lang}
      obstacles={parsed}
      summary={summaryData}
    />
  )
  const [report, updateReport] = usePDF({ document: reportDoc })
  // usePDF only builds on mount; rebuild when the content language flips.
  useEffect(() => {
    updateReport(reportDoc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

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

  function handleDownloadReport() {
    const link = document.createElement('a')
    link.href = report.url ?? /* istanbul ignore next */ ''
    link.download = `canyon-report-${base}-${lang}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const reportGenerating = !!report.loading

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
            <StyledDownloadButton
              type="button"
              onClick={handleDownloadReport}
              disabled={!report.url || reportGenerating}
              data-testid="post-croquis-report"
            >
              <DownloadIcon />
              {reportGenerating
                ? t('croquis.generatingReport')
                : t('croquis.downloadReport')}
            </StyledDownloadButton>
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
