import { fireEvent, screen } from '@testing-library/react'

import type { GpxPoint, GpxTrack } from '@sdlgr/gpx-tools'
import { renderApp } from '@sdlgr/test-utils'

import { EditPanel, type EditPanelProps } from './EditPanel'

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}))

const points: GpxPoint[] = [
  {
    lat: 42.1234567,
    lon: -0.1234567,
    ele: 1000.25,
    time: Date.UTC(2026, 5, 4, 9),
  },
  { lat: 42.2, lon: -0.2, ele: null, time: null },
  { lat: 42.3, lon: -0.3, ele: null, time: null },
]

const oneSegment: GpxTrack[] = [{ name: 'T', segments: [{ points }] }]

function renderPanel(props: Partial<EditPanelProps> = {}) {
  const callbacks = {
    onActiveSegmentChange: vi.fn(),
    onDeleteSelection: vi.fn(),
    onClearSelection: vi.fn(),
    onToggleInsertMode: vi.fn(),
  }
  renderApp(
    <EditPanel
      tracks={oneSegment}
      activeSegment={{ track: 0, segment: 0 }}
      points={points}
      selection={null}
      insertMode={false}
      {...callbacks}
      {...props}
    />,
  )
  return callbacks
}

describe('EditPanel', () => {
  it('shows help and no selection', () => {
    renderPanel()
    expect(screen.getByText('tracks.edit.noSelection')).toBeInTheDocument()
    expect(screen.queryByTestId('segment-0-0')).not.toBeInTheDocument()
  })

  it('lists segments when there is more than one', () => {
    const { onActiveSegmentChange } = renderPanel({
      tracks: [
        { name: 'A', segments: [{ points }, { points: [] }] },
        { name: 'B', segments: [{ points }] },
      ],
      activeSegment: { track: 0, segment: 1 },
    })
    expect(screen.getByTestId('segment-0-1')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByTestId('segment-1-0')).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByTestId('segment-1-0')).toHaveTextContent(
      '"track":2,"segment":1,"count":3',
    )
    fireEvent.click(screen.getByTestId('segment-1-0'))
    expect(onActiveSegmentChange).toHaveBeenCalledWith({ track: 1, segment: 0 })
  })

  it('toggles insert mode', () => {
    const { onToggleInsertMode } = renderPanel()
    expect(screen.getByTestId('toggle-insert')).toHaveTextContent(
      'tracks.edit.insertOff',
    )
    fireEvent.click(screen.getByTestId('toggle-insert'))
    expect(onToggleInsertMode).toHaveBeenCalled()
  })

  it('shows insert mode as active', () => {
    renderPanel({ insertMode: true })
    expect(screen.getByTestId('toggle-insert')).toHaveTextContent(
      'tracks.edit.insertOn',
    )
  })

  it('describes a single selected point', () => {
    const { onDeleteSelection, onClearSelection } = renderPanel({
      selection: { from: 0, to: 0 },
    })
    const details = screen.getByTestId('selection-details')
    expect(details).toHaveTextContent('tracks.edit.selectedPoint {"index":1}')
    expect(details).toHaveTextContent('42.123457')
    expect(details).toHaveTextContent('1000.3 m')
    expect(details).toHaveTextContent('2026-06-04T09:00:00Z')
    fireEvent.click(screen.getByTestId('delete-selection'))
    expect(screen.getByTestId('delete-selection')).toHaveTextContent(
      'tracks.edit.deletePoint',
    )
    fireEvent.click(screen.getByText('tracks.edit.clearSelection'))
    expect(onDeleteSelection).toHaveBeenCalled()
    expect(onClearSelection).toHaveBeenCalled()
  })

  it('shows dashes for a point without elevation or time', () => {
    renderPanel({ selection: { from: 1, to: 1 } })
    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  it('describes a selected range', () => {
    renderPanel({ selection: { from: 2, to: 0 } })
    expect(screen.getByTestId('selection-details')).toHaveTextContent(
      'tracks.edit.selectedRange {"from":1,"to":3,"count":3}',
    )
    expect(screen.getByTestId('delete-selection')).toHaveTextContent(
      'tracks.edit.deleteRange',
    )
  })
})
