import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { WaypointGenerator } from './WaypointGenerator'

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

jest.mock('../CardPreview', () => ({
  CardPreview: ({ filename }: { filename: string }) => (
    <div data-testid="card-preview">{filename}</div>
  ),
}))

function makeAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data,
    statusText: 'Error',
    headers: {},
    config: {} as never,
  })
}

const URL = 'https://example.com/route.gpx'
const waypoints = [
  { name: 'Refugio', lat: 42.5, lon: -1.2, ele: 1850, category: 'refugio' },
  { name: 'Rápel 1', lat: 42.6, lon: -1.3, ele: 1500, category: 'rappel' },
]

afterEach(() => {
  jest.restoreAllMocks()
})

describe('WaypointGenerator', () => {
  it('renders the lang toggle and disabled generate button', () => {
    renderApp(<WaypointGenerator />)
    expect(screen.getByTestId('wp-lang-en')).toBeInTheDocument()
    expect(screen.getByTestId('wp-generate')).toBeDisabled()
  })

  it('generates a card per waypoint on success', async () => {
    const getSpy = jest
      .spyOn(axios, 'get')
      .mockResolvedValue({ data: { data: waypoints } })
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    await waitFor(() =>
      expect(screen.getAllByTestId('card-preview')).toHaveLength(2),
    )
    expect(getSpy).toHaveBeenCalledWith('/api/cards/waypoints', {
      params: { url: URL },
    })
    expect(screen.getByText('en_refugio')).toBeInTheDocument()
  })

  it('re-renders filenames in Spanish when the language toggles', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: waypoints } })
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    await screen.findByText('en_refugio')
    fireEvent.click(screen.getByTestId('wp-lang-es'))
    expect(screen.getByText('es_refugio')).toBeInTheDocument()
  })

  it('shows the server error on a failed response', async () => {
    jest
      .spyOn(axios, 'get')
      .mockRejectedValue(makeAxiosError(400, { error: 'Invalid GPX URL' }))
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    expect(await screen.findByTestId('wp-error')).toHaveTextContent(
      'Invalid GPX URL',
    )
  })

  it('shows a fallback error when the axios error has no message', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(makeAxiosError(500, {}))
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    expect(await screen.findByTestId('wp-error')).toHaveTextContent(
      'Could not parse GPX file',
    )
  })

  it('shows a fallback error when the response has no data', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: {} })
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    expect(await screen.findByTestId('wp-error')).toHaveTextContent(
      'Could not parse GPX file',
    )
  })

  it('reports when there are no waypoints with elevation', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: [] } })
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    expect(await screen.findByTestId('wp-error')).toHaveTextContent(
      'No waypoints with elevation found',
    )
    expect(screen.queryByTestId('wp-cards')).not.toBeInTheDocument()
  })

  it('shows a fallback error on a non-axios error', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    expect(await screen.findByTestId('wp-error')).toBeInTheDocument()
  })

  it('shows a loading label while generating', async () => {
    let resolve!: (v: unknown) => void
    jest.spyOn(axios, 'get').mockReturnValue(
      new Promise((r) => {
        resolve = r
      }),
    )
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    const button = screen.getByTestId('wp-generate')
    fireEvent.click(button)
    await waitFor(() => expect(button).toHaveTextContent('Generating…'))
    resolve({ data: { data: waypoints } })
    await waitFor(() => expect(button).toHaveTextContent('Generate'))
  })

  it('clears the error when the url is edited', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    await screen.findByTestId('wp-error')
    fireEvent.change(screen.getByTestId('wp-gpx'), {
      target: { value: `${URL}?x` },
    })
    expect(screen.queryByTestId('wp-error')).not.toBeInTheDocument()
  })
})
