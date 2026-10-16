import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import type { Mock } from 'vitest'

import { renderApp } from '@sdlgr/test-utils'

import type { PostEditorProps } from './PostEditor'
import { PostEditor } from './PostEditor'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: vi.fn().mockReturnValue({
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
        'postEditor.draftPreviewLabel': 'Preview:',
        'postEditor.draftPreviewCopy': 'Copy',
        'postEditor.draftPreviewCopied': 'Copied!',
        'postEditor.fields.commentsEnabled': 'Comments enabled',
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

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('../../../components/PublishNotifyModal', () => ({
  PublishNotifyModal: () => null,
}))

vi.mock('../MarkdownPreview', () => ({
  MarkdownPreview: ({ content }: { content: string }) => (
    <div data-testid="markdown-preview">{content}</div>
  ),
}))

vi.mock('../EmbedInsertModal', () => ({
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

const mockTranslation = {
  status: { available: true } as
    | { available: true }
    | { available: false; reason: string; message: string }
    | null,
  recheck: vi.fn(),
  translate: vi.fn(),
  cancel: vi.fn(),
  isTranslating: false,
  error: null as string | null,
}

vi.mock('./usePostTranslation', () => ({
  usePostTranslation: () => mockTranslation,
}))

vi.mock('../LinkInsertModal', () => ({
  LinkInsertModal: ({
    isOpen,
    initialText,
    onInsert,
    onCancel,
  }: {
    isOpen: boolean
    initialText: string
    onInsert: (markdown: string) => void
    onCancel: () => void
  }) =>
    isOpen ? (
      <div data-testid="link-insert-modal-mock" data-initial-text={initialText}>
        <button
          data-testid="link-modal-insert-mock"
          onClick={() => onInsert(`[${initialText || 'x'}](https://a.b)`)}
        />
        <button data-testid="link-modal-cancel-mock" onClick={onCancel} />
      </div>
    ) : null,
}))

vi.mock('../SlideshowInsertModal', () => ({
  SlideshowInsertModal: ({
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
      <div data-testid="slideshow-insert-modal-mock">
        <button
          type="button"
          data-testid="slideshow-modal-insert-mock"
          onClick={() =>
            onInsert(
              '\n\n```slideshow\n![](https://example.com/1.jpg)\n```\n\n',
            )
          }
        >
          Insert
        </button>
        <button
          type="button"
          data-testid="slideshow-modal-cancel-mock"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    ) : null,
}))

vi.mock('../GpxMapModal', () => ({
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

vi.mock('../ImagePicker', () => ({
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

vi.mock('@web/utils/slugify', () => ({
  slugify: (text: string) => text.toLowerCase().replace(/\s+/g, '-'),
}))

vi.mock('@sdlgr/date-picker', () => ({
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

vi.mock('@sdlgr/post-hero', () => ({
  PostHero: ({ readingTime }: { readingTime: number }) => (
    <div data-testid="post-hero-mock">
      <span data-testid="reading-time">{readingTime}</span>
    </div>
  ),
}))

vi.mock('@sdlgr/table-of-contents', () => ({
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

vi.mock('@web/lib/mdx/remarkHeadings', () => ({
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

vi.mock('./PostCardPreview', () => ({
  PostCardPreview: () => <div data-testid="post-card-preview-mock" />,
}))

vi.mock('./CoverImageInput', () => ({
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

vi.mock('@sdlgr/combobox', () => ({
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

vi.mock('@sdlgr/select', () => ({
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

describe('PostEditor tools', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { id: 'new-post-id' } })
    vi.spyOn(axios, 'put').mockResolvedValue({ data: {} })
  })

  describe('Link insert modal', () => {
    it('opens and closes the link modal', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(
        screen.queryByTestId('link-insert-modal-mock'),
      ).not.toBeInTheDocument()
      fireEvent.click(screen.getByTestId('format-link'))
      expect(screen.getByTestId('link-insert-modal-mock')).toHaveAttribute(
        'data-initial-text',
        '',
      )
      fireEvent.click(screen.getByTestId('link-modal-cancel-mock'))
      expect(
        screen.queryByTestId('link-insert-modal-mock'),
      ).not.toBeInTheDocument()
    })

    it('turns the selected text into a link', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      const input = screen.getByTestId('content-input') as HTMLTextAreaElement
      fireEvent.change(input, { target: { value: 'Visit the refuge now' } })
      input.setSelectionRange(10, 16)
      fireEvent.click(screen.getByTestId('format-link'))
      expect(screen.getByTestId('link-insert-modal-mock')).toHaveAttribute(
        'data-initial-text',
        'refuge',
      )
      fireEvent.click(screen.getByTestId('link-modal-insert-mock'))
      expect(input).toHaveValue('Visit the [refuge](https://a.b) now')
      expect(
        screen.queryByTestId('link-insert-modal-mock'),
      ).not.toBeInTheDocument()
    })
  })

  describe('Formatting toolbar', () => {
    it('formats the selection and keeps it selected', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      const input = screen.getByTestId('content-input') as HTMLTextAreaElement
      fireEvent.change(input, { target: { value: 'a word b' } })
      input.setSelectionRange(2, 6)
      fireEvent.click(screen.getByTestId('format-bold'))
      expect(input).toHaveValue('a **word** b')
      expect(input.selectionStart).toBe(4)
      expect(input.selectionEnd).toBe(8)
      expect(input).toHaveFocus()
    })

    it('opens the link modal from the toolbar', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('format-link'))
      expect(screen.getByTestId('link-insert-modal-mock')).toBeInTheDocument()
    })

    it('handles keyboard shortcuts in the content', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      const input = screen.getByTestId('content-input') as HTMLTextAreaElement
      fireEvent.change(input, { target: { value: 'word' } })
      input.setSelectionRange(0, 4)
      fireEvent.keyDown(input, { key: 'a' })
      expect(input).toHaveValue('word')
      fireEvent.keyDown(input, { key: 'i', ctrlKey: true })
      expect(input).toHaveValue('_word_')
      fireEvent.keyDown(input, { key: 'k', metaKey: true })
      expect(screen.getByTestId('link-insert-modal-mock')).toHaveAttribute(
        'data-initial-text',
        'word',
      )
    })

    it('shows the Markdown guide', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.getByTestId('markdown-guide')).toHaveTextContent(
        'Markdown guide',
      )
    })
  })

  describe('Translation', () => {
    beforeEach(() => {
      mockTranslation.isTranslating = false
      mockTranslation.error = null
      mockTranslation.status = { available: true }
    })

    function fillLocale(title: string, excerpt: string, content: string) {
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: title },
      })
      fireEvent.change(screen.getByTestId('excerpt-input'), {
        target: { value: excerpt },
      })
      fireEvent.change(screen.getByTestId('content-input'), {
        target: { value: content },
      })
    }

    it('needs content in the open language', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.getByTestId('translate-button')).toBeDisabled()
      expect(screen.getByTestId('translate-button')).toHaveTextContent(
        'postEditor.translate.to.es',
      )
    })

    it('translates the open language into the other and shows it', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillLocale('Hello', 'Short', 'Body')
      fireEvent.click(screen.getByTestId('translate-button'))
      const [from, to, fields, onProgress] =
        mockTranslation.translate.mock.calls[0]
      expect([from, to, fields]).toEqual([
        'en',
        'es',
        { title: 'Hello', excerpt: 'Short', content: 'Body' },
      ])
      // Switched to the Spanish tab to watch the translation arrive.
      expect(screen.getByTestId('translate-button')).toHaveTextContent(
        'postEditor.translate.to.en',
      )
      act(() => onProgress({ content: 'Cuer' }))
      expect(screen.getByTestId('content-input')).toHaveValue('Cuer')
      act(() =>
        onProgress({
          title: 'Hola mundo',
          excerpt: 'Corto',
          content: 'Cuerpo',
        }),
      )
      expect(screen.getByTestId('title-input')).toHaveValue('Hola mundo')
      expect(screen.getByTestId('slug-input')).toHaveValue('hola-mundo')
      expect(screen.getByTestId('excerpt-input')).toHaveValue('Corto')
    })

    it('translates Spanish into English too', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      fillLocale('Hola', '', 'Cuerpo')
      fireEvent.click(screen.getByTestId('translate-button'))
      const [from, to] = mockTranslation.translate.mock.calls[0]
      expect([from, to]).toEqual(['es', 'en'])
    })

    it('keeps a hand-edited slug', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      fireEvent.change(screen.getByTestId('slug-input'), {
        target: { value: 'mi-slug' },
      })
      fireEvent.click(screen.getByTestId('locale-tab-en'))
      fillLocale('Hello', 'Short', 'Body')
      // A slug alone is not text to overwrite: no confirmation.
      fireEvent.click(screen.getByTestId('translate-button'))
      const onProgress = mockTranslation.translate.mock.calls[0][3]
      act(() => onProgress({ title: 'Hola' }))
      expect(screen.getByTestId('slug-input')).toHaveValue('mi-slug')
    })

    it('asks before replacing the other language', async () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fireEvent.click(screen.getByTestId('locale-tab-es'))
      fillLocale('', '', 'Ya escrito')
      fireEvent.click(screen.getByTestId('locale-tab-en'))
      fillLocale('Hello', 'Short', 'Body')
      fireEvent.click(screen.getByTestId('translate-button'))
      expect(
        screen.getByText('postEditor.translate.confirmOverwrite'),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
      await waitFor(() =>
        expect(
          screen.queryByText('postEditor.translate.confirmOverwrite'),
        ).not.toBeInTheDocument(),
      )
      expect(mockTranslation.translate).not.toHaveBeenCalled()
      expect(screen.getByTestId('content-input')).toHaveValue('Body')
      fireEvent.click(screen.getByTestId('translate-button'))
      fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
      expect(mockTranslation.translate).toHaveBeenCalled()
    })

    it('can be cancelled and locks the content meanwhile', () => {
      mockTranslation.isTranslating = true
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.getByTestId('content-input')).toHaveAttribute('readonly')
      const button = screen.getByTestId('translate-button')
      expect(button).toBeEnabled()
      expect(button).toHaveTextContent('postEditor.translate.cancel')
      fireEvent.click(button)
      expect(mockTranslation.cancel).toHaveBeenCalled()
      expect(mockTranslation.translate).not.toHaveBeenCalled()
    })

    it('stays off while checking that Claude is available', () => {
      mockTranslation.status = null
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillLocale('Hello', 'Short', 'Body')
      expect(screen.getByTestId('translate-button')).toBeDisabled()
      expect(screen.getByTestId('translate-button')).toHaveAttribute(
        'title',
        'postEditor.translate.checking',
      )
    })

    it('explains why Claude cannot be used, with a retry', () => {
      mockTranslation.status = {
        available: false,
        reason: 'no_credit',
        message: 'The Anthropic account has run out of credit.',
      }
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      fillLocale('Hello', 'Short', 'Body')
      expect(screen.getByTestId('translate-button')).toBeDisabled()
      expect(screen.getByTestId('translate-button')).not.toHaveAttribute(
        'title',
      )
      expect(screen.getByTestId('translate-error')).toHaveTextContent(
        'The Anthropic account has run out of credit.',
      )
      fireEvent.click(screen.getByTestId('translate-retry'))
      expect(mockTranslation.recheck).toHaveBeenCalled()
    })

    it('shows translation errors', () => {
      mockTranslation.error = 'Slow down'
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      expect(screen.getByTestId('translate-error')).toHaveTextContent(
        'Slow down',
      )
    })
  })

  describe('Slug', () => {
    it('regenerates the slug from the title', () => {
      renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
      const button = screen.getByTestId('slug-regenerate')
      // Nothing to regenerate from, then already in sync with the title.
      expect(button).toBeDisabled()
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Peña Ubiña' },
      })
      expect(button).toBeDisabled()
      fireEvent.change(screen.getByTestId('slug-input'), {
        target: { value: 'hand-made' },
      })
      // A hand-made slug no longer follows the title…
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Peña Ubiña desde Tuíza' },
      })
      expect(screen.getByTestId('slug-input')).toHaveValue('hand-made')
      fireEvent.click(button)
      expect(screen.getByTestId('slug-input')).toHaveValue(
        'peña-ubiña-desde-tuíza',
      )
      // …until it is regenerated: then it follows again.
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Otra' },
      })
      expect(screen.getByTestId('slug-input')).toHaveValue('otra')
    })
  })
})
