import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import axios from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { ImageUploadModal } from './ImageUploadModal'

jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn().mockReturnValue({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false,
  }),
}))

jest.mock('react-overlays/Modal', () => ({
  __esModule: true,
  default: ({
    show,
    children,
    renderBackdrop,
    onHide,
  }: {
    show: boolean
    children: React.ReactNode
    renderBackdrop?: (props: unknown) => React.ReactNode
    onHide?: () => void
  }) =>
    show ? (
      <div>
        {renderBackdrop?.({})}
        <button data-testid="modal-hide-trigger" onClick={onHide} />
        {children}
      </div>
    ) : null,
}))

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'images.upload.title': 'Upload Image',
        'images.upload.dropzone': 'Drop an image here, or click to select',
        'images.upload.dropzoneActive': 'Drop it!',
        'images.upload.uploading': 'Uploading…',
        'images.upload.error': 'Upload failed, please try again',
        'images.upload.namePlaceholder': 'Image name (optional)',
        'images.upload.uploadButton': 'Upload',
      }
      return translations[key] ?? key
    },
  }),
}))

const mockOnClose = jest.fn()
const mockOnUploaded = jest.fn()

const mockUploadResult = {
  publicId: 'sawl.dev - blog/new-photo',
  url: 'https://res.cloudinary.com/demo/new-photo.jpg',
  width: 800,
  height: 600,
  format: 'jpg',
  createdAt: '2024-01-01T00:00:00Z',
  bytes: 12345,
}

describe('ImageUploadModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(axios, 'post').mockResolvedValue({ data: mockUploadResult })
  })

  it('renders when open', () => {
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )
    expect(screen.getByText('Upload Image')).toBeInTheDocument()
    expect(screen.getByTestId('dropzone')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderApp(
      <ImageUploadModal
        isOpen={false}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )
    expect(screen.queryByText('Upload Image')).not.toBeInTheDocument()
  })

  it('shows dropzone text', () => {
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )
    expect(
      screen.getByText('Drop an image here, or click to select'),
    ).toBeInTheDocument()
  })

  it('shows drag-active text when isDragActive is true', () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    useDropzone.mockReturnValueOnce({
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: true,
    })
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )
    expect(screen.getByText('Drop it!')).toBeInTheDocument()
  })

  it('drop sets pending file and shows file-selected UI with name pre-filled', async () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    let capturedOnDrop: ((files: File[]) => void) | null = null
    useDropzone.mockImplementation(
      ({ onDrop }: { onDrop: (files: File[]) => void }) => {
        capturedOnDrop = onDrop
        return {
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: false,
        }
      },
    )
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )

    const file = new File(['data'], 'my-photo.jpg', { type: 'image/jpeg' })
    act(() => {
      capturedOnDrop?.([file])
    })

    expect(screen.getByTestId('selected-filename')).toHaveTextContent(
      'my-photo.jpg',
    )
    const nameInput = screen.getByTestId('name-input') as HTMLInputElement
    expect(nameInput.value).toBe('my-photo')
    expect(screen.getByTestId('upload-submit-button')).toBeInTheDocument()
    expect(screen.queryByTestId('dropzone')).not.toBeInTheDocument()
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('upload button click sends name in FormData and calls onUploaded on success', async () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    let capturedOnDrop: ((files: File[]) => void) | null = null
    useDropzone.mockImplementation(
      ({ onDrop }: { onDrop: (files: File[]) => void }) => {
        capturedOnDrop = onDrop
        return {
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: false,
        }
      },
    )
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )

    const file = new File(['data'], 'my-photo.jpg', { type: 'image/jpeg' })
    act(() => {
      capturedOnDrop?.([file])
    })

    const uploadButton = screen.getByTestId('upload-submit-button')
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1)
    })
    const formData = (axios.post as jest.Mock).mock.calls[0][1] as FormData
    expect(formData.get('name')).toBe('my-photo')

    await waitFor(() => {
      expect(mockOnUploaded).toHaveBeenCalledWith(
        expect.objectContaining({
          publicId: 'sawl.dev - blog/new-photo',
          url: 'https://res.cloudinary.com/demo/new-photo.jpg',
        }),
      )
    })
  })

  it('passes all fields from upload result to onUploaded', async () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    let capturedOnDrop: ((files: File[]) => void) | null = null
    useDropzone.mockImplementation(
      ({ onDrop }: { onDrop: (files: File[]) => void }) => {
        capturedOnDrop = onDrop
        return {
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: false,
        }
      },
    )
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    act(() => {
      capturedOnDrop?.([file])
    })

    fireEvent.click(screen.getByTestId('upload-submit-button'))

    await waitFor(() => {
      expect(mockOnUploaded).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'jpg',
          createdAt: '2024-01-01T00:00:00Z',
          bytes: 12345,
        }),
      )
    })
  })

  it('shows uploading state while axios.post is pending', async () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    let capturedOnDrop: ((files: File[]) => void) | null = null
    let resolveUpload!: (v: unknown) => void
    jest.spyOn(axios, 'post').mockReturnValue(
      new Promise((res) => {
        resolveUpload = res
      }),
    )
    useDropzone.mockImplementation(
      ({ onDrop }: { onDrop: (files: File[]) => void }) => {
        capturedOnDrop = onDrop
        return {
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: false,
        }
      },
    )
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    act(() => {
      capturedOnDrop?.([file])
    })

    fireEvent.click(screen.getByTestId('upload-submit-button'))

    expect(await screen.findByTestId('uploading-state')).toBeInTheDocument()

    resolveUpload({ data: mockUploadResult })
    await waitFor(() =>
      expect(screen.queryByTestId('uploading-state')).not.toBeInTheDocument(),
    )
  })

  it('shows error when upload fails', async () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    let capturedOnDrop: ((files: File[]) => void) | null = null
    jest
      .spyOn(axios, 'post')
      .mockRejectedValue(new Error('Request failed with status code 400'))
    useDropzone.mockImplementation(
      ({ onDrop }: { onDrop: (files: File[]) => void }) => {
        capturedOnDrop = onDrop
        return {
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: false,
        }
      },
    )
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    act(() => {
      capturedOnDrop?.([file])
    })

    fireEvent.click(screen.getByTestId('upload-submit-button'))

    expect(await screen.findByTestId('upload-error')).toBeInTheDocument()
    expect(screen.getByTestId('upload-error')).toHaveTextContent(
      'Upload failed, please try again',
    )
  })

  it('shows error when fetch throws a network error', async () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    let capturedOnDrop: ((files: File[]) => void) | null = null
    jest.spyOn(axios, 'post').mockRejectedValue(new Error('Network error'))
    useDropzone.mockImplementation(
      ({ onDrop }: { onDrop: (files: File[]) => void }) => {
        capturedOnDrop = onDrop
        return {
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: false,
        }
      },
    )
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    act(() => {
      capturedOnDrop?.([file])
    })

    fireEvent.click(screen.getByTestId('upload-submit-button'))

    expect(await screen.findByTestId('upload-error')).toBeInTheDocument()
  })

  it('does nothing when onDrop called with empty files array', async () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    let capturedOnDrop: ((files: File[]) => void) | null = null
    useDropzone.mockImplementation(
      ({ onDrop }: { onDrop: (files: File[]) => void }) => {
        capturedOnDrop = onDrop
        return {
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: false,
        }
      },
    )
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )

    act(() => {
      capturedOnDrop?.([])
    })

    expect(screen.queryByTestId('selected-filename')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upload-submit-button')).not.toBeInTheDocument()
    expect(axios.post).not.toHaveBeenCalled()
    expect(mockOnUploaded).not.toHaveBeenCalled()
  })

  it('handleClose resets state and calls onClose', async () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    let capturedOnDrop: ((files: File[]) => void) | null = null
    useDropzone.mockImplementation(
      ({ onDrop }: { onDrop: (files: File[]) => void }) => {
        capturedOnDrop = onDrop
        return {
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: false,
        }
      },
    )
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    act(() => {
      capturedOnDrop?.([file])
    })

    expect(screen.getByTestId('selected-filename')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('modal-hide-trigger'))

    expect(mockOnClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('selected-filename')).not.toBeInTheDocument()
    expect(screen.getByTestId('dropzone')).toBeInTheDocument()
  })

  it('user can edit the name input', async () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    let capturedOnDrop: ((files: File[]) => void) | null = null
    useDropzone.mockImplementation(
      ({ onDrop }: { onDrop: (files: File[]) => void }) => {
        capturedOnDrop = onDrop
        return {
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: false,
        }
      },
    )
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    act(() => {
      capturedOnDrop?.([file])
    })

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'custom-name' } })
    expect(nameInput.value).toBe('custom-name')
  })

  it('sends custom name in FormData after user edits the name input', async () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    let capturedOnDrop: ((files: File[]) => void) | null = null
    useDropzone.mockImplementation(
      ({ onDrop }: { onDrop: (files: File[]) => void }) => {
        capturedOnDrop = onDrop
        return {
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: false,
        }
      },
    )
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    act(() => {
      capturedOnDrop?.([file])
    })

    const nameInput = screen.getByTestId('name-input')
    fireEvent.change(nameInput, { target: { value: 'custom-name' } })

    fireEvent.click(screen.getByTestId('upload-submit-button'))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1)
    })
    const formData = (axios.post as jest.Mock).mock.calls[0][1] as FormData
    expect(formData.get('name')).toBe('custom-name')
  })

  it('strips extension correctly for file without extension', async () => {
    const { useDropzone } = require('react-dropzone') as {
      useDropzone: jest.Mock
    }
    let capturedOnDrop: ((files: File[]) => void) | null = null
    useDropzone.mockImplementation(
      ({ onDrop }: { onDrop: (files: File[]) => void }) => {
        capturedOnDrop = onDrop
        return {
          getRootProps: () => ({}),
          getInputProps: () => ({}),
          isDragActive: false,
        }
      },
    )
    renderApp(
      <ImageUploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploaded={mockOnUploaded}
      />,
    )

    const file = new File(['data'], 'photonoext', { type: 'image/jpeg' })
    act(() => {
      capturedOnDrop?.([file])
    })

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement
    expect(nameInput.value).toBe('photonoext')
  })
})

export {}
