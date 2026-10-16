import { render, screen } from '@testing-library/react'

import { PostEditor } from '../components/PostEditor'
import EditPostPage from './page.next'

const mockRequireAdminSession = vi.fn()
const mockGetPostForEdit = vi.fn()
const mockGetCategoriesForAdmin = vi.fn()
const mockGetAllTagsAdmin = vi.fn()
const mockGetAllSeriesWithTranslations = vi.fn()
const mockListUsers = vi.fn()
const mockNotFound = vi.fn()

vi.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

vi.mock('@web/lib/db/queries/posts', () => ({
  getPostForEdit: (...args: unknown[]) => mockGetPostForEdit(...args),
}))

vi.mock('@web/lib/db/queries/categories', () => ({
  getCategoriesForAdmin: (...args: unknown[]) =>
    mockGetCategoriesForAdmin(...args),
}))

vi.mock('@web/lib/db/queries/tags', () => ({
  getAllTagsAdmin: (...args: unknown[]) => mockGetAllTagsAdmin(...args),
}))

vi.mock('@web/lib/db/queries/series', () => ({
  getAllSeriesWithTranslations: (...args: unknown[]) =>
    mockGetAllSeriesWithTranslations(...args),
}))

vi.mock('@web/lib/db/queries/users', () => ({
  listUsers: (...args: unknown[]) => mockListUsers(...args),
}))

vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}))

vi.mock('../components/PostEditor', async () => {
  const React = await import('react')
  return {
    PostEditor: vi
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
    coverImageFit: null as null,
    seriesId: null,
    seriesOrder: null,
    authorId: 'user-1',
    commentsEnabled: true,
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
  const mockUsers = [
    {
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin' as const,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({
      user: { name: 'Saúl de León', id: 'user-1', role: 'admin' },
    })
    mockGetPostForEdit.mockResolvedValue(mockPostData)
    mockGetCategoriesForAdmin.mockResolvedValue(mockCategories)
    mockGetAllTagsAdmin.mockResolvedValue(['react', 'typescript'])
    mockGetAllSeriesWithTranslations.mockResolvedValue([
      { id: 'my-series', translations: [] },
    ])
    mockListUsers.mockResolvedValue(mockUsers)
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

  it('passes users list to PostEditor', async () => {
    const ui = await EditPostPage({
      params: Promise.resolve({ id: 'post123' }),
    })
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({ users: mockUsers }),
      undefined,
    )
  })

  it('calls notFound when post not found', async () => {
    mockGetPostForEdit.mockResolvedValue(null)
    await EditPostPage({ params: Promise.resolve({ id: 'unknown' }) })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
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

  it('passes allTags and series to PostEditor', async () => {
    const ui = await EditPostPage({
      params: Promise.resolve({ id: 'post123' }),
    })
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        allTags: ['react', 'typescript'],
        series: [{ id: 'my-series', translations: [] }],
      }),
      undefined,
    )
  })

  it('passes currentUserId and currentUserRole to PostEditor', async () => {
    const ui = await EditPostPage({
      params: Promise.resolve({ id: 'post123' }),
    })
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        currentUserId: 'user-1',
        currentUserRole: 'admin',
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
