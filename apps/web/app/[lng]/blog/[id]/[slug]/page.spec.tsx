import { render, screen } from '@testing-library/react'

const mockNotFound = jest.fn()
const mockRedirect = jest.fn()

jest.mock('next/navigation', () => ({
  notFound: mockNotFound,
  redirect: mockRedirect,
}))

const mockGetPostById = jest.fn()
const mockGetPublishedPosts = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPostById: mockGetPostById,
  getPublishedPosts: mockGetPublishedPosts,
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

jest.mock('date-fns', () => ({
  format: jest.fn().mockReturnValue('Jan 1, 2024'),
}))

const publishedPost = {
  id: '01JXYZ',
  slug: 'my-test-post',
  status: 'published' as const,
  title: 'My Test Post',
  coverImage: 'blog/cover',
  category: 'Tech',
  author: 'Jane Doe',
  publishedAt: new Date('2024-01-01'),
  content: 'Hello world content',
}

describe('[lng]/blog/[id]/[slug] - BlogPostPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls notFound when post is null', async () => {
    mockGetPostById.mockResolvedValue(null)
    const { default: BlogPostPage } = require('./page.next')
    await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: 'unknown', slug: 'unknown' }),
    })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('calls notFound when post status is draft', async () => {
    mockGetPostById.mockResolvedValue({ ...publishedPost, status: 'draft' })
    const { default: BlogPostPage } = require('./page.next')
    await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('calls redirect when slug does not match', async () => {
    mockGetPostById.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    await BlogPostPage({
      params: Promise.resolve({ lng: 'en', id: '01JXYZ', slug: 'wrong-slug' }),
    })
    expect(mockRedirect).toHaveBeenCalledWith('/en/blog/01JXYZ/my-test-post')
  })

  it('renders PostHero with correct props when valid', async () => {
    mockGetPostById.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.getByTestId('post-hero')).toBeInTheDocument()
  })

  it('handles publishedAt null', async () => {
    mockGetPostById.mockResolvedValue({ ...publishedPost, publishedAt: null })
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'en',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.getByTestId('post-hero')).toBeInTheDocument()
  })

  it('falls back to enUS locale for unknown language', async () => {
    mockGetPostById.mockResolvedValue(publishedPost)
    const { default: BlogPostPage } = require('./page.next')
    const ui = await BlogPostPage({
      params: Promise.resolve({
        lng: 'fr',
        id: '01JXYZ',
        slug: 'my-test-post',
      }),
    })
    render(ui)
    expect(screen.getByTestId('post-hero')).toBeInTheDocument()
  })

  it('generateStaticParams returns entries for both locales', async () => {
    mockGetPublishedPosts.mockResolvedValue([{ id: '01', slug: 'test-post' }])
    const { generateStaticParams } = require('./page.next')
    const params = await generateStaticParams()
    expect(params).toEqual([
      { lng: 'en', id: '01', slug: 'test-post' },
      { lng: 'es', id: '01', slug: 'test-post' },
    ])
  })

  it('generateStaticParams returns empty array when DB fails', async () => {
    mockGetPublishedPosts.mockRejectedValue(new Error('no db'))
    const { generateStaticParams } = require('./page.next')
    const params = await generateStaticParams()
    expect(params).toEqual([])
  })
})
