import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { InteractiveCardInsertModal } from './InteractiveCardInsertModal'

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
    <select
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">—</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}))

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

function setup(overrides: Record<string, unknown> = {}) {
  const onInsert = vi.fn()
  const onCancel = vi.fn()
  renderApp(
    <InteractiveCardInsertModal
      isOpen
      lang="en"
      onInsert={onInsert}
      onCancel={onCancel}
      {...overrides}
    />,
  )
  return { onInsert, onCancel }
}

function preview() {
  return screen.getByTestId(
    'interactive-card-modal-preview',
  ) as HTMLTextAreaElement
}

describe('InteractiveCardInsertModal', () => {
  it('does not render when closed', () => {
    renderApp(
      <InteractiveCardInsertModal
        isOpen={false}
        lang="en"
        onInsert={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(
      screen.queryByTestId('interactive-card-modal'),
    ).not.toBeInTheDocument()
  })

  it('defaults to the canyon form and a canyon-summary preview', () => {
    setup()
    expect(screen.getByTestId('canyoning-form')).toBeInTheDocument()
    expect(preview().value).toContain('```canyon-summary')
    expect(preview().value).toContain('"kind": "canyoning-data"')
  })

  it('switches to the ferrata form and a ferrata-summary preview', () => {
    setup()
    fireEvent.click(screen.getByTestId('interactive-card-type-ferrata'))
    expect(screen.getByTestId('ferrata-form')).toBeInTheDocument()
    expect(preview().value).toContain('```ferrata-summary')
    expect(preview().value).toContain('"kind": "summary-ferrata"')
  })

  it('switches to the route form and a route-summary preview', () => {
    setup()
    fireEvent.click(screen.getByTestId('interactive-card-type-route'))
    expect(screen.getByTestId('route-form')).toBeInTheDocument()
    expect(preview().value).toContain('```route-summary')
    expect(preview().value).toContain('"kind": "summary-route"')
  })

  it('inserts the route block and resets it', () => {
    const { onInsert } = setup()
    fireEvent.click(screen.getByTestId('interactive-card-type-route'))
    fireEvent.click(screen.getByTestId('interactive-card-modal-insert'))
    expect(onInsert.mock.calls[0][0]).toContain('```route-summary')
  })

  it('switches back to the canyon form', () => {
    setup()
    fireEvent.click(screen.getByTestId('interactive-card-type-ferrata'))
    fireEvent.click(screen.getByTestId('interactive-card-type-canyon'))
    expect(screen.getByTestId('canyoning-form')).toBeInTheDocument()
    expect(preview().value).toContain('```canyon-summary')
  })

  it('has no language toggle inside the forms', () => {
    setup()
    expect(screen.queryByTestId('lang-en')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lang-es')).not.toBeInTheDocument()
  })

  it('takes the card language from the post locale', () => {
    setup({ lang: 'es' })
    expect(preview().value).toContain('"lang": "es"')
  })

  it('adds the no-download flag when the toggle is unchecked', () => {
    setup()
    fireEvent.click(
      screen.getByTestId('interactive-card-modal-download-toggle'),
    )
    expect(preview().value).toContain('```canyon-summary no-download')
  })

  it('inserts the canyon block by default', () => {
    const { onInsert } = setup()
    fireEvent.click(screen.getByTestId('interactive-card-modal-insert'))
    const md = onInsert.mock.calls[0][0] as string
    expect(md).toContain('```canyon-summary')
  })

  it('inserts the ferrata block when that type is selected', () => {
    const { onInsert } = setup()
    fireEvent.click(screen.getByTestId('interactive-card-type-ferrata'))
    fireEvent.click(screen.getByTestId('interactive-card-modal-insert'))
    const md = onInsert.mock.calls[0][0] as string
    expect(md).toContain('```ferrata-summary')
  })

  it('cancels', () => {
    const { onCancel } = setup()
    fireEvent.click(screen.getByTestId('interactive-card-modal-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('seeds the canyon type from initial values', () => {
    setup({
      initialValues: {
        data: {
          kind: 'canyoning-data',
          lang: 'en',
          title: 'Barranco Editado',
        },
        showDownload: false,
      },
    })
    expect(screen.getByTestId('canyoning-form')).toBeInTheDocument()
    expect(preview().value).toContain('Barranco Editado')
    expect(preview().value).toContain('no-download')
  })

  it('seeds the ferrata type from initial values', () => {
    setup({
      initialValues: {
        data: { kind: 'summary-ferrata', lang: 'en', title: 'Ferrata Editada' },
        showDownload: true,
      },
    })
    expect(screen.getByTestId('ferrata-form')).toBeInTheDocument()
    expect(preview().value).toContain('```ferrata-summary')
    expect(preview().value).toContain('Ferrata Editada')
  })

  it('seeds the route type from initial values', () => {
    setup({
      initialValues: {
        data: { kind: 'summary-route', lang: 'en', title: 'Peña Ubiña' },
        showDownload: true,
      },
    })
    expect(screen.getByTestId('route-form')).toBeInTheDocument()
    expect(preview().value).toContain('```route-summary')
    expect(preview().value).toContain('Peña Ubiña')
  })
})
