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
    onPublishOnly,
  }: {
    isOpen: boolean
    onPublishOnly: () => void
  }) =>
    isOpen ? (
      <button
        type="button"
        data-testid="publish-notify-publish-only"
        onClick={onPublishOnly}
      >
        Publish Only
      </button>
    ) : null,
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

describe('PostTable', () => {
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

  it('renders all posts initially', () => {
    const posts = [
      makePost({ id: '01', titleEn: 'Post One' }),
      makePost({ id: '02', titleEn: 'Post Two', status: 'published' }),
    ]
    renderApp(<PostTable posts={posts} />)
    expect(screen.getAllByTestId('post-row')).toHaveLength(2)
    expect(screen.getByText('Post One')).toBeInTheDocument()
    expect(screen.getByText('Post Two')).toBeInTheDocument()
  })

  it('filter tabs: clicking published shows only published posts', () => {
    const posts = [
      makePost({ id: '01', titleEn: 'Draft Post', status: 'draft' }),
      makePost({ id: '02', titleEn: 'Published Post', status: 'published' }),
    ]
    renderApp(<PostTable posts={posts} />)
    fireEvent.click(screen.getByTestId('filter-published'))
    const rows = screen.getAllByTestId('post-row')
    expect(rows).toHaveLength(1)
    expect(screen.getByText('Published Post')).toBeInTheDocument()
    expect(screen.queryByText('Draft Post')).not.toBeInTheDocument()
  })

  it('filter tabs: clicking draft shows only draft posts', () => {
    const posts = [
      makePost({ id: '01', titleEn: 'Draft Post', status: 'draft' }),
      makePost({ id: '02', titleEn: 'Published Post', status: 'published' }),
    ]
    renderApp(<PostTable posts={posts} />)
    fireEvent.click(screen.getByTestId('filter-draft'))
    const rows = screen.getAllByTestId('post-row')
    expect(rows).toHaveLength(1)
    expect(screen.getByText('Draft Post')).toBeInTheDocument()
    expect(screen.queryByText('Published Post')).not.toBeInTheDocument()
  })

  it('filter tabs: clicking archived shows only archived posts', () => {
    const posts = [
      makePost({ id: '01', titleEn: 'Draft Post', status: 'draft' }),
      makePost({ id: '02', titleEn: 'Archived Post', status: 'archived' }),
    ]
    renderApp(<PostTable posts={posts} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    const rows = screen.getAllByTestId('post-row')
    expect(rows).toHaveLength(1)
    expect(screen.getByText('Archived Post')).toBeInTheDocument()
    expect(screen.queryByText('Draft Post')).not.toBeInTheDocument()
  })

  it('initialises filter from URL search params', () => {
    const { useSearchParams } = jest.requireMock('next/navigation') as {
      useSearchParams: jest.Mock
    }
    useSearchParams.mockReturnValueOnce(new URLSearchParams('filter=archived'))
    const posts = [
      makePost({ id: '01', titleEn: 'Draft Post', status: 'draft' }),
      makePost({ id: '02', titleEn: 'Archived Post', status: 'archived' }),
    ]
    renderApp(<PostTable posts={posts} />)
    expect(screen.getByTestId('filter-archived')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('Archived Post')).toBeInTheDocument()
    expect(screen.queryByText('Draft Post')).not.toBeInTheDocument()
  })

  it('all tab excludes archived posts', () => {
    const posts = [
      makePost({ id: '01', titleEn: 'Draft Post', status: 'draft' }),
      makePost({ id: '02', titleEn: 'Archived Post', status: 'archived' }),
    ]
    renderApp(<PostTable posts={posts} />)
    expect(screen.getAllByTestId('post-row')).toHaveLength(1)
    expect(screen.getByText('Draft Post')).toBeInTheDocument()
    expect(screen.queryByText('Archived Post')).not.toBeInTheDocument()
  })

  it('clicking all shows all non-archived posts', () => {
    const posts = [
      makePost({ id: '01', titleEn: 'Draft Post', status: 'draft' }),
      makePost({ id: '02', titleEn: 'Published Post', status: 'published' }),
    ]
    renderApp(<PostTable posts={posts} />)
    fireEvent.click(screen.getByTestId('filter-published'))
    fireEvent.click(screen.getByTestId('filter-all'))
    expect(screen.getAllByTestId('post-row')).toHaveLength(2)
  })

  it('search filters by titleEn', () => {
    const posts = [
      makePost({ id: '01', titleEn: 'React Basics' }),
      makePost({ id: '02', titleEn: 'CSS Tips' }),
    ]
    renderApp(<PostTable posts={posts} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'react' },
    })
    expect(screen.getAllByTestId('post-row')).toHaveLength(1)
    expect(screen.getByText('React Basics')).toBeInTheDocument()
    expect(screen.queryByText('CSS Tips')).not.toBeInTheDocument()
  })

  it('search falls back to titleEs when titleEn null', () => {
    const posts = [
      makePost({ id: '01', titleEn: null, titleEs: 'Básicos de React' }),
      makePost({ id: '02', titleEn: null, titleEs: 'Trucos CSS' }),
    ]
    renderApp(<PostTable posts={posts} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'básicos' },
    })
    expect(screen.getAllByTestId('post-row')).toHaveLength(1)
    expect(screen.getByText('Básicos de React')).toBeInTheDocument()
  })

  it('translation indicators show present when both translations exist', () => {
    const post = makePost({ titleEn: 'My Post', titleEs: 'Mi Post' })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('lang-chip-en')).toHaveAttribute(
      'data-present',
      'true',
    )
    expect(screen.getByTestId('lang-chip-es')).toHaveAttribute(
      'data-present',
      'true',
    )
  })

  it('translation indicators show absent when ES translation missing', () => {
    const post = makePost({ titleEn: 'My Post', titleEs: null })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('lang-chip-en')).toHaveAttribute(
      'data-present',
      'true',
    )
    expect(screen.getByTestId('lang-chip-es')).toHaveAttribute(
      'data-present',
      'false',
    )
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

  it('clicking archive button opens modal and confirming calls DELETE and removes post from all-tab', async () => {
    const post = makePost({ id: 'del123' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('archive-button'))
    expect(screen.getByTestId('confirm-delete-confirm')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(axios.delete).toHaveBeenCalled())
    expect(axios.delete).toHaveBeenCalledWith('/api/posts/del123/')
    await waitFor(() =>
      expect(screen.queryByTestId('post-row')).not.toBeInTheDocument(),
    )
  })

  it('clicking archive and confirming moves post to archived tab', async () => {
    const post = makePost({ id: 'del123' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('archive-button'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(axios.delete).toHaveBeenCalled())
    fireEvent.click(screen.getByTestId('filter-archived'))
    expect(await screen.findByTestId('unarchive-button')).toBeInTheDocument()
    expect(screen.getByTestId('hard-delete-button')).toBeInTheDocument()
  })

  it('archive button is disabled for published post', () => {
    const post = makePost({ status: 'published' })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('archive-button')).toBeDisabled()
  })

  it('archive button is enabled for draft post', () => {
    const post = makePost({ status: 'draft' })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('archive-button')).not.toBeDisabled()
  })

  it('clicking archive button opens modal and cancelling does NOT call fetch', () => {
    const post = makePost({ id: 'del456' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('archive-button'))
    expect(screen.getByTestId('confirm-delete-cancel')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(axios.delete).not.toHaveBeenCalled()
  })

  it('clicking the edit button navigates to the post edit page', () => {
    const post = makePost({ id: 'edit123' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    expect(mockPush).toHaveBeenCalledWith('/admin/posts/edit123')
  })

  it('displays em dash when both titleEn and titleEs are null', () => {
    const post = makePost({ titleEn: null, titleEs: null })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    expect(rows[0].querySelectorAll('td')[1]?.textContent).toBe('—')
  })

  it('displays em dash when publishedAt is null', () => {
    const post = makePost({ publishedAt: null })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[5].textContent).toBe('—')
  })

  it('displays formatted date when publishedAt exists', () => {
    const post = makePost({ publishedAt: new Date('2024-06-15') })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[5].textContent).not.toBe('—')
    expect(cells[5].textContent).toBeTruthy()
  })

  it('renders archived status badge', () => {
    const post = makePost({ status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    expect(screen.getByTestId('post-row')).toBeInTheDocument()
  })

  it('shows unarchive and hard-delete buttons for archived post', () => {
    const post = makePost({ status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    expect(screen.getByTestId('unarchive-button')).toBeInTheDocument()
    expect(screen.getByTestId('hard-delete-button')).toBeInTheDocument()
    expect(screen.queryByTestId('archive-button')).not.toBeInTheDocument()
  })

  it('publish button is not shown for archived post', () => {
    const post = makePost({
      status: 'archived',
      titleEn: 'Post',
      titleEs: 'Post',
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    expect(screen.queryByTestId('publish-button')).not.toBeInTheDocument()
  })

  it('clicking unarchive calls PUT with draft status and updates UI', async () => {
    const post = makePost({ id: 'arc123', status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    fireEvent.click(screen.getByTestId('unarchive-button'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(axios.put).toHaveBeenCalledWith('/api/posts/arc123/', {
      status: 'draft',
    })
    await waitFor(() =>
      expect(screen.queryByTestId('unarchive-button')).not.toBeInTheDocument(),
    )
  })

  it('shows archive button for draft post (not unarchive)', () => {
    const post = makePost({ status: 'draft' })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('archive-button')).toBeInTheDocument()
    expect(screen.queryByTestId('unarchive-button')).not.toBeInTheDocument()
  })

  it('shows empty state when no posts match search', () => {
    const post = makePost({ titleEn: 'React Basics', titleEs: null })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'zzznomatch' },
    })
    expect(screen.queryByTestId('post-row')).not.toBeInTheDocument()
    expect(screen.getByText('No posts found')).toBeInTheDocument()
  })

  it('new post button navigates to /admin/posts/new on click', () => {
    renderApp(<PostTable posts={[]} />)
    fireEvent.click(screen.getByTestId('new-post-button'))
    expect(mockPush).toHaveBeenCalledWith('/admin/posts/new')
  })

  it('refresh button fetches posts from API', async () => {
    const freshPost = makePost({ titleEn: 'Fresh Post' })
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      data: {
        data: [
          {
            ...freshPost,
            createdAt: freshPost.createdAt.toISOString(),
            updatedAt: freshPost.updatedAt.toISOString(),
            publishedAt: null,
            deletedAt: null,
            scheduledAt: null,
          },
        ],
      },
    })
    renderApp(<PostTable posts={[]} />)
    fireEvent.click(screen.getByTestId('refresh-button'))
    expect(await screen.findByText('Fresh Post')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalledWith('/api/posts?status=all')
  })

  it('displays em dash when scheduledAt is null', () => {
    const post = makePost({ scheduledAt: null })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[6].textContent).toBe('—')
  })

  it('displays formatted scheduledAt date when set', () => {
    const post = makePost({ scheduledAt: new Date('2024-09-01') })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[6].textContent).not.toBe('—')
    expect(cells[6].textContent).toBeTruthy()
  })

  it('displays formatted createdAt date', () => {
    const post = makePost({ createdAt: new Date('2024-03-10') })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[7].textContent).toBeTruthy()
    expect(cells[7].textContent).not.toBe('—')
  })

  it('displays em dash when deletedAt is null', () => {
    const post = makePost({ deletedAt: null })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[9].textContent).toBe('—')
  })

  it('displays formatted deletedAt date when set', () => {
    const post = makePost({
      status: 'archived',
      deletedAt: new Date('2024-05-01'),
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[9].textContent).not.toBe('—')
    expect(cells[9].textContent).toBeTruthy()
  })

  it('displays formatted updatedAt date', () => {
    const post = makePost({ updatedAt: new Date('2024-04-20') })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[8].textContent).toBeTruthy()
    expect(cells[8].textContent).not.toBe('—')
  })

  it('refresh deserializes non-null publishedAt, deletedAt, scheduledAt', async () => {
    const freshPost = makePost({ titleEn: 'Fresh Post' })
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      data: {
        data: [
          {
            ...freshPost,
            createdAt: freshPost.createdAt.toISOString(),
            updatedAt: freshPost.updatedAt.toISOString(),
            publishedAt: '2024-06-01T00:00:00Z',
            deletedAt: '2024-07-01T00:00:00Z',
            scheduledAt: '2024-08-01T00:00:00Z',
          },
        ],
      },
    })
    renderApp(<PostTable posts={[]} />)
    fireEvent.click(screen.getByTestId('refresh-button'))
    expect(await screen.findByText('Fresh Post')).toBeInTheDocument()
  })

  it('archiving one post keeps other posts visible', async () => {
    const post1 = makePost({ id: 'del123', titleEn: 'Post One' })
    const post2 = makePost({ id: 'other', titleEn: 'Post Two' })
    renderApp(<PostTable posts={[post1, post2]} />)
    fireEvent.click(screen.getAllByTestId('archive-button')[0])
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(axios.delete).toHaveBeenCalled())
    expect(screen.getByText('Post Two')).toBeInTheDocument()
  })

  it('publishing one post keeps other posts unchanged', async () => {
    const post1 = makePost({
      id: 'pub123',
      titleEn: 'Post One',
      titleEs: 'Post Uno',
    })
    const post2 = makePost({
      id: 'other',
      titleEn: 'Post Two',
      titleEs: 'Post Dos',
    })
    renderApp(<PostTable posts={[post1, post2]} />)
    fireEvent.click(screen.getAllByTestId('publish-button')[0])
    fireEvent.click(screen.getByTestId('publish-notify-publish-only'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(screen.getByText('Post Two')).toBeInTheDocument()
  })

  it('unarchiving one post keeps other posts unchanged', async () => {
    const post1 = makePost({
      id: 'arc123',
      status: 'archived',
      titleEn: 'Post One',
    })
    const post2 = makePost({
      id: 'other',
      status: 'archived',
      titleEn: 'Post Two',
    })
    renderApp(<PostTable posts={[post1, post2]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    fireEvent.click(screen.getAllByTestId('unarchive-button')[0])
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(screen.getByText('Post Two')).toBeInTheDocument()
  })

  it('hard delete button opens confirm modal', () => {
    const post = makePost({ status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    fireEvent.click(screen.getByTestId('hard-delete-button'))
    expect(screen.getByTestId('confirm-delete-confirm')).toBeInTheDocument()
  })

  it('confirming hard delete calls DELETE with ?hard=true and removes post', async () => {
    const post = makePost({ id: 'hd123', status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    fireEvent.click(screen.getByTestId('hard-delete-button'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(axios.delete).toHaveBeenCalled())
    expect(axios.delete).toHaveBeenCalledWith('/api/posts/hd123/?hard=true')
    await waitFor(() =>
      expect(screen.queryByTestId('post-row')).not.toBeInTheDocument(),
    )
  })

  it('cancelling hard delete does not call API', () => {
    const post = makePost({ status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    fireEvent.click(screen.getByTestId('hard-delete-button'))
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(axios.delete).not.toHaveBeenCalled()
  })

  it('hard deleting one post keeps other archived posts visible', async () => {
    const post1 = makePost({
      id: 'hd123',
      status: 'archived',
      titleEn: 'To Delete',
    })
    const post2 = makePost({
      id: 'other',
      status: 'archived',
      titleEn: 'Keep This',
    })
    renderApp(<PostTable posts={[post1, post2]} />)
    fireEvent.click(screen.getByTestId('filter-archived'))
    fireEvent.click(screen.getAllByTestId('hard-delete-button')[0])
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(axios.delete).toHaveBeenCalled())
    expect(screen.getByText('Keep This')).toBeInTheDocument()
  })

  it('unpublishing one post keeps other posts unchanged', async () => {
    const post1 = makePost({
      id: 'pub123',
      status: 'published',
      titleEn: 'Post One',
    })
    const post2 = makePost({
      id: 'other',
      status: 'published',
      titleEn: 'Post Two',
    })
    renderApp(<PostTable posts={[post1, post2]} />)
    fireEvent.click(screen.getAllByTestId('publish-button')[0])
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(screen.getByText('Post Two')).toBeInTheDocument()
  })

  it('renders a checkbox for each row', () => {
    const posts = [makePost({ id: '01' }), makePost({ id: '02' })]
    renderApp(<PostTable posts={posts} />)
    expect(screen.getAllByTestId('row-checkbox')).toHaveLength(2)
  })

  it('renders a select-all checkbox in the header', () => {
    renderApp(<PostTable posts={[makePost()]} />)
    expect(screen.getByTestId('select-all-checkbox')).toBeInTheDocument()
  })
})
