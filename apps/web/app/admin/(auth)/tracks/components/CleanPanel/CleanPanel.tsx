'use client'

import { Button } from '@sdlgr/button'
import { Checkbox } from '@sdlgr/checkbox'
import type {
  CleanOptions,
  SimplifyAlgorithm,
  TrackStats,
} from '@sdlgr/gpx-tools'

import { useClientTranslation } from '@web/i18n/client'

import {
  formatDistance,
  formatDuration,
  formatElevation,
} from '../../utils/format'
import {
  StyledAlgorithms,
  StyledButtons,
  StyledFieldLabel,
  StyledFields,
  StyledFilter,
  StyledHelp,
  StyledNumberInput,
  StyledPanel,
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

export interface CleanPanelProps {
  options: CleanOptions
  onChange: (options: CleanOptions) => void
  onApply: () => void
  onReset: () => void
  currentStats: TrackStats
  previewStats: TrackStats | null
}

export function CleanPanel({
  options,
  onChange,
  onApply,
  onReset,
  currentStats,
  previewStats,
}: CleanPanelProps) {
  const { t } = useClientTranslation('admin')

  function update(key: FilterKey, patch: Record<string, unknown>) {
    onChange({ ...options, [key]: { ...options[key], ...patch } })
  }

  return (
    <StyledPanel data-testid="clean-panel">
      <StyledHelp>{t('tracks.clean.intro')}</StyledHelp>
      <StyledStatsTable>
        <thead>
          <tr>
            <th />
            <th>{t('tracks.stats.current')}</th>
            <th>{t('tracks.stats.preview')}</th>
          </tr>
        </thead>
        <tbody>
          {STAT_ROWS.map((row) => (
            <tr key={row.key}>
              <th scope="row">{t(`tracks.stats.${row.key}`)}</th>
              <td>{row.format(currentStats)}</td>
              <td data-testid={`preview-${row.key}`}>
                {previewStats ? row.format(previewStats) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </StyledStatsTable>

      {FILTERS.map(({ key, fields }) => {
        const values = options[key] as unknown as Record<string, number> & {
          enabled: boolean
        }
        const isVisvalingam =
          key === 'simplify' && options.simplify.algorithm === 'visvalingam'
        return (
          <StyledFilter key={key} data-testid={`filter-${key}`}>
            <Checkbox
              id={`clean-${key}`}
              label={t(`tracks.clean.${key}.label`)}
              checked={values.enabled}
              onChange={(enabled) => update(key, { enabled })}
            />
            <StyledHelp>{t(`tracks.clean.${key}.help`)}</StyledHelp>
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
                    disabled={!values.enabled}
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
