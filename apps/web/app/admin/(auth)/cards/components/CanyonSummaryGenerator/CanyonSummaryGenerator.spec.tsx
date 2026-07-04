import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { CanyonSummaryGenerator } from './CanyonSummaryGenerator'

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

jest.mock('../CanyonSummary', () => ({
  CanyonSummary: ({
    data,
    filename,
  }: {
    data: { lang: string }
    filename: string
  }) => (
    <div data-testid="canyon-summary-mock">
      <span data-testid="cs-lang">{data.lang}</span>
      <span data-testid="cs-filename">{filename}</span>
    </div>
  ),
}))

describe('CanyonSummaryGenerator', () => {
  it('renders the canyon form and the interactive preview', () => {
    renderApp(<CanyonSummaryGenerator />)
    expect(screen.getByTestId('canyoning-form')).toBeInTheDocument()
    expect(screen.getByTestId('canyon-summary-mock')).toBeInTheDocument()
  })

  it('uses a generic filename by default', () => {
    renderApp(<CanyonSummaryGenerator />)
    expect(screen.getByTestId('cs-filename')).toHaveTextContent(
      'canyon-canyon-en',
    )
  })

  it('derives the filename from the title', () => {
    renderApp(<CanyonSummaryGenerator />)
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Barranco X' },
    })
    expect(screen.getByTestId('cs-filename')).toHaveTextContent(
      'canyon-barranco_x-en',
    )
  })

  it('reflects the selected language in the filename', () => {
    renderApp(<CanyonSummaryGenerator />)
    fireEvent.click(screen.getByTestId('lang-es'))
    expect(screen.getByTestId('cs-lang')).toHaveTextContent('es')
    expect(screen.getByTestId('cs-filename')).toHaveTextContent(
      'canyon-canyon-es',
    )
  })
})
