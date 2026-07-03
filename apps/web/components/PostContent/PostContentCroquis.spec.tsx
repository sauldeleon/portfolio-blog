import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { PostContentCroquis } from './PostContentCroquis'

const mockDownloadPng = jest.fn<Promise<void>, [string]>()

jest.mock('@web/components/Croquis', () => ({
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
jest.mock('@web/i18n/client', () => ({
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

  it('passes the title through to the map', () => {
    renderApp(<PostContentCroquis obstacles={OB} title="Barranco X" />)
    expect(screen.getByTestId('cm-title')).toHaveTextContent('Barranco X')
  })

  it('renders the map in click-only mode', () => {
    renderApp(<PostContentCroquis obstacles={OB} />)
    expect(screen.getByTestId('cm-interaction')).toHaveTextContent('click')
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
})
