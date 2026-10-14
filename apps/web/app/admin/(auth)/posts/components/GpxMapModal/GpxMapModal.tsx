'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { parseWaypointNotes, tryParseGpxFile } from '@sdlgr/gpx-tools'
import { Select } from '@sdlgr/select'

import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import { TrackUrlPicker } from '../../../components/TrackUrlPicker'
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
  StyledThumbChip,
  StyledThumbGroup,
  StyledTrackInputsRow,
  StyledTrackList,
  StyledTrackRow,
  StyledTrackUrl,
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
  imageUrls: string[]
  notes: string[]
  fetchIdx?: number
}

interface TrackInput {
  url: string
  name: string
  color: string
  allowDownload: boolean
  showWaypoints: boolean
  showElevation: boolean
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
    showElevation: false,
  }
}

interface FetchedWaypoint {
  name: string
  // Description split into notes (one per line, bullet stripped) — persisted
  // alongside the images so the rendered popup can show them.
  notes: string[]
}

function parseWaypoints(text: string): FetchedWaypoint[] {
  return (tryParseGpxFile(text)?.waypoints ?? [])
    .map((w) => ({
      name: w.name,
      notes: parseWaypointNotes(w.desc).map((note) => note.text),
    }))
    .filter((w) => w.name)
}

// Serialise a mapping to its fence value: `<idx|name>=url1,url2 | note1 | note2`
// (notes appended only when present, keeping old single-image lines unchanged).
function serializeMapping(m: WaypointMapping): string {
  const key = m.fetchIdx !== undefined ? m.fetchIdx : m.name
  const notes = m.notes.length > 0 ? ` | ${m.notes.join(' | ')}` : ''
  return `${key}=${m.imageUrls.join(',')}${notes}`
}

// Every fetched waypoint stays selectable: a waypoint can hold several images,
// so picking one again just appends to its existing mapping.
function waypointOptions(
  fetched: FetchedWaypoint[],
): Array<{ name: string; fetchIdx: number }> {
  return fetched.map((w, fetchIdx) => ({ name: w.name, fetchIdx }))
}

function buildTrackLine(track: TrackInput): string {
  const url = track.url.trim()
  const name = track.name.trim()
  const color = track.color
  const flags = [
    ...(track.allowDownload ? ['download'] : []),
    ...(track.showWaypoints ? ['showWaypoints'] : []),
    ...(track.showElevation ? ['elevation'] : []),
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
    Record<number, FetchedWaypoint[]>
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
    Record<number, number | undefined>
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
      const next: Record<number, number | undefined> = { ...prev }
      tracks.forEach((_, i) => {
        const available = waypointOptions(fetchedWaypointsByTrack[i] ?? [])
        if (!available.some((a) => a.fetchIdx === next[i])) {
          next[i] = available[0]?.fetchIdx
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
        axios
          .get<string>(url, {
            signal: controller.signal,
            responseType: 'text',
          })
          .then(({ data: text }) => {
            setFetchedWaypointsByTrack((prev) => ({
              ...prev,
              [i]: parseWaypoints(text),
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
        imageLines.push(`${outputIdx}:${serializeMapping(m)}`)
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
    const trackIdx = isImagePickerOpenForTrack
    /* istanbul ignore next */
    if (trackIdx === null) return
    const fetchIdx = pendingWaypointByTrack[trackIdx]
    /* istanbul ignore next */
    if (fetchIdx === undefined) return
    const waypoint = fetchedWaypointsByTrack[trackIdx]?.[fetchIdx]
    // The pending index always points at a fetched waypoint; the fallbacks are
    // just for the type-narrowing.
    /* istanbul ignore next */
    const waypointName = waypoint?.name ?? ''
    /* istanbul ignore next */
    const waypointNotes = waypoint?.notes ?? []
    setMappingsByTrack((prev) => {
      const existing = prev[trackIdx] ?? []
      // Append to the waypoint's mapping if it already has one, else create it
      // (carrying the waypoint's parsed description notes for persistence).
      const found = existing.some((m) => m.fetchIdx === fetchIdx)
      const next = found
        ? existing.map((m) =>
            m.fetchIdx === fetchIdx
              ? { ...m, imageUrls: [...m.imageUrls, image.url] }
              : m,
          )
        : [
            ...existing,
            {
              name: waypointName,
              fetchIdx,
              imageUrls: [image.url],
              notes: waypointNotes,
            },
          ]
      return { ...prev, [trackIdx]: next }
    })
    setIsImagePickerOpenForTrack(null)
  }

  function removeImage(trackIdx: number, mappingIdx: number, imageIdx: number) {
    setMappingsByTrack((prev) => {
      const existing = prev[trackIdx] ?? /* istanbul ignore next */ []
      const next = existing
        .map((m, i) =>
          i === mappingIdx
            ? { ...m, imageUrls: m.imageUrls.filter((_, j) => j !== imageIdx) }
            : m,
        )
        // Drop the waypoint's row once its last image is removed.
        .filter((m) => m.imageUrls.length > 0)
      return { ...prev, [trackIdx]: next }
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
      previewImageLines.push(`${trackIdx}:${serializeMapping(m)}`)
    })
  })
  const previewContent = [...previewTrackLines, ...previewImageLines].join('\n')
  const preview = `\`\`\`gpx\n${previewContent}\n\`\`\``

  return (
    <>
      <StyledGpxMapModal
        show={isOpen}
        onHide={onCancel}
        // The ImagePicker is a sibling portal, outside this modal's DOM. Keeping
        // the focus trap on would yank focus back here on every keystroke in the
        // picker's search field, so release it while the picker is open.
        enforceFocus={isImagePickerOpenForTrack === null}
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
              const pendingWaypoint = pendingWaypointByTrack[index]
              const available = waypointOptions(fetched)
              const showWaypointSection =
                track.showWaypoints && (loading || error || fetched.length > 0)
              return (
                <StyledTrackRow key={index}>
                  <StyledTrackInputsRow>
                    <StyledTrackUrl>
                      <TrackUrlPicker
                        value={track.url}
                        onChange={(url) => updateTrack(index, { url })}
                        data-testid={`gpx-track-url-${index}`}
                      />
                    </StyledTrackUrl>
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
                  <StyledCheckboxRow>
                    <label>
                      <input
                        type="checkbox"
                        checked={track.showElevation}
                        onChange={(e) =>
                          updateTrack(index, {
                            showElevation: e.target.checked,
                          })
                        }
                        data-testid={`track-show-elevation-${index}`}
                      />
                      Elevation profile
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
                          {trackMappings.map((m, mappingIdx) => {
                            // Images pinned by waypoint index carry no stored
                            // name — resolve it from the fetched waypoints.
                            const mappingName =
                              m.fetchIdx !== undefined
                                ? (fetched[m.fetchIdx]?.name ?? m.name)
                                : m.name
                            return (
                              <StyledMappingRow
                                key={mappingIdx}
                                data-testid={`mapping-row-${index}`}
                              >
                                <StyledMappingName
                                  data-testid={`mapping-name-${index}`}
                                >
                                  {mappingName}
                                </StyledMappingName>
                                <StyledThumbGroup>
                                  {m.imageUrls.map((imageUrl, imageIdx) => (
                                    <StyledThumbChip key={imageIdx}>
                                      <StyledMappingThumb
                                        src={imageUrl}
                                        alt={mappingName}
                                        data-testid={`mapping-thumb-${index}-${imageIdx}`}
                                      />
                                      <StyledRemoveButton
                                        type="button"
                                        aria-label={`Remove image ${imageIdx + 1} for ${mappingName}`}
                                        onClick={() =>
                                          removeImage(
                                            index,
                                            mappingIdx,
                                            imageIdx,
                                          )
                                        }
                                        data-testid={`mapping-remove-${index}-${imageIdx}`}
                                      >
                                        ×
                                      </StyledRemoveButton>
                                    </StyledThumbChip>
                                  ))}
                                </StyledThumbGroup>
                              </StyledMappingRow>
                            )
                          })}
                        </StyledMappingsList>
                      )}

                      {available.length > 0 && (
                        <StyledAddRow>
                          <Select
                            value={
                              pendingWaypoint !== undefined
                                ? String(pendingWaypoint)
                                : ''
                            }
                            onChange={(v) =>
                              setPendingWaypointByTrack((prev) => ({
                                ...prev,
                                [index]:
                                  v !== ''
                                    ? parseInt(v, 10)
                                    : /* istanbul ignore next */ undefined,
                              }))
                            }
                            options={available.map(({ name, fetchIdx }) => ({
                              value: String(fetchIdx),
                              label: name,
                            }))}
                            isSearchable
                            maxMenuHeight={160}
                            data-testid={`waypoint-select-${index}`}
                          />
                          <StyledPickImageButton
                            type="button"
                            disabled={pendingWaypoint === undefined}
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
