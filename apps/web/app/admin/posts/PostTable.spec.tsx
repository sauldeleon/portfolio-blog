import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import type { AdminPost } from '@web/lib/db/queries/posts'

import { PostTable } from './PostTable'

const mockRefresh = jest.fn()

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
    ;(useRouter as jest.Mock).mockReturnValue({ refresh: mockRefresh })
    jest.spyOn(window, 'confirm').mockReturnValue(true)
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
  })

  it('renders all posts initially', () => {
    const posts = [
      makePost({ id: '01', titleEn: 'Post One' }),
      makePost({ id: '02', titleEn: 'Post Two', status: 'published' }),
    ]
    render(<PostTable posts={posts} />)
    expect(screen.getAllByTestId('post-row')).toHaveLength(2)
    expect(screen.getByText('Post One')).toBeInTheDocument()
    expect(screen.getByText('Post Two')).toBeInTheDocument()
  })

  it('filter tabs: clicking published shows only published posts', () => {
    const posts = [
      makePost({ id: '01', titleEn: 'Draft Post', status: 'draft' }),
      makePost({ id: '02', titleEn: 'Published Post', status: 'published' }),
    ]
    render(<PostTable posts={posts} />)
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
    render(<PostTable posts={posts} />)
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
    render(<PostTable posts={posts} />)
    fireEvent.click(screen.getByTestId('filter-published'))
    fireEvent.click(screen.getByTestId('filter-all'))
    expect(screen.getAllByTestId('post-row')).toHaveLength(2)
  })

  it('search filters by titleEn', () => {
    const posts = [
      makePost({ id: '01', titleEn: 'React Basics' }),
      makePost({ id: '02', titleEn: 'CSS Tips' }),
    ]
    render(<PostTable posts={posts} />)
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
    render(<PostTable posts={posts} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'básicos' },
    })
    expect(screen.getAllByTestId('post-row')).toHaveLength(1)
    expect(screen.getByText('Básicos de React')).toBeInTheDocument()
  })

  it('translation indicators show checkmarks correctly', () => {
    const post = makePost({ titleEn: 'My Post', titleEs: 'Mi Post' })
    render(<PostTable posts={[post]} />)
    expect(screen.getByText(/EN ✓ \/ ES ✓/)).toBeInTheDocument()
  })

  it('translation indicators show cross when translations missing', () => {
    const post = makePost({ titleEn: 'My Post', titleEs: null })
    render(<PostTable posts={[post]} />)
    expect(screen.getByText(/EN ✓ \/ ES ✗/)).toBeInTheDocument()
  })

  it('publish button disabled when translations incomplete (no titleEs)', () => {
    const post = makePost({ status: 'draft', titleEn: 'Post', titleEs: null })
    render(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).toBeDisabled()
  })

  it('publish button disabled when translations incomplete (no titleEn)', () => {
    const post = makePost({ status: 'draft', titleEn: null, titleEs: 'Post' })
    render(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).toBeDisabled()
  })

  it('publish button enabled when both translations present (not currently published)', () => {
    const post = makePost({
      status: 'draft',
      titleEn: 'My Post',
      titleEs: 'Mi Post',
    })
    render(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).not.toBeDisabled()
  })

  it('publish button enabled when post is published (for unpublishing)', () => {
    const post = makePost({
      status: 'published',
      titleEn: 'My Post',
      titleEs: 'Mi Post',
    })
    render(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).not.toBeDisabled()
  })

  it('clicking publish calls PUT /api/posts/:id with published status', async () => {
    const post = makePost({
      id: 'abc123',
      status: 'draft',
      titleEn: 'My Post',
      titleEs: 'Mi Post',
    })
    render(<PostTable posts={[post]} />)
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
    render(<PostTable posts={[post]} />)
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
    render(<PostTable posts={[post]} />)
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
    render(<PostTable posts={[post]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    await waitFor(() => expect(window.confirm).toHaveBeenCalled())
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('edit link href is correct', () => {
    const post = makePost({ id: 'edit123' })
    render(<PostTable posts={[post]} />)
    const editLink = screen.getByTestId('edit-link')
    expect(editLink).toHaveAttribute('href', '/admin/posts/edit123')
  })

  it('displays em dash when both titleEn and titleEs are null', () => {
    const post = makePost({ titleEn: null, titleEs: null })
    render(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // first td in the row is the title
    // eslint-disable-next-line testing-library/no-node-access
    expect(rows[0].querySelector('td')?.textContent).toBe('—')
  })

  it('displays em dash when publishedAt is null', () => {
    const post = makePost({ publishedAt: null })
    render(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // The publishedAt cell is the 5th td (index 4)
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    expect(cells[4].textContent).toBe('—')
  })

  it('displays formatted date when publishedAt exists', () => {
    const post = makePost({ publishedAt: new Date('2024-06-15') })
    render(<PostTable posts={[post]} />)
    const rows = screen.getAllByTestId('post-row')
    // eslint-disable-next-line testing-library/no-node-access
    const cells = rows[0].querySelectorAll('td')
    // The date is locale-formatted, so just check it's not the dash
    expect(cells[4].textContent).not.toBe('—')
    expect(cells[4].textContent).toBeTruthy()
  })

  it('shows Unpublish button text for published post', () => {
    const post = makePost({ status: 'published' })
    render(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).toHaveTextContent('Unpublish')
  })

  it('shows Publish button text for draft post', () => {
    const post = makePost({ status: 'draft' })
    render(<PostTable posts={[post]} />)
    expect(screen.getByTestId('publish-button')).toHaveTextContent('Publish')
  })
})
