import { render, screen } from '@testing-library/react'

import { CategoryForm } from '../components/CategoryForm'
import NewCategoryPage from './page.next'

const mockRequireAdminSession = vi.fn()

vi.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

vi.mock('@web/i18n/server', () => ({
  getServerTranslation: vi.fn().mockResolvedValue({
    t: (key: string) => {
      const strings: Record<string, string> = {
        'categories.new.title': 'New Category',
        'categories.form.back': '← Back to categories',
      }
      return strings[key] ?? key
    },
  }),
}))

vi.mock('../components/CategoryForm', async () => {
  const React = await import('react')
  return {
    CategoryForm: vi
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'category-form' }),
      ),
  }
})

describe('NewCategoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
  })

  it('renders CategoryForm', async () => {
    const ui = await NewCategoryPage()
    render(ui)
    expect(screen.getByTestId('category-form')).toBeInTheDocument()
  })

  it('passes translated title and backLabel to CategoryForm', async () => {
    const ui = await NewCategoryPage()
    render(ui)
    expect(CategoryForm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Category',
        backLabel: '← Back to categories',
      }),
      undefined,
    )
  })

  it('does not render when session check redirects', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)
    await expect(NewCategoryPage()).rejects.toBe(redirectError)
  })
})

export {}
