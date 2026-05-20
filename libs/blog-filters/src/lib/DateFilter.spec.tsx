import { fireEvent, screen } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { renderWithTheme } from '@sdlgr/test-utils'

import { DateFilter } from './DateFilter'

const mockReplace = jest.fn()
const mockOnToggle = jest.fn()

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
  {
    year: 2024,
    count: 3,
    months: [
      { month: 1, count: 1 },
      { month: 3, count: 1 },
      { month: 6, count: 1 },
    ],
  },
  {
    year: 2023,
    count: 2,
    months: [
      { month: 11, count: 1 },
      { month: 12, count: 1 },
    ],
  },
]

describe('DateFilter', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ replace: mockReplace })
    ;(usePathname as jest.Mock).mockReturnValue('/en/blog')
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
    mockOnToggle.mockClear()
    mockReplace.mockClear()
  })

  it('returns null when dates is empty', () => {
    renderWithTheme(
      <DateFilter
        dates={[]}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders the dropdown button when dates non-empty', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        label="Date"
        monthNames={MONTH_NAMES}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toBeInTheDocument()
  })

  it('button shows label when no active year', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        label="Date"
        monthNames={MONTH_NAMES}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveTextContent('Date')
  })

  it('button shows year when active year but no active month', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={null}
        label="Date"
        monthNames={MONTH_NAMES}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveTextContent('2024')
  })

  it('button shows year and month when both active', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={3}
        label="Date"
        monthNames={MONTH_NAMES}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveTextContent('2024 › Mar')
  })

  it('calls onToggle when button is clicked', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.click(screen.getByTestId('filter-trigger'))
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('sets aria-expanded=true when open', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('sets aria-expanded=false when closed', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('does not show year chips when closed', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.queryByText('2024')).not.toBeInTheDocument()
  })

  it('renders year chips when open', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByText('2024 (3)')).toBeInTheDocument()
    expect(screen.getByText('2023 (2)')).toBeInTheDocument()
  })

  it('clicking a year sets the year param', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.click(screen.getByText('2024 (3)'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?year=2024', {
      scroll: false,
    })
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
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.click(screen.getByText('2024 (3)'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?', { scroll: false })
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
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.click(screen.getByText('2024 (3)'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?year=2024', {
      scroll: false,
    })
  })

  it('marks active year with aria-current', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={null}
        monthNames={MONTH_NAMES}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByText('2024 (3)')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('2023 (2)')).not.toHaveAttribute('aria-current')
  })

  it('shows month chips when a year is active', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={null}
        monthNames={MONTH_NAMES}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByText('Jan (1)')).toBeInTheDocument()
    expect(screen.getByText('Mar (1)')).toBeInTheDocument()
    expect(screen.getByText('Jun (1)')).toBeInTheDocument()
  })

  it('does not show month chips when no year active', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={null}
        activeMonth={null}
        monthNames={MONTH_NAMES}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.queryByText('Jan (1)')).not.toBeInTheDocument()
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
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.click(screen.getByText('Mar (1)'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?year=2024&month=3', {
      scroll: false,
    })
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
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.click(screen.getByText('Mar (1)'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?year=2024', {
      scroll: false,
    })
  })

  it('marks active month with aria-current', () => {
    renderWithTheme(
      <DateFilter
        dates={dates}
        activeYear={2024}
        activeMonth={3}
        monthNames={MONTH_NAMES}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByText('Mar (1)')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Jan (1)')).not.toHaveAttribute('aria-current')
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
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.click(screen.getByText('2024 (3)'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?year=2024', {
      scroll: false,
    })
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
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.click(screen.getByText('Jun (1)'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?year=2024&month=6', {
      scroll: false,
    })
  })
})
