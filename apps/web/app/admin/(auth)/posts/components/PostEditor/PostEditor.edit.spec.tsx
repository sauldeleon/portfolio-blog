import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import axios from 'axios'
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
        'postEditor.fields.seriesTitle': 'Series title',
        'postEditor.fields.seriesTitlePlaceholder': 'Series title',
        'postEditor.fields.seriesOrder': 'Series Order',
        'postEditor.fields.seriesOrderPlaceholder': '1',
        'postEditor.fields.coverImage': 'Cover Image',
        'postEditor.fields.coverImagePlaceholder': 'Cloudinary public ID',
        'postEditor.fields.scheduledAt': 'Schedule Publish',
        'postEditor.fields.scheduledAtPlaceholder': 'Not scheduled',
        'postEditor.fields.coverImageFit': 'Cover image fit',
        'postEditor.fields.coverImageFitCover': 'Cover (fill)',
        'postEditor.fields.coverImageFitContain': 'Contain (full image)',
        'postEditor.fields.author': 'Author',
        'postEditor.fields.authorPlaceholder': 'Author name',
        'postEditor.fields.authorUseDefault': 'Use default author',
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
        'publishNotify.message': 'Notify subscribers?',
        'publishNotify.publishAndNotify': 'Publish & Notify',
        'publishNotify.publishOnly': 'Publish Only',
        'publishNotify.cancel': 'Cancel',
        'postEditor.preview': 'Preview',
        'postEditor.previewLoading': 'Rendering…',
        'postEditor.previewTabPost': 'Post',
        'postEditor.previewTabPostMobile': 'Post Mobile',
        'postEditor.previewTabHero': 'Hero',
        'postEditor.previewTabCard': 'Card',
        'postEditor.previewTabToc': 'Table of Contents',
        'postEditor.draftPreviewLabel': 'Preview:',
        'postEditor.draftPreviewCopy': 'Copy',
        'postEditor.draftPreviewCopied': 'Copied!',
        'postEditor.error': 'Something went wrong',
        'images.picker.title': 'Insert Image',
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

jest.mock('../ImagePicker', () => ({
  ImagePicker: ({
    open,
    onClose,
    onPick,
  }: {
    open: boolean
    onClose: () => void
    onPick: (image: {
      publicId: string
      url: string
      width: number
      height: number
      format: string
      createdAt: string
      bytes: number
    }) => void
  }) =>
    open ? (
      <div data-testid="image-picker-mock">
        <button
          type="button"
          data-testid="image-picker-insert"
          onClick={() =>
            onPick({
              publicId: 'sawl.dev - blog/img',
              url: 'https://example.com/img.jpg',
              width: 800,
              height: 600,
              format: 'jpg',
              createdAt: '2024-01-01T00:00:00Z',
              bytes: 12345,
            })
          }
        >
          Insert
        </button>
        <button
          type="button"
          data-testid="image-picker-close"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    ) : null,
}))

jest.mock('@web/utils/slugify', () => ({
  slugify: (text: string) => text.toLowerCase().replace(/\s+/g, '-'),
}))

jest.mock('@sdlgr/date-picker', () => ({
  DateTimePicker: ({
    value,
    onChange,
    placeholder,
    'data-testid': testId,
  }: {
    value: Date | null
    onChange: (date: Date | null) => void
    placeholder?: string
    'data-testid'?: string
  }) => (
    <div data-testid={testId}>
      <button
        type="button"
        data-testid={`${testId}-set`}
        onClick={() => onChange(new Date('2024-06-15T00:00:00.000Z'))}
      >
        Set Date
      </button>
      <button
        type="button"
        data-testid={`${testId}-clear`}
        onClick={() => onChange(null)}
      >
        Clear
      </button>
      {value && (
        <span data-testid={`${testId}-value`}>{value.toISOString()}</span>
      )}
      {!value && placeholder && (
        <span data-testid={`${testId}-placeholder`}>{placeholder}</span>
      )}
    </div>
  ),
}))

jest.mock('@sdlgr/post-hero', () => ({
  PostHero: ({ readingTime }: { readingTime: number }) => (
    <div data-testid="post-hero-mock">
      <span data-testid="reading-time">{readingTime}</span>
    </div>
  ),
}))

jest.mock('./PostCardPreview', () => ({
  PostCardPreview: () => <div data-testid="post-card-preview-mock" />,
}))

jest.mock('@sdlgr/table-of-contents', () => ({
  TableOfContents: () => <nav data-testid="toc-mock" />,
}))

jest.mock('@web/lib/mdx/remarkHeadings', () => ({
  extractToc: () => [],
}))

jest.mock('./CoverImageInput', () => ({
  CoverImageInput: ({
    value,
    onPick,
    onClear,
    label,
  }: {
    value: string
    onPick: () => void
    onClear: () => void
    label: string
    placeholder: string
    clearTitle: string
  }) => (
    <div>
      <span>{label}</span>
      <input
        data-testid="cover-image-input"
        value={value}
        readOnly
        onClick={onPick}
        onChange={() => undefined}
      />
      {value && (
        <button
          type="button"
          data-testid="clear-cover-image-button"
          onClick={onClear}
        >
          ×
        </button>
      )}
    </div>
  ),
}))

jest.mock('@sdlgr/combobox', () => ({
  Combobox: ({
    value,
    onChange,
    'data-testid': testId,
    placeholder,
    isValidNewOption,
  }: {
    value: string[]
    onChange: (values: string[]) => void
    'data-testid'?: string
    placeholder?: string
    isValidNewOption?: (v: string) => boolean
  }) => (
    <input
      data-testid={testId}
      value={value.join(', ')}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value
        const entries = raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        const valid = entries.filter((v) =>
          isValidNewOption ? isValidNewOption(v) : true,
        )
        onChange(valid)
      }}
    />
  ),
}))

jest.mock('@sdlgr/select', () => ({
  Select: ({
    value,
    onChange,
    options,
    'data-testid': testId,
    isSearchable,
    isCreatable,
  }: {
    value: string
    onChange: (v: string) => void
    options: Array<{ value: string; label: string }>
    'data-testid'?: string
    isSearchable?: boolean
    isCreatable?: boolean
  }) => {
    if (isSearchable || isCreatable) {
      return (
        <input
          data-testid={testId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    }
    const currentLabel = options.find((o) => o.value === value)?.label ?? ''
    return (
      <div data-testid={testId}>
        <button type="button">{currentLabel}</button>
        {options.map((opt) => (
          <div
            key={opt.value}
            role="option"
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </div>
        ))}
      </div>
    )
  },
}))

const mockCategories: PostEditorProps['categories'] = [
  { slug: 'engineering', name: 'Engineering' },
  { slug: 'design', name: 'Design' },
]

const mockUsers: PostEditorProps['users'] = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user-2',
    email: 'editor@example.com',
    name: 'Editor',
    role: 'editor',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

const mockExistingPost: PostEditorProps['post'] = {
  post: {
    id: 'post123',
    postNumber: 7,
    category: 'engineering',
    tags: ['react', 'nextjs'],
    status: 'draft',
    coverImage: 'cover/img',
    coverImageFit: 'cover',
    seriesId: 'series-1',
    seriesOrder: 2,
    scheduledAt: null,
    authorId: 'user-1',
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
    jest.spyOn(axios, 'post').mockResolvedValue({ data: { id: 'new-post-id' } })
    jest.spyOn(axios, 'put').mockResolvedValue({ data: {} })
  })

  describe('edit post (existing)', () => {
    it('renders edit title and pre-fills fields', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
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
          users={mockUsers}
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
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      expect(screen.getByTestId('title-input')).toHaveValue('Mi Post')
      expect(screen.getByTestId('content-input')).toHaveValue('# Hola')
    })

    it('publish button enabled when both translations saved in DB', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      expect(screen.getByTestId('publish-button')).not.toBeDisabled()
    })

    it('publish button disabled when only one translation saved in DB', () => {
      const enOnlyPost: PostEditorProps['post'] = {
        post: mockExistingPost.post,
        translations: [mockExistingPost.translations[0]],
      }
      renderApp(
        <PostEditor
          post={enOnlyPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      expect(screen.getByTestId('publish-button')).toBeDisabled()
    })

    it('opens publish notify modal when publish button clicked', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('publish-button'))
      expect(
        screen.getByTestId('publish-notify-publish-and-notify'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('publish-notify-publish-only'),
      ).toBeInTheDocument()
    })

    it('sends publish with notify=true when Publish & Notify clicked', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('publish-button'))
      fireEvent.click(screen.getByTestId('publish-notify-publish-and-notify'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as {
        status: string
        notify: boolean
      }
      expect(body.status).toBe('published')
      expect(body.notify).toBe(true)
    })

    it('sends publish with notify=false when Publish Only clicked', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('publish-button'))
      fireEvent.click(screen.getByTestId('publish-notify-publish-only'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as {
        status: string
        notify: boolean
      }
      expect(body.status).toBe('published')
      expect(body.notify).toBe(false)
    })

    it('does not call API when publish notify modal is cancelled', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('publish-button'))
      fireEvent.click(screen.getByTestId('publish-notify-cancel'))
      await new Promise((r) => setTimeout(r, 50))
      expect(axios.put).not.toHaveBeenCalled()
    })

    it('PUT body contains only active locale translation', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as {
        translations: Record<string, unknown>
      }
      expect(body.translations).toHaveProperty('en')
      expect(body.translations).not.toHaveProperty('es')
    })

    it('saves via PUT to /api/posts/:id', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      expect(axios.put).toHaveBeenCalledWith(
        '/api/posts/post123/',
        expect.any(Object),
      )
      expect(mockRefresh).toHaveBeenCalled()
    })

    it('updates status badge after unpublish', async () => {
      const publishedPost: PostEditorProps['post'] = {
        post: { ...mockExistingPost.post, status: 'published' },
        translations: mockExistingPost.translations,
      }
      renderApp(
        <PostEditor
          post={publishedPost}
          categories={mockCategories}
          users={mockUsers}
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
        post: { ...mockExistingPost.post, status: 'published' },
        translations: mockExistingPost.translations,
      }
      renderApp(
        <PostEditor
          post={publishedPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      expect(screen.getByTestId('archive-button')).toBeDisabled()
    })

    it('shows archived state with unarchive + disabled publish', () => {
      const archivedPost: PostEditorProps['post'] = {
        post: { ...mockExistingPost.post, status: 'archived' },
        translations: mockExistingPost.translations,
      }
      renderApp(
        <PostEditor
          post={archivedPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      expect(screen.getByTestId('unarchive-button')).toBeInTheDocument()
      expect(screen.getByTestId('publish-archived-button')).toBeDisabled()
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Archived')
    })

    it('unarchive sends draft status', async () => {
      const archivedPost: PostEditorProps['post'] = {
        post: { ...mockExistingPost.post, status: 'archived' },
        translations: mockExistingPost.translations,
      }
      renderApp(
        <PostEditor
          post={archivedPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('unarchive-button'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as {
        status: string
      }
      expect(body.status).toBe('draft')
    })

    it('does not navigate after successful PUT', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('handles post with null seriesId and seriesOrder', () => {
      const postNoSeries: PostEditorProps['post'] = {
        post: {
          ...mockExistingPost.post,
          seriesId: null,
          seriesOrder: null,
          coverImage: null,
          coverImageFit: null,
        },
        translations: mockExistingPost.translations,
      }
      renderApp(
        <PostEditor
          post={postNoSeries}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      expect(screen.getByTestId('series-id-input')).toHaveValue('')
      expect(screen.getByTestId('series-order-input')).toHaveValue(null)
      expect(screen.getByTestId('cover-image-input')).toHaveValue('')
    })

    it('PUT body includes coverImageFit', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as Record<
        string,
        unknown
      >
      expect(body).toHaveProperty('coverImageFit', 'cover')
    })

    it('pre-fills series title from series prop for active locale when editing', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
          series={[
            {
              id: 'series-1',
              nextOrder: 3,
              translations: [
                { locale: 'en', title: 'Series One EN' },
                { locale: 'es', title: 'Series One ES' },
              ],
            },
          ]}
        />,
      )
      expect(screen.getByTestId('series-title-input')).toHaveValue(
        'Series One EN',
      )
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      expect(screen.getByTestId('series-title-input')).toHaveValue(
        'Series One ES',
      )
    })

    it('does not auto-fill seriesOrder when editing existing post and known series selected', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
          series={[
            { id: 'series-1', nextOrder: 5, translations: [] },
            { id: 'series-2', nextOrder: 7, translations: [] },
          ]}
        />,
      )
      // order was pre-filled from post (2); selecting a different series should NOT override
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'series-2' },
      })
      expect(screen.getByTestId('series-order-input')).toHaveValue(2)
    })

    it('auto-fills seriesOrder when editing post with no existing series and known series selected', () => {
      renderApp(
        <PostEditor
          post={{
            ...mockExistingPost,
            post: {
              ...mockExistingPost.post,
              seriesId: null,
              seriesOrder: null,
            },
          }}
          categories={mockCategories}
          users={mockUsers}
          series={[{ id: 'series-1', nextOrder: 2, translations: [] }]}
        />,
      )
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'series-1' },
      })
      expect(screen.getByTestId('series-order-input')).toHaveValue(2)
    })

    it('PUT body omits seriesTitles when no series ID set', async () => {
      renderApp(
        <PostEditor
          post={{
            ...mockExistingPost,
            post: {
              ...mockExistingPost.post,
              seriesId: null,
              seriesOrder: null,
            },
          }}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as Record<
        string,
        unknown
      >
      expect(body).not.toHaveProperty('seriesTitles')
    })

    it('pre-fills series title as empty when series found but has no translation for locale', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
          series={[
            {
              id: 'series-1',
              nextOrder: 3,
              translations: [],
            },
          ]}
        />,
      )
      expect(screen.getByTestId('series-title-input')).toHaveValue('')
    })

    it('PUT body omits en from seriesTitles when series has no EN translation', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
          series={[{ id: 'series-1', nextOrder: 3, translations: [] }]}
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as {
        seriesTitles: Record<string, string>
      }
      expect(body.seriesTitles).not.toHaveProperty('en')
    })

    it('PUT body includes ES series title when present', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
          series={[
            {
              id: 'series-1',
              nextOrder: 3,
              translations: [{ locale: 'es', title: 'Mi Serie' }],
            },
          ]}
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as {
        seriesTitles: Record<string, string>
      }
      expect(body.seriesTitles).toHaveProperty('es', 'Mi Serie')
    })

    it('pre-fills author select from existing post', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      expect(
        within(screen.getByTestId('author-input')).getByRole('button'),
      ).toHaveTextContent('Admin')
    })

    it('allows selecting a different author in edit mode', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(
        within(screen.getByTestId('author-input')).getByRole('option', {
          name: 'Editor',
        }),
      )
      expect(
        within(screen.getByTestId('author-input')).getByRole('button'),
      ).toHaveTextContent('Editor')
    })

    it('PUT body includes updated author', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(
        within(screen.getByTestId('author-input')).getByRole('option', {
          name: 'Editor',
        }),
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as Record<
        string,
        unknown
      >
      expect(body).toHaveProperty('authorId', 'user-2')
    })

    it('PUT body includes scheduledAt as null when not set', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as Record<
        string,
        unknown
      >
      expect(body).toHaveProperty('scheduledAt', null)
    })

    it('pre-fills scheduledAt when existing post has scheduledAt', () => {
      renderApp(
        <PostEditor
          post={{
            ...mockExistingPost,
            post: {
              ...mockExistingPost.post,
              scheduledAt: new Date('2024-08-01T09:00:00.000Z'),
            },
          }}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      expect(
        screen.getByTestId('scheduled-at-picker-value'),
      ).toBeInTheDocument()
    })

    it('includes tags as array in PUT body uppercased', async () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as {
        tags: string[]
      }
      expect(body.tags).toEqual(['REACT', 'NEXTJS'])
    })

    it('renders hero preview with fallback slug in url when translation slug is empty', () => {
      const postEmptySlug: PostEditorProps['post'] = {
        post: mockExistingPost.post,
        translations: [
          { ...mockExistingPost.translations[0], slug: '' },
          mockExistingPost.translations[1],
        ],
      }
      renderApp(
        <PostEditor
          post={postEmptySlug}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('preview-tab-hero'))
      expect(screen.getByTestId('reading-time')).toBeInTheDocument()
    })
  })

  describe('categories dropdown', () => {
    it('renders category select', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.getByTestId('category-select')).toBeInTheDocument()
    })

    it('shows category options when opened', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(
        within(screen.getByTestId('category-select')).getByRole('button'),
      )
      expect(
        screen.getByRole('option', { name: 'Engineering' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Design' })).toBeInTheDocument()
    })

    it('allows selecting a category', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(
        within(screen.getByTestId('category-select')).getByRole('button'),
      )
      fireEvent.click(screen.getByRole('option', { name: 'Design' }))
      expect(
        within(screen.getByTestId('category-select')).getByRole('button'),
      ).toHaveTextContent('Design')
    })
  })

  describe('card preview tab with existing seriesOrder', () => {
    it('passes parsed seriesOrder to PostCardPreview when seriesOrder is set', () => {
      renderApp(
        <PostEditor
          categories={mockCategories}
          users={mockUsers}
          post={mockExistingPost}
        />,
      )
      fireEvent.click(screen.getByTestId('preview-tab-card'))
      expect(screen.getByTestId('post-card-preview-mock')).toBeInTheDocument()
    })
  })

  describe('draft preview URL', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn().mockResolvedValue(undefined) },
        writable: true,
        configurable: true,
      })
    })

    it('shows draft preview row for draft post with postNumber and slug', () => {
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      expect(screen.getByTestId('draft-preview-row')).toBeInTheDocument()
      expect(screen.getByTestId('draft-preview-link')).toHaveAttribute(
        'href',
        '/en/blog/7/my-post',
      )
    })

    it('does not show draft preview row for published post', () => {
      renderApp(
        <PostEditor
          post={{
            ...mockExistingPost,
            post: { ...mockExistingPost.post, status: 'published' },
          }}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      expect(screen.queryByTestId('draft-preview-row')).not.toBeInTheDocument()
    })

    it('does not show draft preview row when postNumber is null', () => {
      renderApp(
        <PostEditor
          post={{
            ...mockExistingPost,
            post: { ...mockExistingPost.post, postNumber: null },
          }}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      expect(screen.queryByTestId('draft-preview-row')).not.toBeInTheDocument()
    })

    it('copy button writes full URL to clipboard and shows Copied!', async () => {
      jest.useFakeTimers()
      renderApp(
        <PostEditor
          post={mockExistingPost}
          categories={mockCategories}
          users={mockUsers}
        />,
      )
      fireEvent.click(screen.getByTestId('draft-preview-copy-button'))
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('/en/blog/7/my-post'),
        )
      })
      await waitFor(() => {
        expect(
          screen.getByTestId('draft-preview-copy-button'),
        ).toHaveTextContent('Copied!')
      })
      jest.runAllTimers()
      await waitFor(() => {
        expect(
          screen.getByTestId('draft-preview-copy-button'),
        ).toHaveTextContent('Copy')
      })
      jest.useRealTimers()
    })
  })
})
