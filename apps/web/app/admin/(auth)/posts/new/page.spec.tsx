import { render, screen } from '@testing-library/react'

import { PostEditor } from '../components/PostEditor'
import NewPostPage from './page.next'

const mockRequireAdminSession = vi.fn()
const mockGetCategoriesForAdmin = vi.fn()
const mockGetAllTagsAdmin = vi.fn()
const mockGetAllSeriesWithTranslations = vi.fn()
const mockListUsers = vi.fn()

vi.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
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
  {
    id: 2,
    slug: 'design',
    postCount: 2,
    publishedPostCount: 1,
    translations: [],
  },
]

describe('NewPostPage', () => {
  const mockUsers = [
    {
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Saúl de León',
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
    mockGetCategoriesForAdmin.mockResolvedValue(mockCategories)
    mockGetAllTagsAdmin.mockResolvedValue(['react', 'typescript'])
    mockGetAllSeriesWithTranslations.mockResolvedValue([
      { id: 'my-series', translations: [] },
    ])
    mockListUsers.mockResolvedValue(mockUsers)
  })

  it('renders PostEditor', async () => {
    const ui = await NewPostPage()
    render(ui)
    expect(screen.getByTestId('post-editor')).toBeInTheDocument()
  })

  it('passes categories with EN name to PostEditor', async () => {
    const ui = await NewPostPage()
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: expect.arrayContaining([
          expect.objectContaining({ slug: 'engineering', name: 'Engineering' }),
        ]),
      }),
      undefined,
    )
  })

  it('falls back to slug when no translations exist', async () => {
    const ui = await NewPostPage()
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: expect.arrayContaining([
          expect.objectContaining({ slug: 'design', name: 'design' }),
        ]),
      }),
      undefined,
    )
  })

  it('passes users list to PostEditor', async () => {
    const ui = await NewPostPage()
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({ users: mockUsers }),
      undefined,
    )
  })

  it('uses first translation name as fallback when no EN translation', async () => {
    const categoriesEsOnly = [
      {
        id: 3,
        slug: 'tech',
        postCount: 0,
        publishedPostCount: 0,
        translations: [
          {
            categorySlug: 'tech',
            locale: 'es',
            name: 'Tecnología',
            description: null,
            slug: 'tecnologia',
          },
        ],
      },
    ]
    mockGetCategoriesForAdmin.mockResolvedValue(categoriesEsOnly)
    const ui = await NewPostPage()
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: [{ slug: 'tech', name: 'Tecnología' }],
      }),
      undefined,
    )
  })

  it('passes allTags and series to PostEditor', async () => {
    const ui = await NewPostPage()
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
    const ui = await NewPostPage()
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
    await expect(NewPostPage()).rejects.toBe(err)
    expect(mockGetCategoriesForAdmin).not.toHaveBeenCalled()
  })
})

export {}
