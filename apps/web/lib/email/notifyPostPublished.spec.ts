/**
 * @jest-environment node
 */
import axios, { AxiosError } from 'axios'

function makeAxiosError(status: number): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data: {},
    statusText: 'Error',
    headers: {},
    config: {} as never,
  })
}

let mockAxiosHead: jest.SpyInstance

const mockGetPostTranslations = jest.fn()
const mockSendNewPostNotifications = jest.fn()
const mockLoggerError = jest.fn()
const mockLoggerWarn = jest.fn()
const mockGetSiteUrl = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPostTranslations: mockGetPostTranslations,
}))
jest.mock('@web/lib/email/sendNewPostNotifications', () => ({
  sendNewPostNotifications: mockSendNewPostNotifications,
}))
jest.mock('@web/lib/logger', () => ({
  logger: { error: mockLoggerError, warn: mockLoggerWarn },
}))
jest.mock('@web/utils/url/generateUrl', () => ({
  getSiteUrl: mockGetSiteUrl,
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
    mockGetSiteUrl.mockReturnValue('https://sawl.dev')
    mockAxiosHead = jest.spyOn(axios, 'head').mockResolvedValue({})
    mockGetPostTranslations.mockResolvedValue([])
    mockSendNewPostNotifications.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
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

  describe('localhost guard', () => {
    it('skips notifications and warns when site URL is localhost', async () => {
      mockGetSiteUrl.mockReturnValue('http://localhost:4200')
      await notifyPostPublished(mockPost, 'test-context')
      expect(mockSendNewPostNotifications).not.toHaveBeenCalled()
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        expect.objectContaining({ logContext: 'test-context' }),
        expect.stringContaining('localhost'),
      )
    })

    it('does not call getPostTranslations on localhost', async () => {
      mockGetSiteUrl.mockReturnValue('http://localhost:3000')
      await notifyPostPublished(mockPost, 'test-context')
      expect(mockGetPostTranslations).not.toHaveBeenCalled()
    })
  })

  describe('page reachability check', () => {
    it('fetches en page URL with HEAD before sending', async () => {
      mockGetPostTranslations.mockResolvedValue([
        { locale: 'en', title: 'My Post', slug: 'my-post', excerpt: 'Excerpt' },
      ])
      await notifyPostPublished(mockPost, 'test-context')
      expect(mockAxiosHead).toHaveBeenCalledWith(
        'https://sawl.dev/en/blog/5/my-post',
      )
    })

    it('fetches es page URL with HEAD before sending', async () => {
      mockGetPostTranslations.mockResolvedValue([
        { locale: 'es', title: 'Mi Post', slug: 'mi-post', excerpt: 'Resumen' },
      ])
      await notifyPostPublished(mockPost, 'test-context')
      expect(mockAxiosHead).toHaveBeenCalledWith(
        'https://sawl.dev/es/blog/5/mi-post',
      )
    })

    it('sends notifications when both en and es pages return 200', async () => {
      mockGetPostTranslations.mockResolvedValue([
        { locale: 'en', title: 'My Post', slug: 'my-post', excerpt: 'Excerpt' },
        { locale: 'es', title: 'Mi Post', slug: 'mi-post', excerpt: 'Resumen' },
      ])
      await notifyPostPublished(mockPost, 'test-context')
      expect(mockSendNewPostNotifications).toHaveBeenCalled()
    })

    it('skips notifications when en page returns non-200', async () => {
      mockGetPostTranslations.mockResolvedValue([
        { locale: 'en', title: 'My Post', slug: 'my-post', excerpt: 'Excerpt' },
        { locale: 'es', title: 'Mi Post', slug: 'mi-post', excerpt: 'Resumen' },
      ])
      mockAxiosHead.mockImplementation((url: string) =>
        url.includes('/en/')
          ? Promise.reject(makeAxiosError(404))
          : Promise.resolve({}),
      )
      await notifyPostPublished(mockPost, 'test-context')
      expect(mockSendNewPostNotifications).not.toHaveBeenCalled()
    })

    it('skips notifications when es page returns non-200', async () => {
      mockGetPostTranslations.mockResolvedValue([
        { locale: 'en', title: 'My Post', slug: 'my-post', excerpt: 'Excerpt' },
        { locale: 'es', title: 'Mi Post', slug: 'mi-post', excerpt: 'Resumen' },
      ])
      mockAxiosHead.mockImplementation((url: string) =>
        url.includes('/es/')
          ? Promise.reject(makeAxiosError(500))
          : Promise.resolve({}),
      )
      await notifyPostPublished(mockPost, 'test-context')
      expect(mockSendNewPostNotifications).not.toHaveBeenCalled()
    })

    it('warns with URL and status when a page is not reachable', async () => {
      mockGetPostTranslations.mockResolvedValue([
        { locale: 'en', title: 'My Post', slug: 'my-post', excerpt: 'Excerpt' },
      ])
      mockAxiosHead.mockRejectedValue(makeAxiosError(404))
      await notifyPostPublished(mockPost, 'test-context')
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://sawl.dev/en/blog/5/my-post',
          status: 404,
          logContext: 'test-context',
        }),
        expect.stringContaining('not reachable'),
      )
    })

    it('logs error and skips notifications when fetch throws', async () => {
      mockGetPostTranslations.mockResolvedValue([
        { locale: 'en', title: 'My Post', slug: 'my-post', excerpt: 'Excerpt' },
      ])
      const fetchErr = new Error('Network error')
      mockAxiosHead.mockRejectedValue(fetchErr)
      await notifyPostPublished(mockPost, 'test-context')
      expect(mockLoggerError).toHaveBeenCalledWith(fetchErr, 'test-context')
      expect(mockSendNewPostNotifications).not.toHaveBeenCalled()
    })

    it('does not call the reachability check when translations are empty', async () => {
      mockGetPostTranslations.mockResolvedValue([])
      await notifyPostPublished(mockPost, 'test-context')
      expect(mockAxiosHead).not.toHaveBeenCalled()
    })
  })
})
