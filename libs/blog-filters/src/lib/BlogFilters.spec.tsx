import { screen } from '@testing-library/react'

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
    allLabel,
    label,
  }: {
    allLabel: string
    label?: string
  }) => (
    <div
      data-testid="category-filter-mock"
      data-all={allLabel}
      data-label={label}
    />
  ),
}))

jest.mock('./TagFilter', () => ({
  TagFilter: ({ allLabel, label }: { allLabel: string; label?: string }) => (
    <div data-testid="tag-filter-mock" data-all={allLabel} data-label={label} />
  ),
}))

jest.mock('./DateFilter', () => ({
  DateFilter: ({ label }: { label?: string }) => (
    <div data-testid="date-filter-mock" data-label={label} />
  ),
}))

const defaultProps = {
  categories: [],
  activeCategories: [],
  allCategoriesLabel: 'All categories',
  tags: [],
  activeTags: [],
  allTagsLabel: 'All tags',
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

  it('renders filterByLabel when provided', () => {
    renderWithTheme(<BlogFilters {...defaultProps} filterByLabel="Filter by" />)
    expect(screen.getByText('Filter by')).toBeInTheDocument()
  })

  it('does not render filterByLabel when not provided', () => {
    renderWithTheme(<BlogFilters {...defaultProps} />)
    expect(screen.queryByText('Filter by')).not.toBeInTheDocument()
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

  it('passes allCategoriesLabel and categoriesLabel to CategoryFilter', () => {
    renderWithTheme(
      <BlogFilters
        {...defaultProps}
        allCategoriesLabel="All"
        categoriesLabel="Categories"
      />,
    )
    const filter = screen.getByTestId('category-filter-mock')
    expect(filter).toHaveAttribute('data-all', 'All')
    expect(filter).toHaveAttribute('data-label', 'Categories')
  })

  it('passes allTagsLabel and tagsLabel to TagFilter', () => {
    renderWithTheme(
      <BlogFilters
        {...defaultProps}
        allTagsLabel="All tags"
        tagsLabel="Tags"
      />,
    )
    const filter = screen.getByTestId('tag-filter-mock')
    expect(filter).toHaveAttribute('data-all', 'All tags')
    expect(filter).toHaveAttribute('data-label', 'Tags')
  })

  it('passes dateLabel to DateFilter', () => {
    renderWithTheme(<BlogFilters {...defaultProps} dateLabel="Date" />)
    expect(screen.getByTestId('date-filter-mock')).toHaveAttribute(
      'data-label',
      'Date',
    )
  })
})
