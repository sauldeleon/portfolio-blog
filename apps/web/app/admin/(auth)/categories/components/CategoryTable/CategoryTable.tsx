'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useClientTranslation } from '@web/i18n/client'
import type { CategoryWithCount } from '@web/lib/db/queries/categories'

import {
  StyledActions,
  StyledCancelButton,
  StyledCreateError,
  StyledCreateForm,
  StyledCreateInput,
  StyledDeleteButton,
  StyledEditButton,
  StyledEditInput,
  StyledEmpty,
  StyledName,
  StyledNewButton,
  StyledPostCount,
  StyledSaveButton,
  StyledSearchInput,
  StyledSlug,
  StyledTable,
  StyledTbody,
  StyledTd,
  StyledTh,
  StyledThead,
  StyledToolbar,
  StyledTr,
  StyledWrapper,
} from './CategoryTable.styles'

interface CategoryTableProps {
  categories: CategoryWithCount[]
}

export function CategoryTable({ categories }: CategoryTableProps) {
  const { t } = useClientTranslation('admin')
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [newSlug, setNewSlug] = useState('')
  const [newName, setNewName] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [editSlug, setEditSlug] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const filtered = categories.filter((c) => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.slug.includes(q)
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: newSlug, name: newName }),
    })
    if (!res.ok) {
      const data = await res.json()
      setCreateError(
        typeof data.error === 'string' ? data.error : t('categories.empty'),
      )
      return
    }
    setNewSlug('')
    setNewName('')
    setCreateError(null)
    setCreating(false)
    router.refresh()
  }

  function handleStartEdit(cat: CategoryWithCount) {
    setEditSlug(cat.slug)
    setEditName(cat.name)
  }

  function handleCancelEdit() {
    setEditSlug(null)
    setEditName('')
  }

  async function handleSaveEdit(slug: string) {
    await fetch(`/api/categories/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    setEditSlug(null)
    setEditName('')
    router.refresh()
  }

  async function handleDelete(slug: string) {
    if (!window.confirm(t('categories.deleteConfirm'))) return
    const res = await fetch(`/api/categories/${slug}`, { method: 'DELETE' })
    if (res.status === 409) {
      window.alert(t('categories.deleteBlocked'))
      return
    }
    router.refresh()
  }

  return (
    <StyledWrapper data-testid="category-table">
      <StyledToolbar>
        <StyledSearchInput
          type="search"
          placeholder={t('categories.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="search-input"
        />
        {!creating && (
          <StyledNewButton
            onClick={() => setCreating(true)}
            data-testid="new-category-button"
          >
            {t('categories.newCategory')}
          </StyledNewButton>
        )}
      </StyledToolbar>

      {creating && (
        <StyledCreateForm onSubmit={handleCreate} data-testid="create-form">
          <StyledCreateInput
            type="text"
            placeholder={t('categories.slugPlaceholder')}
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            required
            data-testid="new-slug-input"
          />
          <StyledCreateInput
            type="text"
            placeholder={t('categories.namePlaceholder')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            data-testid="new-name-input"
          />
          <StyledSaveButton type="submit" data-testid="create-submit">
            {t('categories.add')}
          </StyledSaveButton>
          <StyledCancelButton
            type="button"
            onClick={() => setCreating(false)}
            data-testid="create-cancel"
          >
            {t('categories.cancel')}
          </StyledCancelButton>
          {createError && (
            <StyledCreateError data-testid="create-error">
              {createError}
            </StyledCreateError>
          )}
        </StyledCreateForm>
      )}

      <StyledTable>
        <StyledThead>
          <tr>
            <StyledTh>{t('categories.table.name')}</StyledTh>
            <StyledTh>{t('categories.table.slug')}</StyledTh>
            <StyledTh>{t('categories.table.posts')}</StyledTh>
            <StyledTh>{t('categories.table.actions')}</StyledTh>
          </tr>
        </StyledThead>
        <StyledTbody>
          {filtered.length === 0 && (
            <tr>
              <StyledTd colSpan={4}>
                <StyledEmpty>{t('categories.empty')}</StyledEmpty>
              </StyledTd>
            </tr>
          )}
          {filtered.map((cat) => (
            <StyledTr key={cat.slug} data-testid="category-row">
              <StyledTd>
                {editSlug === cat.slug ? (
                  <StyledEditInput
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    data-testid="edit-name-input"
                  />
                ) : (
                  <StyledName>{cat.name}</StyledName>
                )}
              </StyledTd>
              <StyledTd>
                <StyledSlug>{cat.slug}</StyledSlug>
              </StyledTd>
              <StyledTd>
                <StyledPostCount>{cat.postCount}</StyledPostCount>
              </StyledTd>
              <StyledTd>
                <StyledActions>
                  {editSlug === cat.slug ? (
                    <>
                      <StyledSaveButton
                        onClick={() => handleSaveEdit(cat.slug)}
                        data-testid="save-button"
                      >
                        {t('categories.save')}
                      </StyledSaveButton>
                      <StyledCancelButton
                        onClick={handleCancelEdit}
                        data-testid="cancel-button"
                      >
                        {t('categories.cancel')}
                      </StyledCancelButton>
                    </>
                  ) : (
                    <>
                      <StyledEditButton
                        onClick={() => handleStartEdit(cat)}
                        data-testid="edit-button"
                      >
                        {t('categories.edit')}
                      </StyledEditButton>
                      <StyledDeleteButton
                        onClick={() => handleDelete(cat.slug)}
                        data-testid="delete-button"
                      >
                        {t('categories.delete')}
                      </StyledDeleteButton>
                    </>
                  )}
                </StyledActions>
              </StyledTd>
            </StyledTr>
          ))}
        </StyledTbody>
      </StyledTable>
    </StyledWrapper>
  )
}
