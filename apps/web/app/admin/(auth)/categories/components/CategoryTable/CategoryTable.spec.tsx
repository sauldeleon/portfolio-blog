import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import type { CategoryForAdmin } from '@web/lib/db/queries/categories'

import { CategoryTable } from './CategoryTable'

const mockRefresh = jest.fn()
const mockPush = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string, opts?: Record<string, unknown>) => {
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
        'categories.deleteTooltip': `${opts?.['count']} published post(s) use this category`,
        'categories.empty': 'No categories found',
        'categories.form.descriptionPlaceholder': 'Optional',
        'categories.form.slug': 'Slug',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const makeCategory = (
  overrides: Partial<CategoryForAdmin> = {},
): CategoryForAdmin => ({
  id: 1,
  slug: 'engineering',
  postCount: 5,
  publishedPostCount: 2,
  translations: [
    {
      categorySlug: 'engineering',
      locale: 'en' as const,
      name: 'Engineering',
      description: null,
      slug: 'engineering',
    },
  ],
  ...overrides,
})

describe('CategoryTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
      push: mockPush,
    })
    jest.spyOn(window, 'confirm').mockReturnValue(true)
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 })
  })

  it('renders all category rows', () => {
    const categories = [
      makeCategory({
        slug: 'eng',
        translations: [
          {
            categorySlug: 'eng',
            locale: 'en' as const,
            name: 'Engineering',
            description: null,
            slug: 'eng',
          },
        ],
      }),
      makeCategory({
        slug: 'design',
        translations: [
          {
            categorySlug: 'design',
            locale: 'en' as const,
            name: 'Design',
            description: null,
            slug: 'design',
          },
        ],
      }),
    ]
    renderApp(<CategoryTable categories={categories} />)
    expect(screen.getAllByTestId('category-row')).toHaveLength(2)
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()
  })

  it('shows canonical slug as name when no EN translation', () => {
    renderApp(
      <CategoryTable categories={[makeCategory({ translations: [] })]} />,
    )
    // Both the Name column (fallback) and Slug column show the canonical slug
    expect(screen.getAllByText('engineering')).toHaveLength(2)
  })

  it('shows empty state when no categories match search', () => {
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'zzznomatch' },
    })
    expect(screen.queryByTestId('category-row')).not.toBeInTheDocument()
    expect(screen.getByText('No categories found')).toBeInTheDocument()
  })

  it('filters by EN translation name', () => {
    const categories = [
      makeCategory({
        slug: 'eng',
        translations: [
          {
            categorySlug: 'eng',
            locale: 'en' as const,
            name: 'Engineering',
            description: null,
            slug: 'eng',
          },
        ],
      }),
      makeCategory({
        slug: 'design',
        translations: [
          {
            categorySlug: 'design',
            locale: 'en' as const,
            name: 'Design',
            description: null,
            slug: 'design',
          },
        ],
      }),
    ]
    renderApp(<CategoryTable categories={categories} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'eng' },
    })
    expect(screen.getAllByTestId('category-row')).toHaveLength(1)
    expect(screen.getByText('Engineering')).toBeInTheDocument()
  })

  it('filters by canonical slug', () => {
    const categories = [
      makeCategory({ slug: 'engineering' }),
      makeCategory({
        slug: 'design',
        translations: [
          {
            categorySlug: 'design',
            locale: 'en' as const,
            name: 'Design',
            description: null,
            slug: 'design',
          },
        ],
      }),
    ]
    renderApp(<CategoryTable categories={categories} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'design' },
    })
    expect(screen.getAllByTestId('category-row')).toHaveLength(1)
    expect(screen.getByText('Design')).toBeInTheDocument()
  })

  it('new category button navigates to /admin/categories/new on click', () => {
    renderApp(<CategoryTable categories={[]} />)
    fireEvent.click(screen.getByTestId('new-category-button'))
    expect(mockPush).toHaveBeenCalledWith('/admin/categories/new')
  })

  it('entering edit mode shows locale tabs, name/description/slug inputs and Save/Cancel', () => {
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    expect(screen.getByTestId('locale-tab-en')).toBeInTheDocument()
    expect(screen.getByTestId('locale-tab-es')).toBeInTheDocument()
    expect(screen.getByTestId('edit-name-input')).toBeInTheDocument()
    expect(screen.getByTestId('edit-description-input')).toBeInTheDocument()
    expect(screen.getByTestId('edit-slug-input')).toBeInTheDocument()
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

  it('edit pre-fills EN name and description', () => {
    renderApp(
      <CategoryTable
        categories={[
          makeCategory({
            translations: [
              {
                categorySlug: 'engineering',
                locale: 'en' as const,
                name: 'Engineering',
                description: 'Tech stuff',
                slug: 'engineering',
              },
            ],
          }),
        ]}
      />,
    )
    fireEvent.click(screen.getByTestId('edit-button'))
    expect(screen.getByTestId('edit-name-input')).toHaveValue('Engineering')
    expect(screen.getByTestId('edit-description-input')).toHaveValue(
      'Tech stuff',
    )
    expect(screen.getByTestId('edit-slug-input')).toHaveValue('engineering')
  })

  it('edit pre-fills empty fields when no EN translation exists', () => {
    renderApp(
      <CategoryTable categories={[makeCategory({ translations: [] })]} />,
    )
    fireEvent.click(screen.getByTestId('edit-button'))
    expect(screen.getByTestId('edit-name-input')).toHaveValue('')
    expect(screen.getByTestId('edit-description-input')).toHaveValue('')
    expect(screen.getByTestId('edit-slug-input')).toHaveValue('engineering')
  })

  it('edit pre-fills empty string when description is null', () => {
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    expect(screen.getByTestId('edit-description-input')).toHaveValue('')
  })

  it('switching to ES tab pre-fills ES translation data', () => {
    const cat = makeCategory({
      translations: [
        {
          categorySlug: 'engineering',
          locale: 'en' as const,
          name: 'Engineering',
          description: null,
          slug: 'engineering',
        },
        {
          categorySlug: 'engineering',
          locale: 'es' as const,
          name: 'Ingeniería',
          description: 'Tecnología',
          slug: 'ingenieria',
        },
      ],
    })
    renderApp(<CategoryTable categories={[cat]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.click(screen.getByTestId('locale-tab-es'))
    expect(screen.getByTestId('edit-name-input')).toHaveValue('Ingeniería')
    expect(screen.getByTestId('edit-description-input')).toHaveValue(
      'Tecnología',
    )
    expect(screen.getByTestId('edit-slug-input')).toHaveValue('ingenieria')
  })

  it('switching to ES when no ES translation clears inputs', () => {
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.click(screen.getByTestId('locale-tab-es'))
    expect(screen.getByTestId('edit-name-input')).toHaveValue('')
    expect(screen.getByTestId('edit-description-input')).toHaveValue('')
    expect(screen.getByTestId('edit-slug-input')).toHaveValue('engineering')
  })

  it('saving edit calls PUT with locale, name, description, slug and refreshes', async () => {
    renderApp(
      <CategoryTable
        categories={[
          makeCategory({
            slug: 'eng',
            translations: [
              {
                categorySlug: 'eng',
                locale: 'en' as const,
                name: 'Engineering',
                description: null,
                slug: 'eng',
              },
            ],
          }),
        ]}
      />,
    )
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.change(screen.getByTestId('edit-name-input'), {
      target: { value: 'Engenharia' },
    })
    fireEvent.change(screen.getByTestId('edit-description-input'), {
      target: { value: 'Tech articles' },
    })
    fireEvent.click(screen.getByTestId('save-button'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/categories/eng', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale: 'en',
        name: 'Engenharia',
        description: 'Tech articles',
        slug: 'engenharia',
      }),
    })
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
    expect(screen.queryByTestId('edit-name-input')).not.toBeInTheDocument()
  })

  it('saving with updated locale slug sends new slug', async () => {
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.change(screen.getByTestId('edit-slug-input'), {
      target: { value: 'eng-new' },
    })
    fireEvent.click(screen.getByTestId('save-button'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/categories/engineering', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale: 'en',
        name: 'Engineering',
        description: null,
        slug: 'eng-new',
      }),
    })
  })

  it('switching back to EN tab re-fills EN data', () => {
    const cat = makeCategory({
      translations: [
        {
          categorySlug: 'engineering',
          locale: 'en' as const,
          name: 'Engineering',
          description: null,
          slug: 'engineering',
        },
        {
          categorySlug: 'engineering',
          locale: 'es' as const,
          name: 'Ingeniería',
          description: null,
          slug: 'ingenieria',
        },
      ],
    })
    renderApp(<CategoryTable categories={[cat]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.click(screen.getByTestId('locale-tab-es'))
    fireEvent.click(screen.getByTestId('locale-tab-en'))
    expect(screen.getByTestId('edit-name-input')).toHaveValue('Engineering')
    expect(screen.getByTestId('edit-slug-input')).toHaveValue('engineering')
  })

  it('saving edit with empty description sends null', async () => {
    renderApp(
      <CategoryTable
        categories={[
          makeCategory({
            slug: 'eng',
            translations: [
              {
                categorySlug: 'eng',
                locale: 'en' as const,
                name: 'Engineering',
                description: null,
                slug: 'eng',
              },
            ],
          }),
        ]}
      />,
    )
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.click(screen.getByTestId('save-button'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/categories/eng', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale: 'en',
        name: 'Engineering',
        description: null,
        slug: 'eng',
      }),
    })
  })

  it('uses canonical slug when locale slug is cleared', async () => {
    renderApp(
      <CategoryTable
        categories={[
          makeCategory({
            slug: 'eng',
            translations: [
              {
                categorySlug: 'eng',
                locale: 'en' as const,
                name: 'Engineering',
                description: null,
                slug: 'eng',
              },
            ],
          }),
        ]}
      />,
    )
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.change(screen.getByTestId('edit-slug-input'), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByTestId('save-button'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/categories/eng', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale: 'en',
        name: 'Engineering',
        description: null,
        slug: 'eng',
      }),
    })
  })

  it('saving ES locale sends correct locale', async () => {
    const cat = makeCategory({
      translations: [
        {
          categorySlug: 'engineering',
          locale: 'en' as const,
          name: 'Engineering',
          description: null,
          slug: 'engineering',
        },
        {
          categorySlug: 'engineering',
          locale: 'es' as const,
          name: 'Ingeniería',
          description: null,
          slug: 'ingenieria',
        },
      ],
    })
    renderApp(<CategoryTable categories={[cat]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.click(screen.getByTestId('locale-tab-es'))
    fireEvent.click(screen.getByTestId('save-button'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/categories/engineering', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale: 'es',
        name: 'Ingeniería',
        description: null,
        slug: 'ingenieria',
      }),
    })
  })

  it('delete button is disabled when publishedPostCount > 0', () => {
    renderApp(
      <CategoryTable categories={[makeCategory({ publishedPostCount: 3 })]} />,
    )
    expect(screen.getByTestId('delete-button')).toBeDisabled()
  })

  it('delete button shows tooltip with count when publishedPostCount > 0', () => {
    renderApp(
      <CategoryTable categories={[makeCategory({ publishedPostCount: 3 })]} />,
    )
    expect(screen.getByTestId('delete-button')).toHaveAttribute(
      'title',
      '3 published post(s) use this category',
    )
  })

  it('delete button is enabled when publishedPostCount is 0', () => {
    renderApp(
      <CategoryTable categories={[makeCategory({ publishedPostCount: 0 })]} />,
    )
    expect(screen.getByTestId('delete-button')).not.toBeDisabled()
  })

  it('delete button has no title when publishedPostCount is 0', () => {
    renderApp(
      <CategoryTable categories={[makeCategory({ publishedPostCount: 0 })]} />,
    )
    expect(screen.getByTestId('delete-button')).not.toHaveAttribute('title')
  })

  it('delete with confirm=true calls DELETE and refreshes', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true)
    renderApp(
      <CategoryTable
        categories={[makeCategory({ slug: 'del-me', publishedPostCount: 0 })]}
      />,
    )
    fireEvent.click(screen.getByTestId('delete-button'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/categories/del-me', {
      method: 'DELETE',
    })
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('delete with confirm=false does not call fetch', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false)
    renderApp(
      <CategoryTable categories={[makeCategory({ publishedPostCount: 0 })]} />,
    )
    fireEvent.click(screen.getByTestId('delete-button'))
    await waitFor(() => expect(window.confirm).toHaveBeenCalled())
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('renders post count', () => {
    renderApp(<CategoryTable categories={[makeCategory({ postCount: 42 })]} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders canonical slug', () => {
    renderApp(
      <CategoryTable categories={[makeCategory({ slug: 'my-slug' })]} />,
    )
    expect(screen.getByText('my-slug')).toBeInTheDocument()
  })

  it('auto-generates locale slug from name while editing', () => {
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.change(screen.getByTestId('edit-name-input'), {
      target: { value: 'Montañismo' },
    })
    expect(screen.getByTestId('edit-slug-input')).toHaveValue('montañismo')
  })

  it('stops auto-generating slug once user manually edits it', () => {
    renderApp(<CategoryTable categories={[makeCategory()]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.change(screen.getByTestId('edit-slug-input'), {
      target: { value: 'custom-slug' },
    })
    fireEvent.change(screen.getByTestId('edit-name-input'), {
      target: { value: 'New Name' },
    })
    expect(screen.getByTestId('edit-slug-input')).toHaveValue('custom-slug')
  })

  it('resets auto-slug on locale switch', () => {
    const cat = makeCategory({
      translations: [
        {
          categorySlug: 'engineering',
          locale: 'en' as const,
          name: 'Engineering',
          description: null,
          slug: 'engineering',
        },
        {
          categorySlug: 'engineering',
          locale: 'es' as const,
          name: 'Ingeniería',
          description: null,
          slug: 'ingenieria',
        },
      ],
    })
    renderApp(<CategoryTable categories={[cat]} />)
    fireEvent.click(screen.getByTestId('edit-button'))
    fireEvent.change(screen.getByTestId('edit-slug-input'), {
      target: { value: 'custom' },
    })
    fireEvent.click(screen.getByTestId('locale-tab-es'))
    fireEvent.change(screen.getByTestId('edit-name-input'), {
      target: { value: 'Montañismo' },
    })
    expect(screen.getByTestId('edit-slug-input')).toHaveValue('montañismo')
  })
})
