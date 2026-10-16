import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { TileLayerSwitcher } from './TileLayerSwitcher'

const providers = [
  { id: 'osm', label: 'OSM' },
  { id: 'topo', label: 'Topo' },
]

describe('TileLayerSwitcher', () => {
  it('marks the active provider and reports clicks', () => {
    const onChange = vi.fn()
    renderApp(
      <TileLayerSwitcher
        providers={providers}
        activeIndex={1}
        onChange={onChange}
      />,
    )
    expect(screen.getByTestId('layer-switcher')).toBeInTheDocument()
    expect(screen.getByTestId('tile-provider-osm')).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByTestId('tile-provider-topo')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    fireEvent.click(screen.getByText('OSM'))
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('uses a custom test id prefix', () => {
    renderApp(
      <TileLayerSwitcher
        providers={providers}
        activeIndex={0}
        onChange={vi.fn()}
        testIdPrefix="editor-tile"
      />,
    )
    expect(screen.getByTestId('editor-tile-topo')).toBeInTheDocument()
  })
})
