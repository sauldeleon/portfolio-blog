import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { PostContentRouteSummary } from './PostContentRouteSummary'

const mockDownloadPng = jest.fn<Promise<void>, [string]>()

jest.mock('@web/components/RouteSummary', () => ({
  RouteSummaryMap: ({ data }: { data: { lang: string } }) => (
    <div data-testid="route-map-mock">
      <span data-testid="fm-lang">{data.lang}</span>
    </div>
  ),
  useRouteSummaryPng: () => ({ downloadPng: mockDownloadPng }),
}))

let mockLanguage = 'en'
jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: mockLanguage },
  }),
}))

const DATA = JSON.stringify({
  kind: 'summary-route',
  lang: 'es',
  title: 'Peña Ubiña',
  dist: '16 km',
})

describe('PostContentRouteSummary', () => {
  beforeEach(() => {
    mockLanguage = 'en'
    mockDownloadPng.mockReset()
    mockDownloadPng.mockResolvedValue(undefined)
  })

  it('renders nothing without data', () => {
    renderApp(<PostContentRouteSummary />)
    expect(screen.queryByTestId('post-route-summary')).not.toBeInTheDocument()
  })

  it('renders nothing for a malformed body', () => {
    renderApp(<PostContentRouteSummary data="{bad" />)
    expect(screen.queryByTestId('post-route-summary')).not.toBeInTheDocument()
  })

  it('renders the map for valid data', () => {
    renderApp(<PostContentRouteSummary data={DATA} />)
    expect(screen.getByTestId('post-route-summary')).toBeInTheDocument()
    expect(screen.getByTestId('route-map-mock')).toBeInTheDocument()
  })

  it('resolves the UI language when no override is given', () => {
    mockLanguage = 'es'
    renderApp(<PostContentRouteSummary data={DATA} />)
    expect(screen.getByTestId('fm-lang')).toHaveTextContent('es')
  })

  it('lets an explicit lang prop override the UI language', () => {
    mockLanguage = 'en'
    renderApp(<PostContentRouteSummary data={DATA} lang="es" />)
    expect(screen.getByTestId('fm-lang')).toHaveTextContent('es')
  })

  it('shows the download button by default', () => {
    renderApp(<PostContentRouteSummary data={DATA} />)
    expect(
      screen.getByTestId('post-route-summary-download'),
    ).toBeInTheDocument()
  })

  it('hides the download button when noDownload is set', () => {
    renderApp(<PostContentRouteSummary data={DATA} noDownload />)
    expect(
      screen.queryByTestId('post-route-summary-download'),
    ).not.toBeInTheDocument()
  })

  it('downloads the PNG with a title-derived filename', async () => {
    renderApp(<PostContentRouteSummary data={DATA} lang="en" />)
    await userEvent.click(screen.getByTestId('post-route-summary-download'))
    expect(mockDownloadPng).toHaveBeenCalledWith('route-pena_ubina-en')
  })

  it('falls back to a generic filename without a title', async () => {
    const noTitle = JSON.stringify({ kind: 'summary-route', lang: 'en' })
    renderApp(<PostContentRouteSummary data={noTitle} />)
    await userEvent.click(screen.getByTestId('post-route-summary-download'))
    expect(mockDownloadPng).toHaveBeenCalledWith('route-route-en')
  })

  it('shows an error when the export fails', async () => {
    mockDownloadPng.mockRejectedValueOnce(new Error('boom'))
    renderApp(<PostContentRouteSummary data={DATA} />)
    await userEvent.click(screen.getByTestId('post-route-summary-download'))
    expect(
      await screen.findByTestId('post-route-summary-download-error'),
    ).toBeInTheDocument()
  })
})
