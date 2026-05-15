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
      <div data-testid="image-picker">
        <button
          type="button"
          data-testid="picker-insert"
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
        <button type="button" data-testid="picker-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
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
    onChange: (v: boolean) => void
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

const mockCategories: PostEditorProps['categories'] = [
  { slug: 'engineering', name: 'Engineering' },
]

describe('PostEditor — image picker', () => {
  it('renders the open image picker button', () => {
    renderApp(<PostEditor categories={mockCategories} author="Admin" />)
    expect(screen.getByTestId('open-image-picker-button')).toBeInTheDocument()
  })

  it('image picker is not visible initially', () => {
    renderApp(<PostEditor categories={mockCategories} author="Admin" />)
    expect(screen.queryByTestId('image-picker')).not.toBeInTheDocument()
  })

  it('opens image picker when button clicked', () => {
    renderApp(<PostEditor categories={mockCategories} author="Admin" />)
    fireEvent.click(screen.getByTestId('open-image-picker-button'))
    expect(screen.getByTestId('image-picker')).toBeInTheDocument()
  })

  it('closes image picker when onClose called', () => {
    renderApp(<PostEditor categories={mockCategories} author="Admin" />)
    fireEvent.click(screen.getByTestId('open-image-picker-button'))
    fireEvent.click(screen.getByTestId('picker-close'))
    expect(screen.queryByTestId('image-picker')).not.toBeInTheDocument()
  })

  it('inserts markdown at end of content when textarea has no ref focus', () => {
    renderApp(<PostEditor categories={mockCategories} author="Admin" />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'existing content' } })
    fireEvent.click(screen.getByTestId('open-image-picker-button'))
    fireEvent.click(screen.getByTestId('picker-insert'))
    expect(textarea.value).toContain(
      '![](https://res.cloudinary.com/test/img.jpg)',
    )
  })
})

export {}
