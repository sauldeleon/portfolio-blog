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

describe('PostTable — bulk operations', () => {
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

  it('bulk actions not visible when no rows selected', () => {
    renderApp(<PostTable posts={[makePost({ id: '01' })]} />)
    expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument()
  })

  it('checking a row checkbox shows bulk actions', () => {
    renderApp(<PostTable posts={[makePost({ id: '01' })]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument()
  })

  it('unchecking a row checkbox hides bulk actions when nothing selected', () => {
    renderApp(<PostTable posts={[makePost({ id: '01' })]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('row-checkbox'))
    expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument()
  })

  it('select-all selects all visible rows', () => {
    const posts = [makePost({ id: '01' }), makePost({ id: '02' })]
    renderApp(<PostTable posts={posts} />)
    fireEvent.click(screen.getByTestId('select-all-checkbox'))
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument()
    screen
      .getAllByTestId('row-checkbox')
      .forEach((cb) => expect(cb).toBeChecked())
  })

  it('select-all unchecks deselects all rows', () => {
    const posts = [makePost({ id: '01' }), makePost({ id: '02' })]
    renderApp(<PostTable posts={posts} />)
    fireEvent.click(screen.getByTestId('select-all-checkbox'))
    fireEvent.click(screen.getByTestId('select-all-checkbox'))
    expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument()
  })

  it('select-all checkbox is checked when all rows are selected', () => {
    renderApp(<PostTable posts={[makePost({ id: '01' })]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    expect(screen.getByTestId('select-all-checkbox')).toBeChecked()
  })

  it('select-all checkbox is unchecked when no rows are selected', () => {
    renderApp(<PostTable posts={[makePost({ id: '01' })]} />)
    expect(screen.getByTestId('select-all-checkbox')).not.toBeChecked()
  })

  it('clicking row checkbox does not navigate to post edit', () => {
    renderApp(<PostTable posts={[makePost({ id: 'nav123' })]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('switching filter tabs clears selection', () => {
    const posts = [
      makePost({ id: '01', status: 'draft', titleEn: 'P1' }),
      makePost({ id: '02', status: 'published', titleEn: 'P2' }),
    ]
    renderApp(<PostTable posts={posts} />)
    fireEvent.click(screen.getAllByTestId('row-checkbox')[0])
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('filter-published'))
    expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument()
  })

  it('shows Publish, Unpublish, Archive bulk buttons in all tab', () => {
    renderApp(<PostTable posts={[makePost({ id: '01' })]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    expect(screen.getByTestId('bulk-publish-button')).toBeInTheDocument()
    expect(screen.getByTestId('bulk-unpublish-button')).toBeInTheDocument()
    expect(screen.getByTestId('bulk-archive-button')).toBeInTheDocument()
    expect(screen.queryByTestId('bulk-delete-button')).not.toBeInTheDocument()
  })

  it('shows Unarchive and Delete bulk buttons in archived tab', () => {
    const post = makePost({ id: '01', status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    fireEvent.click(screen.getByTestId('row-checkbox'))
    expect(screen.getByTestId('bulk-unarchive-button')).toBeInTheDocument()
    expect(screen.getByTestId('bulk-delete-button')).toBeInTheDocument()
    expect(screen.queryByTestId('bulk-publish-button')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('bulk-unpublish-button'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('bulk-archive-button')).not.toBeInTheDocument()
  })

  it('bulk unpublish opens confirm modal then unpublishes only published posts and clears selection', async () => {
    const post1 = makePost({
      id: '01',
      status: 'published',
      titleEn: 'P1',
      titleEs: 'P1',
    })
    const post2 = makePost({
      id: '02',
      status: 'draft',
      titleEn: 'P2',
      titleEs: 'P2',
    })
    renderApp(<PostTable posts={[post1, post2]} />)
    fireEvent.click(screen.getByTestId('select-all-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-unpublish-button'))
    expect(screen.getByTestId('confirm-delete-confirm')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1))
    expect(axios.put).toHaveBeenCalledWith('/api/posts/01/', {
      status: 'draft',
    })
    await waitFor(() =>
      expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument(),
    )
  })

  it('bulk unpublish cancel does not call API and keeps selection', () => {
    const post = makePost({
      id: '01',
      status: 'published',
      titleEn: 'P1',
      titleEs: 'P1',
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-unpublish-button'))
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(axios.put).not.toHaveBeenCalled()
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument()
  })

  it('bulk archive opens confirm modal then archives only draft posts and clears selection', async () => {
    const post1 = makePost({
      id: '01',
      status: 'draft',
      titleEn: 'P1',
      titleEs: 'P1',
    })
    const post2 = makePost({
      id: '02',
      status: 'published',
      titleEn: 'P2',
      titleEs: 'P2',
    })
    renderApp(<PostTable posts={[post1, post2]} />)
    fireEvent.click(screen.getByTestId('select-all-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-archive-button'))
    expect(screen.getByTestId('confirm-delete-confirm')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1))
    expect(axios.delete).toHaveBeenCalledWith('/api/posts/01/')
    await waitFor(() =>
      expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument(),
    )
  })

  it('bulk archive cancel does not call API and keeps selection', () => {
    const post = makePost({ id: '01', status: 'draft' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-archive-button'))
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(axios.delete).not.toHaveBeenCalled()
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument()
  })

  it('bulk unarchive opens confirm modal then unarchives selected posts and clears selection', async () => {
    const post1 = makePost({
      id: '01',
      status: 'archived',
      titleEn: 'Restore Me',
      deletedAt: new Date('2024-06-01'),
    })
    const post2 = makePost({
      id: '02',
      status: 'archived',
      titleEn: 'Keep Archived',
      deletedAt: new Date('2024-06-01'),
    })
    renderApp(<PostTable posts={[post1, post2]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    fireEvent.click(screen.getAllByTestId('row-checkbox')[0])
    fireEvent.click(screen.getByTestId('bulk-unarchive-button'))
    expect(screen.getByTestId('confirm-delete-confirm')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1))
    expect(axios.put).toHaveBeenCalledWith('/api/posts/01/', {
      status: 'draft',
    })
    expect(screen.getByText('Keep Archived')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument(),
    )
  })

  it('bulk unarchive cancel does not call API and keeps selection', () => {
    const post = makePost({ id: '01', status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-unarchive-button'))
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(axios.put).not.toHaveBeenCalled()
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument()
  })

  it('bulk delete opens confirm modal then hard-deletes only selected posts and keeps others', async () => {
    const post1 = makePost({
      id: '01',
      status: 'archived',
      titleEn: 'Delete Me',
    })
    const post2 = makePost({
      id: '02',
      status: 'archived',
      titleEn: 'Keep Me',
    })
    renderApp(<PostTable posts={[post1, post2]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    fireEvent.click(screen.getAllByTestId('row-checkbox')[0])
    fireEvent.click(screen.getByTestId('bulk-delete-button'))
    expect(screen.getByTestId('confirm-delete-confirm')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1))
    expect(axios.delete).toHaveBeenCalledWith('/api/posts/01/?hard=true')
    expect(screen.getByText('Keep Me')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument(),
    )
  })

  it('bulk delete cancel does not call API and keeps selection', () => {
    const post = makePost({ id: '01', status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-delete-button'))
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(axios.delete).not.toHaveBeenCalled()
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument()
  })
})
