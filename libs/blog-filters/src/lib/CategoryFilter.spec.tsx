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
        activeCategory={null}
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
        activeCategory={null}
        allLabel="All"
      />,
    )
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Life')).toBeInTheDocument()
  })

  it('clicking a category chip pushes URL with category param', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategory={null}
        allLabel="All"
      />,
    )
    fireEvent.click(screen.getByText('Engineering'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?category=engineering')
  })

  it('clicking all chip removes category param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('category=engineering'),
    )
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategory="engineering"
        allLabel="All"
      />,
    )
    fireEvent.click(screen.getByText('All'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?')
  })

  it('marks active category with aria-current', () => {
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategory="engineering"
        allLabel="All"
      />,
    )
    expect(screen.getByText('Engineering')).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('clears page param when a category is selected', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('page=3'),
    )
    renderWithTheme(
      <CategoryFilter
        categories={categories}
        activeCategory={null}
        allLabel="All"
      />,
    )
    fireEvent.click(screen.getByText('Engineering'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?category=engineering')
  })

  it('renders only all-label when no categories', () => {
    renderWithTheme(
      <CategoryFilter categories={[]} activeCategory={null} allLabel="All" />,
    )
    expect(screen.getByText('All')).toBeInTheDocument()
  })
})
