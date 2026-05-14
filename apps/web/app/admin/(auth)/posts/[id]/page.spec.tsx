import { render, screen } from '@testing-library/react'

import { PostEditor } from '../components/PostEditor'
import EditPostPage from './page.next'

const mockRequireAdminSession = jest.fn()
const mockGetPostForEdit = jest.fn()
const mockGetCategoriesForAdmin = jest.fn()
const mockNotFound = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('@web/lib/db/queries/posts', () => ({
  getPostForEdit: (...args: unknown[]) => mockGetPostForEdit(...args),
}))

jest.mock('@web/lib/db/queries/categories', () => ({
  getCategoriesForAdmin: (...args: unknown[]) =>
    mockGetCategoriesForAdmin(...args),
}))

jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}))

jest.mock('../components/PostEditor', () => {
  const React = require('react')
  return {
    PostEditor: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'post-editor' }),
      ),
  }
})

const mockCategories = [
  {
    id: 1,
    slug: 'engineering',
    postCount: 5,
    publishedPostCount: 3,
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

const mockPostData = {
  post: {
    id: 'post123',
    category: 'engineering',
    tags: ['react'],
    status: 'draft' as const,
    coverImage: null,
    seriesId: null,
    seriesOrder: null,
    author: 'Admin',
    scheduledAt: null,
    publishedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    previewToken: 'tok',
  },
  translations: [
    {
      postId: 'post123',
      locale: 'en' as const,
      title: 'My Post',
      slug: 'my-post',
      excerpt: 'An excerpt',
      content: '# Hello',
    },
  ],
}

describe('EditPostPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({
      user: { name: 'Saúl de León' },
    })
    mockGetPostForEdit.mockResolvedValue(mockPostData)
    mockGetCategoriesForAdmin.mockResolvedValue(mockCategories)
  })

  it('renders PostEditor with post data', async () => {
    const ui = await EditPostPage({
      params: Promise.resolve({ id: 'post123' }),
    })
    render(ui)
    expect(screen.getByTestId('post-editor')).toBeInTheDocument()
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        post: expect.objectContaining({
          post: expect.objectContaining({ id: 'post123' }),
        }),
      }),
      undefined,
    )
  })

  it('passes mapped categories to PostEditor', async () => {
    const ui = await EditPostPage({
      params: Promise.resolve({ id: 'post123' }),
    })
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: [{ slug: 'engineering', name: 'Engineering' }],
      }),
      undefined,
    )
  })

  it('passes author from session', async () => {
    const ui = await EditPostPage({
      params: Promise.resolve({ id: 'post123' }),
    })
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({ author: 'Saúl de León' }),
      undefined,
    )
  })

  it('calls notFound when post not found', async () => {
    mockGetPostForEdit.mockResolvedValue(null)
    await EditPostPage({ params: Promise.resolve({ id: 'unknown' }) })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('falls back to Admin when session has no user name', async () => {
    mockRequireAdminSession.mockResolvedValue({ user: { name: null } })
    const ui = await EditPostPage({
      params: Promise.resolve({ id: 'post123' }),
    })
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({ author: 'Admin' }),
      undefined,
    )
  })

  it('falls back to Admin when session is null', async () => {
    mockRequireAdminSession.mockResolvedValue(null)
    const ui = await EditPostPage({
      params: Promise.resolve({ id: 'post123' }),
    })
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({ author: 'Admin' }),
      undefined,
    )
  })

  it('maps translations correctly', async () => {
    const ui = await EditPostPage({
      params: Promise.resolve({ id: 'post123' }),
    })
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        post: expect.objectContaining({
          translations: [
            {
              locale: 'en',
              title: 'My Post',
              slug: 'my-post',
              excerpt: 'An excerpt',
              content: '# Hello',
            },
          ],
        }),
      }),
      undefined,
    )
  })

  it('falls back to slug when category has no translations', async () => {
    mockGetCategoriesForAdmin.mockResolvedValue([
      {
        id: 2,
        slug: 'design',
        postCount: 0,
        publishedPostCount: 0,
        translations: [],
      },
    ])
    const ui = await EditPostPage({
      params: Promise.resolve({ id: 'post123' }),
    })
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: [{ slug: 'design', name: 'design' }],
      }),
      undefined,
    )
  })

  it('throws when session check redirects', async () => {
    const err = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(err)
    await expect(
      EditPostPage({ params: Promise.resolve({ id: 'post123' }) }),
    ).rejects.toBe(err)
  })
})

export {}
