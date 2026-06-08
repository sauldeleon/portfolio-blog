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
    maxMenuHeight?: number
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
    expect(screen.queryByTestId('gpx-track-url-0')).not.toBeInTheDocument()
  })

  it('renders modal content when open', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByTestId('gpx-track-url-0')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-track-name-0')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-show-waypoints')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-allow-download')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-preview')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-modal-cancel')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-modal-insert')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-add-track')).toBeInTheDocument()
  })

  describe('preview', () => {
    it('shows placeholder when first track url is empty', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx\ntrack:https://...\n```',
      )
    })

    it('shows url in preview when url filled', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx\ntrack:https://example.com/track.gpx\n```',
      )
    })

    it('includes name in preview when name filled', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.change(screen.getByTestId('gpx-track-name-0'), {
        target: { value: 'Outbound' },
      })
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx\ntrack:https://example.com/track.gpx | Outbound\n```',
      )
    })

    it('includes color in preview when color chip selected without name', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-color-0-e63946'))
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx\ntrack:https://example.com/track.gpx || #e63946\n```',
      )
    })

    it('includes name and color in preview when both filled', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.change(screen.getByTestId('gpx-track-name-0'), {
        target: { value: 'Outbound' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-color-0-e63946'))
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx\ntrack:https://example.com/track.gpx | Outbound | #e63946\n```',
      )
    })

    it('includes showWaypoints flag when checked', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      expect(screen.getByTestId('gpx-preview')).toHaveTextContent(
        '```gpx showWaypoints',
      )
    })

    it('includes allowDownload flag when checked', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-allow-download'))
      expect(screen.getByTestId('gpx-preview')).toHaveTextContent(
        '```gpx allowDownload',
      )
    })

    it('includes both flags when both checked', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.click(screen.getByTestId('gpx-allow-download'))
      expect(screen.getByTestId('gpx-preview')).toHaveTextContent(
        '```gpx showWaypoints allowDownload',
      )
    })
  })

  describe('insert button', () => {
    it('is disabled when no url is filled', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      expect(screen.getByTestId('gpx-modal-insert')).toBeDisabled()
    })

    it('is enabled when url is filled', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      expect(screen.getByTestId('gpx-modal-insert')).not.toBeDisabled()
    })
  })

  describe('onInsert', () => {
    it('calls onInsert with url-only track format', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/track.gpx\n```\n\n',
      )
    })

    it('calls onInsert with url and name', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.change(screen.getByTestId('gpx-track-name-0'), {
        target: { value: 'Outbound' },
      })
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/track.gpx | Outbound\n```\n\n',
      )
    })

    it('calls onInsert with url and color (no name)', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-color-0-e63946'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/track.gpx || #e63946\n```\n\n',
      )
    })

    it('calls onInsert with url, name and color', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.change(screen.getByTestId('gpx-track-name-0'), {
        target: { value: 'Outbound' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-color-0-e63946'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/track.gpx | Outbound | #e63946\n```\n\n',
      )
    })

    it('includes showWaypoints flag in insert', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx showWaypoints\ntrack:https://example.com/track.gpx\n```\n\n',
      )
    })

    it('includes allowDownload flag in insert', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-allow-download'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx allowDownload\ntrack:https://example.com/track.gpx\n```\n\n',
      )
    })

    it('includes both flags in insert', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.click(screen.getByTestId('gpx-allow-download'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx showWaypoints allowDownload\ntrack:https://example.com/track.gpx\n```\n\n',
      )
    })

    it('trims whitespace from url on insert', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: '  https://example.com/track.gpx  ' },
      })
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/track.gpx\n```\n\n',
      )
    })

    it('resets state after insert', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.click(screen.getByTestId('gpx-allow-download'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(screen.getByTestId('gpx-track-url-0')).toHaveValue('')
      expect(screen.getByTestId('gpx-show-waypoints')).not.toBeChecked()
      expect(screen.getByTestId('gpx-allow-download')).not.toBeChecked()
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx\ntrack:https://...\n```',
      )
    })
  })

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = jest.fn()
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('gpx-modal-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  describe('color chips', () => {
    it('deselects color chip when clicked again', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-color-0-e63946'))
      fireEvent.click(screen.getByTestId('gpx-track-color-0-e63946'))
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx\ntrack:https://example.com/track.gpx\n```',
      )
    })

    it('selecting new chip replaces previous selection', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-color-0-e63946'))
      fireEvent.click(screen.getByTestId('gpx-track-color-0-3a86ff'))
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx\ntrack:https://example.com/track.gpx || #3a86ff\n```',
      )
    })
  })

  describe('multi-track', () => {
    it('does not show remove button for single track', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      expect(screen.queryByTestId('gpx-track-remove-0')).not.toBeInTheDocument()
    })

    it('adds second track row on add track click', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      expect(screen.getByTestId('gpx-track-url-1')).toBeInTheDocument()
      expect(screen.getByTestId('gpx-track-name-1')).toBeInTheDocument()
    })

    it('shows remove button for each track when multiple tracks exist', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      expect(screen.getByTestId('gpx-track-remove-0')).toBeInTheDocument()
      expect(screen.getByTestId('gpx-track-remove-1')).toBeInTheDocument()
    })

    it('removes track row on remove click', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.change(screen.getByTestId('gpx-track-url-1'), {
        target: { value: 'https://example.com/t2.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-remove-1'))
      expect(screen.queryByTestId('gpx-track-url-1')).not.toBeInTheDocument()
    })

    it('hides remove button after removing down to one track', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.click(screen.getByTestId('gpx-track-remove-1'))
      expect(screen.queryByTestId('gpx-track-remove-0')).not.toBeInTheDocument()
    })

    it('inserts multiple track lines with auto-assigned color for new track', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/t1.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.change(screen.getByTestId('gpx-track-url-1'), {
        target: { value: 'https://example.com/t2.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      // Track 0: no color (''). Track 1: auto-assigned #3a86ff (first unused after effective #e63946)
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/t1.gpx\ntrack:https://example.com/t2.gpx || #3a86ff\n```\n\n',
      )
    })

    it('auto-assigns distinct color to new track based on effective colors', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      // Track 0 has no color; effective color = #e63946 (TRACK_COLORS[0])
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      // Track 1 should have auto-assigned #3a86ff (TRACK_COLORS[1], first unused)
      expect(screen.getByTestId('gpx-track-color-1-3a86ff')).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })

    it('skips tracks with empty urls on insert', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/t1.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/t1.gpx\n```\n\n',
      )
    })

    it('insert button enabled when only second track has url', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.change(screen.getByTestId('gpx-track-url-1'), {
        target: { value: 'https://example.com/t2.gpx' },
      })
      expect(screen.getByTestId('gpx-modal-insert')).not.toBeDisabled()
    })

    it('preview shows all tracks with their data', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/t1.gpx' },
      })
      fireEvent.change(screen.getByTestId('gpx-track-name-0'), {
        target: { value: 'Outbound' },
      })
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.change(screen.getByTestId('gpx-track-url-1'), {
        target: { value: 'https://example.com/t2.gpx' },
      })
      // Track 1 auto-gets #3a86ff (distinct from track 0's effective #e63946)
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx\ntrack:https://example.com/t1.gpx | Outbound\ntrack:https://example.com/t2.gpx || #3a86ff\n```',
      )
    })

    it('resets to single empty track after insert', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/t1.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.change(screen.getByTestId('gpx-track-url-1'), {
        target: { value: 'https://example.com/t2.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(screen.getByTestId('gpx-track-url-0')).toHaveValue('')
      expect(screen.queryByTestId('gpx-track-url-1')).not.toBeInTheDocument()
    })

    it('color chips work independently per track', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      // Track 1 auto-gets #3a86ff; select explicit colors for both
      fireEvent.click(screen.getByTestId('gpx-track-color-0-e63946'))
      // Use a color that's not the auto-assigned one for track 1
      fireEvent.click(screen.getByTestId('gpx-track-color-1-06d6a0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/t1.gpx' },
      })
      fireEvent.change(screen.getByTestId('gpx-track-url-1'), {
        target: { value: 'https://example.com/t2.gpx' },
      })
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx\ntrack:https://example.com/t1.gpx || #e63946\ntrack:https://example.com/t2.gpx || #06d6a0\n```',
      )
    })
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
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
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

    it('shows waypoints dropdown after successful fetch', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select')).toBeInTheDocument()
      const options = within(
        screen.getByTestId('waypoint-select'),
      ).getAllByRole('option')
      expect(options.map((o) => o.textContent)).toEqual([
        'Summit',
        'Water Source',
      ])
    })

    it('shows error state when fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network'))
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('fetch-error')).toBeInTheDocument()
    })

    it('does not fetch before debounce delay', () => {
      global.fetch = jest.fn()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(400)
      })
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('opens image picker when pick image button clicked', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      expect(screen.getByTestId('image-picker-mock')).toBeInTheDocument()
    })

    it('closes image picker when close button clicked', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-close'))
      expect(screen.queryByTestId('image-picker-mock')).not.toBeInTheDocument()
    })

    it('adds mapping row after picking image', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
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
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
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
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
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
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      expect(screen.queryByTestId('waypoint-select')).not.toBeInTheDocument()
      expect(screen.queryByTestId('pick-image-button')).not.toBeInTheDocument()
    })

    it('removes mapping row when remove button clicked', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
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

    it('re-adds waypoint to dropdown after mapping removed', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('pick-image-button')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      fireEvent.click(screen.getByTestId('mapping-remove'))
      await waitFor(() =>
        expect(
          within(screen.getByTestId('waypoint-select'))
            .getAllByRole('option')
            .map((o) => o.textContent),
        ).toContain('Summit'),
      )
    })

    it('can change pending waypoint via select', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
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

    it('selected waypoint persists when not mapped', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select')).toBeInTheDocument()
      fireEvent.change(screen.getByTestId('waypoint-select'), {
        target: { value: 'Water Source' },
      })
      expect(screen.getByTestId('waypoint-select')).toHaveValue('Water Source')
    })

    it('includes waypoint image lines in insert markdown', async () => {
      const onInsert = jest.fn()
      setupFetch()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
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
        '\n\n```gpx showWaypoints\ntrack:https://example.com/track.gpx\nSummit=https://cdn.com/img.jpg\n```\n\n',
      )
    })

    it('preview includes waypoint image lines', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
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
        '```gpx showWaypoints\ntrack:https://example.com/track.gpx\nSummit=https://cdn.com/img.jpg\n```',
      )
    })

    it('resets mappings and waypoints after insert', async () => {
      const onInsert = jest.fn()
      setupFetch()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
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
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
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

    it('deduplicates waypoint names across multiple tracks', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        text: jest
          .fn()
          .mockResolvedValue(
            `<?xml version="1.0"?><gpx xmlns="http://www.topografix.com/GPX/1/1"><wpt lat="0" lon="0"><name>Summit</name></wpt></gpx>`,
          ),
      } as unknown as Response)
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/t1.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.change(screen.getByTestId('gpx-track-url-1'), {
        target: { value: 'https://example.com/t2.gpx' },
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
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      // Uncheck showWaypoints → cleanup aborts the controller
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      // Reject the aborted fetch — guard should prevent setFetchError
      await act(async () => {
        rejectFetch(new Error('network'))
      })
      expect(screen.queryByTestId('fetch-error')).not.toBeInTheDocument()
    })

    it('does not update state when aborted fetch resolves', async () => {
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
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      // Uncheck → controller aborted
      fireEvent.click(screen.getByTestId('gpx-show-waypoints'))
      // Resolve after abort — finally guard should skip setFetchLoading
      await act(async () => {
        resolveFetch({
          text: jest.fn().mockResolvedValue(GPX_XML),
        } as unknown as Response)
      })
      expect(
        screen.queryByTestId('waypoint-images-section'),
      ).not.toBeInTheDocument()
    })
  })
})
