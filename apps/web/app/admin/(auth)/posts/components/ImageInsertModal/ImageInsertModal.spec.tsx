import { act, fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import { ImageInsertModal, buildImageMarkdown } from './ImageInsertModal'

const mockPickedImage: CloudinaryImage = {
  url: 'https://cdn.com/photo.jpg',
  publicId: 'photo',
  width: 100,
  height: 100,
  format: 'jpg',
  createdAt: '2024-01-01T00:00:00Z',
  bytes: 1000,
}

function pickImage(onRequestImagePick: jest.Mock) {
  const [cb] = onRequestImagePick.mock.calls[0] as [
    (img: CloudinaryImage) => void,
  ]
  act(() => cb(mockPickedImage))
}

describe('ImageInsertModal', () => {
  it('renders nothing when closed', () => {
    renderApp(
      <ImageInsertModal
        isOpen={false}
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.queryByTestId('pick-image-button')).not.toBeInTheDocument()
  })

  it('renders modal content when open', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.getByTestId('pick-image-button')).toBeInTheDocument()
    expect(screen.getByTestId('alt-text-input')).toBeInTheDocument()
    expect(screen.getByTestId('caption-input')).toBeInTheDocument()
    expect(screen.getByTestId('caption-pos-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('size-full')).toBeInTheDocument()
    expect(screen.getByTestId('size-small')).toBeInTheDocument()
    expect(screen.getByTestId('size-medium')).toBeInTheDocument()
    expect(screen.getByTestId('align-none')).toBeInTheDocument()
    expect(screen.getByTestId('align-left')).toBeInTheDocument()
    expect(screen.getByTestId('align-right')).toBeInTheDocument()
    expect(screen.getByTestId('expand-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('photo-meta-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('image-modal-cancel')).toBeInTheDocument()
    expect(screen.getByTestId('image-modal-insert')).toBeInTheDocument()
  })

  it('shows placeholder text when no image selected', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.getByText('No image selected')).toBeInTheDocument()
    expect(screen.getByTestId('pick-image-button')).toHaveTextContent(
      'Pick image',
    )
  })

  it('insert button is disabled when no image selected', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.getByTestId('image-modal-insert')).toBeDisabled()
  })

  it('calls onRequestImagePick with a callback when pick button clicked', () => {
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    expect(onRequestImagePick).toHaveBeenCalledWith(expect.any(Function))
  })

  it('shows image thumb and enables insert after picking image', () => {
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    expect(screen.getByTestId('selected-image-thumb')).toHaveAttribute(
      'src',
      'https://cdn.com/photo.jpg',
    )
    expect(screen.getByTestId('image-modal-insert')).not.toBeDisabled()
    expect(screen.getByTestId('pick-image-button')).toHaveTextContent('Change')
  })

  it('renders correctly when pickerOpen is true', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={true}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.getByTestId('pick-image-button')).toBeInTheDocument()
  })

  it('shows preview after image selected', () => {
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    expect(screen.getByTestId('image-preview').textContent).toBe(
      '![](https://cdn.com/photo.jpg)',
    )
  })

  it('does not show preview before image selected', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument()
  })

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={onCancel}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('image-modal-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('inserts basic markdown on insert', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('includes alt text in markdown', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.change(screen.getByTestId('alt-text-input'), {
      target: { value: 'A forest path' },
    })
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![alt=A forest path](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('includes caption in markdown', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.change(screen.getByTestId('caption-input'), {
      target: { value: 'My photo' },
    })
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![caption=My photo](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('always shows caption-pos checkbox', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.getByTestId('caption-pos-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('caption-pos-checkbox')).not.toBeChecked()
  })

  it('includes caption-pos=top when checkbox checked', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.change(screen.getByTestId('caption-input'), {
      target: { value: 'My photo' },
    })
    fireEvent.click(screen.getByTestId('caption-pos-checkbox'))
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![caption=My photo&caption-pos=top](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('unchecking caption-pos reverts to bottom', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.change(screen.getByTestId('caption-input'), {
      target: { value: 'My photo' },
    })
    fireEvent.click(screen.getByTestId('caption-pos-checkbox'))
    fireEvent.click(screen.getByTestId('caption-pos-checkbox'))
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![caption=My photo](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('includes size=small when small selected', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('size-small'))
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![size=small](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('includes size=medium when medium selected', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('size-medium'))
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![size=medium](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('does not include size when full (default)', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('size-full'))
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('includes align=left when left selected', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('align-left'))
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![align=left](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('includes align=right when right selected', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('align-right'))
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![align=right](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('does not include align when none (default)', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('align-none'))
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('includes expand=true when expand checked', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('expand-checkbox'))
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![expand=true](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('combines all params in correct order', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('size-small'))
    fireEvent.click(screen.getByTestId('align-right'))
    fireEvent.change(screen.getByTestId('caption-input'), {
      target: { value: 'My photo' },
    })
    fireEvent.change(screen.getByTestId('alt-text-input'), {
      target: { value: 'A forest path' },
    })
    fireEvent.click(screen.getByTestId('expand-checkbox'))
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![size=small&align=right&caption=My photo&alt=A forest path&expand=true](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('shows photo-meta-checkbox', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.getByTestId('photo-meta-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('photo-meta-checkbox')).not.toBeChecked()
  })

  it('photo meta inputs hidden when checkbox unchecked', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.queryByTestId('photo-iso-input')).not.toBeInTheDocument()
    expect(screen.queryByTestId('photo-aperture-input')).not.toBeInTheDocument()
    expect(screen.queryByTestId('photo-exposure-input')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('photo-focal-length-input'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('photo-panoramic-count-input'),
    ).not.toBeInTheDocument()
  })

  it('shows photo meta inputs when checkbox checked', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('photo-meta-checkbox'))
    expect(screen.getByTestId('photo-iso-input')).toBeInTheDocument()
    expect(screen.getByTestId('photo-aperture-input')).toBeInTheDocument()
    expect(screen.getByTestId('photo-exposure-input')).toBeInTheDocument()
    expect(screen.getByTestId('photo-focal-length-input')).toBeInTheDocument()
    expect(
      screen.getByTestId('photo-panoramic-count-input'),
    ).toBeInTheDocument()
  })

  it('includes photo-iso param when set', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('photo-meta-checkbox'))
    fireEvent.change(screen.getByTestId('photo-iso-input'), {
      target: { value: '400' },
    })
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![photo-iso=400](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('includes photo-aperture param when set', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('photo-meta-checkbox'))
    fireEvent.change(screen.getByTestId('photo-aperture-input'), {
      target: { value: 'f/2.8' },
    })
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![photo-aperture=f/2.8](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('includes photo-exposure param when set', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('photo-meta-checkbox'))
    fireEvent.change(screen.getByTestId('photo-exposure-input'), {
      target: { value: '1/250' },
    })
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![photo-exposure=1/250](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('does not include photo meta params when checkbox unchecked', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    const call = (onInsert.mock.calls[0] as [string])[0]
    expect(call).not.toContain('photo-')
  })

  it('includes all photo meta params combined', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('photo-meta-checkbox'))
    fireEvent.change(screen.getByTestId('photo-iso-input'), {
      target: { value: '800' },
    })
    fireEvent.change(screen.getByTestId('photo-aperture-input'), {
      target: { value: 'f/4' },
    })
    fireEvent.change(screen.getByTestId('photo-exposure-input'), {
      target: { value: '1/500' },
    })
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![photo-iso=800&photo-aperture=f/4&photo-exposure=1/500](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('includes photo-focal-length param when set', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('photo-meta-checkbox'))
    fireEvent.change(screen.getByTestId('photo-focal-length-input'), {
      target: { value: '50mm' },
    })
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![photo-focal-length=50mm](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('includes photo-panoramic-count param when set', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('photo-meta-checkbox'))
    fireEvent.change(screen.getByTestId('photo-panoramic-count-input'), {
      target: { value: '12' },
    })
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n![photo-panoramic-count=12](https://cdn.com/photo.jpg)\n\n',
    )
  })

  it('resets photo meta state after insert', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.click(screen.getByTestId('photo-meta-checkbox'))
    fireEvent.change(screen.getByTestId('photo-iso-input'), {
      target: { value: '400' },
    })
    fireEvent.change(screen.getByTestId('photo-focal-length-input'), {
      target: { value: '50mm' },
    })
    fireEvent.change(screen.getByTestId('photo-panoramic-count-input'), {
      target: { value: '12' },
    })
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(screen.queryByTestId('photo-iso-input')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('photo-focal-length-input'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('photo-panoramic-count-input'),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('photo-meta-checkbox')).not.toBeChecked()
  })

  it('resets state after insert', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button'))
    pickImage(onRequestImagePick)
    fireEvent.change(screen.getByTestId('alt-text-input'), {
      target: { value: 'Alt' },
    })
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(screen.queryByTestId('selected-image-thumb')).not.toBeInTheDocument()
    expect(screen.getByTestId('alt-text-input')).toHaveValue('')
    expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument()
  })
})

describe('ImageInsertModal initialValues', () => {
  it('pre-fills image url and shows thumb when initialValues provided', () => {
    const onInsert = jest.fn()
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
        initialValues={{
          url: 'https://cdn.com/existing.jpg',
          altText: 'Existing alt',
          caption: 'Existing caption',
          captionPos: 'top',
          size: 'small',
          align: 'right',
          expand: true,
        }}
      />,
    )
    expect(screen.getByTestId('selected-image-thumb')).toHaveAttribute(
      'src',
      'https://cdn.com/existing.jpg',
    )
    expect(screen.getByTestId('alt-text-input')).toHaveValue('Existing alt')
    expect(screen.getByTestId('caption-input')).toHaveValue('Existing caption')
    expect(screen.getByTestId('caption-pos-checkbox')).toBeChecked()
    expect(screen.getByTestId('expand-checkbox')).toBeChecked()
    // Verify size/align pre-fill by checking the generated markdown
    fireEvent.click(screen.getByTestId('image-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(expect.stringContaining('size=small'))
    expect((onInsert.mock.calls[0] as [string])[0]).toContain('align=right')
  })

  it('pre-fills photo meta when initialValues has photoMeta', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
        initialValues={{
          url: 'https://cdn.com/photo.jpg',
          altText: '',
          caption: '',
          captionPos: 'bottom',
          size: 'full',
          align: 'none',
          expand: false,
          photoMeta: {
            iso: '400',
            aperture: 'f/2.8',
            exposure: '1/250',
            focalLength: '50mm',
            panoramicCount: '12',
          },
        }}
      />,
    )
    expect(screen.getByTestId('photo-meta-checkbox')).toBeChecked()
    expect(screen.getByTestId('photo-iso-input')).toHaveValue('400')
    expect(screen.getByTestId('photo-aperture-input')).toHaveValue('f/2.8')
    expect(screen.getByTestId('photo-exposure-input')).toHaveValue('1/250')
    expect(screen.getByTestId('photo-focal-length-input')).toHaveValue('50mm')
    expect(screen.getByTestId('photo-panoramic-count-input')).toHaveValue('12')
  })

  it('enables photo meta when only focalLength provided', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
        initialValues={{
          url: 'https://cdn.com/photo.jpg',
          altText: '',
          caption: '',
          captionPos: 'bottom',
          size: 'full',
          align: 'none',
          expand: false,
          photoMeta: { focalLength: '35mm' },
        }}
      />,
    )
    expect(screen.getByTestId('photo-meta-checkbox')).toBeChecked()
    expect(screen.getByTestId('photo-focal-length-input')).toHaveValue('35mm')
  })

  it('enables photo meta when only panoramicCount provided', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
        initialValues={{
          url: 'https://cdn.com/photo.jpg',
          altText: '',
          caption: '',
          captionPos: 'bottom',
          size: 'full',
          align: 'none',
          expand: false,
          photoMeta: { panoramicCount: '8' },
        }}
      />,
    )
    expect(screen.getByTestId('photo-meta-checkbox')).toBeChecked()
    expect(screen.getByTestId('photo-panoramic-count-input')).toHaveValue('8')
  })

  it('does not pre-fill when initialValues is null', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
        initialValues={null}
      />,
    )
    expect(screen.queryByTestId('selected-image-thumb')).not.toBeInTheDocument()
    expect(screen.getByTestId('alt-text-input')).toHaveValue('')
  })

  it('insert button enabled when initialValues provides url', () => {
    renderApp(
      <ImageInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
        initialValues={{
          url: 'https://cdn.com/existing.jpg',
          altText: '',
          caption: '',
          captionPos: 'bottom',
          size: 'full',
          align: 'none',
          expand: false,
        }}
      />,
    )
    expect(screen.getByTestId('image-modal-insert')).not.toBeDisabled()
  })
})

describe('buildImageMarkdown', () => {
  const base = {
    url: 'https://cdn.com/img.jpg',
    altText: '',
    caption: '',
    captionPos: 'bottom' as const,
    size: 'full' as const,
    align: 'none' as const,
    expand: false,
  }

  it('returns basic markdown with no params', () => {
    expect(buildImageMarkdown(base)).toBe(
      '\n\n![](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('adds size param when not full', () => {
    expect(buildImageMarkdown({ ...base, size: 'small' })).toBe(
      '\n\n![size=small](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('adds align param when not none', () => {
    expect(buildImageMarkdown({ ...base, align: 'left' })).toBe(
      '\n\n![align=left](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('adds caption param', () => {
    expect(buildImageMarkdown({ ...base, caption: 'My photo' })).toBe(
      '\n\n![caption=My photo](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('adds caption-pos=top when captionPos is top', () => {
    expect(
      buildImageMarkdown({ ...base, caption: 'My photo', captionPos: 'top' }),
    ).toBe(
      '\n\n![caption=My photo&caption-pos=top](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('does not add caption-pos when captionPos is bottom', () => {
    expect(
      buildImageMarkdown({
        ...base,
        caption: 'My photo',
        captionPos: 'bottom',
      }),
    ).toBe('\n\n![caption=My photo](https://cdn.com/img.jpg)\n\n')
  })

  it('does not add caption-pos when no caption', () => {
    expect(buildImageMarkdown({ ...base, captionPos: 'top' })).toBe(
      '\n\n![](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('adds alt param', () => {
    expect(buildImageMarkdown({ ...base, altText: 'A forest path' })).toBe(
      '\n\n![alt=A forest path](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('adds expand=true when expand is true', () => {
    expect(buildImageMarkdown({ ...base, expand: true })).toBe(
      '\n\n![expand=true](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('trims whitespace from altText and caption', () => {
    expect(
      buildImageMarkdown({ ...base, altText: '  alt  ', caption: '  cap  ' }),
    ).toBe('\n\n![caption=cap&alt=alt](https://cdn.com/img.jpg)\n\n')
  })

  it('combines all params in correct order', () => {
    expect(
      buildImageMarkdown({
        url: 'https://cdn.com/img.jpg',
        altText: 'A forest path',
        caption: 'My photo',
        captionPos: 'top',
        size: 'small',
        align: 'right',
        expand: true,
      }),
    ).toBe(
      '\n\n![size=small&align=right&caption=My photo&caption-pos=top&alt=A forest path&expand=true](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('adds photo-iso param', () => {
    expect(buildImageMarkdown({ ...base, photoMeta: { iso: '400' } })).toBe(
      '\n\n![photo-iso=400](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('adds photo-aperture param', () => {
    expect(
      buildImageMarkdown({ ...base, photoMeta: { aperture: 'f/2.8' } }),
    ).toBe('\n\n![photo-aperture=f/2.8](https://cdn.com/img.jpg)\n\n')
  })

  it('adds photo-exposure param', () => {
    expect(
      buildImageMarkdown({ ...base, photoMeta: { exposure: '1/250' } }),
    ).toBe('\n\n![photo-exposure=1/250](https://cdn.com/img.jpg)\n\n')
  })

  it('adds all photo meta params', () => {
    expect(
      buildImageMarkdown({
        ...base,
        photoMeta: { iso: '800', aperture: 'f/4', exposure: '1/500' },
      }),
    ).toBe(
      '\n\n![photo-iso=800&photo-aperture=f/4&photo-exposure=1/500](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('adds photo-focal-length param', () => {
    expect(
      buildImageMarkdown({ ...base, photoMeta: { focalLength: '50mm' } }),
    ).toBe('\n\n![photo-focal-length=50mm](https://cdn.com/img.jpg)\n\n')
  })

  it('adds photo-panoramic-count param', () => {
    expect(
      buildImageMarkdown({ ...base, photoMeta: { panoramicCount: '12' } }),
    ).toBe('\n\n![photo-panoramic-count=12](https://cdn.com/img.jpg)\n\n')
  })

  it('adds all five photo meta params', () => {
    expect(
      buildImageMarkdown({
        ...base,
        photoMeta: {
          iso: '800',
          aperture: 'f/4',
          exposure: '1/500',
          focalLength: '50mm',
          panoramicCount: '12',
        },
      }),
    ).toBe(
      '\n\n![photo-iso=800&photo-aperture=f/4&photo-exposure=1/500&photo-focal-length=50mm&photo-panoramic-count=12](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('trims whitespace from photo meta values', () => {
    expect(
      buildImageMarkdown({
        ...base,
        photoMeta: { iso: '  100  ', aperture: '  f/1.8  ' },
      }),
    ).toBe(
      '\n\n![photo-iso=100&photo-aperture=f/1.8](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('skips empty photo meta values', () => {
    expect(
      buildImageMarkdown({
        ...base,
        photoMeta: { iso: '', aperture: 'f/2.8', exposure: '' },
      }),
    ).toBe('\n\n![photo-aperture=f/2.8](https://cdn.com/img.jpg)\n\n')
  })

  it('omits photo meta when not provided', () => {
    expect(buildImageMarkdown(base)).toBe(
      '\n\n![](https://cdn.com/img.jpg)\n\n',
    )
  })

  it('combines photo meta after other params', () => {
    expect(
      buildImageMarkdown({
        url: 'https://cdn.com/img.jpg',
        altText: 'shot',
        caption: '',
        captionPos: 'bottom',
        size: 'full',
        align: 'none',
        expand: false,
        photoMeta: { iso: '200', aperture: 'f/5.6', exposure: '1/1000' },
      }),
    ).toBe(
      '\n\n![alt=shot&photo-iso=200&photo-aperture=f/5.6&photo-exposure=1/1000](https://cdn.com/img.jpg)\n\n',
    )
  })
})
