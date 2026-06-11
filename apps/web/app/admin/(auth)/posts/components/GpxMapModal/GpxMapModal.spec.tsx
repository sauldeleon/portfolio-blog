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
    expect(screen.getByTestId('gpx-track-allow-download-0')).toBeInTheDocument()
    expect(screen.getByTestId('gpx-track-show-waypoints-0')).toBeInTheDocument()
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
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      expect(screen.getByTestId('gpx-preview')).toHaveTextContent(
        '||| showWaypoints',
      )
    })

    it('includes allowDownload flag in track line preview when checked', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-allow-download-0'))
      expect(screen.getByTestId('gpx-preview')).toHaveTextContent(
        '||| download',
      )
    })

    it('includes both flags when both checked', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.click(screen.getByTestId('gpx-track-allow-download-0'))
      expect(screen.getByTestId('gpx-preview')).toHaveTextContent(
        '||| download showWaypoints',
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
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/track.gpx ||| showWaypoints\n```\n\n',
      )
    })

    it('includes allowDownload flag in track line (no name, no color)', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-allow-download-0'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/track.gpx ||| download\n```\n\n',
      )
    })

    it('includes allowDownload with name but no color', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.change(screen.getByTestId('gpx-track-name-0'), {
        target: { value: 'Outbound' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-allow-download-0'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/track.gpx | Outbound || download\n```\n\n',
      )
    })

    it('includes allowDownload with name and color', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.change(screen.getByTestId('gpx-track-name-0'), {
        target: { value: 'Outbound' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-color-0-e63946'))
      fireEvent.click(screen.getByTestId('gpx-track-allow-download-0'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/track.gpx | Outbound | #e63946 | download\n```\n\n',
      )
    })

    it('includes both showWaypoints and per-track allowDownload in insert', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.click(screen.getByTestId('gpx-track-allow-download-0'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/track.gpx ||| download showWaypoints\n```\n\n',
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
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.click(screen.getByTestId('gpx-track-allow-download-0'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(screen.getByTestId('gpx-track-url-0')).toHaveValue('')
      expect(screen.getByTestId('gpx-track-show-waypoints-0')).not.toBeChecked()
      expect(screen.getByTestId('gpx-track-allow-download-0')).not.toBeChecked()
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
      // Track 0: no color. Track 1: auto-assigned #3a86ff (first unused)
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
      // Explicitly pick colors for both tracks
      fireEvent.click(screen.getByTestId('gpx-track-color-0-e63946'))
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

    it('disables color chip for other track effective color', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      // Track 0 effective color = #e63946 (no explicit selection, TRACK_COLORS[0])
      // Track 1 auto-assigned #3a86ff
      expect(screen.getByTestId('gpx-track-color-0-3a86ff')).toBeDisabled()
      expect(screen.getByTestId('gpx-track-color-1-e63946')).toBeDisabled()
    })

    it('includes allowDownload flag in second track line (no name, with color)', () => {
      const onInsert = jest.fn()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/t1.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.change(screen.getByTestId('gpx-track-url-1'), {
        target: { value: 'https://example.com/t2.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-allow-download-1'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      // Track 1: auto-color #3a86ff, no name, allowDownload
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/t1.gpx\ntrack:https://example.com/t2.gpx || #3a86ff | download\n```\n\n',
      )
    })
  })

  describe('waypoint images section', () => {
    it('does not show waypoint section when showWaypoints is false', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      expect(
        screen.queryByTestId('waypoint-images-section-0'),
      ).not.toBeInTheDocument()
    })

    it('does not show waypoint section when url is empty even if showWaypoints checked', () => {
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      expect(
        screen.queryByTestId('waypoint-images-section-0'),
      ).not.toBeInTheDocument()
    })

    it('shows loading state while fetching waypoints', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(screen.getByTestId('fetch-loading-0')).toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('fetch-loading-0')).not.toBeInTheDocument(),
      )
    })

    it('shows waypoints dropdown after successful fetch', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select-0')).toBeInTheDocument()
      const options = within(
        screen.getByTestId('waypoint-select-0'),
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
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('fetch-error-0')).toBeInTheDocument()
    })

    it('does not fetch before debounce delay', () => {
      global.fetch = jest.fn()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
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
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(
        await screen.findByTestId('pick-image-button-0'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      expect(screen.getByTestId('image-picker-mock')).toBeInTheDocument()
    })

    it('closes image picker when close button clicked', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(
        await screen.findByTestId('pick-image-button-0'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      fireEvent.click(screen.getByTestId('image-picker-close'))
      expect(screen.queryByTestId('image-picker-mock')).not.toBeInTheDocument()
    })

    it('adds mapping row after picking image', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(
        await screen.findByTestId('pick-image-button-0'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      expect(screen.getByTestId('mapping-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('mapping-name-0')).toHaveTextContent('Summit')
      expect(screen.getByTestId('mapping-thumb-0')).toHaveAttribute(
        'src',
        'https://cdn.com/img.jpg',
      )
    })

    it('closes image picker after picking image', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(
        await screen.findByTestId('pick-image-button-0'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      expect(screen.queryByTestId('image-picker-mock')).not.toBeInTheDocument()
    })

    it('removes mapped waypoint from dropdown after pick', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select-0')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      const options = within(
        screen.getByTestId('waypoint-select-0'),
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
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(
        await screen.findByTestId('pick-image-button-0'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      expect(screen.queryByTestId('waypoint-select-0')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('pick-image-button-0'),
      ).not.toBeInTheDocument()
    })

    it('removes mapping row when remove button clicked', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(
        await screen.findByTestId('pick-image-button-0'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      fireEvent.click(screen.getByTestId('mapping-remove-0'))
      expect(screen.queryByTestId('mapping-row-0')).not.toBeInTheDocument()
    })

    it('re-adds waypoint to dropdown after mapping removed', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(
        await screen.findByTestId('pick-image-button-0'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      fireEvent.click(screen.getByTestId('mapping-remove-0'))
      await waitFor(() =>
        expect(
          within(screen.getByTestId('waypoint-select-0'))
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
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select-0')).toBeInTheDocument()
      fireEvent.change(screen.getByTestId('waypoint-select-0'), {
        target: { value: 'Water Source' },
      })
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      expect(screen.getByTestId('mapping-name-0')).toHaveTextContent(
        'Water Source',
      )
    })

    it('selected waypoint persists when not mapped', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select-0')).toBeInTheDocument()
      fireEvent.change(screen.getByTestId('waypoint-select-0'), {
        target: { value: 'Water Source' },
      })
      expect(screen.getByTestId('waypoint-select-0')).toHaveValue(
        'Water Source',
      )
    })

    it('includes waypoint image lines in insert markdown', async () => {
      const onInsert = jest.fn()
      setupFetch()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(
        await screen.findByTestId('pick-image-button-0'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(onInsert).toHaveBeenCalledWith(
        '\n\n```gpx\ntrack:https://example.com/track.gpx ||| showWaypoints\n0:Summit=https://cdn.com/img.jpg\n```\n\n',
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
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(
        await screen.findByTestId('pick-image-button-0'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      expect(screen.getByTestId('gpx-preview').textContent).toBe(
        '```gpx\ntrack:https://example.com/track.gpx ||| showWaypoints\n0:Summit=https://cdn.com/img.jpg\n```',
      )
    })

    it('resets mappings and waypoints after insert', async () => {
      const onInsert = jest.fn()
      setupFetch()
      renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(
        await screen.findByTestId('pick-image-button-0'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('pick-image-button-0'))
      fireEvent.click(screen.getByTestId('image-picker-pick'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert'))
      expect(
        screen.queryByTestId('waypoint-images-section-0'),
      ).not.toBeInTheDocument()
      expect(screen.queryByTestId('mapping-row-0')).not.toBeInTheDocument()
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
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select-0')).toBeInTheDocument()
      const options = within(
        screen.getByTestId('waypoint-select-0'),
      ).getAllByRole('option')
      expect(options.map((o) => o.textContent)).toEqual(['Summit'])
    })

    it('shows separate waypoint dropdowns per track', async () => {
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
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/t1.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.change(screen.getByTestId('gpx-track-url-1'), {
        target: { value: 'https://example.com/t2.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-1'))
      act(() => {
        jest.advanceTimersByTime(600)
      })
      expect(await screen.findByTestId('waypoint-select-0')).toBeInTheDocument()
      expect(await screen.findByTestId('waypoint-select-1')).toBeInTheDocument()
      const opts0 = within(
        screen.getByTestId('waypoint-select-0'),
      ).getAllByRole('option')
      const opts1 = within(
        screen.getByTestId('waypoint-select-1'),
      ).getAllByRole('option')
      expect(opts0.map((o) => o.textContent)).toEqual(['Summit'])
      expect(opts1.map((o) => o.textContent)).toEqual(['Summit'])
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
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      // Uncheck showWaypoints → cleanup aborts the controller
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      // Reject the aborted fetch — guard should prevent setFetchError
      await act(async () => {
        rejectFetch(new Error('network'))
      })
      expect(screen.queryByTestId('fetch-error-0')).not.toBeInTheDocument()
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
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/track.gpx' },
      })
      act(() => {
        jest.advanceTimersByTime(600)
      })
      // Uncheck → controller aborted
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      // Resolve after abort — finally guard should skip setFetchLoading
      await act(async () => {
        resolveFetch({
          text: jest.fn().mockResolvedValue(GPX_XML),
        } as unknown as Response)
      })
      expect(
        screen.queryByTestId('waypoint-images-section-0'),
      ).not.toBeInTheDocument()
    })
  })

  describe('per-track state shift on remove', () => {
    it('preserves track-0 waypoint state when removing track 1', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/t1.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      act(() => {
        jest.advanceTimersByTime(600)
      })
      await screen.findByTestId('waypoint-select-0')
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.click(screen.getByTestId('gpx-track-remove-1'))
      expect(
        screen.getByTestId('waypoint-images-section-0'),
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('waypoint-images-section-1'),
      ).not.toBeInTheDocument()
    })

    it('shifts track-1 waypoint state to track-0 when removing track 0', async () => {
      setupFetch()
      renderApp(
        <GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
      )
      fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
        target: { value: 'https://example.com/t1.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-0'))
      fireEvent.click(screen.getByTestId('gpx-add-track'))
      fireEvent.change(screen.getByTestId('gpx-track-url-1'), {
        target: { value: 'https://example.com/t2.gpx' },
      })
      fireEvent.click(screen.getByTestId('gpx-track-show-waypoints-1'))
      act(() => {
        jest.advanceTimersByTime(600)
      })
      await screen.findByTestId('waypoint-select-0')
      await screen.findByTestId('waypoint-select-1')
      fireEvent.click(screen.getByTestId('gpx-track-remove-0'))
      // Section-0 still shows (loading state from re-fetch after URL key change)
      expect(
        screen.getByTestId('waypoint-images-section-0'),
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('waypoint-images-section-1'),
      ).not.toBeInTheDocument()
    })
  })
})

describe('GpxMapModal initialValues', () => {
  it('pre-fills tracks when initialValues provided', () => {
    renderApp(
      <GpxMapModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        initialValues={{
          tracks: [
            {
              url: 'https://cdn.com/route.gpx',
              name: 'My Trail',
              color: '#3a86ff',
              allowDownload: true,
              showWaypoints: false,
              showElevation: false,
            },
          ],
          mappingsByTrack: {},
        }}
      />,
    )
    expect(screen.getByTestId('gpx-track-url-0')).toHaveValue(
      'https://cdn.com/route.gpx',
    )
    expect(screen.getByTestId('gpx-track-name-0')).toHaveValue('My Trail')
    expect(screen.getByTestId('gpx-track-allow-download-0')).toBeChecked()
  })

  it('does not pre-fill when initialValues is null', () => {
    renderApp(
      <GpxMapModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        initialValues={null}
      />,
    )
    expect(screen.getByTestId('gpx-track-url-0')).toHaveValue('')
  })

  it('uses initTrack when initialValues has empty tracks array', () => {
    renderApp(
      <GpxMapModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        initialValues={{ tracks: [], mappingsByTrack: {} }}
      />,
    )
    expect(screen.getByTestId('gpx-track-url-0')).toHaveValue('')
  })
})

describe('GpxMapModal elevation profile', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders elevation profile checkbox per track', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByTestId('track-show-elevation-0')).toBeInTheDocument()
  })

  it('elevation profile checkbox is unchecked by default', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByTestId('track-show-elevation-0')).not.toBeChecked()
  })

  it('checking elevation checkbox and inserting generates markdown with elevation flag', () => {
    const onInsert = jest.fn()
    renderApp(<GpxMapModal isOpen onInsert={onInsert} onCancel={jest.fn()} />)
    fireEvent.change(screen.getByTestId('gpx-track-url-0'), {
      target: { value: 'https://example.com/track.gpx' },
    })
    fireEvent.click(screen.getByTestId('track-show-elevation-0'))
    fireEvent.click(screen.getByTestId('gpx-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```gpx\ntrack:https://example.com/track.gpx ||| elevation\n```\n\n',
    )
  })

  it('elevation flag appears in preview when checked', () => {
    renderApp(<GpxMapModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />)
    fireEvent.click(screen.getByTestId('track-show-elevation-0'))
    expect(screen.getByTestId('gpx-preview')).toHaveTextContent('||| elevation')
  })
})
