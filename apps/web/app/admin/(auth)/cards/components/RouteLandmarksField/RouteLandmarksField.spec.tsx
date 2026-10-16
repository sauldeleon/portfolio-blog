import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { RouteLandmark } from '@web/lib/cards'

import { RouteLandmarksField } from './RouteLandmarksField'

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

const LANDMARKS: RouteLandmark[] = [
  { kind: 'peak', index: 3, ele: 2417, lat: 43, lon: -5.9, name: 'Peña Ubiña' },
  { kind: 'col', index: 5, ele: 1952, lat: 43.01, lon: -5.9 },
]

describe('RouteLandmarksField', () => {
  it('explains how to get them when there are none', () => {
    renderApp(<RouteLandmarksField value={undefined} onChange={vi.fn()} />)
    expect(screen.getByText('cards.fields.landmarksEmpty')).toBeInTheDocument()
    expect(screen.queryByTestId('rt-landmarks')).not.toBeInTheDocument()
  })

  it('lists summits and cols with their altitude and name', () => {
    renderApp(<RouteLandmarksField value={LANDMARKS} onChange={vi.fn()} />)
    const list = screen.getByTestId('rt-landmarks')
    expect(list).toHaveTextContent('▲ cards.fields.landmarkPeak')
    expect(list).toHaveTextContent('▼ cards.fields.landmarkCol')
    expect(list).toHaveTextContent('2417 m')
    expect(screen.getByTestId('rt-landmark-name-0')).toHaveValue('Peña Ubiña')
    expect(screen.getByTestId('rt-landmark-name-1')).toHaveValue('')
  })

  it('renames and clears names', () => {
    const onChange = vi.fn()
    renderApp(<RouteLandmarksField value={LANDMARKS} onChange={onChange} />)
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
    renderApp(<RouteLandmarksField value={LANDMARKS} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('rt-landmark-remove-0'))
    expect(onChange).toHaveBeenCalledWith([LANDMARKS[1]])
  })

  it('warns when OpenStreetMap did not answer', () => {
    renderApp(
      <RouteLandmarksField
        value={LANDMARKS}
        onChange={vi.fn()}
        placesUnavailable
      />,
    )
    expect(screen.getByTestId('rt-landmarks-osm-down')).toHaveTextContent(
      'cards.fields.landmarksOsmDown',
    )
  })
})
