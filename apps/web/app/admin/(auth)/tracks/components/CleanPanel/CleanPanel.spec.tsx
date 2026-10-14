import { fireEvent, screen } from '@testing-library/react'

import { DEFAULT_CLEAN_OPTIONS, type TrackStats } from '@sdlgr/gpx-tools'
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

function renderPanel(props: Partial<Parameters<typeof CleanPanel>[0]> = {}) {
  const callbacks = {
    onChange: jest.fn(),
    onApply: jest.fn(),
    onReset: jest.fn(),
  }
  renderApp(
    <CleanPanel
      options={DEFAULT_CLEAN_OPTIONS}
      currentStats={stats}
      previewStats={{ ...stats, points: 40 }}
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
})
