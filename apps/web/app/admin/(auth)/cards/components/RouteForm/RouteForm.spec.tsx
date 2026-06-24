import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { RouteForm } from './RouteForm'

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

describe('RouteForm', () => {
  it('renders the form', () => {
    renderApp(<RouteForm value={defaultValue} onChange={jest.fn()} />)
    expect(screen.getByTestId('route-form')).toBeInTheDocument()
  })

  it('renders ES and EN lang buttons', () => {
    renderApp(<RouteForm value={defaultValue} onChange={jest.fn()} />)
    expect(screen.getByTestId('lang-es')).toBeInTheDocument()
    expect(screen.getByTestId('lang-en')).toBeInTheDocument()
  })

  it('calls onChange with updated lang when EN clicked', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('lang-en'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'en' }),
    )
  })

  it('calls onChange with updated title', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Aneto' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Aneto' }),
    )
  })

  it('calls onChange with updated date', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('rt-date'), {
      target: { value: '1 AGO 2025' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ date: '1 AGO 2025' }),
    )
  })

  it('calls onChange with updated dist', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Distance'), {
      target: { value: '12 km' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ dist: '12 km' }),
    )
  })

  it('calls onChange with updated dplus', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Ascent (D+)'), {
      target: { value: '800 m' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ dplus: '800 m' }),
    )
  })

  it('calls onChange with updated dminus', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Descent (D−)'), {
      target: { value: '800 m' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ dminus: '800 m' }),
    )
  })

  it('calls onChange with updated mov', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Moving (H:MM)'), {
      target: { value: '4:30' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ mov: '4:30' }),
    )
  })

  it('calls onChange with updated det', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Stopped (H:MM)'), {
      target: { value: '0:30' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ det: '0:30' }),
    )
  })

  it('calls onChange with updated tot', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Total (H:MM)'), {
      target: { value: '5:00' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ tot: '5:00' }),
    )
  })

  it('calls onChange with updated ini', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Start'), {
      target: { value: '08:00' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ ini: '08:00' }),
    )
  })

  it('calls onChange with updated fin', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('End'), {
      target: { value: '13:00' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ fin: '13:00' }),
    )
  })

  it('calls onChange with updated gpxUrl', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('GPX url'), {
      target: { value: 'https://example.com/aneto.gpx' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ gpxUrl: 'https://example.com/aneto.gpx' }),
    )
  })

  it('shows existing value in title input', () => {
    renderApp(
      <RouteForm
        value={{ ...defaultValue, title: 'Maladeta' }}
        onChange={jest.fn()}
      />,
    )
    expect(screen.getByDisplayValue('Maladeta')).toBeInTheDocument()
  })

  it('prefills fields from parsed GPX metrics', () => {
    const onChange = jest.fn()
    renderApp(<RouteForm value={defaultValue} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('gpx-full'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '15 Jul 2025',
        dist: '12.4 km',
        dplus: '800 m',
        dminus: '820 m',
        ini: '09:00',
        fin: '11:00',
        mov: '2:00',
        det: '0:30',
        tot: '2:30',
        elevation: [1, 2, 3],
      }),
    )
  })

  it('keeps existing time/date values when metrics are empty', () => {
    const onChange = jest.fn()
    const value = {
      ...defaultValue,
      date: 'old',
      ini: 'oi',
      fin: 'of',
      mov: 'om',
      det: 'od',
      tot: 'ot',
    }
    renderApp(<RouteForm value={value} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('gpx-empty'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        date: 'old',
        ini: 'oi',
        fin: 'of',
        mov: 'om',
        det: 'od',
        tot: 'ot',
        dist: '',
        dplus: '',
        dminus: '',
        elevation: [],
      }),
    )
  })
})
