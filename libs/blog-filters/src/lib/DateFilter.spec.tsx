import { fireEvent, screen } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { renderWithTheme } from '@sdlgr/test-utils'

import { DateFilter } from './DateFilter'

const mockPush = jest.fn()

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const dates = [
  { year: 2024, months: [1, 3, 6] },
  { year: 2023, months: [11, 12] },
]

describe('DateFilter', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(usePathname as jest.Mock).mockReturnValue('/en/blog')
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
  })

  it('returns null when dates is empty', () => {
    renderWithTheme(
      <DateFilter
        dates={[]}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
      />,
    )
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders year chips', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
      />,
    )
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        label="Date"
        monthNames={MONTH_NAMES}
      />,
    )
    expect(screen.getByText('Date')).toBeInTheDocument()
  })

  it('clicking a year sets the year param', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
      />,
    )
    fireEvent.click(screen.getByText('2024'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?year=2024')
  })

  it('clicking an active year clears year and month params', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('year=2024&month=3'),
    )
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={3}
        monthNames={MONTH_NAMES}
      />,
    )
    fireEvent.click(screen.getByText('2024'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?')
  })

  it('clicking a different year sets new year and clears month', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('year=2023&month=11'),
    )
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2023}
        activeMonth={11}
        monthNames={MONTH_NAMES}
      />,
    )
    fireEvent.click(screen.getByText('2024'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?year=2024')
  })

  it('marks active year with aria-current', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={null}
        monthNames={MONTH_NAMES}
      />,
    )
    expect(screen.getByText('2024')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('2023')).not.toHaveAttribute('aria-current')
  })

  it('shows month chips when a year is active', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={null}
        monthNames={MONTH_NAMES}
      />,
    )
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Mar')).toBeInTheDocument()
    expect(screen.getByText('Jun')).toBeInTheDocument()
  })

  it('does not show month chips when no year active', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
      />,
    )
    expect(screen.queryByText('Jan')).not.toBeInTheDocument()
  })

  it('clicking a month sets the month param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('year=2024'),
    )
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={null}
        monthNames={MONTH_NAMES}
      />,
    )
    fireEvent.click(screen.getByText('Mar'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?year=2024&month=3')
  })

  it('clicking an active month clears the month param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('year=2024&month=3'),
    )
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={3}
        monthNames={MONTH_NAMES}
      />,
    )
    fireEvent.click(screen.getByText('Mar'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?year=2024')
  })

  it('marks active month with aria-current', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={3}
        monthNames={MONTH_NAMES}
      />,
    )
    expect(screen.getByText('Mar')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Jan')).not.toHaveAttribute('aria-current')
  })

  it('clears page param on year selection', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('page=2'),
    )
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
      />,
    )
    fireEvent.click(screen.getByText('2024'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?year=2024')
  })

  it('clears page param on month selection', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('year=2024&page=2'),
    )
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={null}
        monthNames={MONTH_NAMES}
      />,
    )
    fireEvent.click(screen.getByText('Jun'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?year=2024&month=6')
  })
})
