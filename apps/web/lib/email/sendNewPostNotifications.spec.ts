/**
 * @jest-environment node
 */
const mockRender = jest.fn()
const mockResendSend = jest.fn()
const mockGetActiveSubscribers = jest.fn()
const mockGetSiteUrl = jest.fn(() => 'https://example.com')
const mockGetServerTranslation = jest.fn()
const mockLoggerError = jest.fn()
const mockNewPostEmail = jest.fn(() => null)
const mockGetSeriesTranslationsById = jest.fn()

jest.mock('@react-email/components', () => ({ render: mockRender }))
jest.mock('@web/utils/url/generateUrl', () => ({ getSiteUrl: mockGetSiteUrl }))
jest.mock('./resend', () => ({
  resend: { emails: { send: mockResendSend } },
}))
jest.mock('./templates/NewPostEmail', () => ({
  NewPostEmail: (...args: unknown[]) => mockNewPostEmail(...args),
}))
jest.mock('@web/lib/db/queries/subscriptions', () => ({
  getActiveSubscribers: mockGetActiveSubscribers,
}))
jest.mock('@web/lib/db/queries/series', () => ({
  getSeriesTranslationsById: mockGetSeriesTranslationsById,
}))
jest.mock('@web/i18n/server', () => ({
  getServerTranslation: mockGetServerTranslation,
}))
jest.mock('@web/lib/logger', () => ({
  logger: { error: mockLoggerError },
}))

const { sendNewPostNotifications } = require('./sendNewPostNotifications') as {
  sendNewPostNotifications: (
    p: import('./sendNewPostNotifications').SendNewPostNotificationsParams,
  ) => Promise<void>
}

const mockSubscriber = {
  id: 'sub-1',
  email: 'user@example.com',
  name: 'User',
  status: 'active' as const,
  token: 'tok-abc',
  locale: 'en' as const,
  createdAt: new Date(),
  confirmedAt: new Date(),
}

const mockTranslations = {
  en: { title: 'My Post', slug: 'my-post', excerpt: 'Great content here.' },
  es: { title: 'Mi Post', slug: 'mi-post', excerpt: 'Gran contenido.' },
}

function mockT(key: string, opts?: Record<string, string>) {
  if (opts?.title) return `${key}:${opts.title}`
  return key
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRender.mockResolvedValue('<html>post email</html>')
  mockResendSend.mockResolvedValue({ data: { id: 'email-id' }, error: null })
  mockGetActiveSubscribers.mockResolvedValue([mockSubscriber])
  mockGetServerTranslation.mockResolvedValue({ t: mockT })
  mockGetSeriesTranslationsById.mockResolvedValue([])
})

describe('sendNewPostNotifications', () => {
  it('returns early when no active subscribers', async () => {
    mockGetActiveSubscribers.mockResolvedValue([])
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 1,
      translations: mockTranslations,
    })
    expect(mockResendSend).not.toHaveBeenCalled()
  })

  it('sends email to each active subscriber', async () => {
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 7,
      translations: mockTranslations,
    })
    expect(mockResendSend).toHaveBeenCalledTimes(1)
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        html: '<html>post email</html>',
      }),
    )
  })

  it('builds correct post and unsubscribe URLs', async () => {
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 7,
      translations: mockTranslations,
    })
    const templateArg = mockNewPostEmail.mock.calls[0][0] as Record<
      string,
      string
    >
    expect(templateArg.postUrl).toBe('https://example.com/en/blog/7/my-post')
    expect(templateArg.unsubscribeUrl).toBe(
      'https://example.com/en/subscribe/unsubscribed?token=tok-abc',
    )
  })

  it('falls back to en translation when subscriber locale has no translation', async () => {
    const esSubscriber = { ...mockSubscriber, locale: 'es' as const }
    mockGetActiveSubscribers.mockResolvedValue([esSubscriber])
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 1,
      translations: { en: mockTranslations.en },
    })
    const templateArg = mockNewPostEmail.mock.calls[0][0] as Record<
      string,
      string
    >
    expect(templateArg.postUrl).toContain('/es/blog/1/my-post')
  })

  it('skips subscriber when no translation available for their locale and no en fallback', async () => {
    mockGetActiveSubscribers.mockResolvedValue([mockSubscriber])
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 1,
      translations: { es: mockTranslations.es },
    })
    expect(mockResendSend).not.toHaveBeenCalled()
  })

  it('logs error when Resend rejects but does not throw', async () => {
    mockResendSend.mockResolvedValue({
      data: null,
      error: { message: 'Resend error' },
    })
    await expect(
      sendNewPostNotifications({
        postId: 'p1',
        postNumber: 1,
        translations: mockTranslations,
      }),
    ).resolves.toBeUndefined()
    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@example.com' }),
      'sendNewPostNotifications: Resend rejected send',
    )
  })

  it('sends to all subscribers when multiple are active', async () => {
    mockGetActiveSubscribers.mockResolvedValue([
      mockSubscriber,
      {
        ...mockSubscriber,
        id: 'sub-2',
        email: 'other@example.com',
        token: 'tok-xyz',
      },
    ])
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 1,
      translations: mockTranslations,
    })
    expect(mockResendSend).toHaveBeenCalledTimes(2)
  })

  it('builds cover image URL from cloudinary public id and env var', async () => {
    const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'my-cloud'
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 1,
      translations: mockTranslations,
      coverImage: 'posts/my-image',
    })
    const templateArg = mockNewPostEmail.mock.calls[0][0] as Record<
      string,
      string
    >
    expect(templateArg.coverImageUrl).toBe(
      'https://res.cloudinary.com/my-cloud/image/upload/c_fill,w_560,h_220/f_auto,q_auto/posts/my-image',
    )
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalCloudName
  })

  it('url-encodes publicId segments with spaces', async () => {
    const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'my-cloud'
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 1,
      translations: mockTranslations,
      coverImage: 'my folder/my image',
    })
    const templateArg = mockNewPostEmail.mock.calls[0][0] as Record<
      string,
      string
    >
    expect(templateArg.coverImageUrl).toBe(
      'https://res.cloudinary.com/my-cloud/image/upload/c_fill,w_560,h_220/f_auto,q_auto/my%20folder/my%20image',
    )
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalCloudName
  })

  it('passes teaser translation to template', async () => {
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 1,
      translations: mockTranslations,
    })
    const templateArg = mockNewPostEmail.mock.calls[0][0] as Record<
      string,
      string
    >
    expect(templateArg.teaser).toBe('notification.teaser')
  })

  it('passes category and tags to template', async () => {
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 1,
      translations: mockTranslations,
      category: 'engineering',
      tags: ['REACT', 'TYPESCRIPT', 'NEXTJS'],
    })
    const templateArg = mockNewPostEmail.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(templateArg.category).toBe('engineering')
    expect(templateArg.tags).toEqual(['REACT', 'TYPESCRIPT', 'NEXTJS'])
  })

  it('looks up series title and passes it to template when seriesId provided', async () => {
    mockGetSeriesTranslationsById.mockResolvedValue([
      { locale: 'en', title: 'My Series' },
      { locale: 'es', title: 'Mi Serie' },
    ])
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 1,
      translations: mockTranslations,
      seriesId: 'series-abc',
      seriesOrder: 2,
    })
    expect(mockGetSeriesTranslationsById).toHaveBeenCalledWith('series-abc')
    const templateArg = mockNewPostEmail.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(templateArg.seriesTitle).toBe('My Series')
    expect(templateArg.seriesOrder).toBe(2)
  })

  it('falls back to en series title when subscriber locale has no series translation', async () => {
    const esSubscriber = { ...mockSubscriber, locale: 'es' as const }
    mockGetActiveSubscribers.mockResolvedValue([esSubscriber])
    mockGetSeriesTranslationsById.mockResolvedValue([
      { locale: 'en', title: 'My Series' },
    ])
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 1,
      translations: mockTranslations,
      seriesId: 'series-abc',
      seriesOrder: 1,
    })
    const templateArg = mockNewPostEmail.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(templateArg.seriesTitle).toBe('My Series')
  })

  it('does not look up series when seriesId is not provided', async () => {
    await sendNewPostNotifications({
      postId: 'p1',
      postNumber: 1,
      translations: mockTranslations,
    })
    expect(mockGetSeriesTranslationsById).not.toHaveBeenCalled()
    const templateArg = mockNewPostEmail.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(templateArg.seriesTitle).toBeUndefined()
  })

  it('returns early when resend is null', async () => {
    jest.resetModules()
    jest.mock('./resend', () => ({ resend: null }))
    jest.mock('@react-email/components', () => ({ render: mockRender }))
    jest.mock('@web/utils/url/generateUrl', () => ({
      getSiteUrl: mockGetSiteUrl,
    }))
    jest.mock('./templates/NewPostEmail', () => ({
      NewPostEmail: (...args: unknown[]) => mockNewPostEmail(...args),
    }))
    jest.mock('@web/lib/db/queries/subscriptions', () => ({
      getActiveSubscribers: mockGetActiveSubscribers,
    }))
    jest.mock('@web/lib/db/queries/series', () => ({
      getSeriesTranslationsById: mockGetSeriesTranslationsById,
    }))
    jest.mock('@web/i18n/server', () => ({
      getServerTranslation: mockGetServerTranslation,
    }))
    jest.mock('@web/lib/logger', () => ({
      logger: { error: mockLoggerError },
    }))
    const { sendNewPostNotifications: send } =
      require('./sendNewPostNotifications') as typeof import('./sendNewPostNotifications')
    await send({ postId: 'p1', postNumber: 1, translations: mockTranslations })
    expect(mockGetActiveSubscribers).not.toHaveBeenCalled()
  })
})
