import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { PostContentFerrataSummary } from './PostContentFerrataSummary'

const mockDownloadPng = jest.fn<Promise<void>, [string]>()

jest.mock('@web/components/FerrataSummary', () => ({
  FerrataSummaryMap: ({
    data,
    interaction,
  }: {
    data: { lang: string; grade?: string }
    interaction?: string
  }) => (
    <div data-testid="ferrata-map-mock">
      <span data-testid="fm-lang">{data.lang}</span>
      <span data-testid="fm-interaction">{interaction ?? ''}</span>
    </div>
  ),
  useFerrataSummaryPng: () => ({ downloadPng: mockDownloadPng }),
}))

let mockLanguage = 'en'
jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: mockLanguage },
  }),
}))

const DATA = JSON.stringify({
  kind: 'summary-ferrata',
  lang: 'es',
  title: 'Ferrata X',
  grade: 'K3',
})

describe('PostContentFerrataSummary', () => {
  beforeEach(() => {
    mockLanguage = 'en'
    mockDownloadPng.mockReset()
    mockDownloadPng.mockResolvedValue(undefined)
  })

  it('renders nothing without data', () => {
    renderApp(<PostContentFerrataSummary />)
    expect(screen.queryByTestId('post-ferrata-summary')).not.toBeInTheDocument()
  })

  it('renders nothing for a malformed body', () => {
    renderApp(<PostContentFerrataSummary data="{bad" />)
    expect(screen.queryByTestId('post-ferrata-summary')).not.toBeInTheDocument()
  })

  it('renders the map for valid data', () => {
    renderApp(<PostContentFerrataSummary data={DATA} />)
    expect(screen.getByTestId('post-ferrata-summary')).toBeInTheDocument()
    expect(screen.getByTestId('ferrata-map-mock')).toBeInTheDocument()
  })

  it('resolves the UI language when no override is given', () => {
    mockLanguage = 'es'
    renderApp(<PostContentFerrataSummary data={DATA} />)
    expect(screen.getByTestId('fm-lang')).toHaveTextContent('es')
  })

  it('lets an explicit lang prop override the UI language', () => {
    mockLanguage = 'en'
    renderApp(<PostContentFerrataSummary data={DATA} lang="es" />)
    expect(screen.getByTestId('fm-lang')).toHaveTextContent('es')
  })

  it('renders the map in click-only mode', () => {
    renderApp(<PostContentFerrataSummary data={DATA} />)
    expect(screen.getByTestId('fm-interaction')).toHaveTextContent('click')
  })

  it('shows the download button by default', () => {
    renderApp(<PostContentFerrataSummary data={DATA} />)
    expect(
      screen.getByTestId('post-ferrata-summary-download'),
    ).toBeInTheDocument()
  })

  it('hides the download button when noDownload is set', () => {
    renderApp(<PostContentFerrataSummary data={DATA} noDownload />)
    expect(
      screen.queryByTestId('post-ferrata-summary-download'),
    ).not.toBeInTheDocument()
  })

  it('downloads the PNG with a title-derived filename', async () => {
    renderApp(<PostContentFerrataSummary data={DATA} lang="en" />)
    await userEvent.click(screen.getByTestId('post-ferrata-summary-download'))
    expect(mockDownloadPng).toHaveBeenCalledWith('ferrata-ferrata_x-en')
  })

  it('falls back to a generic filename without a title', async () => {
    const noTitle = JSON.stringify({ kind: 'summary-ferrata', lang: 'en' })
    renderApp(<PostContentFerrataSummary data={noTitle} />)
    await userEvent.click(screen.getByTestId('post-ferrata-summary-download'))
    expect(mockDownloadPng).toHaveBeenCalledWith('ferrata-ferrata-en')
  })

  it('shows an error when the export fails', async () => {
    mockDownloadPng.mockRejectedValueOnce(new Error('boom'))
    renderApp(<PostContentFerrataSummary data={DATA} />)
    await userEvent.click(screen.getByTestId('post-ferrata-summary-download'))
    expect(
      await screen.findByTestId('post-ferrata-summary-download-error'),
    ).toBeInTheDocument()
  })
})
