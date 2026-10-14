'use client'

import { useMemo } from 'react'

import {
  type GpxPoint,
  cumulativeDistances,
  elevationProfile,
} from '@sdlgr/gpx-tools'
import { ElevationChart } from '@sdlgr/gpx-ui'

import { useClientTranslation } from '@web/i18n/client'

import type { PointSelection } from '../TrackWorkspace/TrackWorkspace'
import { StyledEmpty } from './ElevationProfile.styles'

export interface ElevationProfileProps {
  points: GpxPoint[]
  selection: PointSelection | null
  /** Track point index under the cursor, or null when leaving the chart. */
  onHover: (index: number | null) => void
  /** Track point index clicked on the chart. */
  onSelect: (index: number) => void
}

/** Profile of the active segment, mapping chart samples back to track points. */
export function ElevationProfile({
  points,
  selection,
  onHover,
  onSelect,
}: ElevationProfileProps) {
  const { t } = useClientTranslation('admin')
  const samples = useMemo(() => elevationProfile(points), [points])
  const distances = useMemo(() => cumulativeDistances(points), [points])

  if (samples.length === 0) {
    return <StyledEmpty>{t('tracks.profile.empty')}</StyledEmpty>
  }

  const lo = selection ? Math.min(selection.from, selection.to) : -1
  const hi = selection ? Math.max(selection.from, selection.to) : -1

  return (
    <ElevationChart
      data={samples.map((s) => ({ km: s.distance / 1000, ele: s.ele }))}
      color="#e63946"
      height={120}
      valueLabel={t('tracks.profile.ele')}
      highlight={
        hi > lo
          ? { fromKm: distances[lo] / 1000, toKm: distances[hi] / 1000 }
          : null
      }
      onHover={(i) => onHover(i === null ? null : samples[i].index)}
      onSelect={(i) => onSelect(samples[i].index)}
      data-testid="elevation-profile"
    />
  )
}
