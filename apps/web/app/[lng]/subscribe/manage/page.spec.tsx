import { render, screen } from '@testing-library/react'

import { Locale } from '@web/lib/db/schema'

import Page, { generateMetadata } from './page.next'

const mockGetSubscriptionByToken = vi.fn()

vi.mock('@web/lib/db/queries/subscriptions', () => ({
  getSubscriptionByToken: (...args: unknown[]) =>
    mockGetSubscriptionByToken(...args),
}))

const mockVerifyManageLink = vi.fn()
vi.mock('@web/lib/subscriptions/manageLink', () => ({
  verifyManageLink: (...args: unknown[]) => mockVerifyManageLink(...args),
}))

vi.mock('@web/i18n/server', () => ({
  getServerTranslation: vi.fn().mockResolvedValue({ t: (key: string) => key }),
}))

vi.mock('@web/components/ManageSubscriptionPage', () => ({
  ManageSubscriptionPage: (props: Record<string, unknown>) => (
    <div data-testid="manage-page" data-props={JSON.stringify(props)} />
  ),
}))

vi.mock('@web/components/SubscribeResultPage', () => ({
  SubscribeResultPage: ({
    errorTitle,
    backToHref,
  }: {
    errorTitle: string
    backToHref: string
  }) => (
    <div data-testid="result-page" data-href={backToHref}>
      {errorTitle}
    </div>
  ),
}))

function makeProps(lng: Locale, token?: string) {
  return {
    params: Promise.resolve({ lng }),
    searchParams: Promise.resolve(
      token ? { token, expires: '123', signature: 'sig' } : {},
    ),
  }
}

const subscription = {
  id: 's1',
  email: 'ana@example.com',
  name: 'Ana',
  status: 'active',
  token: 'tok',
  locale: 'es',
  createdAt: new Date(),
  confirmedAt: new Date(),
  enabled: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetSubscriptionByToken.mockResolvedValue(subscription)
  mockVerifyManageLink.mockReturnValue('valid')
})

describe('[lng]/subscribe/manage — page', () => {
  it('renders the manage page for a valid token', async () => {
    render(await Page(makeProps('es', 'tok')))
    expect(mockGetSubscriptionByToken).toHaveBeenCalledWith('tok')
    const props = JSON.parse(
      screen.getByTestId('manage-page').getAttribute('data-props') ?? '{}',
    )
    expect(props).toEqual({
      lng: 'es',
      token: 'tok',
      expires: '123',
      signature: 'sig',
      email: 'ana@example.com',
      status: 'active',
      defaultValues: { name: 'Ana', locale: 'es' },
    })
  })

  it('shows an error when the token is unknown', async () => {
    mockGetSubscriptionByToken.mockResolvedValue(null)
    render(await Page(makeProps('en', 'bad')))
    expect(screen.getByTestId('result-page')).toHaveTextContent('manage.error')
    expect(screen.getByTestId('result-page')).toHaveAttribute(
      'data-href',
      '/en/blog',
    )
  })

  it('checks the signed link', async () => {
    render(await Page(makeProps('es', 'tok')))
    expect(mockVerifyManageLink).toHaveBeenCalledWith({
      token: 'tok',
      expires: '123',
      signature: 'sig',
    })
  })

  it('shows the expired message for an expired link', async () => {
    mockVerifyManageLink.mockReturnValue('expired')
    render(await Page(makeProps('es', 'tok')))
    expect(screen.getByTestId('result-page')).toHaveTextContent(
      'manage.expired',
    )
    expect(mockGetSubscriptionByToken).not.toHaveBeenCalled()
  })

  it('shows the invalid message for a tampered link', async () => {
    mockVerifyManageLink.mockReturnValue('invalid')
    render(await Page(makeProps('es', 'tok')))
    expect(screen.getByTestId('result-page')).toHaveTextContent('manage.error')
    expect(mockGetSubscriptionByToken).not.toHaveBeenCalled()
  })

  it('shows an error without querying when the token is missing', async () => {
    render(await Page(makeProps('en')))
    expect(screen.getByTestId('result-page')).toBeInTheDocument()
    expect(mockGetSubscriptionByToken).not.toHaveBeenCalled()
  })

  it('sets a noindex title in metadata', async () => {
    const meta = await generateMetadata(makeProps('en'))
    expect(meta).toEqual({
      title: 'manage.title',
      robots: { index: false, follow: false },
    })
  })
})
