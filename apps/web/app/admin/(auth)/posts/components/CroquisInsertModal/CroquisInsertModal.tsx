'use client'

import { useState } from 'react'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { Select } from '@sdlgr/select'

import { CroquisMap } from '@web/components/Croquis'
import {
  isDrawableWaypoint,
  parseCanyonWaypointsText,
  serializeCanyonWaypoints,
  toCroquisObstacles,
} from '@web/lib/cards'
import type { CanyonWaypoint, Lang } from '@web/lib/cards'
import {
  axiosErrorMessage,
  fetchCanyonWaypoints,
} from '@web/lib/cards/gpxImport'
import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import {
  StyledAddRow,
  StyledMappingName,
  StyledMappingRow,
  StyledMappingThumb,
  StyledMappingsList,
  StyledPickImageButton,
  StyledRemoveButton,
  StyledWaypointImagesSection,
} from '../GpxMapModal/GpxMapModal.styles'
import { ImagePicker } from '../ImagePicker'
import type { ParsedCroquis } from '../PostEditor/parseEmbedBlock'
import {
  StyledBackdrop,
  StyledButtons,
  StyledCancelButton,
  StyledCroquisModal,
  StyledError,
  StyledGpxRow,
  StyledInput,
  StyledInsertButton,
  StyledModalContent,
  StyledParseButton,
  StyledPreviewBox,
  StyledSectionLabel,
  StyledTextarea,
  StyledThumbChip,
  StyledThumbGroup,
} from './CroquisInsertModal.styles'

interface IndexedWaypoint {
  wp: CanyonWaypoint
  index: number
}

export interface CroquisInsertModalProps {
  isOpen: boolean
  onInsert: (markdown: string) => void
  onCancel: () => void
  initialValues?: ParsedCroquis | null
  lang: Lang
}

/**
 * Builds a `croquis` block for the post: the waypoint text (typed or imported
 * from a GPX url) plus a photo picked per waypoint (shown on hover). The photo
 * rides along in each waypoint's `! … ; img=…` directive.
 */
export function CroquisInsertModal({
  isOpen,
  onInsert,
  onCancel,
  initialValues,
  lang,
}: CroquisInsertModalProps) {
  const [text, setText] = useState(initialValues?.text ?? '')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickingFor, setPickingFor] = useState<number | null>(null)
  const [pending, setPending] = useState<number | undefined>(undefined)

  const waypoints = parseCanyonWaypointsText(text)
  const obstacles = toCroquisObstacles(waypoints)

  // Only waypoints actually drawn in the croquis can carry hover images.
  const drawable: IndexedWaypoint[] = waypoints
    .map((wp, index) => ({ wp, index }))
    .filter(({ wp }) => isDrawableWaypoint(wp.categories))
  const withPhotos = drawable
    .map(({ wp, index }) => ({ wp, index, photos: wp.photos ?? [] }))
    .filter(({ photos }) => photos.length > 0)

  function writeWaypoints(next: CanyonWaypoint[]) {
    setText(serializeCanyonWaypoints(next))
  }

  function addPhoto(index: number, photo: string) {
    writeWaypoints(
      waypoints.map((w, i) =>
        i === index ? { ...w, photos: [...(w.photos ?? []), photo] } : w,
      ),
    )
  }

  function removePhoto(index: number, imageIndex: number) {
    writeWaypoints(
      waypoints.map((w, i) => {
        if (i !== index) return w
        // Only ever called for a waypoint that has photos (from the UI list).
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const photos = w.photos!.filter((_, j) => j !== imageIndex)
        if (photos.length) return { ...w, photos }
        const next = { ...w }
        delete next.photos
        return next
      }),
    )
  }

  async function handleParse() {
    setLoading(true)
    setError(null)
    try {
      const wpts = await fetchCanyonWaypoints(url)
      if (!wpts || wpts.length === 0) {
        setError('Could not parse GPX file')
        return
      }
      setText(serializeCanyonWaypoints(wpts))
    } catch (err) {
      setError(axiosErrorMessage(err, 'Could not parse GPX file'))
    } finally {
      setLoading(false)
    }
  }

  function pickForPending() {
    /* istanbul ignore next */
    if (pending === undefined) return
    setPickingFor(pending)
  }

  function handleImagePick(image: CloudinaryImage) {
    /* istanbul ignore next */
    if (pickingFor === null) return
    addPhoto(pickingFor, image.url)
    setPickingFor(null)
  }

  function handleInsert() {
    /* istanbul ignore next */
    if (obstacles.length === 0) return
    onInsert(`\n\n\`\`\`croquis\n${text.trim()}\n\`\`\`\n\n`)
    setText('')
    setUrl('')
    setError(null)
    setPickingFor(null)
  }

  return (
    <>
      <StyledCroquisModal
        show={isOpen}
        onHide={onCancel}
        renderBackdrop={
          pickingFor !== null
            ? undefined
            : (props: RenderModalBackdropProps) => <StyledBackdrop {...props} />
        }
        aria-labelledby="croquis-insert-modal"
      >
        <StyledModalContent data-testid="croquis-modal">
          <StyledSectionLabel>GPX url (optional)</StyledSectionLabel>
          <StyledGpxRow>
            <StyledInput
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (error) setError(null)
              }}
              placeholder="https://your-cdn.com/canyon.gpx"
              data-testid="croquis-modal-gpx"
            />
            <StyledParseButton
              type="button"
              onClick={() => void handleParse()}
              disabled={!url || loading}
              data-testid="croquis-modal-parse"
            >
              {loading ? 'Parsing…' : 'Parse'}
            </StyledParseButton>
          </StyledGpxRow>
          {error && (
            <StyledError data-testid="croquis-modal-error">{error}</StyledError>
          )}

          <StyledSectionLabel>Waypoints</StyledSectionLabel>
          <StyledTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              'salto: Jump 2m - 42.6092 0.1412\n- Bend on landing\n---\nrapel: Rappel 10m - 42.6056 0.1294'
            }
            data-testid="croquis-modal-text"
          />

          {drawable.length > 0 && (
            <StyledWaypointImagesSection data-testid="croquis-modal-waypoints">
              <StyledSectionLabel>Waypoint images</StyledSectionLabel>

              {withPhotos.length > 0 && (
                <StyledMappingsList>
                  {withPhotos.map(({ wp, index, photos }) => (
                    <StyledMappingRow
                      key={index}
                      data-testid={`croquis-wp-row-${index}`}
                    >
                      <StyledMappingName>
                        {wp.categories.join('/')}: {wp.title}
                      </StyledMappingName>
                      <StyledThumbGroup>
                        {photos.map((photo, imageIndex) => (
                          <StyledThumbChip key={imageIndex}>
                            <StyledMappingThumb
                              src={photo}
                              alt={wp.title}
                              data-testid={`croquis-wp-thumb-${index}-${imageIndex}`}
                            />
                            <StyledRemoveButton
                              type="button"
                              aria-label={`Remove image ${imageIndex + 1} for ${wp.title}`}
                              onClick={() => removePhoto(index, imageIndex)}
                              data-testid={`croquis-wp-remove-${index}-${imageIndex}`}
                            >
                              ×
                            </StyledRemoveButton>
                          </StyledThumbChip>
                        ))}
                      </StyledThumbGroup>
                    </StyledMappingRow>
                  ))}
                </StyledMappingsList>
              )}

              <StyledAddRow>
                <Select
                  value={pending !== undefined ? String(pending) : ''}
                  onChange={(v) =>
                    setPending(
                      v !== ''
                        ? parseInt(v, 10)
                        : /* istanbul ignore next */ undefined,
                    )
                  }
                  options={drawable.map(({ wp, index }) => ({
                    value: String(index),
                    label: `${wp.categories.join('/')}: ${wp.title}`,
                  }))}
                  isSearchable
                  maxMenuHeight={160}
                  data-testid="croquis-wp-select"
                />
                <StyledPickImageButton
                  type="button"
                  disabled={pending === undefined}
                  onClick={pickForPending}
                  data-testid="croquis-wp-pick"
                >
                  Pick image
                </StyledPickImageButton>
              </StyledAddRow>
            </StyledWaypointImagesSection>
          )}

          {obstacles.length > 0 && (
            <StyledPreviewBox data-testid="croquis-modal-preview">
              <CroquisMap obstacles={obstacles} lang={lang} />
            </StyledPreviewBox>
          )}

          <StyledButtons>
            <StyledCancelButton
              onClick={onCancel}
              data-testid="croquis-modal-cancel"
            >
              Cancel
            </StyledCancelButton>
            <StyledInsertButton
              onClick={handleInsert}
              disabled={obstacles.length === 0}
              data-testid="croquis-modal-insert"
            >
              Insert
            </StyledInsertButton>
          </StyledButtons>
        </StyledModalContent>
      </StyledCroquisModal>

      <ImagePicker
        open={pickingFor !== null}
        onClose={() => setPickingFor(null)}
        onPick={handleImagePick}
        zIndex={1100}
      />
    </>
  )
}
