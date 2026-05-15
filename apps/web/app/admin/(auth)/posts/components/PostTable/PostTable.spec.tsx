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
    t: (key: string) => {
      const translations: Record<string, string> = {
        'posts.searchPlaceholder': 'Search posts…',
        'posts.table.title': 'Title',
        'posts.table.status': 'Status',
        'posts.table.category': 'Category',
        'posts.table.translations': 'Translations',
        'posts.table.published': 'Published',
        'posts.table.createdAt': 'Created',
        'posts.table.updatedAt': 'Updated',
        'posts.table.deletedAt': 'Deleted',
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
        'posts.archiveConfirm': 'Archive this post? You can restore it later.',
        'posts.archiveDisabledPublished': 'Unpublish the post before archiving',
        'posts.empty': 'No posts found',
        'posts.newPost': 'New post',
        refresh: 'Refresh',
        'confirmDelete.confirm': 'Confirm delete',
        'confirmDelete.cancel': 'Cancel delete',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const makePost = (overrides: Partial<AdminPost> = {}): AdminPost => ({
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

  it('clicking all shows all posts', () => {
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

  it('publish button enabled when both translations present (not currently published)', () => {
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

  it('clicking publish calls PUT /api/posts/:id with published status', async () => {
    const post = makePost({
      id: 'abc123',
      status: 'draft',
      titleEn: 'My Post',
      titleEs: 'Mi Post',
    })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('publish-button'))
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(axios.put).toHaveBeenCalledWith('/api/posts/abc123/', {
      status: 'published',
    })
    await waitFor(() =>
      expect(screen.getByTestId('publish-button')).toHaveTextContent(
        'Unpublish',
      ),
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

  it('clicking delete opens modal and confirming calls DELETE and shows post as archived', async () => {
    const post = makePost({ id: 'del123' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    expect(screen.getByTestId('confirm-delete-confirm')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() => expect(axios.delete).toHaveBeenCalled())
    expect(axios.delete).toHaveBeenCalledWith('/api/posts/del123/')
    expect(await screen.findByTestId('unarchive-button')).toBeInTheDocument()
    expect(screen.getByTestId('post-row')).toBeInTheDocument()
  })

  it('delete button is disabled for published post', () => {
    const post = makePost({ status: 'published' })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('delete-button')).toBeDisabled()
  })

  it('delete button is enabled for draft post', () => {
    const post = makePost({ status: 'draft' })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('delete-button')).not.toBeDisabled()
  })

  it('clicking delete opens modal and cancelling does NOT call fetch', () => {
    const post = makePost({ id: 'del456' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    expect(screen.getByTestId('confirm-delete-cancel')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(axios.delete).not.toHaveBeenCalled()
  })

  it('clicking a row navigates to the post edit page', () => {
    const post = makePost({ id: 'edit123' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('post-row'))
    expect(mockPush).toHaveBeenCalledWith('/admin/posts/edit123')
  })

  it('displays em dash when both titleEn and titleEs are null', () => {
    const post = makePost({ titleEn: null, titleEs: null })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    expect(rows[0].querySelector('td')?.textContent).toBe('—')
  })

  it('displays em dash when publishedAt is null', () => {
    const post = makePost({ publishedAt: null })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[4].textContent).toBe('—')
  })

  it('displays formatted date when publishedAt exists', () => {
    const post = makePost({ publishedAt: new Date('2024-06-15') })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[4].textContent).not.toBe('—')
    expect(cells[4].textContent).toBeTruthy()
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

  it('renders archived status badge', () => {
    const post = makePost({ status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('post-row')).toBeInTheDocument()
  })

  it('shows unarchive button for archived post', () => {
    const post = makePost({ status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('unarchive-button')).toBeInTheDocument()
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
  })

  it('publish button is disabled for archived post', () => {
    const post = makePost({
      status: 'archived',
      titleEn: 'Post',
      titleEs: 'Post',
    })
    renderApp(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).toBeDisabled()
  })

  it('clicking unarchive calls PUT with draft status and updates UI', async () => {
    const post = makePost({ id: 'arc123', status: 'archived' })
    renderApp(<PostTable posts={[post]} />)
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
    expect(screen.getByTestId('delete-button')).toBeInTheDocument()
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

  it('displays formatted createdAt date', () => {
    const post = makePost({ createdAt: new Date('2024-03-10') })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[5].textContent).toBeTruthy()
    expect(cells[5].textContent).not.toBe('—')
  })

  it('displays em dash when deletedAt is null', () => {
    const post = makePost({ deletedAt: null })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[7].textContent).toBe('—')
  })

  it('displays formatted deletedAt date when set', () => {
    const post = makePost({ deletedAt: new Date('2024-05-01') })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[7].textContent).not.toBe('—')
    expect(cells[7].textContent).toBeTruthy()
  })

  it('displays formatted updatedAt date', () => {
    const post = makePost({ updatedAt: new Date('2024-04-20') })
    renderApp(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[6].textContent).toBeTruthy()
    expect(cells[6].textContent).not.toBe('—')
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
    fireEvent.click(screen.getAllByTestId('delete-button')[0])
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
    fireEvent.click(screen.getAllByTestId('unarchive-button')[0])
    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(screen.getByText('Post Two')).toBeInTheDocument()
  })
})
