import { fireEvent, screen, waitFor } from '@testing-library/react'
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
        'posts.table.actions': 'Actions',
        'posts.filters.all': 'All',
        'posts.filters.published': 'Published',
        'posts.filters.draft': 'Draft',
        'posts.filters.archived': 'Archived',
        'posts.edit': 'Edit',
        'posts.publish': 'Publish',
        'posts.unpublish': 'Unpublish',
        'posts.delete': 'Delete',
        'posts.deleteConfirm': 'Delete this post?',
        'posts.empty': 'No posts found',
        'posts.newPost': 'New post',
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
    jest.spyOn(window, 'confirm').mockReturnValue(true)
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
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
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/posts/abc123', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"status":"published"'),
    })
    expect(mockRefresh).toHaveBeenCalled()
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
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/posts/pub123', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"status":"draft"'),
    })
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('clicking delete with confirm=true calls DELETE and refreshes', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true)
    const post = makePost({ id: 'del123' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/posts/del123', {
      method: 'DELETE',
    })
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('clicking delete with confirm=false does NOT call fetch', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false)
    const post = makePost({ id: 'del456' })
    renderApp(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    await waitFor(() => expect(window.confirm).toHaveBeenCalled())
    expect(global.fetch).not.toHaveBeenCalled()
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
})
