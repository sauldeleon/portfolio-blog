import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { waypointSlug } from '@web/lib/cards'

import { PostContentCroquis } from './PostContentCroquis'

const mockDownloadPng = vi.fn<(filename: string) => Promise<void>>()

vi.mock('./CroquisReportButton', () => ({
  CroquisReportButton: (props: { summary: unknown; fileBase: string }) => (
    <div
      data-testid="croquis-report-mock"
      data-summary={JSON.stringify(props.summary)}
      data-file-base={props.fileBase}
    />
  ),
}))

vi.mock('@web/components/Croquis', () => ({
  CroquisMap: ({
    obstacles,
    lang,
    title,
    interaction,
  }: {
    obstacles: unknown[]
    lang: string
    title?: string
    interaction?: string
  }) => (
    <div data-testid="croquis-map-mock">
      <span data-testid="cm-count">{obstacles.length}</span>
      <span data-testid="cm-lang">{lang}</span>
      <span data-testid="cm-title">{title ?? ''}</span>
      <span data-testid="cm-interaction">{interaction ?? ''}</span>
    </div>
  ),
  useCroquisPng: () => ({ downloadPng: mockDownloadPng }),
}))

let mockLanguage = 'en'
vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: mockLanguage },
  }),
}))

const OB = JSON.stringify([
  {
    type: 'salto',
    title: 'Jump',
    meters: 5,
    side: null,
    severity: 'easy',
    notes: [],
  },
])

describe('PostContentCroquis', () => {
  beforeEach(() => {
    mockLanguage = 'en'
    mockDownloadPng.mockReset()
    mockDownloadPng.mockResolvedValue(undefined)
  })

  it('renders nothing without obstacles', () => {
    renderApp(<PostContentCroquis />)
    expect(screen.queryByTestId('post-croquis')).not.toBeInTheDocument()
  })

  it('renders nothing for an empty obstacle list', () => {
    renderApp(<PostContentCroquis obstacles="[]" />)
    expect(screen.queryByTestId('post-croquis')).not.toBeInTheDocument()
  })

  it('renders the map with the parsed obstacles', () => {
    renderApp(<PostContentCroquis obstacles={OB} />)
    expect(screen.getByTestId('post-croquis')).toBeInTheDocument()
    expect(screen.getByTestId('cm-count')).toHaveTextContent('1')
    expect(screen.getByTestId('cm-lang')).toHaveTextContent('en')
  })

  it('passes the Spanish language through', () => {
    mockLanguage = 'es'
    renderApp(<PostContentCroquis obstacles={OB} />)
    expect(screen.getByTestId('cm-lang')).toHaveTextContent('es')
  })

  it('lets an explicit lang prop override the UI language', () => {
    mockLanguage = 'en'
    renderApp(<PostContentCroquis obstacles={OB} lang="es" />)
    expect(screen.getByTestId('cm-lang')).toHaveTextContent('es')
  })

  it('passes the title through to the map', () => {
    renderApp(<PostContentCroquis obstacles={OB} title="Barranco X" />)
    expect(screen.getByTestId('cm-title')).toHaveTextContent('Barranco X')
  })

  it('renders the map in click-only mode', () => {
    renderApp(<PostContentCroquis obstacles={OB} />)
    expect(screen.getByTestId('cm-interaction')).toHaveTextContent('click')
  })

  it('shows the download button by default', () => {
    renderApp(<PostContentCroquis obstacles={OB} />)
    expect(screen.getByTestId('post-croquis-download')).toBeInTheDocument()
  })

  it('hides the download button when noDownload is set', () => {
    renderApp(<PostContentCroquis obstacles={OB} noDownload />)
    expect(
      screen.queryByTestId('post-croquis-download'),
    ).not.toBeInTheDocument()
  })

  it('downloads the croquis PNG with a title-derived filename', async () => {
    renderApp(<PostContentCroquis obstacles={OB} title="Barranco X" />)
    await userEvent.click(screen.getByTestId('post-croquis-download'))
    expect(mockDownloadPng).toHaveBeenCalledWith('croquis-barranco_x-en')
  })

  it('falls back to a generic filename without a title', async () => {
    renderApp(<PostContentCroquis obstacles={OB} />)
    await userEvent.click(screen.getByTestId('post-croquis-download'))
    expect(mockDownloadPng).toHaveBeenCalledWith('croquis-croquis-en')
  })

  it('shows an error when the export fails', async () => {
    mockDownloadPng.mockRejectedValueOnce(new Error('boom'))
    renderApp(<PostContentCroquis obstacles={OB} />)
    await userEvent.click(screen.getByTestId('post-croquis-download'))
    expect(
      await screen.findByTestId('post-croquis-download-error'),
    ).toBeInTheDocument()
  })

  it('loads the canyon report button by default', async () => {
    renderApp(<PostContentCroquis obstacles={OB} title="Barranco X" />)
    const report = await screen.findByTestId('croquis-report-mock')
    expect(report).toHaveAttribute('data-file-base', waypointSlug('Barranco X'))
  })

  it('hides the report button when noReport is set', () => {
    renderApp(<PostContentCroquis obstacles={OB} noReport />)
    expect(screen.queryByTestId('post-croquis-report')).not.toBeInTheDocument()
    expect(screen.queryByTestId('croquis-report-mock')).not.toBeInTheDocument()
  })

  it('hides the whole bar when both buttons are disabled', () => {
    renderApp(<PostContentCroquis obstacles={OB} noDownload noReport />)
    expect(
      screen.queryByTestId('post-croquis-download'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('croquis-report-mock')).not.toBeInTheDocument()
  })

  it('passes the parsed canyon summary to the report', async () => {
    const summary = JSON.stringify({ kind: 'canyoning-data', lang: 'en' })
    renderApp(<PostContentCroquis obstacles={OB} summary={summary} />)
    const report = await screen.findByTestId('croquis-report-mock')
    expect(report.getAttribute('data-summary')).not.toBe('null')
  })

  it('passes no summary to the report when it is unparseable', async () => {
    renderApp(<PostContentCroquis obstacles={OB} summary="not-json" />)
    const report = await screen.findByTestId('croquis-report-mock')
    expect(report).toHaveAttribute('data-summary', 'null')
  })
})
