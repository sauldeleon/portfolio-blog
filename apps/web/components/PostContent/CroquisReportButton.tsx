'use client'

import { usePDF } from '@react-pdf/renderer'
import { useEffect } from 'react'

import { DownloadIcon } from '@sdlgr/icons'

import { CanyonReportDocument } from '@web/components/CanyonReport/CanyonReportDocument'
import { useClientTranslation } from '@web/i18n/client'
import type { CanyoningCardData, CroquisObstacle, Lang } from '@web/lib/cards'

import { StyledDownloadButton } from './PostContentCroquis.styles'

export interface CroquisReportButtonProps {
  title?: string
  lang: Lang
  obstacles: CroquisObstacle[]
  summary: CanyoningCardData | null
  /** Base of the downloaded file name, without locale or extension. */
  fileBase: string
}

/**
 * Builds the offline PDF canyon report with @react-pdf/renderer. It lives in
 * its own module so PostContentCroquis can load it lazily: react-pdf is over a
 * megabyte and only posts with a croquis need it.
 */
export function CroquisReportButton({
  title,
  lang,
  obstacles,
  summary,
  fileBase,
}: CroquisReportButtonProps) {
  const { t } = useClientTranslation('common')
  const reportDoc = (
    <CanyonReportDocument
      title={title ?? ''}
      lang={lang}
      obstacles={obstacles}
      summary={summary}
    />
  )
  const [report, updateReport] = usePDF({ document: reportDoc })
  // usePDF only builds on mount; rebuild when the content language flips.
  useEffect(() => {
    updateReport(reportDoc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  function handleDownloadReport() {
    const link = document.createElement('a')
    link.href = report.url ?? /* istanbul ignore next */ ''
    link.download = `canyon-report-${fileBase}-${lang}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generating = !!report.loading

  return (
    <StyledDownloadButton
      type="button"
      onClick={handleDownloadReport}
      disabled={!report.url || generating}
      data-testid="post-croquis-report"
    >
      <DownloadIcon />
      {generating ? t('croquis.generatingReport') : t('croquis.downloadReport')}
    </StyledDownloadButton>
  )
}
