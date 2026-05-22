import { render, screen } from '@testing-library/react'

import { BlogPage } from '@web/components/BlogPage/BlogPage'
import { Locale } from '@web/lib/db/schema'

import Page, { generateMetadata } from './page.next'

jest.mock('@web/components/BlogPage/BlogPage', () => {
  const React = require('react')
  return {
    BlogPage: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'blog-page' }),
      ),
  }
})

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn(),
}))

jest.mock('@web/utils/url/generateUrl', () => ({
  getSiteUrl: jest.fn().mockReturnValue('https://www.sawl.dev'),
}))

function makeParams(lng: Locale) {
  return { params: Promise.resolve({ lng }), searchParams: Promise.resolve({}) }
}

describe('[lng]/blog — page', () => {
  beforeEach(() => {
    const { getServerTranslation } = require('@web/i18n/server')
    getServerTranslation.mockResolvedValue({ t: (key: string) => key })
  })

  it('renders BlogPage', async () => {
    const ui = await Page(makeParams('en'))
    render(ui)
    expect(screen.getByTestId('blog-page')).toBeInTheDocument()
  })

  it('passes lng and searchParams to BlogPage', async () => {
    const ui = await Page({
      params: Promise.resolve({ lng: 'es' }),
      searchParams: Promise.resolve({
        page: '2',
        categories: 'engineering',
        tags: 'react',
        year: '2024',
        month: '6',
      }),
    })
    render(ui)
    expect(BlogPage).toHaveBeenCalledWith(
      expect.objectContaining({
        lng: 'es',
        page: '2',
        categories: 'engineering',
        tags: 'react',
        year: '2024',
        month: '6',
      }),
      undefined,
    )
  })
})

describe('[lng]/blog — metadata', () => {
  beforeEach(() => {
    const { getServerTranslation } = require('@web/i18n/server')
    getServerTranslation.mockResolvedValue({ t: (key: string) => key })
  })

  it('returns correct metadata for English', async () => {
    expect(await generateMetadata(makeParams('en'))).toEqual({
      title: 'meta.title',
      description: 'meta.description',
      alternates: {
        canonical: 'https://www.sawl.dev/en/blog/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/blog/',
          'en-GB': 'https://www.sawl.dev/en/blog/',
          'es-ES': 'https://www.sawl.dev/es/blog/',
          'x-default': 'https://www.sawl.dev/en/blog/',
        },
      },
      openGraph: {
        images: [
          { url: 'https://www.sawl.dev/og/blog.jpg', width: 1200, height: 630 },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        images: [
          { url: 'https://www.sawl.dev/og/blog.jpg', width: 1200, height: 630 },
        ],
      },
    })
  })

  it('returns correct metadata for Spanish', async () => {
    expect(await generateMetadata(makeParams('es'))).toEqual({
      title: 'meta.title',
      description: 'meta.description',
      alternates: {
        canonical: 'https://www.sawl.dev/es/blog/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/blog/',
          'en-GB': 'https://www.sawl.dev/en/blog/',
          'es-ES': 'https://www.sawl.dev/es/blog/',
          'x-default': 'https://www.sawl.dev/en/blog/',
        },
      },
      openGraph: {
        images: [
          { url: 'https://www.sawl.dev/og/blog.jpg', width: 1200, height: 630 },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        images: [
          { url: 'https://www.sawl.dev/og/blog.jpg', width: 1200, height: 630 },
        ],
      },
    })
  })
})

export {}
