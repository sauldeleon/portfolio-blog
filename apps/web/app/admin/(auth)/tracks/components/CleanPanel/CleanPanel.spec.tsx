import { fireEvent, screen } from '@testing-library/react'

import {
  DEFAULT_CLEAN_OPTIONS,
  type GpxPoint,
  type TrackStats,
} from '@sdlgr/gpx-tools'
import { renderApp } from '@sdlgr/test-utils'

import { CleanPanel } from './CleanPanel'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

const stats: TrackStats = {
  points: 100,
  distance: 2500,
  ascent: 200,
  descent: 150,
  minEle: 900,
  maxEle: 1100,
  duration: 3600,
}

// One point every ~1 km heading north.
const points: GpxPoint[] = Array.from({ length: 5 }, (_, i) => ({
  lat: 42 + i * 0.008993,
  lon: 0,
  ele: null,
  time: null,
}))

function renderPanel(props: Partial<Parameters<typeof CleanPanel>[0]> = {}) {
  const callbacks = {
    onChange: jest.fn(),
    onApply: jest.fn(),
    onReset: jest.fn(),
    onScopeChange: jest.fn(),
    onSectionChange: jest.fn(),
  }
  renderApp(
    <CleanPanel
      options={DEFAULT_CLEAN_OPTIONS}
      currentStats={stats}
      previewStats={{ ...stats, points: 40 }}
      scope="section"
      section={null}
      points={points}
      sectionStats={null}
      {...callbacks}
      {...props}
    />,
  )
  return callbacks
}

describe('CleanPanel', () => {
  it('shows current and preview stats', () => {
    renderPanel()
    expect(screen.getByTestId('preview-points')).toHaveTextContent('40')
    expect(screen.getByTestId('preview-distance')).toHaveTextContent('2.50 km')
    expect(screen.getByTestId('preview-duration')).toHaveTextContent('1:00')
  })

  it('shows dashes without a preview', () => {
    renderPanel({ previewStats: null })
    expect(screen.getByTestId('preview-points')).toHaveTextContent('—')
  })

  it('toggles a filter', () => {
    const { onChange } = renderPanel()
    fireEvent.click(screen.getByLabelText('tracks.clean.trim.label'))
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_CLEAN_OPTIONS,
      trim: { ...DEFAULT_CLEAN_OPTIONS.trim, enabled: true },
    })
  })

  it('updates numeric parameters and ignores invalid input', () => {
    const { onChange } = renderPanel()
    const input = screen.getByTestId('field-simplify-tolerance')
    fireEvent.change(input, { target: { value: '5' } })
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_CLEAN_OPTIONS,
      simplify: { ...DEFAULT_CLEAN_OPTIONS.simplify, tolerance: 5 },
    })
    onChange.mockClear()
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.change(input, { target: { value: '-1' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables the inputs of disabled filters', () => {
    renderPanel()
    expect(screen.getByTestId('field-trim-start')).toBeDisabled()
    expect(screen.getByTestId('field-simplify-tolerance')).toBeEnabled()
  })

  it('switches the simplification algorithm and its unit', () => {
    const { onChange } = renderPanel()
    expect(screen.getByTestId('filter-simplify')).toHaveTextContent('(m)')
    fireEvent.click(screen.getByTestId('algorithm-visvalingam'))
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_CLEAN_OPTIONS,
      simplify: { ...DEFAULT_CLEAN_OPTIONS.simplify, algorithm: 'visvalingam' },
    })
  })

  it('shows m² for Visvalingam', () => {
    renderPanel({
      options: {
        ...DEFAULT_CLEAN_OPTIONS,
        simplify: {
          ...DEFAULT_CLEAN_OPTIONS.simplify,
          algorithm: 'visvalingam',
        },
      },
    })
    expect(screen.getByTestId('filter-simplify')).toHaveTextContent('(m²)')
    expect(screen.getByTestId('algorithm-visvalingam')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('applies and resets', () => {
    const { onApply, onReset } = renderPanel()
    fireEvent.click(screen.getByTestId('apply-clean'))
    fireEvent.click(screen.getByText('tracks.clean.reset'))
    expect(onApply).toHaveBeenCalled()
    expect(onReset).toHaveBeenCalled()
  })

  describe('scope', () => {
    const sectionStats = {
      current: { ...stats, points: 30 },
      preview: { ...stats, points: 12 },
    }

    it('cleans the whole track until a section is selected', () => {
      renderPanel()
      expect(screen.getByTestId('scope-track')).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.getByTestId('scope-section')).toBeDisabled()
      expect(screen.getByTestId('scope-section')).toHaveTextContent(
        'tracks.clean.scope.section',
      )
      expect(screen.getByTestId('section-from')).toHaveValue(0)
      expect(screen.getByTestId('section-to')).toHaveValue(4)
      expect(screen.getByTestId('stats-scope')).toBeEmptyDOMElement()
      expect(screen.queryByTestId('preview-total')).not.toBeInTheDocument()
    })

    it('shows the section figures and the whole track total', () => {
      renderPanel({ section: { from: 1, to: 3 }, sectionStats })
      expect(screen.getByTestId('scope-section')).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.getByTestId('scope-section')).toHaveTextContent(
        'tracks.clean.scope.sectionRange',
      )
      expect(screen.getByTestId('stats-scope')).toHaveTextContent(
        'tracks.clean.scope.section',
      )
      expect(screen.getByTestId('preview-points')).toHaveTextContent('12')
      expect(screen.getByTestId('preview-total')).toHaveTextContent(
        'tracks.clean.scope.totalValue',
      )
      expect(screen.getByTestId('section-from')).toHaveValue(1)
      expect(screen.getByTestId('section-to')).toHaveValue(3)
    })

    it('hides the total without a preview', () => {
      renderPanel({
        section: { from: 1, to: 3 },
        sectionStats,
        previewStats: null,
      })
      expect(screen.queryByTestId('preview-total')).not.toBeInTheDocument()
    })

    it('switches the scope', () => {
      const { onScopeChange } = renderPanel({
        section: { from: 1, to: 3 },
        sectionStats,
      })
      fireEvent.click(screen.getByTestId('scope-track'))
      expect(onScopeChange).toHaveBeenCalledWith('track')
    })

    it('locks the privacy trim while cleaning a section', () => {
      renderPanel({
        section: { from: 1, to: 3 },
        options: {
          ...DEFAULT_CLEAN_OPTIONS,
          trim: { ...DEFAULT_CLEAN_OPTIONS.trim, enabled: true },
        },
      })
      expect(screen.getByLabelText('tracks.clean.trim.label')).toBeDisabled()
      expect(screen.getByLabelText('tracks.clean.trim.label')).not.toBeChecked()
      expect(screen.getByTestId('field-trim-start')).toBeDisabled()
      expect(screen.getByTestId('filter-trim')).toHaveTextContent(
        'tracks.clean.trim.sectionHelp',
      )
    })

    it('keeps the privacy trim on the whole track', () => {
      renderPanel({ section: { from: 1, to: 3 }, scope: 'track' })
      expect(screen.getByTestId('scope-track')).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.getByLabelText('tracks.clean.trim.label')).toBeEnabled()
    })

    it('picks a section from km', () => {
      const { onSectionChange } = renderPanel({ section: { from: 1, to: 3 } })
      const from = screen.getByTestId('section-from')
      from.focus()
      fireEvent.change(from, { target: { value: '0.2' } })
      fireEvent.keyDown(from, { key: 'Tab' })
      fireEvent.keyDown(from, { key: 'Enter' })
      expect(onSectionChange).toHaveBeenLastCalledWith({ from: 0, to: 3 })
      const to = screen.getByTestId('section-to')
      fireEvent.change(to, { target: { value: '3.9' } })
      fireEvent.blur(to)
      expect(onSectionChange).toHaveBeenLastCalledWith({ from: 1, to: 4 })
    })

    it('starts a section from km without a selection', () => {
      const { onSectionChange } = renderPanel()
      const from = screen.getByTestId('section-from')
      fireEvent.change(from, { target: { value: '2' } })
      fireEvent.blur(from)
      expect(onSectionChange).toHaveBeenCalledWith({ from: 2, to: 4 })
    })

    it('restores invalid or empty ranges', () => {
      const { onSectionChange } = renderPanel({ section: { from: 1, to: 3 } })
      const from = screen.getByTestId('section-from')
      fireEvent.change(from, { target: { value: '' } })
      fireEvent.blur(from)
      expect(from).toHaveValue(1)
      const to = screen.getByTestId('section-to')
      fireEvent.change(to, { target: { value: '1.1' } })
      fireEvent.blur(to)
      expect(to).toHaveValue(3)
      expect(onSectionChange).not.toHaveBeenCalled()
    })

    it('disables the km fields on tracks without distance', () => {
      renderPanel({ points: [] })
      expect(screen.getByTestId('section-from')).toBeDisabled()
      expect(screen.getByTestId('section-from')).toHaveValue(0)
    })
  })
})
