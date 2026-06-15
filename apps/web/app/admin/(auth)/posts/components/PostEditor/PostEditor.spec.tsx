import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import axios, { AxiosError } from 'axios'
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
        'postEditor.preview': 'Preview',
        'postEditor.previewLoading': 'Rendering…',
        'postEditor.previewTabPost': 'Post',
        'postEditor.previewTabPostMobile': 'Post Mobile',
        'postEditor.previewTabHero': 'Hero',
        'postEditor.previewTabCard': 'Card',
        'postEditor.previewTabToc': 'Table of Contents',
        'postEditor.autoRender': 'Auto',
        'postEditor.updatePreview': 'Render',
        'postEditor.error': 'Something went wrong',
        'images.picker.title': 'Insert Image',
        'publishNotify.message': 'Notify subscribers?',
        'publishNotify.publishAndNotify': 'Publish & Notify',
        'publishNotify.publishOnly': 'Publish Only',
        'publishNotify.cancel': 'Cancel',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('../../../components/PublishNotifyModal', () => ({
  PublishNotifyModal: () => null,
}))

jest.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content }: { content: string }) => (
    <div data-testid="markdown-preview">{content}</div>
  ),
}))

jest.mock('../EmbedInsertModal', () => ({
  EmbedInsertModal: ({
    isOpen,
    onInsert,
    onCancel,
  }: {
    isOpen: boolean
    onInsert: (markdown: string) => void
    onCancel: () => void
    [key: string]: unknown
  }) =>
    isOpen ? (
      <div data-testid="embed-insert-modal-mock">
        <button
          type="button"
          data-testid="embed-modal-insert-mock"
          onClick={() =>
            onInsert(
              '\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\n',
            )
          }
        >
          Insert
        </button>
        <button
          type="button"
          data-testid="embed-modal-cancel-mock"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    ) : null,
}))

jest.mock('../GpxMapModal', () => ({
  GpxMapModal: ({
    isOpen,
    onInsert,
    onCancel,
  }: {
    isOpen: boolean
    onInsert: (markdown: string) => void
    onCancel: () => void
    [key: string]: unknown
  }) =>
    isOpen ? (
      <div data-testid="gpx-map-modal-mock">
        <button
          type="button"
          data-testid="gpx-modal-insert-mock"
          onClick={() =>
            onInsert('\n\n```gpx\nhttps://example.com/track.gpx\n```\n\n')
          }
        >
          Insert
        </button>
        <button
          type="button"
          data-testid="gpx-modal-cancel-mock"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    ) : null,
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

jest.mock('@sdlgr/table-of-contents', () => ({
  TableOfContents: ({
    entries,
    label,
  }: {
    entries: { id: string; text: string; depth: number }[]
    label: string
  }) => (
    <nav data-testid="toc-mock">
      <span data-testid="toc-label">{label}</span>
      <ul>
        {entries.map((e) => (
          <li key={e.id} data-testid="toc-entry">
            {e.text}
          </li>
        ))}
      </ul>
    </nav>
  ),
}))

jest.mock('@web/lib/mdx/remarkHeadings', () => ({
  extractToc: (content: string) => {
    const lines = content.split('\n')
    return lines
      .filter((l) => l.startsWith('#'))
      .map((l) => {
        const match = l.match(/^(#+)\s+(.+)/)
        if (!match) return null
        return {
          depth: match[1].length,
          text: match[2],
          id: match[2].toLowerCase().replace(/\s+/g, '-'),
        }
      })
      .filter(Boolean)
  },
}))

jest.mock('./PostCardPreview', () => ({
  PostCardPreview: () => <div data-testid="post-card-preview-mock" />,
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

  function fillMandatoryFields() {
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'My Post' },
    })
    fireEvent.change(screen.getByTestId('excerpt-input'), {
      target: { value: 'A brief description' },
    })
    fireEvent.change(screen.getByTestId('content-input'), {
      target: { value: '# Content' },
    })
    fireEvent.click(
      within(screen.getByTestId('category-select')).getByRole('option', {
        name: 'Engineering',
      }),
    )
  }

  describe('new post', () => {
    it('save button is disabled when mandatory fields are empty', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.getByTestId('save-button')).toBeDisabled()
    })

    it('save button is enabled when title, excerpt, content, and category are filled', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      expect(screen.getByTestId('save-button')).not.toBeDisabled()
    })

    it('renders new post title and empty fields', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(
        screen.getByRole('heading', { name: 'New Post' }),
      ).toBeInTheDocument()
      expect(screen.getByTestId('title-input')).toHaveValue('')
      expect(screen.getByTestId('slug-input')).toHaveValue('')
    })

    it('shows draft status badge', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Draft')
    })

    it('back link navigates to /admin/posts', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('back-link'))
      expect(mockPush).toHaveBeenCalledWith('/admin/posts')
    })

    it('auto-generates slug from title', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'My New Post' },
      })
      expect(screen.getByTestId('slug-input')).toHaveValue('my-new-post')
    })

    it('stops auto-generating slug after manual edit', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
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

    it('publish button disabled when no translations saved in DB', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.getByTestId('publish-button')).toBeDisabled()
    })

    it('save button is disabled when ES tab active and fields are empty', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      expect(screen.getByTestId('save-button')).toBeDisabled()
    })

    it('save button is enabled when ES tab active and fields are filled', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Mi Post' },
      })
      fireEvent.change(screen.getByTestId('excerpt-input'), {
        target: { value: 'Un extracto' },
      })
      fireEvent.change(screen.getByTestId('content-input'), {
        target: { value: '# Hola' },
      })
      fireEvent.click(
        within(screen.getByTestId('category-select')).getByRole('option', {
          name: 'Engineering',
        }),
      )
      expect(screen.getByTestId('save-button')).not.toBeDisabled()
    })

    it('POST body contains only active locale translation', async () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.post).toHaveBeenCalled())
      const body = (axios.post as jest.Mock).mock.calls[0][1] as {
        translations: Record<string, unknown>
      }
      expect(body.translations).toHaveProperty('en')
      expect(body.translations).not.toHaveProperty('es')
    })

    it('POST body contains ES translation when ES tab active', async () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Mi Post' },
      })
      fireEvent.change(screen.getByTestId('excerpt-input'), {
        target: { value: 'Un extracto' },
      })
      fireEvent.change(screen.getByTestId('content-input'), {
        target: { value: '# Hola' },
      })
      fireEvent.click(
        within(screen.getByTestId('category-select')).getByRole('option', {
          name: 'Engineering',
        }),
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.post).toHaveBeenCalled())
      const body = (axios.post as jest.Mock).mock.calls[0][1] as {
        translations: Record<string, unknown>
      }
      expect(body.translations).toHaveProperty('es')
      expect(body.translations).not.toHaveProperty('en')
    })

    it('creates new post via POST and navigates to edit page', async () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.post).toHaveBeenCalled())
      expect(axios.post).toHaveBeenCalledWith('/api/posts/', expect.any(Object))
      expect(mockPush).toHaveBeenCalledWith('/admin/posts/new-post-id')
    })

    it('shows saving state while fetch is pending', async () => {
      let resolvePost!: (v: unknown) => void
      jest.spyOn(axios, 'post').mockReturnValue(
        new Promise((res) => {
          resolvePost = res
        }),
      )
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      fireEvent.click(screen.getByTestId('save-button'))
      expect(screen.getByTestId('save-button')).toHaveTextContent('Saving…')
      resolvePost({ data: { id: 'x' } })
      await waitFor(() =>
        expect(screen.getByTestId('save-button')).toHaveTextContent('Save'),
      )
    })

    it('shows error when API fails with string error', async () => {
      jest.spyOn(axios, 'post').mockRejectedValue(
        new AxiosError('error', '400', undefined, undefined, {
          status: 400,
          data: { error: 'Category not found' },
          statusText: 'Bad Request',
          headers: {},
          config: {} as never,
        }),
      )
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      fireEvent.click(screen.getByTestId('save-button'))
      expect(await screen.findByTestId('editor-error')).toHaveTextContent(
        'Category not found',
      )
    })

    it('shows fallback error when API error is not string', async () => {
      jest.spyOn(axios, 'post').mockRejectedValue(
        new AxiosError('error', '400', undefined, undefined, {
          status: 400,
          data: { error: [{ message: 'invalid' }] },
          statusText: 'Bad Request',
          headers: {},
          config: {} as never,
        }),
      )
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      fireEvent.click(screen.getByTestId('save-button'))
      expect(await screen.findByTestId('editor-error')).toHaveTextContent(
        'Something went wrong',
      )
    })

    it('shows fallback error when API returns non-JSON body', async () => {
      jest.spyOn(axios, 'post').mockRejectedValue(
        new AxiosError('error', '500', undefined, undefined, {
          status: 500,
          data: null,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as never,
        }),
      )
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      fireEvent.click(screen.getByTestId('save-button'))
      expect(await screen.findByTestId('editor-error')).toHaveTextContent(
        'Something went wrong',
      )
    })

    it('silently ignores non-axios errors on save', async () => {
      jest.spyOn(axios, 'post').mockRejectedValue(new Error('Network timeout'))
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.post).toHaveBeenCalled())
      expect(screen.queryByTestId('editor-error')).not.toBeInTheDocument()
    })

    it('does not show archive button when creating a new post', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.queryByTestId('archive-button')).not.toBeInTheDocument()
    })

    it('sends archived status when archive button clicked on existing draft', async () => {
      jest.spyOn(axios, 'put').mockResolvedValue({ data: {} })
      renderApp(
        <PostEditor
          categories={mockCategories}
          users={mockUsers}
          post={mockExistingPost}
        />,
      )
      fireEvent.click(screen.getByTestId('archive-button'))
      await waitFor(() => expect(axios.put).toHaveBeenCalled())
      const body = (axios.put as jest.Mock).mock.calls[0][1] as {
        status: string
      }
      expect(body.status).toBe('archived')
    })

    it('switching locale tab preserves EN state', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'English Title' },
      })
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      fireEvent.click(screen.getByTestId('locale-tab-en'))
      expect(screen.getByTestId('title-input')).toHaveValue('English Title')
    })

    it('locale tabs are independent', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
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

    it('tags, category, series fields are editable', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.change(screen.getByTestId('tags-input'), {
        target: { value: 'react, nextjs' },
      })
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      fireEvent.change(screen.getByTestId('series-order-input'), {
        target: { value: '3' },
      })
      expect(screen.getByTestId('tags-input')).toHaveValue('react, nextjs')
      expect(screen.getByTestId('series-id-input')).toHaveValue('my-series')
      expect(screen.getByTestId('series-order-input')).toHaveValue(3)
    })

    it('excerpt field is editable', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.change(screen.getByTestId('excerpt-input'), {
        target: { value: 'A brief description' },
      })
      expect(screen.getByTestId('excerpt-input')).toHaveValue(
        'A brief description',
      )
    })

    it('content field updates preview pane', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.change(screen.getByTestId('content-input'), {
        target: { value: '# My heading' },
      })
      expect(screen.getByTestId('markdown-preview')).toHaveTextContent(
        '# My heading',
      )
    })

    it('includes optional fields in POST body when filled', async () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      fireEvent.click(screen.getByTestId('cover-image-input'))
      fireEvent.click(screen.getByTestId('image-picker-insert'))
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      fireEvent.change(screen.getByTestId('series-order-input'), {
        target: { value: '2' },
      })
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.post).toHaveBeenCalled())
      const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
        string,
        unknown
      >
      expect(body).toHaveProperty('coverImage', 'sawl.dev - blog/img')
      expect(body).toHaveProperty('seriesId', 'my-series')
      expect(body).toHaveProperty('seriesOrder', 2)
    })

    it('tag isValidNewOption filters out invalid tags', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.change(screen.getByTestId('tags-input'), {
        target: { value: 'valid-tag, invalid!@#, another' },
      })
      expect(screen.getByTestId('tags-input')).toHaveValue('valid-tag, another')
    })

    it('renders series options when series prop provided', () => {
      renderApp(
        <PostEditor
          categories={mockCategories}
          users={mockUsers}
          series={[
            { id: 'series-a', nextOrder: 1, translations: [] },
            { id: 'series-b', nextOrder: 1, translations: [] },
          ]}
        />,
      )
      expect(screen.getByTestId('series-id-input')).toBeInTheDocument()
    })

    it('shows coverImageFit select', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.getByTestId('cover-image-fit-select')).toBeInTheDocument()
    })

    it('coverImageFit defaults to cover', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(
        within(screen.getByTestId('cover-image-fit-select')).getByRole(
          'button',
        ),
      ).toHaveTextContent('Cover (fill)')
    })

    it('POST body includes coverImageFit', async () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.post).toHaveBeenCalled())
      const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
        string,
        unknown
      >
      expect(body).toHaveProperty('coverImageFit', 'cover')
    })

    it('POST body includes changed coverImageFit', async () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      fireEvent.click(
        within(screen.getByTestId('cover-image-fit-select')).getByRole(
          'option',
          { name: 'Contain (full image)' },
        ),
      )
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.post).toHaveBeenCalled())
      const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
        string,
        unknown
      >
      expect(body).toHaveProperty('coverImageFit', 'contain')
    })

    it('series title input hidden when no series ID', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.queryByTestId('series-title-input')).not.toBeInTheDocument()
    })

    it('series title input shown for active locale when series ID set', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      expect(screen.getByTestId('series-title-input')).toBeInTheDocument()
    })

    it('series title prefilled from series prop for active locale when series ID matches', () => {
      renderApp(
        <PostEditor
          categories={mockCategories}
          users={mockUsers}
          series={[
            {
              id: 'my-series',
              nextOrder: 3,
              translations: [
                { locale: 'en', title: 'My EN Series' },
                { locale: 'es', title: 'My ES Series' },
              ],
            },
          ]}
        />,
      )
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      expect(screen.getByTestId('series-title-input')).toHaveValue(
        'My EN Series',
      )
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      expect(screen.getByTestId('series-title-input')).toHaveValue(
        'My ES Series',
      )
    })

    it('series title input hidden when series ID cleared', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      fireEvent.change(screen.getByTestId('series-title-input'), {
        target: { value: 'Some Title' },
      })
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: '' },
      })
      expect(screen.queryByTestId('series-title-input')).not.toBeInTheDocument()
    })

    it('auto-fills seriesOrder with nextOrder when known series selected (new post)', () => {
      renderApp(
        <PostEditor
          categories={mockCategories}
          users={mockUsers}
          series={[{ id: 'my-series', nextOrder: 3, translations: [] }]}
        />,
      )
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      expect(screen.getByTestId('series-order-input')).toHaveValue(3)
    })

    it('auto-fills seriesOrder with 1 when new series created', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'brand-new-series' },
      })
      expect(screen.getByTestId('series-order-input')).toHaveValue(1)
    })

    it('pre-fills EN and ES series titles from translations when series selected via input', () => {
      renderApp(
        <PostEditor
          categories={mockCategories}
          users={mockUsers}
          series={[
            {
              id: 'my-series',
              nextOrder: 3,
              translations: [
                { locale: 'en', title: 'My EN Series' },
                { locale: 'es', title: 'My ES Series' },
              ],
            },
          ]}
        />,
      )
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      expect(screen.getByTestId('series-title-input')).toHaveValue(
        'My EN Series',
      )
    })

    it('POST body includes seriesTitles when series ID and title set', async () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillMandatoryFields()
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      fireEvent.change(screen.getByTestId('series-title-input'), {
        target: { value: 'My Series Title' },
      })
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.post).toHaveBeenCalled())
      const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
        string,
        unknown
      >
      expect(body).toHaveProperty('seriesTitles', { en: 'My Series Title' })
    })

    describe('scheduledAt field', () => {
      it('renders scheduledAt picker', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        expect(screen.getByTestId('scheduled-at-picker')).toBeInTheDocument()
      })

      it('scheduledAt is null by default', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        expect(
          screen.queryByTestId('scheduled-at-picker-value'),
        ).not.toBeInTheDocument()
      })

      it('POST body includes scheduledAt as null when not set', async () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fillMandatoryFields()
        fireEvent.click(screen.getByTestId('save-button'))
        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
          string,
          unknown
        >
        expect(body).toHaveProperty('scheduledAt', null)
      })

      it('POST body includes scheduledAt as ISO string when set', async () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fillMandatoryFields()
        fireEvent.click(screen.getByTestId('scheduled-at-picker-set'))
        fireEvent.click(screen.getByTestId('save-button'))
        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
          string,
          unknown
        >
        expect(body).toHaveProperty('scheduledAt', '2024-06-15T00:00:00.000Z')
      })

      it('scheduledAt can be cleared', async () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fillMandatoryFields()
        fireEvent.click(screen.getByTestId('scheduled-at-picker-set'))
        expect(
          screen.getByTestId('scheduled-at-picker-value'),
        ).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('scheduled-at-picker-clear'))
        expect(
          screen.queryByTestId('scheduled-at-picker-value'),
        ).not.toBeInTheDocument()
      })
    })

    describe('author field', () => {
      it('renders author select with first user as default', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        expect(screen.getByTestId('author-input')).toBeInTheDocument()
        expect(
          within(screen.getByTestId('author-input')).getByRole('button'),
        ).toHaveTextContent('Admin')
      })

      it('POST body uses first user ID as author when no currentUserId', async () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fillMandatoryFields()
        fireEvent.click(screen.getByTestId('save-button'))
        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
          string,
          unknown
        >
        expect(body).toHaveProperty('authorId', 'user-1')
      })

      it('allows selecting a different author', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(
          within(screen.getByTestId('author-input')).getByRole('option', {
            name: 'Editor',
          }),
        )
        expect(
          within(screen.getByTestId('author-input')).getByRole('button'),
        ).toHaveTextContent('Editor')
      })

      it('POST body uses selected user ID as authorId', async () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(
          within(screen.getByTestId('author-input')).getByRole('option', {
            name: 'Editor',
          }),
        )
        fillMandatoryFields()
        fireEvent.click(screen.getByTestId('save-button'))
        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
          string,
          unknown
        >
        expect(body).toHaveProperty('authorId', 'user-2')
      })

      it('author field is rendered for existing posts', () => {
        renderApp(
          <PostEditor
            post={mockExistingPost}
            categories={mockCategories}
            users={mockUsers}
          />,
        )
        expect(screen.getByTestId('author-input')).toBeInTheDocument()
      })

      it('defaults author to empty string when users array is empty', () => {
        renderApp(<PostEditor categories={mockCategories} users={[]} />)
        expect(
          within(screen.getByTestId('author-input')).getByRole('button'),
        ).toHaveTextContent('')
      })

      it('pre-fills author with currentUserId when provided', () => {
        renderApp(
          <PostEditor
            categories={mockCategories}
            users={mockUsers}
            currentUserId="user-2"
          />,
        )
        expect(
          within(screen.getByTestId('author-input')).getByRole('button'),
        ).toHaveTextContent('Editor')
      })

      it('renders read-only input for non-admin user', () => {
        renderApp(
          <PostEditor
            categories={mockCategories}
            users={mockUsers}
            currentUserId="user-2"
            currentUserRole="editor"
          />,
        )
        const authorInput = screen.getByTestId('author-input')
        expect(authorInput).toHaveAttribute('readonly')
        expect(authorInput).toHaveValue('Editor')
      })

      it('defaults author to empty string when existing post has no authorId', () => {
        const postWithoutAuthor = {
          ...mockExistingPost,
          post: { ...mockExistingPost.post, authorId: null },
        }
        renderApp(
          <PostEditor
            post={postWithoutAuthor as never}
            categories={mockCategories}
            users={mockUsers}
          />,
        )
        expect(screen.getByTestId('author-input')).toBeInTheDocument()
      })

      it('shows empty author name when editAuthor does not match any user', () => {
        renderApp(
          <PostEditor
            categories={mockCategories}
            users={mockUsers}
            currentUserId="non-existent-id"
            currentUserRole="editor"
          />,
        )
        const authorInput = screen.getByTestId('author-input')
        expect(authorInput).toHaveAttribute('readonly')
        expect(authorInput).toHaveValue('')
      })

      it('non-admin cannot change author in new post body', async () => {
        renderApp(
          <PostEditor
            categories={mockCategories}
            users={mockUsers}
            currentUserId="user-2"
            currentUserRole="editor"
          />,
        )
        fillMandatoryFields()
        fireEvent.click(screen.getByTestId('save-button'))
        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
          string,
          unknown
        >
        expect(body).toHaveProperty('authorId', 'user-2')
      })
    })

    describe('preview tabs', () => {
      it('renders all five preview tabs', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        expect(screen.getByTestId('preview-tab-post')).toBeInTheDocument()
        expect(
          screen.getByTestId('preview-tab-post-mobile'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('preview-tab-hero')).toBeInTheDocument()
        expect(screen.getByTestId('preview-tab-card')).toBeInTheDocument()
        expect(screen.getByTestId('preview-tab-toc')).toBeInTheDocument()
      })

      it('Post tab is active by default and shows markdown preview', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
        expect(screen.queryByTestId('post-hero-mock')).not.toBeInTheDocument()
        expect(
          screen.queryByTestId('post-card-preview-mock'),
        ).not.toBeInTheDocument()
      })

      it('clicking Post Mobile tab shows mobile frame with markdown preview', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(screen.getByTestId('preview-tab-post-mobile'))
        expect(screen.getByTestId('mobile-frame')).toBeInTheDocument()
        expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
        expect(screen.queryByTestId('post-hero-mock')).not.toBeInTheDocument()
        expect(
          screen.queryByTestId('post-card-preview-mock'),
        ).not.toBeInTheDocument()
      })

      it('clicking Hero tab shows PostHero and hides markdown preview', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(screen.getByTestId('preview-tab-hero'))
        expect(screen.getByTestId('post-hero-mock')).toBeInTheDocument()
        expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument()
      })

      it('clicking Card tab shows PostCard and hides markdown preview', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(screen.getByTestId('preview-tab-card'))
        expect(screen.getByTestId('post-card-preview-mock')).toBeInTheDocument()
        expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument()
      })

      it('switching back to Post tab shows markdown preview again', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(screen.getByTestId('preview-tab-hero'))
        fireEvent.click(screen.getByTestId('preview-tab-post'))
        expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
        expect(screen.queryByTestId('post-hero-mock')).not.toBeInTheDocument()
      })

      it('clicking TOC tab shows toc preview and hides markdown preview', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(screen.getByTestId('preview-tab-toc'))
        expect(screen.getByTestId('toc-preview')).toBeInTheDocument()
        expect(screen.getByTestId('toc-mock')).toBeInTheDocument()
        expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument()
      })

      it('TOC tab renders extracted headings from content', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.change(screen.getByTestId('content-input'), {
          target: { value: '# My Heading\n\n## Sub Heading' },
        })
        fireEvent.click(screen.getByTestId('preview-tab-toc'))
        const entries = screen.getAllByTestId('toc-entry')
        expect(entries).toHaveLength(2)
        expect(entries[0]).toHaveTextContent('My Heading')
        expect(entries[1]).toHaveTextContent('Sub Heading')
      })

      it('TOC tab passes label to TableOfContents', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(screen.getByTestId('preview-tab-toc'))
        expect(screen.getByTestId('toc-label')).toHaveTextContent(
          'Table of Contents',
        )
      })

      it('switching back from TOC tab to Post tab shows markdown preview', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(screen.getByTestId('preview-tab-toc'))
        fireEvent.click(screen.getByTestId('preview-tab-post'))
        expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
        expect(screen.queryByTestId('toc-preview')).not.toBeInTheDocument()
      })
    })

    describe('auto-render', () => {
      it('renders auto-render checkbox checked by default', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        expect(screen.getByTestId('auto-render-checkbox')).toBeChecked()
      })

      it('does not show update button when auto-render is enabled', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        expect(
          screen.queryByTestId('update-preview-button'),
        ).not.toBeInTheDocument()
      })

      it('shows update button when auto-render is disabled', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(screen.getByTestId('auto-render-checkbox'))
        expect(screen.getByTestId('update-preview-button')).toBeInTheDocument()
      })

      it('preview does not update when auto-render is off and content changes', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(screen.getByTestId('auto-render-checkbox'))
        fireEvent.change(screen.getByTestId('content-input'), {
          target: { value: '# New heading' },
        })
        expect(screen.getByTestId('markdown-preview')).not.toHaveTextContent(
          '# New heading',
        )
      })

      it('clicking update button syncs preview when auto-render is off', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(screen.getByTestId('auto-render-checkbox'))
        fireEvent.change(screen.getByTestId('content-input'), {
          target: { value: '# Manual heading' },
        })
        fireEvent.click(screen.getByTestId('update-preview-button'))
        expect(screen.getByTestId('markdown-preview')).toHaveTextContent(
          '# Manual heading',
        )
      })

      it('re-enabling auto-render immediately syncs preview', () => {
        renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
        fireEvent.click(screen.getByTestId('auto-render-checkbox'))
        fireEvent.change(screen.getByTestId('content-input'), {
          target: { value: '# Auto heading' },
        })
        fireEvent.click(screen.getByTestId('auto-render-checkbox'))
        expect(screen.getByTestId('markdown-preview')).toHaveTextContent(
          '# Auto heading',
        )
      })
    })
  })

  describe('Embed insert modal', () => {
    it('does not show embed modal by default', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(
        screen.queryByTestId('embed-insert-modal-mock'),
      ).not.toBeInTheDocument()
    })

    it('shows embed modal when insert embed button clicked', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('open-embed-modal-button'))
      expect(screen.getByTestId('embed-insert-modal-mock')).toBeInTheDocument()
    })

    it('closes embed modal when cancel is clicked', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('open-embed-modal-button'))
      fireEvent.click(screen.getByTestId('embed-modal-cancel-mock'))
      expect(
        screen.queryByTestId('embed-insert-modal-mock'),
      ).not.toBeInTheDocument()
    })

    it('inserts markdown at cursor and closes modal on insert', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.change(screen.getByTestId('content-input'), {
        target: { value: 'Hello ' },
      })
      fireEvent.click(screen.getByTestId('open-embed-modal-button'))
      fireEvent.click(screen.getByTestId('embed-modal-insert-mock'))
      expect(screen.getByTestId('content-input')).toHaveValue(
        'Hello \n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\n',
      )
      expect(
        screen.queryByTestId('embed-insert-modal-mock'),
      ).not.toBeInTheDocument()
    })
  })

  describe('GPX Map modal', () => {
    it('does not show GPX modal by default', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.queryByTestId('gpx-map-modal-mock')).not.toBeInTheDocument()
    })

    it('shows GPX modal when insert GPX button clicked', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('open-gpx-modal-button'))
      expect(screen.getByTestId('gpx-map-modal-mock')).toBeInTheDocument()
    })

    it('closes GPX modal when cancel is clicked', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('open-gpx-modal-button'))
      fireEvent.click(screen.getByTestId('gpx-modal-cancel-mock'))
      expect(screen.queryByTestId('gpx-map-modal-mock')).not.toBeInTheDocument()
    })

    it('inserts markdown at cursor and closes modal on insert', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.change(screen.getByTestId('content-input'), {
        target: { value: 'Hello ' },
      })
      fireEvent.click(screen.getByTestId('open-gpx-modal-button'))
      fireEvent.click(screen.getByTestId('gpx-modal-insert-mock'))
      expect(screen.getByTestId('content-input')).toHaveValue(
        'Hello \n\n```gpx\nhttps://example.com/track.gpx\n```\n\n',
      )
      expect(screen.queryByTestId('gpx-map-modal-mock')).not.toBeInTheDocument()
    })
  })
})
