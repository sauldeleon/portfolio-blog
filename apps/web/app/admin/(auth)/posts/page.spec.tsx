import { render, screen } from '@testing-library/react'

import type { AdminPost } from '@web/lib/db/queries/posts'

import { PostsPageView } from './components/PostsPageView'
import AdminPostsPage from './page.next'

const mockGetAllPosts = jest.fn()
const mockRequireAdminSession = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('@web/lib/db/queries/posts', () => ({
  getAllPosts: (...args: unknown[]) => mockGetAllPosts(...args),
}))

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn().mockResolvedValue({
    t: (key: string) => {
      const strings: Record<string, string> = {
        'posts.title': 'Posts',
        'posts.newPost': 'New post',
      }
      return strings[key] ?? key
    },
  }),
}))

jest.mock('./components/PostsPageView', () => {
  const React = require('react')
  return {
    PostsPageView: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'posts-page-view' }),
      ),
  }
})

const mockPosts: AdminPost[] = [
  {
    id: '01JWTEST',
    category: 'engineering',
    tags: ['react'],
    status: 'draft',
    coverImage: null,
    seriesId: null,
    seriesOrder: null,
    scheduledAt: null,
    publishedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    previewToken: 'tok',
    titleEn: 'Test Post',
    slugEn: 'test-post',
    titleEs: 'Post de prueba',
    slugEs: 'post-de-prueba',
  },
]

describe('AdminPostsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
    mockGetAllPosts.mockResolvedValue(mockPosts)
  })

  it('renders PostsPageView with fetched posts', async () => {
    const ui = await AdminPostsPage()
    render(ui)
    expect(screen.getByTestId('posts-page-view')).toBeInTheDocument()
    expect(PostsPageView).toHaveBeenCalledWith(
      expect.objectContaining({ posts: mockPosts }),
      undefined,
    )
    expect(mockRequireAdminSession).toHaveBeenCalledTimes(1)
  })

  it('passes translated title to PostsPageView', async () => {
    const ui = await AdminPostsPage()
    render(ui)
    expect(PostsPageView).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Posts' }),
      undefined,
    )
  })

  it('does not fetch posts when the admin session check redirects', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)

    await expect(AdminPostsPage()).rejects.toBe(redirectError)
    expect(mockGetAllPosts).not.toHaveBeenCalled()
  })
})
