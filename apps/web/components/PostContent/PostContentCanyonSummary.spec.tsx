import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { PostContentCanyonSummary } from './PostContentCanyonSummary'

const mockDownloadPng = jest.fn<Promise<void>, [string]>()

jest.mock('@web/components/CanyonSummary', () => ({
  CanyonSummaryMap: ({
    data,
    interaction,
  }: {
    data: { lang: string; title?: string }
    interaction?: string
  }) => (
    <div data-testid="canyon-map-mock">
      <span data-testid="cm-lang">{data.lang}</span>
      <span data-testid="cm-title">{data.title ?? ''}</span>
      <span data-testid="cm-interaction">{interaction ?? ''}</span>
    </div>
  ),
  useCanyonSummaryPng: () => ({ downloadPng: mockDownloadPng }),
}))

let mockLanguage = 'en'
jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: mockLanguage },
  }),
}))

const DATA = JSON.stringify({
  kind: 'canyoning-data',
  lang: 'es',
  title: 'Barranco X',
  grade: 'v4 a3 III',
})

describe('PostContentCanyonSummary', () => {
  beforeEach(() => {
    mockLanguage = 'en'
    mockDownloadPng.mockReset()
    mockDownloadPng.mockResolvedValue(undefined)
  })

  it('renders nothing without data', () => {
    renderApp(<PostContentCanyonSummary />)
    expect(screen.queryByTestId('post-canyon-summary')).not.toBeInTheDocument()
  })

  it('renders nothing for a malformed body', () => {
    renderApp(<PostContentCanyonSummary data="{bad" />)
    expect(screen.queryByTestId('post-canyon-summary')).not.toBeInTheDocument()
  })

  it('renders the map for valid data', () => {
    renderApp(<PostContentCanyonSummary data={DATA} />)
    expect(screen.getByTestId('post-canyon-summary')).toBeInTheDocument()
    expect(screen.getByTestId('canyon-map-mock')).toBeInTheDocument()
  })

  it('resolves the UI language when no override is given', () => {
    mockLanguage = 'es'
    renderApp(<PostContentCanyonSummary data={DATA} />)
    expect(screen.getByTestId('cm-lang')).toHaveTextContent('es')
  })

  it('lets an explicit lang prop override the UI language', () => {
    mockLanguage = 'en'
    renderApp(<PostContentCanyonSummary data={DATA} lang="es" />)
    expect(screen.getByTestId('cm-lang')).toHaveTextContent('es')
  })

  it('renders the map in click-only mode', () => {
    renderApp(<PostContentCanyonSummary data={DATA} />)
    expect(screen.getByTestId('cm-interaction')).toHaveTextContent('click')
  })

  it('shows the download button by default', () => {
    renderApp(<PostContentCanyonSummary data={DATA} />)
    expect(
      screen.getByTestId('post-canyon-summary-download'),
    ).toBeInTheDocument()
  })

  it('hides the download button when noDownload is set', () => {
    renderApp(<PostContentCanyonSummary data={DATA} noDownload />)
    expect(
      screen.queryByTestId('post-canyon-summary-download'),
    ).not.toBeInTheDocument()
  })

  it('downloads the PNG with a title-derived filename', async () => {
    renderApp(<PostContentCanyonSummary data={DATA} lang="en" />)
    await userEvent.click(screen.getByTestId('post-canyon-summary-download'))
    expect(mockDownloadPng).toHaveBeenCalledWith('canyon-barranco_x-en')
  })

  it('falls back to a generic filename without a title', async () => {
    const noTitle = JSON.stringify({ kind: 'canyoning-data', lang: 'en' })
    renderApp(<PostContentCanyonSummary data={noTitle} />)
    await userEvent.click(screen.getByTestId('post-canyon-summary-download'))
    expect(mockDownloadPng).toHaveBeenCalledWith('canyon-canyon-en')
  })

  it('shows an error when the export fails', async () => {
    mockDownloadPng.mockRejectedValueOnce(new Error('boom'))
    renderApp(<PostContentCanyonSummary data={DATA} />)
    await userEvent.click(screen.getByTestId('post-canyon-summary-download'))
    expect(
      await screen.findByTestId('post-canyon-summary-download-error'),
    ).toBeInTheDocument()
  })
})
