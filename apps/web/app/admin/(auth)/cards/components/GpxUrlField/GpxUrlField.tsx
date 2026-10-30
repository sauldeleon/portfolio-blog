'use client'

import axios, { isAxiosError } from 'axios'
import { useState } from 'react'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import type { GpxMetrics, RouteLandmark } from '@web/lib/cards'

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
 * Names the parsed landmarks from OpenStreetMap through its own request, so a
 * slow Overpass never holds up the parse. Any failure keeps them as they were.
 */
async function withOsmNames(metrics: GpxMetrics): Promise<GpxMetrics> {
  if (!metrics.landmarks?.some((l) => !l.name)) return metrics
  try {
    const res = await axios.post<{
      data: { landmarks: RouteLandmark[]; unavailable: boolean }
    }>('/api/cards/places', { landmarks: metrics.landmarks })
    const { landmarks, unavailable } = res.data.data
    return { ...metrics, landmarks, placesUnavailable: unavailable }
  } catch {
    return { ...metrics, placesUnavailable: true }
  }
}

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
      const res = await axios.get<{ data?: GpxMetrics }>('/api/cards/gpx', {
        params: { url },
      })
      const metrics = res.data.data
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
      setError(
        isAxiosError(err)
          ? (err.response?.data?.error ?? t('cards.errors.gpxParse'))
          : t('cards.errors.gpxParse'),
      )
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
