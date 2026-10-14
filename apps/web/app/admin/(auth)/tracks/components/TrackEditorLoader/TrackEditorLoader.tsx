'use client'

import dynamic from 'next/dynamic'

import { useClientTranslation } from '@web/i18n/client'

// Leaflet touches `window` at import time, so the whole editor is client-only.
const TrackEditor = dynamic(
  () => import('../TrackEditor').then((m) => ({ default: m.TrackEditor })),
  { ssr: false, loading: () => <LoadingEditor /> },
)

function LoadingEditor() {
  const { t } = useClientTranslation('admin')
  return <p data-testid="track-editor-loading">{t('tracks.editor.loading')}</p>
}

export interface TrackEditorLoaderProps {
  path: string
}

export function TrackEditorLoader({ path }: TrackEditorLoaderProps) {
  return <TrackEditor path={path} />
}
