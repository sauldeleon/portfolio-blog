'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useClientTranslation } from '@web/i18n/client'
import type { PostStatus } from '@web/lib/db/schema'
import { slugify } from '@web/utils/slugify'

import { MarkdownPreview } from '../MarkdownPreview'
import {
  StyledActions,
  StyledArchiveButton,
  StyledBackLink,
  StyledContentTextarea,
  StyledEditorLayout,
  StyledEditorPane,
  StyledError,
  StyledFieldGroup,
  StyledFormActions,
  StyledHeaderLeft,
  StyledHeading,
  StyledHelper,
  StyledInput,
  StyledLabel,
  StyledLocaleTab,
  StyledLocaleTabs,
  StyledMetaGrid,
  StyledMetadataSection,
  StyledPageHeader,
  StyledPreviewLabel,
  StyledPreviewPane,
  StyledPublishButton,
  StyledSaveButton,
  StyledSelect,
  StyledStatusBadge,
  StyledTextarea,
  StyledTitleRow,
  StyledWrapper,
} from './PostEditor.styles'

type Locale = 'en' | 'es'

interface LocaleState {
  title: string
  slug: string
  excerpt: string
  content: string
  slugEdited: boolean
}

const emptyLocale: LocaleState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  slugEdited: false,
}

export interface PostEditorCategory {
  slug: string
  name: string
}

export interface PostEditorTranslation {
  locale: string
  title: string
  slug: string
  excerpt: string
  content: string
}

export interface PostEditorPost {
  id: string
  category: string
  tags: string[]
  status: PostStatus
  coverImage: string | null
  seriesId: string | null
  seriesOrder: number | null
  author: string
}

export interface PostEditorProps {
  post?: {
    post: PostEditorPost
    translations: PostEditorTranslation[]
  }
  categories: PostEditorCategory[]
  author: string
}

function findTranslation(
  translations: PostEditorTranslation[],
  locale: Locale,
): PostEditorTranslation | undefined {
  return translations.find((t) => t.locale === locale)
}

function translationToState(t: PostEditorTranslation | undefined): LocaleState {
  if (!t) return emptyLocale
  return {
    title: t.title,
    slug: t.slug,
    excerpt: t.excerpt,
    content: t.content,
    slugEdited: true,
  }
}

export function PostEditor({ post, categories, author }: PostEditorProps) {
  const { t } = useClientTranslation('admin')
  const router = useRouter()

  const initialStatus = post?.post.status ?? 'draft'
  const [status, setStatus] = useState<PostStatus>(initialStatus)
  const [activeLocale, setActiveLocale] = useState<Locale>('en')
  const [locales, setLocales] = useState<Record<Locale, LocaleState>>({
    en: translationToState(findTranslation(post?.translations ?? [], 'en')),
    es: translationToState(findTranslation(post?.translations ?? [], 'es')),
  })
  const [category, setCategory] = useState(post?.post.category ?? '')
  const [tags, setTags] = useState(post?.post.tags.join(', ') ?? '')
  const [seriesId, setSeriesId] = useState(post?.post.seriesId ?? '')
  const [seriesOrder, setSeriesOrder] = useState(
    post?.post.seriesOrder != null ? String(post.post.seriesOrder) : '',
  )
  const [coverImage, setCoverImage] = useState(post?.post.coverImage ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentLocale = locales[activeLocale]

  function updateLocale(locale: Locale, patch: Partial<LocaleState>) {
    setLocales((prev) => ({ ...prev, [locale]: { ...prev[locale], ...patch } }))
  }

  function handleTitleChange(value: string) {
    const patch: Partial<LocaleState> = { title: value }
    if (!currentLocale.slugEdited) {
      patch.slug = slugify(value)
    }
    updateLocale(activeLocale, patch)
  }

  function handleSlugChange(value: string) {
    updateLocale(activeLocale, { slug: value, slugEdited: true })
  }

  const hasBothTranslations = !!(locales.en.title && locales.es.title)

  function canPublish(): boolean {
    return hasBothTranslations
  }

  function canArchive(): boolean {
    return status !== 'published'
  }

  function buildBody(targetStatus: PostStatus) {
    const tagsArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    const enTranslation = {
      title: locales.en.title,
      slug: locales.en.slug,
      excerpt: locales.en.excerpt,
      content: locales.en.content,
    }

    const esHasContent = !!(locales.es.title || locales.es.content)
    const esTranslation = esHasContent
      ? {
          title: locales.es.title,
          slug: locales.es.slug,
          excerpt: locales.es.excerpt,
          content: locales.es.content,
        }
      : undefined

    const translations: Record<string, unknown> = { en: enTranslation }
    if (esTranslation) translations.es = esTranslation

    const coverImageValue = coverImage.trim() || null
    const seriesIdValue = seriesId.trim() || null
    const seriesOrderValue = seriesOrder.trim()
      ? parseInt(seriesOrder.trim(), 10)
      : null

    if (post) {
      return {
        category,
        tags: tagsArray,
        status: targetStatus,
        coverImage: coverImageValue,
        seriesId: seriesIdValue,
        seriesOrder: seriesOrderValue,
        translations,
      }
    }

    return {
      category,
      tags: tagsArray,
      author,
      status: targetStatus,
      ...(coverImageValue ? { coverImage: coverImageValue } : {}),
      ...(seriesIdValue ? { seriesId: seriesIdValue } : {}),
      ...(seriesOrderValue != null ? { seriesOrder: seriesOrderValue } : {}),
      translations,
    }
  }

  async function handleSave(targetStatus: PostStatus = status) {
    setSaving(true)
    setError(null)

    try {
      const url = post ? `/api/posts/${post.post.id}` : '/api/posts'
      const method = post ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(targetStatus)),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: unknown }
        setError(
          typeof data.error === 'string' ? data.error : t('postEditor.error'),
        )
        return
      }

      if (!post) {
        const created = (await res.json()) as { id: string }
        router.push(`/admin/posts/${created.id}`)
      } else {
        setStatus(targetStatus)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <StyledWrapper data-testid="post-editor">
      <StyledPageHeader>
        <StyledHeaderLeft>
          <StyledBackLink
            onClick={() => router.push('/admin/posts')}
            role="link"
            data-testid="back-link"
          >
            {t('postEditor.back')}
          </StyledBackLink>
          <StyledTitleRow>
            <StyledHeading>
              {post ? t('postEditor.editTitle') : t('postEditor.newTitle')}
            </StyledHeading>
            <StyledStatusBadge $status={status} data-testid="status-badge">
              {t(`postEditor.status.${status}`)}
            </StyledStatusBadge>
          </StyledTitleRow>
        </StyledHeaderLeft>

        <StyledActions>
          <StyledSaveButton
            onClick={() => handleSave()}
            disabled={saving}
            data-testid="save-button"
          >
            {saving
              ? t('postEditor.actions.saving')
              : t('postEditor.actions.save')}
          </StyledSaveButton>

          {status !== 'published' && status !== 'archived' && (
            <StyledPublishButton
              $published={false}
              onClick={() => handleSave('published')}
              disabled={saving || !canPublish()}
              title={
                !hasBothTranslations
                  ? t('postEditor.actions.publishDisabledMissingTranslations')
                  : undefined
              }
              data-testid="publish-button"
            >
              {t('postEditor.actions.publish')}
            </StyledPublishButton>
          )}

          {status === 'published' && (
            <>
              <StyledPublishButton
                $published
                onClick={() => handleSave('draft')}
                disabled={saving}
                data-testid="unpublish-button"
              >
                {t('postEditor.actions.unpublish')}
              </StyledPublishButton>
              <StyledArchiveButton
                disabled
                title={t('postEditor.actions.archiveDisabledPublished')}
                data-testid="archive-button"
              >
                {t('postEditor.actions.archive')}
              </StyledArchiveButton>
            </>
          )}

          {status === 'archived' && (
            <>
              <StyledPublishButton
                $published={false}
                onClick={() => handleSave('draft')}
                disabled={saving}
                data-testid="unarchive-button"
              >
                {t('postEditor.actions.unarchive')}
              </StyledPublishButton>
              <StyledArchiveButton
                disabled
                title={t('postEditor.actions.publishDisabledArchived')}
                data-testid="publish-archived-button"
              >
                {t('postEditor.actions.publish')}
              </StyledArchiveButton>
            </>
          )}

          {status === 'draft' && (
            <StyledArchiveButton
              onClick={() => handleSave('archived')}
              disabled={saving || !canArchive()}
              data-testid="archive-button"
            >
              {t('postEditor.actions.archive')}
            </StyledArchiveButton>
          )}
        </StyledActions>
      </StyledPageHeader>

      <StyledLocaleTabs>
        {(['en', 'es'] as const).map((locale) => (
          <StyledLocaleTab
            key={locale}
            $active={activeLocale === locale}
            onClick={() => setActiveLocale(locale)}
            data-testid={`locale-tab-${locale}`}
          >
            {t(`postEditor.tabs.${locale}`)}
          </StyledLocaleTab>
        ))}
      </StyledLocaleTabs>

      <StyledEditorLayout>
        <StyledEditorPane>
          <StyledFieldGroup>
            <StyledLabel htmlFor={`title-${activeLocale}`}>
              {t('postEditor.fields.title')}
            </StyledLabel>
            <StyledInput
              id={`title-${activeLocale}`}
              type="text"
              value={currentLocale.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t('postEditor.fields.titlePlaceholder')}
              data-testid="title-input"
            />
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledLabel htmlFor={`slug-${activeLocale}`}>
              {t('postEditor.fields.slug')}
            </StyledLabel>
            <StyledInput
              id={`slug-${activeLocale}`}
              type="text"
              value={currentLocale.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder={t('postEditor.fields.slugHelper')}
              data-testid="slug-input"
            />
            <StyledHelper>{t('postEditor.fields.slugHelper')}</StyledHelper>
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledLabel htmlFor={`excerpt-${activeLocale}`}>
              {t('postEditor.fields.excerpt')}
            </StyledLabel>
            <StyledTextarea
              id={`excerpt-${activeLocale}`}
              value={currentLocale.excerpt}
              onChange={(e) =>
                updateLocale(activeLocale, { excerpt: e.target.value })
              }
              placeholder={t('postEditor.fields.excerptPlaceholder')}
              rows={3}
              data-testid="excerpt-input"
            />
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledLabel htmlFor={`content-${activeLocale}`}>
              {t('postEditor.fields.content')}
            </StyledLabel>
            <StyledContentTextarea
              id={`content-${activeLocale}`}
              value={currentLocale.content}
              onChange={(e) =>
                updateLocale(activeLocale, { content: e.target.value })
              }
              placeholder={t('postEditor.fields.contentPlaceholder')}
              data-testid="content-input"
            />
          </StyledFieldGroup>
        </StyledEditorPane>

        <StyledPreviewPane data-testid="preview-pane">
          <StyledPreviewLabel>{t('postEditor.preview')}</StyledPreviewLabel>
          <MarkdownPreview
            content={currentLocale.content}
            loadingLabel={t('postEditor.previewLoading')}
          />
        </StyledPreviewPane>
      </StyledEditorLayout>

      <StyledMetadataSection>
        <StyledMetaGrid>
          <StyledFieldGroup>
            <StyledLabel htmlFor="meta-category">
              {t('postEditor.fields.category')}
            </StyledLabel>
            <StyledSelect
              id="meta-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              data-testid="category-select"
            >
              <option value="" disabled>
                —
              </option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </StyledSelect>
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledLabel htmlFor="meta-tags">
              {t('postEditor.fields.tags')}
            </StyledLabel>
            <StyledInput
              id="meta-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t('postEditor.fields.tagsPlaceholder')}
              data-testid="tags-input"
            />
            <StyledHelper>{t('postEditor.fields.tagsHelper')}</StyledHelper>
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledLabel htmlFor="meta-cover">
              {t('postEditor.fields.coverImage')}
            </StyledLabel>
            <StyledInput
              id="meta-cover"
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder={t('postEditor.fields.coverImagePlaceholder')}
              data-testid="cover-image-input"
            />
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledLabel htmlFor="meta-series-id">
              {t('postEditor.fields.seriesId')}
            </StyledLabel>
            <StyledInput
              id="meta-series-id"
              type="text"
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              placeholder={t('postEditor.fields.seriesIdPlaceholder')}
              data-testid="series-id-input"
            />
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledLabel htmlFor="meta-series-order">
              {t('postEditor.fields.seriesOrder')}
            </StyledLabel>
            <StyledInput
              id="meta-series-order"
              type="number"
              value={seriesOrder}
              onChange={(e) => setSeriesOrder(e.target.value)}
              placeholder={t('postEditor.fields.seriesOrderPlaceholder')}
              data-testid="series-order-input"
            />
          </StyledFieldGroup>
        </StyledMetaGrid>
      </StyledMetadataSection>

      <StyledFormActions>
        {error && <StyledError data-testid="editor-error">{error}</StyledError>}
      </StyledFormActions>
    </StyledWrapper>
  )
}
