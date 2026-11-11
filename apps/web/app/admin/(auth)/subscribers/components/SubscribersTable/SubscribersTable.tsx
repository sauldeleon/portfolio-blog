'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'

import { AdminPagination } from '@web/app/admin/(auth)/components/AdminPagination'
import type { AdminStatusTone } from '@web/app/admin/(auth)/components/AdminTable/AdminTable.styles'
import {
  ADMIN_PAGE_SIZE,
  useUrlPagination,
} from '@web/app/admin/(auth)/hooks/useUrlPagination'
import { useClientTranslation } from '@web/i18n/client'
import type { AdminSubscriptionRecord } from '@web/lib/db/queries/subscriptions'
import type { SubscriptionStatus } from '@web/lib/db/schema'
import type { SubscriptionDetails } from '@web/lib/subscriptions/schema'

import { EditSubscriptionModal } from '../EditSubscriptionModal'
import {
  StyledActions,
  StyledButtonGroup,
  StyledCount,
  StyledEditButton,
  StyledEmpty,
  StyledRefreshButton,
  StyledSearchGroup,
  StyledSearchInput,
  StyledStatusBadge,
  StyledTable,
  StyledTbody,
  StyledTd,
  StyledTh,
  StyledThead,
  StyledToggleLabel,
  StyledToolbar,
  StyledTr,
  StyledWrapper,
} from './SubscribersTable.styles'

const QUERY_KEY = ['admin-subscriptions'] as const

const STATUS_TONE: Record<SubscriptionStatus, AdminStatusTone> = {
  active: 'success',
  pending: 'warning',
  unsubscribed: 'danger',
}

export const PAGE_LIMIT = ADMIN_PAGE_SIZE

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

interface SubscribersTableProps {
  initialSubscriptions: AdminSubscriptionRecord[]
}

export function SubscribersTable({
  initialSubscriptions,
}: SubscribersTableProps) {
  const { t } = useClientTranslation('admin')
  const queryClient = useQueryClient()
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<AdminSubscriptionRecord | null>(null)

  const { data: subscriptions, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await axios.get<{
        subscriptions: AdminSubscriptionRecord[]
      }>('/api/subscriptions')
      return data.subscriptions
    },
    initialData: initialSubscriptions,
    staleTime: Infinity,
    gcTime: 0,
  })

  function patchInCache(id: string, patch: Partial<AdminSubscriptionRecord>) {
    queryClient.setQueryData<AdminSubscriptionRecord[]>(
      QUERY_KEY,
      /* istanbul ignore next */
      (old) => old?.map((s) => (s.id === id ? { ...s, ...patch } : s)) ?? [],
    )
  }

  function setPending(id: string, pending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev)
      if (pending) next.add(id)
      else next.delete(id)
      return next
    })
  }

  async function handleToggle(id: string, enabled: boolean) {
    setPending(id, true)
    patchInCache(id, { enabled })
    try {
      await axios.patch(`/api/subscriptions/${id}`, { enabled })
    } catch {
      patchInCache(id, { enabled: !enabled })
    } finally {
      setPending(id, false)
    }
  }

  async function handleSaveDetails(id: string, values: SubscriptionDetails) {
    await axios.patch(`/api/subscriptions/${id}`, values)
    patchInCache(id, values)
    setEditing(null)
  }

  const query = normalize(search.trim())
  const filtered = query
    ? subscriptions.filter((s) => normalize(s.name).includes(query))
    : subscriptions
  const { page, pageItems: displayed, resetPage } = useUrlPagination(filtered)
  const enabledCount = subscriptions.filter(
    (s) => s.status === 'active' && s.enabled,
  ).length

  return (
    <StyledWrapper data-testid="subscribers-table">
      <StyledToolbar>
        <StyledSearchGroup>
          <StyledSearchInput
            type="search"
            placeholder={t('subscribers.searchPlaceholder')}
            aria-label={t('subscribers.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              resetPage()
            }}
            data-testid="search-input"
          />
          <StyledCount data-testid="subscribers-count">
            {t('subscribers.count', {
              count: enabledCount,
              total: subscriptions.length,
            })}
          </StyledCount>
        </StyledSearchGroup>
        <StyledButtonGroup>
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
            <StyledTh>{t('subscribers.table.name')}</StyledTh>
            <StyledTh>{t('subscribers.table.email')}</StyledTh>
            <StyledTh>{t('subscribers.table.status')}</StyledTh>
            <StyledTh>{t('subscribers.table.locale')}</StyledTh>
            <StyledTh>{t('subscribers.table.createdAt')}</StyledTh>
            <StyledTh>{t('subscribers.table.enabled')}</StyledTh>
            <StyledTh>{t('subscribers.table.actions')}</StyledTh>
          </tr>
        </StyledThead>
        <StyledTbody>
          {displayed.length === 0 && (
            <tr>
              <StyledTd colSpan={7}>
                <StyledEmpty>
                  {query ? t('subscribers.noResults') : t('subscribers.empty')}
                </StyledEmpty>
              </StyledTd>
            </tr>
          )}
          {displayed.map((subscription) => {
            const isActive = subscription.status === 'active'
            return (
              <StyledTr
                key={subscription.id}
                $disabled={!isActive || !subscription.enabled}
                data-testid="subscriber-row"
              >
                <StyledTd>{subscription.name}</StyledTd>
                <StyledTd>{subscription.email}</StyledTd>
                <StyledTd>
                  <StyledStatusBadge
                    $tone={STATUS_TONE[subscription.status]}
                    data-testid="status-badge"
                  >
                    {t(`subscribers.status.${subscription.status}`)}
                  </StyledStatusBadge>
                </StyledTd>
                <StyledTd>{subscription.locale.toUpperCase()}</StyledTd>
                <StyledTd>
                  {new Date(subscription.createdAt).toLocaleDateString('en-GB')}
                </StyledTd>
                <StyledTd>
                  <StyledToggleLabel
                    title={isActive ? undefined : t('subscribers.inactiveHint')}
                  >
                    <input
                      type="checkbox"
                      checked={subscription.enabled}
                      disabled={!isActive || pendingIds.has(subscription.id)}
                      onChange={(e) =>
                        void handleToggle(subscription.id, e.target.checked)
                      }
                      aria-label={t('subscribers.toggleLabel', {
                        email: subscription.email,
                      })}
                      data-testid="enabled-checkbox"
                    />
                    {subscription.enabled
                      ? t('subscribers.enabled')
                      : t('subscribers.disabled')}
                  </StyledToggleLabel>
                </StyledTd>
                <StyledTd>
                  <StyledActions>
                    <StyledEditButton
                      onClick={() => setEditing(subscription)}
                      data-testid="edit-button"
                    >
                      {t('subscribers.edit')}
                    </StyledEditButton>
                  </StyledActions>
                </StyledTd>
              </StyledTr>
            )
          })}
        </StyledTbody>
      </StyledTable>

      <AdminPagination total={filtered.length} page={page} />

      {editing && (
        <EditSubscriptionModal
          subscription={editing}
          onSave={(values) => handleSaveDetails(editing.id, values)}
          onClose={() => setEditing(null)}
        />
      )}
    </StyledWrapper>
  )
}
