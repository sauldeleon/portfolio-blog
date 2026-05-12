import { render, screen } from '@testing-library/react'

import type { CategoryWithCount } from '@web/lib/db/queries/categories'

import { CategoriesPageView } from './components/CategoriesPageView'
import AdminCategoriesPage from './page.next'

const mockGetCategories = jest.fn()

jest.mock('@web/lib/db/queries/categories', () => ({
  getCategories: (...args: unknown[]) => mockGetCategories(...args),
}))

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn().mockResolvedValue({
    t: (key: string) => {
      const strings: Record<string, string> = {
        'categories.title': 'Categories',
      }
      return strings[key] ?? key
    },
  }),
}))

jest.mock('./components/CategoriesPageView', () => {
  const React = require('react')
  return {
    CategoriesPageView: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'categories-page-view' }),
      ),
  }
})

const mockCategories: CategoryWithCount[] = [
  { slug: 'engineering', name: 'Engineering', description: null, postCount: 3 },
]

describe('AdminCategoriesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCategories.mockResolvedValue(mockCategories)
  })

  it('renders CategoriesPageView with fetched categories', async () => {
    const ui = await AdminCategoriesPage()
    render(ui)
    expect(screen.getByTestId('categories-page-view')).toBeInTheDocument()
    expect(CategoriesPageView).toHaveBeenCalledWith(
      expect.objectContaining({ categories: mockCategories }),
      undefined,
    )
  })

  it('passes translated title to CategoriesPageView', async () => {
    const ui = await AdminCategoriesPage()
    render(ui)
    expect(CategoriesPageView).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Categories' }),
      undefined,
    )
  })
})
