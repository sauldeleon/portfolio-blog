'use client'

import { StyledBanner } from './PreviewBanner.styles'

export interface PreviewBannerProps {
  label: string
}

export function PreviewBanner({ label }: PreviewBannerProps) {
  return <StyledBanner role="status">{label}</StyledBanner>
}
