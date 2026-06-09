import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import type { AdminPost } from '@web/lib/db/queries/posts'

import { PostTable } from './PostTable'

const mockRefresh = jest.fn()
const mockPush = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string, vars?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'posts.searchPlaceholder': 'Search posts…',
        'posts.table.title': 'Title',
        'posts.table.status': 'Status',
        'posts.table.category': 'Category',
        'posts.table.translations': 'Translations',
        'posts.table.published': 'Published',
        'posts.table.scheduledAt': 'Scheduled',
        'posts.table.createdAt': 'Created',
        'posts.table.updatedAt': 'Updated',
        'posts.table.archived': 'Archived',
        'posts.table.actions': 'Actions',
        'posts.filters.all': 'All',
        'posts.filters.published': 'Published',
        'posts.filters.draft': 'Draft',
        'posts.filters.archived': 'Archived',
        'posts.edit': 'Edit',
        'posts.publish': 'Publish',
        'posts.unpublish': 'Unpublish',
        'posts.archive': 'Archive',
        'posts.unarchive': 'Unarchive',
        'posts.hardDelete': 'Delete',
        'posts.archiveConfirm': 'Archive this post? You can restore it later.',
        'posts.hardDeleteConfirm':
          'Permanently delete this post? This cannot be undone.',
        'posts.bulkPublishConfirm': 'Publish selected posts?',
        'posts.bulkUnpublishConfirm': 'Unpublish selected posts?',
        'posts.bulkArchiveConfirm': 'Archive selected posts?',
        'posts.bulkUnarchiveConfirm': 'Unarchive selected posts?',
        'posts.bulkDeleteConfirm': 'Permanently delete selected posts?',
        'posts.archiveDisabledPublished': 'Unpublish the post before archiving',
        'posts.empty': 'No posts found',
        'posts.newPost': 'New post',
        'posts.pagination.prev': '← Prev',
        'posts.pagination.next': 'Next →',
        'posts.pagination.pageOf': '{{page}} of {{total}}',
        refresh: 'Refresh',
        'confirmDelete.confirm': 'Confirm delete',
        'confirmDelete.cancel': 'Cancel delete',
        'publishNotify.message': 'Notify subscribers?',
        'publishNotify.publishAndNotify': 'Publish & Notify',
        'publishNotify.publishOnly': 'Publish Only',
        'publishNotify.cancel': 'Cancel',
      }
      let result = translations[key] ?? key
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, String(v))
        })
      }
      return result
    },
  }),
}))

jest.mock('@web/app/admin/(auth)/components/PublishNotifyModal', () => ({
  PublishNotifyModal: () => null,
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/admin/posts/'),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}))

const makePost = (overrides: Partial<AdminPost> = {}): AdminPost => ({
  id: '01JWTEST',
  category: 'engineering',
  tags: ['react'],
  status: 'draft',
  coverImage: null,
  coverImageFit: null,
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
  ...overrides,
})

describe('PostTable — pagination', () => {
  const make21Posts = () =>
    Array.from({ length: 21 }, (_, i) =>
      makePost({ id: `p${i}`, titleEn: `Post ${i}` }),
    )

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
      push: mockPush,
    })
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: [] } })
    jest.spyOn(axios, 'put').mockResolvedValue({ data: {} })
    jest.spyOn(axios, 'delete').mockResolvedValue({ data: {} })
  })

  it('does not render pagination when posts <= 20', () => {
    renderApp(<PostTable posts={[makePost()]} />)
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  it('renders pagination when posts > 20', () => {
    renderApp(<PostTable posts={make21Posts()} />)
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('1 of 2')
  })

  it('shows only first 20 rows on page 1', () => {
    renderApp(<PostTable posts={make21Posts()} />)
    expect(screen.getAllByTestId('post-row')).toHaveLength(20)
    expect(screen.getByText('Post 0')).toBeInTheDocument()
    expect(screen.queryByText('Post 20')).not.toBeInTheDocument()
  })

  it('prev button is disabled on first page', () => {
    renderApp(<PostTable posts={make21Posts()} />)
    expect(screen.getByTestId('pagination-prev')).toBeDisabled()
  })

  it('next button is disabled on last page', () => {
    renderApp(<PostTable posts={make21Posts()} />)
    fireEvent.click(screen.getByTestId('pagination-next'))
    expect(screen.getByTestId('pagination-next')).toBeDisabled()
  })

  it('clicking next shows page 2 with remaining rows', () => {
    renderApp(<PostTable posts={make21Posts()} />)
    fireEvent.click(screen.getByTestId('pagination-next'))
    expect(screen.getAllByTestId('post-row')).toHaveLength(1)
    expect(screen.getByText('Post 20')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('2 of 2')
  })

  it('clicking prev returns to page 1', () => {
    renderApp(<PostTable posts={make21Posts()} />)
    fireEvent.click(screen.getByTestId('pagination-next'))
    fireEvent.click(screen.getByTestId('pagination-prev'))
    expect(screen.getAllByTestId('post-row')).toHaveLength(20)
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('1 of 2')
  })

  it('changing filter resets to page 1', () => {
    const posts = [
      ...Array.from({ length: 21 }, (_, i) =>
        makePost({ id: `d${i}`, titleEn: `Draft ${i}`, status: 'draft' }),
      ),
      makePost({ id: 'p1', titleEn: 'Published', status: 'published' }),
    ]
    renderApp(<PostTable posts={posts} />)
    fireEvent.click(screen.getByTestId('pagination-next'))
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('2 of 2')
    fireEvent.click(screen.getByTestId('filter-published'))
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  it('changing search resets to page 1', () => {
    renderApp(<PostTable posts={make21Posts()} />)
    fireEvent.click(screen.getByTestId('pagination-next'))
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'Post' },
    })
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('1 of 2')
  })

  it('auto-adjusts to last page when current page becomes empty', async () => {
    renderApp(<PostTable posts={make21Posts()} />)
    fireEvent.click(screen.getByTestId('pagination-next'))
    expect(screen.getAllByTestId('post-row')).toHaveLength(1)
    fireEvent.click(screen.getByTestId('archive-button'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() =>
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument(),
    )
    expect(screen.getAllByTestId('post-row')).toHaveLength(20)
  })
})
