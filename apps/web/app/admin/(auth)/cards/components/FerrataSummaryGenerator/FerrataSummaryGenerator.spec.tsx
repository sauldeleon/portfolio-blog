import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { FerrataSummaryGenerator } from './FerrataSummaryGenerator'

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

jest.mock('../FerrataSummary', () => ({
  FerrataSummary: ({
    data,
    filename,
  }: {
    data: { lang: string }
    filename: string
  }) => (
    <div data-testid="ferrata-summary-mock">
      <span data-testid="fs-lang">{data.lang}</span>
      <span data-testid="fs-filename">{filename}</span>
    </div>
  ),
}))

describe('FerrataSummaryGenerator', () => {
  it('renders the ferrata form and the interactive preview', () => {
    renderApp(<FerrataSummaryGenerator />)
    expect(screen.getByTestId('ferrata-form')).toBeInTheDocument()
    expect(screen.getByTestId('ferrata-summary-mock')).toBeInTheDocument()
  })

  it('uses a generic filename by default', () => {
    renderApp(<FerrataSummaryGenerator />)
    expect(screen.getByTestId('fs-filename')).toHaveTextContent(
      'ferrata-ferrata-en',
    )
  })

  it('derives the filename from the title', () => {
    renderApp(<FerrataSummaryGenerator />)
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Ferrata X' },
    })
    expect(screen.getByTestId('fs-filename')).toHaveTextContent(
      'ferrata-ferrata_x-en',
    )
  })

  it('reflects the selected language in the filename', () => {
    renderApp(<FerrataSummaryGenerator />)
    fireEvent.click(screen.getByTestId('lang-es'))
    expect(screen.getByTestId('fs-lang')).toHaveTextContent('es')
    expect(screen.getByTestId('fs-filename')).toHaveTextContent(
      'ferrata-ferrata-es',
    )
  })
})
