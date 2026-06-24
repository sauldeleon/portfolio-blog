import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { GpxUrlField } from './GpxUrlField'

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

function makeAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data,
    statusText: 'Error',
    headers: {},
    config: {} as never,
  })
}

const metrics = {
  date: '15 Jul 2025',
  startTime: '09:00',
  endTime: '11:00',
  movingTime: '2:00',
  stoppedTime: '0:00',
  totalTime: '2:00',
  distanceKm: '2.2 km',
  ascent: '100 m',
  descent: '50 m',
  elevation: [1000, 1100, 1050],
}

const URL = 'https://example.com/track.gpx'

afterEach(() => {
  jest.restoreAllMocks()
})

describe('GpxUrlField', () => {
  it('renders the url input and parse button', () => {
    renderApp(
      <GpxUrlField onChange={jest.fn()} onParsed={jest.fn()} idPrefix="rt" />,
    )
    expect(screen.getByTestId('rt-gpx')).toBeInTheDocument()
    expect(screen.getByTestId('rt-gpx-parse')).toBeInTheDocument()
  })

  it('calls onChange when the url changes', () => {
    const onChange = jest.fn()
    renderApp(
      <GpxUrlField onChange={onChange} onParsed={jest.fn()} idPrefix="rt" />,
    )
    fireEvent.change(screen.getByTestId('rt-gpx'), { target: { value: URL } })
    expect(onChange).toHaveBeenCalledWith(URL)
  })

  it('disables the parse button when the url is empty', () => {
    renderApp(
      <GpxUrlField onChange={jest.fn()} onParsed={jest.fn()} idPrefix="rt" />,
    )
    expect(screen.getByTestId('rt-gpx-parse')).toBeDisabled()
  })

  it('parses and calls onParsed on success', async () => {
    const getSpy = jest
      .spyOn(axios, 'get')
      .mockResolvedValue({ data: { data: metrics } })
    const onParsed = jest.fn()
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={jest.fn()}
        onParsed={onParsed}
        idPrefix="rt"
      />,
    )
    fireEvent.click(screen.getByTestId('rt-gpx-parse'))
    await waitFor(() => expect(onParsed).toHaveBeenCalledWith(metrics))
    expect(getSpy).toHaveBeenCalledWith('/api/cards/gpx', {
      params: { url: URL },
    })
  })

  it('shows the server error message on a failed response', async () => {
    jest
      .spyOn(axios, 'get')
      .mockRejectedValue(makeAxiosError(502, { error: 'Failed to fetch GPX' }))
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={jest.fn()}
        onParsed={jest.fn()}
        idPrefix="rt"
      />,
    )
    fireEvent.click(screen.getByTestId('rt-gpx-parse'))
    expect(await screen.findByTestId('rt-gpx-error')).toHaveTextContent(
      'Failed to fetch GPX',
    )
  })

  it('shows a fallback error when the axios error has no message', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(makeAxiosError(500, {}))
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={jest.fn()}
        onParsed={jest.fn()}
        idPrefix="rt"
      />,
    )
    fireEvent.click(screen.getByTestId('rt-gpx-parse'))
    expect(await screen.findByTestId('rt-gpx-error')).toHaveTextContent(
      'Could not parse GPX file',
    )
  })

  it('shows a fallback error when the response has no data', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: {} })
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={jest.fn()}
        onParsed={jest.fn()}
        idPrefix="rt"
      />,
    )
    fireEvent.click(screen.getByTestId('rt-gpx-parse'))
    expect(await screen.findByTestId('rt-gpx-error')).toHaveTextContent(
      'Could not parse GPX file',
    )
  })

  it('shows a fallback error on a non-axios error', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={jest.fn()}
        onParsed={jest.fn()}
        idPrefix="rt"
      />,
    )
    fireEvent.click(screen.getByTestId('rt-gpx-parse'))
    expect(await screen.findByTestId('rt-gpx-error')).toBeInTheDocument()
  })

  it('shows a loading label while parsing', async () => {
    let resolve!: (v: unknown) => void
    jest.spyOn(axios, 'get').mockReturnValue(
      new Promise((r) => {
        resolve = r
      }),
    )
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={jest.fn()}
        onParsed={jest.fn()}
        idPrefix="rt"
      />,
    )
    const button = screen.getByTestId('rt-gpx-parse')
    fireEvent.click(button)
    await waitFor(() => expect(button).toHaveTextContent('Parsing…'))
    resolve({ data: { data: metrics } })
    await waitFor(() => expect(button).toHaveTextContent('Parse'))
  })

  it('clears the error when the url is edited', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={jest.fn()}
        onParsed={jest.fn()}
        idPrefix="rt"
      />,
    )
    fireEvent.click(screen.getByTestId('rt-gpx-parse'))
    expect(await screen.findByTestId('rt-gpx-error')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('rt-gpx'), {
      target: { value: `${URL}?x` },
    })
    expect(screen.queryByTestId('rt-gpx-error')).not.toBeInTheDocument()
  })
})
