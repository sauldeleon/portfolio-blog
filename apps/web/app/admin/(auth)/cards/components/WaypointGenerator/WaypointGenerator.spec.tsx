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

jest.mock('@sdlgr/select', () => ({
  Select: ({
    value,
    onChange,
    options,
    'data-testid': testId,
  }: {
    value: string
    onChange: (v: string) => void
    options: Array<{ value: string; label: string }>
    'data-testid'?: string
  }) => (
    <div data-testid={testId}>
      <span data-testid={`${testId}-value`}>{value}</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-testid={`${testId}-opt-${o.value}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
}))

type CardHandle = { upload: () => Promise<void> }

const mockUpload = jest.fn((_filename?: string) => Promise.resolve())
const mockSvgToPng = jest.fn((..._args: unknown[]) =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
  } as unknown as Blob),
)
const mockZipStore = jest.fn((..._args: unknown[]) => new Uint8Array([4, 5, 6]))

jest.mock('@web/lib/cards', () => {
  const actual =
    jest.requireActual<typeof import('@web/lib/cards')>('@web/lib/cards')
  // Reference the mocks lazily so they exist by the time these are invoked.
  return {
    ...actual,
    svgToPng: (...args: unknown[]) => mockSvgToPng(...args),
    zipStore: (...args: unknown[]) => mockZipStore(...args),
  }
})

jest.mock('../CardPreview', () => {
  const react = jest.requireActual<typeof import('react')>('react')
  return {
    CardPreview: react.forwardRef(function CardPreview(
      {
        filename,
        onSelect,
        selected,
        disableUpload,
      }: {
        filename: string
        onSelect?: () => void
        selected?: boolean
        disableUpload?: boolean
      },
      ref: import('react').Ref<CardHandle | null>,
    ) {
      react.useImperativeHandle(
        ref,
        () => (disableUpload ? null : { upload: () => mockUpload(filename) }),
        [disableUpload, filename],
      )
      return (
        <button
          type="button"
          data-testid="card-preview"
          data-selected={String(Boolean(selected))}
          data-disabled={String(Boolean(disableUpload))}
          onClick={onSelect}
        >
          {filename}
        </button>
      )
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

const URL = 'https://example.com/route.gpx'
const waypoints = [
  { name: 'Refugio', lat: 42.5, lon: -1.2, ele: 1850, category: 'refugio' },
  { name: 'Rápel 1', lat: 42.6, lon: -1.3, ele: 1500, category: 'rappel' },
]

// Download filename / Cloudinary name shared format (Date.now mocked to 1234).
const fileFor = (lang: string, slug: string, gpx = 'route') =>
  `waypoint-${gpx}-1234-${lang}-${slug}`

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(1234)
  mockUpload.mockReset()
  mockUpload.mockResolvedValue(undefined)
  mockSvgToPng.mockReset()
  mockSvgToPng.mockResolvedValue({
    arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
  } as unknown as Blob)
  mockZipStore.mockReset()
  mockZipStore.mockReturnValue(new Uint8Array([4, 5, 6]))
  global.URL.createObjectURL = jest.fn(() => 'blob:zip')
  global.URL.revokeObjectURL = jest.fn()
  jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => undefined)
})

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
    expect(screen.getByText(fileFor('en', 'refugio'))).toBeInTheDocument()
  })

  it('overrides the filename prefix with the name field', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: waypoints } })
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    await screen.findByText(fileFor('en', 'refugio'))
    fireEvent.change(screen.getByTestId('wp-name'), {
      target: { value: 'My Trip' },
    })
    expect(
      screen.getByText('waypoint-my_trip-1234-en-refugio'),
    ).toBeInTheDocument()
  })

  it('re-renders filenames in Spanish when the language toggles', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: waypoints } })
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    await screen.findByText(fileFor('en', 'refugio'))
    fireEvent.click(screen.getByTestId('wp-lang-es'))
    expect(screen.getByText(fileFor('es', 'refugio'))).toBeInTheDocument()
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
    await waitFor(() => expect(button).toHaveTextContent('Parsing…'))
    resolve({ data: { data: waypoints } })
    await waitFor(() => expect(button).toHaveTextContent('Parse'))
  })

  async function generate() {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: waypoints } })
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    await screen.findByText(fileFor('en', 'refugio'))
  }

  it('renders bulk download/upload buttons above the cards', async () => {
    await generate()
    const uploadAll = screen.getByTestId('wp-upload-all')
    const downloadAll = screen.getByTestId('wp-download-all')
    expect(uploadAll).toHaveTextContent('Upload all to Cloudinary')
    expect(downloadAll).toHaveTextContent('Download all (.zip)')
    const list = screen.getByTestId('wp-cards')
    // the bulk buttons precede the card list in the DOM (stacked, not side by side)
    expect(
      uploadAll.compareDocumentPosition(list) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('uploads every card when upload-all is clicked', async () => {
    await generate()
    fireEvent.click(screen.getByTestId('wp-upload-all'))
    await waitFor(() => expect(mockUpload).toHaveBeenCalledTimes(2))
  })

  it('packs every card into a single zip when download-all is clicked', async () => {
    await generate()
    const origCreate = document.createElement.bind(document)
    let lastAnchor: HTMLAnchorElement | null = null
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag)
      if (tag === 'a') lastAnchor = el as HTMLAnchorElement
      return el
    })

    fireEvent.click(screen.getByTestId('wp-download-all'))
    await waitFor(() => expect(mockZipStore).toHaveBeenCalledTimes(1))

    // one PNG rendered per card, packed into one zip, one download
    expect(mockSvgToPng).toHaveBeenCalledTimes(2)
    const files = mockZipStore.mock.calls[0][0] as Array<{ name: string }>
    expect(files.map((f) => f.name)).toEqual([
      `${fileFor('en', 'refugio')}.png`,
      `${fileFor('en', 'rapel_1')}.png`,
    ])
    expect(lastAnchor?.download).toBe('waypoints-route-en.zip')
  })

  it('still uploads each named card individually for upload-all', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        data: [
          {
            name: 'Refugio',
            lat: 42.5,
            lon: -1.2,
            ele: 1850,
            category: 'refugio',
          },
          { name: '', lat: 42.6, lon: -1.3, ele: 1500, category: 'info' },
        ],
      },
    })
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), { target: { value: URL } })
    fireEvent.click(screen.getByTestId('wp-generate'))
    await screen.findByText(fileFor('en', 'refugio'))
    fireEvent.click(screen.getByTestId('wp-upload-all'))
    await waitFor(() => expect(mockUpload).toHaveBeenCalledTimes(1))
  })

  it('shows a preparing label while the zip is built', async () => {
    await generate()
    let resolve!: () => void
    mockSvgToPng.mockReturnValueOnce(
      new Promise((r) => {
        resolve = () =>
          r({
            arrayBuffer: () => Promise.resolve(new Uint8Array([1]).buffer),
          } as unknown as Blob)
      }),
    )
    const button = screen.getByTestId('wp-download-all')
    fireEvent.click(button)
    await waitFor(() => expect(button).toHaveTextContent('Preparing zip…'))
    resolve()
    await waitFor(() => expect(button).toHaveTextContent('Download all (.zip)'))
  })

  it('shows an uploading label while the bulk upload runs', async () => {
    await generate()
    let resolve!: () => void
    mockUpload.mockReturnValueOnce(
      new Promise<void>((r) => {
        resolve = () => r()
      }),
    )
    const button = screen.getByTestId('wp-upload-all')
    fireEvent.click(button)
    await waitFor(() => expect(button).toHaveTextContent('Uploading…'))
    resolve()
    await waitFor(() =>
      expect(button).toHaveTextContent('Upload all to Cloudinary'),
    )
  })

  it('names the file/upload from the GPX url, timestamp and lang', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: waypoints } })
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), {
      target: { value: 'https://ex.com/routes/ordesa.gpx?token=1' },
    })
    fireEvent.click(screen.getByTestId('wp-generate'))
    expect(
      await screen.findByText(fileFor('en', 'refugio', 'ordesa')),
    ).toBeInTheDocument()
  })

  it('decodes percent-encoded characters in the GPX file name', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: waypoints } })
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), {
      target: {
        value: 'https://ex.com/2026_06_04_via%20ferrata%20de%20sorrosal.gpx',
      },
    })
    fireEvent.click(screen.getByTestId('wp-generate'))
    expect(
      await screen.findByText(
        fileFor('en', 'refugio', '2026_06_04_via_ferrata_de_sorrosal'),
      ),
    ).toBeInTheDocument()
  })

  it('falls back to the raw name when the file name is malformed', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: waypoints } })
    renderApp(<WaypointGenerator />)
    fireEvent.change(screen.getByTestId('wp-gpx'), {
      target: { value: 'https://ex.com/foo%zz.gpx' },
    })
    fireEvent.click(screen.getByTestId('wp-generate'))
    expect(
      await screen.findByText(fileFor('en', 'refugio', 'foo_zz')),
    ).toBeInTheDocument()
  })

  it('opens an inline editor prefilled from the clicked card', async () => {
    await generate()
    expect(screen.queryByTestId('wp-editor')).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByTestId('card-preview')[0])
    expect(screen.getByTestId('wp-editor')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('Refugio')
    expect(screen.getByLabelText('Elevation (m)')).toHaveValue(1850)
  })

  it('edits a card field and updates its filename', async () => {
    await generate()
    fireEvent.click(screen.getAllByTestId('card-preview')[0])
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Cabaña' },
    })
    expect(screen.getByText(fileFor('en', 'cabana'))).toBeInTheDocument()
  })

  it('drops coordinates and elevation when their fields are cleared', async () => {
    await generate()
    fireEvent.click(screen.getAllByTestId('card-preview')[0])
    ;[
      'Latitude',
      'Longitude',
      'Elevation (m)',
      'Min elevation (m)',
      'Max elevation (m)',
    ].forEach((label) => {
      fireEvent.change(screen.getByLabelText(label), { target: { value: '' } })
    })
    // the card still renders for the now coordinate-less waypoint
    expect(screen.getByText(fileFor('en', 'refugio'))).toBeInTheDocument()
  })

  it('marks the clicked card as selected', async () => {
    await generate()
    const [first, second] = screen.getAllByTestId('card-preview')
    fireEvent.click(first)
    expect(first).toHaveAttribute('data-selected', 'true')
    expect(second).toHaveAttribute('data-selected', 'false')
  })

  it('toggles the editor closed when the same card is clicked again', async () => {
    await generate()
    const card = screen.getAllByTestId('card-preview')[0]
    fireEvent.click(card)
    expect(screen.getByTestId('wp-editor')).toBeInTheDocument()
    fireEvent.click(card)
    expect(screen.queryByTestId('wp-editor')).not.toBeInTheDocument()
  })

  it('closes the editor with the Done button', async () => {
    await generate()
    fireEvent.click(screen.getAllByTestId('card-preview')[0])
    fireEvent.click(screen.getByTestId('wp-editor-close'))
    expect(screen.queryByTestId('wp-editor')).not.toBeInTheDocument()
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
