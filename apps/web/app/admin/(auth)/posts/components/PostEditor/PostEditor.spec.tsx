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

jest.mock('@sdlgr/checkbox', () => ({
  Checkbox: ({
    id,
    label,
    checked,
    onChange,
    'data-testid': testId,
    disabled,
  }: {
    id: string
    label?: string
    checked: boolean
    onChange: (checked: boolean) => void
    'data-testid'?: string
    disabled?: boolean
  }) => (
    <label htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        data-testid={testId}
      />
      {label && <span>{label}</span>}
    </label>
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      expect(screen.getByTestId('save-button')).toBeDisabled()
    })

    it('save button is enabled when title, excerpt, content, and category are filled', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fillMandatoryFields()
      expect(screen.getByTestId('save-button')).not.toBeDisabled()
    })

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

    it('publish button disabled when no translations saved in DB', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      expect(screen.getByTestId('publish-button')).toBeDisabled()
    })

    it('save button is disabled when ES tab active and fields are empty', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      expect(screen.getByTestId('save-button')).toBeDisabled()
    })

    it('save button is enabled when ES tab active and fields are filled', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fillMandatoryFields()
      fireEvent.click(screen.getByTestId('save-button'))
      expect(await screen.findByTestId('editor-error')).toHaveTextContent(
        'Something went wrong',
      )
    })

    it('silently ignores non-axios errors on save', async () => {
      jest.spyOn(axios, 'post').mockRejectedValue(new Error('Network timeout'))
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fillMandatoryFields()
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(axios.post).toHaveBeenCalled())
      expect(screen.queryByTestId('editor-error')).not.toBeInTheDocument()
    })

    it('sends archived status when archive button clicked', async () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.click(screen.getByTestId('archive-button'))
      await waitFor(() => expect(axios.post).toHaveBeenCalled())
      const body = (axios.post as jest.Mock).mock.calls[0][1] as {
        status: string
      }
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

    it('tags, category, series fields are editable', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('tags-input'), {
        target: { value: 'valid-tag, invalid!@#, another' },
      })
      expect(screen.getByTestId('tags-input')).toHaveValue('valid-tag, another')
    })

    it('renders series options when series prop provided', () => {
      renderApp(
        <PostEditor
          categories={mockCategories}
          author="Admin"
          series={[
            { id: 'series-a', nextOrder: 1, translations: [] },
            { id: 'series-b', nextOrder: 1, translations: [] },
          ]}
        />,
      )
      expect(screen.getByTestId('series-id-input')).toBeInTheDocument()
    })

    it('shows coverImageFit select', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      expect(screen.getByTestId('cover-image-fit-select')).toBeInTheDocument()
    })

    it('coverImageFit defaults to cover', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      expect(
        within(screen.getByTestId('cover-image-fit-select')).getByRole(
          'button',
        ),
      ).toHaveTextContent('Cover (fill)')
    })

    it('POST body includes coverImageFit', async () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      expect(screen.queryByTestId('series-title-input')).not.toBeInTheDocument()
    })

    it('series title input shown for active locale when series ID set', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      expect(screen.getByTestId('series-title-input')).toBeInTheDocument()
    })

    it('series title prefilled from series prop for active locale when series ID matches', () => {
      renderApp(
        <PostEditor
          categories={mockCategories}
          author="Admin"
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
          author="Admin"
          series={[{ id: 'my-series', nextOrder: 3, translations: [] }]}
        />,
      )
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'my-series' },
      })
      expect(screen.getByTestId('series-order-input')).toHaveValue(3)
    })

    it('auto-fills seriesOrder with 1 when new series created', () => {
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
      fireEvent.change(screen.getByTestId('series-id-input'), {
        target: { value: 'brand-new-series' },
      })
      expect(screen.getByTestId('series-order-input')).toHaveValue(1)
    })

    it('pre-fills EN and ES series titles from translations when series selected via input', () => {
      renderApp(
        <PostEditor
          categories={mockCategories}
          author="Admin"
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
      renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
        renderApp(<PostEditor categories={mockCategories} author="Admin" />)
        expect(screen.getByTestId('scheduled-at-picker')).toBeInTheDocument()
      })

      it('scheduledAt is null by default', () => {
        renderApp(<PostEditor categories={mockCategories} author="Admin" />)
        expect(
          screen.queryByTestId('scheduled-at-picker-value'),
        ).not.toBeInTheDocument()
      })

      it('POST body includes scheduledAt as null when not set', async () => {
        renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
        renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
        renderApp(<PostEditor categories={mockCategories} author="Admin" />)
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
      it('renders author input with default value when checkbox checked', () => {
        renderApp(<PostEditor categories={mockCategories} author="Admin" />)
        expect(screen.getByTestId('author-input')).toHaveValue('Saúl de León')
        expect(screen.getByTestId('author-input')).toBeDisabled()
      })

      it('author checkbox is checked by default', () => {
        renderApp(<PostEditor categories={mockCategories} author="Admin" />)
        expect(screen.getByTestId('author-use-default-checkbox')).toBeChecked()
      })

      it('unchecking checkbox enables author input', () => {
        renderApp(<PostEditor categories={mockCategories} author="Admin" />)
        fireEvent.click(screen.getByTestId('author-use-default-checkbox'))
        expect(screen.getByTestId('author-input')).not.toBeDisabled()
      })

      it('allows typing custom author when unchecked', () => {
        renderApp(<PostEditor categories={mockCategories} author="Admin" />)
        fireEvent.click(screen.getByTestId('author-use-default-checkbox'))
        fireEvent.change(screen.getByTestId('author-input'), {
          target: { value: 'Jane Doe' },
        })
        expect(screen.getByTestId('author-input')).toHaveValue('Jane Doe')
      })

      it('POST body uses default author when checkbox checked', async () => {
        renderApp(<PostEditor categories={mockCategories} author="Admin" />)
        fillMandatoryFields()
        fireEvent.click(screen.getByTestId('save-button'))
        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
          string,
          unknown
        >
        expect(body).toHaveProperty('author', 'Saúl de León')
      })

      it('POST body uses custom author when checkbox unchecked and name typed', async () => {
        renderApp(<PostEditor categories={mockCategories} author="Admin" />)
        fireEvent.click(screen.getByTestId('author-use-default-checkbox'))
        fireEvent.change(screen.getByTestId('author-input'), {
          target: { value: 'Jane Doe' },
        })
        fillMandatoryFields()
        fireEvent.click(screen.getByTestId('save-button'))
        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
          string,
          unknown
        >
        expect(body).toHaveProperty('author', 'Jane Doe')
      })

      it('POST body falls back to author prop when unchecked and input empty', async () => {
        renderApp(
          <PostEditor categories={mockCategories} author="Fallback Author" />,
        )
        fireEvent.click(screen.getByTestId('author-use-default-checkbox'))
        fillMandatoryFields()
        fireEvent.click(screen.getByTestId('save-button'))
        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        const body = (axios.post as jest.Mock).mock.calls[0][1] as Record<
          string,
          unknown
        >
        expect(body).toHaveProperty('author', 'Fallback Author')
      })

      it('author field is rendered for existing posts without checkbox', () => {
        renderApp(
          <PostEditor
            post={mockExistingPost}
            categories={mockCategories}
            author="Admin"
          />,
        )
        expect(screen.getByTestId('author-input')).toBeInTheDocument()
        expect(
          screen.queryByTestId('author-use-default-checkbox'),
        ).not.toBeInTheDocument()
      })
    })
  })
})
