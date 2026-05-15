'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ConfirmDeleteModal } from '@web/app/admin/(auth)/components/ConfirmDeleteModal'
import { useClientTranslation } from '@web/i18n/client'
import type {
  CategoryForAdmin,
  CategoryTranslation,
} from '@web/lib/db/queries/categories'
import { slugify } from '@web/utils/slugify'

import {
  StyledActions,
  StyledButtonGroup,
  StyledCancelButton,
  StyledDeleteButton,
  StyledEditButton,
  StyledEditInput,
  StyledEmpty,
  StyledLocaleTab,
  StyledLocaleTabs,
  StyledName,
  StyledNewButton,
  StyledPostCount,
  StyledRefreshButton,
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
  categories: CategoryForAdmin[]
}

function getTranslation(cat: CategoryForAdmin, locale: 'en' | 'es') {
  return cat.translations.find((t) => t.locale === locale)
}

function getDisplayName(cat: CategoryForAdmin): string {
  return getTranslation(cat, 'en')?.name ?? cat.slug
}

const QUERY_KEY = ['admin-categories'] as const

export function CategoryTable({ categories }: CategoryTableProps) {
  const { t } = useClientTranslation('admin')
  const queryClient = useQueryClient()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [editSlug, setEditSlug] = useState<string | null>(null)
  const [editLocale, setEditLocale] = useState<'en' | 'es'>('en')
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLocaleSlug, setEditLocaleSlug] = useState('')
  const [editSlugManuallyEdited, setEditSlugManuallyEdited] = useState(false)
  const [deleteTargetSlug, setDeleteTargetSlug] = useState<string | null>(null)

  const { data: items, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await axios.get<{ data: CategoryForAdmin[] }>(
        '/api/categories?admin=1',
      )
      return data.data
    },
    initialData: categories,
    staleTime: Infinity,
    gcTime: 0,
  })

  const filtered = items.filter((c) => {
    const q = search.toLowerCase()
    return getDisplayName(c).toLowerCase().includes(q) || c.slug.includes(q)
  })

  function handleStartEdit(cat: CategoryForAdmin) {
    const tr = getTranslation(cat, 'en')
    setEditSlug(cat.slug)
    setEditLocale('en')
    setEditName(tr?.name ?? '')
    setEditDescription(tr?.description ?? '')
    setEditLocaleSlug(tr?.slug ?? cat.slug)
    setEditSlugManuallyEdited(false)
  }

  function handleSwitchLocale(locale: 'en' | 'es') {
    const cat = items.find((c) => c.slug === editSlug)
    /* istanbul ignore next */
    if (!cat) return
    const tr = getTranslation(cat, locale)
    setEditLocale(locale)
    setEditName(tr?.name ?? '')
    setEditDescription(tr?.description ?? '')
    setEditLocaleSlug(tr?.slug ?? cat.slug)
    setEditSlugManuallyEdited(false)
  }

  function handleCancelEdit() {
    setEditSlug(null)
    setEditLocale('en')
    setEditName('')
    setEditDescription('')
    setEditLocaleSlug('')
    setEditSlugManuallyEdited(false)
  }

  function handleEditNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setEditName(val)
    if (!editSlugManuallyEdited) {
      setEditLocaleSlug(slugify(val))
    }
  }

  function handleEditSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditLocaleSlug(e.target.value)
    setEditSlugManuallyEdited(true)
  }

  async function handleSaveEdit(slug: string) {
    await axios.put(`/api/categories/${slug}`, {
      locale: editLocale,
      name: editName,
      description: editDescription || null,
      slug: editLocaleSlug || slug,
    })
    const updatedTranslation: CategoryTranslation = {
      categorySlug: slug,
      locale: editLocale,
      name: editName,
      description: editDescription || null,
      slug: editLocaleSlug || slug,
    }
    queryClient.setQueryData<CategoryForAdmin[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      return old.map((c) => {
        if (c.slug !== slug) return c
        const otherTranslations = c.translations.filter(
          (tr) => tr.locale !== editLocale,
        )
        return {
          ...c,
          translations: [...otherTranslations, updatedTranslation],
        }
      })
    })
    handleCancelEdit()
  }

  function handleDelete(slug: string) {
    setDeleteTargetSlug(slug)
  }

  async function handleConfirmDelete() {
    /* istanbul ignore next */
    if (!deleteTargetSlug) return
    const slug = deleteTargetSlug
    await axios.delete(`/api/categories/${slug}`)
    setDeleteTargetSlug(null)
    queryClient.setQueryData<CategoryForAdmin[]>(QUERY_KEY, (old) => {
      /* istanbul ignore next */
      if (!old) return []
      return old.filter((c) => c.slug !== slug)
    })
  }

  function handleCancelDelete() {
    setDeleteTargetSlug(null)
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
            onClick={() => router.push('/admin/categories/new')}
            data-testid="new-category-button"
          >
            {t('categories.newCategory')}
          </StyledNewButton>
        </StyledButtonGroup>
      </StyledToolbar>

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
                  <>
                    <StyledLocaleTabs>
                      <StyledLocaleTab
                        $active={editLocale === 'en'}
                        onClick={() => handleSwitchLocale('en')}
                        data-testid="locale-tab-en"
                      >
                        EN
                      </StyledLocaleTab>
                      <StyledLocaleTab
                        $active={editLocale === 'es'}
                        onClick={() => handleSwitchLocale('es')}
                        data-testid="locale-tab-es"
                      >
                        ES
                      </StyledLocaleTab>
                    </StyledLocaleTabs>
                    <StyledEditInput
                      type="text"
                      value={editName}
                      onChange={handleEditNameChange}
                      data-testid="edit-name-input"
                    />
                  </>
                ) : (
                  <StyledName>{getDisplayName(cat)}</StyledName>
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
                      <StyledEditInput
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder={t(
                          'categories.form.descriptionPlaceholder',
                        )}
                        data-testid="edit-description-input"
                      />
                      <StyledEditInput
                        type="text"
                        value={editLocaleSlug}
                        onChange={handleEditSlugChange}
                        placeholder={t('categories.form.slug')}
                        data-testid="edit-slug-input"
                      />
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
                        onClick={
                          cat.publishedPostCount > 0
                            ? undefined
                            : () => handleDelete(cat.slug)
                        }
                        disabled={cat.publishedPostCount > 0}
                        title={
                          cat.publishedPostCount > 0
                            ? t('categories.deleteTooltip', {
                                count: cat.publishedPostCount,
                              })
                            : undefined
                        }
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
      <ConfirmDeleteModal
        isOpen={deleteTargetSlug !== null}
        message={t('categories.deleteConfirm')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </StyledWrapper>
  )
}
