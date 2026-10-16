import { render, screen } from '@testing-library/react'

import type { SubscriptionRecord } from '@web/lib/db/queries/subscriptions'
import { Locale } from '@web/lib/db/schema'

import Page, { generateMetadata } from './page.next'

vi.mock('@web/lib/db/queries/subscriptions', () => ({
  confirmSubscription: vi.fn(),
}))

vi.mock('@web/i18n/server', () => ({
  getServerTranslation: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) {
    return <a href={href}>{children}</a>
  },
}))

vi.mock('next/image', () => ({
  default: function MockImage({ src, alt }: { src: string; alt: string }) {
    return <img src={src} alt={alt} />
  },
}))

function makeParams(lng: Locale, token?: string) {
  return {
    params: Promise.resolve({ lng }),
    searchParams: Promise.resolve(token ? { token } : {}),
  }
}

describe('[lng]/subscribe/confirmed — page', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { getServerTranslation } = await import('@web/i18n/server')
    vi.mocked(getServerTranslation).mockResolvedValue({
      t: (key: string) => key,
    } as unknown as Awaited<ReturnType<typeof getServerTranslation>>)
  })

  it('shows confirmed title on success', async () => {
    const { confirmSubscription } =
      await import('@web/lib/db/queries/subscriptions')
    vi.mocked(confirmSubscription).mockResolvedValue({
      id: '1',
      status: 'active',
      token: 'tok',
    } as SubscriptionRecord)
    const ui = await Page(makeParams('en', 'valid-token'))
    render(ui)
    expect(screen.getByText('confirmed.title')).toBeInTheDocument()
    expect(screen.getByText('confirmed.message')).toBeInTheDocument()
  })

  it('shows error when token not found', async () => {
    const { confirmSubscription } =
      await import('@web/lib/db/queries/subscriptions')
    vi.mocked(confirmSubscription).mockResolvedValue(null)
    const ui = await Page(makeParams('en', 'bad-token'))
    render(ui)
    expect(screen.getByText('confirmed.error')).toBeInTheDocument()
    expect(screen.queryByText('confirmed.message')).not.toBeInTheDocument()
  })

  it('shows error when no token provided', async () => {
    const { confirmSubscription } =
      await import('@web/lib/db/queries/subscriptions')
    const ui = await Page(makeParams('en'))
    render(ui)
    expect(screen.getByText('confirmed.error')).toBeInTheDocument()
    expect(confirmSubscription).not.toHaveBeenCalled()
  })

  it('renders back to blog link', async () => {
    const { confirmSubscription } =
      await import('@web/lib/db/queries/subscriptions')
    vi.mocked(confirmSubscription).mockResolvedValue({
      id: '1',
      status: 'active',
    } as SubscriptionRecord)
    const ui = await Page(makeParams('en', 'tok'))
    render(ui)
    expect(screen.getByText('backToBlog')).toBeInTheDocument()
  })

  it('renders subscribe image on success', async () => {
    const { confirmSubscription } =
      await import('@web/lib/db/queries/subscriptions')
    vi.mocked(confirmSubscription).mockResolvedValue({
      id: '1',
      status: 'active',
      token: 'tok',
    } as SubscriptionRecord)
    const ui = await Page(makeParams('en', 'valid-token'))
    render(ui)
    expect(screen.getByAltText('confirmed.imageAlt')).toBeInTheDocument()
  })

  it('does not render subscribe image on error', async () => {
    const { confirmSubscription } =
      await import('@web/lib/db/queries/subscriptions')
    vi.mocked(confirmSubscription).mockResolvedValue(null)
    const ui = await Page(makeParams('en', 'bad-token'))
    render(ui)
    expect(screen.queryByAltText('confirmed.imageAlt')).not.toBeInTheDocument()
  })
})

describe('[lng]/subscribe/confirmed — metadata', () => {
  beforeEach(async () => {
    const { getServerTranslation } = await import('@web/i18n/server')
    vi.mocked(getServerTranslation).mockResolvedValue({
      t: (key: string) => key,
    } as unknown as Awaited<ReturnType<typeof getServerTranslation>>)
  })

  it('returns confirmed.title as page title', async () => {
    const meta = await generateMetadata(makeParams('en'))
    expect(meta.title).toBe('confirmed.title')
  })
})

export {}
