import { render, screen } from '@testing-library/react'

import type { CategoryForAdmin } from '@web/lib/db/queries/categories'

import { CategoriesPageView } from './components/CategoriesPageView'
import AdminCategoriesPage from './page.next'

const mockGetCategoriesForAdmin = jest.fn()
const mockRequireAdminSession = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('@web/lib/db/queries/categories', () => ({
  getCategoriesForAdmin: (...args: unknown[]) =>
    mockGetCategoriesForAdmin(...args),
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

describe('AdminCategoriesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCategoriesForAdmin.mockResolvedValue(mockCategories)
  })

  it('renders CategoriesPageView with fetched categories', async () => {
    const ui = await AdminCategoriesPage()
    render(ui)
    expect(screen.getByTestId('categories-page-view')).toBeInTheDocument()
    expect(CategoriesPageView).toHaveBeenCalledWith(
      expect.objectContaining({ categories: mockCategories }),
      undefined,
    )
    expect(mockRequireAdminSession).toHaveBeenCalledTimes(1)
  })

  it('passes translated title to CategoriesPageView', async () => {
    const ui = await AdminCategoriesPage()
    render(ui)
    expect(CategoriesPageView).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Categories' }),
      undefined,
    )
  })

  it('does not fetch categories when the admin session check redirects', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)

    await expect(AdminCategoriesPage()).rejects.toBe(redirectError)
    expect(mockGetCategoriesForAdmin).not.toHaveBeenCalled()
  })
})
