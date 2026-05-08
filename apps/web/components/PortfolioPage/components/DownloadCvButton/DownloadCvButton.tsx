'use client'

import { usePDF } from '@react-pdf/renderer'
import { useEffect, useMemo } from 'react'

import { DownloadIcon } from '@sdlgr/assets'

import { StyledLabel } from '../../PortfolioPage.styles'
import { CvDocument, CvDocumentProps } from '../CvDocument/CvDocument'
import { StyledDownloadButton } from './DownloadCvButton.styles'

type DownloadCvButtonProps = {
  lng: string
  cvData: Omit<CvDocumentProps, 'photoUrl'>
  photoPath: string
  downloadLabel: string
  generatingLabel: string
  filename: string
}

export function DownloadCvButton({
  lng,
  cvData,
  photoPath,
  downloadLabel,
  generatingLabel,
  filename,
}: DownloadCvButtonProps) {
  const photoUrl = useMemo(
    () =>
      /* istanbul ignore next */
      typeof window !== 'undefined' ? window.location.origin + photoPath : '',
    [photoPath],
  )
  const fullCvData: CvDocumentProps = { ...cvData, photoUrl }

  const [instance, update] = usePDF({
    document: <CvDocument {...fullCvData} />,
  })

  // usePDF only runs once on mount — manually update when language or photo changes
  useEffect(() => {
    update(<CvDocument {...fullCvData} />)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lng, photoUrl])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = instance.url ?? /* istanbul ignore next */ ''
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isGenerating = !!instance.loading

  return (
    <StyledDownloadButton
      variant="inverted"
      onClick={handleDownload}
      disabled={!instance.url || isGenerating}
      aria-label={downloadLabel}
    >
      <DownloadIcon height={24} width={24} />
      <StyledLabel>
        {isGenerating ? generatingLabel : downloadLabel}
      </StyledLabel>
    </StyledDownloadButton>
  )
}
