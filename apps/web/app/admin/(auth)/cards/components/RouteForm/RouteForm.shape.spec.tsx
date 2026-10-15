import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { RouteForm } from './RouteForm'

jest.mock('../../../components/TrackUrlPicker', () => ({
  TrackUrlPicker: ({
    id,
    value,
    onChange,
    'data-testid': testId,
  }: {
    id?: string
    value: string
    onChange: (url: string) => void
    'data-testid'?: string
  }) => (
    <input
      id={id}
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

jest.mock('@web/i18n/client', () => {
  const admin: Record<string, unknown> = jest.requireActual(
    '@web/i18n/locales/en/admin.json',
  )
  return {
    useClientTranslation: () => ({
      t: (key: string): string => {
        const val = key
          .split('.')
          .reduce<unknown>(
            (o, k) =>
              typeof o === 'object' && o !== null
                ? (o as Record<string, unknown>)[k]
                : undefined,
            admin,
          )
        return typeof val === 'string' ? val : key
      },
    }),
  }
})

jest.mock('../CardDateField', () => ({
  CardDateField: ({
    value,
    onChange,
    'data-testid': testId,
  }: {
    value?: string
    onChange: (value: string) => void
    'data-testid'?: string
  }) => (
    <input
      data-testid={testId}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

jest.mock('../GpxUrlField', () => {
  const FULL = {
    date: '15 Jul 2025',
    startTime: '09:00',
    endTime: '11:00',
    movingTime: '2:00',
    stoppedTime: '0:30',
    totalTime: '2:30',
    distanceKm: '12.4 km',
    ascent: '800 m',
    descent: '820 m',
    elevation: [1, 2, 3],
    shape: 'loop' as 'loop' | 'linear' | null,
    placesUnavailable: true as boolean | undefined,
  }
  const EMPTY = {
    date: '',
    startTime: '',
    endTime: '',
    movingTime: '',
    stoppedTime: '',
    totalTime: '',
    distanceKm: '',
    ascent: '',
    descent: '',
    elevation: [],
    shape: null,
  }
  return {
    GpxUrlField: ({
      value,
      onChange,
      onParsed,
    }: {
      value?: string
      onChange: (v: string) => void
      onParsed: (m: typeof FULL) => void
    }) => (
      <div>
        <input
          aria-label="GPX url"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          data-testid="gpx-full"
          onClick={() => onParsed(FULL)}
        />
        <button
          type="button"
          data-testid="gpx-empty"
          onClick={() => onParsed(EMPTY)}
        />
      </div>
    ),
  }
})

const defaultValue = { kind: 'summary-route' as const, lang: 'es' as const }

describe('RouteForm route type and language', () => {
  it('sets the route type', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('rt-shape-loop'))
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ shape: 'loop' }),
    )
  })

  it('clears the selected route type on a second click', () => {
    const onChange = jest.fn()
    renderApp(
      <RouteForm
        value={{ ...defaultValue, shape: 'loop' }}
        onChange={onChange}
      />,
    )
    expect(screen.getByTestId('rt-shape-loop')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    fireEvent.click(screen.getByTestId('rt-shape-loop'))
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ shape: undefined }),
    )
  })

  it('hides the language toggle on request', () => {
    renderApp(<RouteForm value={defaultValue} onChange={jest.fn()} hideLang />)
    expect(screen.queryByTestId('lang-es')).not.toBeInTheDocument()
  })

  it('edits the summits and cols found in the GPX', () => {
    const onChange = jest.fn()
    renderApp(
      <RouteForm
        value={{
          ...defaultValue,
          landmarks: [
            { kind: 'peak', index: 1, ele: 2417, lat: 43, lon: -5.9 },
          ],
        }}
        onChange={onChange}
      />,
    )
    fireEvent.click(screen.getByTestId('rt-landmark-remove-0'))
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ landmarks: [] }),
    )
  })

  it('warns when OpenStreetMap did not answer on the last parse', () => {
    renderApp(<RouteForm value={defaultValue} onChange={jest.fn()} />)
    expect(
      screen.queryByTestId('rt-landmarks-osm-down'),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('gpx-full'))
    expect(screen.getByTestId('rt-landmarks-osm-down')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('gpx-empty'))
    expect(
      screen.queryByTestId('rt-landmarks-osm-down'),
    ).not.toBeInTheDocument()
  })
})
