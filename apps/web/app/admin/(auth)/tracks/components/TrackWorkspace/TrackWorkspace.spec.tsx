import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { AxiosError, AxiosHeaders } from 'axios'

import {
  type CleanOptions,
  DEFAULT_CLEAN_OPTIONS,
  type GpxTrack,
  type GpxWaypoint,
  type TrackStats,
  parseGpxFile,
} from '@sdlgr/gpx-tools'
import { renderApp } from '@sdlgr/test-utils'

import type { TrackEditorMapProps } from '../TrackEditorMap'
import { TrackWorkspace } from './TrackWorkspace'

const mockSaveTrackFile = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}))

jest.mock('../../utils/trackApi', () => ({
  ...jest.requireActual('../../utils/trackApi'),
  saveTrackFile: (...args: unknown[]) => mockSaveTrackFile(...args),
}))

const mockCountPoints = (tracks: GpxTrack[]) =>
  tracks.reduce(
    (acc, t) => acc + t.segments.reduce((a, s) => a + s.points.length, 0),
    0,
  )

jest.mock('../TrackEditorMap', () => ({
  TrackEditorMap: (props: TrackEditorMapProps) => (
    <div
      data-testid="map"
      data-mode={props.mode}
      data-click-mode={String(props.clickMode)}
      data-points={mockCountPoints(props.tracks)}
      data-preview={props.preview ? mockCountPoints(props.preview) : 'none'}
      data-selection={JSON.stringify(props.selection)}
      data-show-vertices={String(props.showVertices)}
      data-waypoints={props.waypoints.map((w) => w.name).join(',')}
      data-waypoint-coords={JSON.stringify(
        props.waypoints.map((w) => [w.lat, w.lon, w.ele]),
      )}
      data-selected-waypoint={props.selectedWaypointId ?? ''}
      data-hover={JSON.stringify(props.hoverPoint)}
      data-focus={JSON.stringify(props.focusPoint)}
    >
      <button data-testid="toggle-vertices" onClick={props.onToggleVertices} />
      <button
        data-testid="vertex-1"
        onClick={() => props.onVertexClick(1, false)}
      />
      <button
        data-testid="vertex-3-shift"
        onClick={() => props.onVertexClick(3, true)}
      />
      <button
        data-testid="vertex-move"
        onClick={() => props.onVertexMove(0, { lat: 10, lon: 20 })}
      />
      <button
        data-testid="map-click"
        onClick={() => props.onMapClick({ lat: 42.00005, lon: 0.00001 })}
      />
      <button
        data-testid="map-click-track"
        onClick={() => props.onMapClick({ lat: 42.00005, lon: 0.00001 }, true)}
      />
      <button
        data-testid="waypoint-click"
        onClick={() => props.onWaypointClick(props.waypoints[0].id)}
      />
      <button
        data-testid="waypoint-move"
        onClick={() =>
          props.onWaypointMove(props.waypoints[0].id, { lat: 5, lon: 6 })
        }
      />
      <span data-testid="first-point">
        {JSON.stringify(
          props.tracks[0]?.segments[0]?.points[0] && [
            props.tracks[0].segments[0].points[0].lat,
            props.tracks[0].segments[0].points[0].lon,
          ],
        )}
      </span>
    </div>
  ),
}))

jest.mock('../ElevationProfile', () => ({
  ElevationProfile: (props: {
    points: unknown[]
    selection: unknown
    onHover: (i: number | null) => void
    onSelect: (i: number) => void
  }) => (
    <div
      data-testid="profile"
      data-points={props.points.length}
      data-selection={JSON.stringify(props.selection)}
    >
      <button data-testid="profile-hover" onClick={() => props.onHover(2)} />
      <button
        data-testid="profile-hover-gone"
        onClick={() => props.onHover(99)}
      />
      <button data-testid="profile-leave" onClick={() => props.onHover(null)} />
      <button data-testid="profile-select" onClick={() => props.onSelect(3)} />
    </div>
  ),
}))

jest.mock('../CleanPanel', () => ({
  CleanPanel: (props: {
    options: CleanOptions
    onChange: (o: CleanOptions) => void
    onApply: () => void
    onReset: () => void
    currentStats: TrackStats
    previewStats: TrackStats | null
    scope: string
    onScopeChange: (scope: 'track' | 'section') => void
    section: unknown
    onSectionChange: (section: { from: number; to: number }) => void
    sectionStats: { current: TrackStats; preview: TrackStats } | null
  }) => (
    <div
      data-testid="clean-panel"
      data-tolerance={props.options.simplify.tolerance}
      data-scope={props.scope}
      data-section={JSON.stringify(props.section)}
      data-section-stats={
        props.sectionStats
          ? `${props.sectionStats.current.points}>${props.sectionStats.preview.points}`
          : 'none'
      }
    >
      <button
        data-testid="clean-scope-track"
        onClick={() => props.onScopeChange('track')}
      />
      <button
        data-testid="clean-scope-section"
        onClick={() => props.onScopeChange('section')}
      />
      <button
        data-testid="clean-section-km"
        onClick={() => props.onSectionChange({ from: 0, to: 4 })}
      />
      <button
        data-testid="clean-off"
        onClick={() =>
          props.onChange({
            ...props.options,
            speedSpikes: { ...props.options.speedSpikes, enabled: false },
            minDistance: { ...props.options.minDistance, enabled: false },
            simplify: {
              ...props.options.simplify,
              enabled: false,
              tolerance: 9,
            },
          })
        }
      />
      <button data-testid="clean-apply" onClick={props.onApply} />
      <button data-testid="clean-reset" onClick={props.onReset} />
    </div>
  ),
}))

jest.mock('../EditPanel', () => ({
  EditPanel: (props: {
    onDeleteSelection: () => void
    onClearSelection: () => void
    onToggleInsertMode: () => void
    onActiveSegmentChange: (r: { track: number; segment: number }) => void
    points: unknown[]
  }) => (
    <div data-testid="edit-panel" data-points={props.points.length}>
      <button data-testid="edit-delete" onClick={props.onDeleteSelection} />
      <button data-testid="edit-clear" onClick={props.onClearSelection} />
      <button data-testid="edit-insert" onClick={props.onToggleInsertMode} />
      <button
        data-testid="edit-segment"
        onClick={() => props.onActiveSegmentChange({ track: 0, segment: 1 })}
      />
      <input data-testid="edit-input" />
    </div>
  ),
}))

jest.mock('../WaypointsPanel', () => ({
  WaypointsPanel: (props: {
    waypoints: GpxWaypoint[]
    selectedId: string | null
    onSelect: (id: string | null) => void
    onChange: (id: string, patch: Partial<GpxWaypoint>) => void
    onDelete: (id: string) => void
    onMove: (from: number, to: number) => void
    onToggleAddMode: () => void
    focusNameId: string | null
  }) => (
    <div
      data-testid="waypoints-panel"
      data-selected={props.selectedId ?? ''}
      data-focus-name={props.focusNameId ?? ''}
    >
      <button
        data-testid="wpt-snap"
        onClick={() => props.onChange(props.waypoints[0].id, { snap: true })}
      />
      <button data-testid="wpt-add" onClick={props.onToggleAddMode} />
      <button
        data-testid="wpt-rename"
        onClick={() =>
          props.onChange(props.waypoints[0].id, { name: 'Renamed' })
        }
      />
      <button
        data-testid="wpt-delete"
        onClick={() => props.onDelete(props.waypoints[0].id)}
      />
      <button data-testid="wpt-deselect" onClick={() => props.onSelect(null)} />
      <button data-testid="wpt-move" onClick={() => props.onMove(0, 1)} />
    </div>
  ),
}))

const GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1">
  <wpt lat="42.0002" lon="0"><ele>1005</ele><name>Fuente</name></wpt>
  <trk><name>A</name>
    <trkseg>
      <trkpt lat="42.0000" lon="0"><ele>1000</ele><time>2026-06-04T09:00:00Z</time></trkpt>
      <trkpt lat="42.0001" lon="0"><ele>1001</ele><time>2026-06-04T09:00:10Z</time></trkpt>
      <trkpt lat="42.0002" lon="0"><ele>1002</ele><time>2026-06-04T09:00:20Z</time></trkpt>
      <trkpt lat="42.0003" lon="0"><ele>1003</ele><time>2026-06-04T09:00:30Z</time></trkpt>
      <trkpt lat="42.0004" lon="0"><ele>1004</ele><time>2026-06-04T09:00:40Z</time></trkpt>
    </trkseg>
    <trkseg>
      <trkpt lat="42.1" lon="0"/><trkpt lat="42.2" lon="0"/>
    </trkseg>
  </trk>
  <trk><name>B</name><trkseg><trkpt lat="43" lon="0"/><trkpt lat="43.1" lon="0"/></trkseg></trk>
</gpx>`

const mockWriteText = jest.fn()

function renderWorkspace(
  existingPaths: string[] = [],
  path = 'dir/a.gpx',
  gpx = GPX,
) {
  return renderApp(
    <TrackWorkspace
      path={path}
      file={parseGpxFile(gpx)}
      existingPaths={existingPaths}
    />,
  )
}

const map = () => screen.getByTestId('map')
const key = (init: KeyboardEventInit, target: EventTarget = window) =>
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, ...init }),
    )
  })

beforeEach(() => {
  jest.clearAllMocks()
  window.scrollTo = jest.fn()
  mockWriteText.mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText: mockWriteText } })
})

describe('TrackWorkspace', () => {
  it('shows the summary and where it saves', () => {
    renderWorkspace()
    expect(screen.getByTestId('track-summary')).toHaveTextContent('"points":9')
    expect(screen.getByTestId('track-summary')).toHaveTextContent(
      '"waypoints":1',
    )
    expect(screen.getByTestId('save-target')).toHaveTextContent(
      'tracks.editor.targetNew {"path":"dir/a-clean.gpx"}',
    )
    expect(screen.getByTestId('undo')).toBeDisabled()
    expect(screen.getByTestId('redo')).toBeDisabled()
  })

  it('warns when the clean file already exists', () => {
    renderWorkspace(['dir/a-clean.gpx'])
    expect(screen.getByTestId('save-target')).toHaveTextContent(
      'tracks.editor.targetOverwrite',
    )
  })

  it('previews and applies cleaning, with undo and redo', () => {
    renderWorkspace()
    expect(map()).toHaveAttribute('data-mode', 'clean')
    expect(map()).toHaveAttribute('data-preview', '6')
    fireEvent.click(screen.getByTestId('clean-off'))
    expect(map()).toHaveAttribute('data-preview', '9')
    fireEvent.click(screen.getByTestId('clean-reset'))
    expect(map()).toHaveAttribute('data-preview', '6')
    fireEvent.click(screen.getByTestId('clean-apply'))
    expect(map()).toHaveAttribute('data-points', '6')
    expect(screen.getByTestId('save-target')).toHaveTextContent(
      'tracks.editor.unsaved',
    )
    fireEvent.click(screen.getByTestId('undo'))
    expect(map()).toHaveAttribute('data-points', '9')
    fireEvent.click(screen.getByTestId('redo'))
    expect(map()).toHaveAttribute('data-points', '6')
    expect(screen.getByTestId('clean-panel')).toHaveAttribute(
      'data-tolerance',
      String(DEFAULT_CLEAN_OPTIONS.simplify.tolerance),
    )
  })

  it('cleans only the selected section and keeps it selected', () => {
    renderWorkspace()
    const panel = () => screen.getByTestId('clean-panel')
    expect(panel()).toHaveAttribute('data-section', 'null')
    expect(panel()).toHaveAttribute('data-section-stats', 'none')
    // A single point is not a section.
    fireEvent.click(screen.getByTestId('vertex-1'))
    expect(panel()).toHaveAttribute('data-section', 'null')
    expect(map()).toHaveAttribute('data-preview', '6')

    fireEvent.click(screen.getByTestId('clean-scope-track'))
    fireEvent.click(screen.getByTestId('vertex-3-shift'))
    // Picking a section switches back to cleaning it.
    expect(panel()).toHaveAttribute('data-scope', 'section')
    expect(panel()).toHaveAttribute('data-section', '{"from":1,"to":3}')
    expect(screen.getByTestId('profile')).toHaveAttribute(
      'data-selection',
      '{"from":1,"to":3}',
    )
    // Points 1–3 lie on a line: only #2 goes, everything else stays.
    expect(map()).toHaveAttribute('data-preview', '8')
    expect(panel()).toHaveAttribute('data-section-stats', '3>2')

    fireEvent.click(screen.getByTestId('clean-scope-track'))
    expect(map()).toHaveAttribute('data-preview', '6')
    expect(panel()).toHaveAttribute('data-section-stats', 'none')
    fireEvent.click(screen.getByTestId('clean-scope-section'))

    fireEvent.click(screen.getByTestId('clean-apply'))
    expect(map()).toHaveAttribute('data-points', '8')
    expect(map()).toHaveAttribute('data-selection', '{"from":1,"to":2}')
    fireEvent.click(screen.getByTestId('undo'))
    expect(map()).toHaveAttribute('data-points', '9')

    // The km fields pick a section too.
    fireEvent.click(screen.getByTestId('clean-scope-track'))
    fireEvent.click(screen.getByTestId('clean-section-km'))
    expect(panel()).toHaveAttribute('data-scope', 'section')
    expect(panel()).toHaveAttribute('data-section', '{"from":0,"to":4}')
  })

  it('selects, moves and deletes points', () => {
    renderWorkspace()
    fireEvent.click(screen.getByTestId('tab-edit'))
    expect(map()).toHaveAttribute('data-preview', 'none')
    expect(screen.getByTestId('edit-panel')).toHaveAttribute('data-points', '5')
    fireEvent.click(screen.getByTestId('vertex-3-shift'))
    expect(map()).toHaveAttribute('data-selection', '{"from":3,"to":3}')
    fireEvent.click(screen.getByTestId('vertex-1'))
    fireEvent.click(screen.getByTestId('vertex-3-shift'))
    expect(map()).toHaveAttribute('data-selection', '{"from":1,"to":3}')
    fireEvent.click(screen.getByTestId('edit-delete'))
    expect(map()).toHaveAttribute('data-points', '6')
    expect(map()).toHaveAttribute('data-selection', 'null')
    // Deleting without a selection is a no-op.
    fireEvent.click(screen.getByTestId('edit-delete'))
    expect(map()).toHaveAttribute('data-points', '6')
    fireEvent.click(screen.getByTestId('vertex-move'))
    expect(screen.getByTestId('first-point')).toHaveTextContent('[10,20]')
    fireEvent.click(screen.getByTestId('vertex-1'))
    fireEvent.click(screen.getByTestId('edit-clear'))
    expect(map()).toHaveAttribute('data-selection', 'null')
  })

  it('edits the active segment only', () => {
    renderWorkspace()
    fireEvent.click(screen.getByTestId('tab-edit'))
    fireEvent.click(screen.getByTestId('vertex-1'))
    fireEvent.click(screen.getByTestId('edit-segment'))
    expect(map()).toHaveAttribute('data-selection', 'null')
    expect(screen.getByTestId('edit-panel')).toHaveAttribute('data-points', '2')
    fireEvent.click(screen.getByTestId('vertex-1'))
    fireEvent.click(screen.getByTestId('edit-delete'))
    expect(screen.getByTestId('edit-panel')).toHaveAttribute('data-points', '1')
    expect(map()).toHaveAttribute('data-points', '8')
  })

  it('inserts points in insert mode only', () => {
    renderWorkspace()
    fireEvent.click(screen.getByTestId('tab-edit'))
    fireEvent.click(screen.getByTestId('map-click'))
    expect(map()).toHaveAttribute('data-points', '9')
    fireEvent.click(screen.getByTestId('edit-insert'))
    expect(map()).toHaveAttribute('data-click-mode', 'true')
    fireEvent.click(screen.getByTestId('map-click'))
    expect(map()).toHaveAttribute('data-points', '10')
    // Changing tab leaves insert mode.
    fireEvent.click(screen.getByTestId('tab-clean'))
    expect(map()).toHaveAttribute('data-click-mode', 'false')
  })

  it('handles keyboard shortcuts', () => {
    renderWorkspace()
    fireEvent.click(screen.getByTestId('tab-edit'))
    fireEvent.click(screen.getByTestId('vertex-1'))
    key({ key: 'Delete' })
    expect(map()).toHaveAttribute('data-points', '8')
    key({ key: 'z', ctrlKey: true })
    expect(map()).toHaveAttribute('data-points', '9')
    key({ key: 'Z', metaKey: true, shiftKey: true })
    expect(map()).toHaveAttribute('data-points', '8')
    key({ key: 'z', metaKey: true })
    key({ key: 'y', ctrlKey: true })
    expect(map()).toHaveAttribute('data-points', '8')
    fireEvent.click(screen.getByTestId('vertex-1'))
    fireEvent.click(screen.getByTestId('edit-insert'))
    key({ key: 'Escape' })
    expect(map()).toHaveAttribute('data-selection', 'null')
    expect(map()).toHaveAttribute('data-click-mode', 'false')
    // Ignored while typing and for unrelated keys.
    fireEvent.click(screen.getByTestId('vertex-1'))
    key({ key: 'Backspace' }, screen.getByTestId('edit-input'))
    key({ key: 'a' })
    expect(map()).toHaveAttribute('data-points', '8')
    // Delete only works in the edit tab.
    fireEvent.click(screen.getByTestId('tab-clean'))
    key({ key: 'Backspace' })
    expect(map()).toHaveAttribute('data-points', '8')
  })

  it('shows the points on request', () => {
    renderWorkspace()
    expect(map()).toHaveAttribute('data-show-vertices', 'false')
    fireEvent.click(screen.getByTestId('toggle-vertices'))
    expect(map()).toHaveAttribute('data-show-vertices', 'true')
    key({ key: 'p' })
    expect(map()).toHaveAttribute('data-show-vertices', 'false')
    key({ key: 'P' })
    expect(map()).toHaveAttribute('data-show-vertices', 'true')
    key({ key: 'Escape' })
    expect(map()).toHaveAttribute('data-show-vertices', 'false')
    // Ctrl/Cmd+P stays the browser's.
    key({ key: 'p', ctrlKey: true })
    key({ key: 'p', metaKey: true })
    expect(map()).toHaveAttribute('data-show-vertices', 'false')
    fireEvent.click(screen.getByTestId('tab-waypoints'))
    key({ key: 'p' })
    expect(map()).toHaveAttribute('data-show-vertices', 'false')
  })

  it('ignores shortcuts in content-editable elements', () => {
    renderWorkspace()
    const editable = document.createElement('div')
    editable.contentEditable = 'true'
    Object.defineProperty(editable, 'isContentEditable', { value: true })
    document.body.appendChild(editable)
    fireEvent.click(screen.getByTestId('clean-apply'))
    key({ key: 'z', ctrlKey: true }, editable)
    expect(screen.getByTestId('undo')).toBeEnabled()
    editable.remove()
  })

  it('adds, selects, edits, moves and deletes waypoints', () => {
    renderWorkspace()
    fireEvent.click(screen.getByTestId('tab-waypoints'))
    fireEvent.click(screen.getByTestId('map-click'))
    expect(map()).toHaveAttribute('data-waypoints', 'Fuente')
    fireEvent.click(screen.getByTestId('wpt-add'))
    expect(map()).toHaveAttribute('data-click-mode', 'true')
    fireEvent.click(screen.getByTestId('map-click'))
    expect(map()).toHaveAttribute(
      'data-waypoints',
      'Fuente,tracks.waypoints.defaultName {"n":2}',
    )
    // Add mode stays on, and the new waypoint's name gets the focus.
    expect(map()).toHaveAttribute('data-click-mode', 'true')
    const panel = screen.getByTestId('waypoints-panel')
    expect(panel.dataset.selected).not.toBe('')
    expect(panel.dataset.focusName).toBe(panel.dataset.selected)
    fireEvent.click(screen.getByTestId('wpt-add'))

    fireEvent.click(screen.getByTestId('wpt-deselect'))
    fireEvent.click(screen.getByTestId('waypoint-click'))
    expect(map().dataset.selectedWaypoint).not.toBe('')
    fireEvent.click(screen.getByTestId('wpt-rename'))
    expect(map().dataset.waypoints).toMatch(/^Renamed,/)
    fireEvent.click(screen.getByTestId('waypoint-move'))
    fireEvent.click(screen.getByTestId('wpt-delete'))
    expect(map()).toHaveAttribute(
      'data-waypoints',
      'tracks.waypoints.defaultName {"n":2}',
    )
    expect(screen.getByTestId('waypoints-panel')).toHaveAttribute(
      'data-selected',
      '',
    )
  })

  it('pins waypoints to the track', () => {
    renderWorkspace()
    fireEvent.click(screen.getByTestId('tab-waypoints'))
    fireEvent.click(screen.getByTestId('wpt-add'))
    fireEvent.click(screen.getByTestId('map-click-track'))
    const coords = () =>
      JSON.parse(map().dataset.waypointCoords as string) as number[][]
    expect(coords()[1][0]).toBeCloseTo(42.00005, 6)
    expect(coords()[1][1]).toBeCloseTo(0, 8)
    expect(coords()[1][2]).toBeCloseTo(1000.5, 4)
    // A free waypoint can be pinned later; pinned ones stay on the track.
    expect(coords()[0]).toEqual([42.0002, 0, 1005])
    fireEvent.click(screen.getByTestId('waypoint-move'))
    expect(coords()[0]).toEqual([5, 6, 1005])
    fireEvent.click(screen.getByTestId('wpt-snap'))
    const pinned = coords()[0]
    expect(pinned[1]).toBeCloseTo(0, 8)
    expect(pinned[0]).not.toBe(5)
    fireEvent.click(screen.getByTestId('waypoint-move'))
    expect(coords()[0]).toEqual(pinned)
  })

  it('keeps a pinned waypoint in place without a track', () => {
    renderWorkspace([], 'a.gpx', '<gpx><wpt lat="1" lon="1"/></gpx>')
    fireEvent.click(screen.getByTestId('tab-waypoints'))
    fireEvent.click(screen.getByTestId('wpt-snap'))
    expect(map()).toHaveAttribute('data-waypoint-coords', '[[1,1,null]]')
  })

  it('keeps the elevation of a waypoint pinned to a track without one', () => {
    renderWorkspace(
      [],
      'a.gpx',
      '<gpx><wpt lat="1" lon="1"><ele>5</ele></wpt><trk><trkseg><trkpt lat="2" lon="1"/></trkseg></trk></gpx>',
    )
    fireEvent.click(screen.getByTestId('tab-waypoints'))
    fireEvent.click(screen.getByTestId('wpt-snap'))
    expect(map()).toHaveAttribute('data-waypoint-coords', '[[2,1,5]]')
  })

  it('starts adding waypoints with W from any tab', () => {
    renderWorkspace()
    key({ key: 'w', altKey: true })
    expect(map()).toHaveAttribute('data-mode', 'clean')
    key({ key: 'w' })
    expect(map()).toHaveAttribute('data-mode', 'waypoints')
    expect(map()).toHaveAttribute('data-click-mode', 'true')
    key({ key: 'W' })
    expect(map()).toHaveAttribute('data-click-mode', 'false')
    key({ key: 'w' })
    expect(map()).toHaveAttribute('data-click-mode', 'true')
  })

  it('saves to GitHub, then offers the raw URL', async () => {
    let resolveSave: (value: unknown) => void = () => undefined
    mockSaveTrackFile.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve
      }),
    )
    renderWorkspace()
    fireEvent.click(screen.getByTestId('clean-apply'))
    fireEvent.click(screen.getByTestId('save'))
    await waitFor(() =>
      expect(screen.getByTestId('save')).toHaveTextContent(
        'tracks.editor.saving',
      ),
    )
    expect(screen.getByTestId('save')).toBeDisabled()
    await act(async () =>
      resolveSave({
        path: 'dir/a-clean.gpx',
        rawUrl: 'https://raw/dir/a-clean.gpx',
        commitSha: 'c1',
        created: true,
      }),
    )
    const result = await screen.findByTestId('save-result')
    expect(result).toHaveTextContent('https://raw/dir/a-clean.gpx')
    expect(screen.getByTestId('save-target')).not.toHaveTextContent(
      'tracks.editor.unsaved',
    )
    const [sourcePath, content] = mockSaveTrackFile.mock.calls[0]
    expect(sourcePath).toBe('dir/a.gpx')
    expect(content).toContain('<time>2026-06-04T09:00:00Z</time>')

    fireEvent.click(screen.getByTestId('copy-saved-url'))
    expect(mockWriteText).toHaveBeenCalledWith('https://raw/dir/a-clean.gpx')
    await waitFor(() =>
      expect(screen.getByTestId('copy-saved-url')).toHaveTextContent(
        'tracks.list.copied',
      ),
    )
  })

  it('strips timestamps on request', async () => {
    mockSaveTrackFile.mockResolvedValue({ path: 'x', rawUrl: 'y' })
    renderWorkspace()
    fireEvent.click(screen.getByLabelText('tracks.editor.stripTimes'))
    fireEvent.click(screen.getByTestId('save'))
    await screen.findByTestId('save-result')
    expect(mockSaveTrackFile.mock.calls[0][1]).not.toContain('<time>')
  })

  it('shows the server error message', async () => {
    mockSaveTrackFile.mockRejectedValue(
      new AxiosError('fail', '500', undefined, undefined, {
        status: 500,
        statusText: 'err',
        data: { error: 'GITHUB_TRACKS_TOKEN is not configured' },
        headers: {},
        config: { headers: new AxiosHeaders() },
      }),
    )
    renderWorkspace()
    fireEvent.click(screen.getByTestId('save'))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'GITHUB_TRACKS_TOKEN is not configured',
    )
  })

  it('falls back to a generic error', async () => {
    mockSaveTrackFile.mockRejectedValue(new Error('network'))
    renderWorkspace()
    fireEvent.click(screen.getByTestId('save'))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'tracks.editor.saveError',
    )
  })

  it('downloads the GPX', () => {
    const createObjectURL = jest.fn().mockReturnValue('blob:x')
    const revokeObjectURL = jest.fn()
    Object.assign(URL, { createObjectURL, revokeObjectURL })
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe('a-clean.gpx')
        expect(this.href).toBe('blob:x')
      })
    renderWorkspace()
    fireEvent.click(screen.getByTestId('download'))
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:x')
    click.mockRestore()
  })

  it('warns before leaving with unsaved changes', () => {
    renderWorkspace()
    const clean = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(clean)
    expect(clean.defaultPrevented).toBe(false)
    fireEvent.click(screen.getByTestId('clean-apply'))
    const dirty = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(dirty)
    expect(dirty.defaultPrevented).toBe(true)
  })

  it('copes with a file without tracks', () => {
    renderWorkspace([], 'a-clean.gpx', '<gpx><wpt lat="1" lon="1"/></gpx>')
    expect(screen.getByTestId('save-target')).toHaveTextContent(
      'tracks.editor.targetNew {"path":"a-clean.gpx"}',
    )
    fireEvent.click(screen.getByTestId('tab-edit'))
    expect(screen.getByTestId('edit-panel')).toHaveAttribute('data-points', '0')
  })

  it('links the elevation profile with the map', () => {
    renderWorkspace()
    expect(screen.getByTestId('profile')).toHaveAttribute('data-points', '5')
    expect(map()).toHaveAttribute('data-hover', 'null')
    fireEvent.click(screen.getByTestId('profile-hover'))
    expect(map()).toHaveAttribute(
      'data-hover',
      expect.stringContaining('42.0002'),
    )
    fireEvent.click(screen.getByTestId('profile-hover-gone'))
    expect(map()).toHaveAttribute('data-hover', 'null')
    fireEvent.click(screen.getByTestId('profile-leave'))
    expect(map()).toHaveAttribute('data-hover', 'null')

    // Outside the edit tab a click only pans.
    fireEvent.click(screen.getByTestId('profile-select'))
    expect(map()).toHaveAttribute('data-focus', '{"lat":42.0003,"lon":0}')
    expect(map()).toHaveAttribute('data-selection', 'null')
    expect(screen.getByTestId('profile')).toHaveAttribute(
      'data-selection',
      'null',
    )

    // The waypoints tab hides the selection from the profile.
    fireEvent.click(screen.getByTestId('vertex-1'))
    fireEvent.click(screen.getByTestId('vertex-3-shift'))
    fireEvent.click(screen.getByTestId('tab-waypoints'))
    expect(screen.getByTestId('profile')).toHaveAttribute(
      'data-selection',
      'null',
    )

    fireEvent.click(screen.getByTestId('tab-edit'))
    fireEvent.click(screen.getByTestId('profile-select'))
    expect(map()).toHaveAttribute('data-selection', '{"from":3,"to":3}')
    expect(screen.getByTestId('profile')).toHaveAttribute(
      'data-selection',
      '{"from":3,"to":3}',
    )
  })

  it('fills the viewport on wide screens', () => {
    renderWorkspace()
    expect(screen.getByTestId('track-workspace').style.height).toMatch(/px$/)
  })

  it('folds and unfolds the side panel', () => {
    renderWorkspace()
    fireEvent.click(screen.getByTestId('panel-hide'))
    expect(screen.queryByTestId('clean-panel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('tab-clean')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('panel-show'))
    expect(screen.getByTestId('clean-panel')).toBeInTheDocument()
  })

  it('switches to fullscreen with the panel floating over the map', () => {
    renderWorkspace()
    const workspace = screen.getByTestId('track-workspace')
    const stage = () => within(screen.getByTestId('map-stage'))
    expect(stage().queryByTestId('clean-panel')).not.toBeInTheDocument()
    expect(workspace.style.height).not.toBe('')

    fireEvent.click(screen.getByTestId('fullscreen'))
    expect(screen.getByTestId('fullscreen')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByTestId('fullscreen')).toHaveTextContent(
      'tracks.editor.exitFullscreen',
    )
    expect(workspace.style.height).toBe('')
    // The panel now floats inside the map stage.
    expect(stage().getByTestId('clean-panel')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('panel-hide'))
    expect(stage().getByTestId('panel-show')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('fullscreen'))
    expect(screen.getByTestId('fullscreen')).toHaveTextContent(
      'tracks.editor.fullscreen',
    )
  })

  it('reorders waypoints', () => {
    renderWorkspace()
    fireEvent.click(screen.getByTestId('tab-waypoints'))
    fireEvent.click(screen.getByTestId('wpt-add'))
    fireEvent.click(screen.getByTestId('map-click'))
    fireEvent.click(screen.getByTestId('wpt-move'))
    expect(map()).toHaveAttribute(
      'data-waypoints',
      'tracks.waypoints.defaultName {"n":2},Fuente',
    )
    fireEvent.click(screen.getByTestId('undo'))
    expect(map()).toHaveAttribute(
      'data-waypoints',
      'Fuente,tracks.waypoints.defaultName {"n":2}',
    )
  })
})
