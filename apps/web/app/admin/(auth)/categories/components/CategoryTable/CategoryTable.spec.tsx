import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import type { CategoryWithCount } from '@web/lib/db/queries/categories'

import { CategoryTable } from './CategoryTable'

const mockRefresh = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'categories.searchPlaceholder': 'Search categories…',
        'categories.newCategory': 'New category',
        'categories.table.name': 'Name',
        'categories.table.slug': 'Slug',
        'categories.table.posts': 'Posts',
        'categories.table.actions': 'Actions',
        'categories.edit': 'Edit',
        'categories.save': 'Save',
        'categories.cancel': 'Cancel',
        'categories.delete': 'Delete',
        'categories.deleteConfirm': 'Delete this category?',
        'categories.deleteBlocked':
          'Cannot delete: category has published posts',
        'categories.empty': 'No categories found',
        'categories.slugPlaceholder': 'my-category',
        'categories.namePlaceholder': 'Category name',
        'categories.add': 'Add',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const makeCategory = (
  overrides: Partial<CategoryWithCount> = {},
): CategoryWithCount => ({
  slug: 'engineering',
  name: 'Engineering',
  description: null,
  postCount: 5,
  ...overrides,
})

describe('CategoryTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ refresh: mockRefresh })
    jest.spyOn(window, 'confirm').mockReturnValue(true)
    jest.spyOn(window, 'alert').mockImplementation(() => undefined)
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 })
  })

  it('renders all category rows', () => {
    const categories = [
      makeCategory({ slug: 'eng', name: 'Engineering' }),
      makeCategory({ slug: 'design', name: 'Design' }),
    ]
    renderApp(<CategoryTable categories={categories} />)
    expect(screen.getAllByTestId('category-row')).toHaveLength(2)
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()
  })

  it('shows empty state when no categories match search', () => {
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'zzznomatch' },
    })
    expect(screen.queryByTestId('category-row')).not.toBeInTheDocument()
    expect(screen.getByText('No categories found')).toBeInTheDocument()
  })

  it('filters by name', () => {
    const categories = [
      makeCategory({ slug: 'eng', name: 'Engineering' }),
      makeCategory({ slug: 'design', name: 'Design' }),
    ]
    renderApp(<CategoryTable categories={categories} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'eng' },
    })
    expect(screen.getAllByTestId('category-row')).toHaveLength(1)
    expect(screen.getByText('Engineering')).toBeInTheDocument()
  })

  it('filters by slug', () => {
    const categories = [
      makeCategory({ slug: 'engineering', name: 'Engineering' }),
      makeCategory({ slug: 'design', name: 'Design' }),
    ]
    renderApp(<CategoryTable categories={categories} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'design' },
    })
    expect(screen.getAllByTestId('category-row')).toHaveLength(1)
    expect(screen.getByText('Design')).toBeInTheDocument()
  })

  it('shows create form when New category button is clicked', () => {
    renderApp(<CategoryTable categories={[]} />)
    fireEvent.click(screen.getByTestId('new-category-button'))
    expect(screen.getByTestId('create-form')).toBeInTheDocument()
    expect(screen.queryByTestId('new-category-button')).not.toBeInTheDocument()
  })

  it('hides create form when cancel is clicked', () => {
    renderApp(<CategoryTable categories={[]} />)
    fireEvent.click(screen.getByTestId('new-category-button'))
    fireEvent.click(screen.getByTestId('create-cancel'))
    expect(screen.queryByTestId('create-form')).not.toBeInTheDocument()
    expect(screen.getByTestId('new-category-button')).toBeInTheDocument()
  })

  it('submits create form and refreshes on success', async () => {
    renderApp(<CategoryTable categories={[]} />)
    fireEvent.click(screen.getByTestId('new-category-button'))
    fireEvent.change(screen.getByTestId('new-slug-input'), {
      target: { value: 'my-cat' },
    })
    fireEvent.change(screen.getByTestId('new-name-input'), {
      target: { value: 'My Cat' },
    })
    fireEvent.click(screen.getByTestId('create-submit'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'my-cat', name: 'My Cat' }),
    })
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
    expect(screen.queryByTestId('create-form')).not.toBeInTheDocument()
  })

  it('shows error message when create fails with string error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Slug already exists' }),
    })
    renderApp(<CategoryTable categories={[]} />)
    fireEvent.click(screen.getByTestId('new-category-button'))
    fireEvent.change(screen.getByTestId('new-slug-input'), {
      target: { value: 'dup' },
    })
    fireEvent.change(screen.getByTestId('new-name-input'), {
      target: { value: 'Dup' },
    })
    fireEvent.click(screen.getByTestId('create-submit'))
    expect(await screen.findByTestId('create-error')).toBeInTheDocument()
    expect(screen.getByText('Slug already exists')).toBeInTheDocument()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('shows fallback error when create fails with non-string error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: [{ message: 'bad' }] }),
    })
    renderApp(<CategoryTable categories={[]} />)
    fireEvent.click(screen.getByTestId('new-category-button'))
    fireEvent.change(screen.getByTestId('new-slug-input'), {
      target: { value: 'x' },
    })
    fireEvent.change(screen.getByTestId('new-name-input'), {
      target: { value: 'X' },
    })
    fireEvent.click(screen.getByTestId('create-submit'))
    expect(await screen.findByTestId('create-error')).toBeInTheDocument()
  })

  it('entering edit mode shows name input and Save/Cancel', () => {
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    expect(screen.getByTestId('edit-name-input')).toBeInTheDocument()
    expect(screen.getByTestId('save-button')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument()
  })

  it('cancelling edit restores read mode', () => {
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.click(screen.getByTestId('cancel-button'))
    expect(screen.queryByTestId('edit-name-input')).not.toBeInTheDocument()
    expect(screen.getByTestId('edit-button')).toBeInTheDocument()
  })

  it('saving edit calls PUT and refreshes', async () => {
    renderApp(
      <CategoryTable
        categories={[makeCategory({ slug: 'eng', name: 'Engineering' })]}
      />,
    )
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.change(screen.getByTestId('edit-name-input'), {
      target: { value: 'Engenharia' },
    })
    fireEvent.click(screen.getByTestId('save-button'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/categories/eng', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Engenharia' }),
    })
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
    expect(screen.queryByTestId('edit-name-input')).not.toBeInTheDocument()
  })

  it('delete with confirm=true calls DELETE and refreshes', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true)
    renderApp(<CategoryTable categories={[makeCategory({ slug: 'del-me' })]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/categories/del-me', {
      method: 'DELETE',
    })
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('delete with confirm=false does not call fetch', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false)
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    await waitFor(() => expect(window.confirm).toHaveBeenCalled())
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('delete blocked (409) shows alert and does not refresh', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 409 })
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    await waitFor(() => expect(window.alert).toHaveBeenCalled())
    expect(window.alert).toHaveBeenCalledWith(
      'Cannot delete: category has published posts',
    )
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('renders post count', () => {
    renderApp(<CategoryTable categories={[makeCategory({ postCount: 42 })]} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders slug', () => {
    renderApp(
      <CategoryTable categories={[makeCategory({ slug: 'my-slug' })]} />,
    )
    expect(screen.getByText('my-slug')).toBeInTheDocument()
  })
})
