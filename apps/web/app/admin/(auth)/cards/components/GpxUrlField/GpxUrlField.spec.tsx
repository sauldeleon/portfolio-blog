import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { GpxUrlField } from './GpxUrlField'

vi.mock('../../../components/TrackUrlPicker', () => ({
  TrackUrlPicker: ({
    id,
    value,
    onChange,
    'data-testid': testId,
  }: {
    id?: string
    value: string
    onChange: (url: string) => void
    'data-testid'?: string
  }) => (
    <input
      id={id}
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

vi.mock('@web/i18n/client', async () => {
  const admin: Record<string, unknown> = await vi.importActual<
    typeof import('@web/i18n/locales/en/admin.json')
  >('@web/i18n/locales/en/admin.json')
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
  vi.restoreAllMocks()
})

describe('GpxUrlField', () => {
  it('renders the url input and parse button', () => {
    renderApp(
      <GpxUrlField onChange={vi.fn()} onParsed={vi.fn()} idPrefix="rt" />,
    )
    expect(screen.getByTestId('rt-gpx')).toBeInTheDocument()
    expect(screen.getByTestId('rt-gpx-parse')).toBeInTheDocument()
  })

  it('calls onChange when the url changes', () => {
    const onChange = vi.fn()
    renderApp(
      <GpxUrlField onChange={onChange} onParsed={vi.fn()} idPrefix="rt" />,
    )
    fireEvent.change(screen.getByTestId('rt-gpx'), { target: { value: URL } })
    expect(onChange).toHaveBeenCalledWith(URL)
  })

  it('disables the parse button when the url is empty', () => {
    renderApp(
      <GpxUrlField onChange={vi.fn()} onParsed={vi.fn()} idPrefix="rt" />,
    )
    expect(screen.getByTestId('rt-gpx-parse')).toBeDisabled()
  })

  it('parses and calls onParsed on success', async () => {
    const getSpy = vi
      .spyOn(axios, 'get')
      .mockResolvedValue({ data: { data: metrics } })
    const onParsed = vi.fn()
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={vi.fn()}
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

  describe('with place names', () => {
    const PEAK = { kind: 'peak', index: 1, ele: 2417, lat: 43, lon: -5.9 }
    const NAMED = { ...PEAK, name: 'Peña Ubiña' }

    function parseWithNames(onParsed = vi.fn()) {
      renderApp(
        <GpxUrlField
          value={URL}
          onChange={vi.fn()}
          onParsed={onParsed}
          idPrefix="rt"
          withPlaceNames
        />,
      )
      fireEvent.click(screen.getByTestId('rt-gpx-parse'))
      return onParsed
    }

    it('names unnamed landmarks in a second request', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: { data: { ...metrics, landmarks: [PEAK] } },
      })
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
        data: { data: { landmarks: [NAMED], unavailable: false } },
      })
      const onParsed = parseWithNames()
      await waitFor(() =>
        expect(onParsed).toHaveBeenCalledWith({
          ...metrics,
          landmarks: [NAMED],
          placesUnavailable: false,
        }),
      )
      expect(onParsed).toHaveBeenCalledTimes(1)
      expect(postSpy).toHaveBeenCalledWith('/api/cards/places', {
        landmarks: [PEAK],
      })
    })

    it('flags the names as unavailable when that request fails', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: { data: { ...metrics, landmarks: [PEAK] } },
      })
      vi.spyOn(axios, 'post').mockRejectedValue(new Error('timeout'))
      const onParsed = parseWithNames()
      await waitFor(() =>
        expect(onParsed).toHaveBeenCalledWith({
          ...metrics,
          landmarks: [PEAK],
          placesUnavailable: true,
        }),
      )
    })

    it('skips the lookup when every landmark has a name', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: { data: { ...metrics, landmarks: [NAMED] } },
      })
      const postSpy = vi.spyOn(axios, 'post')
      const onParsed = parseWithNames()
      await waitFor(() =>
        expect(onParsed).toHaveBeenCalledWith({
          ...metrics,
          landmarks: [NAMED],
        }),
      )
      expect(postSpy).not.toHaveBeenCalled()
    })

    it('skips the lookup when the GPX has no landmarks', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: metrics } })
      const postSpy = vi.spyOn(axios, 'post')
      const onParsed = parseWithNames()
      await waitFor(() => expect(onParsed).toHaveBeenCalledWith(metrics))
      expect(postSpy).not.toHaveBeenCalled()
    })

    it('shows a lookup label while naming', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: { data: { ...metrics, landmarks: [PEAK] } },
      })
      let resolve!: (v: unknown) => void
      vi.spyOn(axios, 'post').mockReturnValue(
        new Promise((r) => {
          resolve = r
        }),
      )
      parseWithNames()
      const button = screen.getByTestId('rt-gpx-parse')
      await waitFor(() => expect(button).toHaveTextContent('Looking up names…'))
      expect(button).toBeDisabled()
      resolve({ data: { data: { landmarks: [NAMED], unavailable: false } } })
      await waitFor(() => expect(button).toHaveTextContent('Parse'))
    })
  })

  it('shows the server error message on a failed response', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(
      makeAxiosError(502, { error: 'Failed to fetch GPX' }),
    )
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={vi.fn()}
        onParsed={vi.fn()}
        idPrefix="rt"
      />,
    )
    fireEvent.click(screen.getByTestId('rt-gpx-parse'))
    expect(await screen.findByTestId('rt-gpx-error')).toHaveTextContent(
      'Failed to fetch GPX',
    )
  })

  it('shows a fallback error when the axios error has no message', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(makeAxiosError(500, {}))
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={vi.fn()}
        onParsed={vi.fn()}
        idPrefix="rt"
      />,
    )
    fireEvent.click(screen.getByTestId('rt-gpx-parse'))
    expect(await screen.findByTestId('rt-gpx-error')).toHaveTextContent(
      'Could not parse GPX file',
    )
  })

  it('shows a fallback error when the response has no data', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: {} })
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={vi.fn()}
        onParsed={vi.fn()}
        idPrefix="rt"
      />,
    )
    fireEvent.click(screen.getByTestId('rt-gpx-parse'))
    expect(await screen.findByTestId('rt-gpx-error')).toHaveTextContent(
      'Could not parse GPX file',
    )
  })

  it('shows a fallback error on a non-axios error', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={vi.fn()}
        onParsed={vi.fn()}
        idPrefix="rt"
      />,
    )
    fireEvent.click(screen.getByTestId('rt-gpx-parse'))
    expect(await screen.findByTestId('rt-gpx-error')).toBeInTheDocument()
  })

  it('shows a loading label while parsing', async () => {
    let resolve!: (v: unknown) => void
    vi.spyOn(axios, 'get').mockReturnValue(
      new Promise((r) => {
        resolve = r
      }),
    )
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={vi.fn()}
        onParsed={vi.fn()}
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
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))
    renderApp(
      <GpxUrlField
        value={URL}
        onChange={vi.fn()}
        onParsed={vi.fn()}
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
