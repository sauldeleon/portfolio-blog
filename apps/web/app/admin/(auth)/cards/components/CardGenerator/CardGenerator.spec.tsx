import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { CardGenerator } from './CardGenerator'

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

vi.mock('../CardPreview', () => ({
  CardPreview: ({ svg, filename }: { svg: string; filename: string }) => (
    <div data-testid="card-preview-mock">
      <span data-testid="preview-filename">{filename}</span>
      <span data-testid="preview-has-svg">{svg.length > 0 ? 'yes' : 'no'}</span>
    </div>
  ),
}))

vi.mock('../CanyoningForm', () => ({
  CanyoningForm: ({
    value,
    onChange,
  }: {
    value: { title?: string; date?: string }
    onChange: (v: unknown) => void
  }) => (
    <div data-testid="canyoning-form-mock">
      <input
        data-testid="mock-title-input"
        value={value.title ?? ''}
        onChange={(e) =>
          onChange({
            kind: 'canyoning-data',
            lang: 'es',
            title: e.target.value,
          })
        }
      />
      <input
        data-testid="mock-date-input"
        value={value.date ?? ''}
        onChange={(e) =>
          onChange({
            kind: 'canyoning-data',
            lang: 'es',
            title: value.title,
            date: e.target.value,
          })
        }
      />
    </div>
  ),
}))

vi.mock('../RouteForm', () => ({
  RouteForm: ({
    value,
    onChange,
  }: {
    value: { title?: string; date?: string }
    onChange: (v: unknown) => void
  }) => (
    <div data-testid="route-form-mock">
      <input
        data-testid="mock-ruta-title"
        value={value.title ?? ''}
        onChange={(e) =>
          onChange({ kind: 'summary-route', lang: 'es', title: e.target.value })
        }
      />
      <input
        data-testid="mock-ruta-date"
        value={value.date ?? ''}
        onChange={(e) =>
          onChange({ kind: 'summary-route', lang: 'es', date: e.target.value })
        }
      />
    </div>
  ),
}))

vi.mock('../FerrataForm', () => ({
  FerrataForm: ({
    value,
    onChange,
  }: {
    value: { title?: string }
    onChange: (v: unknown) => void
  }) => (
    <div data-testid="ferrata-form-mock">
      <input
        data-testid="mock-ferrata-title"
        value={value.title ?? ''}
        onChange={(e) =>
          onChange({
            kind: 'summary-ferrata',
            lang: 'es',
            title: e.target.value,
          })
        }
      />
    </div>
  ),
}))

vi.mock('../WaypointGenerator', () => ({
  WaypointGenerator: () => <div data-testid="waypoint-generator-mock" />,
}))

vi.mock('../WaypointForm', () => ({
  WaypointForm: () => <div data-testid="waypoint-form-mock" />,
}))

vi.mock('../CanyonWaypointsGenerator', () => ({
  CanyonWaypointsGenerator: () => (
    <div data-testid="canyon-waypoints-generator-mock" />
  ),
}))

vi.mock('../CroquisGenerator', () => ({
  CroquisGenerator: () => <div data-testid="croquis-generator-mock" />,
}))

function summaryMock(testId: string) {
  return ({
    data,
    filename,
  }: {
    data: { title?: string }
    filename: string
  }) => (
    <div data-testid={testId}>
      {filename}|{data.title}
    </div>
  )
}

vi.mock('../CanyonSummary', () => ({
  CanyonSummary: summaryMock('canyon-summary-mock'),
}))

vi.mock('../RouteSummary', () => ({
  RouteSummary: summaryMock('route-summary-mock'),
}))

vi.mock('../FerrataSummary', () => ({
  FerrataSummary: summaryMock('ferrata-summary-mock'),
}))

describe('CardGenerator', () => {
  it('renders the title', () => {
    renderApp(<CardGenerator />)
    expect(screen.getByText('Cards')).toBeInTheDocument()
  })

  it('renders the card type buttons', () => {
    renderApp(<CardGenerator />)
    expect(screen.getByTestId('card-type-canyoning-data')).toBeInTheDocument()
    expect(screen.getByTestId('card-type-summary-route')).toBeInTheDocument()
    expect(screen.getByTestId('card-type-summary-ferrata')).toBeInTheDocument()
    expect(screen.getByTestId('card-type-canyon-waypoints')).toBeInTheDocument()
    expect(screen.getByTestId('card-type-croquis')).toBeInTheDocument()
  })

  it('renders the RouteForm by default', () => {
    renderApp(<CardGenerator />)
    expect(screen.getByTestId('route-form-mock')).toBeInTheDocument()
  })

  it('renders the CardPreview', () => {
    renderApp(<CardGenerator />)
    expect(screen.getByTestId('card-preview-mock')).toBeInTheDocument()
  })

  it('passes non-empty svg to CardPreview', () => {
    renderApp(<CardGenerator />)
    expect(screen.getByTestId('preview-has-svg')).toHaveTextContent('yes')
  })

  it('updates filename when title changes in ruta form', () => {
    renderApp(<CardGenerator />)
    fireEvent.change(screen.getByTestId('mock-ruta-title'), {
      target: { value: 'Aneto' },
    })
    expect(screen.getByTestId('preview-filename').textContent).toContain(
      'aneto',
    )
  })

  it('filename contains lang prefix', () => {
    renderApp(<CardGenerator />)
    expect(screen.getByTestId('preview-filename').textContent).toContain('en')
  })

  it('filename uses ruta slug when no title', () => {
    renderApp(<CardGenerator />)
    expect(screen.getByTestId('preview-filename').textContent).toContain(
      'route',
    )
  })

  it('filename includes date prefix when date is set', () => {
    renderApp(<CardGenerator />)
    fireEvent.change(screen.getByTestId('mock-ruta-date'), {
      target: { value: '15 JUL 2025' },
    })
    expect(screen.getByTestId('preview-filename').textContent).toContain(
      '15-jul-2025',
    )
  })

  it('clicking canyoning-data button switches to barranco form', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-canyoning-data'))
    expect(screen.getByTestId('canyoning-form-mock')).toBeInTheDocument()
    expect(screen.getByTestId('preview-filename').textContent).toContain(
      'canyoning',
    )
  })

  it('barranco filename updates when title changes', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-canyoning-data'))
    fireEvent.change(screen.getByTestId('mock-title-input'), {
      target: { value: 'Mascún' },
    })
    expect(screen.getByTestId('preview-filename').textContent).toContain(
      'mascun',
    )
  })

  it('switches to RouteForm when summary-route selected', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-summary-route'))
    expect(screen.getByTestId('route-form-mock')).toBeInTheDocument()
  })

  it('ruta filename contains ruta slug', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-summary-route'))
    expect(screen.getByTestId('preview-filename').textContent).toContain(
      'route',
    )
  })

  it('ruta filename updates when title changes', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-summary-route'))
    fireEvent.change(screen.getByTestId('mock-ruta-title'), {
      target: { value: 'Aneto' },
    })
    expect(screen.getByTestId('preview-filename').textContent).toContain(
      'aneto',
    )
  })

  it('ruta filename includes date when date set', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-summary-route'))
    fireEvent.change(screen.getByTestId('mock-ruta-date'), {
      target: { value: '10 AGO 2025' },
    })
    expect(screen.getByTestId('preview-filename').textContent).toContain(
      '10-ago-2025',
    )
  })

  it('switches to FerrataForm when summary-ferrata selected', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-summary-ferrata'))
    expect(screen.getByTestId('ferrata-form-mock')).toBeInTheDocument()
  })

  it('ferrata filename contains ferrata slug', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-summary-ferrata'))
    expect(screen.getByTestId('preview-filename').textContent).toContain(
      'ferrata',
    )
  })

  it('ferrata filename updates when title changes', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-summary-ferrata'))
    fireEvent.change(screen.getByTestId('mock-ferrata-title'), {
      target: { value: 'Del Oso' },
    })
    expect(screen.getByTestId('preview-filename').textContent).toContain(
      'del-oso',
    )
  })

  it('switching kind resets form', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-summary-route'))
    expect(screen.getByTestId('route-form-mock')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('card-type-canyoning-data'))
    expect(screen.getByTestId('canyoning-form-mock')).toBeInTheDocument()
  })

  it('shows the waypoint GPX generator on the waypoints tab', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-waypoints'))
    expect(screen.getByTestId('waypoint-generator-mock')).toBeInTheDocument()
    expect(screen.queryByTestId('ruta-form-mock')).not.toBeInTheDocument()
  })

  it('shows the single waypoint form on the waypoint-single tab', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-waypoint-single'))
    expect(screen.getByTestId('waypoint-form-mock')).toBeInTheDocument()
  })

  it('shows the canyon waypoints generator on the canyon-waypoints tab', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-canyon-waypoints'))
    expect(
      screen.getByTestId('canyon-waypoints-generator-mock'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('route-form-mock')).not.toBeInTheDocument()
  })

  it('returns to a spec form after leaving the canyon waypoints tab', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-canyon-waypoints'))
    expect(
      screen.getByTestId('canyon-waypoints-generator-mock'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('card-type-canyoning-data'))
    expect(screen.getByTestId('canyoning-form-mock')).toBeInTheDocument()
  })

  it('shows the croquis generator on the croquis tab', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-croquis'))
    expect(screen.getByTestId('croquis-generator-mock')).toBeInTheDocument()
    expect(screen.queryByTestId('route-form-mock')).not.toBeInTheDocument()
  })

  it('returns to a spec form after leaving the croquis tab', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-croquis'))
    expect(screen.getByTestId('croquis-generator-mock')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('card-type-canyoning-data'))
    expect(screen.getByTestId('canyoning-form-mock')).toBeInTheDocument()
  })

  describe('interactive preview', () => {
    afterEach(() => {
      window.localStorage.clear()
      vi.restoreAllMocks()
    })

    it('swaps the static preview for the interactive card of each kind', () => {
      renderApp(<CardGenerator />)
      const toggle = screen.getByLabelText('Interactive')
      expect(toggle).not.toBeChecked()
      fireEvent.click(toggle)
      expect(screen.queryByTestId('card-preview-mock')).not.toBeInTheDocument()
      expect(screen.getByTestId('route-summary-mock')).toHaveTextContent(
        'en_route_route',
      )
      fireEvent.click(screen.getByTestId('card-type-canyoning-data'))
      expect(screen.getByTestId('canyon-summary-mock')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('card-type-summary-ferrata'))
      expect(screen.getByTestId('ferrata-summary-mock')).toBeInTheDocument()
      fireEvent.click(screen.getByLabelText('Interactive'))
      expect(screen.getByTestId('card-preview-mock')).toBeInTheDocument()
    })

    it('keeps the form data when switching previews', () => {
      renderApp(<CardGenerator />)
      fireEvent.change(screen.getByTestId('mock-ruta-title'), {
        target: { value: 'Peña Ubiña' },
      })
      fireEvent.click(screen.getByLabelText('Interactive'))
      expect(screen.getByTestId('route-summary-mock')).toHaveTextContent(
        'Peña Ubiña',
      )
    })

    it('remembers the choice', () => {
      window.localStorage.setItem('admin.cards.interactive', '1')
      renderApp(<CardGenerator />)
      expect(screen.getByLabelText('Interactive')).toBeChecked()
      fireEvent.click(screen.getByLabelText('Interactive'))
      expect(window.localStorage.getItem('admin.cards.interactive')).toBe('0')
    })

    it('works with storage blocked', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked')
      })
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked')
      })
      renderApp(<CardGenerator />)
      const toggle = screen.getByLabelText('Interactive')
      expect(toggle).not.toBeChecked()
      fireEvent.click(toggle)
      expect(toggle).toBeChecked()
    })
  })

  it('returns to a spec form after leaving a waypoint tab', () => {
    renderApp(<CardGenerator />)
    fireEvent.click(screen.getByTestId('card-type-waypoints'))
    expect(screen.getByTestId('waypoint-generator-mock')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('card-type-canyoning-data'))
    expect(screen.getByTestId('canyoning-form-mock')).toBeInTheDocument()
  })
})
