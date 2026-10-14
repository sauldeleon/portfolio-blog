'use client'

import { useQuery } from '@tanstack/react-query'

import { Select } from '@sdlgr/select'

import { useClientTranslation } from '@web/i18n/client'

import { TRACKS_QUERY_KEY, fetchTrackFiles } from '../../tracks/utils/trackApi'

export interface TrackUrlPickerProps {
  value: string
  onChange: (url: string) => void
  /** Input id, so a `<label htmlFor>` can point at the field. */
  id?: string
  placeholder?: string
  'data-testid'?: string
}

/**
 * GPX URL field: searches the tracks in the GitHub repo (newest first) and
 * still accepts any other URL typed or pasted in.
 */
export function TrackUrlPicker({
  value,
  onChange,
  id,
  placeholder,
  'data-testid': testId,
}: TrackUrlPickerProps) {
  const { t } = useClientTranslation('admin')
  const { data } = useQuery({
    queryKey: TRACKS_QUERY_KEY,
    queryFn: fetchTrackFiles,
  })
  // Recordings are named after their date, so this lists the newest first.
  const options = (data?.files ?? [])
    .map((file) => ({ value: file.rawUrl, label: file.path }))
    .sort((a, b) => b.label.localeCompare(a.label))

  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      isSearchable
      isCreatable
      isClearable
      formatCreateLabel={(input) => t('tracks.picker.useUrl', { url: input })}
      placeholder={placeholder ?? t('tracks.picker.placeholder')}
      maxMenuHeight={240}
      data-testid={testId}
    />
  )
}
