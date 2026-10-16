import { fireEvent, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import type { GpxPoint } from '@sdlgr/gpx-tools'
import { renderApp } from '@sdlgr/test-utils'

import {
  ElevationProfile,
  type ElevationProfileProps,
} from './ElevationProfile'

type ChartState = { activeTooltipIndex?: number | string | null }

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AreaChart: ({
    children,
    data,
    onMouseMove,
    onMouseLeave,
    onClick,
  }: {
    children: ReactNode
    data: unknown[]
    onMouseMove: (s: ChartState) => void
    onMouseLeave: () => void
    onClick: (s: ChartState) => void
  }) => (
    <div data-testid="chart" data-count={data.length}>
      <button
        data-testid="move-1"
        onClick={() => onMouseMove({ activeTooltipIndex: '1' })}
      />
      <button
        data-testid="move-none"
        onClick={() => onMouseMove({ activeTooltipIndex: null })}
      />
      <button
        data-testid="move-oob"
        onClick={() => onMouseMove({ activeTooltipIndex: 99 })}
      />
      <button data-testid="leave" onClick={onMouseLeave} />
      <button
        data-testid="click-1"
        onClick={() => onClick({ activeTooltipIndex: 1 })}
      />
      <button data-testid="click-none" onClick={() => onClick({})} />
      {children}
    </div>
  ),
  ReferenceArea: ({ x1, x2 }: { x1: number; x2: number }) => (
    <div data-testid="reference-area" data-x1={x1} data-x2={x2} />
  ),
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}))

const points: GpxPoint[] = [
  { lat: 42, lon: 0, ele: 100, time: null },
  { lat: 42.001, lon: 0, ele: null, time: null },
  { lat: 42.002, lon: 0, ele: 120, time: null },
]

function renderProfile(props: Partial<ElevationProfileProps> = {}) {
  const callbacks = { onHover: vi.fn(), onSelect: vi.fn() }
  renderApp(
    <ElevationProfile
      points={points}
      selection={null}
      {...callbacks}
      {...props}
    />,
  )
  return callbacks
}

describe('ElevationProfile', () => {
  it('says so when there is no elevation', () => {
    renderProfile({ points: [{ lat: 1, lon: 1, ele: null, time: null }] })
    expect(screen.getByText('tracks.profile.empty')).toBeInTheDocument()
  })

  it('charts the points with elevation', () => {
    renderProfile()
    expect(screen.getByTestId('chart')).toHaveAttribute('data-count', '2')
    expect(screen.queryByTestId('reference-area')).not.toBeInTheDocument()
  })

  it('reports the hovered track point and clears on leave', () => {
    const { onHover } = renderProfile()
    fireEvent.click(screen.getByTestId('move-1'))
    // Sample 1 is track point 2 (point 1 has no elevation).
    expect(onHover).toHaveBeenLastCalledWith(2)
    fireEvent.click(screen.getByTestId('move-none'))
    expect(onHover).toHaveBeenLastCalledWith(null)
    fireEvent.click(screen.getByTestId('move-oob'))
    expect(onHover).toHaveBeenLastCalledWith(null)
    fireEvent.click(screen.getByTestId('leave'))
    expect(onHover).toHaveBeenLastCalledWith(null)
  })

  it('selects the clicked track point', () => {
    const { onSelect } = renderProfile()
    fireEvent.click(screen.getByTestId('click-none'))
    expect(onSelect).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('click-1'))
    expect(onSelect).toHaveBeenCalledWith(2)
  })

  it('highlights a selected range only', () => {
    renderProfile({ selection: { from: 2, to: 0 } })
    const area = screen.getByTestId('reference-area')
    expect(area).toHaveAttribute('data-x1', '0')
    expect(Number(area.dataset.x2)).toBeCloseTo(0.222, 2)
  })

  it('does not highlight a single point', () => {
    renderProfile({ selection: { from: 1, to: 1 } })
    expect(screen.queryByTestId('reference-area')).not.toBeInTheDocument()
  })
})
