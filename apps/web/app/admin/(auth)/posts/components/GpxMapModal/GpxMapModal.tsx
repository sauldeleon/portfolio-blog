'use client'

import { useEffect, useState } from 'react'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { Select } from '@sdlgr/select'

import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import { ImagePicker } from '../ImagePicker'
import {
  StyledAddRow,
  StyledAddTrackButton,
  StyledBackdrop,
  StyledButtons,
  StyledCancelButton,
  StyledCheckboxRow,
  StyledColorChip,
  StyledColorChips,
  StyledFetchStatus,
  StyledGpxMapModal,
  StyledInput,
  StyledInsertButton,
  StyledLabel,
  StyledMappingName,
  StyledMappingRow,
  StyledMappingThumb,
  StyledMappingsList,
  StyledModalContent,
  StyledPickImageButton,
  StyledPreview,
  StyledRemoveButton,
  StyledRemoveTrackButton,
  StyledSectionLabel,
  StyledTrackInputsRow,
  StyledTrackList,
  StyledTrackRow,
  StyledWaypointImagesSection,
} from './GpxMapModal.styles'

export interface GpxMapModalProps {
  isOpen: boolean
  onInsert: (markdown: string) => void
  onCancel: () => void
}

interface WaypointMapping {
  name: string
  imageUrl: string
}

interface TrackInput {
  url: string
  name: string
  color: string
}

const TRACK_COLORS = [
  '#e63946',
  '#3a86ff',
  '#06d6a0',
  '#fb8500',
  '#8338ec',
  '#ff006e',
  '#ffd166',
  '#118ab2',
]

function initTrack(): TrackInput {
  return { url: '', name: '', color: '' }
}

function parseWaypointNames(text: string): string[] {
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  return Array.from(doc.querySelectorAll('wpt'))
    .map((wpt) => wpt.querySelector('name')?.textContent ?? '')
    .filter(Boolean)
}

function buildTrackLine(track: TrackInput): string {
  const url = track.url.trim()
  const name = track.name.trim()
  const color = track.color
  if (!name && !color) return `track:${url}`
  if (!color) return `track:${url} | ${name}`
  if (!name) return `track:${url} || ${color}`
  return `track:${url} | ${name} | ${color}`
}

export function GpxMapModal({ isOpen, onInsert, onCancel }: GpxMapModalProps) {
  const [tracks, setTracks] = useState<TrackInput[]>([initTrack()])
  const [showWaypoints, setShowWaypoints] = useState(false)
  const [allowDownload, setAllowDownload] = useState(false)
  const [fetchedWaypoints, setFetchedWaypoints] = useState<string[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [mappings, setMappings] = useState<WaypointMapping[]>([])
  const [pendingWaypoint, setPendingWaypoint] = useState('')
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)

  const trackUrlsKey = tracks
    .filter((t) => t.url.trim())
    .map((t) => t.url.trim())
    .join(',')

  useEffect(() => {
    const mappedSet = new Set(mappings.map((m) => m.name))
    const available = fetchedWaypoints.filter((n) => !mappedSet.has(n))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingWaypoint((prev) =>
      available.includes(prev) ? prev : (available[0] ?? ''),
    )
  }, [fetchedWaypoints, mappings])

  useEffect(() => {
    const trimmedUrls = trackUrlsKey.split(',').filter(Boolean)
    if (!showWaypoints || trimmedUrls.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFetchedWaypoints([])
      setFetchError(false)
      setFetchLoading(false)
      return
    }

    setFetchLoading(true)
    setFetchError(false)

    const controller = new AbortController()
    const timer = setTimeout(() => {
      Promise.all(
        trimmedUrls.map((url) =>
          fetch(url, { signal: controller.signal }).then((r) => r.text()),
        ),
      )
        .then((texts) => {
          const allNames = texts.flatMap((text) => parseWaypointNames(text))
          setFetchedWaypoints([...new Set(allNames)])
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setFetchError(true)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setFetchLoading(false)
          }
        })
    }, 600)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trackUrlsKey, showWaypoints])

  function addTrack() {
    setTracks((prev) => {
      const usedColors = new Set(
        prev.map((t, i) => t.color || TRACK_COLORS[i % TRACK_COLORS.length]),
      )
      const nextColor =
        TRACK_COLORS.find((c) => !usedColors.has(c)) ??
        /* istanbul ignore next */
        TRACK_COLORS[prev.length % TRACK_COLORS.length]
      return [...prev, { ...initTrack(), color: nextColor }]
    })
  }

  function removeTrack(index: number) {
    setTracks((prev) => prev.filter((_, i) => i !== index))
  }

  function updateTrack(index: number, patch: Partial<TrackInput>) {
    setTracks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    )
  }

  const mappedNames = new Set(mappings.map((m) => m.name))
  const availableWaypoints = fetchedWaypoints.filter((n) => !mappedNames.has(n))

  const flags = [
    showWaypoints && 'showWaypoints',
    allowDownload && 'allowDownload',
  ]
    .filter(Boolean)
    .join(' ')
  const lang = flags ? `gpx ${flags}` : 'gpx'
  const imageLines = mappings.map((m) => `${m.name}=${m.imageUrl}`)

  const previewTrackLines = tracks.map((t) => {
    const url = t.url.trim() || 'https://...'
    const name = t.name.trim()
    const color = t.color
    if (!name && !color) return `track:${url}`
    if (!color) return `track:${url} | ${name}`
    if (!name) return `track:${url} || ${color}`
    return `track:${url} | ${name} | ${color}`
  })
  const previewContent = [...previewTrackLines, ...imageLines].join('\n')
  const preview = `\`\`\`${lang}\n${previewContent}\n\`\`\``

  const hasAnyUrl = tracks.some((t) => t.url.trim())

  function handleInsert() {
    /* istanbul ignore next */
    if (!hasAnyUrl) return
    const trackLines = tracks.filter((t) => t.url.trim()).map(buildTrackLine)
    const content = [...trackLines, ...imageLines].join('\n')
    const markdown = `\n\n\`\`\`${lang}\n${content}\n\`\`\`\n\n`
    onInsert(markdown)
    setTracks([initTrack()])
    setShowWaypoints(false)
    setAllowDownload(false)
    setFetchedWaypoints([])
    setFetchLoading(false)
    setFetchError(false)
    setMappings([])
    setPendingWaypoint('')
    setIsImagePickerOpen(false)
  }

  function handleImagePick(image: CloudinaryImage) {
    /* istanbul ignore next */
    if (!pendingWaypoint) return
    setMappings((prev) => [
      ...prev,
      { name: pendingWaypoint, imageUrl: image.url },
    ])
    setIsImagePickerOpen(false)
  }

  function removeMapping(name: string) {
    setMappings((prev) => prev.filter((m) => m.name !== name))
  }

  const showWaypointSection =
    showWaypoints && (fetchLoading || fetchError || fetchedWaypoints.length > 0)

  return (
    <>
      <StyledGpxMapModal
        show={isOpen}
        onHide={onCancel}
        renderBackdrop={
          isImagePickerOpen
            ? undefined
            : (props: RenderModalBackdropProps) => <StyledBackdrop {...props} />
        }
        aria-labelledby="gpx-map-modal"
      >
        <StyledModalContent>
          <StyledLabel>Tracks</StyledLabel>
          <StyledTrackList>
            {tracks.map((track, index) => (
              <StyledTrackRow key={index}>
                <StyledTrackInputsRow>
                  <StyledInput
                    type="url"
                    value={track.url}
                    onChange={(e) =>
                      updateTrack(index, { url: e.target.value })
                    }
                    placeholder="https://your-cdn.com/routes/track.gpx"
                    data-testid={`gpx-track-url-${index}`}
                  />
                  <StyledInput
                    type="text"
                    value={track.name}
                    onChange={(e) =>
                      updateTrack(index, { name: e.target.value })
                    }
                    placeholder="Track name (optional)"
                    data-testid={`gpx-track-name-${index}`}
                  />
                  {tracks.length > 1 && (
                    <StyledRemoveTrackButton
                      type="button"
                      aria-label={`Remove track ${index + 1}`}
                      onClick={() => removeTrack(index)}
                      data-testid={`gpx-track-remove-${index}`}
                    >
                      ×
                    </StyledRemoveTrackButton>
                  )}
                </StyledTrackInputsRow>
                <StyledColorChips>
                  {TRACK_COLORS.map((color) => (
                    <StyledColorChip
                      key={color}
                      type="button"
                      $color={color}
                      $selected={track.color === color}
                      aria-pressed={track.color === color}
                      aria-label={color}
                      onClick={() =>
                        updateTrack(index, {
                          color: track.color === color ? '' : color,
                        })
                      }
                      data-testid={`gpx-track-color-${index}-${color.slice(1)}`}
                    />
                  ))}
                </StyledColorChips>
              </StyledTrackRow>
            ))}
          </StyledTrackList>

          <StyledAddTrackButton
            type="button"
            onClick={addTrack}
            data-testid="gpx-add-track"
          >
            + Add track
          </StyledAddTrackButton>

          <StyledCheckboxRow>
            <label>
              <input
                type="checkbox"
                checked={showWaypoints}
                onChange={(e) => setShowWaypoints(e.target.checked)}
                data-testid="gpx-show-waypoints"
              />
              Show waypoints table
            </label>
          </StyledCheckboxRow>
          <StyledCheckboxRow>
            <label>
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                data-testid="gpx-allow-download"
              />
              Allow download
            </label>
          </StyledCheckboxRow>

          {showWaypointSection && (
            <StyledWaypointImagesSection data-testid="waypoint-images-section">
              <StyledSectionLabel>Waypoint images</StyledSectionLabel>

              {fetchLoading && (
                <StyledFetchStatus data-testid="fetch-loading">
                  Fetching waypoints…
                </StyledFetchStatus>
              )}

              {fetchError && (
                <StyledFetchStatus data-testid="fetch-error">
                  Failed to load waypoints
                </StyledFetchStatus>
              )}

              {mappings.length > 0 && (
                <StyledMappingsList>
                  {mappings.map((m) => (
                    <StyledMappingRow key={m.name} data-testid="mapping-row">
                      <StyledMappingThumb
                        src={m.imageUrl}
                        alt={m.name}
                        data-testid="mapping-thumb"
                      />
                      <StyledMappingName data-testid="mapping-name">
                        {m.name}
                      </StyledMappingName>
                      <StyledRemoveButton
                        type="button"
                        aria-label={`Remove image for ${m.name}`}
                        onClick={() => removeMapping(m.name)}
                        data-testid="mapping-remove"
                      >
                        ×
                      </StyledRemoveButton>
                    </StyledMappingRow>
                  ))}
                </StyledMappingsList>
              )}

              {availableWaypoints.length > 0 && (
                <StyledAddRow>
                  <Select
                    value={pendingWaypoint}
                    onChange={setPendingWaypoint}
                    options={availableWaypoints.map((name) => ({
                      value: name,
                      label: name,
                    }))}
                    isSearchable
                    maxMenuHeight={160}
                    data-testid="waypoint-select"
                  />
                  <StyledPickImageButton
                    type="button"
                    disabled={!pendingWaypoint}
                    onClick={() => setIsImagePickerOpen(true)}
                    data-testid="pick-image-button"
                  >
                    Pick image
                  </StyledPickImageButton>
                </StyledAddRow>
              )}
            </StyledWaypointImagesSection>
          )}

          <StyledPreview data-testid="gpx-preview">{preview}</StyledPreview>
          <StyledButtons>
            <StyledCancelButton
              onClick={onCancel}
              data-testid="gpx-modal-cancel"
            >
              Cancel
            </StyledCancelButton>
            <StyledInsertButton
              onClick={handleInsert}
              disabled={!hasAnyUrl}
              data-testid="gpx-modal-insert"
            >
              Insert
            </StyledInsertButton>
          </StyledButtons>
        </StyledModalContent>
      </StyledGpxMapModal>

      <ImagePicker
        open={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onPick={handleImagePick}
        zIndex={1100}
      />
    </>
  )
}
