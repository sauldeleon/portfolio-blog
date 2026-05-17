'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ConfirmDeleteModal } from '@web/app/admin/(auth)/components/ConfirmDeleteModal'
import { useClientTranslation } from '@web/i18n/client'
import type { AdminPost } from '@web/lib/db/queries/posts'

import {
  StyledActions,
  StyledArchiveButton,
  StyledButtonGroup,
  StyledCount,
  StyledEmDash,
  StyledEmpty,
  StyledFilterTab,
  StyledFilterTabs,
  StyledHardDeleteButton,
  StyledLangChip,
  StyledLangChips,
  StyledLeftGroup,
  StyledNewPostButton,
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

type StatusFilter = 'all' | 'published' | 'draft' | 'archived'

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

const STATUS_FILTERS: StatusFilter[] = ['all', 'published', 'draft', 'archived']

interface PostTableProps {
  posts: AdminPost[]
}

export function PostTable({ posts }: PostTableProps) {
  const { t } = useClientTranslation('admin')
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null)
  const [hardDeleteTargetId, setHardDeleteTargetId] = useState<string | null>(
    null,
  )
  const router = useRouter()

  const QUERY_KEY = ['admin-posts'] as const

  const { data: items, refetch } = useQuery({
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

  async function handleTogglePublish(e: React.MouseEvent, post: AdminPost) {
    e.stopPropagation()
    const isPublished = post.status === 'published'
    const newStatus = isPublished ? 'draft' : 'published'
    await axios.put(`/api/posts/${post.id}/`, { status: newStatus })
    queryClient.setQueryData<AdminPost[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      return old.map((p) =>
        p.id === post.id
          ? {
              ...p,
              status: newStatus,
              publishedAt: newStatus === 'published' ? new Date() : null,
            }
          : p,
      )
    })
  }

  const canPublish = (post: AdminPost) => !!(post.titleEn && post.titleEs)

  return (
    <StyledWrapper data-testid="post-table">
      <StyledToolbar>
        <StyledLeftGroup>
          <StyledSearchInput
            type="search"
            placeholder={t('posts.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="search-input"
          />
          <StyledFilterTabs data-testid="filter-tabs">
            {STATUS_FILTERS.map((s) => (
              <StyledFilterTab
                key={s}
                active={filter === s}
                onClick={() => setFilter(s)}
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
          <StyledRefreshButton
            variant="contained"
            size="sm"
            onClick={() => void refetch()}
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
            <StyledTh>{t('posts.table.title')}</StyledTh>
            <StyledTh>{t('posts.table.status')}</StyledTh>
            <StyledTh>{t('posts.table.category')}</StyledTh>
            <StyledTh>{t('posts.table.translations')}</StyledTh>
            <StyledTh>{t('posts.table.published')}</StyledTh>
            <StyledTh>{t('posts.table.createdAt')}</StyledTh>
            <StyledTh>{t('posts.table.updatedAt')}</StyledTh>
            <StyledTh>{t('posts.table.archived')}</StyledTh>
            <StyledTh>{t('posts.table.actions')}</StyledTh>
          </tr>
        </StyledThead>
        <StyledTbody>
          {filtered.length === 0 && (
            <tr>
              <StyledTd colSpan={9}>
                <StyledEmpty>{t('posts.empty')}</StyledEmpty>
              </StyledTd>
            </tr>
          )}
          {filtered.map((post) => (
            <StyledTr
              key={post.id}
              data-testid="post-row"
              onClick={() => router.push(`/admin/posts/${post.id}`)}
            >
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
    </StyledWrapper>
  )
}
