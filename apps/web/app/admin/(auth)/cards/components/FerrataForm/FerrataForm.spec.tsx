import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { FerrataForm } from './FerrataForm'

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

jest.mock('@sdlgr/select', () => ({
  Select: ({
    value,
    onChange,
    options,
    'data-testid': testId,
  }: {
    value: string
    onChange: (v: string) => void
    options: Array<{ value: string; label: string }>
    'data-testid'?: string
  }) => (
    <div data-testid={testId}>
      <span data-testid={`${testId}-value`}>{value}</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-testid={`${testId}-opt-${o.value}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
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

const defaultValue = { kind: 'summary-ferrata' as const, lang: 'es' as const }

describe('FerrataForm', () => {
  it('renders the form', () => {
    renderApp(<FerrataForm value={defaultValue} onChange={jest.fn()} />)
    expect(screen.getByTestId('ferrata-form')).toBeInTheDocument()
  })

  it('renders lang buttons', () => {
    renderApp(<FerrataForm value={defaultValue} onChange={jest.fn()} />)
    expect(screen.getByTestId('lang-es')).toBeInTheDocument()
    expect(screen.getByTestId('lang-en')).toBeInTheDocument()
  })

  it('calls onChange with updated lang', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('lang-en'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'en' }),
    )
  })

  it('calls onChange with updated title', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Ferrata del Oso' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Ferrata del Oso' }),
    )
  })

  it('calls onChange with updated date', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('ft-date'), {
      target: { value: '1 AGO 2025' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ date: '1 AGO 2025' }),
    )
  })

  it('selects a grade from K1–K7', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('ft-grade-opt-K3'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ grade: 'K3' }),
    )
  })

  it('shows the existing grade value', () => {
    renderApp(
      <FerrataForm
        value={{ ...defaultValue, grade: 'K5' }}
        onChange={jest.fn()}
      />,
    )
    expect(screen.getByTestId('ft-grade-value')).toHaveTextContent('K5')
  })

  it('calls onChange with updated cable', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Cable length'), {
      target: { value: '800 m' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ cable: '800 m' }),
    )
  })

  it('calls onChange with updated vertical', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Vertical drop'), {
      target: { value: '350 m' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ vertical: '350 m' }),
    )
  })

  it('calls onChange with updated mov', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Moving (H:MM)'), {
      target: { value: '2:30' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ mov: '2:30' }),
    )
  })

  it('calls onChange with updated det', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Stopped (H:MM)'), {
      target: { value: '0:15' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ det: '0:15' }),
    )
  })

  it('calls onChange with updated tot', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Total (H:MM)'), {
      target: { value: '2:45' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ tot: '2:45' }),
    )
  })

  it('calls onChange with updated ini', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Start'), {
      target: { value: '09:00' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ ini: '09:00' }),
    )
  })

  it('calls onChange with updated fin', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('End'), {
      target: { value: '11:45' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ fin: '11:45' }),
    )
  })

  it('calls onChange with updated ret', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Return'), {
      target: { value: '12:30' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ ret: '12:30' }),
    )
  })

  it('calls onChange with updated gpxUrl', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('GPX url'), {
      target: { value: 'https://example.com/ferrata.gpx' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ gpxUrl: 'https://example.com/ferrata.gpx' }),
    )
  })

  it('prefills times, date and elevation from parsed GPX metrics', () => {
    const onChange = jest.fn()
    renderApp(<FerrataForm value={defaultValue} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('gpx-full'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '15 Jul 2025',
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
    renderApp(<FerrataForm value={value} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('gpx-empty'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        date: 'old',
        ini: 'oi',
        fin: 'of',
        mov: 'om',
        det: 'od',
        tot: 'ot',
        elevation: [],
      }),
    )
  })
})
