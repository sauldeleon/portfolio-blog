import { fireEvent, screen } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { renderWithTheme } from '@sdlgr/test-utils'

import { CategoryFilter } from './CategoryFilter'

const mockReplace = jest.fn()
const mockOnToggle = jest.fn()

const categories = [
  { id: 1, slug: 'engineering', name: 'Engineering', description: null },
  { id: 2, slug: 'life', name: 'Life', description: null },
]

describe('CategoryFilter', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ replace: mockReplace })
    ;(usePathname as jest.Mock).mockReturnValue('/en/blog')
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
    mockOnToggle.mockClear()
    mockReplace.mockClear()
  })

  it('renders the dropdown button with label', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        label="Category"
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveTextContent('Category')
  })

  it('shows active count in button label', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={['engineering', 'life']}
        label="Category"
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveTextContent(
      'Category (2)',
    )
  })

  it('does not show count when no active categories', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        label="Category"
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).not.toHaveTextContent('(')
  })

  it('calls onToggle when button is clicked', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.click(screen.getByTestId('filter-trigger'))
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('sets aria-expanded=true when open', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
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
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('does not render panel when closed', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.queryByText('Engineering')).not.toBeInTheDocument()
  })

  it('renders category chips in panel when open', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Life')).toBeInTheDocument()
  })

  it('apply button is disabled when no pending changes', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={['engineering']}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    expect(screen.getByText('Apply')).toBeDisabled()
  })

  it('apply button is enabled after toggling a chip', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    fireEvent.click(screen.getByText('Engineering'))
    expect(screen.getByText('Apply')).not.toBeDisabled()
  })

  it('deselecting all chips enables apply button', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={['engineering']}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    fireEvent.click(screen.getByText('Engineering'))
    expect(screen.getByText('Apply')).not.toBeDisabled()
  })

  it('clicking apply pushes URL with pending categories and calls onToggle', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={['engineering']}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    fireEvent.click(screen.getByText('Life'))
    fireEvent.click(screen.getByText('Apply'))
    expect(mockReplace).toHaveBeenCalledWith(
      '/en/blog?categories=engineering%2Clife',
      { scroll: false },
    )
    expect(mockOnToggle).toHaveBeenCalled()
  })

  it('clicking apply with no pending categories removes categories param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('categories=engineering'),
    )
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={['engineering']}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    fireEvent.click(screen.getByText('Engineering'))
    fireEvent.click(screen.getByText('Apply'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?', { scroll: false })
    expect(mockOnToggle).toHaveBeenCalled()
  })

  it('active chip shows aria-current', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={['engineering']}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByText('Engineering')).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByText('Life')).not.toHaveAttribute('aria-current')
  })

  it('clears page param on apply', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('page=3'),
    )
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    fireEvent.click(screen.getByText('Engineering'))
    fireEvent.click(screen.getByText('Apply'))
    expect(mockReplace).toHaveBeenCalledWith(
      '/en/blog?categories=engineering',
      {
        scroll: false,
      },
    )
  })

  it('renders empty panel when no categories', () => {
    renderWithTheme(
      <CategoryFilter
        categories={[]}
        activeCategories={[]}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })
})
