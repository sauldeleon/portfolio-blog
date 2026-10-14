'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTheme } from 'styled-components'

import { Button } from '@sdlgr/button'
import { Checkbox } from '@sdlgr/checkbox'
import {
  type CleanOptions,
  DEFAULT_CLEAN_OPTIONS,
  type GpxFile,
  type GpxPoint,
  type GpxTrack,
  type GpxWaypoint,
  type LatLon,
  cleanGpx,
  cleanPathFor,
  computeStats,
  createWaypointId,
  deletePoints,
  elevationAt,
  insertPoint,
  moveItem,
  movePoint,
  serializeGpxFile,
  sumStats,
} from '@sdlgr/gpx-tools'

import { useClientTranslation } from '@web/i18n/client'

import { useEditHistory } from '../../hooks/useEditHistory'
import { useFillViewport } from '../../hooks/useFillViewport'
import { formatDistance, formatElevation } from '../../utils/format'
import {
  type SavedTrackFile,
  TRACKS_QUERY_KEY,
  saveTrackFile,
} from '../../utils/trackApi'
import { CleanPanel } from '../CleanPanel'
import { EditPanel } from '../EditPanel'
import { ElevationProfile } from '../ElevationProfile'
import { TrackEditorMap } from '../TrackEditorMap'
import { WaypointsPanel } from '../WaypointsPanel'
import {
  StyledBackLink,
  StyledBody,
  StyledError,
  StyledHeading,
  StyledMapStage,
  StyledPanelToggle,
  StyledSaveResult,
  StyledSidebar,
  StyledSummary,
  StyledTabs,
  StyledTarget,
  StyledTopBar,
  StyledTopBarActions,
  StyledWorkspace,
} from './TrackWorkspace.styles'

export type EditorTab = 'clean' | 'edit' | 'waypoints'

export interface SegmentRef {
  track: number
  segment: number
}

export interface PointSelection {
  from: number
  to: number
}

export interface EditorDoc {
  tracks: GpxTrack[]
  waypoints: GpxWaypoint[]
}

const TABS: EditorTab[] = ['clean', 'edit', 'waypoints']

function statsOf(tracks: GpxTrack[]) {
  return sumStats(
    tracks.flatMap((track) =>
      track.segments.map((segment) => computeStats(segment.points)),
    ),
  )
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable)
  )
}

export interface TrackWorkspaceProps {
  path: string
  file: GpxFile
  /** Paths already in the repo, to warn before overwriting. */
  existingPaths: string[]
}

export function TrackWorkspace({
  path,
  file,
  existingPaths,
}: TrackWorkspaceProps) {
  const { t } = useClientTranslation('admin')
  const queryClient = useQueryClient()
  const theme = useTheme()
  const { ref: workspaceRef, height: workspaceHeight } =
    useFillViewport<HTMLDivElement>(theme.breakpoints.lg)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const history = useEditHistory<EditorDoc>({
    tracks: file.tracks,
    waypoints: file.waypoints,
  })
  const doc = history.present
  const [savedDoc, setSavedDoc] = useState<EditorDoc>(doc)
  const [tab, setTab] = useState<EditorTab>('clean')
  const [cleanOptions, setCleanOptions] = useState<CleanOptions>(
    DEFAULT_CLEAN_OPTIONS,
  )
  const [activeSegment, setActiveSegment] = useState<SegmentRef>({
    track: 0,
    segment: 0,
  })
  const [selection, setSelection] = useState<PointSelection | null>(null)
  const [insertMode, setInsertMode] = useState(false)
  const [addWaypointMode, setAddWaypointMode] = useState(false)
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(
    null,
  )
  const [stripTimes, setStripTimes] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [focusPoint, setFocusPoint] = useState<LatLon | null>(null)

  const activePoints =
    doc.tracks[activeSegment.track]?.segments[activeSegment.segment]?.points ??
    []
  const allPoints = useMemo(
    () => doc.tracks.flatMap((tr) => tr.segments.flatMap((s) => s.points)),
    [doc.tracks],
  )
  const preview = useMemo(
    () =>
      tab === 'clean'
        ? cleanGpx({ ...file, ...doc }, cleanOptions).tracks
        : null,
    [tab, file, doc, cleanOptions],
  )
  const currentStats = useMemo(() => statsOf(doc.tracks), [doc.tracks])
  const previewStats = useMemo(
    () => (preview ? statsOf(preview) : null),
    [preview],
  )
  const isDirty = doc !== savedDoc
  const targetPath = cleanPathFor(path)
  const overwrites = existingPaths.includes(targetPath)

  const saveMutation = useMutation<SavedTrackFile, unknown, EditorDoc>({
    mutationFn: (snapshot) =>
      saveTrackFile(
        path,
        serializeGpxFile({ ...file, ...snapshot }, { stripTimes }),
      ),
    onSuccess: (_, snapshot) => {
      setSavedDoc(snapshot)
      setCopied(false)
      void queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY })
    },
  })

  const updateActivePoints = useCallback(
    (update: (points: GpxPoint[]) => GpxPoint[]) => {
      history.set((current) => ({
        ...current,
        tracks: current.tracks.map((track, ti) =>
          ti !== activeSegment.track
            ? track
            : {
                ...track,
                segments: track.segments.map((segment, si) =>
                  si !== activeSegment.segment
                    ? segment
                    : { points: update(segment.points) },
                ),
              },
        ),
      }))
    },
    [history, activeSegment],
  )

  const deleteSelection = useCallback(() => {
    if (!selection) return
    updateActivePoints((points) =>
      deletePoints(points, selection.from, selection.to),
    )
    setSelection(null)
  }, [selection, updateActivePoints])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTyping(e.target)) return
      const key = e.key.toLowerCase()
      if ((e.metaKey || e.ctrlKey) && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) history.redo()
        else history.undo()
      } else if ((e.metaKey || e.ctrlKey) && key === 'y') {
        e.preventDefault()
        history.redo()
      } else if (
        tab === 'edit' &&
        (e.key === 'Delete' || e.key === 'Backspace')
      ) {
        deleteSelection()
      } else if (e.key === 'Escape') {
        setSelection(null)
        setInsertMode(false)
        setAddWaypointMode(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [history, tab, deleteSelection])

  useEffect(() => {
    if (!isDirty) return
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  function changeTab(next: EditorTab) {
    setTab(next)
    setInsertMode(false)
    setAddWaypointMode(false)
  }

  function applyClean() {
    history.set((current) => ({
      ...current,
      tracks: cleanGpx({ ...file, ...current }, cleanOptions).tracks,
    }))
    setSelection(null)
  }

  function handleVertexClick(index: number, extend: boolean) {
    setSelection((prev) =>
      extend && prev
        ? { from: prev.from, to: index }
        : { from: index, to: index },
    )
  }

  function handleVertexMove(index: number, to: LatLon) {
    updateActivePoints((points) => movePoint(points, index, to))
  }

  function handleProfileSelect(index: number) {
    const point = activePoints[index]
    setFocusPoint({ lat: point.lat, lon: point.lon })
    if (tab === 'edit') setSelection({ from: index, to: index })
  }

  function handleActiveSegmentChange(ref: SegmentRef) {
    setActiveSegment(ref)
    setSelection(null)
  }

  function updateWaypoint(id: string, patch: Partial<GpxWaypoint>) {
    history.set((current) => ({
      ...current,
      waypoints: current.waypoints.map((w) =>
        w.id === id ? { ...w, ...patch } : w,
      ),
    }))
  }

  function deleteWaypoint(id: string) {
    history.set((current) => ({
      ...current,
      waypoints: current.waypoints.filter((w) => w.id !== id),
    }))
    setSelectedWaypointId(null)
  }

  function moveWaypoint(from: number, to: number) {
    history.set((current) => ({
      ...current,
      waypoints: moveItem(current.waypoints, from, to),
    }))
  }

  function handleMapClick(at: LatLon) {
    if (tab === 'edit' && insertMode) {
      updateActivePoints((points) => insertPoint(points, at))
      setSelection(null)
    } else if (tab === 'waypoints' && addWaypointMode) {
      const waypoint: GpxWaypoint = {
        id: createWaypointId(),
        lat: at.lat,
        lon: at.lon,
        ele: elevationAt(allPoints, at),
        name: t('tracks.waypoints.defaultName', {
          n: doc.waypoints.length + 1,
        }),
        desc: '',
        sym: 'Information',
      }
      history.set((current) => ({
        ...current,
        waypoints: [...current.waypoints, waypoint],
      }))
      setSelectedWaypointId(waypoint.id)
      setAddWaypointMode(false)
    }
  }

  function serialize() {
    return serializeGpxFile({ ...file, ...doc }, { stripTimes })
  }

  function download() {
    const url = URL.createObjectURL(
      new Blob([serialize()], { type: 'application/gpx+xml' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = targetPath.split('/').pop() as string
    link.click()
    URL.revokeObjectURL(url)
  }

  function copySavedUrl(url: string) {
    void navigator.clipboard.writeText(url).then(() => setCopied(true))
  }

  const saveError = saveMutation.isError
    ? isAxiosError<{ error?: string }>(saveMutation.error) &&
      typeof saveMutation.error.response?.data?.error === 'string'
      ? saveMutation.error.response.data.error
      : t('tracks.editor.saveError')
    : null

  // Docked beside the map normally; floating over it in fullscreen.
  const panel = isPanelOpen ? (
    <StyledSidebar $floating={isFullscreen}>
      <StyledTabs>
        <div role="tablist">
          {TABS.map((key) => (
            <Button
              variant="label"
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              active={tab === key}
              onClick={() => changeTab(key)}
              data-testid={`tab-${key}`}
            >
              {t(`tracks.tabs.${key}`)}
            </Button>
          ))}
        </div>
        <Button
          variant="label"
          type="button"
          onClick={() => setIsPanelOpen(false)}
          aria-label={t('tracks.panel.hide')}
          title={t('tracks.panel.hide')}
          data-testid="panel-hide"
        >
          ⟩
        </Button>
      </StyledTabs>
      {tab === 'clean' && (
        <CleanPanel
          options={cleanOptions}
          onChange={setCleanOptions}
          onApply={applyClean}
          onReset={() => setCleanOptions(DEFAULT_CLEAN_OPTIONS)}
          currentStats={currentStats}
          previewStats={previewStats}
        />
      )}
      {tab === 'edit' && (
        <EditPanel
          tracks={doc.tracks}
          activeSegment={activeSegment}
          onActiveSegmentChange={handleActiveSegmentChange}
          points={activePoints}
          selection={selection}
          onDeleteSelection={deleteSelection}
          onClearSelection={() => setSelection(null)}
          insertMode={insertMode}
          onToggleInsertMode={() => setInsertMode((v) => !v)}
        />
      )}
      {tab === 'waypoints' && (
        <WaypointsPanel
          waypoints={doc.waypoints}
          selectedId={selectedWaypointId}
          onSelect={setSelectedWaypointId}
          onChange={updateWaypoint}
          onDelete={deleteWaypoint}
          onMove={moveWaypoint}
          addMode={addWaypointMode}
          onToggleAddMode={() => setAddWaypointMode((v) => !v)}
        />
      )}
    </StyledSidebar>
  ) : (
    <StyledPanelToggle $floating={isFullscreen}>
      <Button
        variant="label"
        type="button"
        onClick={() => setIsPanelOpen(true)}
        aria-label={t('tracks.panel.show')}
        title={t('tracks.panel.show')}
        data-testid="panel-show"
      >
        ⟨
      </Button>
    </StyledPanelToggle>
  )

  return (
    <StyledWorkspace
      ref={workspaceRef}
      $filled={workspaceHeight !== null}
      $fullscreen={isFullscreen}
      style={
        workspaceHeight === null || isFullscreen
          ? undefined
          : { height: workspaceHeight }
      }
      data-testid="track-workspace"
    >
      <StyledTopBar>
        <div>
          <StyledBackLink href="/admin/tracks">
            {t('tracks.editor.back')}
          </StyledBackLink>
          <StyledHeading>{path}</StyledHeading>
          <StyledSummary data-testid="track-summary">
            {t('tracks.editor.summary', {
              points: currentStats.points,
              distance: formatDistance(currentStats.distance),
              ascent: formatElevation(currentStats.ascent),
              waypoints: doc.waypoints.length,
            })}
          </StyledSummary>
        </div>
        <StyledTopBarActions>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={history.undo}
            disabled={!history.canUndo}
            data-testid="undo"
          >
            {t('tracks.editor.undo')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={history.redo}
            disabled={!history.canRedo}
            data-testid="redo"
          >
            {t('tracks.editor.redo')}
          </Button>
          <Checkbox
            id="track-strip-times"
            label={t('tracks.editor.stripTimes')}
            checked={stripTimes}
            onChange={setStripTimes}
          />
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={download}
            data-testid="download"
          >
            {t('tracks.editor.download')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            aria-pressed={isFullscreen}
            data-testid="fullscreen"
          >
            {isFullscreen
              ? t('tracks.editor.exitFullscreen')
              : t('tracks.editor.fullscreen')}
          </Button>
          <Button
            variant="contained"
            size="sm"
            colorScheme="success"
            type="button"
            onClick={() => saveMutation.mutate(doc)}
            disabled={saveMutation.isPending}
            data-testid="save"
          >
            {saveMutation.isPending
              ? t('tracks.editor.saving')
              : t('tracks.editor.save')}
          </Button>
          <StyledTarget data-testid="save-target">
            {t(
              overwrites
                ? 'tracks.editor.targetOverwrite'
                : 'tracks.editor.targetNew',
              { path: targetPath },
            )}
            {isDirty && ` · ${t('tracks.editor.unsaved')}`}
          </StyledTarget>
        </StyledTopBarActions>
      </StyledTopBar>

      {saveError && <StyledError role="alert">{saveError}</StyledError>}
      {saveMutation.isSuccess && (
        <StyledSaveResult data-testid="save-result">
          <span>
            {t('tracks.editor.saved', { path: saveMutation.data.path })}
          </span>
          <code>{saveMutation.data.rawUrl}</code>
          <Button
            variant="contained"
            size="xs"
            type="button"
            onClick={() => copySavedUrl(saveMutation.data.rawUrl)}
            data-testid="copy-saved-url"
          >
            {copied ? t('tracks.list.copied') : t('tracks.list.copyUrl')}
          </Button>
          <span>{t('tracks.editor.cacheNote')}</span>
        </StyledSaveResult>
      )}

      <StyledBody $floating={isFullscreen} $panelOpen={isPanelOpen}>
        <StyledMapStage data-testid="map-stage">
          <TrackEditorMap
            original={file.tracks}
            tracks={doc.tracks}
            preview={preview}
            waypoints={doc.waypoints}
            mode={tab}
            activeSegment={activeSegment}
            selection={selection}
            clickMode={
              (tab === 'edit' && insertMode) ||
              (tab === 'waypoints' && addWaypointMode)
            }
            selectedWaypointId={selectedWaypointId}
            hoverPoint={
              hoverIndex === null ? null : (activePoints[hoverIndex] ?? null)
            }
            focusPoint={focusPoint}
            onVertexClick={handleVertexClick}
            onVertexMove={handleVertexMove}
            onMapClick={handleMapClick}
            onWaypointClick={setSelectedWaypointId}
            onWaypointMove={(id, to) =>
              updateWaypoint(id, { lat: to.lat, lon: to.lon })
            }
          />
          {isFullscreen && panel}
        </StyledMapStage>
        <ElevationProfile
          points={activePoints}
          selection={tab === 'edit' ? selection : null}
          onHover={setHoverIndex}
          onSelect={handleProfileSelect}
        />
        {!isFullscreen && panel}
      </StyledBody>
    </StyledWorkspace>
  )
}
