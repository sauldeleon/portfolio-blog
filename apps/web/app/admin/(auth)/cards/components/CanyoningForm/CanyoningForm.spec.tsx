import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CanyoningCardData } from '@web/lib/cards'

import { CanyoningForm } from './CanyoningForm'

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

const base: CanyoningCardData = { kind: 'canyoning-data', lang: 'es' }

describe('CanyoningForm', () => {
  it('renders without crashing', () => {
    renderApp(<CanyoningForm value={base} onChange={jest.fn()} />)
    expect(screen.getByTestId('canyoning-form')).toBeInTheDocument()
  })

  it('renders ES and EN lang toggle buttons', () => {
    renderApp(<CanyoningForm value={base} onChange={jest.fn()} />)
    expect(screen.getByTestId('lang-es')).toBeInTheDocument()
    expect(screen.getByTestId('lang-en')).toBeInTheDocument()
  })

  it('calls onChange with lang=en when EN clicked', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('lang-en'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'en' }),
    )
  })

  it('calls onChange with lang=es when ES clicked', () => {
    const onChange = jest.fn()
    renderApp(
      <CanyoningForm value={{ ...base, lang: 'en' }} onChange={onChange} />,
    )
    fireEvent.click(screen.getByTestId('lang-es'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'es' }),
    )
  })

  it('renders title input with current value', () => {
    renderApp(
      <CanyoningForm
        value={{ ...base, title: 'Mascún' }}
        onChange={jest.fn()}
      />,
    )
    expect(screen.getByLabelText('Title')).toHaveValue('Mascún')
  })

  it('calls onChange when title changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Nuevo título' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nuevo título' }),
    )
  })

  it('calls onChange when date changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('bc-date'), {
      target: { value: '15 JUL 2025' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ date: '15 JUL 2025' }),
    )
  })

  it('calls onChange when grade changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('grade-set'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ grade: 'v4 a3 III' }),
    )
  })

  it('calls onChange when desnivel changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Descent'), {
      target: { value: '300 m' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ desnivel: '300 m' }),
    )
  })

  it('calls onChange when maxRappel changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Max rappel'), {
      target: { value: '45 m' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ maxRappel: '45 m' }),
    )
  })

  it('calls onChange when rappels changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Rappels'), {
      target: { value: '12' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ rappels: '12' }),
    )
  })

  it('calls onChange when approach changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Approach (H:MM)'), {
      target: { value: '0:45' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ approach: '0:45' }),
    )
  })

  it('calls onChange when inCanyon changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('In canyon (H:MM)'), {
      target: { value: '3:00' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ inCanyon: '3:00' }),
    )
  })

  it('calls onChange when returnTime changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Return (H:MM)'), {
      target: { value: '0:20' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ returnTime: '0:20' }),
    )
  })

  it('calls onChange when total changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Total (H:MM)'), {
      target: { value: '4:00' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ total: '4:00' }),
    )
  })

  it('calls onChange when rope changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Rope'), {
      target: { value: '2x 30 m' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ rope: '2x 30 m' }),
    )
  })

  it('calls onChange when the flow level is set', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('flow-set'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ flowLevel: 'normal' }),
    )
  })

  it('calls onChange when cars changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Cars'), {
      target: { value: '2' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ cars: '2' }),
    )
  })

  it('calls onChange when season changes', () => {
    const onChange = jest.fn()
    renderApp(<CanyoningForm value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Season'), {
      target: { value: 'jun-sep' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ season: 'jun-sep' }),
    )
  })

  it('preserves existing fields when patching', () => {
    const onChange = jest.fn()
    const full: CanyoningCardData = {
      ...base,
      title: 'Mascún',
      grade: 'v4 a3 III',
      desnivel: '300 m',
    }
    renderApp(<CanyoningForm value={full} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Season'), {
      target: { value: 'jun-sep' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Mascún',
        grade: 'v4 a3 III',
        desnivel: '300 m',
        season: 'jun-sep',
      }),
    )
  })
})
