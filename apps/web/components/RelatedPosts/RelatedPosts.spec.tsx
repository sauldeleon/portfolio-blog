import { render, screen } from '@testing-library/react'

const mockGetRelatedPosts = jest.fn()
const mockGetServerTranslation = jest.fn()
const mockComputeReadingTime = jest.fn().mockReturnValue(3)

jest.mock('@web/lib/db/queries/posts', () => ({
  getRelatedPosts: mockGetRelatedPosts,
}))
jest.mock('@web/i18n/server', () => ({
  getServerTranslation: mockGetServerTranslation,
}))
jest.mock('@web/utils/computeReadingTime', () => ({
  computeReadingTime: mockComputeReadingTime,
}))
jest.mock('@sdlgr/post-card', () => ({
  PostCard: ({ title }: { title: string }) => (
    <article data-testid="post-card">{title}</article>
  ),
}))

const { RelatedPosts } =
  require('./RelatedPosts') as typeof import('./RelatedPosts')

const mockPost = {
  id: '01JWTEST000000000000000000',
  slug: 'related-post',
  title: 'Related Post',
  excerpt: 'An excerpt',
  author: 'Author',
  publishedAt: new Date('2024-01-15'),
  category: 'engineering',
  tags: ['react'],
  coverImage: null,
  content: '## Hello',
  status: 'published' as const,
  seriesId: null,
  seriesOrder: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

beforeEach(() => {
  mockGetServerTranslation.mockResolvedValue({
    t: (key: string) => key,
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('RelatedPosts', () => {
  it('renders null when no related posts', async () => {
    mockGetRelatedPosts.mockResolvedValue([])
    const result = await RelatedPosts({ postId: 'abc', lng: 'en' })
    const { container } = render(result)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders related posts', async () => {
    mockGetRelatedPosts.mockResolvedValue([mockPost])
    const result = await RelatedPosts({ postId: 'abc', lng: 'en' })
    render(result)
    expect(screen.getByTestId('post-card')).toHaveTextContent('Related Post')
  })

  it('renders the section heading', async () => {
    mockGetRelatedPosts.mockResolvedValue([mockPost])
    const result = await RelatedPosts({ postId: 'abc', lng: 'en' })
    render(result)
    expect(screen.getByText('relatedPosts')).toBeInTheDocument()
  })

  it('renders multiple related posts', async () => {
    const posts = [
      { ...mockPost, id: '01', title: 'Post One' },
      { ...mockPost, id: '02', title: 'Post Two' },
      { ...mockPost, id: '03', title: 'Post Three' },
    ]
    mockGetRelatedPosts.mockResolvedValue(posts)
    const result = await RelatedPosts({ postId: 'abc', lng: 'en' })
    render(result)
    expect(screen.getAllByTestId('post-card')).toHaveLength(3)
  })

  it('handles null publishedAt', async () => {
    mockGetRelatedPosts.mockResolvedValue([{ ...mockPost, publishedAt: null }])
    const result = await RelatedPosts({ postId: 'abc', lng: 'en' })
    render(result)
    expect(screen.getByTestId('post-card')).toBeInTheDocument()
  })

  it('uses es locale', async () => {
    mockGetRelatedPosts.mockResolvedValue([mockPost])
    const result = await RelatedPosts({ postId: 'abc', lng: 'es' })
    render(result)
    expect(screen.getByTestId('post-card')).toBeInTheDocument()
  })

  it('falls back to enUS for unknown locale', async () => {
    mockGetRelatedPosts.mockResolvedValue([mockPost])
    const result = await RelatedPosts({
      postId: 'abc',
      lng: 'fr' as Parameters<typeof RelatedPosts>[0]['lng'],
    })
    render(result)
    expect(screen.getByTestId('post-card')).toBeInTheDocument()
  })
})
