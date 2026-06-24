import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { SummaryCanyoningForm } from './SummaryCanyoningForm'

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

jest.mock('../CanyonGradeField', () => ({
  CanyonGradeField: ({
    value,
    onChange,
  }: {
    value?: string
    onChange: (v: string) => void
  }) => (
    <div>
      <span data-testid="grade-value">{value}</span>
      <button
        type="button"
        data-testid="grade-set"
        onClick={() => onChange('v4 a3 III')}
      />
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

jest.mock('../FlowField', () => ({
  FlowField: ({
    onChange,
  }: {
    onChange: (patch: { flowLevel?: string }) => void
  }) => (
    <button
      type="button"
      data-testid="flow-set"
      onClick={() => onChange({ flowLevel: 'normal' })}
    />
  ),
}))

const defaultValue = { kind: 'summary-canyoning' as const, lang: 'es' as const }

describe('SummaryCanyoningForm', () => {
  it('renders the form', () => {
    renderApp(
      <SummaryCanyoningForm value={defaultValue} onChange={jest.fn()} />,
    )
    expect(screen.getByTestId('summary-canyoning-form')).toBeInTheDocument()
  })

  it('renders lang buttons', () => {
    renderApp(
      <SummaryCanyoningForm value={defaultValue} onChange={jest.fn()} />,
    )
    expect(screen.getByTestId('lang-es')).toBeInTheDocument()
    expect(screen.getByTestId('lang-en')).toBeInTheDocument()
  })

  it('calls onChange with updated lang', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('lang-en'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'en' }),
    )
  })

  it('calls onChange with updated title', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Mascún' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Mascún' }),
    )
  })

  it('calls onChange with updated date', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('sb-date'), {
      target: { value: '1 AGO 2025' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ date: '1 AGO 2025' }),
    )
  })

  it('calls onChange when grade changes', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('grade-set'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ grade: 'v4 a3 III' }),
    )
  })

  it('shows the existing grade value', () => {
    renderApp(
      <SummaryCanyoningForm
        value={{ ...defaultValue, grade: 'v4 a3' }}
        onChange={jest.fn()}
      />,
    )
    expect(screen.getByTestId('grade-value')).toHaveTextContent('v4 a3')
  })

  it('calls onChange with updated maxRappel', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Max rappel'), {
      target: { value: '45 m' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ maxRappel: '45 m' }),
    )
  })

  it('calls onChange with updated rappels', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Rappels'), {
      target: { value: '12' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ rappels: '12' }),
    )
  })

  it('calls onChange with updated descent', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Descent'), {
      target: { value: '250 m' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ desnivel: '250 m' }),
    )
  })

  it('calls onChange with updated mov', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Moving (H:MM)'), {
      target: { value: '3:00' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ mov: '3:00' }),
    )
  })

  it('calls onChange with updated det', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Stopped (H:MM)'), {
      target: { value: '0:30' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ det: '0:30' }),
    )
  })

  it('calls onChange with updated tot', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Total (H:MM)'), {
      target: { value: '4:00' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ tot: '4:00' }),
    )
  })

  it('calls onChange with updated ini', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Start'), {
      target: { value: '09:00' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ ini: '09:00' }),
    )
  })

  it('calls onChange with updated fin', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('End'), {
      target: { value: '13:00' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ fin: '13:00' }),
    )
  })

  it('calls onChange with updated ret', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Return'), {
      target: { value: '14:00' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ ret: '14:00' }),
    )
  })

  it('calls onChange with updated rope', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Rope'), {
      target: { value: '2x 30 m' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ rope: '2x 30 m' }),
    )
  })

  it('calls onChange when the flow level is set', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('flow-set'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ flowLevel: 'normal' }),
    )
  })

  it('calls onChange with updated season', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Season'), {
      target: { value: 'jun-sep' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ season: 'jun-sep' }),
    )
  })

  it('calls onChange with updated cars', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Cars'), { target: { value: '2' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ cars: '2' }),
    )
  })

  it('calls onChange with updated gpxUrl', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('GPX url'), {
      target: { value: 'https://example.com/mascun.gpx' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ gpxUrl: 'https://example.com/mascun.gpx' }),
    )
  })

  it('prefills times, date and elevation from parsed GPX metrics', () => {
    const onChange = jest.fn()
    renderApp(<SummaryCanyoningForm value={defaultValue} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('gpx-full'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '15 Jul 2025',
        desnivel: '820 m',
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
      desnivel: 'odn',
      ini: 'oi',
      fin: 'of',
      mov: 'om',
      det: 'od',
      tot: 'ot',
    }
    renderApp(<SummaryCanyoningForm value={value} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('gpx-empty'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        date: 'old',
        desnivel: 'odn',
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
