'use client'

import { useState } from 'react'

import { waypointSlug } from '@web/lib/cards'
import type { SummaryRouteData } from '@web/lib/cards'

import {
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
} from '../CardGenerator/CardGenerator.styles'
import { RouteForm } from '../RouteForm'
import { RouteSummary } from '../RouteSummary'

const DEFAULT_DATA: SummaryRouteData = { kind: 'summary-route', lang: 'en' }

/**
 * Builds an interactive route summary from the same fields as the static
 * route card. The preview is explorable (altitude on hover) and
 * exports to the same PNG the static generator produces.
 */
export function RouteSummaryGenerator() {
  const [data, setData] = useState<SummaryRouteData>(DEFAULT_DATA)

  const base = data.title?.trim() ? waypointSlug(data.title) : 'route'
  const filename = `route-${base}-${data.lang}`

  return (
    <StyledLayout data-testid="route-summary-generator">
      <StyledPanelForm>
        <RouteForm value={data} onChange={setData} />
      </StyledPanelForm>

      <StyledPanelPreview>
        <RouteSummary data={data} filename={filename} />
      </StyledPanelPreview>
    </StyledLayout>
  )
}
