import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import type { Mock } from 'vitest'

import { renderApp } from '@sdlgr/test-utils'

import type { AdminPost } from '@web/lib/db/queries/posts'

import { PostTable } from './PostTable'

const mockRefresh = vi.fn()
const mockPush = vi.fn()
const mockReplace = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: vi.fn().mockReturnValue({
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
        'pagination.previous': '← Prev',
        'pagination.next': 'Next →',
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

vi.mock('@web/app/admin/(auth)/components/PublishNotifyModal', () => ({
  PublishNotifyModal: () => null,
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn().mockReturnValue('/admin/posts/'),
  useSearchParams: () => mockSearchParams,
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
  commentsEnabled: false,
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

  const pagination = () =>
    screen.queryByRole('navigation', { name: 'pagination' })

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    ;(useRouter as Mock).mockReturnValue({
      refresh: mockRefresh,
      push: mockPush,
      replace: mockReplace,
    })
    vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: [] } })
    vi.spyOn(axios, 'put').mockResolvedValue({ data: {} })
    vi.spyOn(axios, 'delete').mockResolvedValue({ data: {} })
  })

  it('does not render pagination when posts <= 20', () => {
    renderApp(<PostTable posts={[makePost()]} />)
    expect(pagination()).not.toBeInTheDocument()
  })

  it('renders pagination and the first 20 rows when posts > 20', () => {
    renderApp(<PostTable posts={make21Posts()} />)
    expect(pagination()).toBeInTheDocument()
    expect(screen.getAllByTestId('post-row')).toHaveLength(20)
    expect(screen.getByText('Post 0')).toBeInTheDocument()
    expect(screen.queryByText('Post 20')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '← Prev' })).toBeDisabled()
  })

  it('shows the page from the URL', () => {
    mockSearchParams = new URLSearchParams('page=2')
    renderApp(<PostTable posts={make21Posts()} />)
    expect(screen.getAllByTestId('post-row')).toHaveLength(1)
    expect(screen.getByText('Post 20')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next →' })).toBeDisabled()
  })

  it('clamps a page past the end to the last page', () => {
    mockSearchParams = new URLSearchParams('page=9')
    renderApp(<PostTable posts={make21Posts()} />)
    expect(screen.getAllByTestId('post-row')).toHaveLength(1)
  })

  it('navigates to the next page through the URL', () => {
    renderApp(<PostTable posts={make21Posts()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }))
    expect(mockPush).toHaveBeenCalledWith('/admin/posts/?page=2')
  })

  it('changing filter drops the page from the URL', () => {
    mockSearchParams = new URLSearchParams('page=2')
    renderApp(<PostTable posts={make21Posts()} />)
    fireEvent.click(screen.getByTestId('filter-published'))
    expect(mockPush).toHaveBeenCalledWith('/admin/posts/?filter=published', {
      scroll: false,
    })
  })

  it('changing search resets to page 1', () => {
    mockSearchParams = new URLSearchParams('page=2')
    renderApp(<PostTable posts={make21Posts()} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'Post' },
    })
    expect(mockReplace).toHaveBeenCalledWith('/admin/posts/')
  })

  it('auto-adjusts to last page when current page becomes empty', async () => {
    mockSearchParams = new URLSearchParams('page=2')
    renderApp(<PostTable posts={make21Posts()} />)
    expect(screen.getAllByTestId('post-row')).toHaveLength(1)
    fireEvent.click(screen.getByTestId('archive-button'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(pagination()).not.toBeInTheDocument())
    expect(screen.getAllByTestId('post-row')).toHaveLength(20)
  })
})
