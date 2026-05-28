'use client'

import { useEffect, useState } from 'react'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { Select } from '@sdlgr/select'

import type { CloudinaryImage } from '@web/lib/cloudinary/images'

import { ImagePicker } from '../ImagePicker'
import {
  StyledAddRow,
  StyledBackdrop,
  StyledButtons,
  StyledCancelButton,
  StyledCheckboxRow,
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
  StyledSectionLabel,
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

function parseWaypointNames(text: string): string[] {
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  return Array.from(doc.querySelectorAll('wpt'))
    .map((wpt) => wpt.querySelector('name')?.textContent ?? '')
    .filter(Boolean)
}

export function GpxMapModal({ isOpen, onInsert, onCancel }: GpxMapModalProps) {
  const [url, setUrl] = useState('')
  const [showWaypoints, setShowWaypoints] = useState(false)
  const [allowDownload, setAllowDownload] = useState(false)
  const [fetchedWaypoints, setFetchedWaypoints] = useState<string[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [mappings, setMappings] = useState<WaypointMapping[]>([])
  const [pendingWaypoint, setPendingWaypoint] = useState('')
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)

  useEffect(() => {
    const mappedSet = new Set(mappings.map((m) => m.name))
    const available = fetchedWaypoints.filter((n) => !mappedSet.has(n))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingWaypoint((prev) =>
      available.includes(prev) ? prev : (available[0] ?? ''),
    )
  }, [fetchedWaypoints, mappings])

  useEffect(() => {
    const trimmed = url.trim()
    if (!showWaypoints || !trimmed) {
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
      fetch(trimmed, { signal: controller.signal })
        .then((r) => r.text())
        .then((text) => {
          const names = parseWaypointNames(text)
          setFetchedWaypoints(names)
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
  }, [url, showWaypoints])

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
  const previewContent = [url || 'https://...', ...imageLines].join('\n')
  const preview = `\`\`\`${lang}\n${previewContent}\n\`\`\``

  function handleInsert() {
    const trimmed = url.trim()
    /* istanbul ignore next */
    if (!trimmed) return
    const content = [trimmed, ...imageLines].join('\n')
    const markdown = `\n\n\`\`\`${lang}\n${content}\n\`\`\`\n\n`
    onInsert(markdown)
    setUrl('')
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
          <StyledLabel htmlFor="gpx-url">GPX URL</StyledLabel>
          <StyledInput
            id="gpx-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-cdn.com/routes/track.gpx"
            data-testid="gpx-url-input"
          />
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
              disabled={!url.trim()}
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
