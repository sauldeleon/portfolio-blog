import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { PostEditorProps } from './PostEditor'
import { PostEditor } from './PostEditor'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const map: Record<string, string> = {
        'postEditor.newTitle': 'New Post',
        'postEditor.editTitle': 'Edit Post',
        'postEditor.back': '← Back',
        'postEditor.tabs.en': 'EN',
        'postEditor.tabs.es': 'ES',
        'postEditor.fields.title': 'Title',
        'postEditor.fields.titlePlaceholder': '',
        'postEditor.fields.slug': 'Slug',
        'postEditor.fields.slugHelper': '',
        'postEditor.fields.excerpt': 'Excerpt',
        'postEditor.fields.excerptPlaceholder': '',
        'postEditor.fields.content': 'Content',
        'postEditor.fields.contentPlaceholder': '',
        'postEditor.fields.category': 'Category',
        'postEditor.fields.tags': 'Tags',
        'postEditor.fields.tagsPlaceholder': '',
        'postEditor.fields.tagsHelper': '',
        'postEditor.fields.seriesId': 'Series ID',
        'postEditor.fields.seriesIdPlaceholder': '',
        'postEditor.fields.seriesOrder': 'Series Order',
        'postEditor.fields.seriesOrderPlaceholder': '',
        'postEditor.fields.coverImage': 'Cover Image',
        'postEditor.fields.coverImagePlaceholder': '',
        'postEditor.fields.scheduledAt': 'Schedule Publish',
        'postEditor.fields.scheduledAtPlaceholder': 'Not scheduled',
        'postEditor.fields.author': 'Author',
        'postEditor.fields.authorPlaceholder': '',
        'postEditor.fields.authorUseDefault': 'Use default',
        'postEditor.status.draft': 'Draft',
        'postEditor.status.published': 'Published',
        'postEditor.status.archived': 'Archived',
        'postEditor.actions.save': 'Save',
        'postEditor.actions.saving': 'Saving…',
        'postEditor.actions.publish': 'Publish',
        'postEditor.actions.publishDisabledMissingTranslations': '',
        'postEditor.actions.publishDisabledArchived': '',
        'postEditor.actions.unpublish': 'Unpublish',
        'postEditor.actions.archive': 'Archive',
        'postEditor.actions.archiveDisabledPublished': '',
        'postEditor.actions.unarchive': 'Unarchive',
        'postEditor.preview': 'Preview',
        'postEditor.previewLoading': 'Rendering…',
        'postEditor.previewTabPost': 'Post',
        'postEditor.previewTabPostMobile': 'Post Mobile',
        'postEditor.previewTabHero': 'Hero',
        'postEditor.previewTabCard': 'Card',
        'postEditor.previewTabToc': 'Table of Contents',
        'postEditor.error': 'Error',
        'images.picker.title': 'Insert Image',
      }
      return map[key] ?? key
    },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn(), refresh: jest.fn() }),
}))

jest.mock('../MarkdownPreview', () => ({
  MarkdownPreview: () => <div data-testid="markdown-preview" />,
}))

jest.mock('../ImagePicker', () => ({
  ImagePicker: ({
    open,
    onClose,
    onPick,
    zIndex = 900,
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
    zIndex?: number
  }) => {
    const prefix = zIndex === 1100 ? 'content-' : ''
    return open ? (
      <div data-testid={`${prefix}image-picker`}>
        <button
          type="button"
          data-testid={`${prefix}picker-insert`}
          onClick={() =>
            onPick({
              publicId: 'test/img',
              url: 'https://res.cloudinary.com/test/img.jpg',
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
          data-testid={`${prefix}picker-close`}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    ) : null
  },
}))

jest.mock('../ImageInsertModal', () => ({
  ImageInsertModal: ({
    isOpen,
    onInsert,
    onCancel,
    onRequestImagePick,
  }: {
    isOpen: boolean
    onInsert: (markdown: string) => void
    onCancel: () => void
    pickerOpen: boolean
    onRequestImagePick: (
      onPicked: (image: {
        publicId: string
        url: string
        width: number
        height: number
        format: string
        createdAt: string
        bytes: number
      }) => void,
    ) => void
  }) =>
    isOpen ? (
      <div data-testid="image-insert-modal">
        <button
          type="button"
          data-testid="modal-insert"
          onClick={() =>
            onInsert('\n\n![](https://res.cloudinary.com/test/img.jpg)\n\n')
          }
        >
          Insert
        </button>
        <button type="button" data-testid="modal-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          data-testid="modal-request-pick"
          onClick={() => onRequestImagePick(jest.fn())}
        >
          Request Pick
        </button>
      </div>
    ) : null,
}))

jest.mock('@sdlgr/combobox', () => ({
  Combobox: ({
    value,
    onChange,
    'data-testid': testId,
  }: {
    value: string[]
    onChange: (v: string[]) => void
    'data-testid'?: string
  }) => (
    <input
      data-testid={testId}
      value={value.join(', ')}
      onChange={(e) => {
        const entries = e.target.value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        onChange(entries)
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
    return (
      <div data-testid={testId}>
        <button type="button">
          {options.find((o) => o.value === value)?.label ?? ''}
        </button>
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

jest.mock('@web/utils/slugify', () => ({
  slugify: (text: string) => text.toLowerCase().replace(/\s+/g, '-'),
}))

jest.mock('@sdlgr/date-picker', () => ({
  DateTimePicker: ({
    onChange,
    'data-testid': testId,
  }: {
    value: Date | null
    onChange: (date: Date | null) => void
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
  }: {
    value: string
    onPick: () => void
    onClear: () => void
    label: string
    placeholder: string
    clearTitle: string
  }) => (
    <div>
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

const mockCategories: PostEditorProps['categories'] = [
  { slug: 'engineering', name: 'Engineering' },
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
]

describe('PostEditor — image picker', () => {
  it('renders the open image picker button', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    expect(screen.getByTestId('open-image-picker-button')).toBeInTheDocument()
  })

  it('image insert modal is not visible initially', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    expect(screen.queryByTestId('image-insert-modal')).not.toBeInTheDocument()
  })

  it('opens image insert modal when button clicked', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    fireEvent.click(screen.getByTestId('open-image-picker-button'))
    expect(screen.getByTestId('image-insert-modal')).toBeInTheDocument()
  })

  it('closes image insert modal when cancel called', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    fireEvent.click(screen.getByTestId('open-image-picker-button'))
    fireEvent.click(screen.getByTestId('modal-cancel'))
    expect(screen.queryByTestId('image-insert-modal')).not.toBeInTheDocument()
  })

  it('inserts markdown into content when image insert modal confirms', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'existing content' } })
    fireEvent.click(screen.getByTestId('open-image-picker-button'))
    fireEvent.click(screen.getByTestId('modal-insert'))
    expect(textarea.value).toContain(
      '![](https://res.cloudinary.com/test/img.jpg)',
    )
  })

  it('closes image insert modal after insert', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    fireEvent.click(screen.getByTestId('open-image-picker-button'))
    fireEvent.click(screen.getByTestId('modal-insert'))
    expect(screen.queryByTestId('image-insert-modal')).not.toBeInTheDocument()
  })

  it('opens picker in cover mode when cover-image-input clicked', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    fireEvent.click(screen.getByTestId('cover-image-input'))
    expect(screen.getByTestId('image-picker')).toBeInTheDocument()
  })

  it('fills cover image field and closes picker in cover mode', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    fireEvent.click(screen.getByTestId('cover-image-input'))
    fireEvent.click(screen.getByTestId('picker-insert'))
    expect(screen.getByTestId('cover-image-input')).toHaveValue('test/img')
    expect(screen.queryByTestId('image-picker')).not.toBeInTheDocument()
  })

  it('closes cover image picker when onClose called', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    fireEvent.click(screen.getByTestId('cover-image-input'))
    fireEvent.click(screen.getByTestId('picker-close'))
    expect(screen.queryByTestId('image-picker')).not.toBeInTheDocument()
  })

  it('cover-image-input is read-only', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    expect(screen.getByTestId('cover-image-input')).toHaveAttribute('readonly')
  })

  it('clears cover image when clear button clicked', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    fireEvent.click(screen.getByTestId('cover-image-input'))
    fireEvent.click(screen.getByTestId('picker-insert'))
    expect(screen.getByTestId('cover-image-input')).toHaveValue('test/img')
    fireEvent.click(screen.getByTestId('clear-cover-image-button'))
    expect(screen.getByTestId('cover-image-input')).toHaveValue('')
  })

  it('opens content picker when image insert modal requests it', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    fireEvent.click(screen.getByTestId('open-image-picker-button'))
    fireEvent.click(screen.getByTestId('modal-request-pick'))
    expect(screen.getByTestId('content-image-picker')).toBeInTheDocument()
  })

  it('closes content picker when onClose is called', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    fireEvent.click(screen.getByTestId('open-image-picker-button'))
    fireEvent.click(screen.getByTestId('modal-request-pick'))
    fireEvent.click(screen.getByTestId('content-picker-close'))
    expect(screen.queryByTestId('content-image-picker')).not.toBeInTheDocument()
  })

  it('closes content picker after pick', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    fireEvent.click(screen.getByTestId('open-image-picker-button'))
    fireEvent.click(screen.getByTestId('modal-request-pick'))
    fireEvent.click(screen.getByTestId('content-picker-insert'))
    expect(screen.queryByTestId('content-image-picker')).not.toBeInTheDocument()
  })

  it('shows edit button when cursor is inside an image block', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content = 'Hello\n\n![alt=Test](https://cdn.com/img.jpg)\n\nWorld'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('![') + 3
    textarea.selectionEnd = content.indexOf('![') + 3
    fireEvent.click(textarea)
    expect(screen.getByTestId('edit-embed-button')).toBeInTheDocument()
    expect(screen.getByTestId('edit-embed-button')).toHaveTextContent(
      'Edit image',
    )
  })

  it('opens image modal when edit button clicked on image block', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content = 'Hello\n\n![](https://cdn.com/img.jpg)\n\nWorld'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('![') + 2
    textarea.selectionEnd = content.indexOf('![') + 2
    fireEvent.click(textarea)
    fireEvent.click(screen.getByTestId('edit-embed-button'))
    expect(screen.getByTestId('image-insert-modal')).toBeInTheDocument()
  })

  it('replaces image block on modal insert', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content = 'Before\n\n![alt=Old](https://cdn.com/old.jpg)\n\nAfter'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('![') + 2
    textarea.selectionEnd = content.indexOf('![') + 2
    fireEvent.click(textarea)
    fireEvent.click(screen.getByTestId('edit-embed-button'))
    fireEvent.click(screen.getByTestId('modal-insert'))
    const newContent = (
      screen.getByTestId('content-input') as HTMLTextAreaElement
    ).value
    expect(newContent).not.toContain('https://cdn.com/old.jpg')
    expect(newContent).toContain('Before')
    expect(newContent).toContain('After')
  })

  it('clears edit state when image toolbar button clicked', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content = 'Hello\n\n![](https://cdn.com/img.jpg)\n\nWorld'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('![') + 2
    textarea.selectionEnd = content.indexOf('![') + 2
    fireEvent.click(textarea)
    expect(screen.getByTestId('edit-embed-button')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('open-image-picker-button'))
    expect(screen.queryByTestId('edit-embed-button')).not.toBeInTheDocument()
  })

  it('cancel on image modal during edit closes modal', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content = 'Hello\n\n![](https://cdn.com/img.jpg)\n\nWorld'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('![') + 2
    textarea.selectionEnd = content.indexOf('![') + 2
    fireEvent.click(textarea)
    fireEvent.click(screen.getByTestId('edit-embed-button'))
    fireEvent.click(screen.getByTestId('modal-cancel'))
    expect(screen.queryByTestId('image-insert-modal')).not.toBeInTheDocument()
  })
})

export {}
