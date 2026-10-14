'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useMemo } from 'react'

import { type GpxFile, parseGpxFile } from '@sdlgr/gpx-tools'

import { useClientTranslation } from '@web/i18n/client'

import {
  TRACKS_QUERY_KEY,
  fetchTrackFile,
  fetchTrackFiles,
  trackFileQueryKey,
} from '../../utils/trackApi'
import { TrackWorkspace } from '../TrackWorkspace'
import { StyledBackLink, StyledMessage } from './TrackEditor.styles'

function parseSafely(content: string): GpxFile | null {
  try {
    return parseGpxFile(content)
  } catch {
    return null
  }
}

export interface TrackEditorProps {
  path: string
}

export function TrackEditor({ path }: TrackEditorProps) {
  const { t } = useClientTranslation('admin')
  const { data, isLoading } = useQuery({
    queryKey: trackFileQueryKey(path),
    queryFn: () => fetchTrackFile(path),
    // Never refetch behind the editor's back: it would discard local edits.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
  const { data: listing } = useQuery({
    queryKey: TRACKS_QUERY_KEY,
    queryFn: fetchTrackFiles,
  })
  const files = listing?.files ?? []
  const file = useMemo(() => (data ? parseSafely(data.content) : null), [data])

  const back = (
    <StyledBackLink as={Link} href="/admin/tracks">
      {t('tracks.editor.back')}
    </StyledBackLink>
  )

  if (isLoading) {
    return <StyledMessage>{t('tracks.editor.loading')}</StyledMessage>
  }
  if (!data) {
    return (
      <StyledMessage $error>
        {t('tracks.editor.loadError')} {back}
      </StyledMessage>
    )
  }
  if (!file) {
    return (
      <StyledMessage $error>
        {t('tracks.editor.parseError')} {back}
      </StyledMessage>
    )
  }
  return (
    <TrackWorkspace
      path={path}
      file={file}
      existingPaths={files.map((f) => f.path)}
    />
  )
}
