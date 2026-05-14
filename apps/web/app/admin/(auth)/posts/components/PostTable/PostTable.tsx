'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useClientTranslation } from '@web/i18n/client'
import type { AdminPost } from '@web/lib/db/queries/posts'

import {
  StyledActions,
  StyledCount,
  StyledDeleteButton,
  StyledEmDash,
  StyledEmpty,
  StyledFilterTab,
  StyledFilterTabs,
  StyledLangChip,
  StyledLangChips,
  StyledPublishButton,
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

const STATUS_FILTERS: StatusFilter[] = ['all', 'published', 'draft', 'archived']

interface PostTableProps {
  posts: AdminPost[]
}

export function PostTable({ posts }: PostTableProps) {
  const { t } = useClientTranslation('admin')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const router = useRouter()

  const countFor = (status: StatusFilter) =>
    status === 'all'
      ? posts.length
      : posts.filter((p) => p.status === status).length

  const filtered = posts.filter((p) => {
    const matchesStatus = filter === 'all' || p.status === filter
    const searchLower = search.toLowerCase()
    const title = p.titleEn ?? p.titleEs ?? ''
    const matchesSearch = title.toLowerCase().includes(searchLower)
    return matchesStatus && matchesSearch
  })

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!window.confirm(t('posts.deleteConfirm'))) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function handleTogglePublish(e: React.MouseEvent, post: AdminPost) {
    e.stopPropagation()
    const isPublished = post.status === 'published'
    await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        isPublished
          ? { status: 'draft', publishedAt: null }
          : { status: 'published', publishedAt: new Date().toISOString() },
      ),
    })
    router.refresh()
  }

  const canPublish = (post: AdminPost) => !!(post.titleEn && post.titleEs)

  return (
    <StyledWrapper data-testid="post-table">
      <StyledToolbar>
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
        <StyledSearchInput
          type="search"
          placeholder={t('posts.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="search-input"
        />
      </StyledToolbar>

      <StyledTable>
        <StyledThead>
          <tr>
            <StyledTh>{t('posts.table.title')}</StyledTh>
            <StyledTh>{t('posts.table.status')}</StyledTh>
            <StyledTh>{t('posts.table.category')}</StyledTh>
            <StyledTh>{t('posts.table.translations')}</StyledTh>
            <StyledTh>{t('posts.table.published')}</StyledTh>
            <StyledTh>{t('posts.table.actions')}</StyledTh>
          </tr>
        </StyledThead>
        <StyledTbody>
          {filtered.length === 0 && (
            <tr>
              <StyledTd colSpan={6}>
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
                <StyledActions>
                  <StyledPublishButton
                    $published={post.status === 'published'}
                    onClick={(e) => handleTogglePublish(e, post)}
                    disabled={post.status !== 'published' && !canPublish(post)}
                    data-testid="publish-button"
                  >
                    {post.status === 'published'
                      ? t('posts.unpublish')
                      : t('posts.publish')}
                  </StyledPublishButton>
                  <StyledDeleteButton
                    onClick={(e) => handleDelete(e, post.id)}
                    data-testid="delete-button"
                  >
                    {t('posts.delete')}
                  </StyledDeleteButton>
                </StyledActions>
              </StyledTd>
            </StyledTr>
          ))}
        </StyledTbody>
      </StyledTable>
    </StyledWrapper>
  )
}
