'use client'

import { useState } from 'react'

import { DownloadIcon } from '@sdlgr/icons'

import {
  RouteSummaryMap,
  useRouteSummaryPng,
} from '@web/components/RouteSummary'
import { useClientTranslation } from '@web/i18n/client'
import { parseRouteSummary, waypointSlug } from '@web/lib/cards'
import type { Lang, SummaryRouteData } from '@web/lib/cards'

// Same frame and download bar as the via-ferrata summary.
import {
  StyledDownloadBar,
  StyledDownloadButton,
  StyledDownloadError,
  StyledFerrataSummaryWrapper as StyledRouteSummaryWrapper,
} from './PostContentFerrataSummary.styles'

/**
 * Renders an interactive route summary embedded in post content. `data`
 * arrives as a JSON string from the remark transform; the card is the shared
 * read-only RouteSummaryMap, localised to the current post language, plus a
 * PNG export of the same static card the admin generator produces.
 *
 * `lang` overrides the UI language — used by the admin preview, which renders a
 * given content locale while the admin UI stays in its own language.
 */
export function PostContentRouteSummary({
  data,
  noDownload,
  lang: langOverride,
}: {
  data?: string
  /** When set (via the `no-download` fence flag), hides the PNG download. */
  noDownload?: boolean
  lang?: Lang
}) {
  const { t, i18n } = useClientTranslation('common')
  const [downloadError, setDownloadError] = useState(false)

  const parsed = data ? parseRouteSummary(data) : null
  const lang: Lang = langOverride ?? (i18n.language === 'es' ? 'es' : 'en')
  const cardData: SummaryRouteData = {
    ...(parsed ?? { kind: 'summary-route', lang }),
    lang,
  }
  const { downloadPng } = useRouteSummaryPng(cardData)

  if (!parsed) return null

  const base = parsed.title?.trim() ? waypointSlug(parsed.title) : 'route'
  const filename = `route-${base}-${lang}`

  async function handleDownload() {
    setDownloadError(false)
    try {
      await downloadPng(filename)
    } catch {
      setDownloadError(true)
    }
  }

  return (
    <StyledRouteSummaryWrapper data-testid="post-route-summary">
      <RouteSummaryMap data={cardData} />
      {!noDownload && (
        <StyledDownloadBar>
          <StyledDownloadButton
            type="button"
            onClick={() => void handleDownload()}
            data-testid="post-route-summary-download"
          >
            <DownloadIcon />
            {t('croquis.downloadPng')}
          </StyledDownloadButton>
        </StyledDownloadBar>
      )}
      {downloadError && (
        <StyledDownloadError data-testid="post-route-summary-download-error">
          {t('croquis.downloadError')}
        </StyledDownloadError>
      )}
    </StyledRouteSummaryWrapper>
  )
}
