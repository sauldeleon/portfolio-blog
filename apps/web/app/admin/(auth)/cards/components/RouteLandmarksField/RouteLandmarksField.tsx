'use client'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import type { RouteLandmark } from '@web/lib/cards'

import {
  StyledAltitude,
  StyledEmpty,
  StyledKind,
  StyledList,
  StyledRow,
} from './RouteLandmarksField.styles'

interface RouteLandmarksFieldProps {
  value: RouteLandmark[] | undefined
  onChange: (next: RouteLandmark[]) => void
  /** OpenStreetMap did not answer on the last parse: some names are missing. */
  placesUnavailable?: boolean
}

/**
 * The summits and cols detected when parsing the GPX, in route order: their
 * names (from the GPX waypoints or OpenStreetMap) can be fixed or cleared,
 * and any of them dropped from the card.
 */
export function RouteLandmarksField({
  value = [],
  onChange,
  placesUnavailable,
}: RouteLandmarksFieldProps) {
  const { t } = useClientTranslation('admin')

  function rename(i: number, name: string) {
    onChange(
      value.map((l, k) => (k === i ? { ...l, name: name || undefined } : l)),
    )
  }

  return (
    <FieldGroup>
      <FieldLabel>{t('cards.fields.landmarks')}</FieldLabel>
      {placesUnavailable && (
        <StyledEmpty role="status" data-testid="rt-landmarks-osm-down">
          {t('cards.fields.landmarksOsmDown')}
        </StyledEmpty>
      )}
      {value.length === 0 ? (
        <StyledEmpty>{t('cards.fields.landmarksEmpty')}</StyledEmpty>
      ) : (
        <StyledList data-testid="rt-landmarks">
          {value.map((l, i) => (
            <StyledRow key={`${l.kind}-${l.index}`}>
              <StyledKind $kind={l.kind}>
                {l.kind === 'peak' ? '▲' : '▼'}{' '}
                {t(
                  l.kind === 'peak'
                    ? 'cards.fields.landmarkPeak'
                    : 'cards.fields.landmarkCol',
                )}
              </StyledKind>
              <StyledAltitude>{l.ele} m</StyledAltitude>
              <Input
                value={l.name ?? ''}
                placeholder={t('cards.fields.landmarkName')}
                aria-label={t('cards.fields.landmarkName')}
                onChange={(e) => rename(i, e.target.value)}
                data-testid={`rt-landmark-name-${i}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onChange(value.filter((_, k) => k !== i))}
                aria-label={t('cards.fields.landmarkRemove')}
                title={t('cards.fields.landmarkRemove')}
                data-testid={`rt-landmark-remove-${i}`}
              >
                ✕
              </Button>
            </StyledRow>
          ))}
        </StyledList>
      )}
    </FieldGroup>
  )
}
