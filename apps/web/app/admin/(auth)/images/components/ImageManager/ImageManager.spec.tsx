import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { ImageManager } from './ImageManager'

jest.mock('@sdlgr/button', () => ({
  Button: ({
    children,
    onClick,
    'data-testid': testId,
  }: {
    children: React.ReactNode
    onClick?: () => void
    'data-testid'?: string
  }) => (
    <button type="button" onClick={onClick} data-testid={testId}>
      {children}
    </button>
  ),
}))

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'images.title': 'Images',
        'images.uploadButton': 'Upload Image',
        'images.emptyState': 'No images yet. Upload your first image.',
        'images.deleteConfirm': 'Delete this image? This cannot be undone.',
        'images.upload.error': 'Upload failed, please try again',
        'images.picker.loading': 'Loading…',
        'images.renameModal.error': 'Rename failed, please try again',
        'confirmDelete.cancel': 'Cancel',
        'confirmDelete.confirm': 'Confirm',
        refresh: 'Refresh',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('../ImageCard', () => ({
  ImageCard: ({
    image,
    onDelete,
    onEdit,
  }: {
    image: { publicId: string; url: string }
    onDelete: (id: string) => void
    onEdit: (id: string) => void
  }) => (
    <div data-testid={`image-card-${image.publicId}`}>
      <span>{image.publicId}</span>
      <button
        data-testid={`edit-${image.publicId}`}
        onClick={() => onEdit(image.publicId)}
      >
        Rename
      </button>
      <button
        data-testid={`delete-${image.publicId}`}
        onClick={() => onDelete(image.publicId)}
      >
        Delete
      </button>
    </div>
  ),
}))

jest.mock('../ImageUploadModal', () => ({
  ImageUploadModal: ({
    isOpen,
    onClose,
    onUploaded,
  }: {
    isOpen: boolean
    onClose: () => void
    onUploaded: (img: { publicId: string; url: string }) => void
  }) =>
    isOpen ? (
      <div data-testid="upload-modal">
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        <button
          data-testid="mock-upload"
          onClick={() => {
            const img = {
              publicId: 'sawl.dev - blog/new',
              url: 'https://res.cloudinary.com/demo/new.jpg',
              width: 100,
              height: 100,
              format: 'jpg',
              createdAt: '2024-01-02T00:00:00Z',
              bytes: 999,
            }
            onUploaded(img)
          }}
        >
          Upload
        </button>
      </div>
    ) : null,
}))

jest.mock('../ImageEditModal', () => ({
  ImageEditModal: ({
    isOpen,
    image,
    isSaving,
    error,
    onClose,
    onSave,
  }: {
    isOpen: boolean
    image: { publicId: string } | null
    isSaving: boolean
    error: string | null
    onClose: () => void
    onSave: (newName: string) => void
  }) =>
    isOpen ? (
      <div data-testid="edit-modal">
        <span data-testid="edit-modal-image">{image?.publicId}</span>
        <span data-testid="edit-modal-saving">{String(isSaving)}</span>
        {error && <span data-testid="edit-modal-error">{error}</span>}
        <button
          data-testid="edit-modal-save"
          onClick={() => onSave('new-name')}
        >
          Save
        </button>
        <button data-testid="edit-modal-close" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
}))

jest.mock('../../../components/ConfirmDeleteModal', () => ({
  ConfirmDeleteModal: ({
    isOpen,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean
    message: string
    onConfirm: () => void
    onCancel: () => void
  }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button data-testid="confirm-delete-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button data-testid="confirm-delete-confirm" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    ) : null,
}))

const mockImages = [
  {
    publicId: 'sawl.dev - blog/photo1',
    url: 'https://res.cloudinary.com/demo/photo1.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: '2024-01-01T00:00:00Z',
    bytes: 12345,
  },
  {
    publicId: 'sawl.dev - blog/photo2',
    url: 'https://res.cloudinary.com/demo/photo2.jpg',
    width: 400,
    height: 300,
    format: 'png',
    createdAt: '2024-01-02T00:00:00Z',
    bytes: 5678,
  },
]

describe('ImageManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { images: mockImages } })
    jest.spyOn(axios, 'delete').mockResolvedValue({ data: {} })
    jest.spyOn(axios, 'patch').mockResolvedValue({
      data: {
        publicId: 'sawl.dev - blog/new-name',
        url: 'https://res.cloudinary.com/demo/new-name.jpg',
        width: 800,
        height: 600,
        format: 'jpg',
        createdAt: '2024-01-01T00:00:00Z',
        bytes: 12345,
      },
    })
  })

  it('renders header with title and upload button', async () => {
    renderApp(<ImageManager />)
    await waitFor(() =>
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Images')).toBeInTheDocument()
    expect(screen.getByTestId('upload-button')).toBeInTheDocument()
  })

  it('renders image grid with cards after loading', async () => {
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('image-grid')).toBeInTheDocument()
    expect(
      screen.getByTestId('image-card-sawl.dev - blog/photo1'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('image-card-sawl.dev - blog/photo2'),
    ).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    jest.spyOn(axios, 'get').mockReturnValue(new Promise(jest.fn()))
    renderApp(<ImageManager />)
    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
  })

  it('shows empty state when no images', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { images: [] } })
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByTestId('empty-state')).toHaveTextContent(
      'No images yet. Upload your first image.',
    )
  })

  it('shows error state when fetch fails with non-ok response', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('Request failed'))
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('error-state')).toBeInTheDocument()
    expect(screen.getByTestId('error-state')).toHaveTextContent(
      'Upload failed, please try again',
    )
  })

  it('shows error state when fetch throws', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('Network error'))
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('error-state')).toBeInTheDocument()
  })

  it('opens upload modal when upload button clicked', async () => {
    renderApp(<ImageManager />)
    await waitFor(() =>
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument(),
    )
    fireEvent.click(screen.getByTestId('upload-button'))
    expect(screen.getByTestId('upload-modal')).toBeInTheDocument()
  })

  it('closes upload modal when close clicked', async () => {
    renderApp(<ImageManager />)
    await waitFor(() =>
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument(),
    )
    fireEvent.click(screen.getByTestId('upload-button'))
    fireEvent.click(screen.getByTestId('modal-close'))
    expect(screen.queryByTestId('upload-modal')).not.toBeInTheDocument()
  })

  it('adds newly uploaded image to the top of the list', async () => {
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('image-grid')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('upload-button'))
    fireEvent.click(screen.getByTestId('mock-upload'))
    expect(
      await screen.findByTestId('image-card-sawl.dev - blog/new'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('upload-modal')).not.toBeInTheDocument()
  })

  it('shows delete confirm modal when delete clicked', async () => {
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('image-grid')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('delete-sawl.dev - blog/photo1'))
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument()
  })

  it('closes delete confirm modal on cancel', async () => {
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('image-grid')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('delete-sawl.dev - blog/photo1'))
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument()
  })

  it('deletes image on confirm', async () => {
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('image-grid')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('delete-sawl.dev - blog/photo1'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await waitFor(() =>
      expect(
        screen.queryByTestId('image-card-sawl.dev - blog/photo1'),
      ).not.toBeInTheDocument(),
    )
    expect(axios.delete).toHaveBeenCalledWith(
      '/api/images/sawl.dev%20-%20blog/photo1/',
    )
  })

  it('refresh button re-fetches images from API', async () => {
    const freshImage = {
      publicId: 'sawl.dev - blog/fresh',
      url: 'https://res.cloudinary.com/demo/fresh.jpg',
      width: 300,
      height: 200,
      format: 'jpg',
      createdAt: '2024-03-01T00:00:00Z',
      bytes: 4321,
    }
    jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: { images: mockImages } })
      .mockResolvedValueOnce({ data: { images: [freshImage] } })
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('image-grid')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('refresh-button'))
    expect(
      await screen.findByTestId('image-card-sawl.dev - blog/fresh'),
    ).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalledTimes(2)
  })

  it('shows error if delete fetch throws', async () => {
    jest
      .spyOn(axios, 'delete')
      .mockRejectedValueOnce(new Error('Network error'))
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('image-grid')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('delete-sawl.dev - blog/photo1'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    expect(await screen.findByTestId('error-state')).toBeInTheDocument()
  })

  it('opens edit modal when rename clicked', async () => {
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('image-grid')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('edit-sawl.dev - blog/photo1'))
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
    expect(screen.getByTestId('edit-modal-image')).toHaveTextContent(
      'sawl.dev - blog/photo1',
    )
  })

  it('closes edit modal on cancel', async () => {
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('image-grid')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('edit-sawl.dev - blog/photo1'))
    fireEvent.click(screen.getByTestId('edit-modal-close'))
    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument()
  })

  it('renames image and updates list on save', async () => {
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('image-grid')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('edit-sawl.dev - blog/photo1'))
    fireEvent.click(screen.getByTestId('edit-modal-save'))
    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith('/api/images/', {
        publicId: 'sawl.dev - blog/photo1',
        newName: 'new-name',
      }),
    )
    await waitFor(() =>
      expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument(),
    )
    expect(
      await screen.findByTestId('image-card-sawl.dev - blog/new-name'),
    ).toBeInTheDocument()
  })

  it('shows error in edit modal when rename fails', async () => {
    jest.spyOn(axios, 'patch').mockRejectedValueOnce(new Error('Network error'))
    renderApp(<ImageManager />)
    expect(await screen.findByTestId('image-grid')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('edit-sawl.dev - blog/photo1'))
    fireEvent.click(screen.getByTestId('edit-modal-save'))
    await waitFor(() =>
      expect(screen.getByTestId('edit-modal-error')).toHaveTextContent(
        'Rename failed, please try again',
      ),
    )
  })
})

export {}
