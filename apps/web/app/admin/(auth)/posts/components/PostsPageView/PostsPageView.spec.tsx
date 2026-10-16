import { screen } from '@testing-library/react'
import type { Mock } from 'vitest'

import { renderApp } from '@sdlgr/test-utils'

import type { AdminPost } from '@web/lib/db/queries/posts'

import { PostsPageView } from './PostsPageView'

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: vi.fn().mockReturnValue({
    t: (key: string) => key,
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({ refresh: vi.fn(), push: vi.fn() }),
  usePathname: vi.fn().mockReturnValue('/admin/posts/'),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}))

const mockPosts: AdminPost[] = [
  {
    id: '01JWTEST',
    category: 'engineering',
    tags: ['react'],
    status: 'draft',
    coverImage: null,
    seriesId: null,
    seriesOrder: null,
    scheduledAt: null,
    publishedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    previewToken: 'tok',
    titleEn: 'Test Post',
    slugEn: 'test-post',
    titleEs: 'Post de prueba',
    slugEs: 'post-de-prueba',
  },
]

describe('PostsPageView', () => {
  it('renders the page wrapper', () => {
    renderApp(<PostsPageView posts={mockPosts} title="Posts" />)
    expect(screen.getByTestId('admin-posts-page')).toBeInTheDocument()
  })

  it('renders the heading', () => {
    renderApp(<PostsPageView posts={mockPosts} title="Posts" />)
    expect(screen.getByRole('heading', { name: 'Posts' })).toBeInTheDocument()
  })

  it('renders the post table', () => {
    renderApp(<PostsPageView posts={mockPosts} title="Posts" />)
    expect(screen.getByTestId('post-table')).toBeInTheDocument()
  })

  it('archived tab is active when URL has ?filter=archived', async () => {
    const { useSearchParams } =
      (await import('next/navigation')) as unknown as {
        useSearchParams: Mock
      }
    useSearchParams.mockReturnValueOnce(new URLSearchParams('filter=archived'))
    const archivedPost = {
      ...mockPosts[0],
      id: '02',
      titleEn: 'Archived Post',
      status: 'archived' as const,
    }
    renderApp(<PostsPageView posts={[archivedPost]} title="Posts" />)
    expect(screen.getByTestId('filter-archived')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('Archived Post')).toBeInTheDocument()
  })
})
