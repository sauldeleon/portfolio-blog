/**
 * @vitest-environment node
 */
const mockRender = vi.fn()
const mockResendSend = vi.fn()
const mockGetSiteUrl = vi.fn(() => 'https://example.com')
const mockLoggerError = vi.fn()

vi.mock('@react-email/components', () => ({ render: mockRender }))
vi.mock('@web/utils/url/generateUrl', () => ({
  getSiteUrl: mockGetSiteUrl,
}))
vi.mock('./resend', () => ({
  resend: { emails: { send: mockResendSend } },
}))
vi.mock('./templates/ConfirmSubscription', () => ({
  ConfirmSubscriptionEmail: vi.fn(() => null),
}))
vi.mock('@web/lib/logger', () => ({
  logger: { error: mockLoggerError },
}))

const { sendConfirmationEmail } = (await import('./sendConfirmationEmail')) as {
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
  vi.clearAllMocks()
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

    const templateArg = vi.mocked(
      (await import('./templates/ConfirmSubscription'))
        .ConfirmSubscriptionEmail,
    ).mock.calls[0][0]
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
    const templateArg = vi.mocked(
      (await import('./templates/ConfirmSubscription'))
        .ConfirmSubscriptionEmail,
    ).mock.calls[0][0]
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
    const templateArg = vi.mocked(
      (await import('./templates/ConfirmSubscription'))
        .ConfirmSubscriptionEmail,
    ).mock.calls[0][0]
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

  it('uses onboarding@resend.dev as from address when RESEND_FROM_EMAIL is not set', async () => {
    const originalFrom = process.env.RESEND_FROM_EMAIL
    delete process.env.RESEND_FROM_EMAIL
    vi.resetModules()
    vi.doMock('./resend', () => ({
      resend: { emails: { send: mockResendSend } },
    }))
    vi.doMock('@react-email/components', () => ({ render: mockRender }))
    vi.doMock('@web/utils/url/generateUrl', () => ({
      getSiteUrl: mockGetSiteUrl,
    }))
    vi.doMock('./templates/ConfirmSubscription', () => ({
      ConfirmSubscriptionEmail: vi.fn(() => null),
    }))
    vi.doMock('@web/lib/logger', () => ({
      logger: { error: mockLoggerError },
    }))
    const { sendConfirmationEmail: send } =
      (await import('./sendConfirmationEmail')) as typeof import('./sendConfirmationEmail')
    mockRender.mockResolvedValue('<html>email</html>')
    mockResendSend.mockResolvedValue({ data: { id: 'id' }, error: null })
    await send({
      to: 'user@example.com',
      name: 'User',
      token: 'abc',
      locale: 'en',
      translations,
    })
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'onboarding@resend.dev' }),
    )
    process.env.RESEND_FROM_EMAIL = originalFrom
  })

  it('skips sending when resend is null', async () => {
    vi.resetModules()
    vi.doMock('./resend', () => ({ resend: null }))
    vi.doMock('@react-email/components', () => ({ render: mockRender }))
    vi.doMock('@web/utils/url/generateUrl', () => ({
      getSiteUrl: mockGetSiteUrl,
    }))
    vi.doMock('./templates/ConfirmSubscription', () => ({
      ConfirmSubscriptionEmail: vi.fn(() => null),
    }))
    const { sendConfirmationEmail: send } =
      (await import('./sendConfirmationEmail')) as typeof import('./sendConfirmationEmail')
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

export {}
