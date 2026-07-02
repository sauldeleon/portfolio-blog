import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { CanyonWaypointsGenerator } from './CanyonWaypointsGenerator'

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
        disableUpload,
        onSelect,
        selected,
      }: {
        filename: string
        disableUpload?: boolean
        onSelect?: () => void
        selected?: boolean
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
          data-disabled={String(Boolean(disableUpload))}
          data-selected={String(Boolean(selected))}
          onClick={onSelect}
        >
          {filename}
        </button>
      )
    }),
  }
})

jest.mock('../CanyonWaypointFields', () => ({
  CanyonWaypointFields: ({
    value,
    onChange,
  }: {
    value: { title: string }
    onChange: (patch: { title: string }) => void
  }) => (
    <div data-testid="cwf-mock">
      <span data-testid="cwf-title-shown">{value.title}</span>
      <button
        type="button"
        data-testid="cwf-edit-title"
        onClick={() => onChange({ title: 'EDITED' })}
      />
    </div>
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

const URL_GPX = 'https://example.com/route.gpx'
const TWO =
  'salto: Resalte 1m - 42.6092 0.1412\n- Flexionar\n---\nrapel: Rappel 10m - 42.6056 0.1294'
const importedWaypoints = [
  { categories: ['rappel'], title: 'R1', lat: 42.5, lon: -1.2, notes: [] },
]

beforeEach(() => {
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

describe('CanyonWaypointsGenerator', () => {
  it('renders the lang toggle and a disabled import button', () => {
    renderApp(<CanyonWaypointsGenerator />)
    expect(screen.getByTestId('cw-lang-en')).toBeInTheDocument()
    expect(screen.getByTestId('cw-lang-es')).toBeInTheDocument()
    expect(screen.getByTestId('cw-import')).toBeDisabled()
  })

  it('shows no cards until the textarea has valid waypoints', () => {
    renderApp(<CanyonWaypointsGenerator />)
    expect(screen.queryByTestId('cw-cards')).not.toBeInTheDocument()
  })

  it('renders one card per waypoint', () => {
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-text'), { target: { value: TWO } })
    expect(screen.getAllByTestId('card-preview')).toHaveLength(2)
    expect(
      screen.getByText('canyon-waypoint-canyon-en-01-resalte_1m'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('canyon-waypoint-canyon-en-02-rappel_10m'),
    ).toBeInTheDocument()
  })

  it('uses the name field as the filename prefix', () => {
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-text'), { target: { value: TWO } })
    fireEvent.change(screen.getByTestId('cw-name'), {
      target: { value: 'Barranco de Mascún' },
    })
    expect(
      screen.getByText('canyon-waypoint-barranco_de_mascun-en-01-resalte_1m'),
    ).toBeInTheDocument()
  })

  it('regenerates filenames in Spanish when the language toggles', () => {
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-text'), { target: { value: TWO } })
    fireEvent.click(screen.getByTestId('cw-lang-es'))
    expect(
      screen.getByText('canyon-waypoint-canyon-es-01-resalte_1m'),
    ).toBeInTheDocument()
  })

  it('disables upload for a waypoint without a title', () => {
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-text'), {
      target: { value: '42.6 0.1' },
    })
    expect(screen.getByTestId('card-preview')).toHaveAttribute(
      'data-disabled',
      'true',
    )
  })

  it('opens the per-card editor when a card is clicked', () => {
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-text'), { target: { value: TWO } })
    expect(screen.queryByTestId('cw-editor')).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByTestId('card-preview')[0])
    expect(screen.getByTestId('cw-editor')).toBeInTheDocument()
    expect(screen.getByTestId('cwf-title-shown')).toHaveTextContent(
      'Resalte 1m',
    )
  })

  it('edits a waypoint and rewrites the textarea', () => {
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-text'), { target: { value: TWO } })
    fireEvent.click(screen.getAllByTestId('card-preview')[0])
    fireEvent.click(screen.getByTestId('cwf-edit-title'))
    expect(
      (screen.getByTestId('cw-text') as HTMLTextAreaElement).value,
    ).toContain('salto: EDITED - 42.6092 0.1412')
  })

  it('closes the editor with the done button', () => {
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-text'), { target: { value: TWO } })
    fireEvent.click(screen.getAllByTestId('card-preview')[0])
    fireEvent.click(screen.getByTestId('cw-editor-close'))
    expect(screen.queryByTestId('cw-editor')).not.toBeInTheDocument()
  })

  it('toggles the editor off when the same card is clicked again', () => {
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-text'), { target: { value: TWO } })
    const firstCard = () => screen.getAllByTestId('card-preview')[0]
    fireEvent.click(firstCard())
    expect(screen.getByTestId('cw-editor')).toBeInTheDocument()
    fireEvent.click(firstCard())
    expect(screen.queryByTestId('cw-editor')).not.toBeInTheDocument()
  })

  it('imports a GPX url into the editable textarea', async () => {
    const getSpy = jest
      .spyOn(axios, 'get')
      .mockResolvedValue({ data: { data: importedWaypoints } })
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-gpx'), {
      target: { value: URL_GPX },
    })
    fireEvent.click(screen.getByTestId('cw-import'))
    await waitFor(() =>
      expect(screen.getByTestId('cw-text')).toHaveValue(
        'rappel: R1 - 42.5 -1.2',
      ),
    )
    expect(getSpy).toHaveBeenCalledWith('/api/cards/canyon-waypoints', {
      params: { url: URL_GPX },
    })
    expect(screen.getByTestId('card-preview')).toBeInTheDocument()
  })

  it('shows a loading label while importing', async () => {
    let resolve!: (v: unknown) => void
    jest.spyOn(axios, 'get').mockReturnValue(
      new Promise((r) => {
        resolve = r
      }),
    )
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-gpx'), {
      target: { value: URL_GPX },
    })
    const button = screen.getByTestId('cw-import')
    fireEvent.click(button)
    await waitFor(() => expect(button).toHaveTextContent('Parsing…'))
    resolve({ data: { data: importedWaypoints } })
    await waitFor(() => expect(button).toHaveTextContent('Parse'))
  })

  it('shows the server error message on a failed import', async () => {
    jest
      .spyOn(axios, 'get')
      .mockRejectedValue(makeAxiosError(400, { error: 'Invalid GPX URL' }))
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-gpx'), {
      target: { value: URL_GPX },
    })
    fireEvent.click(screen.getByTestId('cw-import'))
    expect(await screen.findByTestId('cw-error')).toHaveTextContent(
      'Invalid GPX URL',
    )
  })

  it('shows a fallback error when the axios error has no message', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(makeAxiosError(500, {}))
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-gpx'), {
      target: { value: URL_GPX },
    })
    fireEvent.click(screen.getByTestId('cw-import'))
    expect(await screen.findByTestId('cw-error')).toHaveTextContent(
      'Could not parse GPX file',
    )
  })

  it('shows a fallback error when the response has no data', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: {} })
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-gpx'), {
      target: { value: URL_GPX },
    })
    fireEvent.click(screen.getByTestId('cw-import'))
    expect(await screen.findByTestId('cw-error')).toHaveTextContent(
      'Could not parse GPX file',
    )
  })

  it('reports when the GPX has no waypoints', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: [] } })
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-gpx'), {
      target: { value: URL_GPX },
    })
    fireEvent.click(screen.getByTestId('cw-import'))
    expect(await screen.findByTestId('cw-error')).toHaveTextContent(
      'No waypoints found',
    )
  })

  it('shows a fallback error on a non-axios error', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-gpx'), {
      target: { value: URL_GPX },
    })
    fireEvent.click(screen.getByTestId('cw-import'))
    expect(await screen.findByTestId('cw-error')).toHaveTextContent(
      'Could not parse GPX file',
    )
  })

  it('clears the error when the url is edited', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-gpx'), {
      target: { value: URL_GPX },
    })
    fireEvent.click(screen.getByTestId('cw-import'))
    expect(await screen.findByTestId('cw-error')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('cw-gpx'), {
      target: { value: `${URL_GPX}?v=2` },
    })
    expect(screen.queryByTestId('cw-error')).not.toBeInTheDocument()
  })

  it('uploads every card when upload-all is clicked', async () => {
    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-text'), { target: { value: TWO } })
    fireEvent.click(screen.getByTestId('cw-upload-all'))
    await waitFor(() => expect(mockUpload).toHaveBeenCalledTimes(2))
  })

  it('packs every card into a single zip when download-all is clicked', async () => {
    const origCreate = document.createElement.bind(document)
    let lastAnchor: HTMLAnchorElement | null = null
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag)
      if (tag === 'a') lastAnchor = el as HTMLAnchorElement
      return el
    })

    renderApp(<CanyonWaypointsGenerator />)
    fireEvent.change(screen.getByTestId('cw-text'), { target: { value: TWO } })
    fireEvent.click(screen.getByTestId('cw-download-all'))

    await waitFor(() => expect(mockZipStore).toHaveBeenCalledTimes(1))
    expect(mockSvgToPng).toHaveBeenCalledTimes(2)
    const files = mockZipStore.mock.calls[0][0] as Array<{ name: string }>
    expect(files.map((f) => f.name)).toEqual([
      'canyon-waypoint-canyon-en-01-resalte_1m.png',
      'canyon-waypoint-canyon-en-02-rappel_10m.png',
    ])
    expect(lastAnchor?.download).toBe('canyon-waypoints-canyon-en.zip')
  })
})
