'use client'

import axios, { isAxiosError } from 'axios'
import { useState } from 'react'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import type { GpxMetrics } from '@web/lib/cards'

import { StyledError, StyledRow } from './GpxUrlField.styles'

interface GpxUrlFieldProps {
  value?: string
  onChange: (url: string) => void
  /** Called with parsed metrics after a successful fetch + parse. */
  onParsed: (metrics: GpxMetrics) => void
  /** Prefix for input ids / test ids (e.g. "rt", "ft", "sb"). */
  idPrefix: string
}

/**
 * GPX url input with a manual "Parse" button. Fetches + parses the file via
 * the server proxy, surfacing failures inline. Parsed metrics are handed to
 * the parent through `onParsed`; the parent decides which fields to prefill.
 */
export function GpxUrlField({
  value,
  onChange,
  onParsed,
  idPrefix,
}: GpxUrlFieldProps) {
  const { t } = useClientTranslation('admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const url = value ?? ''

  async function handleParse() {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get<{ data?: GpxMetrics }>('/api/cards/gpx', {
        params: { url },
      })
      if (!res.data.data) {
        setError(t('cards.errors.gpxParse'))
        return
      }
      onParsed(res.data.data)
    } catch (err) {
      setError(
        isAxiosError(err)
          ? (err.response?.data?.error ?? t('cards.errors.gpxParse'))
          : t('cards.errors.gpxParse'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <FieldGroup>
      <FieldLabel htmlFor={`${idPrefix}-gpx`}>
        {t('cards.fields.gpxUrl')}
      </FieldLabel>
      <StyledRow>
        <Input
          id={`${idPrefix}-gpx`}
          value={url}
          placeholder={t('cards.placeholders.gpxUrl')}
          onChange={(e) => {
            onChange(e.target.value)
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
          disabled={!url || loading}
          data-testid={`${idPrefix}-gpx-parse`}
        >
          {loading ? t('cards.actions.parsing') : t('cards.actions.parse')}
        </Button>
      </StyledRow>
      {error && (
        <StyledError data-testid={`${idPrefix}-gpx-error`}>{error}</StyledError>
      )}
    </FieldGroup>
  )
}
