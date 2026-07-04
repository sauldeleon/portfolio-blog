'use client'

import { useState } from 'react'

import { waypointSlug } from '@web/lib/cards'
import type { CanyoningCardData } from '@web/lib/cards'

import { CanyonSummary } from '../CanyonSummary'
import { CanyoningForm } from '../CanyoningForm'
import {
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
} from '../CardGenerator/CardGenerator.styles'

const DEFAULT_DATA: CanyoningCardData = { kind: 'canyoning-data', lang: 'en' }

/**
 * Builds an interactive canyon summary from the same fields as the static
 * canyon card. The preview is explorable (grade / flow / phenomena explain on
 * click) and exports to the same PNG the static generator produces.
 */
export function CanyonSummaryGenerator() {
  const [data, setData] = useState<CanyoningCardData>(DEFAULT_DATA)

  const base = data.title?.trim() ? waypointSlug(data.title) : 'canyon'
  const filename = `canyon-${base}-${data.lang}`

  return (
    <StyledLayout data-testid="canyon-summary-generator">
      <StyledPanelForm>
        <CanyoningForm value={data} onChange={setData} />
      </StyledPanelForm>

      <StyledPanelPreview>
        <CanyonSummary data={data} filename={filename} />
      </StyledPanelPreview>
    </StyledLayout>
  )
}
