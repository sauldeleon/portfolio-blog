'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  type GpxPoint,
  cumulativeDistances,
  elevationProfile,
} from '@sdlgr/gpx-tools'

import { useClientTranslation } from '@web/i18n/client'

import type { PointSelection } from '../TrackWorkspace/TrackWorkspace'
import { StyledEmpty, StyledProfile } from './ElevationProfile.styles'

const AXIS_TICK = { fontSize: 9, fill: 'rgba(251,251,251,0.4)' }

/* istanbul ignore next -- recharts formatters, rendered by the real chart only */
const formatKm = (v: number) => `${v.toFixed(1)} km`
/* istanbul ignore next */
const formatMetres = (v: number) => `${Math.round(v)}\u00a0m`

export interface ElevationProfileProps {
  points: GpxPoint[]
  selection: PointSelection | null
  /** Track point index under the cursor, or null when leaving the chart. */
  onHover: (index: number | null) => void
  /** Track point index clicked on the chart. */
  onSelect: (index: number) => void
}

export function ElevationProfile({
  points,
  selection,
  onHover,
  onSelect,
}: ElevationProfileProps) {
  const { t } = useClientTranslation('admin')
  const data = useMemo(
    () =>
      elevationProfile(points).map((p) => ({
        index: p.index,
        km: p.distance / 1000,
        ele: p.ele,
      })),
    [points],
  )
  const distances = useMemo(() => cumulativeDistances(points), [points])

  if (data.length === 0) {
    return <StyledEmpty>{t('tracks.profile.empty')}</StyledEmpty>
  }

  const indexAt = (state: { activeTooltipIndex?: number | string | null }) => {
    const sample =
      state.activeTooltipIndex == null
        ? undefined
        : data[Number(state.activeTooltipIndex)]
    return sample?.index ?? null
  }

  /* istanbul ignore next -- recharts tooltip, rendered by the real chart only */
  const tooltipFormatter = (v: unknown) => [
    formatMetres(Number(v)),
    t('tracks.profile.ele'),
  ]
  /* istanbul ignore next */
  const tooltipLabel = (v: unknown) => formatKm(Number(v))

  const lo = selection ? Math.min(selection.from, selection.to) : -1
  const hi = selection ? Math.max(selection.from, selection.to) : -1

  return (
    <StyledProfile data-testid="elevation-profile">
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart
          data={data}
          margin={{ top: 6, right: 8, bottom: 0, left: 0 }}
          onMouseMove={(state) => onHover(indexAt(state))}
          onMouseLeave={() => onHover(null)}
          onClick={(state) => {
            const index = indexAt(state)
            if (index !== null) onSelect(index)
          }}
        >
          <XAxis
            dataKey="km"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatKm}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={['dataMin - 20', 'dataMax + 20']}
            tickFormatter={formatMetres}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={tooltipLabel}
            contentStyle={{
              background: '#1a1a1a',
              border: '1px solid rgba(251,251,251,0.1)',
              fontSize: '0.65rem',
            }}
            labelStyle={{ fontSize: '0.7rem' }}
            itemStyle={{ fontSize: '0.65rem' }}
          />
          {hi > lo && (
            <ReferenceArea
              x1={distances[lo] / 1000}
              x2={distances[hi] / 1000}
              fill="#ffdd83"
              fillOpacity={0.25}
            />
          )}
          <Area
            type="monotone"
            dataKey="ele"
            stroke="#e63946"
            fill="#e63946"
            fillOpacity={0.18}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </StyledProfile>
  )
}
