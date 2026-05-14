import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import type { PostEditorProps } from './PostEditor'
import { PostEditor } from './PostEditor'

const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'postEditor.newTitle': 'New Post',
        'postEditor.editTitle': 'Edit Post',
        'postEditor.back': '← Back to posts',
        'postEditor.tabs.en': 'EN',
        'postEditor.tabs.es': 'ES',
        'postEditor.fields.title': 'Title',
        'postEditor.fields.titlePlaceholder': 'Post title',
        'postEditor.fields.slug': 'Slug',
        'postEditor.fields.slugHelper': 'Auto-generated from title.',
        'postEditor.fields.excerpt': 'Excerpt',
        'postEditor.fields.excerptPlaceholder': 'Brief description…',
        'postEditor.fields.content': 'Content',
        'postEditor.fields.contentPlaceholder': 'Write your post…',
        'postEditor.fields.category': 'Category',
        'postEditor.fields.tags': 'Tags',
        'postEditor.fields.tagsPlaceholder': 'react, nextjs',
        'postEditor.fields.tagsHelper': 'Comma-separated',
        'postEditor.fields.seriesId': 'Series ID',
        'postEditor.fields.seriesIdPlaceholder': 'e.g. react-hooks-series',
        'postEditor.fields.seriesOrder': 'Series Order',
        'postEditor.fields.seriesOrderPlaceholder': '1',
        'postEditor.fields.coverImage': 'Cover Image',
        'postEditor.fields.coverImagePlaceholder': 'Cloudinary public ID',
        'postEditor.status.draft': 'Draft',
        'postEditor.status.published': 'Published',
        'postEditor.status.archived': 'Archived',
        'postEditor.actions.save': 'Save',
        'postEditor.actions.saving': 'Saving…',
        'postEditor.actions.publish': 'Publish',
        'postEditor.actions.publishDisabledMissingTranslations':
          'Both EN and ES required',
        'postEditor.actions.publishDisabledArchived': 'Unarchive first',
        'postEditor.actions.unpublish': 'Unpublish',
        'postEditor.actions.archive': 'Archive',
        'postEditor.actions.archiveDisabledPublished': 'Unpublish first',
        'postEditor.actions.unarchive': 'Unarchive',
        'postEditor.preview': 'Preview',
        'postEditor.previewLoading': 'Rendering…',
        'postEditor.error': 'Something went wrong',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content }: { content: string }) => (
    <div data-testid="markdown-preview">{content}</div>
  ),
}))

jest.mock('@web/utils/slugify', () => ({
  slugify: (text: string) => text.toLowerCase().replace(/\s+/g, '-'),
}))

const mockCategories: PostEditorProps['categories'] = [
  { slug: 'engineering', name: 'Engineering' },
  { slug: 'design', name: 'Design' },
]

const mockExistingPost: PostEditorProps['post'] = {
  post: {
    id: 'post123',
    category: 'engineering',
    tags: ['react', 'nextjs'],
    status: 'draft',
    coverImage: 'cover/img',
    seriesId: 'series-1',
    seriesOrder: 2,
    author: 'Admin',
  },
  translations: [
    {
      locale: 'en',
      title: 'My Post',
      slug: 'my-post',
      excerpt: 'An excerpt',
      content: '# Hello',
    },
    {
      locale: 'es',
      title: 'Mi Post',
      slug: 'mi-post',
      excerpt: 'Un extracto',
      content: '# Hola',
    },
  ],
}

describe('PostEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'new-post-id' }),
    })
  })

  describe('new post', () => {
    it('renders new post title and empty fields', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      expect(
        screen.getByRole('heading', { name: 'New Post' }),
      ).toBeInTheDocument()
      expect(screen.getByTestId('title-input')).toHaveValue('')
      expect(screen.getByTestId('slug-input')).toHaveValue('')
    })

    it('renders image syntax hint below content field', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      expect(screen.getByText('Image syntax')).toBeInTheDocument()
    })

    it('shows draft status badge', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Draft')
    })

    it('back link navigates to /admin/posts', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.click(screen.getByTestId('back-link'))
      expect(mockPush).toHaveBeenCalledWith('/admin/posts')
    })

    it('auto-generates slug from title', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'My New Post' },
      })
      expect(screen.getByTestId('slug-input')).toHaveValue('my-new-post')
    })

    it('stops auto-generating slug after manual edit', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'My Post' },
      })
      fireEvent.change(screen.getByTestId('slug-input'), {
        target: { value: 'custom-slug' },
      })
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Updated Title' },
      })
      expect(screen.getByTestId('slug-input')).toHaveValue('custom-slug')
    })

    it('publish button disabled when missing translations', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      expect(screen.getByTestId('publish-button')).toBeDisabled()
    })

    it('publish button enabled when both titles present', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'My Post' },
      })
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Mi Post' },
      })
      expect(screen.getByTestId('publish-button')).not.toBeDisabled()
    })

    it('creates new post via POST and navigates to edit page', async () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'My Post' },
      })
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/posts',
        expect.objectContaining({ method: 'POST' }),
      )
      expect(mockPush).toHaveBeenCalledWith('/admin/posts/new-post-id')
    })

    it('shows saving state while fetch is pending', async () => {
      let resolveFetch!: (v: unknown) => void
      global.fetch = jest.fn().mockReturnValue(
        new Promise((res) => {
          resolveFetch = res
        }),
      )
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.click(screen.getByTestId('save-button'))
      expect(screen.getByTestId('save-button')).toHaveTextContent('Saving…')
      resolveFetch({ ok: true, json: async () => ({ id: 'x' }) })
      await waitFor(() =>
        expect(screen.getByTestId('save-button')).toHaveTextContent('Save'),
      )
    })

    it('shows error when API fails with string error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Category not found' }),
      })
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.click(screen.getByTestId('save-button'))
      expect(await screen.findByTestId('editor-error')).toHaveTextContent(
        'Category not found',
      )
    })

    it('shows fallback error when API error is not string', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: [{ message: 'invalid' }] }),
      })
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.click(screen.getByTestId('save-button'))
      expect(await screen.findByTestId('editor-error')).toHaveTextContent(
        'Something went wrong',
      )
    })

    it('sends publish status when publish button clicked', async () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'My Post' },
      })
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Mi Post' },
      })
      fireEvent.click(screen.getByTestId('publish-button'))
      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body as string,
      ) as { status: string }
      expect(body.status).toBe('published')
    })

    it('sends archived status when archive button clicked', async () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.click(screen.getByTestId('archive-button'))
      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body as string,
      ) as { status: string }
      expect(body.status).toBe('archived')
    })

    it('switching locale tab preserves EN state', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'English Title' },
      })
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      fireEvent.click(screen.getByTestId('locale-tab-en'))
      expect(screen.getByTestId('title-input')).toHaveValue('English Title')
    })

    it('locale tabs are independent', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'English Title' },
      })
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      expect(screen.getByTestId('title-input')).toHaveValue('')
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Título Español' },
      })
      fireEvent.click(screen.getByTestId('locale-tab-en'))
      expect(screen.getByTestId('title-input')).toHaveValue('English Title')
    })

    it('tags, category, cover image, series fields are editable', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('tags-input'), {
        target: { value: 'react, nextjs' },
      })
      fireEvent.change(screen.getByTestId('cover-image-input'), {
        target: { value: 'cover/image' },
      })
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      fireEvent.change(screen.getByTestId('series-order-input'), {
        target: { value: '3' },
      })
      expect(screen.getByTestId('tags-input')).toHaveValue('react, nextjs')
      expect(screen.getByTestId('cover-image-input')).toHaveValue('cover/image')
      expect(screen.getByTestId('series-id-input')).toHaveValue('my-series')
      expect(screen.getByTestId('series-order-input')).toHaveValue(3)
    })

    it('excerpt field is editable', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('excerpt-input'), {
        target: { value: 'A brief description' },
      })
      expect(screen.getByTestId('excerpt-input')).toHaveValue(
        'A brief description',
      )
    })

    it('content field updates preview pane', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('content-input'), {
        target: { value: '# My heading' },
      })
      expect(screen.getByTestId('markdown-preview')).toHaveTextContent(
        '# My heading',
      )
    })

    it('includes optional fields in POST body when filled', async () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('cover-image-input'), {
        target: { value: 'cover/img' },
      })
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      fireEvent.change(screen.getByTestId('series-order-input'), {
        target: { value: '2' },
      })
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body as string,
      ) as Record<string, unknown>
      expect(body).toHaveProperty('coverImage', 'cover/img')
      expect(body).toHaveProperty('seriesId', 'my-series')
      expect(body).toHaveProperty('seriesOrder', 2)
    })
  })

  describe('edit post (existing)', () => {
    it('renders edit title and pre-fills fields', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          author="Admin"
        />,
      )
      expect(
        screen.getByRole('heading', { name: 'Edit Post' }),
      ).toBeInTheDocument()
      expect(screen.getByTestId('title-input')).toHaveValue('My Post')
      expect(screen.getByTestId('slug-input')).toHaveValue('my-post')
      expect(screen.getByTestId('excerpt-input')).toHaveValue('An excerpt')
      expect(screen.getByTestId('content-input')).toHaveValue('# Hello')
    })

    it('pre-fills metadata fields', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          author="Admin"
        />,
      )
      expect(screen.getByTestId('tags-input')).toHaveValue('react, nextjs')
      expect(screen.getByTestId('cover-image-input')).toHaveValue('cover/img')
      expect(screen.getByTestId('series-id-input')).toHaveValue('series-1')
      expect(screen.getByTestId('series-order-input')).toHaveValue(2)
    })

    it('pre-fills ES translation when switching tab', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          author="Admin"
        />,
      )
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      expect(screen.getByTestId('title-input')).toHaveValue('Mi Post')
      expect(screen.getByTestId('content-input')).toHaveValue('# Hola')
    })

    it('saves via PUT to /api/posts/:id', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'post123', status: 'draft' }),
      })
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          author="Admin"
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/posts/post123',
        expect.objectContaining({ method: 'PUT' }),
      )
      expect(mockRefresh).toHaveBeenCalled()
    })

    it('updates status badge after unpublish', async () => {
      const publishedPost: PostEditorProps['post'] = {
        post: { ...mockExistingPost!.post, status: 'published' },
        translations: mockExistingPost!.translations,
      }
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'post123', status: 'draft' }),
      })
      renderApp(
        <PostEditor
          post={publishedPost}
          categories={mockCategories}
          author="Admin"
        />,
      )
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Published')
      fireEvent.click(screen.getByTestId('unpublish-button'))
      await waitFor(() =>
        expect(screen.getByTestId('status-badge')).toHaveTextContent('Draft'),
      )
    })

    it('shows archive button disabled for published post', () => {
      const publishedPost: PostEditorProps['post'] = {
        post: { ...mockExistingPost!.post, status: 'published' },
        translations: mockExistingPost!.translations,
      }
      renderApp(
        <PostEditor
          post={publishedPost}
          categories={mockCategories}
          author="Admin"
        />,
      )
      expect(screen.getByTestId('archive-button')).toBeDisabled()
    })

    it('shows archived state with unarchive + disabled publish', () => {
      const archivedPost: PostEditorProps['post'] = {
        post: { ...mockExistingPost!.post, status: 'archived' },
        translations: mockExistingPost!.translations,
      }
      renderApp(
        <PostEditor
          post={archivedPost}
          categories={mockCategories}
          author="Admin"
        />,
      )
      expect(screen.getByTestId('unarchive-button')).toBeInTheDocument()
      expect(screen.getByTestId('publish-archived-button')).toBeDisabled()
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Archived')
    })

    it('unarchive sends draft status', async () => {
      const archivedPost: PostEditorProps['post'] = {
        post: { ...mockExistingPost!.post, status: 'archived' },
        translations: mockExistingPost!.translations,
      }
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      renderApp(
        <PostEditor
          post={archivedPost}
          categories={mockCategories}
          author="Admin"
        />,
      )
      fireEvent.click(screen.getByTestId('unarchive-button'))
      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body as string,
      ) as { status: string }
      expect(body.status).toBe('draft')
    })

    it('does not navigate after successful PUT', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          author="Admin"
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('handles post with null seriesId and seriesOrder', () => {
      const postNoSeries: PostEditorProps['post'] = {
        post: {
          ...mockExistingPost!.post,
          seriesId: null,
          seriesOrder: null,
          coverImage: null,
        },
        translations: mockExistingPost!.translations,
      }
      renderApp(
        <PostEditor
          post={postNoSeries}
          categories={mockCategories}
          author="Admin"
        />,
      )
      expect(screen.getByTestId('series-id-input')).toHaveValue('')
      expect(screen.getByTestId('series-order-input')).toHaveValue(null)
      expect(screen.getByTestId('cover-image-input')).toHaveValue('')
    })

    it('includes tags as array in PUT body', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          author="Admin"
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(global.fetch).toHaveBeenCalled())
      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body as string,
      ) as { tags: string[] }
      expect(body.tags).toEqual(['react', 'nextjs'])
    })
  })

  describe('categories dropdown', () => {
    it('renders category select', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      expect(screen.getByTestId('category-select')).toBeInTheDocument()
    })

    it('shows category options when opened', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.click(
        within(screen.getByTestId('category-select')).getByRole('button'),
      )
      expect(
        screen.getByRole('option', { name: 'Engineering' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Design' })).toBeInTheDocument()
    })

    it('allows selecting a category', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.click(
        within(screen.getByTestId('category-select')).getByRole('button'),
      )
      fireEvent.click(screen.getByRole('option', { name: 'Design' }))
      expect(
        within(screen.getByTestId('category-select')).getByRole('button'),
      ).toHaveTextContent('Design')
    })
  })
})
