import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { DEFAULT_WAYPOINT_STATE, WaypointFields } from './WaypointFields'

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

describe('WaypointFields', () => {
  const value = { ...DEFAULT_WAYPOINT_STATE }

  it('renders every field', () => {
    renderApp(<WaypointFields value={value} onChange={jest.fn()} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByTestId('wf-category')).toBeInTheDocument()
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument()
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument()
    expect(screen.getByLabelText('Elevation (m)')).toBeInTheDocument()
    expect(screen.getByLabelText('Min elevation (m)')).toBeInTheDocument()
    expect(screen.getByLabelText('Max elevation (m)')).toBeInTheDocument()
  })

  it('emits a patch for each text input', () => {
    const onChange = jest.fn()
    renderApp(<WaypointFields value={value} onChange={onChange} />)
    const changes: Array<[string, string, Record<string, string>]> = [
      ['Name', 'Foo', { name: 'Foo' }],
      ['Latitude', '1', { lat: '1' }],
      ['Longitude', '2', { lon: '2' }],
      ['Elevation (m)', '3', { ele: '3' }],
      ['Min elevation (m)', '4', { emin: '4' }],
      ['Max elevation (m)', '5', { emax: '5' }],
    ]
    changes.forEach(([label, input, patch]) => {
      fireEvent.change(screen.getByLabelText(label), {
        target: { value: input },
      })
      expect(onChange).toHaveBeenCalledWith(patch)
    })
  })

  it('emits a patch when a category is selected', () => {
    const onChange = jest.fn()
    renderApp(<WaypointFields value={value} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('wf-category-opt-summit'))
    expect(onChange).toHaveBeenCalledWith({ category: 'summit' })
  })
})
