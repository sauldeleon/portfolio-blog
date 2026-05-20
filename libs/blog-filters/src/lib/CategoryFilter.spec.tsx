import { fireEvent, screen } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { renderWithTheme } from '@sdlgr/test-utils'

import { CategoryFilter } from './CategoryFilter'

const mockPush = jest.fn()

const categories = [
  { id: 1, slug: 'engineering', name: 'Engineering', description: null },
  { id: 2, slug: 'life', name: 'Life', description: null },
]

describe('CategoryFilter', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(usePathname as jest.Mock).mockReturnValue('/en/blog')
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
  })

  it('renders all-categories label', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        allLabel="All categories"
        label="Category"
      />,
    )
    expect(screen.getByText('All categories')).toBeInTheDocument()
  })

  it('renders all category names', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        allLabel="All"
      />,
    )
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Life')).toBeInTheDocument()
  })

  it('clicking a category chip adds it to URL categories param', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        allLabel="All"
      />,
    )
    fireEvent.click(screen.getByText('Engineering'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?categories=engineering')
  })

  it('clicking an active category chip removes it from URL', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('categories=engineering'),
    )
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={['engineering']}
        allLabel="All"
      />,
    )
    fireEvent.click(screen.getByText('Engineering'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?')
  })

  it('clicking a second category appends to existing selection', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('categories=engineering'),
    )
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={['engineering']}
        allLabel="All"
      />,
    )
    fireEvent.click(screen.getByText('Life'))
    expect(mockPush).toHaveBeenCalledWith(
      '/en/blog?categories=engineering%2Clife',
    )
  })

  it('clicking all chip removes categories param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('categories=engineering'),
    )
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={['engineering']}
        allLabel="All"
      />,
    )
    fireEvent.click(screen.getByText('All'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?')
  })

  it('marks active categories with aria-current', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={['engineering']}
        allLabel="All"
      />,
    )
    expect(screen.getByText('Engineering')).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByText('Life')).not.toHaveAttribute('aria-current')
  })

  it('marks all as active when no categories selected', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        allLabel="All"
      />,
    )
    expect(screen.getByText('All')).toHaveAttribute('aria-current', 'true')
  })

  it('clears page param when a category is toggled', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('page=3'),
    )
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategories={[]}
        allLabel="All"
      />,
    )
    fireEvent.click(screen.getByText('Engineering'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?categories=engineering')
  })

  it('renders only all-label when no categories', () => {
    renderWithTheme(
      <CategoryFilter categories={[]} activeCategories={[]} allLabel="All" />,
    )
    expect(screen.getByText('All')).toBeInTheDocument()
  })
})
