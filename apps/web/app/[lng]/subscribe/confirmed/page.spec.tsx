import { render, screen } from '@testing-library/react'

import { Locale } from '@web/lib/db/schema'

import Page, { generateMetadata } from './page.next'

jest.mock('@web/lib/db/queries/subscriptions', () => ({
  confirmSubscription: jest.fn(),
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

function makeParams(lng: Locale, token?: string) {
  return {
    params: Promise.resolve({ lng }),
    searchParams: Promise.resolve(token ? { token } : {}),
  }
}

describe('[lng]/subscribe/confirmed — page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { getServerTranslation } = require('@web/i18n/server')
    getServerTranslation.mockResolvedValue({ t: (key: string) => key })
  })

  it('shows confirmed title on success', async () => {
    const { confirmSubscription } = require('@web/lib/db/queries/subscriptions')
    confirmSubscription.mockResolvedValue({
      id: '1',
      status: 'active',
      token: 'tok',
    })
    const ui = await Page(makeParams('en', 'valid-token'))
    render(ui)
    expect(screen.getByText('confirmed.title')).toBeInTheDocument()
    expect(screen.getByText('confirmed.message')).toBeInTheDocument()
  })

  it('shows error when token not found', async () => {
    const { confirmSubscription } = require('@web/lib/db/queries/subscriptions')
    confirmSubscription.mockResolvedValue(null)
    const ui = await Page(makeParams('en', 'bad-token'))
    render(ui)
    expect(screen.getByText('confirmed.error')).toBeInTheDocument()
    expect(screen.queryByText('confirmed.message')).not.toBeInTheDocument()
  })

  it('shows error when no token provided', async () => {
    const { confirmSubscription } = require('@web/lib/db/queries/subscriptions')
    const ui = await Page(makeParams('en'))
    render(ui)
    expect(screen.getByText('confirmed.error')).toBeInTheDocument()
    expect(confirmSubscription).not.toHaveBeenCalled()
  })

  it('renders back to blog link', async () => {
    const { confirmSubscription } = require('@web/lib/db/queries/subscriptions')
    confirmSubscription.mockResolvedValue({ id: '1', status: 'active' })
    const ui = await Page(makeParams('en', 'tok'))
    render(ui)
    expect(screen.getByText('backToBlog')).toBeInTheDocument()
  })
})

describe('[lng]/subscribe/confirmed — metadata', () => {
  beforeEach(() => {
    const { getServerTranslation } = require('@web/i18n/server')
    getServerTranslation.mockResolvedValue({ t: (key: string) => key })
  })

  it('returns confirmed.title as page title', async () => {
    const meta = await generateMetadata(makeParams('en'))
    expect(meta.title).toBe('confirmed.title')
  })
})

export {}
