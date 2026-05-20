import { fireEvent, screen } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { renderWithTheme } from '@sdlgr/test-utils'

import { ActiveFilters } from './ActiveFilters'

const mockReplace = jest.fn()

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

const categories = [
  { id: 1, slug: 'engineering', name: 'Engineering', description: null },
  { id: 2, slug: 'life', name: 'Life', description: null },
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
]

const defaultProps = {
  activeCategories: [],
  categories,
  activeTags: [],
  activeYear: null,
  activeMonth: null,
  dates,
  monthNames: MONTH_NAMES,
  clearAllLabel: 'Clear all',
}

describe('ActiveFilters', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ replace: mockReplace })
    ;(usePathname as jest.Mock).mockReturnValue('/en/blog')
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
    mockReplace.mockClear()
  })

  it('returns null when no active filters', () => {
    renderWithTheme(<ActiveFilters {...defaultProps} />)
    expect(screen.queryByTestId('active-filters')).not.toBeInTheDocument()
  })

  it('renders row when a category is active', () => {
    renderWithTheme(
      <ActiveFilters {...defaultProps} activeCategories={['engineering']} />,
    )
    expect(screen.getByTestId('active-filters')).toBeInTheDocument()
  })

  it('renders row when a tag is active', () => {
    renderWithTheme(<ActiveFilters {...defaultProps} activeTags={['react']} />)
    expect(screen.getByTestId('active-filters')).toBeInTheDocument()
  })

  it('renders row when a year is active', () => {
    renderWithTheme(<ActiveFilters {...defaultProps} activeYear={2024} />)
    expect(screen.getByTestId('active-filters')).toBeInTheDocument()
  })

  it('shows category chip with name', () => {
    renderWithTheme(
      <ActiveFilters {...defaultProps} activeCategories={['engineering']} />,
    )
    expect(
      screen.getByTestId('remove-category-engineering'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('remove-category-engineering')).toHaveTextContent(
      'Engineering',
    )
  })

  it('falls back to slug when category not found', () => {
    renderWithTheme(
      <ActiveFilters {...defaultProps} activeCategories={['unknown-slug']} />,
    )
    expect(
      screen.getByTestId('remove-category-unknown-slug'),
    ).toHaveTextContent('unknown-slug')
  })

  it('shows tag chip', () => {
    renderWithTheme(<ActiveFilters {...defaultProps} activeTags={['react']} />)
    expect(screen.getByTestId('remove-tag-react')).toBeInTheDocument()
    expect(screen.getByTestId('remove-tag-react')).toHaveTextContent('react')
  })

  it('shows year-only date chip when no active month', () => {
    renderWithTheme(
      <ActiveFilters {...defaultProps} activeYear={2024} activeMonth={null} />,
    )
    expect(screen.getByTestId('remove-date')).toHaveTextContent('2024')
  })

  it('shows year and month date chip when both active', () => {
    renderWithTheme(
      <ActiveFilters {...defaultProps} activeYear={2024} activeMonth={3} />,
    )
    expect(screen.getByTestId('remove-date')).toHaveTextContent('2024 › Mar')
  })

  it('does not show date chip when activeYear is null', () => {
    renderWithTheme(
      <ActiveFilters
        {...defaultProps}
        activeCategories={['engineering']}
        activeYear={null}
      />,
    )
    expect(screen.queryByTestId('remove-date')).not.toBeInTheDocument()
  })

  it('shows clear all button', () => {
    renderWithTheme(
      <ActiveFilters {...defaultProps} activeCategories={['engineering']} />,
    )
    expect(screen.getByTestId('clear-all-filters')).toHaveTextContent(
      'Clear all',
    )
  })

  it('removing a category updates URL keeping others', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('categories=engineering%2Clife'),
    )
    renderWithTheme(
      <ActiveFilters
        {...defaultProps}
        activeCategories={['engineering', 'life']}
      />,
    )
    fireEvent.click(screen.getByTestId('remove-category-engineering'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?categories=life', {
      scroll: false,
    })
  })

  it('removing the only category deletes the param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('categories=engineering'),
    )
    renderWithTheme(
      <ActiveFilters {...defaultProps} activeCategories={['engineering']} />,
    )
    fireEvent.click(screen.getByTestId('remove-category-engineering'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?', { scroll: false })
  })

  it('removing a tag updates URL keeping others', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('tags=react%2Ctypescript'),
    )
    renderWithTheme(
      <ActiveFilters {...defaultProps} activeTags={['react', 'typescript']} />,
    )
    fireEvent.click(screen.getByTestId('remove-tag-react'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?tags=typescript', {
      scroll: false,
    })
  })

  it('removing the only tag deletes the param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('tags=react'),
    )
    renderWithTheme(<ActiveFilters {...defaultProps} activeTags={['react']} />)
    fireEvent.click(screen.getByTestId('remove-tag-react'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?', { scroll: false })
  })

  it('clicking date chip clears year and month', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('year=2024&month=3'),
    )
    renderWithTheme(
      <ActiveFilters {...defaultProps} activeYear={2024} activeMonth={3} />,
    )
    fireEvent.click(screen.getByTestId('remove-date'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?', { scroll: false })
  })

  it('clear all removes categories, tags, year, month but not q', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams(
        'categories=engineering&tags=react&year=2024&month=3&q=hello',
      ),
    )
    renderWithTheme(
      <ActiveFilters
        {...defaultProps}
        activeCategories={['engineering']}
        activeTags={['react']}
        activeYear={2024}
        activeMonth={3}
      />,
    )
    fireEvent.click(screen.getByTestId('clear-all-filters'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?q=hello', {
      scroll: false,
    })
  })

  it('clear all also removes page param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('categories=engineering&page=2'),
    )
    renderWithTheme(
      <ActiveFilters {...defaultProps} activeCategories={['engineering']} />,
    )
    fireEvent.click(screen.getByTestId('clear-all-filters'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?', { scroll: false })
  })

  it('removing category also clears page param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('categories=engineering&page=3'),
    )
    renderWithTheme(
      <ActiveFilters {...defaultProps} activeCategories={['engineering']} />,
    )
    fireEvent.click(screen.getByTestId('remove-category-engineering'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?', { scroll: false })
  })

  it('removing tag also clears page param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('tags=react&page=2'),
    )
    renderWithTheme(<ActiveFilters {...defaultProps} activeTags={['react']} />)
    fireEvent.click(screen.getByTestId('remove-tag-react'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?', { scroll: false })
  })

  it('removing date also clears page param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('year=2024&page=2'),
    )
    renderWithTheme(<ActiveFilters {...defaultProps} activeYear={2024} />)
    fireEvent.click(screen.getByTestId('remove-date'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?', { scroll: false })
  })
})
