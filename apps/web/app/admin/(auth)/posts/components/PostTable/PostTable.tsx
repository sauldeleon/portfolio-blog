'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { ConfirmDeleteModal } from '@web/app/admin/(auth)/components/ConfirmDeleteModal'
import { PublishNotifyModal } from '@web/app/admin/(auth)/components/PublishNotifyModal'
import { useClientTranslation } from '@web/i18n/client'
import type { AdminPost } from '@web/lib/db/queries/posts'

import {
  PAGE_LIMIT,
  STATUS_FILTERS,
  type StatusFilter,
} from './PostTable.constants'
import {
  StyledActions,
  StyledArchiveButton,
  StyledBulkActions,
  StyledBulkArchiveButton,
  StyledBulkDeleteButton,
  StyledBulkPublishButton,
  StyledBulkUnarchiveButton,
  StyledBulkUnpublishButton,
  StyledButtonGroup,
  StyledCheckboxTd,
  StyledCheckboxTh,
  StyledCount,
  StyledEditButton,
  StyledEmDash,
  StyledEmpty,
  StyledFilterTab,
  StyledFilterTabs,
  StyledHardDeleteButton,
  StyledLangChip,
  StyledLangChips,
  StyledLeftGroup,
  StyledNewPostButton,
  StyledPageButton,
  StyledPageInfo,
  StyledPagination,
  StyledPublishButton,
  StyledRefreshButton,
  StyledSearchInput,
  StyledStatusBadge,
  StyledTable,
  StyledTbody,
  StyledTd,
  StyledTh,
  StyledThead,
  StyledTitle,
  StyledToolbar,
  StyledTr,
  StyledWrapper,
} from './PostTable.styles'

export type { StatusFilter }
export { STATUS_FILTERS }

type RawAdminPost = Omit<
  AdminPost,
  'publishedAt' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'scheduledAt'
> & {
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  scheduledAt: string | null
}

function deserializePost(p: RawAdminPost): AdminPost {
  return {
    ...p,
    publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
    deletedAt: p.deletedAt ? new Date(p.deletedAt) : null,
    scheduledAt: p.scheduledAt ? new Date(p.scheduledAt) : null,
  }
}

interface PostTableProps {
  posts: AdminPost[]
}

export function PostTable({ posts }: PostTableProps) {
  const { t } = useClientTranslation('admin')
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rawFilter = searchParams.get('filter')
  const initialFilter: StatusFilter = (
    STATUS_FILTERS as readonly string[]
  ).includes(rawFilter ?? '')
    ? (rawFilter as StatusFilter)
    : 'all'
  const [filter, setFilter] = useState<StatusFilter>(initialFilter)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [publishNotifyTarget, setPublishNotifyTarget] =
    useState<AdminPost | null>(null)
  const [bulkPublishPending, setBulkPublishPending] = useState(false)
  const [bulkUnpublishPending, setBulkUnpublishPending] = useState(false)
  const [bulkArchivePending, setBulkArchivePending] = useState(false)
  const [bulkDeletePending, setBulkDeletePending] = useState(false)
  const [bulkUnarchivePending, setBulkUnarchivePending] = useState(false)
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null)
  const [hardDeleteTargetId, setHardDeleteTargetId] = useState<string | null>(
    null,
  )
  const [page, setPage] = useState(1)

  const QUERY_KEY = ['admin-posts'] as const

  const { data: items } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await axios.get<{ data: RawAdminPost[] }>(
        '/api/posts?status=all',
      )
      return data.data.map(deserializePost)
    },
    initialData: posts,
    staleTime: Infinity,
    gcTime: 0,
  })

  const countFor = (status: StatusFilter) =>
    status === 'all'
      ? items.filter((p) => p.status !== 'archived').length
      : items.filter((p) => p.status === status).length

  const filtered = items.filter((p) => {
    const matchesStatus =
      filter === 'all' ? p.status !== 'archived' : p.status === filter
    const searchLower = search.toLowerCase()
    const title = p.titleEn ?? p.titleEs ?? ''
    const matchesSearch = title.toLowerCase().includes(searchLower)
    return matchesStatus && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_LIMIT))
  const effectivePage = Math.min(page, totalPages)
  const paginated = filtered.slice(
    (effectivePage - 1) * PAGE_LIMIT,
    effectivePage * PAGE_LIMIT,
  )

  function handleArchive(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setArchiveTargetId(id)
  }

  async function handleConfirmArchive() {
    /* istanbul ignore next */
    if (!archiveTargetId) return
    const id = archiveTargetId
    await axios.delete(`/api/posts/${id}/`)
    setArchiveTargetId(null)
    queryClient.setQueryData<AdminPost[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      return old.map((p) =>
        p.id === id ? { ...p, status: 'archived', deletedAt: new Date() } : p,
      )
    })
  }

  function handleCancelArchive() {
    setArchiveTargetId(null)
  }

  function handleHardDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setHardDeleteTargetId(id)
  }

  async function handleConfirmHardDelete() {
    /* istanbul ignore next */
    if (!hardDeleteTargetId) return
    const id = hardDeleteTargetId
    await axios.delete(`/api/posts/${id}/?hard=true`)
    setHardDeleteTargetId(null)
    queryClient.setQueryData<AdminPost[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      return old.filter((p) => p.id !== id)
    })
  }

  function handleCancelHardDelete() {
    setHardDeleteTargetId(null)
  }

  async function handleUnarchive(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    await axios.put(`/api/posts/${id}/`, { status: 'draft' })
    queryClient.setQueryData<AdminPost[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      return old.map((p) =>
        p.id === id ? { ...p, status: 'draft', deletedAt: null } : p,
      )
    })
  }

  function handleTogglePublish(e: React.MouseEvent, post: AdminPost) {
    e.stopPropagation()
    if (post.status !== 'published') {
      setPublishNotifyTarget(post)
      return
    }
    void axios.put(`/api/posts/${post.id}/`, { status: 'draft' })
    queryClient.setQueryData<AdminPost[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      return old.map((p) =>
        p.id === post.id ? { ...p, status: 'draft', publishedAt: null } : p,
      )
    })
  }

  async function handleConfirmPublish(post: AdminPost, notify: boolean) {
    setPublishNotifyTarget(null)
    await axios.put(`/api/posts/${post.id}/`, { status: 'published', notify })
    queryClient.setQueryData<AdminPost[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      return old.map((p) =>
        p.id === post.id
          ? { ...p, status: 'published', publishedAt: new Date() }
          : p,
      )
    })
  }

  const canPublish = (post: AdminPost) => !!(post.titleEn && post.titleEs)

  const allVisibleIds = paginated.map((p) => p.id)
  const allSelected =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id))
  const selectedPosts = filtered.filter((p) => selectedIds.has(p.id))

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedIds(new Set(allVisibleIds))
    } else {
      setSelectedIds(new Set())
    }
  }

  function handleSelectRow(e: React.ChangeEvent<HTMLInputElement>, id: string) {
    const next = new Set(selectedIds)
    if (e.target.checked) {
      next.add(id)
    } else {
      next.delete(id)
    }
    setSelectedIds(next)
  }

  function handleBulkPublish() {
    setBulkPublishPending(true)
  }

  async function handleConfirmBulkPublish(notify: boolean) {
    const toPublish = selectedPosts.filter(
      (p) => p.status !== 'published' && canPublish(p),
    )
    await Promise.all(
      toPublish.map((p) =>
        axios.put(`/api/posts/${p.id}/`, { status: 'published', notify }),
      ),
    )
    queryClient.setQueryData<AdminPost[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      const ids = new Set(toPublish.map((p) => p.id))
      return old.map((p) =>
        ids.has(p.id)
          ? { ...p, status: 'published', publishedAt: new Date() }
          : p,
      )
    })
    setBulkPublishPending(false)
    setSelectedIds(new Set())
  }

  function handleBulkUnpublish() {
    setBulkUnpublishPending(true)
  }

  async function handleConfirmBulkUnpublish() {
    const toUnpublish = selectedPosts.filter((p) => p.status === 'published')
    await Promise.all(
      toUnpublish.map((p) =>
        axios.put(`/api/posts/${p.id}/`, { status: 'draft' }),
      ),
    )
    queryClient.setQueryData<AdminPost[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      const ids = new Set(toUnpublish.map((p) => p.id))
      return old.map((p) =>
        ids.has(p.id) ? { ...p, status: 'draft', publishedAt: null } : p,
      )
    })
    setBulkUnpublishPending(false)
    setSelectedIds(new Set())
  }

  function handleBulkArchive() {
    setBulkArchivePending(true)
  }

  async function handleConfirmBulkArchive() {
    const toArchive = selectedPosts.filter(
      (p) => p.status !== 'archived' && p.status !== 'published',
    )
    await Promise.all(toArchive.map((p) => axios.delete(`/api/posts/${p.id}/`)))
    queryClient.setQueryData<AdminPost[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      const ids = new Set(toArchive.map((p) => p.id))
      return old.map((p) =>
        ids.has(p.id) ? { ...p, status: 'archived', deletedAt: new Date() } : p,
      )
    })
    setBulkArchivePending(false)
    setSelectedIds(new Set())
  }

  function handleBulkDelete() {
    setBulkDeletePending(true)
  }

  function handleBulkUnarchive() {
    setBulkUnarchivePending(true)
  }

  async function handleConfirmBulkUnarchive() {
    await Promise.all(
      selectedPosts.map((p) =>
        axios.put(`/api/posts/${p.id}/`, { status: 'draft' }),
      ),
    )
    queryClient.setQueryData<AdminPost[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      const ids = new Set(selectedPosts.map((p) => p.id))
      return old.map((p) =>
        ids.has(p.id) ? { ...p, status: 'draft', deletedAt: null } : p,
      )
    })
    setBulkUnarchivePending(false)
    setSelectedIds(new Set())
  }

  async function handleConfirmBulkDelete() {
    await Promise.all(
      selectedPosts.map((p) => axios.delete(`/api/posts/${p.id}/?hard=true`)),
    )
    queryClient.setQueryData<AdminPost[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      const ids = new Set(selectedPosts.map((p) => p.id))
      return old.filter((p) => !ids.has(p.id))
    })
    setBulkDeletePending(false)
    setSelectedIds(new Set())
  }

  return (
    <StyledWrapper data-testid="post-table">
      <StyledToolbar>
        <StyledLeftGroup>
          <StyledSearchInput
            type="search"
            placeholder={t('posts.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            data-testid="search-input"
          />
          <StyledFilterTabs data-testid="filter-tabs">
            {STATUS_FILTERS.map((s) => (
              <StyledFilterTab
                key={s}
                active={filter === s}
                onClick={() => {
                  setFilter(s)
                  setSelectedIds(new Set())
                  setPage(1)
                  const params = new URLSearchParams(searchParams.toString())
                  if (s === 'all') {
                    params.delete('filter')
                  } else {
                    params.set('filter', s)
                  }
                  const qs = params.toString()
                  router.push(qs ? `${pathname}?${qs}` : pathname, {
                    scroll: false,
                  })
                }}
                aria-pressed={filter === s}
                data-testid={`filter-${s}`}
              >
                {t(`posts.filters.${s}`)}
                <StyledCount>({countFor(s)})</StyledCount>
              </StyledFilterTab>
            ))}
          </StyledFilterTabs>
        </StyledLeftGroup>
        <StyledButtonGroup>
          {selectedIds.size > 0 && (
            <StyledBulkActions data-testid="bulk-actions">
              {filter !== 'archived' ? (
                <>
                  <StyledBulkPublishButton
                    onClick={handleBulkPublish}
                    data-testid="bulk-publish-button"
                  >
                    {t('posts.publish')}
                  </StyledBulkPublishButton>
                  <StyledBulkUnpublishButton
                    onClick={handleBulkUnpublish}
                    data-testid="bulk-unpublish-button"
                  >
                    {t('posts.unpublish')}
                  </StyledBulkUnpublishButton>
                  <StyledBulkArchiveButton
                    onClick={handleBulkArchive}
                    data-testid="bulk-archive-button"
                  >
                    {t('posts.archive')}
                  </StyledBulkArchiveButton>
                </>
              ) : (
                <>
                  <StyledBulkUnarchiveButton
                    onClick={handleBulkUnarchive}
                    data-testid="bulk-unarchive-button"
                  >
                    {t('posts.unarchive')}
                  </StyledBulkUnarchiveButton>
                  <StyledBulkDeleteButton
                    onClick={handleBulkDelete}
                    data-testid="bulk-delete-button"
                  >
                    {t('posts.hardDelete')}
                  </StyledBulkDeleteButton>
                </>
              )}
            </StyledBulkActions>
          )}
          <StyledRefreshButton
            variant="contained"
            size="sm"
            onClick={() =>
              void queryClient.invalidateQueries({ queryKey: QUERY_KEY })
            }
            data-testid="refresh-button"
          >
            {t('refresh')}
          </StyledRefreshButton>
          <StyledNewPostButton
            variant="inverted"
            size="sm"
            onClick={() => router.push('/admin/posts/new')}
            data-testid="new-post-button"
          >
            {t('posts.newPost')}
          </StyledNewPostButton>
        </StyledButtonGroup>
      </StyledToolbar>

      <StyledTable>
        <StyledThead>
          <tr>
            <StyledCheckboxTh>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                data-testid="select-all-checkbox"
              />
            </StyledCheckboxTh>
            <StyledTh>{t('posts.table.title')}</StyledTh>
            <StyledTh>{t('posts.table.status')}</StyledTh>
            <StyledTh>{t('posts.table.category')}</StyledTh>
            <StyledTh>{t('posts.table.translations')}</StyledTh>
            <StyledTh>{t('posts.table.published')}</StyledTh>
            <StyledTh>{t('posts.table.scheduledAt')}</StyledTh>
            <StyledTh>{t('posts.table.createdAt')}</StyledTh>
            <StyledTh>{t('posts.table.updatedAt')}</StyledTh>
            <StyledTh>{t('posts.table.archived')}</StyledTh>
            <StyledTh>{t('posts.table.actions')}</StyledTh>
          </tr>
        </StyledThead>
        <StyledTbody>
          {filtered.length === 0 && (
            <tr>
              <StyledTd colSpan={11}>
                <StyledEmpty>{t('posts.empty')}</StyledEmpty>
              </StyledTd>
            </tr>
          )}
          {paginated.map((post) => (
            <StyledTr key={post.id} data-testid="post-row">
              <StyledCheckboxTd>
                <input
                  type="checkbox"
                  checked={selectedIds.has(post.id)}
                  onChange={(e) => handleSelectRow(e, post.id)}
                  onClick={(e) => e.stopPropagation()}
                  data-testid="row-checkbox"
                />
              </StyledCheckboxTd>
              <StyledTd>
                <StyledTitle>
                  {post.titleEn ?? post.titleEs ?? (
                    <StyledEmDash>—</StyledEmDash>
                  )}
                </StyledTitle>
              </StyledTd>
              <StyledTd>
                <StyledStatusBadge $status={post.status}>
                  {post.status}
                </StyledStatusBadge>
              </StyledTd>
              <StyledTd>{post.category}</StyledTd>
              <StyledTd>
                <StyledLangChips>
                  <StyledLangChip
                    $present={!!post.titleEn}
                    data-testid="lang-chip-en"
                    data-present={post.titleEn ? 'true' : 'false'}
                  >
                    EN
                  </StyledLangChip>
                  <StyledLangChip
                    $present={!!post.titleEs}
                    data-testid="lang-chip-es"
                    data-present={post.titleEs ? 'true' : 'false'}
                  >
                    ES
                  </StyledLangChip>
                </StyledLangChips>
              </StyledTd>
              <StyledTd>
                {post.publishedAt ? (
                  new Date(post.publishedAt).toLocaleDateString()
                ) : (
                  <StyledEmDash>—</StyledEmDash>
                )}
              </StyledTd>
              <StyledTd>
                {post.scheduledAt ? (
                  new Date(post.scheduledAt).toLocaleDateString()
                ) : (
                  <StyledEmDash>—</StyledEmDash>
                )}
              </StyledTd>
              <StyledTd>
                {new Date(post.createdAt).toLocaleDateString()}
              </StyledTd>
              <StyledTd>
                {new Date(post.updatedAt).toLocaleDateString()}
              </StyledTd>
              <StyledTd>
                {post.deletedAt ? (
                  new Date(post.deletedAt).toLocaleDateString()
                ) : (
                  <StyledEmDash>—</StyledEmDash>
                )}
              </StyledTd>
              <StyledTd>
                <StyledActions>
                  <StyledEditButton
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/admin/posts/${post.id}`)
                    }}
                    data-testid="edit-button"
                  >
                    {t('posts.edit')}
                  </StyledEditButton>
                  {post.status !== 'archived' && (
                    <StyledPublishButton
                      onClick={(e) => handleTogglePublish(e, post)}
                      disabled={
                        post.status !== 'published' && !canPublish(post)
                      }
                      data-testid="publish-button"
                    >
                      {post.status === 'published'
                        ? t('posts.unpublish')
                        : t('posts.publish')}
                    </StyledPublishButton>
                  )}
                  {post.status === 'archived' ? (
                    <>
                      <StyledArchiveButton
                        onClick={(e) => handleUnarchive(e, post.id)}
                        data-testid="unarchive-button"
                      >
                        {t('posts.unarchive')}
                      </StyledArchiveButton>
                      <StyledHardDeleteButton
                        onClick={(e) => handleHardDelete(e, post.id)}
                        data-testid="hard-delete-button"
                      >
                        {t('posts.hardDelete')}
                      </StyledHardDeleteButton>
                    </>
                  ) : (
                    <StyledArchiveButton
                      onClick={(e) => handleArchive(e, post.id)}
                      disabled={post.status === 'published'}
                      title={
                        post.status === 'published'
                          ? t('posts.archiveDisabledPublished')
                          : undefined
                      }
                      data-testid="archive-button"
                    >
                      {t('posts.archive')}
                    </StyledArchiveButton>
                  )}
                </StyledActions>
              </StyledTd>
            </StyledTr>
          ))}
        </StyledTbody>
      </StyledTable>

      {totalPages > 1 && (
        <StyledPagination data-testid="pagination">
          <StyledPageButton
            onClick={() => setPage(effectivePage - 1)}
            disabled={effectivePage === 1}
            data-testid="pagination-prev"
          >
            {t('posts.pagination.prev')}
          </StyledPageButton>
          <StyledPageInfo data-testid="pagination-info">
            {t('posts.pagination.pageOf', {
              page: effectivePage,
              total: totalPages,
            })}
          </StyledPageInfo>
          <StyledPageButton
            onClick={() => setPage(effectivePage + 1)}
            disabled={effectivePage === totalPages}
            data-testid="pagination-next"
          >
            {t('posts.pagination.next')}
          </StyledPageButton>
        </StyledPagination>
      )}

      <ConfirmDeleteModal
        isOpen={archiveTargetId !== null}
        message={t('posts.archiveConfirm')}
        onConfirm={handleConfirmArchive}
        onCancel={handleCancelArchive}
        variant="warning"
      />
      <ConfirmDeleteModal
        isOpen={hardDeleteTargetId !== null}
        message={t('posts.hardDeleteConfirm')}
        onConfirm={handleConfirmHardDelete}
        onCancel={handleCancelHardDelete}
      />
      <PublishNotifyModal
        isOpen={!!publishNotifyTarget}
        onPublishAndNotify={() =>
          publishNotifyTarget &&
          void handleConfirmPublish(publishNotifyTarget, true)
        }
        onPublishOnly={() =>
          publishNotifyTarget &&
          void handleConfirmPublish(publishNotifyTarget, false)
        }
        onCancel={() => setPublishNotifyTarget(null)}
      />
      <PublishNotifyModal
        isOpen={bulkPublishPending}
        onPublishAndNotify={() => void handleConfirmBulkPublish(true)}
        onPublishOnly={() => void handleConfirmBulkPublish(false)}
        onCancel={() => setBulkPublishPending(false)}
      />
      <ConfirmDeleteModal
        isOpen={bulkUnpublishPending}
        message={t('posts.bulkUnpublishConfirm')}
        onConfirm={handleConfirmBulkUnpublish}
        onCancel={() => setBulkUnpublishPending(false)}
        variant="warning"
      />
      <ConfirmDeleteModal
        isOpen={bulkArchivePending}
        message={t('posts.bulkArchiveConfirm')}
        onConfirm={handleConfirmBulkArchive}
        onCancel={() => setBulkArchivePending(false)}
        variant="warning"
      />
      <ConfirmDeleteModal
        isOpen={bulkUnarchivePending}
        message={t('posts.bulkUnarchiveConfirm')}
        onConfirm={handleConfirmBulkUnarchive}
        onCancel={() => setBulkUnarchivePending(false)}
        variant="warning"
      />
      <ConfirmDeleteModal
        isOpen={bulkDeletePending}
        message={t('posts.bulkDeleteConfirm')}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeletePending(false)}
      />
    </StyledWrapper>
  )
}
