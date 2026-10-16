import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { FlowField } from './FlowField'

vi.mock('@web/i18n/client', async () => {
  const admin: Record<string, unknown> = await vi.importActual<
    typeof import('@web/i18n/locales/en/admin.json')
  >('@web/i18n/locales/en/admin.json')
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

vi.mock('@sdlgr/select', () => ({
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

describe('FlowField', () => {
  it('renders the level, affects and phenomena inputs', () => {
    renderApp(<FlowField value={{}} onChange={vi.fn()} idPrefix="sb" />)
    expect(screen.getByTestId('sb-flow-level')).toBeInTheDocument()
    expect(screen.getByTestId('sb-flow-rappels')).toBeInTheDocument()
    expect(screen.getByTestId('sb-phenomenon-murky')).toBeInTheDocument()
  })

  it('sets the flow level', () => {
    const onChange = vi.fn()
    renderApp(<FlowField value={{}} onChange={onChange} idPrefix="sb" />)
    fireEvent.click(screen.getByTestId('sb-flow-level-opt-normal'))
    expect(onChange).toHaveBeenCalledWith({ flowLevel: 'normal' })
  })

  it('sets the affects-rappels answer', () => {
    const onChange = vi.fn()
    renderApp(<FlowField value={{}} onChange={onChange} idPrefix="sb" />)
    fireEvent.click(screen.getByTestId('sb-flow-rappels-opt-some_water'))
    expect(onChange).toHaveBeenCalledWith({ flowRappels: 'some_water' })
  })

  it('adds a phenomenon when its checkbox is checked', () => {
    const onChange = vi.fn()
    renderApp(
      <FlowField
        value={{ phenomena: ['murky'] }}
        onChange={onChange}
        idPrefix="sb"
      />,
    )
    fireEvent.click(screen.getByTestId('sb-phenomenon-siphon'))
    expect(onChange).toHaveBeenCalledWith({ phenomena: ['murky', 'siphon'] })
  })

  it('removes a phenomenon when its checkbox is unchecked', () => {
    const onChange = vi.fn()
    renderApp(
      <FlowField
        value={{ phenomena: ['murky', 'siphon'] }}
        onChange={onChange}
        idPrefix="sb"
      />,
    )
    fireEvent.click(screen.getByTestId('sb-phenomenon-murky'))
    expect(onChange).toHaveBeenCalledWith({ phenomena: ['siphon'] })
  })

  it('reflects the selected phenomena in the checkboxes', () => {
    renderApp(
      <FlowField
        value={{ phenomena: ['murky'] }}
        onChange={vi.fn()}
        idPrefix="sb"
      />,
    )
    expect(screen.getByTestId('sb-phenomenon-murky')).toBeChecked()
    expect(screen.getByTestId('sb-phenomenon-siphon')).not.toBeChecked()
  })
})
