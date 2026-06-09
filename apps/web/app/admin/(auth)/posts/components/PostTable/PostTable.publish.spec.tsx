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
  PublishNotifyModal: ({
    isOpen,
    onPublishAndNotify,
    onPublishOnly,
    onCancel,
  }: {
    isOpen: boolean
    onPublishAndNotify: () => void
    onPublishOnly: () => void
    onCancel: () => void
  }) =>
    isOpen ? (
      <div>
        <button
          type="button"
          data-testid="publish-notify-publish-and-notify"
          onClick={onPublishAndNotify}
        >
          Publish &amp; Notify
        </button>
        <button
          type="button"
          data-testid="publish-notify-publish-only"
          onClick={onPublishOnly}
        >
          Publish Only
        </button>
        <button
          type="button"
          data-testid="publish-notify-cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    ) : null,
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/admin/posts/'),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}))

jest.mock('axios')

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

describe('PostTable — publish / notify', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
      push: mockPush,
    })
    ;(axios.get as jest.Mock).mockResolvedValue({ data: { data: [] } })
    ;(axios.put as jest.Mock).mockResolvedValue({ data: {} })
    ;(axios.delete as jest.Mock).mockResolvedValue({})
  })

  it('publish button disabled when translations incomplete (no titleEs)', () => {
    const post = makePost({ status: 'draft', titleEn: 'Post', titleEs: null })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).toBeDisabled()
  })

  it('publish button disabled when translations incomplete (no titleEn)', () => {
    const post = makePost({ status: 'draft', titleEn: null, titleEs: 'Post' })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).toBeDisabled()
  })

  it('publish button enabled when both translations present', () => {
    const post = makePost({
      status: 'draft',
      titleEn: 'My Post',
      titleEs: 'Mi Post',
    })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).not.toBeDisabled()
  })

  it('publish button enabled when post is published (for unpublishing)', () => {
    const post = makePost({
      status: 'published',
      titleEn: 'My Post',
      titleEs: 'Mi Post',
    })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).not.toBeDisabled()
  })

  it('clicking publish opens publish notify modal', () => {
    const post = makePost({
      id: 'abc123',
      status: 'draft',
      titleEn: 'My Post',
      titleEs: 'Mi Post',
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('publish-button'))
    expect(
      screen.getByTestId('publish-notify-publish-and-notify'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('publish-notify-publish-only'),
    ).toBeInTheDocument()
  })

  it('clicking Publish & Notify calls PUT with status=published and notify=true', async () => {
    const post = makePost({
      id: 'abc123',
      status: 'draft',
      titleEn: 'My Post',
      titleEs: 'Mi Post',
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('publish-button'))
    fireEvent.click(screen.getByTestId('publish-notify-publish-and-notify'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(axios.put).toHaveBeenCalledWith('/api/posts/abc123/', {
      status: 'published',
      notify: true,
    })
    await waitFor(() =>
      expect(screen.getByTestId('publish-button')).toHaveTextContent(
        'Unpublish',
      ),
    )
  })

  it('clicking Publish Only calls PUT with status=published and notify=false', async () => {
    const post = makePost({
      id: 'abc123',
      status: 'draft',
      titleEn: 'My Post',
      titleEs: 'Mi Post',
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('publish-button'))
    fireEvent.click(screen.getByTestId('publish-notify-publish-only'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(axios.put).toHaveBeenCalledWith('/api/posts/abc123/', {
      status: 'published',
      notify: false,
    })
    await waitFor(() =>
      expect(screen.getByTestId('publish-button')).toHaveTextContent(
        'Unpublish',
      ),
    )
  })

  it('cancelling publish notify modal does not call API', async () => {
    const post = makePost({
      id: 'abc123',
      status: 'draft',
      titleEn: 'My Post',
      titleEs: 'Mi Post',
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('publish-button'))
    fireEvent.click(screen.getByTestId('publish-notify-cancel'))
    await new Promise((r) => setTimeout(r, 50))
    expect(axios.put).not.toHaveBeenCalled()
  })

  it('clicking unpublish calls PUT /api/posts/:id with draft status', async () => {
    const post = makePost({
      id: 'pub123',
      status: 'published',
      titleEn: 'My Post',
      titleEs: 'Mi Post',
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('publish-button'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(axios.put).toHaveBeenCalledWith('/api/posts/pub123/', {
      status: 'draft',
    })
    await waitFor(() =>
      expect(screen.getByTestId('publish-button')).toHaveTextContent('Publish'),
    )
  })

  it('shows Unpublish button text for published post', () => {
    const post = makePost({ status: 'published' })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).toHaveTextContent('Unpublish')
  })

  it('shows Publish button text for draft post', () => {
    const post = makePost({ status: 'draft' })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).toHaveTextContent('Publish')
  })

  it('bulk publish opens notify modal then publishes eligible posts and clears selection', async () => {
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
    fireEvent.click(screen.getByTestId('bulk-publish-button'))
    expect(
      screen.getByTestId('publish-notify-publish-and-notify'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('publish-notify-publish-and-notify'))
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1))
    expect(axios.put).toHaveBeenCalledWith('/api/posts/01/', {
      status: 'published',
      notify: true,
    })
    await waitFor(() =>
      expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument(),
    )
  })

  it('bulk publish with Publish Only passes notify=false', async () => {
    const post = makePost({
      id: '01',
      status: 'draft',
      titleEn: 'P1',
      titleEs: 'P1',
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-publish-button'))
    fireEvent.click(screen.getByTestId('publish-notify-publish-only'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(axios.put).toHaveBeenCalledWith('/api/posts/01/', {
      status: 'published',
      notify: false,
    })
  })

  it('bulk publish cancel does not call API and keeps selection', () => {
    const post = makePost({
      id: '01',
      status: 'draft',
      titleEn: 'P1',
      titleEs: 'P1',
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-publish-button'))
    fireEvent.click(screen.getByTestId('publish-notify-cancel'))
    expect(axios.put).not.toHaveBeenCalled()
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument()
  })

  it('bulk publish skips posts with incomplete translations', async () => {
    const post = makePost({
      id: '01',
      status: 'draft',
      titleEn: 'P1',
      titleEs: null,
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-publish-button'))
    fireEvent.click(screen.getByTestId('publish-notify-publish-and-notify'))
    await waitFor(() =>
      expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument(),
    )
    expect(axios.put).not.toHaveBeenCalled()
  })
})
