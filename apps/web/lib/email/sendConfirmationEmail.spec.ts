/**
 * @jest-environment node
 */
const mockRender = jest.fn()
const mockResendSend = jest.fn()
const mockGetSiteUrl = jest.fn(() => 'https://example.com')
const mockLoggerError = jest.fn()

jest.mock('@react-email/components', () => ({ render: mockRender }))
jest.mock('@web/utils/url/generateUrl', () => ({
  getSiteUrl: mockGetSiteUrl,
}))
jest.mock('./resend', () => ({
  resend: { emails: { send: mockResendSend } },
}))
jest.mock('./templates/ConfirmSubscription', () => ({
  ConfirmSubscriptionEmail: jest.fn(() => null),
}))
jest.mock('@web/lib/logger', () => ({
  logger: { error: mockLoggerError },
}))

const { sendConfirmationEmail } = require('./sendConfirmationEmail') as {
  sendConfirmationEmail: (
    p: import('./sendConfirmationEmail').SendConfirmationEmailParams,
  ) => Promise<void>
}

const translations = {
  subject: 'Confirm your subscription',
  previewText: 'Please confirm.',
  heading: 'Confirm',
  body: 'Hi {{name}}, click below.',
  buttonLabel: 'Confirm',
  footerText: "If you didn't subscribe, ignore this.",
  unsubscribeText: 'Unsubscribe',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRender.mockResolvedValue('<html>email</html>')
  mockResendSend.mockResolvedValue({ data: { id: 'email-id' }, error: null })
})

describe('sendConfirmationEmail', () => {
  it('renders template and sends via resend', async () => {
    await sendConfirmationEmail({
      to: 'user@example.com',
      name: 'User',
      token: 'abc123',
      locale: 'en',
      translations,
    })

    expect(mockRender).toHaveBeenCalledTimes(1)
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Confirm your subscription',
        html: '<html>email</html>',
      }),
    )
  })

  it('builds correct confirm and unsubscribe urls', async () => {
    await sendConfirmationEmail({
      to: 'user@example.com',
      name: 'User',
      token: 'mytoken',
      locale: 'es',
      translations,
    })

    const templateArg = require('./templates/ConfirmSubscription')
      .ConfirmSubscriptionEmail.mock.calls[0][0]
    expect(templateArg.confirmUrl).toBe(
      'https://example.com/es/subscribe/confirmed?token=mytoken',
    )
    expect(templateArg.unsubscribeUrl).toBe(
      'https://example.com/es/subscribe/unsubscribed?token=mytoken',
    )
  })

  it('passes blogImageUrl derived from siteUrl', async () => {
    await sendConfirmationEmail({
      to: 'user@example.com',
      name: 'User',
      token: 'tok',
      locale: 'en',
      translations,
    })
    const templateArg = require('./templates/ConfirmSubscription')
      .ConfirmSubscriptionEmail.mock.calls[0][0]
    expect(templateArg.blogImageUrl).toBe('https://example.com/og/blog.jpg')
  })

  it('omits blogImageUrl when siteUrl is empty', async () => {
    mockGetSiteUrl.mockReturnValueOnce('')
    await sendConfirmationEmail({
      to: 'user@example.com',
      name: 'User',
      token: 'tok',
      locale: 'en',
      translations,
    })
    const templateArg = require('./templates/ConfirmSubscription')
      .ConfirmSubscriptionEmail.mock.calls[0][0]
    expect(templateArg.blogImageUrl).toBeUndefined()
  })

  it('throws and logs when Resend returns an error', async () => {
    mockResendSend.mockResolvedValue({
      data: null,
      error: { message: 'The sender address is not verified.' },
    })
    await expect(
      sendConfirmationEmail({
        to: 'user@example.com',
        name: 'User',
        token: 'abc123',
        locale: 'en',
        translations,
      }),
    ).rejects.toThrow('Resend error: The sender address is not verified.')
    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com' }),
      'sendConfirmationEmail: Resend rejected send',
    )
  })

  it('skips sending when resend is null', async () => {
    jest.resetModules()
    jest.mock('./resend', () => ({ resend: null }))
    jest.mock('@react-email/components', () => ({ render: mockRender }))
    jest.mock('@web/utils/url/generateUrl', () => ({
      getSiteUrl: mockGetSiteUrl,
    }))
    jest.mock('./templates/ConfirmSubscription', () => ({
      ConfirmSubscriptionEmail: jest.fn(() => null),
    }))
    const { sendConfirmationEmail: send } =
      require('./sendConfirmationEmail') as typeof import('./sendConfirmationEmail')
    await send({
      to: 'user@example.com',
      name: 'User',
      token: 'abc',
      locale: 'en',
      translations,
    })
    expect(mockResendSend).not.toHaveBeenCalled()
  })
})
