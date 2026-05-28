import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { GpxMapModal } from './GpxMapModal'

const GPX_XML = `<?xml version="1.0"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="43.5" lon="-5.6"><name>Summit</name></wpt>
  <wpt lat="43.6" lon="-5.7"><name>Water Source</name></wpt>
</gpx>`

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
  }) => (
    <select
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
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
    zIndex?: number
  }) =>
    open ? (
      <div data-testid="image-picker-mock">
        <button
          type="button"
          data-testid="image-picker-pick"
          onClick={() =>
            onPick({ url: 'https://cdn.com/img.jpg', publicId: 'img' })
          }
        >
          Pick
        </button>
        <button
          type="button"
          data-testid="image-picker-close"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    ) : null,
}))

function setupFetch(xml = GPX_XML) {
  global.fetch = jest.fn().mockResolvedValue({
    text: jest.fn().mockResolvedValue(xml),
  } as unknown as Response)
}

describe('GpxMapModal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders nothing when closed', () => {
    renderApp(
      <GpxMapModal isOpen={false} onInsert={jest.fn()} onCancel={jest.fn()} />,
    )
    expect(screen.queryByTestId('gpx-url-input')).not.toBeInTheDocument()
  })

  it('renders modal content when open', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByTestId('gpx-url-input')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-show-waypoints')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-allow-download')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-preview')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-modal-cancel')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-modal-insert')).toBeInTheDocument()
  })

  it('shows placeholder in preview when url is empty', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByTestId('gpx-preview').textContent).toBe(
      '```gpx\nhttps://...\n```',
    )
  })

  it('shows url in preview when url is filled', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    fireEvent.change(screen.getByTestId('gpx-url-input'), {
      target: { value: 'https://example.com/track.gpx' },
    })
    expect(screen.getByTestId('gpx-preview').textContent).toBe(
      '```gpx\nhttps://example.com/track.gpx\n```',
    )
  })

  it('includes showWaypoints flag in preview when checked', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
    expect(screen.getByTestId('gpx-preview')).toHaveTextContent(
      '```gpx showWaypoints',
    )
  })

  it('includes allowDownload flag in preview when checked', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    fireEvent.click(screen.getByTestId('gpx-allow-download'))
    expect(screen.getByTestId('gpx-preview')).toHaveTextContent(
      '```gpx allowDownload',
    )
  })

  it('includes both flags in preview when both checked', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
    fireEvent.click(screen.getByTestId('gpx-allow-download'))
    expect(screen.getByTestId('gpx-preview')).toHaveTextContent(
      '```gpx showWaypoints allowDownload',
    )
  })

  it('insert button is disabled when url is empty', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByTestId('gpx-modal-insert')).toBeDisabled()
  })

  it('insert button is enabled when url is filled', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    fireEvent.change(screen.getByTestId('gpx-url-input'), {
      target: { value: 'https://example.com/track.gpx' },
    })
    expect(screen.getByTestId('gpx-modal-insert')).not.toBeDisabled()
  })

  it('does not call onInsert when url is empty and insert clicked', () => {
    const onInsert = jest.fn()
    renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
    fireEvent.click(screen.getByTestId('gpx-modal-insert'))
    expect(onInsert).not.toHaveBeenCalled()
  })

  it('calls onInsert with basic gpx markdown on insert', () => {
    const onInsert = jest.fn()
    renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
    fireEvent.change(screen.getByTestId('gpx-url-input'), {
      target: { value: 'https://example.com/track.gpx' },
    })
    fireEvent.click(screen.getByTestId('gpx-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```gpx\nhttps://example.com/track.gpx\n```\n\n',
    )
  })

  it('calls onInsert with showWaypoints flag when checked', () => {
    const onInsert = jest.fn()
    renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
    fireEvent.change(screen.getByTestId('gpx-url-input'), {
      target: { value: 'https://example.com/track.gpx' },
    })
    fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
    fireEvent.click(screen.getByTestId('gpx-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```gpx showWaypoints\nhttps://example.com/track.gpx\n```\n\n',
    )
  })

  it('calls onInsert with allowDownload flag when checked', () => {
    const onInsert = jest.fn()
    renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
    fireEvent.change(screen.getByTestId('gpx-url-input'), {
      target: { value: 'https://example.com/track.gpx' },
    })
    fireEvent.click(screen.getByTestId('gpx-allow-download'))
    fireEvent.click(screen.getByTestId('gpx-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```gpx allowDownload\nhttps://example.com/track.gpx\n```\n\n',
    )
  })

  it('calls onInsert with both flags when both checked', () => {
    const onInsert = jest.fn()
    renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
    fireEvent.change(screen.getByTestId('gpx-url-input'), {
      target: { value: 'https://example.com/track.gpx' },
    })
    fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
    fireEvent.click(screen.getByTestId('gpx-allow-download'))
    fireEvent.click(screen.getByTestId('gpx-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```gpx showWaypoints allowDownload\nhttps://example.com/track.gpx\n```\n\n',
    )
  })

  it('trims whitespace from url on insert', () => {
    const onInsert = jest.fn()
    renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
    fireEvent.change(screen.getByTestId('gpx-url-input'), {
      target: { value: '  https://example.com/track.gpx  ' },
    })
    fireEvent.click(screen.getByTestId('gpx-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```gpx\nhttps://example.com/track.gpx\n```\n\n',
    )
  })

  it('resets state after insert', () => {
    const onInsert = jest.fn()
    renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
    fireEvent.change(screen.getByTestId('gpx-url-input'), {
      target: { value: 'https://example.com/track.gpx' },
    })
    fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
    fireEvent.click(screen.getByTestId('gpx-allow-download'))
    fireEvent.click(screen.getByTestId('gpx-modal-insert'))
    expect(screen.getByTestId('gpx-url-input')).toHaveValue('')
    expect(screen.getByTestId('gpx-show-waypoints')).not.toBeChecked()
    expect(screen.getByTestId('gpx-allow-download')).not.toBeChecked()
  })

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = jest.fn()
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('gpx-modal-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  describe('waypoint images section', () => {
    it('does not show waypoint section when showWaypoints is false', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      expect(
        screen.queryByTestId('waypoint-images-section'),
      ).not.toBeInTheDocument()
    })

    it('does not show waypoint section when url is empty even if showWaypoints checked', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      expect(
        screen.queryByTestId('waypoint-images-section'),
      ).not.toBeInTheDocument()
    })

    it('shows loading state while fetching waypoints', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(screen.getByTestId('fetch-loading')).toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('fetch-loading')).not.toBeInTheDocument(),
      )
    })

    it('shows waypoint dropdown after successful fetch', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select')).toBeInTheDocument()
      expect(screen.getByText('Summit')).toBeInTheDocument()
      expect(screen.getByText('Water Source')).toBeInTheDocument()
    })

    it('shows error state when fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network'))
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('fetch-error')).toBeInTheDocument()
    })

    it('opens image picker when pick image button clicked', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      expect(screen.getByTestId('image-picker-mock')).toBeInTheDocument()
    })

    it('adds mapping row after picking image', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      expect(screen.getByTestId('mapping-row')).toBeInTheDocument()
      expect(screen.getByTestId('mapping-name')).toHaveTextContent('Summit')
      expect(screen.getByTestId('mapping-thumb')).toHaveAttribute(
        'src',
        'https://cdn.com/img.jpg',
      )
    })

    it('closes image picker after picking image', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      expect(screen.queryByTestId('image-picker-mock')).not.toBeInTheDocument()
    })

    it('removes mapped waypoint from dropdown after pick', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      const options = within(
        screen.getByTestId('waypoint-select'),
      ).getAllByRole('option')
      expect(options.map((o) => o.textContent)).not.toContain('Summit')
    })

    it('closes dropdown when all waypoints are mapped', async () => {
      setupFetch(`<?xml version="1.0"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="43.5" lon="-5.6"><name>Summit</name></wpt>
</gpx>`)
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      expect(screen.queryByTestId('waypoint-select')).not.toBeInTheDocument()
    })

    it('removes mapping row when remove button clicked', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      fireEvent.click(screen.getByTestId('mapping-remove'))
      expect(screen.queryByTestId('mapping-row')).not.toBeInTheDocument()
    })

    it('can change pending waypoint via select', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select')).toBeInTheDocument()
      fireEvent.change(screen.getByTestId('waypoint-select'), {
        target: { value: 'Water Source' },
      })
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      expect(screen.getByTestId('mapping-name')).toHaveTextContent(
        'Water Source',
      )
    })

    it('includes waypoint image lines in insert markdown', async () => {
      const onInsert = jest.fn()
      setupFetch()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx showWaypoints\nhttps://example.com/track.gpx\nSummit=https://cdn.com/img.jpg\n```\n\n',
      )
    })

    it('preview includes waypoint image lines', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx showWaypoints\nhttps://example.com/track.gpx\nSummit=https://cdn.com/img.jpg\n```',
      )
    })

    it('does not fetch before debounce delay', () => {
      global.fetch = jest.fn()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(400)
      })
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('closes image picker when close button clicked', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      expect(screen.getByTestId('image-picker-mock')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('image-picker-close'))
      expect(screen.queryByTestId('image-picker-mock')).not.toBeInTheDocument()
    })

    it('resets mappings and waypoints after insert', async () => {
      const onInsert = jest.fn()
      setupFetch()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(
        screen.queryByTestId('waypoint-images-section'),
      ).not.toBeInTheDocument()
      expect(screen.queryByTestId('mapping-row')).not.toBeInTheDocument()
    })

    it('pick image button is disabled when no pendingWaypoint', async () => {
      setupFetch(
        `<?xml version="1.0"?><gpx xmlns="http://www.topografix.com/GPX/1/1"></gpx>`,
      )
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      await waitFor(() =>
        expect(screen.queryByTestId('waypoint-select')).not.toBeInTheDocument(),
      )
      expect(screen.queryByTestId('pick-image-button')).not.toBeInTheDocument()
    })

    it('filters out waypoints with no name element', async () => {
      setupFetch(`<?xml version="1.0"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="43.5" lon="-5.6"><name>Summit</name></wpt>
  <wpt lat="43.6" lon="-5.7"></wpt>
</gpx>`)
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select')).toBeInTheDocument()
      const options = within(
        screen.getByTestId('waypoint-select'),
      ).getAllByRole('option')
      expect(options.map((o) => o.textContent)).toEqual(['Summit'])
    })

    it('does not set fetch error when fetch is aborted before completing', async () => {
      let rejectFetch!: (e: Error) => void
      global.fetch = jest.fn().mockReturnValue(
        new Promise<Response>((_, reject) => {
          rejectFetch = reject
        }),
      )
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      // Uncheck showWaypoints → cleanup runs → controller.abort()
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      // Reject the now-aborted fetch — guard should prevent setting fetchError
      await act(async () => {
        rejectFetch(new Error('network'))
      })
      expect(screen.queryByTestId('fetch-error')).not.toBeInTheDocument()
    })

    it('does not update loading state when fetch is aborted and resolves', async () => {
      let resolveFetch!: (r: Response) => void
      global.fetch = jest.fn().mockReturnValue(
        new Promise<Response>((resolve) => {
          resolveFetch = resolve
        }),
      )
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-url-input'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      // Uncheck showWaypoints → cleanup runs → controller.abort()
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      // Resolve the now-aborted fetch — guard should prevent setFetchLoading call
      await act(async () => {
        resolveFetch({
          text: jest.fn().mockResolvedValue(GPX_XML),
        } as unknown as Response)
      })
      // Waypoint section should not appear since showWaypoints was unchecked
      expect(
        screen.queryByTestId('waypoint-images-section'),
      ).not.toBeInTheDocument()
    })
  })
})
