import { fireEvent, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import { renderApp } from '@sdlgr/test-utils'

import { ElevationChart } from './ElevationChart'

type ChartState = { activeTooltipIndex?: number | string | null }
const mockYAxis = vi.fn()

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AreaChart: ({
    children,
    onMouseMove,
    onMouseLeave,
    onClick,
  }: {
    children: ReactNode
    onMouseMove: (s: ChartState) => void
    onMouseLeave: () => void
    onClick: (s: ChartState) => void
  }) => (
    <div data-testid="area-chart">
      <button
        data-testid="move-1"
        onClick={() => onMouseMove({ activeTooltipIndex: '1' })}
      />
      <button data-testid="move-none" onClick={() => onMouseMove({})} />
      <button
        data-testid="move-oob"
        onClick={() => onMouseMove({ activeTooltipIndex: 9 })}
      />
      <button data-testid="leave" onClick={onMouseLeave} />
      <button
        data-testid="click-0"
        onClick={() => onClick({ activeTooltipIndex: 0 })}
      />
      <button
        data-testid="click-none"
        onClick={() => onClick({ activeTooltipIndex: null })}
      />
      {children}
    </div>
  ),
  ReferenceArea: ({ x1, x2 }: { x1: number; x2: number }) => (
    <div data-testid="highlight" data-x1={x1} data-x2={x2} />
  ),
  YAxis: (props: { domain: [number, number] }) => {
    mockYAxis(props)
    return null
  },
  Area: () => null,
  XAxis: () => null,
  Tooltip: () => null,
}))

const data = [
  { km: 0, ele: 1000 },
  { km: 1.5, ele: 1200 },
]

beforeEach(() => vi.clearAllMocks())

describe('ElevationChart', () => {
  it('renders nothing without data', () => {
    renderApp(<ElevationChart data={[]} color="red" />)
    expect(screen.queryByTestId('elevation-chart')).not.toBeInTheDocument()
  })

  it('pads the elevation axis around the data', () => {
    renderApp(<ElevationChart data={data} color="red" />)
    expect(screen.getByTestId('elevation-chart')).toBeInTheDocument()
    expect(mockYAxis.mock.calls[0][0].domain).toEqual([960, 1240])
    expect(screen.queryByTestId('elevation-label')).not.toBeInTheDocument()
  })

  it('shows a label and a custom test id', () => {
    renderApp(
      <ElevationChart
        data={data}
        color="red"
        label="Day 1"
        data-testid="profile"
      />,
    )
    expect(screen.getByTestId('profile')).toBeInTheDocument()
    expect(screen.getByTestId('elevation-label')).toHaveTextContent('Day 1')
  })

  it('reports the hovered sample and clears on leave', () => {
    const onHover = vi.fn()
    renderApp(<ElevationChart data={data} color="red" onHover={onHover} />)
    fireEvent.click(screen.getByTestId('move-1'))
    expect(onHover).toHaveBeenLastCalledWith(1)
    fireEvent.click(screen.getByTestId('move-none'))
    expect(onHover).toHaveBeenLastCalledWith(null)
    fireEvent.click(screen.getByTestId('move-oob'))
    expect(onHover).toHaveBeenLastCalledWith(null)
    fireEvent.click(screen.getByTestId('leave'))
    expect(onHover).toHaveBeenLastCalledWith(null)
  })

  it('reports clicked samples only', () => {
    const onSelect = vi.fn()
    renderApp(<ElevationChart data={data} color="red" onSelect={onSelect} />)
    fireEvent.click(screen.getByTestId('click-none'))
    expect(onSelect).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('click-0'))
    expect(onSelect).toHaveBeenCalledWith(0)
  })

  it('works without handlers', () => {
    renderApp(<ElevationChart data={data} color="red" />)
    fireEvent.click(screen.getByTestId('move-1'))
    fireEvent.click(screen.getByTestId('leave'))
    fireEvent.click(screen.getByTestId('click-0'))
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })

  it('highlights a non-empty range only', () => {
    const { rerender } = renderApp(
      <ElevationChart
        data={data}
        color="red"
        highlight={{ fromKm: 0.2, toKm: 1 }}
      />,
    )
    expect(screen.getByTestId('highlight')).toHaveAttribute('data-x2', '1')
    rerender(
      <ElevationChart
        data={data}
        color="red"
        highlight={{ fromKm: 1, toKm: 1 }}
      />,
    )
    expect(screen.queryByTestId('highlight')).not.toBeInTheDocument()
  })
})
