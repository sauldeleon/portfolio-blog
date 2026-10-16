import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { CroquisInsertModal } from './CroquisInsertModal'

function makeAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data,
    statusText: 'Error',
    headers: {},
    config: {} as never,
  })
}

vi.mock('@sdlgr/select', () => ({
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
    isSearchable?: boolean
    maxMenuHeight?: number
  }) => (
    <select
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">—</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}))

vi.mock('../ImagePicker', () => ({
  ImagePicker: ({
    open,
    onClose,
    onPick,
  }: {
    open: boolean
    onClose: () => void
    onPick: (image: { url: string; publicId: string }) => void
  }) =>
    open ? (
      <div data-testid="image-picker-mock">
        <button
          type="button"
          data-testid="image-picker-pick"
          onClick={() => onPick({ url: 'https://cdn/pick.jpg', publicId: 'p' })}
        >
          pick
        </button>
        <button
          type="button"
          data-testid="image-picker-close"
          onClick={onClose}
        >
          close
        </button>
      </div>
    ) : null,
}))

// CanyoningForm (rendered when the canyon summary is included) reads the
// 'admin' namespace via useClientTranslation; mock it so it resolves
// synchronously instead of suspending on the namespace load.
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

const JUMP = 'salto: Jump 2m - 42.6092 0.1412'

function open(
  props: Partial<React.ComponentProps<typeof CroquisInsertModal>> = {},
) {
  const onInsert = vi.fn()
  const onCancel = vi.fn()
  renderApp(
    <CroquisInsertModal
      isOpen
      onInsert={onInsert}
      onCancel={onCancel}
      {...props}
    />,
  )
  return { onInsert, onCancel }
}

afterEach(() => vi.restoreAllMocks())

describe('CroquisInsertModal', () => {
  it('renders the modal content when open', () => {
    open()
    expect(screen.getByTestId('croquis-modal')).toBeInTheDocument()
    expect(screen.getByTestId('croquis-modal-text')).toBeInTheDocument()
  })

  it('prefills the textarea and title from initial values', () => {
    open({
      initialValues: {
        text: JUMP,
        title: 'Barranco X',
        showDownload: true,
        showReport: true,
        canyon: null,
      },
    })
    expect(screen.getByTestId('croquis-modal-text')).toHaveValue(JUMP)
    expect(screen.getByTestId('croquis-modal-title')).toHaveValue('Barranco X')
    expect(screen.getByTestId('croquis-modal-download-toggle')).toBeChecked()
  })

  it('prefills the download toggle from initial values', () => {
    open({
      initialValues: {
        text: JUMP,
        title: '',
        showDownload: false,
        showReport: true,
        canyon: null,
      },
    })
    expect(
      screen.getByTestId('croquis-modal-download-toggle'),
    ).not.toBeChecked()
  })

  it('is checked (download shown) by default', () => {
    open()
    expect(screen.getByTestId('croquis-modal-download-toggle')).toBeChecked()
  })

  it('adds the no-download flag to the fence when the toggle is off', () => {
    const { onInsert } = open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    fireEvent.click(screen.getByTestId('croquis-modal-download-toggle'))
    expect(screen.getByTestId('croquis-modal-preview')).toHaveValue(
      `\`\`\`croquis no-download\n${JUMP}\n\`\`\``,
    )
    fireEvent.click(screen.getByTestId('croquis-modal-insert'))
    expect(onInsert.mock.calls[0][0]).toContain('```croquis no-download\n')
  })

  it('shows the report toggle checked by default', () => {
    open()
    expect(screen.getByTestId('croquis-modal-report-toggle')).toBeChecked()
  })

  it('prefills the report toggle from initial values', () => {
    open({
      initialValues: {
        text: JUMP,
        title: '',
        showDownload: true,
        showReport: false,
        canyon: null,
      },
    })
    expect(screen.getByTestId('croquis-modal-report-toggle')).not.toBeChecked()
  })

  it('adds the no-report flag to the fence when the report toggle is off', () => {
    const { onInsert } = open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    fireEvent.click(screen.getByTestId('croquis-modal-report-toggle'))
    expect(screen.getByTestId('croquis-modal-preview')).toHaveValue(
      `\`\`\`croquis no-report\n${JUMP}\n\`\`\``,
    )
    fireEvent.click(screen.getByTestId('croquis-modal-insert'))
    expect(onInsert.mock.calls[0][0]).toContain('```croquis no-report\n')
  })

  it('hides the canyon form until the include toggle is on', () => {
    open()
    expect(screen.getByTestId('croquis-modal-canyon-toggle')).not.toBeChecked()
    expect(screen.queryByTestId('canyoning-form')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('croquis-modal-canyon-toggle'))
    expect(screen.getByTestId('canyoning-form')).toBeInTheDocument()
  })

  it('embeds a canyon token in the fence when the summary is included', () => {
    open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    fireEvent.click(screen.getByTestId('croquis-modal-canyon-toggle'))
    const preview = screen.getByTestId(
      'croquis-modal-preview',
    ) as HTMLTextAreaElement
    expect(preview.value).toContain('```croquis canyon:')
  })

  it('prefills the canyon form from initial values', () => {
    open({
      initialValues: {
        text: JUMP,
        title: '',
        showDownload: true,
        showReport: true,
        canyon: { kind: 'canyoning-data', lang: 'es', grade: 'v4' },
      },
    })
    expect(screen.getByTestId('croquis-modal-canyon-toggle')).toBeChecked()
    expect(screen.getByTestId('canyoning-form')).toBeInTheDocument()
  })

  it('offers a waypoint selector and shows the fenced preview once drawable', () => {
    open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    expect(screen.getByTestId('croquis-wp-select')).toBeInTheDocument()
    const preview = screen.getByTestId('croquis-modal-preview')
    expect(preview).toHaveValue(`\`\`\`croquis\n${JUMP}\n\`\`\``)
  })

  it('reflects the title in the fenced preview', () => {
    open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    fireEvent.change(screen.getByTestId('croquis-modal-title'), {
      target: { value: 'Barranco X' },
    })
    expect(screen.getByTestId('croquis-modal-preview')).toHaveValue(
      `\`\`\`croquis Barranco X\n${JUMP}\n\`\`\``,
    )
  })

  it('hides the preview until there is a drawable obstacle', () => {
    open()
    expect(
      screen.queryByTestId('croquis-modal-preview'),
    ).not.toBeInTheDocument()
  })

  it('lists only drawable waypoints in the selector', () => {
    open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: {
        value: 'salto: Jump 2m - 42.6 0.1\n---\ninfo: A view - 42.6 0.1',
      },
    })
    expect(screen.getByText('salto: Jump 2m')).toBeInTheDocument()
    expect(screen.queryByText('info: A view')).not.toBeInTheDocument()
  })

  it('disables Insert without drawable obstacles and enables it with one', () => {
    open()
    const insert = screen.getByTestId('croquis-modal-insert')
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: 'info: A view - 42.6 0.1' },
    })
    expect(insert).toBeDisabled()
    expect(
      screen.queryByTestId('croquis-modal-preview'),
    ).not.toBeInTheDocument()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    expect(insert).not.toBeDisabled()
  })

  it('inserts a croquis fence with the waypoint text', () => {
    const { onInsert } = open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    fireEvent.click(screen.getByTestId('croquis-modal-insert'))
    expect(onInsert).toHaveBeenCalledTimes(1)
    const md = onInsert.mock.calls[0][0]
    expect(md).toContain('```croquis\n')
    expect(md).toContain(JUMP)
  })

  it('carries the title into the fence meta and the preview', () => {
    const { onInsert } = open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    fireEvent.change(screen.getByTestId('croquis-modal-title'), {
      target: { value: 'Barranco de la Peonera' },
    })
    fireEvent.click(screen.getByTestId('croquis-modal-insert'))
    expect(onInsert.mock.calls[0][0]).toContain(
      '```croquis Barranco de la Peonera\n',
    )
  })

  it('selects a waypoint, picks an image, and rides it in the markdown', () => {
    const { onInsert } = open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    // Pick is disabled until a waypoint is chosen.
    expect(screen.getByTestId('croquis-wp-pick')).toBeDisabled()
    fireEvent.change(screen.getByTestId('croquis-wp-select'), {
      target: { value: '0' },
    })
    fireEvent.click(screen.getByTestId('croquis-wp-pick'))
    fireEvent.click(screen.getByTestId('image-picker-pick'))
    // The waypoint gains a thumbnail in the mappings list.
    expect(screen.getByTestId('croquis-wp-thumb-0-0')).toHaveAttribute(
      'src',
      'https://cdn/pick.jpg',
    )
    fireEvent.click(screen.getByTestId('croquis-modal-insert'))
    expect(onInsert.mock.calls[0][0]).toContain('img=https://cdn/pick.jpg')
  })

  it('adds several images to the same waypoint and removes one', () => {
    open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    fireEvent.change(screen.getByTestId('croquis-wp-select'), {
      target: { value: '0' },
    })
    fireEvent.click(screen.getByTestId('croquis-wp-pick'))
    fireEvent.click(screen.getByTestId('image-picker-pick'))
    fireEvent.click(screen.getByTestId('croquis-wp-pick'))
    fireEvent.click(screen.getByTestId('image-picker-pick'))
    expect(screen.getByTestId('croquis-wp-thumb-0-0')).toBeInTheDocument()
    expect(screen.getByTestId('croquis-wp-thumb-0-1')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('croquis-wp-remove-0-0'))
    expect(screen.getByTestId('croquis-wp-thumb-0-0')).toBeInTheDocument()
    expect(screen.queryByTestId('croquis-wp-thumb-0-1')).not.toBeInTheDocument()
  })

  it('closes the image picker without picking', () => {
    open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    fireEvent.change(screen.getByTestId('croquis-wp-select'), {
      target: { value: '0' },
    })
    fireEvent.click(screen.getByTestId('croquis-wp-pick'))
    expect(screen.getByTestId('image-picker-mock')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('image-picker-close'))
    expect(screen.queryByTestId('image-picker-mock')).not.toBeInTheDocument()
  })

  it('assigns an image to one waypoint among several', () => {
    open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: {
        value: `${JUMP}\n---\nrapel: Rappel 10m - 42.6056 0.1294`,
      },
    })
    fireEvent.change(screen.getByTestId('croquis-wp-select'), {
      target: { value: '1' },
    })
    fireEvent.click(screen.getByTestId('croquis-wp-pick'))
    fireEvent.click(screen.getByTestId('image-picker-pick'))
    expect(screen.getByTestId('croquis-wp-thumb-1-0')).toBeInTheDocument()
    expect(screen.queryByTestId('croquis-wp-thumb-0-0')).not.toBeInTheDocument()
    // Removing it iterates past the other (unmapped) waypoint too.
    fireEvent.click(screen.getByTestId('croquis-wp-remove-1-0'))
    expect(screen.queryByTestId('croquis-wp-thumb-1-0')).not.toBeInTheDocument()
  })

  it('removes a waypoint image', () => {
    open({
      initialValues: {
        text: `${JUMP}\n! img=https://cdn/x.jpg`,
        title: '',
        showDownload: true,
        showReport: true,
        canyon: null,
      },
    })
    expect(screen.getByTestId('croquis-wp-thumb-0-0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('croquis-wp-remove-0-0'))
    expect(screen.queryByTestId('croquis-wp-thumb-0-0')).not.toBeInTheDocument()
  })

  it('cancels', () => {
    const { onCancel } = open()
    fireEvent.click(screen.getByTestId('croquis-modal-cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  describe('GPX parse', () => {
    function enterUrl() {
      fireEvent.change(screen.getByTestId('croquis-modal-gpx'), {
        target: { value: 'https://x/y.gpx' },
      })
    }

    it('fills the textarea from parsed waypoints', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: { data: [{ categories: ['salto'], title: 'Jump', notes: [] }] },
      })
      open()
      enterUrl()
      fireEvent.click(screen.getByTestId('croquis-modal-parse'))
      await waitFor(() =>
        expect(screen.getByTestId('croquis-modal-text')).toHaveValue(
          'salto: Jump',
        ),
      )
    })

    it('errors when the response has no waypoints', async () => {
      vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: [] } })
      open()
      enterUrl()
      fireEvent.click(screen.getByTestId('croquis-modal-parse'))
      expect(
        await screen.findByTestId('croquis-modal-error'),
      ).toBeInTheDocument()
    })

    it('shows the server error message', async () => {
      vi.spyOn(axios, 'get').mockRejectedValue(
        makeAxiosError(400, { error: 'Bad GPX' }),
      )
      open()
      enterUrl()
      fireEvent.click(screen.getByTestId('croquis-modal-parse'))
      expect(
        await screen.findByTestId('croquis-modal-error'),
      ).toHaveTextContent('Bad GPX')
    })

    it('falls back to a generic error when the axios error has no message', async () => {
      vi.spyOn(axios, 'get').mockRejectedValue(makeAxiosError(500, {}))
      open()
      enterUrl()
      fireEvent.click(screen.getByTestId('croquis-modal-parse'))
      expect(
        await screen.findByTestId('croquis-modal-error'),
      ).toHaveTextContent('Could not parse GPX file')
    })

    it('falls back to a generic error for non-axios failures', async () => {
      vi.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))
      open()
      enterUrl()
      fireEvent.click(screen.getByTestId('croquis-modal-parse'))
      expect(
        await screen.findByTestId('croquis-modal-error'),
      ).toBeInTheDocument()
    })

    it('shows a parsing label and clears a prior error on url change', async () => {
      let resolve!: (v: unknown) => void
      vi.spyOn(axios, 'get').mockReturnValue(
        new Promise((r) => {
          resolve = r
        }),
      )
      open()
      enterUrl()
      const parse = screen.getByTestId('croquis-modal-parse')
      fireEvent.click(parse)
      await waitFor(() => expect(parse).toHaveTextContent('Parsing…'))
      resolve({ data: { data: [] } })
      await screen.findByTestId('croquis-modal-error')
      fireEvent.change(screen.getByTestId('croquis-modal-gpx'), {
        target: { value: 'https://x/z.gpx' },
      })
      expect(
        screen.queryByTestId('croquis-modal-error'),
      ).not.toBeInTheDocument()
    })
  })
})
