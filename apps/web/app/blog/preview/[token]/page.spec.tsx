import { render, screen } from '@testing-library/react'
import React from 'react'

import { PostHero } from '@sdlgr/post-hero'

const mockNotFound = jest.fn()

jest.mock('next/navigation', () => ({
  notFound: mockNotFound,
}))

const mockHeaders = jest.fn()

jest.mock('next/headers', () => ({
  headers: mockHeaders,
}))

const mockGetPostByPreviewToken = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPostByPreviewToken: mockGetPostByPreviewToken,
}))

jest.mock('@sdlgr/post-hero', () => {
  const React = require('react')
  return {
    PostHero: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'post-hero' }),
      ),
  }
})

jest.mock('@web/lib/mdx/renderMDX', () => ({
  renderMDX: jest.fn().mockReturnValue(null),
}))

const mockPostComments = jest.fn()
jest.mock('@web/components/PostComments', () => ({
  PostComments: (...args: unknown[]) => mockPostComments(...args),
}))

jest.mock('@web/components/PreviewBanner', () => ({
  PreviewBanner: ({ label }: { label: string }) => (
    <div data-testid="preview-banner">{label}</div>
  ),
}))

jest.mock('@web/components/PostContent/PostContent', () => ({
  PostContent: ({ children }: { children: React.ReactNode }) => (
    <article data-testid="post-content">{children}</article>
  ),
}))

jest.mock('./page.next.styles', () => ({
  StyledPage: ({ children }: { children: React.ReactNode }) => (
    <main data-testid="styled-page">{children}</main>
  ),
}))

const mockPost = {
  id: '01ABC',
  postNumber: 7,
  coverImage: 'blog/cover',
  category: 'Tech',
  authorId: 'user-1',
  commentsEnabled: true,
}

const mockTranslations = [
  {
    locale: 'en',
    title: 'English Title',
    slug: 'english-title',
    content: 'English content',
  },
  {
    locale: 'es',
    title: 'Spanish Title',
    slug: 'spanish-title',
    content: 'Spanish content',
  },
]

function makeHeadersList(acceptLanguage: string) {
  return {
    get: (key: string) => (key === 'accept-language' ? acceptLanguage : null),
  }
}

describe('blog/preview/[token] - PreviewPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPostComments.mockReturnValue(<div data-testid="post-comments" />)
  })

  it('calls notFound when token is invalid (null result)', async () => {
    mockGetPostByPreviewToken.mockResolvedValue(null)
    mockHeaders.mockResolvedValue(makeHeadersList('en'))
    const { default: PreviewPage } = require('./page.next')
    await PreviewPage({ params: Promise.resolve({ token: 'bad-token' }) })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('defaults to en when accept-language header is absent', async () => {
    mockGetPostByPreviewToken.mockResolvedValue({
      post: mockPost,
      translations: mockTranslations,
      authorName: 'Jane Doe',
    })
    mockHeaders.mockResolvedValue({ get: () => null })
    const { default: PreviewPage } = require('./page.next')
    const ui = await PreviewPage({
      params: Promise.resolve({ token: 'valid-token' }),
    })
    render(ui)
    expect(PostHero).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'English Title' }),
      undefined,
    )
  })

  it('calls notFound when no translations', async () => {
    mockGetPostByPreviewToken.mockResolvedValue({
      post: mockPost,
      translations: [],
      authorName: '',
    })
    mockHeaders.mockResolvedValue(makeHeadersList('en'))
    const { default: PreviewPage } = require('./page.next')
    await PreviewPage({ params: Promise.resolve({ token: 'valid-token' }) })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('renders preview banner when valid', async () => {
    mockGetPostByPreviewToken.mockResolvedValue({
      post: mockPost,
      translations: mockTranslations,
      authorName: 'Jane Doe',
    })
    mockHeaders.mockResolvedValue(makeHeadersList('en'))
    const { default: PreviewPage } = require('./page.next')
    const ui = await PreviewPage({
      params: Promise.resolve({ token: 'valid-token' }),
    })
    render(ui)
    expect(screen.getByTestId('preview-banner')).toHaveTextContent(
      'Admin preview — this post is not publicly visible',
    )
  })

  it('uses es translation when accept-language starts with es', async () => {
    mockGetPostByPreviewToken.mockResolvedValue({
      post: mockPost,
      translations: mockTranslations,
      authorName: 'Jane Doe',
    })
    mockHeaders.mockResolvedValue(makeHeadersList('es-ES,es;q=0.9'))
    const { default: PreviewPage } = require('./page.next')
    const ui = await PreviewPage({
      params: Promise.resolve({ token: 'valid-token' }),
    })
    render(ui)
    expect(PostHero).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Spanish Title' }),
      undefined,
    )
  })

  it('falls back to en when accept-language is not es', async () => {
    mockGetPostByPreviewToken.mockResolvedValue({
      post: mockPost,
      translations: mockTranslations,
      authorName: 'Jane Doe',
    })
    mockHeaders.mockResolvedValue(makeHeadersList('fr-FR,fr;q=0.9'))
    const { default: PreviewPage } = require('./page.next')
    const ui = await PreviewPage({
      params: Promise.resolve({ token: 'valid-token' }),
    })
    render(ui)
    expect(PostHero).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'English Title' }),
      undefined,
    )
  })

  it('falls back to first translation when neither locale found', async () => {
    const onlyFrTranslation = [
      { locale: 'fr', title: 'French Title', content: 'French content' },
    ]
    mockGetPostByPreviewToken.mockResolvedValue({
      post: mockPost,
      translations: onlyFrTranslation,
      authorName: 'Jane Doe',
    })
    mockHeaders.mockResolvedValue(makeHeadersList('de'))
    const { default: PreviewPage } = require('./page.next')
    const ui = await PreviewPage({
      params: Promise.resolve({ token: 'valid-token' }),
    })
    render(ui)
    expect(PostHero).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'French Title' }),
      undefined,
    )
  })

  it('renders PostComments with correct props', async () => {
    mockGetPostByPreviewToken.mockResolvedValue({
      post: mockPost,
      translations: mockTranslations,
      authorName: 'Jane Doe',
    })
    mockHeaders.mockResolvedValue(makeHeadersList('en'))
    const { default: PreviewPage } = require('./page.next')
    const ui = await PreviewPage({
      params: Promise.resolve({ token: 'valid-token' }),
    })
    render(ui)
    expect(screen.getByTestId('post-comments')).toBeInTheDocument()
    expect(mockPostComments).toHaveBeenCalledWith(
      expect.objectContaining({
        postId: '01ABC',
        postNumber: 7,
        postSlug: 'english-title',
        lng: 'en',
        commentsEnabled: true,
      }),
      undefined,
    )
  })
})
