'use client'

import { useQuery } from '@tanstack/react-query'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@sdlgr/button'
import { Pagination } from '@sdlgr/pagination'

import { useClientTranslation } from '@web/i18n/client'

import { formatSize } from '../../utils/format'
import { groupTrackFiles } from '../../utils/groupTrackFiles'
import {
  type SavedTrackFile,
  TRACKS_QUERY_KEY,
  type TrackFile,
  editTrackHref,
  fetchTrackFiles,
} from '../../utils/trackApi'
import { TrackUploadModal } from '../TrackUploadModal'
import {
  StyledActions,
  StyledCount,
  StyledEditLink,
  StyledEmptyState,
  StyledError,
  StyledHeader,
  StyledList,
  StyledName,
  StyledNotice,
  StyledRefreshButton,
  StyledRow,
  StyledSearchInput,
  StyledTitle,
  StyledToolbar,
  StyledVersion,
  StyledWrapper,
} from './TrackList.styles'

function TrackVersion({
  file,
  label,
  copied,
  onCopy,
}: {
  file: TrackFile
  label: string
  copied: boolean
  onCopy: (file: TrackFile) => void
}) {
  const { t } = useClientTranslation('admin')
  return (
    <StyledVersion>
      <StyledEditLink href={editTrackHref(file.path)}>{label}</StyledEditLink>
      <span>{formatSize(file.size)}</span>
      <Button
        variant="contained"
        size="xs"
        type="button"
        onClick={() => onCopy(file)}
        data-testid={`copy-url-${file.path}`}
      >
        {copied ? t('tracks.list.copied') : t('tracks.list.copyUrl')}
      </Button>
    </StyledVersion>
  )
}

export const TRACKS_PER_PAGE = 25

export function TrackList() {
  const { t } = useClientTranslation('admin')
  const [search, setSearch] = useState('')
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploaded, setUploaded] = useState<SavedTrackFile | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const {
    data: listing,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: TRACKS_QUERY_KEY, queryFn: fetchTrackFiles })
  const files = listing?.files ?? []

  const groups = groupTrackFiles(files).filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  )
  const totalPages = Math.max(1, Math.ceil(groups.length / TRACKS_PER_PAGE))
  const page = Math.min(
    Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1),
    totalPages,
  )
  const pageGroups = groups.slice(
    (page - 1) * TRACKS_PER_PAGE,
    page * TRACKS_PER_PAGE,
  )

  function changeSearch(value: string) {
    setSearch(value)
    // A new filter starts again from the first page.
    if (searchParams.get('page')) router.replace(pathname)
  }

  function copyUrl(file: TrackFile) {
    void navigator.clipboard.writeText(file.rawUrl).then(() => {
      setCopiedPath(file.path)
    })
  }

  return (
    <StyledWrapper data-testid="track-list">
      <StyledHeader>
        <StyledTitle>{t('tracks.title')}</StyledTitle>
        <StyledToolbar>
          <StyledSearchInput
            type="search"
            placeholder={t('tracks.list.searchPlaceholder')}
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            aria-label={t('tracks.list.searchPlaceholder')}
          />
          <StyledActions>
            <Button
              variant="contained"
              size="sm"
              type="button"
              onClick={() => setIsUploadOpen(true)}
              data-testid="tracks-upload"
            >
              {t('tracks.upload.open')}
            </Button>
            <StyledRefreshButton
              type="button"
              onClick={() => void refetch()}
              data-testid="tracks-refresh"
            >
              {t('refresh')}
            </StyledRefreshButton>
          </StyledActions>
        </StyledToolbar>
      </StyledHeader>
      {uploaded && (
        <StyledNotice data-testid="upload-notice">
          {t('tracks.upload.done', { path: uploaded.path })}{' '}
          <StyledEditLink href={editTrackHref(uploaded.path)}>
            {t('tracks.upload.openEditor')}
          </StyledEditLink>
        </StyledNotice>
      )}
      {isLoading && (
        <StyledEmptyState>{t('tracks.list.loading')}</StyledEmptyState>
      )}
      {isError && <StyledError>{t('tracks.list.error')}</StyledError>}
      {listing?.truncated && (
        <StyledError role="alert">{t('tracks.list.truncated')}</StyledError>
      )}
      {groups.length > 0 && (
        <StyledCount data-testid="tracks-count">
          {t('tracks.list.count', { count: groups.length })}
        </StyledCount>
      )}
      {!isLoading && !isError && groups.length === 0 && (
        <StyledEmptyState>{t('tracks.list.empty')}</StyledEmptyState>
      )}
      <StyledList>
        {pageGroups.map((group) => (
          <StyledRow key={group.name} data-testid={`track-row-${group.name}`}>
            <StyledName>{group.name}</StyledName>
            {group.original && (
              <TrackVersion
                file={group.original}
                label={t('tracks.list.editOriginal')}
                copied={copiedPath === group.original.path}
                onCopy={copyUrl}
              />
            )}
            {group.clean && (
              <TrackVersion
                file={group.clean}
                label={t('tracks.list.editClean')}
                copied={copiedPath === group.clean.path}
                onCopy={copyUrl}
              />
            )}
          </StyledRow>
        ))}
      </StyledList>
      <Pagination
        total={groups.length}
        page={page}
        limit={TRACKS_PER_PAGE}
        previousLabel={t('tracks.list.previous')}
        nextLabel={t('tracks.list.next')}
      />
      <TrackUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={(saved) => {
          setUploaded(saved)
          setIsUploadOpen(false)
        }}
        existingPaths={files.map((f) => f.path)}
      />
    </StyledWrapper>
  )
}
