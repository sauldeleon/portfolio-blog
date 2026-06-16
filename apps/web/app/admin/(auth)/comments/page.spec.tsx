import { render, screen } from '@testing-library/react'

import type { CommentRecord } from '@web/lib/db/queries/comments'

import { CommentsPageView } from './components/CommentsPageView'
import AdminCommentsPage from './page.next'

const mockGetCommentsAdmin = jest.fn()
const mockRequireAdminSession = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('@web/lib/db/queries/comments', () => ({
  getCommentsAdmin: (...args: unknown[]) => mockGetCommentsAdmin(...args),
}))

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn().mockResolvedValue({
    t: (key: string) => {
      const strings: Record<string, string> = {
        'comments.title': 'Comments',
      }
      return strings[key] ?? key
    },
  }),
}))

jest.mock('./components/CommentsPageView', () => {
  const React = require('react')
  return {
    CommentsPageView: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'comments-page-view' }),
      ),
  }
})

const mockComments: CommentRecord[] = [
  {
    id: 'c1',
    postId: 'p1',
    parentId: null,
    username: 'tester',
    body: 'Great post!',
    status: 'pending',
    createdAt: new Date('2024-01-01'),
  },
]

describe('AdminCommentsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
    mockGetCommentsAdmin.mockResolvedValue(mockComments)
  })

  it('renders CommentsPageView with pending comments', async () => {
    const ui = await AdminCommentsPage()
    render(ui)
    expect(screen.getByTestId('comments-page-view')).toBeInTheDocument()
    expect(CommentsPageView).toHaveBeenCalledWith(
      expect.objectContaining({ initialComments: mockComments }),
      undefined,
    )
    expect(mockGetCommentsAdmin).toHaveBeenCalledWith({ status: 'pending' })
  })

  it('passes translated title to CommentsPageView', async () => {
    const ui = await AdminCommentsPage()
    render(ui)
    expect(CommentsPageView).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Comments' }),
      undefined,
    )
  })

  it('does not fetch comments when session check redirects', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)
    await expect(AdminCommentsPage()).rejects.toBe(redirectError)
    expect(mockGetCommentsAdmin).not.toHaveBeenCalled()
  })
})
