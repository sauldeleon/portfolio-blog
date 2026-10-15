import { fireEvent, render, screen } from '@testing-library/react'

import { ElevationLayer, formatAltitude } from './ElevationLayer'

const profile = {
  elevation: [1000, 1400, 1100, 1300, 1000],
  x0: 100,
  x1: 500,
  top: 600,
  bottom: 800,
}

function renderLayer(lang: 'en' | 'es' = 'en') {
  return render(
    <svg>
      <ElevationLayer profile={profile} lang={lang} />
    </svg>,
  )
}

// jsdom has no PointerEvent: a MouseEvent of the same type carries clientX.
function pointer(target: Element, type: string, clientX: number) {
  fireEvent(target, new MouseEvent(type, { bubbles: true, clientX }))
}

function hitAt(clientX: number, width = 400) {
  const hit = screen.getByTestId('card-profile-hit')
  hit.getBoundingClientRect = () =>
    ({ left: 0, width, top: 0, height: 100 }) as DOMRect
  return hit
}

describe('formatAltitude', () => {
  it('rounds and groups by language', () => {
    expect(formatAltitude(2417.4, 'en')).toBe('2,417 m')
    expect(formatAltitude(12417, 'es')).toBe('12.417 m')
  })
})

describe('ElevationLayer', () => {
  it('marks the summits, highest first', () => {
    renderLayer()
    expect(screen.getByTestId('card-peak-1')).toHaveAttribute(
      'aria-label',
      '1,400 m',
    )
    expect(screen.getByTestId('card-peak-3')).toBeInTheDocument()
    expect(screen.queryByTestId('card-profile-readout')).not.toBeInTheDocument()
  })

  it('follows the pointer along the profile', () => {
    renderLayer()
    const hit = hitAt(0)
    pointer(hit, 'pointermove', 100)
    expect(screen.getByTestId('card-profile-label')).toHaveTextContent(
      '1,400 m',
    )
    pointer(hit, 'pointerdown', 400)
    expect(screen.getByTestId('card-profile-label')).toHaveTextContent(
      '1,000 m',
    )
    // Outside the box clamps to the ends.
    pointer(hit, 'pointermove', -50)
    expect(screen.getByTestId('card-profile-label')).toHaveTextContent(
      '1,000 m',
    )
    pointer(hit, 'pointermove', 900)
    expect(screen.getByTestId('card-profile-label')).toHaveTextContent(
      '1,000 m',
    )
    fireEvent.pointerLeave(hit)
    expect(screen.queryByTestId('card-profile-readout')).not.toBeInTheDocument()
  })

  it('copes with a hidden (zero-width) profile', () => {
    renderLayer()
    pointer(hitAt(0, 0), 'pointermove', 50)
    expect(screen.getByTestId('card-profile-label')).toHaveTextContent(
      '1,000 m',
    )
  })

  it('shows a summit on hover and keyboard focus', () => {
    renderLayer('es')
    const peak = screen.getByTestId('card-peak-1')
    fireEvent.pointerEnter(peak)
    expect(screen.getByTestId('card-profile-label')).toHaveTextContent('1400 m')
    fireEvent.pointerLeave(peak)
    expect(screen.queryByTestId('card-profile-readout')).not.toBeInTheDocument()
    fireEvent.focus(screen.getByTestId('card-peak-3'))
    expect(screen.getByTestId('card-profile-label')).toHaveTextContent('1300 m')
    fireEvent.blur(screen.getByTestId('card-peak-3'))
    expect(screen.queryByTestId('card-profile-readout')).not.toBeInTheDocument()
  })

  it('keeps the label inside the profile area', () => {
    renderLayer()
    pointer(hitAt(0), 'pointermove', 0)
    expect(screen.getByTestId('card-profile-label-box')).toHaveAttribute(
      'x',
      '100',
    )
  })

  it('marks the named summits and cols instead, with their names', () => {
    render(
      <svg>
        <ElevationLayer
          profile={{
            ...profile,
            landmarks: [
              {
                kind: 'peak',
                index: 1,
                ele: 1412,
                lat: 0,
                lon: 0,
                name: 'Pico',
              },
              { kind: 'col', index: 2, ele: 1095, lat: 0, lon: 0 },
              // Stale index beyond the profile: ignored.
              { kind: 'peak', index: 9, ele: 9, lat: 0, lon: 0 },
            ],
          }}
          lang="en"
        />
      </svg>,
    )
    const peak = screen.getByTestId('card-peak-1')
    expect(peak).toHaveAttribute('data-kind', 'peak')
    expect(peak).toHaveAttribute('aria-label', 'Pico, 1,412 m')
    const col = screen.getByTestId('card-peak-2')
    expect(col).toHaveAttribute('data-kind', 'col')
    expect(col).toHaveAttribute('aria-label', '1,095 m')
    expect(screen.queryByTestId('card-peak-3')).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-peak-9')).not.toBeInTheDocument()
    fireEvent.pointerEnter(peak)
    // The landmark's real altitude, not the sampled one.
    expect(screen.getByTestId('card-profile-label')).toHaveTextContent(
      'Pico · 1,412 m',
    )
    fireEvent.focus(col)
    expect(screen.getByTestId('card-profile-label')).toHaveTextContent(
      '1,095 m',
    )
  })
})
