'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { Button } from '@sdlgr/button'
import {
  type GpxFile,
  computeStats,
  isValidTrackName,
  parseGpxFile,
  renameGpxFile,
  serializeGpxFile,
  stripExtension,
  sumStats,
} from '@sdlgr/gpx-tools'

import { useClientTranslation } from '@web/i18n/client'

import { formatDistance } from '../../utils/format'
import {
  type SavedTrackFile,
  TRACKS_QUERY_KEY,
  uploadTrackFile,
} from '../../utils/trackApi'
import {
  StyledBackdrop,
  StyledButtons,
  StyledDropzone,
  StyledError,
  StyledField,
  StyledFileInfo,
  StyledHint,
  StyledModal,
  StyledModalContent,
  StyledModalTitle,
  StyledNameInput,
} from './TrackUploadModal.styles'

// Keeps the JSON body under Vercel's 4.5 MB request limit.
const MAX_CONTENT_LENGTH = 4_000_000

interface SelectedFile {
  fileName: string
  gpx: GpxFile
}

export interface TrackUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploaded: (saved: SavedTrackFile) => void
  /** Paths already in the repo, to refuse duplicates before uploading. */
  existingPaths: string[]
}

export function TrackUploadModal({
  isOpen,
  onClose,
  onUploaded,
  existingPaths,
}: TrackUploadModalProps) {
  const { t } = useClientTranslation('admin')
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<SelectedFile | null>(null)
  const [name, setName] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)

  const upload = useMutation<
    SavedTrackFile,
    unknown,
    { name: string; content: string }
  >({
    mutationFn: ({ name: trackName, content }) =>
      uploadTrackFile(trackName, content),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY })
      reset()
      onUploaded(saved)
    },
  })

  function reset() {
    setSelected(null)
    setName('')
    setFileError(null)
    upload.reset()
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleFile(file: File) {
    upload.reset()
    try {
      const gpx = parseGpxFile(await file.text())
      setSelected({ fileName: file.name, gpx })
      setName(stripExtension(file.name))
      setFileError(null)
    } catch {
      setSelected(null)
      setFileError(t('tracks.upload.invalidFile'))
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/gpx+xml': ['.gpx'],
      'application/octet-stream': ['.gpx'],
    },
    multiple: false,
    onDrop: (files) => {
      if (files[0]) void handleFile(files[0])
    },
  })

  const trimmedName = name.trim()
  const nameError = !selected
    ? null
    : !isValidTrackName(trimmedName)
      ? t('tracks.upload.invalidName')
      : existingPaths.includes(`${trimmedName}.gpx`)
        ? t('tracks.upload.exists', { path: `${trimmedName}.gpx` })
        : null

  const stats = selected
    ? sumStats(
        selected.gpx.tracks.flatMap((track) =>
          track.segments.map((segment) => computeStats(segment.points)),
        ),
      )
    : null

  function submit(file: SelectedFile) {
    const content = serializeGpxFile(renameGpxFile(file.gpx, trimmedName))
    if (content.length > MAX_CONTENT_LENGTH) {
      setFileError(t('tracks.upload.tooLarge'))
      return
    }
    upload.mutate({ name: trimmedName, content })
  }

  const uploadError = upload.isError
    ? isAxiosError<{ error?: string }>(upload.error) &&
      typeof upload.error.response?.data?.error === 'string'
      ? upload.error.response.data.error
      : t('tracks.upload.error')
    : null

  return (
    <StyledModal
      show={isOpen}
      onHide={handleClose}
      renderBackdrop={(props: RenderModalBackdropProps) => (
        <StyledBackdrop {...props} />
      )}
      aria-labelledby="track-upload-title"
    >
      <StyledModalContent data-testid="track-upload-modal">
        <StyledModalTitle id="track-upload-title">
          {t('tracks.upload.title')}
        </StyledModalTitle>

        {selected && stats ? (
          <StyledFileInfo>
            <StyledHint data-testid="upload-file-summary">
              {t('tracks.upload.summary', {
                file: selected.fileName,
                tracks: selected.gpx.tracks.length,
                points: stats.points,
                distance: formatDistance(stats.distance),
                waypoints: selected.gpx.waypoints.length,
              })}
            </StyledHint>
            <StyledField>
              <span>{t('tracks.upload.name')}</span>
              <StyledNameInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="upload-name"
              />
            </StyledField>
            <StyledHint>
              {t('tracks.upload.nameHint', { path: `${trimmedName}.gpx` })}
            </StyledHint>
            {nameError && (
              <StyledError data-testid="upload-name-error">
                {nameError}
              </StyledError>
            )}
          </StyledFileInfo>
        ) : (
          <StyledDropzone
            {...getRootProps()}
            $isDragActive={isDragActive}
            data-testid="upload-dropzone"
          >
            <input {...getInputProps()} data-testid="upload-input" />
            {isDragActive
              ? t('tracks.upload.dropzoneActive')
              : t('tracks.upload.dropzone')}
          </StyledDropzone>
        )}

        {(fileError ?? uploadError) && (
          <StyledError role="alert">{fileError ?? uploadError}</StyledError>
        )}

        <StyledButtons>
          {selected && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={reset}
              data-testid="upload-change-file"
            >
              {t('tracks.upload.changeFile')}
            </Button>
          )}
          <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
            {t('tracks.upload.cancel')}
          </Button>
          {selected && (
            <Button
              variant="contained"
              size="sm"
              colorScheme="success"
              type="button"
              onClick={() => submit(selected)}
              disabled={Boolean(nameError) || upload.isPending}
              data-testid="upload-submit"
            >
              {upload.isPending
                ? t('tracks.upload.uploading')
                : t('tracks.upload.submit')}
            </Button>
          )}
        </StyledButtons>
      </StyledModalContent>
    </StyledModal>
  )
}
