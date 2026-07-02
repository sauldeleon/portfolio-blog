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

jest.mock('@web/components/Croquis', () => ({
  CroquisMap: () => <div data-testid="croquis-map-mock" />,
}))

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

jest.mock('../ImagePicker', () => ({
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

const JUMP = 'salto: Jump 2m - 42.6092 0.1412'

function open(
  props: Partial<React.ComponentProps<typeof CroquisInsertModal>> = {},
) {
  const onInsert = jest.fn()
  const onCancel = jest.fn()
  renderApp(
    <CroquisInsertModal
      isOpen
      lang="en"
      onInsert={onInsert}
      onCancel={onCancel}
      {...props}
    />,
  )
  return { onInsert, onCancel }
}

afterEach(() => jest.restoreAllMocks())

describe('CroquisInsertModal', () => {
  it('renders the modal content when open', () => {
    open()
    expect(screen.getByTestId('croquis-modal')).toBeInTheDocument()
    expect(screen.getByTestId('croquis-modal-text')).toBeInTheDocument()
  })

  it('prefills the textarea from initial values', () => {
    open({ initialValues: { text: JUMP } })
    expect(screen.getByTestId('croquis-modal-text')).toHaveValue(JUMP)
  })

  it('offers a waypoint selector and shows the preview once drawable', () => {
    open()
    fireEvent.change(screen.getByTestId('croquis-modal-text'), {
      target: { value: JUMP },
    })
    expect(screen.getByTestId('croquis-wp-select')).toBeInTheDocument()
    expect(screen.getByTestId('croquis-modal-preview')).toBeInTheDocument()
    expect(screen.getByTestId('croquis-map-mock')).toBeInTheDocument()
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
    expect(md).toContain('```croquis')
    expect(md).toContain(JUMP)
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
    // The waypoint moves to the mappings list with its thumb.
    expect(screen.getByTestId('croquis-wp-thumb-0')).toHaveAttribute(
      'src',
      'https://cdn/pick.jpg',
    )
    fireEvent.click(screen.getByTestId('croquis-modal-insert'))
    expect(onInsert.mock.calls[0][0]).toContain('img=https://cdn/pick.jpg')
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
    expect(screen.getByTestId('croquis-wp-thumb-1')).toBeInTheDocument()
    expect(screen.queryByTestId('croquis-wp-thumb-0')).not.toBeInTheDocument()
  })

  it('removes a waypoint image', () => {
    open({ initialValues: { text: `${JUMP}\n! img=https://cdn/x.jpg` } })
    expect(screen.getByTestId('croquis-wp-thumb-0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('croquis-wp-remove-0'))
    expect(screen.queryByTestId('croquis-wp-thumb-0')).not.toBeInTheDocument()
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
      jest.spyOn(axios, 'get').mockResolvedValue({
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
      jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: [] } })
      open()
      enterUrl()
      fireEvent.click(screen.getByTestId('croquis-modal-parse'))
      expect(
        await screen.findByTestId('croquis-modal-error'),
      ).toBeInTheDocument()
    })

    it('shows the server error message', async () => {
      jest
        .spyOn(axios, 'get')
        .mockRejectedValue(makeAxiosError(400, { error: 'Bad GPX' }))
      open()
      enterUrl()
      fireEvent.click(screen.getByTestId('croquis-modal-parse'))
      expect(
        await screen.findByTestId('croquis-modal-error'),
      ).toHaveTextContent('Bad GPX')
    })

    it('falls back to a generic error when the axios error has no message', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue(makeAxiosError(500, {}))
      open()
      enterUrl()
      fireEvent.click(screen.getByTestId('croquis-modal-parse'))
      expect(
        await screen.findByTestId('croquis-modal-error'),
      ).toHaveTextContent('Could not parse GPX file')
    })

    it('falls back to a generic error for non-axios failures', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))
      open()
      enterUrl()
      fireEvent.click(screen.getByTestId('croquis-modal-parse'))
      expect(
        await screen.findByTestId('croquis-modal-error'),
      ).toBeInTheDocument()
    })

    it('shows a parsing label and clears a prior error on url change', async () => {
      let resolve!: (v: unknown) => void
      jest.spyOn(axios, 'get').mockReturnValue(
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
