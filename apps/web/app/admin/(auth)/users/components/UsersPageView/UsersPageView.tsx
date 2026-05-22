'use client'

import axios, { isAxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Select } from '@sdlgr/select'

import { useClientTranslation } from '@web/i18n/client'
import type { UserRecord } from '@web/lib/db/queries/users'
import type { UserRole } from '@web/lib/db/schema'

import {
  StyledActions,
  StyledButtonGroup,
  StyledContent,
  StyledDeleteButton,
  StyledEditButton,
  StyledEmpty,
  StyledHeader,
  StyledHeading,
  StyledNewUserButton,
  StyledPage,
  StyledRefreshButton,
  StyledRoleBadge,
  StyledRoleSelectWrapper,
  StyledSearchInput,
  StyledTable,
  StyledTbody,
  StyledTd,
  StyledTh,
  StyledThead,
  StyledToolbar,
  StyledTr,
} from './UsersPageView.styles'

interface UsersPageViewProps {
  users: UserRecord[]
  title: string
}

export function UsersPageView({
  users: initialUsers,
  title,
}: UsersPageViewProps) {
  const { t } = useClientTranslation('admin')
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.name?.toLowerCase().includes(q) ?? false)
    )
  })

  async function handleDelete(id: string) {
    try {
      await axios.delete(`/api/users/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.error : null
      alert(message ?? t('users.form.error'))
    } finally {
      setDeleteConfirm(null)
    }
  }

  async function handleRoleChange(id: string, role: UserRole) {
    try {
      const { data } = await axios.patch<
        UserRecord & { createdAt: string; updatedAt: string }
      >(`/api/users/${id}`, { role })
      const updated: UserRecord = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.error : null
      alert(message ?? t('users.form.error'))
    }
  }

  return (
    <StyledPage data-testid="users-page">
      <StyledHeader>
        <StyledHeading>{title}</StyledHeading>
      </StyledHeader>
      <StyledContent>
        <StyledToolbar>
          <StyledSearchInput
            type="search"
            placeholder={t('users.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="search-input"
          />
          <StyledButtonGroup>
            <StyledRefreshButton
              variant="contained"
              size="sm"
              onClick={() => router.refresh()}
              data-testid="refresh-button"
            >
              {t('refresh')}
            </StyledRefreshButton>
            <StyledNewUserButton
              variant="inverted"
              size="sm"
              onClick={() => router.push('/admin/users/new')}
              data-testid="new-user-button"
            >
              {t('users.newUser')}
            </StyledNewUserButton>
          </StyledButtonGroup>
        </StyledToolbar>

        {filtered.length === 0 ? (
          <StyledEmpty data-testid="users-empty">
            {t('users.empty')}
          </StyledEmpty>
        ) : (
          <StyledTable data-testid="users-table">
            <StyledThead>
              <tr>
                <StyledTh>{t('users.table.email')}</StyledTh>
                <StyledTh>{t('users.table.name')}</StyledTh>
                <StyledTh>{t('users.table.role')}</StyledTh>
                <StyledTh>{t('users.table.createdAt')}</StyledTh>
                <StyledTh>{t('users.table.updatedAt')}</StyledTh>
                <StyledTh>{t('users.table.actions')}</StyledTh>
              </tr>
            </StyledThead>
            <StyledTbody>
              {filtered.map((user) => (
                <StyledTr key={user.id} data-testid={`user-row-${user.id}`}>
                  <StyledTd>{user.email}</StyledTd>
                  <StyledTd>{user.name}</StyledTd>
                  <StyledTd>
                    <StyledRoleBadge $role={user.role}>
                      {t(`users.roles.${user.role}`)}
                    </StyledRoleBadge>
                  </StyledTd>
                  <StyledTd>
                    {user.createdAt.toLocaleDateString('en-GB')}
                  </StyledTd>
                  <StyledTd>
                    {user.updatedAt.toLocaleDateString('en-GB')}
                  </StyledTd>
                  <StyledTd>
                    <StyledActions>
                      <StyledRoleSelectWrapper>
                        <Select
                          value={user.role}
                          onChange={(value) =>
                            handleRoleChange(user.id, value as UserRole)
                          }
                          options={[
                            { value: 'admin', label: t('users.roles.admin') },
                            { value: 'editor', label: t('users.roles.editor') },
                            { value: 'user', label: t('users.roles.user') },
                          ]}
                          data-testid={`role-select-${user.id}`}
                        />
                      </StyledRoleSelectWrapper>
                      <StyledEditButton
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        data-testid={`edit-user-${user.id}`}
                      >
                        {t('users.form.edit')}
                      </StyledEditButton>
                      {deleteConfirm === user.id ? (
                        <>
                          <StyledDeleteButton
                            onClick={() => handleDelete(user.id)}
                            data-testid={`delete-confirm-${user.id}`}
                          >
                            {t('confirmDelete.confirm')}
                          </StyledDeleteButton>
                          <StyledDeleteButton
                            onClick={() => setDeleteConfirm(null)}
                            data-testid={`delete-cancel-${user.id}`}
                          >
                            {t('confirmDelete.cancel')}
                          </StyledDeleteButton>
                        </>
                      ) : (
                        <StyledDeleteButton
                          onClick={() => setDeleteConfirm(user.id)}
                          data-testid={`delete-${user.id}`}
                        >
                          {t('users.delete')}
                        </StyledDeleteButton>
                      )}
                    </StyledActions>
                  </StyledTd>
                </StyledTr>
              ))}
            </StyledTbody>
          </StyledTable>
        )}
      </StyledContent>
    </StyledPage>
  )
}
