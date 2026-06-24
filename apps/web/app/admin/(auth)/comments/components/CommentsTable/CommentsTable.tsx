'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'

import { ConfirmDeleteModal } from '@web/app/admin/(auth)/components/ConfirmDeleteModal'
import { useClientTranslation } from '@web/i18n/client'
import type { CommentRecord } from '@web/lib/db/queries/comments'
import type { CommentStatus } from '@web/lib/db/schema'

import {
  StyledActions,
  StyledApproveButton,
  StyledBodyText,
  StyledBulkActions,
  StyledBulkApproveButton,
  StyledBulkDeleteButton,
  StyledBulkRejectButton,
  StyledButtonGroup,
  StyledCheckboxTd,
  StyledCheckboxTh,
  StyledDeleteButton,
  StyledEmpty,
  StyledExpandToggle,
  StyledFilterButton,
  StyledFilterGroup,
  StyledRefreshButton,
  StyledRejectButton,
  StyledStatusBadge,
  StyledTable,
  StyledTbody,
  StyledTd,
  StyledTh,
  StyledThead,
  StyledToolbar,
  StyledTr,
  StyledWrapper,
} from './CommentsTable.styles'

type StatusFilter = CommentStatus | 'all'

const STATUS_FILTERS: StatusFilter[] = [
  'all',
  'pending',
  'approved',
  'rejected',
]

const QUERY_KEY = (status: StatusFilter) => ['admin-comments', status] as const

interface CommentsTableProps {
  initialComments: CommentRecord[]
}

export function CommentsTable({ initialComments }: CommentsTableProps) {
  const { t } = useClientTranslation('admin')
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [bulkDeletePending, setBulkDeletePending] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data: comments, refetch } = useQuery({
    queryKey: QUERY_KEY(statusFilter),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const { data } = await axios.get<{ comments: CommentRecord[] }>(
        `/api/comments?${params.toString()}`,
      )
      return data.comments
    },
    initialData: statusFilter === 'pending' ? initialComments : undefined,
    staleTime: Infinity,
    gcTime: 0,
  })

  async function handleStatusChange(id: string, status: CommentStatus) {
    await axios.patch(`/api/comments/${id}`, { status })
    queryClient.setQueryData<CommentRecord[]>(
      QUERY_KEY(statusFilter),
      /* istanbul ignore next */
      (old) => old?.filter((c) => c.id !== id) ?? [],
    )
  }

  function handleDeleteClick(id: string) {
    setDeleteTargetId(id)
  }

  async function handleConfirmDelete() {
    /* istanbul ignore next */
    if (!deleteTargetId) return
    const id = deleteTargetId
    await axios.delete(`/api/comments/${id}`)
    setDeleteTargetId(null)
    queryClient.setQueryData<CommentRecord[]>(
      QUERY_KEY(statusFilter),
      /* istanbul ignore next */
      (old) => old?.filter((c) => c.id !== id) ?? [],
    )
  }

  function handleCancelDelete() {
    setDeleteTargetId(null)
  }

  function handleToggleExpand(id: string) {
    const next = new Set(expandedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setExpandedIds(next)
  }

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedIds(new Set(displayed.map((c) => c.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  function handleSelectRow(e: React.ChangeEvent<HTMLInputElement>, id: string) {
    const next = new Set(selectedIds)
    if (e.target.checked) next.add(id)
    else next.delete(id)
    setSelectedIds(next)
  }

  async function handleBulkApprove() {
    const ids = [...selectedIds]
    await Promise.all(
      ids.map((id) =>
        axios.patch(`/api/comments/${id}`, { status: 'approved' }),
      ),
    )
    queryClient.setQueryData<CommentRecord[]>(
      QUERY_KEY(statusFilter),
      /* istanbul ignore next */
      (old) => old?.filter((c) => !ids.includes(c.id)) ?? [],
    )
    setSelectedIds(new Set())
  }

  async function handleBulkReject() {
    const ids = [...selectedIds]
    await Promise.all(
      ids.map((id) =>
        axios.patch(`/api/comments/${id}`, { status: 'rejected' }),
      ),
    )
    queryClient.setQueryData<CommentRecord[]>(
      QUERY_KEY(statusFilter),
      /* istanbul ignore next */
      (old) => old?.filter((c) => !ids.includes(c.id)) ?? [],
    )
    setSelectedIds(new Set())
  }

  async function handleConfirmBulkDelete() {
    const ids = [...selectedIds]

    const idsToDelete = new Set(ids)
    await Promise.all(ids.map((id) => axios.delete(`/api/comments/${id}`)))
    queryClient.setQueryData<CommentRecord[]>(
      QUERY_KEY(statusFilter),
      /* istanbul ignore next */
      (old) => old?.filter((c) => !idsToDelete.has(c.id)) ?? [],
    )
    setBulkDeletePending(false)
    setSelectedIds(new Set())
  }

  const displayed = comments ?? []
  const allSelected =
    displayed.length > 0 && displayed.every((c) => selectedIds.has(c.id))

  return (
    <StyledWrapper data-testid="comments-table">
      <StyledToolbar>
        <StyledFilterGroup data-testid="status-filters">
          {STATUS_FILTERS.map((s) => (
            <StyledFilterButton
              key={s}
              $active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              data-testid={`filter-${s}`}
            >
              {t(`comments.filters.${s}`)}
            </StyledFilterButton>
          ))}
        </StyledFilterGroup>
        <StyledButtonGroup>
          {selectedIds.size > 0 && (
            <StyledBulkActions data-testid="bulk-actions">
              <StyledBulkApproveButton
                onClick={() => void handleBulkApprove()}
                data-testid="bulk-approve-button"
              >
                {t('comments.approve')}
              </StyledBulkApproveButton>
              <StyledBulkRejectButton
                onClick={() => void handleBulkReject()}
                data-testid="bulk-reject-button"
              >
                {t('comments.reject')}
              </StyledBulkRejectButton>
              <StyledBulkDeleteButton
                onClick={() => setBulkDeletePending(true)}
                data-testid="bulk-delete-button"
              >
                {t('comments.delete')}
              </StyledBulkDeleteButton>
            </StyledBulkActions>
          )}
          <StyledRefreshButton
            variant="contained"
            size="sm"
            onClick={() => void refetch()}
            data-testid="refresh-button"
          >
            {t('refresh')}
          </StyledRefreshButton>
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
            <StyledTh>{t('comments.table.username')}</StyledTh>
            <StyledTh>{t('comments.table.body')}</StyledTh>
            <StyledTh>{t('comments.table.status')}</StyledTh>
            <StyledTh>{t('comments.table.createdAt')}</StyledTh>
            <StyledTh>{t('comments.table.actions')}</StyledTh>
          </tr>
        </StyledThead>
        <StyledTbody>
          {displayed.length === 0 && (
            <tr>
              <StyledTd colSpan={6}>
                <StyledEmpty>{t('comments.empty')}</StyledEmpty>
              </StyledTd>
            </tr>
          )}
          {displayed.map((comment) => (
            <StyledTr key={comment.id} data-testid="comment-row">
              <StyledCheckboxTd>
                <input
                  type="checkbox"
                  checked={selectedIds.has(comment.id)}
                  onChange={(e) => handleSelectRow(e, comment.id)}
                  data-testid="row-checkbox"
                />
              </StyledCheckboxTd>
              <StyledTd>{comment.username}</StyledTd>
              <StyledTd>
                <StyledBodyText
                  $expanded={expandedIds.has(comment.id)}
                  onClick={() => handleToggleExpand(comment.id)}
                >
                  {comment.body}
                </StyledBodyText>
                <StyledExpandToggle
                  type="button"
                  onClick={() => handleToggleExpand(comment.id)}
                  data-testid="expand-toggle"
                >
                  {expandedIds.has(comment.id)
                    ? t('comments.showLess')
                    : t('comments.showMore')}
                </StyledExpandToggle>
              </StyledTd>
              <StyledTd>
                <StyledStatusBadge
                  $status={comment.status}
                  data-testid="status-badge"
                >
                  {t(`comments.status.${comment.status}`)}
                </StyledStatusBadge>
              </StyledTd>
              <StyledTd>
                {new Date(comment.createdAt).toLocaleDateString('en-GB')}
              </StyledTd>
              <StyledTd>
                <StyledActions>
                  {comment.status !== 'approved' && (
                    <StyledApproveButton
                      onClick={() =>
                        void handleStatusChange(comment.id, 'approved')
                      }
                      data-testid="approve-button"
                    >
                      {t('comments.approve')}
                    </StyledApproveButton>
                  )}
                  {comment.status !== 'rejected' && (
                    <StyledRejectButton
                      onClick={() =>
                        void handleStatusChange(comment.id, 'rejected')
                      }
                      data-testid="reject-button"
                    >
                      {t('comments.reject')}
                    </StyledRejectButton>
                  )}
                  <StyledDeleteButton
                    onClick={() => handleDeleteClick(comment.id)}
                    data-testid="delete-button"
                  >
                    {t('comments.delete')}
                  </StyledDeleteButton>
                </StyledActions>
              </StyledTd>
            </StyledTr>
          ))}
        </StyledTbody>
      </StyledTable>

      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        message={t('comments.deleteConfirm')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <ConfirmDeleteModal
        isOpen={bulkDeletePending}
        message={t('comments.bulkDeleteConfirm')}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeletePending(false)}
      />
    </StyledWrapper>
  )
}
