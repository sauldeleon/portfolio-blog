'use client'

import { useEffect, useState } from 'react'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { Select } from '@sdlgr/select'

import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import { ImagePicker } from '../ImagePicker'
import type { ParsedGpx } from '../PostEditor/parseEmbedBlock'
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
  initialValues?: ParsedGpx | null
}

interface WaypointMapping {
  name: string
  imageUrl: string
}

interface TrackInput {
  url: string
  name: string
  color: string
  allowDownload: boolean
  showWaypoints: boolean
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
  return {
    url: '',
    name: '',
    color: '',
    allowDownload: false,
    showWaypoints: false,
  }
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
  const flags = [
    ...(track.allowDownload ? ['download'] : []),
    ...(track.showWaypoints ? ['showWaypoints'] : []),
  ].join(' ')

  if (!name && !color && !flags) return `track:${url}`
  if (!color && !flags) return `track:${url} | ${name}`
  if (!name && !flags) return `track:${url} || ${color}`
  if (!flags) return `track:${url} | ${name} | ${color}`
  if (!name && !color) return `track:${url} ||| ${flags}`
  if (!color) return `track:${url} | ${name} || ${flags}`
  if (!name) return `track:${url} || ${color} | ${flags}`
  return `track:${url} | ${name} | ${color} | ${flags}`
}

function shiftDown<T>(
  rec: Record<number, T>,
  removedIdx: number,
): Record<number, T> {
  const next: Record<number, T> = {}
  Object.entries(rec).forEach(([k, v]) => {
    const i = parseInt(k, 10)
    if (i < removedIdx) next[i] = v
    else if (i > removedIdx) next[i - 1] = v
  })
  return next
}

export function GpxMapModal({
  isOpen,
  onInsert,
  onCancel,
  initialValues,
}: GpxMapModalProps) {
  const [tracks, setTracks] = useState<TrackInput[]>(
    initialValues?.tracks.length ? initialValues.tracks : [initTrack()],
  )
  const [fetchedWaypointsByTrack, setFetchedWaypointsByTrack] = useState<
    Record<number, string[]>
  >({})
  const [fetchLoadingByTrack, setFetchLoadingByTrack] = useState<
    Record<number, boolean>
  >({})
  const [fetchErrorByTrack, setFetchErrorByTrack] = useState<
    Record<number, boolean>
  >({})
  const [mappingsByTrack, setMappingsByTrack] = useState<
    Record<number, WaypointMapping[]>
  >(initialValues?.mappingsByTrack ?? {})
  const [pendingWaypointByTrack, setPendingWaypointByTrack] = useState<
    Record<number, string>
  >({})
  const [isImagePickerOpenForTrack, setIsImagePickerOpenForTrack] = useState<
    number | null
  >(null)

  const trackUrlsKey = tracks
    .filter((t) => t.url.trim())
    .map((t) => `${t.url.trim()}:${t.showWaypoints}`)
    .join(',')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingWaypointByTrack((prev) => {
      const next = { ...prev }
      tracks.forEach((_, i) => {
        const available = (fetchedWaypointsByTrack[i] ?? []).filter(
          (n) => !(mappingsByTrack[i] ?? []).some((m) => m.name === n),
        )
        if (!available.includes(next[i] ?? '')) {
          next[i] = available[0] ?? ''
        }
      })
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedWaypointsByTrack, mappingsByTrack])

  useEffect(() => {
    const urlEntries = tracks
      .map((t, i) => ({ url: t.url.trim(), i, showWaypoints: t.showWaypoints }))
      .filter(({ url, showWaypoints }) => url && showWaypoints)

    if (urlEntries.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFetchedWaypointsByTrack({})

      setFetchErrorByTrack({})

      setFetchLoadingByTrack({})
      return
    }

    const initialLoading = Object.fromEntries(
      urlEntries.map(({ i }) => [i, true]),
    )
    const initialError = Object.fromEntries(
      urlEntries.map(({ i }) => [i, false]),
    )
    setFetchLoadingByTrack(initialLoading)
    setFetchErrorByTrack(initialError)
    setFetchedWaypointsByTrack({})

    const controllers: AbortController[] = []
    const timers: ReturnType<typeof setTimeout>[] = []

    urlEntries.forEach(({ url, i }) => {
      const controller = new AbortController()
      controllers.push(controller)

      const timer = setTimeout(() => {
        fetch(url, { signal: controller.signal })
          .then((r) => r.text())
          .then((text) => {
            setFetchedWaypointsByTrack((prev) => ({
              ...prev,
              [i]: parseWaypointNames(text),
            }))
          })
          .catch(() => {
            if (!controller.signal.aborted) {
              setFetchErrorByTrack((prev) => ({ ...prev, [i]: true }))
            }
          })
          .finally(() => {
            if (!controller.signal.aborted) {
              setFetchLoadingByTrack((prev) => ({ ...prev, [i]: false }))
            }
          })
      }, 600)

      timers.push(timer)
    })

    return () => {
      timers.forEach((t) => clearTimeout(t))
      controllers.forEach((c) => c.abort())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackUrlsKey])

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
    setFetchedWaypointsByTrack((prev) => shiftDown(prev, index))
    setFetchLoadingByTrack((prev) => shiftDown(prev, index))
    setFetchErrorByTrack((prev) => shiftDown(prev, index))
    setMappingsByTrack((prev) => shiftDown(prev, index))
    setPendingWaypointByTrack((prev) => shiftDown(prev, index))
  }

  function updateTrack(index: number, patch: Partial<TrackInput>) {
    setTracks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    )
  }

  function handleInsert() {
    /* istanbul ignore next */
    if (!hasAnyUrl) return

    const activeEntries = tracks
      .map((t, origIdx) => ({ t, origIdx }))
      .filter(({ t }) => t.url.trim())

    const trackLines = activeEntries.map(({ t }) => buildTrackLine(t))

    const imageLines: string[] = []
    activeEntries.forEach(({ origIdx }, outputIdx) => {
      const ms = mappingsByTrack[origIdx] ?? []
      ms.forEach((m) => {
        imageLines.push(`${outputIdx}:${m.name}=${m.imageUrl}`)
      })
    })

    const content = [...trackLines, ...imageLines].join('\n')
    const markdown = `\n\n\`\`\`gpx\n${content}\n\`\`\`\n\n`
    onInsert(markdown)

    setTracks([initTrack()])
    setFetchedWaypointsByTrack({})
    setFetchLoadingByTrack({})
    setFetchErrorByTrack({})
    setMappingsByTrack({})
    setPendingWaypointByTrack({})
    setIsImagePickerOpenForTrack(null)
  }

  function handleImagePick(image: CloudinaryImage) {
    /* istanbul ignore next */
    if (
      isImagePickerOpenForTrack === null ||
      !pendingWaypointByTrack[isImagePickerOpenForTrack]
    )
      return
    const trackIdx = isImagePickerOpenForTrack
    const waypointName = pendingWaypointByTrack[trackIdx]
    setMappingsByTrack((prev) => ({
      ...prev,
      [trackIdx]: [
        ...(prev[trackIdx] ?? []),
        { name: waypointName, imageUrl: image.url },
      ],
    }))
    setIsImagePickerOpenForTrack(null)
  }

  function removeMapping(trackIdx: number, name: string) {
    setMappingsByTrack((prev) => {
      const existing = prev[trackIdx] ?? /* istanbul ignore next */ []
      return { ...prev, [trackIdx]: existing.filter((m) => m.name !== name) }
    })
  }

  const hasAnyUrl = tracks.some((t) => t.url.trim())

  const previewTrackLines = tracks.map((t) =>
    buildTrackLine({ ...t, url: t.url.trim() || 'https://...' }),
  )
  const previewImageLines: string[] = []
  tracks.forEach((_, trackIdx) => {
    const ms = mappingsByTrack[trackIdx] ?? []
    ms.forEach((m) => {
      previewImageLines.push(`${trackIdx}:${m.name}=${m.imageUrl}`)
    })
  })
  const previewContent = [...previewTrackLines, ...previewImageLines].join('\n')
  const preview = `\`\`\`gpx\n${previewContent}\n\`\`\``

  return (
    <>
      <StyledGpxMapModal
        show={isOpen}
        onHide={onCancel}
        renderBackdrop={
          isImagePickerOpenForTrack !== null
            ? undefined
            : (props: RenderModalBackdropProps) => <StyledBackdrop {...props} />
        }
        aria-labelledby="gpx-map-modal"
      >
        <StyledModalContent>
          <StyledLabel>Tracks</StyledLabel>
          <StyledTrackList>
            {tracks.map((track, index) => {
              const effectiveOtherColors = new Set(
                tracks
                  .map((t, i) =>
                    i !== index
                      ? t.color || TRACK_COLORS[i % TRACK_COLORS.length]
                      : null,
                  )
                  .filter(Boolean) as string[],
              )
              const loading = fetchLoadingByTrack[index]
              const error = fetchErrorByTrack[index]
              const fetched = fetchedWaypointsByTrack[index] ?? []
              const trackMappings = mappingsByTrack[index] ?? []
              const pendingWaypoint =
                pendingWaypointByTrack[index] ?? /* istanbul ignore next */ ''
              const available = fetched.filter(
                (n) => !trackMappings.some((m) => m.name === n),
              )
              const showWaypointSection =
                track.showWaypoints && (loading || error || fetched.length > 0)
              return (
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
                        disabled={effectiveOtherColors.has(color)}
                        onClick={() =>
                          updateTrack(index, {
                            color: track.color === color ? '' : color,
                          })
                        }
                        data-testid={`gpx-track-color-${index}-${color.slice(1)}`}
                      />
                    ))}
                  </StyledColorChips>
                  <StyledCheckboxRow>
                    <label>
                      <input
                        type="checkbox"
                        checked={track.allowDownload}
                        onChange={(e) =>
                          updateTrack(index, {
                            allowDownload: e.target.checked,
                          })
                        }
                        data-testid={`gpx-track-allow-download-${index}`}
                      />
                      Allow download
                    </label>
                  </StyledCheckboxRow>
                  <StyledCheckboxRow>
                    <label>
                      <input
                        type="checkbox"
                        checked={track.showWaypoints}
                        onChange={(e) =>
                          updateTrack(index, {
                            showWaypoints: e.target.checked,
                          })
                        }
                        data-testid={`gpx-track-show-waypoints-${index}`}
                      />
                      Show waypoints table
                    </label>
                  </StyledCheckboxRow>
                  {showWaypointSection && (
                    <StyledWaypointImagesSection
                      data-testid={`waypoint-images-section-${index}`}
                    >
                      <StyledSectionLabel>Waypoint images</StyledSectionLabel>

                      {loading && (
                        <StyledFetchStatus
                          data-testid={`fetch-loading-${index}`}
                        >
                          Fetching waypoints…
                        </StyledFetchStatus>
                      )}

                      {error && (
                        <StyledFetchStatus data-testid={`fetch-error-${index}`}>
                          Failed to load waypoints
                        </StyledFetchStatus>
                      )}

                      {trackMappings.length > 0 && (
                        <StyledMappingsList>
                          {trackMappings.map((m) => (
                            <StyledMappingRow
                              key={m.name}
                              data-testid={`mapping-row-${index}`}
                            >
                              <StyledMappingThumb
                                src={m.imageUrl}
                                alt={m.name}
                                data-testid={`mapping-thumb-${index}`}
                              />
                              <StyledMappingName
                                data-testid={`mapping-name-${index}`}
                              >
                                {m.name}
                              </StyledMappingName>
                              <StyledRemoveButton
                                type="button"
                                aria-label={`Remove image for ${m.name}`}
                                onClick={() => removeMapping(index, m.name)}
                                data-testid={`mapping-remove-${index}`}
                              >
                                ×
                              </StyledRemoveButton>
                            </StyledMappingRow>
                          ))}
                        </StyledMappingsList>
                      )}

                      {available.length > 0 && (
                        <StyledAddRow>
                          <Select
                            value={pendingWaypoint}
                            onChange={(v) =>
                              setPendingWaypointByTrack((prev) => ({
                                ...prev,
                                [index]: v,
                              }))
                            }
                            options={available.map((name) => ({
                              value: name,
                              label: name,
                            }))}
                            isSearchable
                            maxMenuHeight={160}
                            data-testid={`waypoint-select-${index}`}
                          />
                          <StyledPickImageButton
                            type="button"
                            disabled={!pendingWaypoint}
                            onClick={() => setIsImagePickerOpenForTrack(index)}
                            data-testid={`pick-image-button-${index}`}
                          >
                            Pick image
                          </StyledPickImageButton>
                        </StyledAddRow>
                      )}
                    </StyledWaypointImagesSection>
                  )}
                </StyledTrackRow>
              )
            })}
          </StyledTrackList>

          <StyledAddTrackButton
            type="button"
            onClick={addTrack}
            data-testid="gpx-add-track"
          >
            + Add track
          </StyledAddTrackButton>

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
        open={isImagePickerOpenForTrack !== null}
        onClose={() => setIsImagePickerOpenForTrack(null)}
        onPick={handleImagePick}
        zIndex={1100}
      />
    </>
  )
}
