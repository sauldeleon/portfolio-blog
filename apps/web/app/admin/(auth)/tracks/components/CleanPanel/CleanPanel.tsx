'use client'

import { useMemo } from 'react'

import { Button } from '@sdlgr/button'
import { Checkbox } from '@sdlgr/checkbox'
import {
  type CleanOptions,
  type GpxPoint,
  type SimplifyAlgorithm,
  type TrackStats,
  cumulativeDistances,
  indexAtDistance,
} from '@sdlgr/gpx-tools'

import { useClientTranslation } from '@web/i18n/client'

import {
  formatDistance,
  formatDuration,
  formatElevation,
} from '../../utils/format'
import type {
  CleanScope,
  PointSelection,
} from '../TrackWorkspace/TrackWorkspace'
import {
  StyledAlgorithms,
  StyledButtons,
  StyledFieldLabel,
  StyledFields,
  StyledFilter,
  StyledHelp,
  StyledNumberInput,
  StyledPanel,
  StyledScope,
  StyledStatsTable,
} from './CleanPanel.styles'

type FilterKey = keyof CleanOptions

const FILTERS = [
  {
    key: 'trim',
    fields: [
      { name: 'start', label: 'tracks.clean.trim.start', unit: 'm', step: 10 },
      { name: 'end', label: 'tracks.clean.trim.end', unit: 'm', step: 10 },
    ],
  },
  {
    key: 'speedSpikes',
    fields: [
      {
        name: 'maxSpeedKmh',
        label: 'tracks.clean.speedSpikes.maxSpeedKmh',
        unit: 'km/h',
        step: 1,
      },
    ],
  },
  {
    key: 'detourSpikes',
    fields: [
      {
        name: 'maxDetour',
        label: 'tracks.clean.detourSpikes.maxDetour',
        unit: 'm',
        step: 5,
      },
    ],
  },
  {
    key: 'stops',
    fields: [
      {
        name: 'radius',
        label: 'tracks.clean.stops.radius',
        unit: 'm',
        step: 1,
      },
      {
        name: 'minDuration',
        label: 'tracks.clean.stops.minDuration',
        unit: 's',
        step: 10,
      },
    ],
  },
  {
    key: 'minDistance',
    fields: [
      {
        name: 'distance',
        label: 'tracks.clean.minDistance.distance',
        unit: 'm',
        step: 0.5,
      },
    ],
  },
  {
    key: 'smoothing',
    fields: [
      {
        name: 'window',
        label: 'tracks.clean.smoothing.window',
        unit: 'pts',
        step: 1,
      },
    ],
  },
  {
    key: 'simplify',
    fields: [
      {
        name: 'tolerance',
        label: 'tracks.clean.simplify.tolerance',
        unit: 'm',
        step: 0.5,
      },
    ],
  },
  {
    key: 'elevationSmoothing',
    fields: [
      {
        name: 'window',
        label: 'tracks.clean.elevationSmoothing.window',
        unit: 'pts',
        step: 1,
      },
    ],
  },
] as const satisfies ReadonlyArray<{
  key: FilterKey
  fields: ReadonlyArray<{
    name: string
    label: string
    unit: string
    step: number
  }>
}>

const STAT_ROWS = [
  { key: 'points', format: (s: TrackStats) => String(s.points) },
  { key: 'distance', format: (s: TrackStats) => formatDistance(s.distance) },
  { key: 'ascent', format: (s: TrackStats) => formatElevation(s.ascent) },
  { key: 'descent', format: (s: TrackStats) => formatElevation(s.descent) },
  { key: 'duration', format: (s: TrackStats) => formatDuration(s.duration) },
] as const

const ALGORITHMS: SimplifyAlgorithm[] = ['douglas-peucker', 'visvalingam']

const SCOPES: CleanScope[] = ['track', 'section']

const formatKm = (metres: number) => (metres / 1000).toFixed(2)

export interface CleanPanelProps {
  options: CleanOptions
  onChange: (options: CleanOptions) => void
  onApply: () => void
  onReset: () => void
  currentStats: TrackStats
  previewStats: TrackStats | null
  scope: CleanScope
  onScopeChange: (scope: CleanScope) => void
  /** Selected range of the active segment (from < to), if any. */
  section: PointSelection | null
  /** Points of the active segment, to turn km into point indices. */
  points: GpxPoint[]
  onSectionChange: (section: PointSelection) => void
  /** Figures of the section alone while cleaning a section. */
  sectionStats: { current: TrackStats; preview: TrackStats } | null
}

export function CleanPanel({
  options,
  onChange,
  onApply,
  onReset,
  currentStats,
  previewStats,
  scope,
  onScopeChange,
  section,
  points,
  onSectionChange,
  sectionStats,
}: CleanPanelProps) {
  const { t } = useClientTranslation('admin')
  const distances = useMemo(() => cumulativeDistances(points), [points])
  const lastIndex = Math.max(0, points.length - 1)
  const isSection = scope === 'section' && section !== null
  const fromIndex = section?.from ?? 0
  const toIndex = section?.to ?? lastIndex
  const statsCurrent = sectionStats?.current ?? currentStats
  const statsPreview = sectionStats ? sectionStats.preview : previewStats

  function commitKm(bound: 'from' | 'to', input: HTMLInputElement) {
    const current = bound === 'from' ? fromIndex : toIndex
    const other = bound === 'from' ? toIndex : fromIndex
    const km = parseFloat(input.value)
    const index = Number.isNaN(km)
      ? other
      : indexAtDistance(distances, km * 1000)
    // Empty input or a zero-length section: put the old value back.
    if (index === other) {
      input.value = formatKm(distances[current])
      return
    }
    onSectionChange(
      bound === 'from'
        ? { from: index, to: other }
        : { from: other, to: index },
    )
  }

  function update(key: FilterKey, patch: Record<string, unknown>) {
    onChange({ ...options, [key]: { ...options[key], ...patch } })
  }

  return (
    <StyledPanel data-testid="clean-panel">
      <StyledHelp>{t('tracks.clean.intro')}</StyledHelp>
      <StyledStatsTable>
        <thead>
          <tr>
            <th data-testid="stats-scope">
              {sectionStats ? t('tracks.clean.scope.section') : ''}
            </th>
            <th>{t('tracks.stats.current')}</th>
            <th>{t('tracks.stats.preview')}</th>
          </tr>
        </thead>
        <tbody>
          {STAT_ROWS.map((row) => (
            <tr key={row.key}>
              <th scope="row">{t(`tracks.stats.${row.key}`)}</th>
              <td>{row.format(statsCurrent)}</td>
              <td data-testid={`preview-${row.key}`}>
                {statsPreview ? row.format(statsPreview) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
        {sectionStats && previewStats && (
          <tfoot>
            <tr>
              <th scope="row">{t('tracks.clean.scope.total')}</th>
              <td colSpan={2} data-testid="preview-total">
                {t('tracks.clean.scope.totalValue', {
                  points: previewStats.points,
                  distance: formatDistance(previewStats.distance),
                  ascent: formatElevation(previewStats.ascent),
                })}
              </td>
            </tr>
          </tfoot>
        )}
      </StyledStatsTable>

      <StyledScope data-testid="clean-scope">
        <StyledAlgorithms
          role="group"
          aria-label={t('tracks.clean.scope.label')}
        >
          {SCOPES.map((key) => (
            <Button
              variant="label"
              key={key}
              type="button"
              active={key === 'section' ? isSection : !isSection}
              aria-pressed={key === 'section' ? isSection : !isSection}
              disabled={key === 'section' && !section}
              onClick={() => onScopeChange(key)}
              data-testid={`scope-${key}`}
            >
              {key === 'section' && section
                ? t('tracks.clean.scope.sectionRange', {
                    from: section.from + 1,
                    to: section.to + 1,
                  })
                : t(`tracks.clean.scope.${key}`)}
            </Button>
          ))}
        </StyledAlgorithms>
        <StyledHelp>{t('tracks.clean.scope.help')}</StyledHelp>
        <StyledFields>
          {(['from', 'to'] as const).map((bound) => (
            <StyledFieldLabel key={bound}>
              <span>{t(`tracks.clean.scope.${bound}`)} (km)</span>
              <StyledNumberInput
                // Remounts with the new value whenever the section changes.
                key={`${bound}-${fromIndex}-${toIndex}-${distances.length}`}
                type="number"
                min={0}
                step={0.1}
                defaultValue={formatKm(
                  distances[bound === 'from' ? fromIndex : toIndex] ?? 0,
                )}
                disabled={points.length < 2}
                onBlur={(e) => commitKm(bound, e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                }}
                data-testid={`section-${bound}`}
              />
            </StyledFieldLabel>
          ))}
        </StyledFields>
      </StyledScope>

      {FILTERS.map(({ key, fields }) => {
        const values = options[key] as unknown as Record<string, number> & {
          enabled: boolean
        }
        const isVisvalingam =
          key === 'simplify' && options.simplify.algorithm === 'visvalingam'
        // The section ends stay put, so trimming them makes no sense.
        const isLocked = key === 'trim' && isSection
        return (
          <StyledFilter key={key} data-testid={`filter-${key}`}>
            <Checkbox
              id={`clean-${key}`}
              label={t(`tracks.clean.${key}.label`)}
              checked={values.enabled && !isLocked}
              disabled={isLocked}
              onChange={(enabled) => update(key, { enabled })}
            />
            <StyledHelp>
              {t(
                isLocked
                  ? 'tracks.clean.trim.sectionHelp'
                  : `tracks.clean.${key}.help`,
              )}
            </StyledHelp>
            {key === 'simplify' && (
              <StyledAlgorithms>
                {ALGORITHMS.map((algorithm) => (
                  <Button
                    variant="label"
                    key={algorithm}
                    type="button"
                    active={options.simplify.algorithm === algorithm}
                    aria-pressed={options.simplify.algorithm === algorithm}
                    disabled={!values.enabled}
                    onClick={() => update('simplify', { algorithm })}
                    data-testid={`algorithm-${algorithm}`}
                  >
                    {t(`tracks.clean.simplify.${algorithm}`)}
                  </Button>
                ))}
              </StyledAlgorithms>
            )}
            <StyledFields>
              {fields.map((field) => (
                <StyledFieldLabel key={field.name}>
                  <span>
                    {t(field.label)} ({isVisvalingam ? 'm²' : field.unit})
                  </span>
                  <StyledNumberInput
                    type="number"
                    min={0}
                    step={field.step}
                    value={values[field.name]}
                    disabled={!values.enabled || isLocked}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      if (!Number.isNaN(value) && value >= 0) {
                        update(key, { [field.name]: value })
                      }
                    }}
                    data-testid={`field-${key}-${field.name}`}
                  />
                </StyledFieldLabel>
              ))}
            </StyledFields>
          </StyledFilter>
        )
      })}

      <StyledButtons>
        <Button variant="ghost" size="sm" type="button" onClick={onReset}>
          {t('tracks.clean.reset')}
        </Button>
        <Button
          variant="contained"
          size="sm"
          type="button"
          onClick={onApply}
          data-testid="apply-clean"
        >
          {t('tracks.clean.apply')}
        </Button>
      </StyledButtons>
    </StyledPanel>
  )
}
