import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CategoryWithCount } from '@web/lib/db/queries/categories'

import { CategoriesPageView } from './CategoriesPageView'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => key,
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ refresh: jest.fn() }),
}))

const mockCategories: CategoryWithCount[] = [
  { slug: 'engineering', name: 'Engineering', description: null, postCount: 3 },
]

describe('CategoriesPageView', () => {
  it('renders the page wrapper', () => {
    renderApp(
      <CategoriesPageView categories={mockCategories} title="Categories" />,
    )
    expect(screen.getByTestId('admin-categories-page')).toBeInTheDocument()
  })

  it('renders the heading', () => {
    renderApp(
      <CategoriesPageView categories={mockCategories} title="Categories" />,
    )
    expect(
      screen.getByRole('heading', { name: 'Categories' }),
    ).toBeInTheDocument()
  })

  it('renders the category table', () => {
    renderApp(
      <CategoriesPageView categories={mockCategories} title="Categories" />,
    )
    expect(screen.getByTestId('category-table')).toBeInTheDocument()
  })
})
