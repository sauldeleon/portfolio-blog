'use client'

import { useState } from 'react'

import { DownloadIcon } from '@sdlgr/icons'

import {
  CanyonSummaryMap,
  useCanyonSummaryPng,
} from '@web/components/CanyonSummary'
import { useClientTranslation } from '@web/i18n/client'
import { parseCanyonSummary, waypointSlug } from '@web/lib/cards'
import type { CanyoningCardData, Lang } from '@web/lib/cards'

import {
  StyledCanyonSummaryWrapper,
  StyledDownloadBar,
  StyledDownloadButton,
  StyledDownloadError,
} from './PostContentCanyonSummary.styles'

/**
 * Renders an interactive canyon summary embedded in post content. `data`
 * arrives as a JSON string from the remark transform; the card is the shared
 * read-only CanyonSummaryMap, localised to the current post language, plus a
 * PNG export of the same static card the admin generator produces.
 *
 * `lang` overrides the UI language — used by the admin preview, which renders a
 * given content locale while the admin UI stays in its own language.
 */
export function PostContentCanyonSummary({
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

  const parsed = data ? parseCanyonSummary(data) : null
  const lang: Lang = langOverride ?? (i18n.language === 'es' ? 'es' : 'en')
  const cardData: CanyoningCardData = {
    ...(parsed ?? { kind: 'canyoning-data', lang }),
    lang,
  }
  const { downloadPng } = useCanyonSummaryPng(cardData)

  if (!parsed) return null

  const base = parsed.title?.trim() ? waypointSlug(parsed.title) : 'canyon'
  const filename = `canyon-${base}-${lang}`

  async function handleDownload() {
    setDownloadError(false)
    try {
      await downloadPng(filename)
    } catch {
      setDownloadError(true)
    }
  }

  return (
    <StyledCanyonSummaryWrapper data-testid="post-canyon-summary">
      <CanyonSummaryMap data={cardData} interaction="click" />
      {!noDownload && (
        <StyledDownloadBar>
          <StyledDownloadButton
            type="button"
            onClick={() => void handleDownload()}
            data-testid="post-canyon-summary-download"
          >
            <DownloadIcon />
            {t('croquis.downloadPng')}
          </StyledDownloadButton>
        </StyledDownloadBar>
      )}
      {downloadError && (
        <StyledDownloadError data-testid="post-canyon-summary-download-error">
          {t('croquis.downloadError')}
        </StyledDownloadError>
      )}
    </StyledCanyonSummaryWrapper>
  )
}
