'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'

import { ConfirmDeleteModal } from '@web/app/admin/(auth)/components/ConfirmDeleteModal'
import { useClientTranslation } from '@web/i18n/client'
import type { PostInSeries, SeriesForAdmin } from '@web/lib/db/queries/series'

import {
  StyledActions,
  StyledButtonGroup,
  StyledCancelButton,
  StyledDeleteButton,
  StyledEditButton,
  StyledEditInput,
  StyledEmpty,
  StyledExpandedCell,
  StyledExpandedRow,
  StyledInnerTable,
  StyledInnerTbody,
  StyledInnerTh,
  StyledInnerThead,
  StyledInnerTr,
  StyledLocaleTab,
  StyledLocaleTabs,
  StyledNewButton,
  StyledPostActions,
  StyledPostCount,
  StyledPostDate,
  StyledPostItem,
  StyledPostOrder,
  StyledPostTitle,
  StyledPostsList,
  StyledRefreshButton,
  StyledRemoveFromSeriesButton,
  StyledSaveButton,
  StyledSearchInput,
  StyledSeriesId,
  StyledTable,
  StyledTbody,
  StyledTd,
  StyledTh,
  StyledThead,
  StyledTitle,
  StyledToolbar,
  StyledTr,
  StyledViewPostButton,
  StyledWrapper,
} from './SeriesTable.styles'

interface SeriesTableProps {
  series: SeriesForAdmin[]
}

function getTitle(s: SeriesForAdmin, locale: 'en' | 'es'): string {
  return s.translations.find((t) => t.locale === locale)?.title ?? ''
}

function getDisplayTitle(s: SeriesForAdmin): string {
  return getTitle(s, 'en') || getTitle(s, 'es') || s.id
}

const QUERY_KEY = ['admin-series'] as const

export function SeriesTable({ series }: SeriesTableProps) {
  const { t } = useClientTranslation('admin')
  const queryClient = useQueryClient()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editLocale, setEditLocale] = useState<'en' | 'es'>('en')
  const [editTitle, setEditTitle] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [expandedSeriesId, setExpandedSeriesId] = useState<string | null>(null)

  const { data: items, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await axios.get<{ data: SeriesForAdmin[] }>(
        '/api/series',
      )
      return data.data
    },
    initialData: series,
    staleTime: Infinity,
    gcTime: 0,
  })

  const { data: expandedPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['series-posts', expandedSeriesId],
    queryFn: async () => {
      const { data } = await axios.get<{ data: PostInSeries[] }>(
        `/api/series/${expandedSeriesId}/posts`,
      )
      return data.data
    },
    enabled: expandedSeriesId !== null,
    staleTime: 30_000,
  })

  const filtered = items.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.id.toLowerCase().includes(q) ||
      getDisplayTitle(s).toLowerCase().includes(q)
    )
  })

  function handleStartEdit(s: SeriesForAdmin) {
    setEditId(s.id)
    setEditLocale('en')
    setEditTitle(getTitle(s, 'en'))
  }

  function handleSwitchLocale(locale: 'en' | 'es') {
    const s = items.find((item) => item.id === editId)
    /* istanbul ignore next */
    if (!s) return
    setEditLocale(locale)
    setEditTitle(getTitle(s, locale))
  }

  function handleCancelEdit() {
    setEditId(null)
    setEditLocale('en')
    setEditTitle('')
  }

  async function handleSaveEdit(id: string) {
    await axios.put(`/api/series/${id}`, {
      locale: editLocale,
      title: editTitle,
    })
    queryClient.setQueryData<SeriesForAdmin[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      return old.map((s) => {
        if (s.id !== id) return s
        const others = s.translations.filter((tr) => tr.locale !== editLocale)
        return {
          ...s,
          translations: [...others, { locale: editLocale, title: editTitle }],
        }
      })
    })
    handleCancelEdit()
  }

  async function handleConfirmDelete() {
    /* istanbul ignore next */
    if (!deleteTargetId) return
    const id = deleteTargetId
    await axios.delete(`/api/series/${id}`)
    setDeleteTargetId(null)
    queryClient.setQueryData<SeriesForAdmin[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      return old.filter((s) => s.id !== id)
    })
  }

  function toggleExpanded(id: string) {
    setExpandedSeriesId((prev) => (prev === id ? null : id))
  }

  async function handleRemoveFromSeries(postId: string) {
    await axios.put(`/api/posts/${postId}`, {
      seriesId: null,
      seriesOrder: null,
    })
    queryClient.setQueryData<PostInSeries[]>(
      ['series-posts', expandedSeriesId],
      /* istanbul ignore next */
      (old) => (old ?? []).filter((p) => p.id !== postId),
    )
    queryClient.setQueryData<SeriesForAdmin[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      return old.map((s) => {
        if (s.id !== expandedSeriesId) return s
        return { ...s, postCount: s.postCount - 1 }
      })
    })
    const currentSeries = items.find((s) => s.id === expandedSeriesId)
    /* istanbul ignore next */
    if (!currentSeries) return
    if (currentSeries.postCount - 1 <= 0) {
      setExpandedSeriesId(null)
    }
  }

  return (
    <StyledWrapper data-testid="series-table">
      <StyledToolbar>
        <StyledSearchInput
          type="search"
          placeholder={t('series.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="search-input"
        />
        <StyledButtonGroup>
          <StyledRefreshButton
            variant="contained"
            size="sm"
            onClick={() => void refetch()}
            data-testid="refresh-button"
          >
            {t('refresh')}
          </StyledRefreshButton>
          <StyledNewButton
            variant="inverted"
            size="sm"
            onClick={() => router.push('/admin/series/new')}
            data-testid="new-series-button"
          >
            {t('series.newSeries')}
          </StyledNewButton>
        </StyledButtonGroup>
      </StyledToolbar>

      <StyledTable>
        <StyledThead>
          <tr>
            <StyledTh>{t('series.table.id')}</StyledTh>
            <StyledTh>{t('series.table.title')}</StyledTh>
            <StyledTh>{t('series.table.posts')}</StyledTh>
            <StyledTh>{t('series.table.actions')}</StyledTh>
          </tr>
        </StyledThead>
        <StyledTbody>
          {filtered.length === 0 && (
            <tr>
              <StyledTd colSpan={4}>
                <StyledEmpty>{t('series.empty')}</StyledEmpty>
              </StyledTd>
            </tr>
          )}
          {filtered.map((s) => (
            <Fragment key={s.id}>
              <StyledTr data-testid="series-row">
                <StyledTd>
                  <StyledSeriesId>{s.id}</StyledSeriesId>
                </StyledTd>
                <StyledTd>
                  {editId === s.id ? (
                    <>
                      <StyledLocaleTabs>
                        <StyledLocaleTab
                          active={editLocale === 'en'}
                          onClick={() => handleSwitchLocale('en')}
                          data-testid="locale-tab-en"
                        >
                          EN
                        </StyledLocaleTab>
                        <StyledLocaleTab
                          active={editLocale === 'es'}
                          onClick={() => handleSwitchLocale('es')}
                          data-testid="locale-tab-es"
                        >
                          ES
                        </StyledLocaleTab>
                      </StyledLocaleTabs>
                      <StyledEditInput
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        data-testid="edit-title-input"
                      />
                    </>
                  ) : (
                    <StyledTitle>{getDisplayTitle(s)}</StyledTitle>
                  )}
                </StyledTd>
                <StyledTd>
                  <StyledPostCount
                    $clickable={s.postCount > 0}
                    onClick={
                      s.postCount > 0 ? () => toggleExpanded(s.id) : undefined
                    }
                    data-testid="post-count"
                  >
                    {s.postCount}
                    {s.postCount > 0 && (
                      <span data-testid="expand-indicator">
                        {expandedSeriesId === s.id ? ' ▲' : ' ▼'}
                      </span>
                    )}
                  </StyledPostCount>
                </StyledTd>
                <StyledTd>
                  <StyledActions>
                    {editId === s.id ? (
                      <>
                        <StyledSaveButton
                          onClick={() => handleSaveEdit(s.id)}
                          data-testid="save-button"
                        >
                          {t('series.save')}
                        </StyledSaveButton>
                        <StyledCancelButton
                          onClick={handleCancelEdit}
                          data-testid="cancel-button"
                        >
                          {t('series.cancel')}
                        </StyledCancelButton>
                      </>
                    ) : (
                      <>
                        <StyledEditButton
                          onClick={() => handleStartEdit(s)}
                          data-testid="edit-button"
                        >
                          {t('series.edit')}
                        </StyledEditButton>
                        <StyledDeleteButton
                          onClick={
                            s.postCount > 0
                              ? undefined
                              : () => setDeleteTargetId(s.id)
                          }
                          disabled={s.postCount > 0}
                          title={
                            s.postCount > 0
                              ? t('series.deleteTooltip', {
                                  count: s.postCount,
                                })
                              : undefined
                          }
                          data-testid="delete-button"
                        >
                          {t('series.delete')}
                        </StyledDeleteButton>
                      </>
                    )}
                  </StyledActions>
                </StyledTd>
              </StyledTr>
              {expandedSeriesId === s.id && (
                <StyledExpandedRow data-testid="series-posts-row">
                  <StyledExpandedCell colSpan={4}>
                    {isLoadingPosts ? (
                      <StyledPostsList data-testid="posts-loading">
                        {t('series.postsLoading')}
                      </StyledPostsList>
                    ) : (
                      <StyledPostsList data-testid="posts-list">
                        <StyledInnerTable>
                          <StyledInnerThead>
                            <StyledInnerTr>
                              <StyledInnerTh>
                                {t('series.table.order')}
                              </StyledInnerTh>
                              <StyledInnerTh>
                                {t('series.table.title')}
                              </StyledInnerTh>
                              <StyledInnerTh>
                                {t('series.table.published')}
                              </StyledInnerTh>
                              <StyledInnerTh>
                                {t('series.table.actions')}
                              </StyledInnerTh>
                            </StyledInnerTr>
                          </StyledInnerThead>
                          <StyledInnerTbody>
                            {(expandedPosts ?? []).map((p) => (
                              <StyledPostItem
                                key={p.id}
                                data-testid="series-post-item"
                              >
                                <StyledPostOrder>
                                  {p.seriesOrder ?? '—'}
                                </StyledPostOrder>
                                <StyledPostTitle>
                                  {p.enTitle ?? p.id}
                                </StyledPostTitle>
                                <StyledPostDate data-testid="post-published-date">
                                  {p.publishedAt
                                    ? new Date(
                                        p.publishedAt,
                                      ).toLocaleDateString()
                                    : '—'}
                                </StyledPostDate>
                                <StyledPostActions>
                                  <StyledViewPostButton
                                    onClick={() =>
                                      router.push(`/admin/posts/${p.id}`)
                                    }
                                    data-testid="view-post-button"
                                  >
                                    {t('series.viewPost')}
                                  </StyledViewPostButton>
                                  <StyledRemoveFromSeriesButton
                                    onClick={() =>
                                      void handleRemoveFromSeries(p.id)
                                    }
                                    data-testid="remove-from-series-button"
                                  >
                                    {t('series.removeFromSeries')}
                                  </StyledRemoveFromSeriesButton>
                                </StyledPostActions>
                              </StyledPostItem>
                            ))}
                          </StyledInnerTbody>
                        </StyledInnerTable>
                      </StyledPostsList>
                    )}
                  </StyledExpandedCell>
                </StyledExpandedRow>
              )}
            </Fragment>
          ))}
        </StyledTbody>
      </StyledTable>

      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        message={t('series.deleteConfirm')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </StyledWrapper>
  )
}
