import { render, screen } from '@testing-library/react'

import { PostEditor } from '../components/PostEditor'
import NewPostPage from './page.next'

const mockRequireAdminSession = jest.fn()
const mockGetCategoriesForAdmin = jest.fn()
const mockGetAllTagsAdmin = jest.fn()
const mockGetAllSeriesWithTranslations = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('@web/lib/db/queries/categories', () => ({
  getCategoriesForAdmin: (...args: unknown[]) =>
    mockGetCategoriesForAdmin(...args),
}))

jest.mock('@web/lib/db/queries/tags', () => ({
  getAllTagsAdmin: (...args: unknown[]) => mockGetAllTagsAdmin(...args),
}))

jest.mock('@web/lib/db/queries/series', () => ({
  getAllSeriesWithTranslations: (...args: unknown[]) =>
    mockGetAllSeriesWithTranslations(...args),
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
  {
    id: 2,
    slug: 'design',
    postCount: 2,
    publishedPostCount: 1,
    translations: [],
  },
]

describe('NewPostPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({
      user: { name: 'Saúl de León' },
    })
    mockGetCategoriesForAdmin.mockResolvedValue(mockCategories)
    mockGetAllTagsAdmin.mockResolvedValue(['react', 'typescript'])
    mockGetAllSeriesWithTranslations.mockResolvedValue([
      { id: 'my-series', translations: [] },
    ])
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

  it('passes author from session user name', async () => {
    const ui = await NewPostPage()
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({ author: 'Saúl de León' }),
      undefined,
    )
  })

  it('falls back to Admin when session user name is null', async () => {
    mockRequireAdminSession.mockResolvedValue({ user: { name: null } })
    const ui = await NewPostPage()
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({ author: 'Admin' }),
      undefined,
    )
  })

  it('falls back to Admin when session has no user', async () => {
    mockRequireAdminSession.mockResolvedValue(null)
    const ui = await NewPostPage()
    render(ui)
    expect(PostEditor).toHaveBeenCalledWith(
      expect.objectContaining({ author: 'Admin' }),
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

  it('throws when session check redirects', async () => {
    const err = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(err)
    await expect(NewPostPage()).rejects.toBe(err)
    expect(mockGetCategoriesForAdmin).not.toHaveBeenCalled()
  })
})

export {}
