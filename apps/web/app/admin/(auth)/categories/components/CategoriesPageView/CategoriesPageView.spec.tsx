import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CategoryForAdmin } from '@web/lib/db/queries/categories'

import { CategoriesPageView } from './CategoriesPageView'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => key,
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ refresh: jest.fn() }),
}))

jest.mock('next/link', () => {
  const React = require('react')
  const MockLink = React.forwardRef(
    (
      { href, children, ...props }: { href: string; children: React.ReactNode },
      ref: React.Ref<HTMLAnchorElement>,
    ) => (
      <a ref={ref} href={href} {...props}>
        {children}
      </a>
    ),
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

const mockCategories: CategoryForAdmin[] = [
  {
    id: 1,
    slug: 'engineering',
    postCount: 3,
    publishedPostCount: 2,
    translations: [
      {
        categorySlug: 'engineering',
        locale: 'en',
        name: 'Engineering',
        description: null,
        slug: 'engineering',
      },
    ],
  },
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
