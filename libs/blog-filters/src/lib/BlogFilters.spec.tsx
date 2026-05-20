import { fireEvent, screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { BlogFilters } from './BlogFilters'

jest.mock('./SearchInput', () => ({
  SearchInput: ({
    placeholder,
    initialValue,
  }: {
    placeholder?: string
    initialValue?: string
  }) => (
    <div
      data-testid="search-input-mock"
      data-placeholder={placeholder}
      data-initial={initialValue}
    />
  ),
}))

jest.mock('./CategoryFilter', () => ({
  CategoryFilter: ({
    isOpen,
    onToggle,
    label,
    applyLabel,
  }: {
    isOpen: boolean
    onToggle: () => void
    label?: string
    applyLabel?: string
  }) => (
    <div
      data-testid="category-filter-mock"
      data-open={String(isOpen)}
      data-label={label}
      data-apply={applyLabel}
      onClick={onToggle}
    />
  ),
}))

jest.mock('./TagFilter', () => ({
  TagFilter: ({
    isOpen,
    onToggle,
    label,
    applyLabel,
    tagSearchPlaceholder,
  }: {
    isOpen: boolean
    onToggle: () => void
    label?: string
    applyLabel?: string
    tagSearchPlaceholder?: string
  }) => (
    <div
      data-testid="tag-filter-mock"
      data-open={String(isOpen)}
      data-label={label}
      data-apply={applyLabel}
      data-tag-search={tagSearchPlaceholder}
      onClick={onToggle}
    />
  ),
}))

jest.mock('./DateFilter', () => ({
  DateFilter: ({
    isOpen,
    onToggle,
    label,
  }: {
    isOpen: boolean
    onToggle: () => void
    label?: string
  }) => (
    <div
      data-testid="date-filter-mock"
      data-open={String(isOpen)}
      data-label={label}
      onClick={onToggle}
    />
  ),
}))

jest.mock('./ActiveFilters', () => ({
  ActiveFilters: ({ clearAllLabel }: { clearAllLabel?: string }) => (
    <div data-testid="active-filters-mock" data-clear-all={clearAllLabel} />
  ),
}))

const defaultProps = {
  categories: [],
  activeCategories: [],
  tags: [],
  activeTags: [],
  dates: [],
  activeYear: null,
  activeMonth: null,
  monthNames: [
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
  ],
}

describe('BlogFilters', () => {
  it('renders all sub-filters', () => {
    renderWithTheme(<BlogFilters {...defaultProps} />)
    expect(screen.getByTestId('search-input-mock')).toBeInTheDocument()
    expect(screen.getByTestId('category-filter-mock')).toBeInTheDocument()
    expect(screen.getByTestId('tag-filter-mock')).toBeInTheDocument()
    expect(screen.getByTestId('date-filter-mock')).toBeInTheDocument()
  })

  it('all filters start closed', () => {
    renderWithTheme(<BlogFilters {...defaultProps} />)
    expect(screen.getByTestId('category-filter-mock')).toHaveAttribute(
      'data-open',
      'false',
    )
    expect(screen.getByTestId('tag-filter-mock')).toHaveAttribute(
      'data-open',
      'false',
    )
    expect(screen.getByTestId('date-filter-mock')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('clicking category filter opens it', () => {
    renderWithTheme(<BlogFilters {...defaultProps} />)
    fireEvent.click(screen.getByTestId('category-filter-mock'))
    expect(screen.getByTestId('category-filter-mock')).toHaveAttribute(
      'data-open',
      'true',
    )
  })

  it('clicking open category filter closes it', () => {
    renderWithTheme(<BlogFilters {...defaultProps} />)
    fireEvent.click(screen.getByTestId('category-filter-mock'))
    fireEvent.click(screen.getByTestId('category-filter-mock'))
    expect(screen.getByTestId('category-filter-mock')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('clicking date filter opens it', () => {
    renderWithTheme(<BlogFilters {...defaultProps} />)
    fireEvent.click(screen.getByTestId('date-filter-mock'))
    expect(screen.getByTestId('date-filter-mock')).toHaveAttribute(
      'data-open',
      'true',
    )
  })

  it('clicking open date filter closes it', () => {
    renderWithTheme(<BlogFilters {...defaultProps} />)
    fireEvent.click(screen.getByTestId('date-filter-mock'))
    fireEvent.click(screen.getByTestId('date-filter-mock'))
    expect(screen.getByTestId('date-filter-mock')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('opening one filter closes the previously open filter', () => {
    renderWithTheme(<BlogFilters {...defaultProps} />)
    fireEvent.click(screen.getByTestId('category-filter-mock'))
    expect(screen.getByTestId('category-filter-mock')).toHaveAttribute(
      'data-open',
      'true',
    )
    fireEvent.click(screen.getByTestId('tag-filter-mock'))
    expect(screen.getByTestId('category-filter-mock')).toHaveAttribute(
      'data-open',
      'false',
    )
    expect(screen.getByTestId('tag-filter-mock')).toHaveAttribute(
      'data-open',
      'true',
    )
  })

  it('mousedown inside filter row does not close open filter', () => {
    renderWithTheme(<BlogFilters {...defaultProps} />)
    fireEvent.click(screen.getByTestId('category-filter-mock'))
    fireEvent.mouseDown(screen.getByTestId('category-filter-mock'))
    expect(screen.getByTestId('category-filter-mock')).toHaveAttribute(
      'data-open',
      'true',
    )
  })

  it('outside mousedown closes open filter', () => {
    renderWithTheme(<BlogFilters {...defaultProps} />)
    fireEvent.click(screen.getByTestId('category-filter-mock'))
    expect(screen.getByTestId('category-filter-mock')).toHaveAttribute(
      'data-open',
      'true',
    )
    fireEvent.mouseDown(document.body)
    expect(screen.getByTestId('category-filter-mock')).toHaveAttribute(
      'data-open',
      'false',
    )
  })

  it('passes searchPlaceholder and initialQ to SearchInput', () => {
    renderWithTheme(
      <BlogFilters
        {...defaultProps}
        searchPlaceholder="Search..."
        initialQ="react"
      />,
    )
    const input = screen.getByTestId('search-input-mock')
    expect(input).toHaveAttribute('data-placeholder', 'Search...')
    expect(input).toHaveAttribute('data-initial', 'react')
  })

  it('passes categoriesLabel to CategoryFilter', () => {
    renderWithTheme(
      <BlogFilters {...defaultProps} categoriesLabel="Categories" />,
    )
    expect(screen.getByTestId('category-filter-mock')).toHaveAttribute(
      'data-label',
      'Categories',
    )
  })

  it('passes tagsLabel to TagFilter', () => {
    renderWithTheme(<BlogFilters {...defaultProps} tagsLabel="Tags" />)
    expect(screen.getByTestId('tag-filter-mock')).toHaveAttribute(
      'data-label',
      'Tags',
    )
  })

  it('passes dateLabel to DateFilter', () => {
    renderWithTheme(<BlogFilters {...defaultProps} dateLabel="Date" />)
    expect(screen.getByTestId('date-filter-mock')).toHaveAttribute(
      'data-label',
      'Date',
    )
  })

  it('removes outside click listener on unmount', () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener')
    const { unmount } = renderWithTheme(<BlogFilters {...defaultProps} />)
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('passes applyLabel to CategoryFilter and TagFilter', () => {
    renderWithTheme(<BlogFilters {...defaultProps} applyLabel="Apply" />)
    expect(screen.getByTestId('category-filter-mock')).toHaveAttribute(
      'data-apply',
      'Apply',
    )
    expect(screen.getByTestId('tag-filter-mock')).toHaveAttribute(
      'data-apply',
      'Apply',
    )
  })

  it('passes tagSearchPlaceholder to TagFilter', () => {
    renderWithTheme(
      <BlogFilters {...defaultProps} tagSearchPlaceholder="Search tags..." />,
    )
    expect(screen.getByTestId('tag-filter-mock')).toHaveAttribute(
      'data-tag-search',
      'Search tags...',
    )
  })

  it('renders ActiveFilters and passes clearAllLabel', () => {
    renderWithTheme(<BlogFilters {...defaultProps} clearAllLabel="Clear all" />)
    expect(screen.getByTestId('active-filters-mock')).toBeInTheDocument()
    expect(screen.getByTestId('active-filters-mock')).toHaveAttribute(
      'data-clear-all',
      'Clear all',
    )
  })
})
