import { render, screen } from '@testing-library/react'

import type { AdminPost } from '@web/lib/db/queries/posts'

import { PostTable } from './PostTable'
import AdminPostsPage from './page.next'

const mockGetAllPosts = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getAllPosts: (...args: unknown[]) => mockGetAllPosts(...args),
}))

jest.mock('./PostTable', () => {
  const React = require('react')
  return {
    PostTable: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'post-table' }),
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
    mockGetAllPosts.mockResolvedValue(mockPosts)
  })

  it('renders PostTable with fetched posts', async () => {
    const ui = await AdminPostsPage()
    render(ui)
    expect(screen.getByTestId('admin-posts-page')).toBeInTheDocument()
    expect(screen.getByTestId('post-table')).toBeInTheDocument()
    expect(PostTable).toHaveBeenCalledWith(
      expect.objectContaining({ posts: mockPosts }),
      undefined,
    )
  })

  it('renders "New post" link', async () => {
    const ui = await AdminPostsPage()
    render(ui)
    const link = screen.getByRole('link', { name: 'New post' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/admin/posts/new')
  })
})
