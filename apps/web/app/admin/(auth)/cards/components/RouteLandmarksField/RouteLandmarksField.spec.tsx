import { fireEvent, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import { renderApp } from '@sdlgr/test-utils'

import type { RouteLandmark } from '@web/lib/cards'

import { RouteLandmarksField } from './RouteLandmarksField'

vi.mock('@sdlgr/select', () => ({
  Select: ({
    value,
    onChange,
    options,
    formatOptionLabel,
    'data-testid': testId,
  }: {
    value: string
    onChange: (v: string) => void
    options: Array<{ value: string; label: string }>
    formatOptionLabel: (o: { value: string; label: string }) => ReactNode
    'data-testid'?: string
  }) => (
    <>
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div data-testid={`${testId}-shown`}>
        {options.map((o) => (
          <div key={o.value} data-testid={`${testId}-shown-${o.value}`}>
            {formatOptionLabel(o)}
          </div>
        ))}
      </div>
    </>
  ),
}))

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

const LANDMARKS: RouteLandmark[] = [
  { kind: 'peak', index: 3, ele: 2417, lat: 43, lon: -5.9, name: 'Peña Ubiña' },
  { kind: 'col', index: 5, ele: 1952, lat: 43.01, lon: -5.9 },
]

function handlers() {
  return {
    onChange: vi.fn(),
    onLabelsChange: vi.fn(),
  }
}

describe('RouteLandmarksField', () => {
  it('explains how to get them when there are none', () => {
    renderApp(<RouteLandmarksField value={undefined} {...handlers()} />)
    expect(screen.getByText('cards.fields.landmarksEmpty')).toBeInTheDocument()
    expect(screen.queryByTestId('rt-landmarks')).not.toBeInTheDocument()
  })

  it('lists summits and cols with their altitude and name', () => {
    renderApp(<RouteLandmarksField value={LANDMARKS} {...handlers()} />)
    const list = screen.getByTestId('rt-landmarks')
    expect(screen.getByTestId('rt-landmark-type-0')).toHaveValue('peak')
    expect(screen.getByTestId('rt-landmark-type-1')).toHaveValue('col')
    expect(list).toHaveTextContent('cards.fields.landmarkPeak')
    expect(list).toHaveTextContent('cards.fields.landmarkCol')
    expect(list).toHaveTextContent('2417 m')
    expect(screen.getByTestId('rt-landmark-name-0')).toHaveValue('Peña Ubiña')
    expect(screen.getByTestId('rt-landmark-name-1')).toHaveValue('')
  })

  it('renames and clears names', () => {
    const onChange = vi.fn()
    renderApp(
      <RouteLandmarksField
        value={LANDMARKS}
        {...handlers()}
        onChange={onChange}
      />,
    )
    fireEvent.change(screen.getByTestId('rt-landmark-name-1'), {
      target: { value: 'El Ronzón' },
    })
    expect(onChange).toHaveBeenLastCalledWith([
      LANDMARKS[0],
      { ...LANDMARKS[1], name: 'El Ronzón' },
    ])
    fireEvent.change(screen.getByTestId('rt-landmark-name-0'), {
      target: { value: '' },
    })
    expect(onChange.mock.lastCall?.[0][0].name).toBeUndefined()
  })

  it('removes one from the card', () => {
    const onChange = vi.fn()
    renderApp(
      <RouteLandmarksField
        value={LANDMARKS}
        {...handlers()}
        onChange={onChange}
      />,
    )
    fireEvent.click(screen.getByTestId('rt-landmark-remove-0'))
    expect(onChange).toHaveBeenCalledWith([LANDMARKS[1]])
  })

  it('warns when OpenStreetMap did not answer', () => {
    renderApp(
      <RouteLandmarksField
        value={LANDMARKS}
        {...handlers()}
        placesUnavailable
      />,
    )
    expect(screen.getByTestId('rt-landmarks-osm-down')).toHaveTextContent(
      'cards.fields.landmarksOsmDown',
    )
  })

  it('picks how the card labels them, names by default', () => {
    const h = handlers()
    renderApp(<RouteLandmarksField value={LANDMARKS} {...h} />)
    expect(screen.getByTestId('rt-labels-names')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      screen.getByText('cards.fields.landmarkModeHints.names'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('rt-labels-legend'))
    expect(h.onLabelsChange).toHaveBeenCalledWith('legend')
  })

  it('shows the chosen mode', () => {
    renderApp(
      <RouteLandmarksField value={LANDMARKS} {...handlers()} labels="legend" />,
    )
    expect(screen.getByTestId('rt-labels-legend')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('shows or hides each altitude, or all of them at once', () => {
    const h = handlers()
    renderApp(
      <RouteLandmarksField
        value={[LANDMARKS[0], { ...LANDMARKS[1], hideAltitude: true }]}
        {...h}
      />,
    )
    const all = screen.getByLabelText('cards.fields.landmarkAltitude')
    expect(all).not.toBeChecked()
    const first = screen.getByLabelText('2417 m')
    expect(first).toBeChecked()
    expect(screen.getByLabelText('1952 m')).not.toBeChecked()
    fireEvent.click(first)
    expect(h.onChange.mock.lastCall?.[0][0].hideAltitude).toBe(true)
    fireEvent.click(screen.getByLabelText('1952 m'))
    expect(h.onChange.mock.lastCall?.[0][1].hideAltitude).toBeUndefined()
    fireEvent.click(all)
    expect(
      h.onChange.mock.lastCall?.[0].map(
        (l: { hideAltitude?: boolean }) => l.hideAltitude,
      ),
    ).toEqual([undefined, undefined])
  })

  it('hides every altitude from the master checkbox', () => {
    const h = handlers()
    renderApp(<RouteLandmarksField value={LANDMARKS} {...h} />)
    const all = screen.getByLabelText('cards.fields.landmarkAltitude')
    expect(all).toBeChecked()
    fireEvent.click(all)
    expect(
      h.onChange.mock.lastCall?.[0].map(
        (l: { hideAltitude?: boolean }) => l.hideAltitude,
      ),
    ).toEqual([true, true])
  })

  it('hides and shows each one on the card', () => {
    const h = handlers()
    renderApp(
      <RouteLandmarksField
        value={[LANDMARKS[0], { ...LANDMARKS[1], hidden: true }]}
        {...h}
      />,
    )
    const shown = screen.getByTestId('rt-landmark-toggle-0')
    expect(shown).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(shown)
    expect(h.onChange.mock.lastCall?.[0][0].hidden).toBe(true)
    const hidden = screen.getByTestId('rt-landmark-toggle-1')
    expect(hidden).toHaveAccessibleName('cards.fields.landmarkShow')
    fireEvent.click(hidden)
    expect(h.onChange.mock.lastCall?.[0][1].hidden).toBeUndefined()
  })

  it('types other waypoints by category, and lets any type be changed', () => {
    const h = handlers()
    renderApp(
      <RouteLandmarksField
        value={[
          {
            kind: 'point',
            category: 'refugio',
            index: 1,
            ele: 1547,
            lat: 0,
            lon: 0,
          },
          {
            kind: 'point',
            index: 2,
            ele: 2412,
            lat: 0,
            lon: 0,
            name: 'Fontán Norte',
          },
        ]}
        {...h}
      />,
    )
    const hut = screen.getByTestId('rt-landmark-type-0')
    expect(hut).toHaveValue('point:refugio')
    expect(hut).toHaveTextContent('Mountain hut')
    // Each option shows the marker the card will draw.
    const shown = (value: string) =>
      screen.getByTestId(`rt-landmark-type-0-shown-${value}`)
    expect(shown('point:refugio')).toHaveTextContent('Mountain hut')
    expect(shown('point:refugio').innerHTML).toContain('<circle')
    expect(shown('peak').innerHTML).toContain('<path')
    // Uncategorised points read as points of interest.
    const north = screen.getByTestId('rt-landmark-type-1')
    expect(north).toHaveValue('point:info')
    fireEvent.change(north, { target: { value: 'peak' } })
    expect(h.onChange.mock.lastCall?.[0][1]).toMatchObject({
      kind: 'peak',
      category: undefined,
    })
    fireEvent.change(hut, { target: { value: 'point:fuente' } })
    expect(h.onChange.mock.lastCall?.[0][0]).toMatchObject({
      kind: 'point',
      category: 'fuente',
    })
  })
})
