import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import { ImageEditModal } from './ImageEditModal'

jest.mock('react-overlays/Modal', () => ({
  __esModule: true,
  default: ({
    show,
    children,
    renderBackdrop,
  }: {
    show: boolean
    children: React.ReactNode
    renderBackdrop?: (props: Record<string, unknown>) => React.ReactNode
  }) =>
    show ? (
      <>
        {renderBackdrop?.({})}
        {children}
      </>
    ) : null,
}))

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'images.renameModal.title': 'Rename Image',
        'images.renameModal.placeholder': 'Image name',
        'images.renameModal.save': 'Save',
        'images.renameModal.saving': 'Saving…',
        'confirmDelete.cancel': 'Cancel',
      }
      return translations[key] ?? key
    },
  }),
}))

const mockImage: CloudinaryImage = {
  publicId: 'sawl.dev - blog/my-photo',
  url: 'https://res.cloudinary.com/demo/image/upload/my-photo.jpg',
  width: 800,
  height: 600,
  format: 'jpg',
  createdAt: '2024-06-15T00:00:00Z',
  bytes: 1536000,
}

const defaultProps = {
  isOpen: true,
  image: mockImage,
  isSaving: false,
  error: null,
  onClose: jest.fn(),
  onSave: jest.fn(),
}

describe('ImageEditModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    renderApp(<ImageEditModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('rename-input')).not.toBeInTheDocument()
  })

  it('renders modal title', () => {
    renderApp(<ImageEditModal {...defaultProps} />)
    expect(screen.getByText('Rename Image')).toBeInTheDocument()
  })

  it('shows current filename', () => {
    renderApp(<ImageEditModal {...defaultProps} />)
    expect(screen.getByTestId('current-name')).toHaveTextContent('my-photo')
  })

  it('pre-fills input with current filename', () => {
    renderApp(<ImageEditModal {...defaultProps} />)
    expect(screen.getByTestId('rename-input')).toHaveValue('my-photo')
  })

  it('save button disabled when name unchanged', () => {
    renderApp(<ImageEditModal {...defaultProps} />)
    expect(screen.getByTestId('rename-save-button')).toBeDisabled()
  })

  it('save button disabled when name is empty', () => {
    renderApp(<ImageEditModal {...defaultProps} />)
    fireEvent.change(screen.getByTestId('rename-input'), {
      target: { value: '' },
    })
    expect(screen.getByTestId('rename-save-button')).toBeDisabled()
  })

  it('save button enabled when name changed to non-empty value', () => {
    renderApp(<ImageEditModal {...defaultProps} />)
    fireEvent.change(screen.getByTestId('rename-input'), {
      target: { value: 'new-name' },
    })
    expect(screen.getByTestId('rename-save-button')).not.toBeDisabled()
  })

  it('calls onSave with trimmed new name when save clicked', () => {
    const onSave = jest.fn()
    renderApp(<ImageEditModal {...defaultProps} onSave={onSave} />)
    fireEvent.change(screen.getByTestId('rename-input'), {
      target: { value: '  new-name  ' },
    })
    fireEvent.click(screen.getByTestId('rename-save-button'))
    expect(onSave).toHaveBeenCalledWith('new-name')
  })

  it('calls onClose when cancel clicked', () => {
    const onClose = jest.fn()
    renderApp(<ImageEditModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('rename-cancel-button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows saving label when isSaving', () => {
    renderApp(<ImageEditModal {...defaultProps} isSaving />)
    expect(screen.getByTestId('rename-save-button')).toHaveTextContent(
      'Saving…',
    )
  })

  it('disables input and buttons when isSaving', () => {
    renderApp(<ImageEditModal {...defaultProps} isSaving />)
    expect(screen.getByTestId('rename-input')).toBeDisabled()
    expect(screen.getByTestId('rename-cancel-button')).toBeDisabled()
  })

  it('shows error when provided', () => {
    renderApp(
      <ImageEditModal
        {...defaultProps}
        error="Rename failed, please try again"
      />,
    )
    expect(screen.getByTestId('rename-error')).toHaveTextContent(
      'Rename failed, please try again',
    )
  })

  it('renders nothing when image is null', () => {
    renderApp(<ImageEditModal {...defaultProps} image={null} />)
    expect(screen.getByTestId('current-name')).toHaveTextContent('')
  })

  it('shows filename correctly when publicId has no slash', () => {
    const imageNoSlash = { ...mockImage, publicId: 'noslash-image' }
    renderApp(<ImageEditModal {...defaultProps} image={imageNoSlash} />)
    expect(screen.getByTestId('current-name')).toHaveTextContent(
      'noslash-image',
    )
    expect(screen.getByTestId('rename-input')).toHaveValue('noslash-image')
  })
})

export {}
