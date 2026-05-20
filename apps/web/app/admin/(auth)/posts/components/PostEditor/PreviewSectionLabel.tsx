'use client'

import { StyledPreviewSectionLabel } from './PreviewSectionLabel.styles'

interface PreviewSectionLabelProps {
  children: React.ReactNode
}

export function PreviewSectionLabel({ children }: PreviewSectionLabelProps) {
  return (
    <StyledPreviewSectionLabel data-testid="preview-section-label">
      {children}
    </StyledPreviewSectionLabel>
  )
}
