/**
 * @vitest-environment node
 */
const mockResendSend = vi.fn()
const mockRender = vi.fn()
const mockLoggerError = vi.fn()
const mockGetSiteUrl = vi.fn(() => 'https://sawl.dev')

vi.mock('./resend', () => ({
  resend: { emails: { send: mockResendSend } },
}))
vi.mock('@react-email/components', () => ({
  render: mockRender,
}))
vi.mock('@web/lib/logger', () => ({
  logger: { error: mockLoggerError },
}))
vi.mock('@web/utils/url/generateUrl', () => ({
  getSiteUrl: mockGetSiteUrl,
}))
vi.mock('./templates/NewCommentEmail', () => ({
  NewCommentEmail: () => null,
}))
vi.mock('react', () => {
  const mod = {
    createElement: vi.fn(() => null),
  }
  return { ...mod, default: mod }
})

const { notifyNewComment } = (await import('./notifyNewComment')) as {
  notifyNewComment: (params: {
    username: string
    body: string
    postTitle: string
    postNumber: number
    postSlug: string
    postLng: string
  }) => Promise<void>
}

const params = {
  username: 'tester',
  body: 'Great post!',
  postTitle: 'My Post',
  postNumber: 1,
  postSlug: 'my-post',
  postLng: 'en',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRender.mockResolvedValue('<html>email</html>')
  mockResendSend.mockResolvedValue({ error: null })
  process.env.ADMIN_NOTIFICATION_EMAIL = 'admin@example.com'
})

afterEach(() => {
  delete process.env.ADMIN_NOTIFICATION_EMAIL
})

describe('notifyNewComment', () => {
  it('sends email to admin with correct subject', async () => {
    await notifyNewComment(params)
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@example.com',
        subject: 'New comment from tester on "My Post"',
      }),
    )
  })

  it('does nothing when resend is not configured', async () => {
    vi.resetModules()
    vi.doMock('./resend', () => ({ resend: null }))
    const { notifyNewComment: fn } = (await import('./notifyNewComment')) as {
      notifyNewComment: typeof notifyNewComment
    }
    await fn(params)
    expect(mockResendSend).not.toHaveBeenCalled()
  })

  it('does nothing when ADMIN_NOTIFICATION_EMAIL is not set', async () => {
    delete process.env.ADMIN_NOTIFICATION_EMAIL
    await notifyNewComment(params)
    expect(mockResendSend).not.toHaveBeenCalled()
  })

  it('logs error when Resend returns error', async () => {
    mockResendSend.mockResolvedValue({ error: { message: 'Send failed' } })
    await notifyNewComment(params)
    expect(mockLoggerError).toHaveBeenCalled()
  })

  it('logs error when render throws', async () => {
    mockRender.mockRejectedValue(new Error('render error'))
    await notifyNewComment(params)
    expect(mockLoggerError).toHaveBeenCalled()
  })

  it('does not throw when send fails', async () => {
    mockResendSend.mockRejectedValue(new Error('network error'))
    await expect(notifyNewComment(params)).resolves.toBeUndefined()
  })

  it('uses RESEND_FROM_EMAIL env var as sender when set', async () => {
    vi.resetModules()
    process.env.RESEND_FROM_EMAIL = 'custom@sender.com'
    vi.doMock('./resend', () => ({
      resend: { emails: { send: mockResendSend } },
    }))
    vi.doMock('@react-email/components', () => ({ render: mockRender }))
    vi.doMock('@web/lib/logger', () => ({
      logger: { error: mockLoggerError },
    }))
    vi.doMock('@web/utils/url/generateUrl', () => ({
      getSiteUrl: mockGetSiteUrl,
    }))
    vi.doMock('./templates/NewCommentEmail', () => ({
      NewCommentEmail: () => null,
    }))
    vi.doMock('react', () => {
      const mod = { createElement: vi.fn(() => null) }
      return { ...mod, default: mod }
    })
    const { notifyNewComment: fn } = (await import('./notifyNewComment')) as {
      notifyNewComment: typeof notifyNewComment
    }
    process.env.ADMIN_NOTIFICATION_EMAIL = 'admin@example.com'
    await fn(params)
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'custom@sender.com' }),
    )
    delete process.env.RESEND_FROM_EMAIL
  })
})

export {}
