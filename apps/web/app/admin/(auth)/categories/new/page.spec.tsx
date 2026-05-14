import { render, screen } from '@testing-library/react'

import { CategoryForm } from '../components/CategoryForm'
import NewCategoryPage from './page.next'

const mockRequireAdminSession = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn().mockResolvedValue({
    t: (key: string) => {
      const strings: Record<string, string> = {
        'categories.new.title': 'New Category',
        'categories.form.back': '← Back to categories',
      }
      return strings[key] ?? key
    },
  }),
}))

jest.mock('../components/CategoryForm', () => {
  const React = require('react')
  return {
    CategoryForm: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'category-form' }),
      ),
  }
})

describe('NewCategoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
