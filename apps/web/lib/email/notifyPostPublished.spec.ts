/**
 * @jest-environment node
 */
const mockGetPostTranslations = jest.fn()
const mockSendNewPostNotifications = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPostTranslations: mockGetPostTranslations,
}))
jest.mock('@web/lib/email/sendNewPostNotifications', () => ({
  sendNewPostNotifications: mockSendNewPostNotifications,
}))
jest.mock('@web/lib/logger', () => ({
  logger: { error: mockLoggerError },
}))

const { notifyPostPublished } = require('./notifyPostPublished') as {
  notifyPostPublished: (
    post: {
      id: string
      postNumber: number
      coverImage: string | null
      category: string
      tags: string[]
      seriesId: string | null
      seriesOrder: number | null
    },
    logContext: string,
  ) => Promise<void>
}

const mockPost = {
  id: 'post-1',
  postNumber: 5,
  coverImage: null,
  category: 'engineering',
  tags: ['react'],
  seriesId: null,
  seriesOrder: null,
}

describe('notifyPostPublished', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetPostTranslations.mockResolvedValue([])
    mockSendNewPostNotifications.mockResolvedValue(undefined)
  })

  it('calls sendNewPostNotifications with built translations', async () => {
    mockGetPostTranslations.mockResolvedValue([
      { locale: 'en', title: 'My Post', slug: 'my-post', excerpt: 'Excerpt' },
      { locale: 'es', title: 'Mi Post', slug: 'mi-post', excerpt: 'Resumen' },
    ])
    await notifyPostPublished(mockPost, 'test-context')
    expect(mockSendNewPostNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        postId: 'post-1',
        postNumber: 5,
        translations: {
          en: { title: 'My Post', slug: 'my-post', excerpt: 'Excerpt' },
          es: { title: 'Mi Post', slug: 'mi-post', excerpt: 'Resumen' },
        },
      }),
    )
  })

  it('passes all post fields to sendNewPostNotifications', async () => {
    const postWithData = {
      id: 'post-2',
      postNumber: 10,
      coverImage: 'cover.jpg',
      category: 'travel',
      tags: ['adventure', 'hiking'],
      seriesId: 'series-1',
      seriesOrder: 3,
    }
    await notifyPostPublished(postWithData, 'test-context')
    expect(mockSendNewPostNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        postId: 'post-2',
        postNumber: 10,
        coverImage: 'cover.jpg',
        category: 'travel',
        tags: ['adventure', 'hiking'],
        seriesId: 'series-1',
        seriesOrder: 3,
      }),
    )
  })

  it('logs error when sendNewPostNotifications rejects', async () => {
    const err = new Error('Notification failed')
    mockSendNewPostNotifications.mockRejectedValue(err)
    await notifyPostPublished(mockPost, 'test-context')
    expect(mockLoggerError).toHaveBeenCalledWith(err, 'test-context')
  })

  it('logs error when getPostTranslations throws', async () => {
    const err = new Error('DB error')
    mockGetPostTranslations.mockRejectedValue(err)
    await notifyPostPublished(mockPost, 'test-context')
    expect(mockLoggerError).toHaveBeenCalledWith(err, 'test-context')
  })

  it('does not throw when getPostTranslations throws', async () => {
    mockGetPostTranslations.mockRejectedValue(new Error('DB error'))
    await expect(
      notifyPostPublished(mockPost, 'test-context'),
    ).resolves.toBeUndefined()
  })

  it('calls sendNewPostNotifications even with empty translations', async () => {
    mockGetPostTranslations.mockResolvedValue([])
    await notifyPostPublished(mockPost, 'test-context')
    expect(mockSendNewPostNotifications).toHaveBeenCalledWith(
      expect.objectContaining({ translations: {} }),
    )
  })
})
