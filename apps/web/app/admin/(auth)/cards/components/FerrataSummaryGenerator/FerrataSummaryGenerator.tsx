'use client'

import { useState } from 'react'

import { waypointSlug } from '@web/lib/cards'
import type { SummaryFerrataData } from '@web/lib/cards'

import {
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
} from '../CardGenerator/CardGenerator.styles'
import { FerrataForm } from '../FerrataForm'
import { FerrataSummary } from '../FerrataSummary'

const DEFAULT_DATA: SummaryFerrataData = { kind: 'summary-ferrata', lang: 'en' }

/**
 * Builds an interactive via-ferrata summary from the same fields as the static
 * ferrata card. The preview is explorable (difficulty explains on click) and
 * exports to the same PNG the static generator produces.
 */
export function FerrataSummaryGenerator() {
  const [data, setData] = useState<SummaryFerrataData>(DEFAULT_DATA)

  const base = data.title?.trim() ? waypointSlug(data.title) : 'ferrata'
  const filename = `ferrata-${base}-${data.lang}`

  return (
    <StyledLayout data-testid="ferrata-summary-generator">
      <StyledPanelForm>
        <FerrataForm value={data} onChange={setData} />
      </StyledPanelForm>

      <StyledPanelPreview>
        <FerrataSummary data={data} filename={filename} />
      </StyledPanelPreview>
    </StyledLayout>
  )
}
