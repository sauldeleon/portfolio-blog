'use client'

import { Button } from '@sdlgr/button'
import type { GpxPoint, GpxTrack } from '@sdlgr/gpx-tools'

import { useClientTranslation } from '@web/i18n/client'

import type {
  PointSelection,
  SegmentRef,
} from '../TrackWorkspace/TrackWorkspace'
import {
  StyledButtons,
  StyledDetails,
  StyledHelp,
  StyledPanel,
  StyledSegments,
} from './EditPanel.styles'

export interface EditPanelProps {
  tracks: GpxTrack[]
  activeSegment: SegmentRef
  onActiveSegmentChange: (ref: SegmentRef) => void
  points: GpxPoint[]
  selection: PointSelection | null
  onDeleteSelection: () => void
  onClearSelection: () => void
  insertMode: boolean
  onToggleInsertMode: () => void
}

export function EditPanel({
  tracks,
  activeSegment,
  onActiveSegmentChange,
  points,
  selection,
  onDeleteSelection,
  onClearSelection,
  insertMode,
  onToggleInsertMode,
}: EditPanelProps) {
  const { t } = useClientTranslation('admin')
  const segments = tracks.flatMap((track, ti) =>
    track.segments.map((segment, si) => ({
      ref: { track: ti, segment: si },
      count: segment.points.length,
    })),
  )
  const lo = selection ? Math.min(selection.from, selection.to) : -1
  const hi = selection ? Math.max(selection.from, selection.to) : -1
  const single = selection && lo === hi ? points[lo] : null

  return (
    <StyledPanel data-testid="edit-panel">
      <StyledHelp>{t('tracks.edit.help')}</StyledHelp>

      {segments.length > 1 && (
        <StyledSegments>
          {segments.map(({ ref, count }) => {
            const active =
              ref.track === activeSegment.track &&
              ref.segment === activeSegment.segment
            return (
              <Button
                variant="label"
                key={`${ref.track}-${ref.segment}`}
                type="button"
                active={active}
                aria-pressed={active}
                onClick={() => onActiveSegmentChange(ref)}
                data-testid={`segment-${ref.track}-${ref.segment}`}
              >
                {t('tracks.edit.segment', {
                  track: ref.track + 1,
                  segment: ref.segment + 1,
                  count,
                })}
              </Button>
            )
          })}
        </StyledSegments>
      )}

      <Button
        variant="label"
        type="button"
        active={insertMode}
        aria-pressed={insertMode}
        onClick={onToggleInsertMode}
        data-testid="toggle-insert"
      >
        {insertMode ? t('tracks.edit.insertOn') : t('tracks.edit.insertOff')}
      </Button>

      {selection ? (
        <StyledDetails data-testid="selection-details">
          <p>
            {single
              ? t('tracks.edit.selectedPoint', { index: lo + 1 })
              : t('tracks.edit.selectedRange', {
                  from: lo + 1,
                  to: hi + 1,
                  count: hi - lo + 1,
                })}
          </p>
          {single && (
            <dl>
              <dt>{t('tracks.edit.lat')}</dt>
              <dd>{single.lat.toFixed(6)}</dd>
              <dt>{t('tracks.edit.lon')}</dt>
              <dd>{single.lon.toFixed(6)}</dd>
              <dt>{t('tracks.edit.ele')}</dt>
              <dd>
                {single.ele === null ? '—' : `${single.ele.toFixed(1)} m`}
              </dd>
              <dt>{t('tracks.edit.time')}</dt>
              <dd>
                {single.time === null
                  ? '—'
                  : new Date(single.time).toISOString().replace('.000Z', 'Z')}
              </dd>
            </dl>
          )}
          <StyledButtons>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onClearSelection}
            >
              {t('tracks.edit.clearSelection')}
            </Button>
            <Button
              variant="contained"
              size="sm"
              colorScheme="danger"
              type="button"
              onClick={onDeleteSelection}
              data-testid="delete-selection"
            >
              {single
                ? t('tracks.edit.deletePoint')
                : t('tracks.edit.deleteRange')}
            </Button>
          </StyledButtons>
        </StyledDetails>
      ) : (
        <StyledHelp>{t('tracks.edit.noSelection')}</StyledHelp>
      )}
    </StyledPanel>
  )
}
