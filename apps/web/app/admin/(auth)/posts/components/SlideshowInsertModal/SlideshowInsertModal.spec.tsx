import { act, fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import {
  SlideshowInsertModal,
  buildSlideMarkdown,
  buildSlideshowMarkdown,
} from './SlideshowInsertModal'
import type { SlideState } from './SlideshowInsertModal'

jest.mock('react-overlays', () => ({
  Modal: ({
    show,
    children,
    onHide,
    renderBackdrop,
    ...rest
  }: {
    show: boolean
    children: React.ReactNode
    onHide: () => void
    renderBackdrop?: (props: Record<string, unknown>) => React.ReactNode
    [key: string]: unknown
  }) => {
    if (!show) return null
    return (
      <div {...rest}>
        {renderBackdrop?.({ onClick: onHide })}
        {children}
      </div>
    )
  },
}))

jest.mock('@sdlgr/select', () => ({
  Select: ({
    value,
    onChange,
    'data-testid': testId,
    isSearchable: _isSearchable,
    isClearable: _isClearable,
    ...rest
  }: {
    value: string
    onChange: (v: string) => void
    'data-testid'?: string
    isSearchable?: boolean
    isClearable?: boolean
    [key: string]: unknown
  }) => (
    <input
      {...rest}
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

const mockPickedImage: CloudinaryImage = {
  url: 'https://example.com/photo.jpg',
} as CloudinaryImage

function makeSlide(overrides: Partial<SlideState> = {}): SlideState {
  return {
    id: 'test-id',
    selectedImage: null,
    altText: '',
    caption: '',
    captionPos: 'bottom',
    expand: false,
    photoMetaEnabled: false,
    photoIso: '',
    photoExposure: '',
    photoAperture: '',
    photoFocalLength: '',
    photoPanoramicCount: '',
    ...overrides,
  }
}

function pickImageForSlide(onRequestImagePick: jest.Mock, callIndex = 0) {
  const [cb] = onRequestImagePick.mock.calls[callIndex] as [
    (img: CloudinaryImage) => void,
  ]
  act(() => cb(mockPickedImage))
}

describe('buildSlideMarkdown', () => {
  it('returns null when no selectedImage', () => {
    const slide = makeSlide()
    expect(buildSlideMarkdown(slide)).toBeNull()
  })

  it('returns ![](url) for slide with image and no params', () => {
    const slide = makeSlide({ selectedImage: mockPickedImage })
    expect(buildSlideMarkdown(slide)).toBe('![](https://example.com/photo.jpg)')
  })

  it('includes caption in params', () => {
    const slide = makeSlide({
      selectedImage: mockPickedImage,
      caption: 'My caption',
    })
    expect(buildSlideMarkdown(slide)).toBe(
      '![caption=My caption](https://example.com/photo.jpg)',
    )
  })

  it('includes caption-pos=top when captionPos is top', () => {
    const slide = makeSlide({
      selectedImage: mockPickedImage,
      caption: 'My caption',
      captionPos: 'top',
    })
    expect(buildSlideMarkdown(slide)).toBe(
      '![caption=My caption&caption-pos=top](https://example.com/photo.jpg)',
    )
  })

  it('includes alt text in params', () => {
    const slide = makeSlide({
      selectedImage: mockPickedImage,
      altText: 'A sunset photo',
    })
    expect(buildSlideMarkdown(slide)).toBe(
      '![alt=A sunset photo](https://example.com/photo.jpg)',
    )
  })

  it('includes expand=true when expand is true', () => {
    const slide = makeSlide({
      selectedImage: mockPickedImage,
      expand: true,
    })
    expect(buildSlideMarkdown(slide)).toBe(
      '![expand=true](https://example.com/photo.jpg)',
    )
  })

  it('includes photo meta params when photoMetaEnabled is true', () => {
    const slide = makeSlide({
      selectedImage: mockPickedImage,
      photoMetaEnabled: true,
      photoIso: '400',
      photoAperture: 'f/2.8',
      photoExposure: '1/250',
      photoFocalLength: '50',
      photoPanoramicCount: '3',
    })
    expect(buildSlideMarkdown(slide)).toBe(
      '![photo-iso=400&photo-aperture=f/2.8&photo-exposure=1/250&photo-focal-length=50mm&photo-panoramic-count=3](https://example.com/photo.jpg)',
    )
  })

  it('omits photo meta when photoMetaEnabled is false', () => {
    const slide = makeSlide({
      selectedImage: mockPickedImage,
      photoMetaEnabled: false,
      photoIso: '400',
      photoAperture: 'f/2.8',
    })
    const result = buildSlideMarkdown(slide)
    expect(result).not.toContain('photo-')
  })

  it('focal length gets mm suffix appended', () => {
    const slide = makeSlide({
      selectedImage: mockPickedImage,
      photoMetaEnabled: true,
      photoFocalLength: '35',
    })
    expect(buildSlideMarkdown(slide)).toContain('photo-focal-length=35mm')
  })
})

describe('buildSlideshowMarkdown', () => {
  it('returns empty string when all slides have no selectedImage', () => {
    const slides = [makeSlide(), makeSlide()]
    expect(buildSlideshowMarkdown(slides)).toBe('')
  })

  it('wraps valid slides in slideshow fence', () => {
    const slides = [makeSlide({ selectedImage: mockPickedImage })]
    expect(buildSlideshowMarkdown(slides)).toBe(
      '\n\n```slideshow\n![](https://example.com/photo.jpg)\n```\n\n',
    )
  })

  it('skips slides without images', () => {
    const slides = [
      makeSlide(),
      makeSlide({ selectedImage: mockPickedImage }),
      makeSlide(),
    ]
    expect(buildSlideshowMarkdown(slides)).toBe(
      '\n\n```slideshow\n![](https://example.com/photo.jpg)\n```\n\n',
    )
  })
})

describe('SlideshowInsertModal', () => {
  it('renders nothing when isOpen is false', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen={false}
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.queryByTestId('slide-card-0')).not.toBeInTheDocument()
  })

  it('renders modal content when isOpen is true', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.getByTestId('slide-card-0')).toBeInTheDocument()
    expect(screen.getByTestId('pick-image-button-0')).toBeInTheDocument()
    expect(screen.getByTestId('add-slide-button')).toBeInTheDocument()
    expect(screen.getByTestId('slideshow-modal-cancel')).toBeInTheDocument()
    expect(screen.getByTestId('slideshow-modal-insert')).toBeInTheDocument()
  })

  it('insert button is disabled when no images selected', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.getByTestId('slideshow-modal-insert')).toBeDisabled()
  })

  it('insert button is enabled when at least one image is selected', () => {
    const onRequestImagePick = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button-0'))
    pickImageForSlide(onRequestImagePick)
    expect(screen.getByTestId('slideshow-modal-insert')).not.toBeDisabled()
  })

  it('clicking pick-image-button calls onRequestImagePick', () => {
    const onRequestImagePick = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button-0'))
    expect(onRequestImagePick).toHaveBeenCalledWith(expect.any(Function))
  })

  it('after image picked, thumbnail is shown and pick button label changes to Change', () => {
    const onRequestImagePick = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button-0'))
    pickImageForSlide(onRequestImagePick)
    expect(screen.getByTestId('slide-thumb-0')).toHaveAttribute(
      'src',
      'https://example.com/photo.jpg',
    )
    expect(screen.getByTestId('pick-image-button-0')).toHaveTextContent(
      'Change',
    )
  })

  it('changing alt text updates state', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    fireEvent.change(screen.getByTestId('alt-text-input-0'), {
      target: { value: 'A beautiful sunset' },
    })
    expect(screen.getByTestId('alt-text-input-0')).toHaveValue(
      'A beautiful sunset',
    )
  })

  it('changing caption updates state', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    fireEvent.change(screen.getByTestId('caption-input-0'), {
      target: { value: 'Sunset over the hills' },
    })
    expect(screen.getByTestId('caption-input-0')).toHaveValue(
      'Sunset over the hills',
    )
  })

  it('toggling caption-pos-checkbox changes captionPos to top and back', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button-0'))
    pickImageForSlide(onRequestImagePick)
    fireEvent.change(screen.getByTestId('caption-input-0'), {
      target: { value: 'My caption' },
    })
    fireEvent.click(screen.getByTestId('caption-pos-checkbox-0'))
    fireEvent.click(screen.getByTestId('slideshow-modal-insert'))
    expect((onInsert.mock.calls[0] as [string])[0]).toContain('caption-pos=top')
  })

  it('toggling caption-pos-checkbox back removes caption-pos=top', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button-0'))
    pickImageForSlide(onRequestImagePick)
    fireEvent.click(screen.getByTestId('caption-pos-checkbox-0'))
    fireEvent.click(screen.getByTestId('caption-pos-checkbox-0'))
    fireEvent.click(screen.getByTestId('slideshow-modal-insert'))
    expect((onInsert.mock.calls[0] as [string])[0]).not.toContain(
      'caption-pos=top',
    )
  })

  it('toggling expand-checkbox changes expand', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button-0'))
    pickImageForSlide(onRequestImagePick)
    fireEvent.click(screen.getByTestId('expand-checkbox-0'))
    fireEvent.click(screen.getByTestId('slideshow-modal-insert'))
    expect((onInsert.mock.calls[0] as [string])[0]).toContain('expand=true')
  })

  it('toggling photo-meta-checkbox shows photo meta inputs', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.queryByTestId('photo-iso-input-0')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('photo-meta-checkbox-0'))
    expect(screen.getByTestId('photo-iso-input-0')).toBeInTheDocument()
    expect(screen.getByTestId('photo-aperture-input-0')).toBeInTheDocument()
    expect(screen.getByTestId('photo-exposure-input-0')).toBeInTheDocument()
    expect(screen.getByTestId('photo-focal-length-input-0')).toBeInTheDocument()
    expect(
      screen.getByTestId('photo-panoramic-count-input-0'),
    ).toBeInTheDocument()
  })

  it('toggling photo-meta-checkbox off hides photo meta inputs', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('photo-meta-checkbox-0'))
    fireEvent.click(screen.getByTestId('photo-meta-checkbox-0'))
    expect(screen.queryByTestId('photo-iso-input-0')).not.toBeInTheDocument()
  })

  it('photo meta inputs update state', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button-0'))
    pickImageForSlide(onRequestImagePick)
    fireEvent.click(screen.getByTestId('photo-meta-checkbox-0'))
    fireEvent.change(screen.getByTestId('photo-iso-input-0'), {
      target: { value: '800' },
    })
    fireEvent.change(screen.getByTestId('photo-aperture-input-0'), {
      target: { value: 'f/4' },
    })
    fireEvent.change(screen.getByTestId('photo-exposure-input-0'), {
      target: { value: '1/500' },
    })
    fireEvent.change(screen.getByTestId('photo-panoramic-count-input-0'), {
      target: { value: '5' },
    })
    fireEvent.click(screen.getByTestId('slideshow-modal-insert'))
    const inserted = (onInsert.mock.calls[0] as [string])[0]
    expect(inserted).toContain('photo-iso=800')
    expect(inserted).toContain('photo-aperture=f/4')
    expect(inserted).toContain('photo-exposure=1/500')
    expect(inserted).toContain('photo-panoramic-count=5')
  })

  it('focal length input accepts number value', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button-0'))
    pickImageForSlide(onRequestImagePick)
    fireEvent.click(screen.getByTestId('photo-meta-checkbox-0'))
    fireEvent.change(screen.getByTestId('photo-focal-length-input-0'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByTestId('slideshow-modal-insert'))
    expect((onInsert.mock.calls[0] as [string])[0]).toContain(
      'photo-focal-length=50mm',
    )
  })

  it('clicking add-slide-button adds a second slide card', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.queryByTestId('slide-card-1')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('add-slide-button'))
    expect(screen.getByTestId('slide-card-1')).toBeInTheDocument()
  })

  it('remove-slide button NOT shown when only 1 slide', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.queryByTestId('remove-slide-0')).not.toBeInTheDocument()
  })

  it('remove-slide-1 button appears on second slide, clicking removes it', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('add-slide-button'))
    expect(screen.getByTestId('remove-slide-1')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('remove-slide-1'))
    expect(screen.queryByTestId('slide-card-1')).not.toBeInTheDocument()
  })

  it('move-up-0 is disabled on first slide', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.getByTestId('move-up-0')).toBeDisabled()
  })

  it('move-down is disabled on last slide', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.getByTestId('move-down-0')).toBeDisabled()
  })

  it('move-up swaps slide with the one above', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('add-slide-button'))
    fireEvent.change(screen.getByTestId('alt-text-input-0'), {
      target: { value: 'First' },
    })
    fireEvent.change(screen.getByTestId('alt-text-input-1'), {
      target: { value: 'Second' },
    })
    fireEvent.click(screen.getByTestId('move-up-1'))
    expect(screen.getByTestId('alt-text-input-0')).toHaveValue('Second')
    expect(screen.getByTestId('alt-text-input-1')).toHaveValue('First')
  })

  it('move-down swaps slide with the one below', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('add-slide-button'))
    fireEvent.change(screen.getByTestId('alt-text-input-0'), {
      target: { value: 'First' },
    })
    fireEvent.change(screen.getByTestId('alt-text-input-1'), {
      target: { value: 'Second' },
    })
    fireEvent.click(screen.getByTestId('move-down-0'))
    expect(screen.getByTestId('alt-text-input-0')).toHaveValue('Second')
    expect(screen.getByTestId('alt-text-input-1')).toHaveValue('First')
  })

  it('insert-after-0 button appears between slides and inserts a new slide', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('add-slide-button'))
    fireEvent.change(screen.getByTestId('alt-text-input-1'), {
      target: { value: 'Was second' },
    })
    expect(screen.getByTestId('insert-after-0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('insert-after-0'))
    expect(screen.getAllByTestId(/^slide-card-/)).toHaveLength(3)
    expect(screen.getByTestId('alt-text-input-2')).toHaveValue('Was second')
  })

  it('insert-after button not shown when only 1 slide', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.queryByTestId('insert-after-0')).not.toBeInTheDocument()
  })

  it('updating second slide does not affect first slide', () => {
    const onRequestImagePick = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    // Add second slide
    fireEvent.click(screen.getByTestId('add-slide-button'))
    // Update the second slide alt text
    fireEvent.change(screen.getByTestId('alt-text-input-1'), {
      target: { value: 'Second slide alt' },
    })
    // First slide should not be affected
    expect(screen.getByTestId('alt-text-input-0')).toHaveValue('')
    expect(screen.getByTestId('alt-text-input-1')).toHaveValue(
      'Second slide alt',
    )
  })

  it('slideshow-preview not shown when no images selected', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    expect(screen.queryByTestId('slideshow-preview')).not.toBeInTheDocument()
  })

  it('slideshow-preview shown with correct markdown when image is selected', () => {
    const onRequestImagePick = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button-0'))
    pickImageForSlide(onRequestImagePick)
    expect(screen.getByTestId('slideshow-preview')).toBeInTheDocument()
    expect(screen.getByTestId('slideshow-preview').textContent).toContain(
      '```slideshow',
    )
    expect(screen.getByTestId('slideshow-preview').textContent).toContain(
      'https://example.com/photo.jpg',
    )
  })

  it('clicking insert calls onInsert with correct markdown and resets form', () => {
    const onInsert = jest.fn()
    const onRequestImagePick = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={onInsert}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={onRequestImagePick}
      />,
    )
    fireEvent.click(screen.getByTestId('pick-image-button-0'))
    pickImageForSlide(onRequestImagePick)
    fireEvent.click(screen.getByTestId('slideshow-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```slideshow\n![](https://example.com/photo.jpg)\n```\n\n',
    )
    // After insert, form resets to single empty slide
    expect(screen.queryByTestId('slide-thumb-0')).not.toBeInTheDocument()
    expect(screen.queryByTestId('slideshow-preview')).not.toBeInTheDocument()
    expect(screen.queryByTestId('slide-card-1')).not.toBeInTheDocument()
  })

  it('clicking cancel calls onCancel', () => {
    const onCancel = jest.fn()
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={onCancel}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('slideshow-modal-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})

describe('SlideshowInsertModal initialValues', () => {
  it('pre-populates slides from initialValues', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
        initialValues={{
          slides: [
            {
              url: 'https://cdn.com/slide1.jpg',
              altText: 'Slide 1 alt',
              caption: 'Slide 1 caption',
              captionPos: 'bottom',
              size: 'full',
              align: 'none',
              expand: true,
            },
          ],
        }}
      />,
    )
    expect(screen.getByTestId('slide-thumb-0')).toHaveAttribute(
      'src',
      'https://cdn.com/slide1.jpg',
    )
    expect(screen.getByTestId('alt-text-input-0')).toHaveValue('Slide 1 alt')
    expect(screen.getByTestId('caption-input-0')).toHaveValue('Slide 1 caption')
    expect(screen.getByTestId('expand-checkbox-0')).toBeChecked()
  })

  it('pre-populates photo meta from initialValues', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
        initialValues={{
          slides: [
            {
              url: 'https://cdn.com/slide1.jpg',
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
                panoramicCount: '3',
              },
            },
          ],
        }}
      />,
    )
    expect(screen.getByTestId('photo-meta-checkbox-0')).toBeChecked()
    expect(screen.getByTestId('photo-iso-input-0')).toHaveValue('400')
    expect(screen.getByTestId('photo-aperture-input-0')).toHaveValue('f/2.8')
    expect(screen.getByTestId('photo-exposure-input-0')).toHaveValue('1/250')
    expect(screen.getByTestId('photo-focal-length-input-0')).toHaveValue(50)
    expect(screen.getByTestId('photo-panoramic-count-input-0')).toHaveValue('3')
  })

  it('does not pre-fill when initialValues is null', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
        initialValues={null}
      />,
    )
    expect(screen.queryByTestId('slide-thumb-0')).not.toBeInTheDocument()
    expect(screen.getByTestId('alt-text-input-0')).toHaveValue('')
  })

  it('insert button enabled when initialValues provides image url', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
        initialValues={{
          slides: [
            {
              url: 'https://cdn.com/slide1.jpg',
              altText: '',
              caption: '',
              captionPos: 'bottom',
              size: 'full',
              align: 'none',
              expand: false,
            },
          ],
        }}
      />,
    )
    expect(screen.getByTestId('slideshow-modal-insert')).not.toBeDisabled()
  })

  it('uses defaults when initialValues slide fields are undefined', () => {
    renderApp(
      <SlideshowInsertModal
        isOpen
        onInsert={jest.fn()}
        onCancel={jest.fn()}
        pickerOpen={false}
        onRequestImagePick={jest.fn()}
        initialValues={{
          slides: [
            {
              url: 'https://cdn.com/slide1.jpg',
              altText: undefined as unknown as string,
              caption: undefined as unknown as string,
              captionPos: undefined as unknown as 'top' | 'bottom',
              expand: undefined as unknown as boolean,
              size: 'full',
              align: 'none',
            },
          ],
        }}
      />,
    )
    expect(screen.getByTestId('alt-text-input-0')).toHaveValue('')
    expect(screen.getByTestId('caption-input-0')).toHaveValue('')
    expect(screen.getByTestId('caption-pos-checkbox-0')).not.toBeChecked()
    expect(screen.getByTestId('expand-checkbox-0')).not.toBeChecked()
  })
})
