import { render, screen } from '@testing-library/react'

import { Locale } from '@web/lib/db/schema'

import Page, { generateMetadata } from './page.next'

jest.mock('@web/components/SubscribePage/SubscribePage', () => ({
  SubscribePage: ({ lng }: { lng: string }) => (
    <div data-testid="subscribe-page" data-lng={lng} />
  ),
}))

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn(),
}))

jest.mock('@web/utils/metadata/inLanguage', () => ({
  buildAlternates: jest.fn(() => ({
    canonical: 'https://test.com/en/subscribe/',
  })),
}))

function makeParams(lng: Locale) {
  return { params: Promise.resolve({ lng }) }
}

describe('[lng]/subscribe — page', () => {
  beforeEach(() => {
    const { getServerTranslation } = require('@web/i18n/server')
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
  beforeEach(() => {
    const { getServerTranslation } = require('@web/i18n/server')
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
