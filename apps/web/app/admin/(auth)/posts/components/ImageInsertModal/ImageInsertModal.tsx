'use client'

import { useState } from 'react'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { Select } from '@sdlgr/select'

import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import type { ParsedImage } from '../PostEditor/parseEmbedBlock'
import {
  StyledBackdrop,
  StyledButtons,
  StyledCancelButton,
  StyledCheckboxRow,
  StyledImageInsertModal,
  StyledImagePlaceholder,
  StyledImageSection,
  StyledImageThumb,
  StyledInput,
  StyledInsertButton,
  StyledLabel,
  StyledModalContent,
  StyledPhotoMetaField,
  StyledPhotoMetaInputRow,
  StyledPickButton,
  StyledPreview,
  StyledSegmentButton,
  StyledSegmentRow,
} from './ImageInsertModal.styles'

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

export interface ImageInsertModalProps {
  isOpen: boolean
  onInsert: (markdown: string) => void
  onCancel: () => void
  pickerOpen: boolean
  onRequestImagePick: (onPicked: (image: CloudinaryImage) => void) => void
  initialValues?: ParsedImage | null
}

type Size = 'full' | 'small' | 'medium'
type Align = 'none' | 'left' | 'right'

export function buildImageMarkdown(opts: {
  url: string
  altText: string
  caption: string
  captionPos: 'top' | 'bottom'
  size: Size
  align: Align
  expand: boolean
  photoMeta?: {
    iso?: string
    exposure?: string
    aperture?: string
    focalLength?: string
    panoramicCount?: string
  }
}): string {
  const parts: string[] = []
  if (opts.size !== 'full') parts.push(`size=${opts.size}`)
  if (opts.align !== 'none') parts.push(`align=${opts.align}`)
  if (opts.caption.trim()) {
    parts.push(`caption=${opts.caption.trim()}`)
    if (opts.captionPos === 'top') parts.push('caption-pos=top')
  }
  if (opts.altText.trim()) parts.push(`alt=${opts.altText.trim()}`)
  if (opts.expand) parts.push('expand=true')
  if (opts.photoMeta?.iso?.trim())
    parts.push(`photo-iso=${opts.photoMeta.iso.trim()}`)
  if (opts.photoMeta?.aperture?.trim())
    parts.push(`photo-aperture=${opts.photoMeta.aperture.trim()}`)
  if (opts.photoMeta?.exposure?.trim())
    parts.push(`photo-exposure=${opts.photoMeta.exposure.trim()}`)
  if (opts.photoMeta?.focalLength?.trim())
    parts.push(`photo-focal-length=${opts.photoMeta.focalLength.trim()}`)
  if (opts.photoMeta?.panoramicCount?.trim())
    parts.push(`photo-panoramic-count=${opts.photoMeta.panoramicCount.trim()}`)
  const params = parts.join('&')
  return `\n\n![${params}](${opts.url})\n\n`
}

export function ImageInsertModal({
  isOpen,
  onInsert,
  onCancel,
  pickerOpen,
  onRequestImagePick,
  initialValues,
}: ImageInsertModalProps) {
  const [selectedImage, setSelectedImage] = useState<CloudinaryImage | null>(
    initialValues
      ? ({ url: initialValues.url } as unknown as CloudinaryImage)
      : null,
  )
  const [altText, setAltText] = useState(initialValues?.altText ?? '')
  const [caption, setCaption] = useState(initialValues?.caption ?? '')
  const [captionPos, setCaptionPos] = useState<'top' | 'bottom'>(
    initialValues?.captionPos ?? 'bottom',
  )
  const [size, setSize] = useState<Size>(initialValues?.size ?? 'full')
  const [align, setAlign] = useState<Align>(initialValues?.align ?? 'none')
  const [expand, setExpand] = useState(initialValues?.expand ?? false)
  const [photoMetaEnabled, setPhotoMetaEnabled] = useState(
    !!(
      initialValues?.photoMeta?.iso ||
      initialValues?.photoMeta?.aperture ||
      initialValues?.photoMeta?.exposure ||
      initialValues?.photoMeta?.focalLength ||
      initialValues?.photoMeta?.panoramicCount
    ),
  )
  const [photoIso, setPhotoIso] = useState(initialValues?.photoMeta?.iso ?? '')
  const [photoExposure, setPhotoExposure] = useState(
    initialValues?.photoMeta?.exposure ?? '',
  )
  const [photoAperture, setPhotoAperture] = useState(
    initialValues?.photoMeta?.aperture ?? '',
  )
  const [photoFocalLength, setPhotoFocalLength] = useState(
    initialValues?.photoMeta?.focalLength?.replace(/mm$/, '') ?? '',
  )
  const [photoPanoramicCount, setPhotoPanoramicCount] = useState(
    initialValues?.photoMeta?.panoramicCount ?? '',
  )

  function handleInsert() {
    /* istanbul ignore next */
    if (!selectedImage) return
    const markdown = buildImageMarkdown({
      url: selectedImage.url,
      altText,
      caption,
      captionPos,
      size,
      align,
      expand,
      photoMeta: photoMetaEnabled
        ? {
            iso: photoIso,
            exposure: photoExposure,
            aperture: photoAperture,
            focalLength: photoFocalLength ? `${photoFocalLength}mm` : '',
            panoramicCount: photoPanoramicCount,
          }
        : undefined,
    })
    onInsert(markdown)
    setSelectedImage(null)
    setAltText('')
    setCaption('')
    setCaptionPos('bottom')
    setSize('full')
    setAlign('none')
    setExpand(false)
    setPhotoMetaEnabled(false)
    setPhotoIso('')
    setPhotoExposure('')
    setPhotoAperture('')
    setPhotoFocalLength('')
    setPhotoPanoramicCount('')
  }

  const preview = selectedImage
    ? buildImageMarkdown({
        url: selectedImage.url,
        altText,
        caption,
        captionPos,
        size,
        align,
        expand,
        photoMeta: photoMetaEnabled
          ? {
              iso: photoIso,
              exposure: photoExposure,
              aperture: photoAperture,
              focalLength: photoFocalLength ? `${photoFocalLength}mm` : '',
              panoramicCount: photoPanoramicCount,
            }
          : undefined,
      }).trim()
    : null

  return (
    <StyledImageInsertModal
      show={isOpen}
      onHide={onCancel}
      enforceFocus={!pickerOpen}
      renderBackdrop={
        pickerOpen
          ? undefined
          : (props: RenderModalBackdropProps) => <StyledBackdrop {...props} />
      }
      aria-labelledby="image-insert-modal"
    >
      <StyledModalContent>
        <StyledLabel>Image</StyledLabel>
        <StyledImageSection>
          {selectedImage ? (
            <StyledImageThumb
              src={selectedImage.url}
              alt="Selected"
              data-testid="selected-image-thumb"
            />
          ) : (
            <StyledImagePlaceholder>No image selected</StyledImagePlaceholder>
          )}
          <StyledPickButton
            type="button"
            onClick={() => onRequestImagePick((img) => setSelectedImage(img))}
            data-testid="pick-image-button"
          >
            {selectedImage ? 'Change' : 'Pick image'}
          </StyledPickButton>
        </StyledImageSection>

        <StyledLabel htmlFor="img-alt">Alt text</StyledLabel>
        <StyledInput
          id="img-alt"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe the image for accessibility"
          data-testid="alt-text-input"
        />

        <StyledLabel htmlFor="img-caption">Caption</StyledLabel>
        <StyledInput
          id="img-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Optional caption"
          data-testid="caption-input"
        />

        <StyledCheckboxRow>
          <label>
            <input
              type="checkbox"
              checked={captionPos === 'top'}
              onChange={(e) =>
                setCaptionPos(e.target.checked ? 'top' : 'bottom')
              }
              data-testid="caption-pos-checkbox"
            />
            Caption above image
          </label>
        </StyledCheckboxRow>

        <StyledLabel>Size</StyledLabel>
        <StyledSegmentRow>
          {(['full', 'small', 'medium'] as Size[]).map((s) => (
            <StyledSegmentButton
              key={s}
              type="button"
              $active={size === s}
              onClick={() => setSize(s)}
              data-testid={`size-${s}`}
            >
              {s}
            </StyledSegmentButton>
          ))}
        </StyledSegmentRow>

        <StyledLabel>Align</StyledLabel>
        <StyledSegmentRow>
          {(['none', 'left', 'right'] as Align[]).map((a) => (
            <StyledSegmentButton
              key={a}
              type="button"
              $active={align === a}
              onClick={() => setAlign(a)}
              data-testid={`align-${a}`}
            >
              {a}
            </StyledSegmentButton>
          ))}
        </StyledSegmentRow>

        <StyledCheckboxRow>
          <label>
            <input
              type="checkbox"
              checked={expand}
              onChange={(e) => setExpand(e.target.checked)}
              data-testid="expand-checkbox"
            />
            Expand on click
          </label>
        </StyledCheckboxRow>

        <StyledCheckboxRow>
          <label>
            <input
              type="checkbox"
              checked={photoMetaEnabled}
              onChange={(e) => setPhotoMetaEnabled(e.target.checked)}
              data-testid="photo-meta-checkbox"
            />
            Photo metadata
          </label>
        </StyledCheckboxRow>

        {photoMetaEnabled && (
          <StyledPhotoMetaInputRow>
            <StyledPhotoMetaField>
              <StyledLabel htmlFor="photo-iso">ISO</StyledLabel>
              <Select
                id="photo-iso"
                value={photoIso}
                onChange={setPhotoIso}
                options={ISO_OPTIONS}
                isSearchable
                isClearable
                placeholder="e.g. 400"
                data-testid="photo-iso-input"
              />
            </StyledPhotoMetaField>
            <StyledPhotoMetaField>
              <StyledLabel htmlFor="photo-aperture">Aperture</StyledLabel>
              <Select
                id="photo-aperture"
                value={photoAperture}
                onChange={setPhotoAperture}
                options={APERTURE_OPTIONS}
                isSearchable
                isClearable
                placeholder="e.g. f/2.8"
                data-testid="photo-aperture-input"
              />
            </StyledPhotoMetaField>
            <StyledPhotoMetaField>
              <StyledLabel htmlFor="photo-exposure">Shutter speed</StyledLabel>
              <Select
                id="photo-exposure"
                value={photoExposure}
                onChange={setPhotoExposure}
                options={SHUTTER_SPEED_OPTIONS}
                isSearchable
                isClearable
                placeholder="e.g. 1/250"
                data-testid="photo-exposure-input"
              />
            </StyledPhotoMetaField>
            <StyledPhotoMetaField>
              <StyledLabel htmlFor="photo-focal-length">
                Focal length
              </StyledLabel>
              <StyledInput
                id="photo-focal-length"
                type="number"
                min="1"
                value={photoFocalLength}
                onChange={(e) => setPhotoFocalLength(e.target.value)}
                placeholder="e.g. 50"
                data-testid="photo-focal-length-input"
              />
            </StyledPhotoMetaField>
            <StyledPhotoMetaField>
              <StyledLabel htmlFor="photo-panoramic-count">
                Panoramic shots
              </StyledLabel>
              <StyledInput
                id="photo-panoramic-count"
                value={photoPanoramicCount}
                onChange={(e) => setPhotoPanoramicCount(e.target.value)}
                placeholder="e.g. 12"
                data-testid="photo-panoramic-count-input"
              />
            </StyledPhotoMetaField>
          </StyledPhotoMetaInputRow>
        )}

        {preview && (
          <StyledPreview data-testid="image-preview">{preview}</StyledPreview>
        )}

        <StyledButtons>
          <StyledCancelButton
            onClick={onCancel}
            data-testid="image-modal-cancel"
          >
            Cancel
          </StyledCancelButton>
          <StyledInsertButton
            onClick={handleInsert}
            disabled={!selectedImage}
            data-testid="image-modal-insert"
          >
            Insert
          </StyledInsertButton>
        </StyledButtons>
      </StyledModalContent>
    </StyledImageInsertModal>
  )
}
