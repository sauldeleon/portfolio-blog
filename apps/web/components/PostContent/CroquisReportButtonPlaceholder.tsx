'use client'

import { DownloadIcon } from '@sdlgr/icons'

import { useClientTranslation } from '@web/i18n/client'

import { StyledDownloadButton } from './PostContentCroquis.styles'

/**
 * Shown while CroquisReportButton (and react-pdf with it) loads; matches its
 * "generating" state. Kept in its own module so it does not pull react-pdf in.
 */
export function CroquisReportButtonPlaceholder() {
  const { t } = useClientTranslation('common')
  return (
    <StyledDownloadButton
      type="button"
      disabled
      data-testid="post-croquis-report"
    >
      <DownloadIcon />
      {t('croquis.generatingReport')}
    </StyledDownloadButton>
  )
}
