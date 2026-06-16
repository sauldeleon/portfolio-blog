/**
 * @jest-environment node
 */
const mockResendSend = jest.fn()
const mockRender = jest.fn()
const mockLoggerError = jest.fn()
const mockGetSiteUrl = jest.fn(() => 'https://sawl.dev')

jest.mock('./resend', () => ({
  resend: { emails: { send: mockResendSend } },
}))
jest.mock('@react-email/components', () => ({
  render: mockRender,
}))
jest.mock('@web/lib/logger', () => ({
  logger: { error: mockLoggerError },
}))
jest.mock('@web/utils/url/generateUrl', () => ({
  getSiteUrl: mockGetSiteUrl,
}))
jest.mock('./templates/NewCommentEmail', () => ({
  NewCommentEmail: () => null,
}))
jest.mock('react', () => ({
  createElement: jest.fn(() => null),
}))

const { notifyNewComment } = require('./notifyNewComment') as {
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
  jest.clearAllMocks()
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
    jest.resetModules()
    jest.mock('./resend', () => ({ resend: null }))
    const { notifyNewComment: fn } = require('./notifyNewComment') as {
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
    jest.resetModules()
    process.env.RESEND_FROM_EMAIL = 'custom@sender.com'
    jest.mock('./resend', () => ({
      resend: { emails: { send: mockResendSend } },
    }))
    jest.mock('@react-email/components', () => ({ render: mockRender }))
    jest.mock('@web/lib/logger', () => ({
      logger: { error: mockLoggerError },
    }))
    jest.mock('@web/utils/url/generateUrl', () => ({
      getSiteUrl: mockGetSiteUrl,
    }))
    jest.mock('./templates/NewCommentEmail', () => ({
      NewCommentEmail: () => null,
    }))
    jest.mock('react', () => ({ createElement: jest.fn(() => null) }))
    const { notifyNewComment: fn } = require('./notifyNewComment') as {
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
