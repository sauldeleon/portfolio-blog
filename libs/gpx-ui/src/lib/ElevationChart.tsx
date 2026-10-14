'use client'

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
  StyledElevationChart,
  StyledElevationLabel,
} from './ElevationChart.styles'

export interface ElevationSample {
  /** Kilometres from the start. */
  km: number
  /** Metres. */
  ele: number
}

export interface ElevationChartProps {
  data: ElevationSample[]
  color: string
  height?: number
  /** Title shown above the chart (e.g. the track name). */
  label?: string
  /** Tooltip name of the elevation value. */
  valueLabel?: string
  /** Kilometre range to highlight. */
  highlight?: { fromKm: number; toKm: number } | null
  /** Index of the sample under the cursor, or null when leaving. */
  onHover?: (index: number | null) => void
  /** Index of the clicked sample. */
  onSelect?: (index: number) => void
  'data-testid'?: string
}

const AXIS_TICK = { fontSize: 9, fill: 'rgba(251,251,251,0.4)' }

/* istanbul ignore next -- recharts formatters run inside the real chart only */
const formatKm = (v: number) => `${Number(v).toFixed(1)} km`
/* istanbul ignore next */
const formatMetres = (v: number) => `${Math.round(Number(v))}\u00a0m`

type ChartState = { activeTooltipIndex?: number | string | null }

/** Elevation profile shared by the post map and the admin track editor. */
export function ElevationChart({
  data,
  color,
  height = 110,
  label,
  valueLabel = 'Elevation',
  highlight = null,
  onHover,
  onSelect,
  'data-testid': testId = 'elevation-chart',
}: ElevationChartProps) {
  if (data.length === 0) return null

  const elevations = data.map((p) => p.ele)
  const minEle = Math.min(...elevations)
  const maxEle = Math.max(...elevations)
  const pad = (maxEle - minEle) * 0.15 + 10
  const yDomain: [number, number] = [
    Math.floor((minEle - pad) / 10) * 10,
    Math.ceil((maxEle + pad) / 10) * 10,
  ]

  const indexAt = (state: ChartState): number | null => {
    if (state.activeTooltipIndex == null) return null
    const index = Number(state.activeTooltipIndex)
    return index < data.length ? index : null
  }

  /* istanbul ignore next -- recharts tooltip, rendered by the real chart only */
  const tooltipFormatter = (v: unknown) => [formatMetres(Number(v)), valueLabel]
  /* istanbul ignore next */
  const tooltipLabel = (v: unknown) => formatKm(Number(v))

  return (
    <StyledElevationChart data-testid={testId}>
      {label && (
        <StyledElevationLabel data-testid="elevation-label">
          {label}
        </StyledElevationLabel>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
          onMouseMove={(state) => onHover?.(indexAt(state))}
          onMouseLeave={() => onHover?.(null)}
          onClick={(state) => {
            const index = indexAt(state)
            if (index !== null) onSelect?.(index)
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
            domain={yDomain}
            tickFormatter={formatMetres}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={50}
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
          {highlight && highlight.toKm > highlight.fromKm && (
            <ReferenceArea
              x1={highlight.fromKm}
              x2={highlight.toKm}
              fill="#ffdd83"
              fillOpacity={0.25}
            />
          )}
          <Area
            type="monotone"
            dataKey="ele"
            stroke={color}
            fill={color}
            fillOpacity={0.18}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </StyledElevationChart>
  )
}
