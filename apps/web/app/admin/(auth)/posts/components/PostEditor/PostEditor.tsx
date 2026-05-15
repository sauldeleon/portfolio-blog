'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Checkbox } from '@sdlgr/checkbox'
import { Combobox } from '@sdlgr/combobox'
import {
  FieldGroup,
  FieldHelper,
  FieldLabel,
  Input,
  Textarea,
} from '@sdlgr/input'
import { Select } from '@sdlgr/select'

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
  StyledFormActions,
  StyledHeaderLeft,
  StyledHeading,
  StyledLocaleTab,
  StyledLocaleTabs,
  StyledMarkdownHint,
  StyledMetaGrid,
  StyledMetadataSection,
  StyledPageHeader,
  StyledPreviewLabel,
  StyledPreviewPane,
  StyledPublishButton,
  StyledSaveButton,
  StyledStatusBadge,
  StyledTitleRow,
  StyledWrapper,
} from './PostEditor.styles'

const DEFAULT_AUTHOR = 'Saúl de León'

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
  allTags?: string[]
  series?: string[]
}

const postFormSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
})

type PostFormValues = z.infer<typeof postFormSchema>

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

export function PostEditor({
  post,
  categories,
  author,
  allTags,
  series,
}: PostEditorProps) {
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
  const [tags, setTags] = useState<string[]>(post?.post.tags ?? [])
  const [seriesId, setSeriesId] = useState(post?.post.seriesId ?? '')
  const [seriesOrder, setSeriesOrder] = useState(
    post?.post.seriesOrder != null ? String(post.post.seriesOrder) : '',
  )
  const [coverImage, setCoverImage] = useState(post?.post.coverImage ?? '')
  const [useDefaultAuthor, setUseDefaultAuthor] = useState(true)
  const [customAuthor, setCustomAuthor] = useState('')

  const currentLocale = locales[activeLocale]

  useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    mode: 'onChange',
    values: {
      title: currentLocale.title,
      slug: currentLocale.slug,
      excerpt: currentLocale.excerpt,
      content: currentLocale.content,
      category,
    },
  })

  const canSave = postFormSchema.safeParse({
    title: currentLocale.title,
    slug: currentLocale.slug,
    excerpt: currentLocale.excerpt,
    content: currentLocale.content,
    category,
  }).success
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const savedLocales = new Set(post?.translations.map((tr) => tr.locale) ?? [])
  const hasBothTranslations = savedLocales.has('en') && savedLocales.has('es')

  function canPublish(): boolean {
    return hasBothTranslations
  }

  function canArchive(): boolean {
    return status !== 'published'
  }

  function buildBody(targetStatus: PostStatus) {
    const tagsArray = tags.map((tag) => tag.toUpperCase())

    const translations = {
      [activeLocale]: {
        title: locales[activeLocale].title,
        slug: locales[activeLocale].slug,
        excerpt: locales[activeLocale].excerpt,
        content: locales[activeLocale].content,
      },
    }

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

    const resolvedAuthor = useDefaultAuthor ? DEFAULT_AUTHOR : customAuthor

    return {
      category,
      tags: tagsArray,
      author: resolvedAuthor || author,
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
      const url = post ? `/api/posts/${post.post.id}/` : '/api/posts/'
      const method = post ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(targetStatus)),
      })

      if (!res.ok) {
        let data: { error?: unknown } = {}
        try {
          data = (await res.json()) as { error?: unknown }
        } catch {
          // empty or non-JSON body
        }
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
            disabled={saving || !canSave}
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
          <FieldGroup>
            <FieldLabel htmlFor={`title-${activeLocale}`} required>
              {t('postEditor.fields.title')}
            </FieldLabel>
            <Input
              id={`title-${activeLocale}`}
              type="text"
              value={currentLocale.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t('postEditor.fields.titlePlaceholder')}
              data-testid="title-input"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor={`slug-${activeLocale}`} required>
              {t('postEditor.fields.slug')}
            </FieldLabel>
            <Input
              id={`slug-${activeLocale}`}
              type="text"
              value={currentLocale.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder={t('postEditor.fields.slugHelper')}
              data-testid="slug-input"
            />
            <FieldHelper>{t('postEditor.fields.slugHelper')}</FieldHelper>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor={`excerpt-${activeLocale}`} required>
              {t('postEditor.fields.excerpt')}
            </FieldLabel>
            <Textarea
              id={`excerpt-${activeLocale}`}
              value={currentLocale.excerpt}
              onChange={(e) =>
                updateLocale(activeLocale, { excerpt: e.target.value })
              }
              placeholder={t('postEditor.fields.excerptPlaceholder')}
              rows={3}
              data-testid="excerpt-input"
            />
          </FieldGroup>

          <StyledMetadataSection>
            <StyledMetaGrid>
              <FieldGroup>
                <FieldLabel htmlFor="meta-category" required>
                  {t('postEditor.fields.category')}
                </FieldLabel>
                <Select
                  id="meta-category"
                  value={category}
                  onChange={setCategory}
                  options={categories.map((cat) => ({
                    value: cat.slug,
                    label: cat.name,
                  }))}
                  data-testid="category-select"
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="meta-tags">
                  {t('postEditor.fields.tags')}
                </FieldLabel>
                <Combobox
                  value={tags}
                  onChange={setTags}
                  options={allTags ?? []}
                  placeholder={t('postEditor.fields.tagsPlaceholder')}
                  isValidNewOption={(v) => /^[\p{L}\p{N}\s-]+$/u.test(v.trim())}
                  data-testid="tags-input"
                />
                <FieldHelper>{t('postEditor.fields.tagsHelper')}</FieldHelper>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="meta-cover">
                  {t('postEditor.fields.coverImage')}
                </FieldLabel>
                <Input
                  id="meta-cover"
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder={t('postEditor.fields.coverImagePlaceholder')}
                  data-testid="cover-image-input"
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="meta-series-id">
                  {t('postEditor.fields.seriesId')}
                </FieldLabel>
                <Select
                  id="meta-series-id"
                  value={seriesId}
                  onChange={setSeriesId}
                  options={(series ?? []).map((s) => ({ value: s, label: s }))}
                  isSearchable
                  isCreatable
                  isClearable
                  placeholder={t('postEditor.fields.seriesIdPlaceholder')}
                  data-testid="series-id-input"
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="meta-series-order">
                  {t('postEditor.fields.seriesOrder')}
                </FieldLabel>
                <Input
                  id="meta-series-order"
                  type="number"
                  value={seriesOrder}
                  onChange={(e) => setSeriesOrder(e.target.value)}
                  placeholder={t('postEditor.fields.seriesOrderPlaceholder')}
                  data-testid="series-order-input"
                />
              </FieldGroup>

              {!post && (
                <FieldGroup>
                  <FieldLabel htmlFor="meta-author">
                    {t('postEditor.fields.author')}
                  </FieldLabel>
                  <Input
                    id="meta-author"
                    type="text"
                    value={useDefaultAuthor ? DEFAULT_AUTHOR : customAuthor}
                    onChange={(e) => setCustomAuthor(e.target.value)}
                    placeholder={t('postEditor.fields.authorPlaceholder')}
                    disabled={useDefaultAuthor}
                    data-testid="author-input"
                  />
                  <Checkbox
                    id="author-use-default"
                    label={t('postEditor.fields.authorUseDefault')}
                    checked={useDefaultAuthor}
                    onChange={setUseDefaultAuthor}
                    data-testid="author-use-default-checkbox"
                  />
                </FieldGroup>
              )}
            </StyledMetaGrid>
          </StyledMetadataSection>

          <FieldGroup>
            <FieldLabel htmlFor={`content-${activeLocale}`} required>
              {t('postEditor.fields.content')}
            </FieldLabel>
            <StyledContentTextarea
              id={`content-${activeLocale}`}
              value={currentLocale.content}
              onChange={(e) =>
                updateLocale(activeLocale, { content: e.target.value })
              }
              placeholder={t('postEditor.fields.contentPlaceholder')}
              data-testid="content-input"
            />
            <StyledMarkdownHint>
              <summary>Image syntax</summary>
              <pre>{`![params](url)  — all params optional

size          small | medium           (default: full width)
align         left | right             (default: none)
caption       text                     (default: none)
caption-pos   top | bottom             (default: bottom)
alt           accessible description   (default: "")
expand        true                     (default: false — click to enlarge)

Example:
![size=small&align=right&caption=My photo&alt=A forest path&expand=true](https://...)`}</pre>
            </StyledMarkdownHint>
            <StyledMarkdownHint>
              <summary>Embed syntax</summary>
              <pre>{`Use a fenced code block with the embed type as language:

\`\`\`youtube
https://www.youtube.com/embed/<video-id>
\`\`\`

\`\`\`maps
https://www.google.com/maps/embed?pb=...
\`\`\`

\`\`\`openstreetmap
https://www.openstreetmap.org/export/embed.html?...
\`\`\`

\`\`\`wikiloc
https://www.wikiloc.com/wikiloc/embedv2.do?id=<trail-id>&elevation=on&images=on&maptype=H
\`\`\`

Supported types: youtube · maps · openstreetmap · wikiloc`}</pre>
            </StyledMarkdownHint>
          </FieldGroup>
        </StyledEditorPane>

        <StyledPreviewPane data-testid="preview-pane">
          <StyledPreviewLabel>{t('postEditor.preview')}</StyledPreviewLabel>
          <MarkdownPreview
            content={currentLocale.content}
            loadingLabel={t('postEditor.previewLoading')}
          />
        </StyledPreviewPane>
      </StyledEditorLayout>

      <StyledFormActions>
        {error && <StyledError data-testid="editor-error">{error}</StyledError>}
      </StyledFormActions>
    </StyledWrapper>
  )
}
