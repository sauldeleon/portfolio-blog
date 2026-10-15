import { fireEvent, screen, within } from '@testing-library/react'

import type { GpxWaypoint } from '@sdlgr/gpx-tools'
import { renderApp } from '@sdlgr/test-utils'

import { WaypointsPanel, type WaypointsPanelProps } from './WaypointsPanel'

jest.mock('@sdlgr/gpx-tools', () => ({
  WPT_ICON_URLS: { '': 'default-icon', Summit: 'summit-icon' },
}))

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

const waypoints: GpxWaypoint[] = [
  {
    id: 'w1',
    lat: 1,
    lon: 2,
    ele: null,
    name: 'Cima',
    desc: 'line',
    sym: 'Summit',
  },
  { id: 'w2', lat: 1, lon: 2, ele: null, name: '', desc: '', sym: 'Odd' },
]

function renderPanel(props: Partial<WaypointsPanelProps> = {}) {
  const callbacks = {
    onSelect: jest.fn(),
    onChange: jest.fn(),
    onDelete: jest.fn(),
    onMove: jest.fn(),
    onToggleAddMode: jest.fn(),
  }
  renderApp(
    <WaypointsPanel
      waypoints={waypoints}
      selectedId={null}
      addMode={false}
      {...callbacks}
      {...props}
    />,
  )
  return callbacks
}

describe('WaypointsPanel', () => {
  it('shows an empty state', () => {
    renderPanel({ waypoints: [] })
    expect(screen.getByText('tracks.waypoints.empty')).toBeInTheDocument()
  })

  it('lists waypoints with icons and a fallback name', () => {
    renderPanel()
    const first = screen.getByTestId('waypoint-w1')
    expect(first).toHaveTextContent('Cima')
    expect(within(first).getByRole('presentation')).toHaveAttribute(
      'src',
      'summit-icon',
    )
    const second = screen.getByTestId('waypoint-w2')
    expect(second).toHaveTextContent('tracks.waypoints.unnamed')
    expect(within(second).getByRole('presentation')).toHaveAttribute(
      'src',
      'default-icon',
    )
  })

  it('toggles add mode', () => {
    const { onToggleAddMode } = renderPanel()
    fireEvent.click(screen.getByTestId('toggle-add-waypoint'))
    expect(onToggleAddMode).toHaveBeenCalled()
    expect(screen.getByTestId('toggle-add-waypoint')).toHaveTextContent(
      'tracks.waypoints.addOff',
    )
  })

  it('shows add mode as active', () => {
    renderPanel({ addMode: true })
    expect(screen.getByTestId('toggle-add-waypoint')).toHaveTextContent(
      'tracks.waypoints.addOn',
    )
  })

  it('selects and deselects a waypoint', () => {
    const { onSelect } = renderPanel()
    fireEvent.click(screen.getByTestId('waypoint-w1'))
    expect(onSelect).toHaveBeenCalledWith('w1')
  })

  it('collapses the selected waypoint', () => {
    const { onSelect } = renderPanel({ selectedId: 'w1' })
    fireEvent.click(screen.getByTestId('waypoint-w1'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('commits text edits on blur only when they change', () => {
    const { onChange } = renderPanel({ selectedId: 'w1' })
    const name = screen.getByTestId('waypoint-name')
    fireEvent.blur(name)
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.change(name, { target: { value: 'Pico' } })
    fireEvent.blur(name)
    expect(onChange).toHaveBeenCalledWith('w1', { name: 'Pico' })
    const desc = screen.getByTestId('waypoint-desc')
    fireEvent.change(desc, { target: { value: 'a\nb' } })
    fireEvent.blur(desc)
    expect(onChange).toHaveBeenCalledWith('w1', { desc: 'a\nb' })
    const sym = screen.getByTestId('waypoint-sym')
    fireEvent.change(sym, { target: { value: 'Binoculars' } })
    fireEvent.blur(sym)
    expect(onChange).toHaveBeenCalledWith('w1', { sym: 'Binoculars' })
  })

  it('focuses the name of a just-added waypoint', () => {
    renderPanel({ selectedId: 'w2', focusNameId: 'w2' })
    const name = screen.getByTestId('waypoint-name') as HTMLInputElement
    expect(name).toHaveFocus()
  })

  it('skips the focus when the new waypoint is not open', () => {
    renderPanel({ selectedId: null, focusNameId: 'w2' })
    expect(screen.queryByTestId('waypoint-name')).not.toBeInTheDocument()
  })

  it('confirms the name with Enter', () => {
    const { onChange } = renderPanel({ selectedId: 'w1' })
    const name = screen.getByTestId('waypoint-name')
    name.focus()
    fireEvent.change(name, { target: { value: 'Collado' } })
    fireEvent.keyDown(name, { key: 'a' })
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.keyDown(name, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('w1', { name: 'Collado' })
  })

  it('pins a waypoint to the track', () => {
    const { onChange } = renderPanel({ selectedId: 'w1' })
    const snap = screen.getByLabelText('tracks.waypoints.snap')
    expect(snap).not.toBeChecked()
    fireEvent.click(snap)
    expect(onChange).toHaveBeenCalledWith('w1', { snap: true })
  })

  it('picks an icon', () => {
    const { onChange } = renderPanel({ selectedId: 'w1' })
    expect(screen.getByTestId('symbol-Summit')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    fireEvent.click(screen.getByTestId('symbol-Summit'))
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('symbol-Warning'))
    expect(onChange).toHaveBeenCalledWith('w1', { sym: 'Warning' })
  })

  it('deletes a waypoint', () => {
    const { onDelete } = renderPanel({ selectedId: 'w2' })
    fireEvent.click(screen.getByTestId('delete-waypoint'))
    expect(onDelete).toHaveBeenCalledWith('w2')
  })

  it('moves waypoints with the arrows', () => {
    const { onMove } = renderPanel()
    expect(screen.getByTestId('waypoint-up-w1')).toBeDisabled()
    expect(screen.getByTestId('waypoint-down-w2')).toBeDisabled()
    fireEvent.click(screen.getByTestId('waypoint-down-w1'))
    expect(onMove).toHaveBeenCalledWith(0, 1)
    fireEvent.click(screen.getByTestId('waypoint-up-w2'))
    expect(onMove).toHaveBeenCalledWith(1, 0)
  })

  it('reorders by dragging the handle', () => {
    const { onMove } = renderPanel()
    const setData = jest.fn()
    fireEvent.dragStart(screen.getByTestId('waypoint-drag-w1'), {
      dataTransfer: { setData },
    })
    expect(setData).toHaveBeenCalledWith('text/plain', 'w1')
    fireEvent.dragOver(screen.getByTestId('waypoint-item-w2'))
    expect(screen.getByTestId('waypoint-item-w2')).toHaveStyleRule(
      'box-shadow',
      expect.stringContaining('inset'),
    )
    fireEvent.drop(screen.getByTestId('waypoint-item-w2'))
    expect(onMove).toHaveBeenCalledWith(0, 1)
    expect(screen.getByTestId('waypoint-item-w2')).toHaveStyleRule(
      'box-shadow',
      'none',
    )
  })

  it('ignores drops that did not start on a handle', () => {
    const { onMove } = renderPanel()
    fireEvent.dragOver(screen.getByTestId('waypoint-item-w2'))
    fireEvent.drop(screen.getByTestId('waypoint-item-w2'))
    expect(onMove).not.toHaveBeenCalled()
  })

  it('clears the drag state when dragging ends elsewhere', () => {
    const { onMove } = renderPanel()
    fireEvent.dragStart(screen.getByTestId('waypoint-drag-w2'))
    fireEvent.dragOver(screen.getByTestId('waypoint-item-w1'))
    fireEvent.dragEnd(screen.getByTestId('waypoint-drag-w2'))
    expect(screen.getByTestId('waypoint-item-w1')).toHaveStyleRule(
      'box-shadow',
      'none',
    )
    fireEvent.drop(screen.getByTestId('waypoint-item-w1'))
    expect(onMove).not.toHaveBeenCalled()
  })
})
