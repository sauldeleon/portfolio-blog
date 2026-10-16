import { render, screen } from '@testing-library/react'

import { Locale } from '@web/lib/db/schema'

import Page, { generateMetadata } from './page.next'

vi.mock('@web/components/SubscribePage/SubscribePage', () => ({
  SubscribePage: ({ lng }: { lng: string }) => (
    <div data-testid="subscribe-page" data-lng={lng} />
  ),
}))

vi.mock('@web/i18n/server', () => ({
  getServerTranslation: vi.fn(),
}))

vi.mock('@web/utils/metadata/inLanguage', () => ({
  buildAlternates: vi.fn(() => ({
    canonical: 'https://test.com/en/subscribe/',
  })),
}))

function makeParams(lng: Locale) {
  return { params: Promise.resolve({ lng }) }
}

describe('[lng]/subscribe — page', () => {
  beforeEach(async () => {
    const { getServerTranslation } = await import('@web/i18n/server')
    getServerTranslation.mockResolvedValue({ t: (key: string) => key })
  })

  it('renders SubscribePage with correct lng', async () => {
    const ui = await Page(makeParams('en'))
    render(ui)
    expect(screen.getByTestId('subscribe-page')).toHaveAttribute(
      'data-lng',
      'en',
    )
  })
})

describe('[lng]/subscribe — metadata', () => {
  beforeEach(async () => {
    const { getServerTranslation } = await import('@web/i18n/server')
    getServerTranslation.mockResolvedValue({ t: (key: string) => key })
  })

  it('returns title and description', async () => {
    const meta = await generateMetadata(makeParams('en'))
    expect(meta).toMatchObject({
      title: 'meta.title',
      description: 'meta.description',
    })
  })
})

export {}
