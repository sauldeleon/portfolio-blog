'use client'

import { useState } from 'react'

import { DownloadIcon } from '@sdlgr/icons'

import {
  FerrataSummaryMap,
  useFerrataSummaryPng,
} from '@web/components/FerrataSummary'
import { useClientTranslation } from '@web/i18n/client'
import { parseFerrataSummary, waypointSlug } from '@web/lib/cards'
import type { Lang, SummaryFerrataData } from '@web/lib/cards'

import {
  StyledDownloadBar,
  StyledDownloadButton,
  StyledDownloadError,
  StyledFerrataSummaryWrapper,
} from './PostContentFerrataSummary.styles'

/**
 * Renders an interactive via-ferrata summary embedded in post content. `data`
 * arrives as a JSON string from the remark transform; the card is the shared
 * read-only FerrataSummaryMap, localised to the current post language, plus a
 * PNG export of the same static card the admin generator produces.
 *
 * `lang` overrides the UI language — used by the admin preview, which renders a
 * given content locale while the admin UI stays in its own language.
 */
export function PostContentFerrataSummary({
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

  const parsed = data ? parseFerrataSummary(data) : null
  const lang: Lang = langOverride ?? (i18n.language === 'es' ? 'es' : 'en')
  const cardData: SummaryFerrataData = {
    ...(parsed ?? { kind: 'summary-ferrata', lang }),
    lang,
  }
  const { downloadPng } = useFerrataSummaryPng(cardData)

  if (!parsed) return null

  const base = parsed.title?.trim() ? waypointSlug(parsed.title) : 'ferrata'
  const filename = `ferrata-${base}-${lang}`

  async function handleDownload() {
    setDownloadError(false)
    try {
      await downloadPng(filename)
    } catch {
      setDownloadError(true)
    }
  }

  return (
    <StyledFerrataSummaryWrapper data-testid="post-ferrata-summary">
      <FerrataSummaryMap data={cardData} interaction="click" />
      {!noDownload && (
        <StyledDownloadBar>
          <StyledDownloadButton
            type="button"
            onClick={() => void handleDownload()}
            data-testid="post-ferrata-summary-download"
          >
            <DownloadIcon />
            {t('croquis.downloadPng')}
          </StyledDownloadButton>
        </StyledDownloadBar>
      )}
      {downloadError && (
        <StyledDownloadError data-testid="post-ferrata-summary-download-error">
          {t('croquis.downloadError')}
        </StyledDownloadError>
      )}
    </StyledFerrataSummaryWrapper>
  )
}
