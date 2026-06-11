import { fireEvent, screen } from '@testing-library/react'
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
  ImagePicker: () => null,
}))

jest.mock('@web/utils/slugify', () => ({
  slugify: (text: string) => text.toLowerCase().replace(/\s+/g, '-'),
}))

jest.mock('@sdlgr/date-picker', () => ({
  DateTimePicker: () => <div />,
}))

jest.mock('@sdlgr/post-hero', () => ({
  PostHero: () => <div data-testid="post-hero-mock" />,
}))

jest.mock('./PostCardPreview', () => ({
  PostCardPreview: () => <div data-testid="post-card-preview-mock" />,
}))

jest.mock('./CoverImageInput', () => ({
  CoverImageInput: () => <div />,
}))

jest.mock('@sdlgr/combobox', () => ({
  Combobox: () => <input />,
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
]

describe('PostEditor embed edit-in-place', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
  })

  it('shows edit button when cursor is inside an embed block', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content =
      'Intro\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\nOutro'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('```youtube') + 5
    textarea.selectionEnd = content.indexOf('```youtube') + 5
    fireEvent.click(textarea)
    expect(screen.getByTestId('edit-embed-button')).toBeInTheDocument()
    expect(screen.getByTestId('edit-embed-button')).toHaveTextContent(
      'Edit embed',
    )
  })

  it('shows edit button when cursor is inside a gpx block', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content =
      'Intro\n\n```gpx\ntrack:https://cdn.com/route.gpx\n```\n\nOutro'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('```gpx') + 3
    textarea.selectionEnd = content.indexOf('```gpx') + 3
    fireEvent.click(textarea)
    expect(screen.getByTestId('edit-embed-button')).toBeInTheDocument()
    expect(screen.getByTestId('edit-embed-button')).toHaveTextContent(
      'Edit gpx',
    )
  })

  it('does not show edit button when cursor is outside any block', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content =
      'Intro\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\nOutro'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = 1
    textarea.selectionEnd = 1
    fireEvent.click(textarea)
    expect(screen.queryByTestId('edit-embed-button')).not.toBeInTheDocument()
  })

  it('hides edit button when textarea content changes', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content =
      'Intro\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\nOutro'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('```youtube') + 5
    textarea.selectionEnd = content.indexOf('```youtube') + 5
    fireEvent.click(textarea)
    expect(screen.getByTestId('edit-embed-button')).toBeInTheDocument()
    fireEvent.change(textarea, { target: { value: content + 'x' } })
    expect(screen.queryByTestId('edit-embed-button')).not.toBeInTheDocument()
  })

  it('opens embed modal when edit button clicked on embed block', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content =
      'Intro\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\nOutro'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('```youtube') + 5
    textarea.selectionEnd = content.indexOf('```youtube') + 5
    fireEvent.click(textarea)
    fireEvent.click(screen.getByTestId('edit-embed-button'))
    expect(screen.getByTestId('embed-insert-modal-mock')).toBeInTheDocument()
  })

  it('opens gpx modal when edit button clicked on gpx block', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content =
      'Intro\n\n```gpx\ntrack:https://cdn.com/route.gpx\n```\n\nOutro'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('```gpx') + 3
    textarea.selectionEnd = content.indexOf('```gpx') + 3
    fireEvent.click(textarea)
    fireEvent.click(screen.getByTestId('edit-embed-button'))
    expect(screen.getByTestId('gpx-map-modal-mock')).toBeInTheDocument()
  })

  it('replaces embed block on modal insert instead of inserting at cursor', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    // Use a distinct URL so we can verify it gets replaced by the mock's URL
    const originalBlock =
      '```youtube\nhttps://www.youtube.com/embed/ORIGINAL\n```'
    const content = `Intro\n\n${originalBlock}\n\nOutro`
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('```youtube') + 5
    textarea.selectionEnd = content.indexOf('```youtube') + 5
    fireEvent.click(textarea)
    fireEvent.click(screen.getByTestId('edit-embed-button'))
    fireEvent.click(screen.getByTestId('embed-modal-insert-mock'))
    const newContent = (
      screen.getByTestId('content-input') as HTMLTextAreaElement
    ).value
    expect(newContent).not.toContain('ORIGINAL')
    expect(newContent).toContain('Intro')
    expect(newContent).toContain('Outro')
    expect(newContent).toContain('https://www.youtube.com/embed/abc')
  })

  it('replaces gpx block on modal insert instead of inserting at cursor', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content =
      'Before\n\n```gpx\ntrack:https://cdn.com/old.gpx\n```\n\nAfter'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('```gpx') + 3
    textarea.selectionEnd = content.indexOf('```gpx') + 3
    fireEvent.click(textarea)
    fireEvent.click(screen.getByTestId('edit-embed-button'))
    fireEvent.click(screen.getByTestId('gpx-modal-insert-mock'))
    const newContent = (
      screen.getByTestId('content-input') as HTMLTextAreaElement
    ).value
    expect(newContent).not.toContain('https://cdn.com/old.gpx')
    expect(newContent).toContain('Before')
    expect(newContent).toContain('After')
  })

  it('clears edit state when toolbar embed button clicked', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content =
      'Intro\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\nOutro'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('```youtube') + 5
    textarea.selectionEnd = content.indexOf('```youtube') + 5
    fireEvent.click(textarea)
    expect(screen.getByTestId('edit-embed-button')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('open-embed-modal-button'))
    expect(screen.queryByTestId('edit-embed-button')).not.toBeInTheDocument()
  })

  it('inserts at cursor (not replace) when toolbar button used after edit dismissed', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const original =
      'Hello\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\nWorld'
    fireEvent.change(textarea, { target: { value: original } })
    fireEvent.click(screen.getByTestId('open-embed-modal-button'))
    fireEvent.click(screen.getByTestId('embed-modal-insert-mock'))
    const newContent = (
      screen.getByTestId('content-input') as HTMLTextAreaElement
    ).value
    expect(newContent).toContain('https://www.youtube.com/embed/abc')
  })

  it('cancel on embed modal during edit clears initialValues', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content =
      'Intro\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\nOutro'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('```youtube') + 5
    textarea.selectionEnd = content.indexOf('```youtube') + 5
    fireEvent.click(textarea)
    fireEvent.click(screen.getByTestId('edit-embed-button'))
    fireEvent.click(screen.getByTestId('embed-modal-cancel-mock'))
    expect(
      screen.queryByTestId('embed-insert-modal-mock'),
    ).not.toBeInTheDocument()
  })

  it('cancel on gpx modal during edit clears initialValues', () => {
    renderApp(<PostEditor categories={mockCategories} users={mockUsers} />)
    const textarea = screen.getByTestId('content-input') as HTMLTextAreaElement
    const content =
      'Intro\n\n```gpx\ntrack:https://cdn.com/route.gpx\n```\n\nOutro'
    fireEvent.change(textarea, { target: { value: content } })
    textarea.selectionStart = content.indexOf('```gpx') + 3
    textarea.selectionEnd = content.indexOf('```gpx') + 3
    fireEvent.click(textarea)
    fireEvent.click(screen.getByTestId('edit-embed-button'))
    fireEvent.click(screen.getByTestId('gpx-modal-cancel-mock'))
    expect(screen.queryByTestId('gpx-map-modal-mock')).not.toBeInTheDocument()
  })
})
