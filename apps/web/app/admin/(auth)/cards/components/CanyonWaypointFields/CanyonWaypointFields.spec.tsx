import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CanyonWaypoint } from '@web/lib/cards'

import { CanyonWaypointFields } from './CanyonWaypointFields'

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

const base: CanyonWaypoint = {
  categories: ['salto'],
  title: 'Salto 2m',
  lat: 42.6,
  lon: 0.1,
  notes: [
    { text: 'top', sub: false },
    { text: 'nested', sub: true },
  ],
}

describe('CanyonWaypointFields', () => {
  it('renders the current title', () => {
    renderApp(<CanyonWaypointFields value={base} onChange={jest.fn()} />)
    expect(screen.getByTestId('cwf-title')).toHaveValue('Salto 2m')
  })

  it('changes the title', () => {
    const onChange = jest.fn()
    renderApp(<CanyonWaypointFields value={base} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('cwf-title'), {
      target: { value: 'Rápel 10m' },
    })
    expect(onChange).toHaveBeenCalledWith({ title: 'Rápel 10m' })
  })

  it('shows the current primary category', () => {
    renderApp(<CanyonWaypointFields value={base} onChange={jest.fn()} />)
    expect(screen.getByTestId('cwf-cat1-value')).toHaveTextContent('salto')
  })

  it('defaults the primary category to info when none set', () => {
    renderApp(
      <CanyonWaypointFields
        value={{ ...base, categories: [] }}
        onChange={jest.fn()}
      />,
    )
    expect(screen.getByTestId('cwf-cat1-value')).toHaveTextContent('info')
  })

  it('changes the primary category and drops the empty second', () => {
    const onChange = jest.fn()
    renderApp(<CanyonWaypointFields value={base} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('cwf-cat1-opt-rappel'))
    expect(onChange).toHaveBeenCalledWith({ categories: ['rappel'] })
  })

  it('adds a second category', () => {
    const onChange = jest.fn()
    renderApp(<CanyonWaypointFields value={base} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('cwf-cat2-opt-rappel'))
    expect(onChange).toHaveBeenCalledWith({ categories: ['salto', 'rappel'] })
  })

  it('clears the second category with the none option', () => {
    const onChange = jest.fn()
    renderApp(
      <CanyonWaypointFields
        value={{ ...base, categories: ['salto', 'rappel'] }}
        onChange={onChange}
      />,
    )
    expect(screen.getByTestId('cwf-cat2-value')).toHaveTextContent('rappel')
    fireEvent.click(screen.getByTestId('cwf-cat2-opt-'))
    expect(onChange).toHaveBeenCalledWith({ categories: ['salto'] })
  })

  it('parses a latitude into a number', () => {
    const onChange = jest.fn()
    renderApp(<CanyonWaypointFields value={base} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('cwf-lat'), {
      target: { value: '43.5' },
    })
    expect(onChange).toHaveBeenCalledWith({ lat: 43.5 })
  })

  it('clears the longitude when emptied', () => {
    const onChange = jest.fn()
    renderApp(<CanyonWaypointFields value={base} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('cwf-lon'), { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith({ lon: undefined })
  })

  it('shows empty coordinate inputs when the waypoint has none', () => {
    renderApp(
      <CanyonWaypointFields
        value={{ ...base, lat: undefined, lon: undefined }}
        onChange={jest.fn()}
      />,
    )
    expect(screen.getByTestId('cwf-lat')).toHaveValue(null)
    expect(screen.getByTestId('cwf-lon')).toHaveValue(null)
  })

  it('renders notes as editable lines (leading space = nested)', () => {
    renderApp(<CanyonWaypointFields value={base} onChange={jest.fn()} />)
    expect(screen.getByTestId('cwf-notes')).toHaveValue('- top\n - nested')
  })

  it('defaults side and severity to auto', () => {
    renderApp(<CanyonWaypointFields value={base} onChange={jest.fn()} />)
    expect(screen.getByTestId('cwf-side-value')).toHaveTextContent('')
    expect(screen.getByTestId('cwf-sev-value')).toHaveTextContent('')
  })

  it('sets an explicit side', () => {
    const onChange = jest.fn()
    renderApp(<CanyonWaypointFields value={base} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('cwf-side-opt-left'))
    expect(onChange).toHaveBeenCalledWith({ side: 'left' })
  })

  it('resets the side to auto', () => {
    const onChange = jest.fn()
    renderApp(
      <CanyonWaypointFields
        value={{ ...base, side: 'left' }}
        onChange={onChange}
      />,
    )
    expect(screen.getByTestId('cwf-side-value')).toHaveTextContent('left')
    fireEvent.click(screen.getByTestId('cwf-side-opt-'))
    expect(onChange).toHaveBeenCalledWith({ side: undefined })
  })

  it('sets an explicit severity', () => {
    const onChange = jest.fn()
    renderApp(<CanyonWaypointFields value={base} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('cwf-sev-opt-danger'))
    expect(onChange).toHaveBeenCalledWith({ severity: 'danger' })
  })

  it('resets the severity to auto', () => {
    const onChange = jest.fn()
    renderApp(
      <CanyonWaypointFields
        value={{ ...base, severity: 'caution' }}
        onChange={onChange}
      />,
    )
    expect(screen.getByTestId('cwf-sev-value')).toHaveTextContent('caution')
    fireEvent.click(screen.getByTestId('cwf-sev-opt-'))
    expect(onChange).toHaveBeenCalledWith({ severity: undefined })
  })

  it('sets the drop height', () => {
    const onChange = jest.fn()
    renderApp(<CanyonWaypointFields value={base} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('cwf-meters'), {
      target: { value: '10 m' },
    })
    expect(onChange).toHaveBeenCalledWith({ meters: '10 m' })
  })

  it('clears the drop height', () => {
    const onChange = jest.fn()
    renderApp(
      <CanyonWaypointFields
        value={{ ...base, meters: '5 m' }}
        onChange={onChange}
      />,
    )
    expect(screen.getByTestId('cwf-meters')).toHaveValue('5 m')
    fireEvent.change(screen.getByTestId('cwf-meters'), {
      target: { value: '' },
    })
    expect(onChange).toHaveBeenCalledWith({ meters: undefined })
  })

  it('parses edited note lines back into structured notes', () => {
    const onChange = jest.fn()
    renderApp(<CanyonWaypointFields value={base} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('cwf-notes'), {
      target: { value: '- one\n  - two\n\n plain' },
    })
    expect(onChange).toHaveBeenCalledWith({
      notes: [
        { text: 'one', sub: false },
        { text: 'two', sub: true },
        { text: 'plain', sub: true },
      ],
    })
  })
})
