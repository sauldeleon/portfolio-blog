'use client'

import { useState } from 'react'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import type { GpxMetrics } from '@web/lib/cards'
import {
  axiosErrorMessage,
  fetchGpxMetrics,
  withOsmNames,
} from '@web/lib/cards/gpxImport'

import { TrackUrlPicker } from '../../../components/TrackUrlPicker'
import { StyledError, StyledRow } from './GpxUrlField.styles'

interface GpxUrlFieldProps {
  value?: string
  onChange: (url: string) => void
  /** Called with parsed metrics after a successful fetch + parse. */
  onParsed: (metrics: GpxMetrics) => void
  /** Prefix for input ids / test ids (e.g. "rt", "ft", "sb"). */
  idPrefix: string
  /** Then name the unnamed summits and cols from OpenStreetMap (slower). */
  withPlaceNames?: boolean
}

const PHASE_LABELS = {
  idle: 'cards.actions.parse',
  parsing: 'cards.actions.parsing',
  naming: 'cards.actions.namingPlaces',
} as const

/**
 * GPX url input with a manual "Parse" button. Fetches + parses the file via
 * the server proxy, surfacing failures inline. Parsed metrics are handed to
 * the parent through `onParsed`, once, with the place names already in; the
 * parent decides which fields to prefill.
 */
export function GpxUrlField({
  value,
  onChange,
  onParsed,
  idPrefix,
  withPlaceNames,
}: GpxUrlFieldProps) {
  const { t } = useClientTranslation('admin')
  const [phase, setPhase] = useState<keyof typeof PHASE_LABELS>('idle')
  const [error, setError] = useState<string | null>(null)

  const url = value ?? ''

  async function handleParse() {
    setPhase('parsing')
    setError(null)
    try {
      const metrics = await fetchGpxMetrics(url)
      if (!metrics) {
        setError(t('cards.errors.gpxParse'))
        return
      }
      if (!withPlaceNames) {
        onParsed(metrics)
        return
      }
      setPhase('naming')
      onParsed(await withOsmNames(metrics))
    } catch (err) {
      setError(axiosErrorMessage(err, t('cards.errors.gpxParse')))
    } finally {
      setPhase('idle')
    }
  }

  return (
    <FieldGroup>
      <FieldLabel htmlFor={`${idPrefix}-gpx`}>
        {t('cards.fields.gpxUrl')}
      </FieldLabel>
      <StyledRow>
        <TrackUrlPicker
          id={`${idPrefix}-gpx`}
          value={url}
          onChange={(next) => {
            onChange(next)
            if (error) setError(null)
          }}
          data-testid={`${idPrefix}-gpx`}
        />
        <Button
          type="button"
          variant="contained"
          colorScheme="success"
          size="sm"
          onClick={() => void handleParse()}
          disabled={!url || phase !== 'idle'}
          data-testid={`${idPrefix}-gpx-parse`}
        >
          {t(PHASE_LABELS[phase])}
        </Button>
      </StyledRow>
      {error && (
        <StyledError data-testid={`${idPrefix}-gpx-error`}>{error}</StyledError>
      )}
    </FieldGroup>
  )
}
