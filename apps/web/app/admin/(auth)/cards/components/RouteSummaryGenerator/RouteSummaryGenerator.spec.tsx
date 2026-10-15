import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { RouteSummaryGenerator } from './RouteSummaryGenerator'

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

jest.mock('../RouteSummary', () => ({
  RouteSummary: ({
    data,
    filename,
  }: {
    data: { lang: string }
    filename: string
  }) => (
    <div data-testid="route-summary-mock">
      <span data-testid="fs-lang">{data.lang}</span>
      <span data-testid="fs-filename">{filename}</span>
    </div>
  ),
}))

describe('RouteSummaryGenerator', () => {
  it('renders the route form and the interactive preview', () => {
    renderApp(<RouteSummaryGenerator />)
    expect(screen.getByTestId('route-form')).toBeInTheDocument()
    expect(screen.getByTestId('route-summary-mock')).toBeInTheDocument()
  })

  it('uses a generic filename by default', () => {
    renderApp(<RouteSummaryGenerator />)
    expect(screen.getByTestId('fs-filename')).toHaveTextContent(
      'route-route-en',
    )
  })

  it('derives the filename from the title', () => {
    renderApp(<RouteSummaryGenerator />)
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Peña Ubiña' },
    })
    expect(screen.getByTestId('fs-filename')).toHaveTextContent(
      'route-pena_ubina-en',
    )
  })

  it('reflects the selected language in the filename', () => {
    renderApp(<RouteSummaryGenerator />)
    fireEvent.click(screen.getByTestId('lang-es'))
    expect(screen.getByTestId('fs-lang')).toHaveTextContent('es')
    expect(screen.getByTestId('fs-filename')).toHaveTextContent(
      'route-route-es',
    )
  })
})
