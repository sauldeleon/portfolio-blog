import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { WaypointForm } from './WaypointForm'

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

jest.mock('../CardPreview', () => ({
  CardPreview: ({
    svg,
    filename,
    disableUpload,
  }: {
    svg: string
    filename: string
    disableUpload?: boolean
  }) => (
    <div data-testid="card-preview">
      <span data-testid="cp-file">{filename}</span>
      <span data-testid="cp-len">{String(svg.length)}</span>
      <span data-testid="cp-disabled">{String(disableUpload)}</span>
    </div>
  ),
}))

describe('WaypointForm', () => {
  it('renders the inputs and a preview', () => {
    renderApp(<WaypointForm />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByTestId('wf-category')).toBeInTheDocument()
    expect(screen.getByTestId('card-preview')).toBeInTheDocument()
    // empty name -> default filename
    expect(screen.getByTestId('cp-file')).toHaveTextContent('en_waypoint')
  })

  it('updates the filename from the name and language', () => {
    renderApp(<WaypointForm />)
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Refugio Foo' },
    })
    expect(screen.getByTestId('cp-file')).toHaveTextContent('en_refugio_foo')
    fireEvent.click(screen.getByTestId('wp-lang-es'))
    expect(screen.getByTestId('cp-file')).toHaveTextContent('es_refugio_foo')
  })

  it('disables upload until a name is provided', () => {
    renderApp(<WaypointForm />)
    expect(screen.getByTestId('cp-disabled')).toHaveTextContent('true')
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Refugio' },
    })
    expect(screen.getByTestId('cp-disabled')).toHaveTextContent('false')
  })

  it('selects a category', () => {
    renderApp(<WaypointForm />)
    fireEvent.click(screen.getByTestId('wf-category-opt-summit'))
    expect(screen.getByTestId('wf-category-value')).toHaveTextContent('summit')
  })

  it('accepts location and altimeter inputs', () => {
    renderApp(<WaypointForm />)
    fireEvent.change(screen.getByLabelText('Latitude'), {
      target: { value: '42.5' },
    })
    fireEvent.change(screen.getByLabelText('Longitude'), {
      target: { value: '-1.2' },
    })
    fireEvent.change(screen.getByLabelText('Elevation (m)'), {
      target: { value: '1850' },
    })
    fireEvent.change(screen.getByLabelText('Min elevation (m)'), {
      target: { value: '1200' },
    })
    fireEvent.change(screen.getByLabelText('Max elevation (m)'), {
      target: { value: '2500' },
    })
    expect(Number(screen.getByTestId('cp-len').textContent)).toBeGreaterThan(0)
  })
})
