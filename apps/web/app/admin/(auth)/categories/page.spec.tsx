import { render, screen } from '@testing-library/react'

import type { CategoryForAdmin } from '@web/lib/db/queries/categories'

import { CategoriesPageView } from './components/CategoriesPageView'
import AdminCategoriesPage from './page.next'

const mockGetCategoriesForAdmin = vi.fn()
const mockRequireAdminSession = vi.fn()

vi.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

vi.mock('@web/lib/db/queries/categories', () => ({
  getCategoriesForAdmin: (...args: unknown[]) =>
    mockGetCategoriesForAdmin(...args),
}))

vi.mock('@web/i18n/server', () => ({
  getServerTranslation: vi.fn().mockResolvedValue({
    t: (key: string) => {
      const strings: Record<string, string> = {
        'categories.title': 'Categories',
      }
      return strings[key] ?? key
    },
  }),
}))

vi.mock('./components/CategoriesPageView', async () => {
  const React = await import('react')
  return {
    CategoriesPageView: vi
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
    vi.clearAllMocks()
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
