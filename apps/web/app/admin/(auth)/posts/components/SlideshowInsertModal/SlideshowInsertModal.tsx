'use client'

import React, { useRef, useState } from 'react'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { Select } from '@sdlgr/select'

import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import type {
  ParsedSlideshow,
  ParsedSlideshowSlide,
} from '../PostEditor/parseEmbedBlock'
import {
  StyledAddSlideButton,
  StyledBackdrop,
  StyledButtons,
  StyledCancelButton,
  StyledCheckboxRow,
  StyledImagePlaceholder,
  StyledImageSection,
  StyledImageThumb,
  StyledInput,
  StyledInsertBetweenButton,
  StyledInsertBetweenRow,
  StyledInsertButton,
  StyledLabel,
  StyledModalContent,
  StyledModalTitle,
  StyledMoveButton,
  StyledPhotoMetaField,
  StyledPhotoMetaInputRow,
  StyledPickButton,
  StyledPreview,
  StyledRemoveSlideButton,
  StyledSlideCard,
  StyledSlideCardHeader,
  StyledSlideHeaderActions,
  StyledSlideNumber,
  StyledSlideshowInsertModal,
} from './SlideshowInsertModal.styles'

const ISO_OPTIONS = [
  '100',
  '200',
  '400',
  '800',
  '1600',
  '3200',
  '6400',
  '12800',
  '25600',
  '51200',
].map((v) => ({ value: v, label: v }))

const APERTURE_OPTIONS = [
  'f/1.4',
  'f/1.8',
  'f/2',
  'f/2.8',
  'f/4',
  'f/5.6',
  'f/8',
  'f/9',
  'f/10',
  'f/11',
  'f/16',
  'f/22',
].map((v) => ({ value: v, label: v }))

const SHUTTER_SPEED_OPTIONS = [
  '1/8000',
  '1/4000',
  '1/2000',
  '1/1000',
  '1/500',
  '1/400',
  '1/320',
  '1/250',
  '1/125',
  '1/60',
  '1/30',
  '1/15',
  '1/8',
  '1/4',
  '1/2',
  '1s',
  '2s',
  '5s',
  '10s',
  '30s',
].map((v) => ({ value: v, label: v }))

export interface SlideState {
  id: string
  selectedImage: CloudinaryImage | null
  altText: string
  caption: string
  captionPos: 'top' | 'bottom'
  expand: boolean
  photoMetaEnabled: boolean
  photoIso: string
  photoExposure: string
  photoAperture: string
  photoFocalLength: string
  photoPanoramicCount: string
}

function makeDefaultSlide(id: string): SlideState {
  return {
    id,
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
  }
}

function makeSlideFromParsed(s: ParsedSlideshowSlide, id: string): SlideState {
  return {
    id,
    selectedImage: { url: s.url } as unknown as CloudinaryImage,
    altText: s.altText ?? '',
    caption: s.caption ?? '',
    captionPos: s.captionPos ?? 'bottom',
    expand: s.expand ?? false,
    photoMetaEnabled: !!(
      s.photoMeta?.iso ||
      s.photoMeta?.aperture ||
      s.photoMeta?.exposure ||
      s.photoMeta?.focalLength ||
      s.photoMeta?.panoramicCount
    ),
    photoIso: s.photoMeta?.iso ?? '',
    photoExposure: s.photoMeta?.exposure ?? '',
    photoAperture: s.photoMeta?.aperture ?? '',
    photoFocalLength: s.photoMeta?.focalLength?.replace(/mm$/, '') ?? '',
    photoPanoramicCount: s.photoMeta?.panoramicCount ?? '',
  }
}

export function buildSlideMarkdown(slide: SlideState): string | null {
  if (!slide.selectedImage) return null
  const parts: string[] = []
  if (slide.caption.trim()) {
    parts.push(`caption=${slide.caption.trim()}`)
    if (slide.captionPos === 'top') parts.push('caption-pos=top')
  }
  if (slide.altText.trim()) parts.push(`alt=${slide.altText.trim()}`)
  if (slide.expand) parts.push('expand=true')
  if (slide.photoMetaEnabled) {
    if (slide.photoIso.trim()) parts.push(`photo-iso=${slide.photoIso.trim()}`)
    if (slide.photoAperture.trim())
      parts.push(`photo-aperture=${slide.photoAperture.trim()}`)
    if (slide.photoExposure.trim())
      parts.push(`photo-exposure=${slide.photoExposure.trim()}`)
    if (slide.photoFocalLength)
      parts.push(`photo-focal-length=${slide.photoFocalLength}mm`)
    if (slide.photoPanoramicCount.trim())
      parts.push(`photo-panoramic-count=${slide.photoPanoramicCount.trim()}`)
  }
  const params = parts.join('&')
  return `![${params}](${slide.selectedImage.url})`
}

export function buildSlideshowMarkdown(slides: SlideState[]): string {
  const lines = slides
    .map(buildSlideMarkdown)
    .filter((l): l is string => l !== null)
    .join('\n')
  if (!lines) return ''
  return `\n\n\`\`\`slideshow\n${lines}\n\`\`\`\n\n`
}

export interface SlideshowInsertModalProps {
  isOpen: boolean
  onInsert: (markdown: string) => void
  onCancel: () => void
  pickerOpen: boolean
  onRequestImagePick: (onPicked: (image: CloudinaryImage) => void) => void
  initialValues?: ParsedSlideshow | null
}

export function SlideshowInsertModal({
  isOpen,
  onInsert,
  onCancel,
  pickerOpen,
  onRequestImagePick,
  initialValues,
}: SlideshowInsertModalProps) {
  const [slides, setSlides] = useState<SlideState[]>(() => {
    if (!initialValues?.slides.length) return [makeDefaultSlide('0')]
    return initialValues.slides.map((s, i) => makeSlideFromParsed(s, String(i)))
  })

  const idRef = useRef(slides.length)

  function nextId(): string {
    const id = String(idRef.current)
    idRef.current += 1
    return id
  }

  function updateSlide(index: number, update: Partial<SlideState>) {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...update } : s)),
    )
  }

  function addSlide() {
    setSlides((prev) => [...prev, makeDefaultSlide(nextId())])
  }

  function moveSlide(index: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? index - 1 : index + 1
    setSlides((prev) => {
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function insertSlideAt(afterIndex: number) {
    setSlides((prev) => [
      ...prev.slice(0, afterIndex + 1),
      makeDefaultSlide(nextId()),
      ...prev.slice(afterIndex + 1),
    ])
  }

  function removeSlide(index: number) {
    /* istanbul ignore next */
    if (slides.length <= 1) return
    setSlides((prev) => prev.filter((_, i) => i !== index))
  }

  function handleInsert() {
    const markdown = buildSlideshowMarkdown(slides)
    onInsert(markdown)
    setSlides([makeDefaultSlide(nextId())])
  }

  const hasAnyImage = slides.some((s) => s.selectedImage !== null)
  const preview = hasAnyImage ? buildSlideshowMarkdown(slides).trim() : null

  return (
    <StyledSlideshowInsertModal
      show={isOpen}
      onHide={onCancel}
      enforceFocus={!pickerOpen}
      renderBackdrop={
        pickerOpen
          ? undefined
          : (props: RenderModalBackdropProps) => <StyledBackdrop {...props} />
      }
      aria-labelledby="slideshow-insert-modal"
    >
      <StyledModalContent>
        <StyledModalTitle>Insert Slideshow</StyledModalTitle>

        {slides.map((slide, index) => (
          <React.Fragment key={slide.id}>
            <StyledSlideCard data-testid={`slide-card-${index}`}>
              <StyledSlideCardHeader>
                <StyledSlideNumber>Slide {index + 1}</StyledSlideNumber>
                <StyledSlideHeaderActions>
                  <StyledMoveButton
                    type="button"
                    onClick={() => moveSlide(index, 'up')}
                    disabled={index === 0}
                    aria-label="Move slide up"
                    data-testid={`move-up-${index}`}
                  >
                    ↑
                  </StyledMoveButton>
                  <StyledMoveButton
                    type="button"
                    onClick={() => moveSlide(index, 'down')}
                    disabled={index === slides.length - 1}
                    aria-label="Move slide down"
                    data-testid={`move-down-${index}`}
                  >
                    ↓
                  </StyledMoveButton>
                  {slides.length > 1 && (
                    <StyledRemoveSlideButton
                      type="button"
                      onClick={() => removeSlide(index)}
                      data-testid={`remove-slide-${index}`}
                    >
                      Remove
                    </StyledRemoveSlideButton>
                  )}
                </StyledSlideHeaderActions>
              </StyledSlideCardHeader>

              <StyledImageSection>
                {slide.selectedImage ? (
                  <StyledImageThumb
                    src={slide.selectedImage.url}
                    alt="Selected"
                    data-testid={`slide-thumb-${index}`}
                  />
                ) : (
                  <StyledImagePlaceholder>
                    No image selected
                  </StyledImagePlaceholder>
                )}
                <StyledPickButton
                  type="button"
                  onClick={() =>
                    onRequestImagePick((img) =>
                      updateSlide(index, { selectedImage: img }),
                    )
                  }
                  data-testid={`pick-image-button-${index}`}
                >
                  {slide.selectedImage ? 'Change' : 'Pick image'}
                </StyledPickButton>
              </StyledImageSection>

              <StyledLabel htmlFor={`slide-${index}-alt`}>Alt text</StyledLabel>
              <StyledInput
                id={`slide-${index}-alt`}
                value={slide.altText}
                onChange={(e) =>
                  updateSlide(index, { altText: e.target.value })
                }
                placeholder="Describe the image for accessibility"
                data-testid={`alt-text-input-${index}`}
              />

              <StyledLabel htmlFor={`slide-${index}-caption`}>
                Caption
              </StyledLabel>
              <StyledInput
                id={`slide-${index}-caption`}
                value={slide.caption}
                onChange={(e) =>
                  updateSlide(index, { caption: e.target.value })
                }
                placeholder="Optional caption"
                data-testid={`caption-input-${index}`}
              />

              <StyledCheckboxRow>
                <label>
                  <input
                    type="checkbox"
                    checked={slide.captionPos === 'top'}
                    onChange={(e) =>
                      updateSlide(index, {
                        captionPos: e.target.checked ? 'top' : 'bottom',
                      })
                    }
                    data-testid={`caption-pos-checkbox-${index}`}
                  />
                  Caption above image
                </label>
              </StyledCheckboxRow>

              <StyledCheckboxRow>
                <label>
                  <input
                    type="checkbox"
                    checked={slide.expand}
                    onChange={(e) =>
                      updateSlide(index, { expand: e.target.checked })
                    }
                    data-testid={`expand-checkbox-${index}`}
                  />
                  Expand on click
                </label>
              </StyledCheckboxRow>

              <StyledCheckboxRow>
                <label>
                  <input
                    type="checkbox"
                    checked={slide.photoMetaEnabled}
                    onChange={(e) =>
                      updateSlide(index, { photoMetaEnabled: e.target.checked })
                    }
                    data-testid={`photo-meta-checkbox-${index}`}
                  />
                  Photo metadata
                </label>
              </StyledCheckboxRow>

              {slide.photoMetaEnabled && (
                <StyledPhotoMetaInputRow>
                  <StyledPhotoMetaField>
                    <StyledLabel htmlFor={`slide-${index}-iso`}>
                      ISO
                    </StyledLabel>
                    <Select
                      id={`slide-${index}-iso`}
                      value={slide.photoIso}
                      onChange={(v) => updateSlide(index, { photoIso: v })}
                      options={ISO_OPTIONS}
                      isSearchable
                      isClearable
                      placeholder="e.g. 400"
                      data-testid={`photo-iso-input-${index}`}
                    />
                  </StyledPhotoMetaField>
                  <StyledPhotoMetaField>
                    <StyledLabel htmlFor={`slide-${index}-aperture`}>
                      Aperture
                    </StyledLabel>
                    <Select
                      id={`slide-${index}-aperture`}
                      value={slide.photoAperture}
                      onChange={(v) => updateSlide(index, { photoAperture: v })}
                      options={APERTURE_OPTIONS}
                      isSearchable
                      isClearable
                      placeholder="e.g. f/2.8"
                      data-testid={`photo-aperture-input-${index}`}
                    />
                  </StyledPhotoMetaField>
                  <StyledPhotoMetaField>
                    <StyledLabel htmlFor={`slide-${index}-exposure`}>
                      Shutter speed
                    </StyledLabel>
                    <Select
                      id={`slide-${index}-exposure`}
                      value={slide.photoExposure}
                      onChange={(v) => updateSlide(index, { photoExposure: v })}
                      options={SHUTTER_SPEED_OPTIONS}
                      isSearchable
                      isClearable
                      placeholder="e.g. 1/250"
                      data-testid={`photo-exposure-input-${index}`}
                    />
                  </StyledPhotoMetaField>
                  <StyledPhotoMetaField>
                    <StyledLabel htmlFor={`slide-${index}-focal`}>
                      Focal length
                    </StyledLabel>
                    <StyledInput
                      id={`slide-${index}-focal`}
                      type="number"
                      min="1"
                      value={slide.photoFocalLength}
                      onChange={(e) =>
                        updateSlide(index, { photoFocalLength: e.target.value })
                      }
                      placeholder="e.g. 50"
                      data-testid={`photo-focal-length-input-${index}`}
                    />
                  </StyledPhotoMetaField>
                  <StyledPhotoMetaField>
                    <StyledLabel htmlFor={`slide-${index}-panoramic`}>
                      Panoramic shots
                    </StyledLabel>
                    <StyledInput
                      id={`slide-${index}-panoramic`}
                      value={slide.photoPanoramicCount}
                      onChange={(e) =>
                        updateSlide(index, {
                          photoPanoramicCount: e.target.value,
                        })
                      }
                      placeholder="e.g. 12"
                      data-testid={`photo-panoramic-count-input-${index}`}
                    />
                  </StyledPhotoMetaField>
                </StyledPhotoMetaInputRow>
              )}
            </StyledSlideCard>

            {index < slides.length - 1 && (
              <StyledInsertBetweenRow>
                <StyledInsertBetweenButton
                  type="button"
                  onClick={() => insertSlideAt(index)}
                  data-testid={`insert-after-${index}`}
                >
                  + Insert here
                </StyledInsertBetweenButton>
              </StyledInsertBetweenRow>
            )}
          </React.Fragment>
        ))}

        <StyledAddSlideButton
          type="button"
          onClick={addSlide}
          data-testid="add-slide-button"
        >
          + Add slide
        </StyledAddSlideButton>

        {preview && (
          <StyledPreview data-testid="slideshow-preview">
            {preview}
          </StyledPreview>
        )}

        <StyledButtons>
          <StyledCancelButton
            onClick={onCancel}
            data-testid="slideshow-modal-cancel"
          >
            Cancel
          </StyledCancelButton>
          <StyledInsertButton
            onClick={handleInsert}
            disabled={!hasAnyImage}
            data-testid="slideshow-modal-insert"
          >
            Insert
          </StyledInsertButton>
        </StyledButtons>
      </StyledModalContent>
    </StyledSlideshowInsertModal>
  )
}
