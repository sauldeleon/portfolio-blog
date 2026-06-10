import { render, screen } from '@testing-library/react'

import { Locale } from '@web/lib/db/schema'

import Page, { generateMetadata } from './page.next'

jest.mock('@web/lib/db/queries/subscriptions', () => ({
  unsubscribeByToken: jest.fn(),
}))

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn(),
}))

jest.mock(
  'next/link',
  () =>
    function MockLink({
      children,
      href,
    }: {
      children: React.ReactNode
      href: string
    }) {
      return <a href={href}>{children}</a>
    },
)

jest.mock(
  'next/image',
  () =>
    function MockImage({ src, alt }: { src: string; alt: string }) {
      return <img src={src} alt={alt} />
    },
)

function makeParams(lng: Locale, token?: string) {
  return {
    params: Promise.resolve({ lng }),
    searchParams: Promise.resolve(token ? { token } : {}),
  }
}

describe('[lng]/subscribe/unsubscribed — page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { getServerTranslation } = require('@web/i18n/server')
    getServerTranslation.mockResolvedValue({ t: (key: string) => key })
  })

  it('shows unsubscribed title on success', async () => {
    const { unsubscribeByToken } = require('@web/lib/db/queries/subscriptions')
    unsubscribeByToken.mockResolvedValue({ id: '1', status: 'unsubscribed' })
    const ui = await Page(makeParams('en', 'valid-token'))
    render(ui)
    expect(screen.getByText('unsubscribed.title')).toBeInTheDocument()
    expect(screen.getByText('unsubscribed.message')).toBeInTheDocument()
  })

  it('shows error when token not found', async () => {
    const { unsubscribeByToken } = require('@web/lib/db/queries/subscriptions')
    unsubscribeByToken.mockResolvedValue(null)
    const ui = await Page(makeParams('en', 'bad-token'))
    render(ui)
    expect(screen.getByText('unsubscribed.error')).toBeInTheDocument()
    expect(screen.queryByText('unsubscribed.message')).not.toBeInTheDocument()
  })

  it('shows error when no token provided', async () => {
    const { unsubscribeByToken } = require('@web/lib/db/queries/subscriptions')
    const ui = await Page(makeParams('en'))
    render(ui)
    expect(screen.getByText('unsubscribed.error')).toBeInTheDocument()
    expect(unsubscribeByToken).not.toHaveBeenCalled()
  })

  it('renders back to blog link', async () => {
    const { unsubscribeByToken } = require('@web/lib/db/queries/subscriptions')
    unsubscribeByToken.mockResolvedValue({ id: '1', status: 'unsubscribed' })
    const ui = await Page(makeParams('en', 'tok'))
    render(ui)
    expect(screen.getByText('backToBlog')).toBeInTheDocument()
  })

  it('renders unsubscribe image on success', async () => {
    const { unsubscribeByToken } = require('@web/lib/db/queries/subscriptions')
    unsubscribeByToken.mockResolvedValue({ id: '1', status: 'unsubscribed' })
    const ui = await Page(makeParams('en', 'valid-token'))
    render(ui)
    expect(screen.getByAltText('unsubscribed.imageAlt')).toBeInTheDocument()
  })

  it('does not render unsubscribe image on error', async () => {
    const { unsubscribeByToken } = require('@web/lib/db/queries/subscriptions')
    unsubscribeByToken.mockResolvedValue(null)
    const ui = await Page(makeParams('en', 'bad-token'))
    render(ui)
    expect(
      screen.queryByAltText('unsubscribed.imageAlt'),
    ).not.toBeInTheDocument()
  })
})

describe('[lng]/subscribe/unsubscribed — metadata', () => {
  beforeEach(() => {
    const { getServerTranslation } = require('@web/i18n/server')
    getServerTranslation.mockResolvedValue({ t: (key: string) => key })
  })

  it('returns unsubscribed.title as page title', async () => {
    const meta = await generateMetadata(makeParams('en'))
    expect(meta.title).toBe('unsubscribed.title')
  })
})

export {}
