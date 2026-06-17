'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import axios, { isAxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Combobox } from '@sdlgr/combobox'
import { DateTimePicker } from '@sdlgr/date-picker'
import {
  FieldGroup,
  FieldHelper,
  FieldLabel,
  Input,
  Textarea,
} from '@sdlgr/input'
import { PostHero } from '@sdlgr/post-hero'
import { Select } from '@sdlgr/select'
import { TableOfContents } from '@sdlgr/table-of-contents'

import { useClientTranslation } from '@web/i18n/client'
import type { CloudinaryImage } from '@web/lib/cloudinary/images'
import type { UserRecord } from '@web/lib/db/queries/users'
import type { PostStatus } from '@web/lib/db/schema'
import { extractToc } from '@web/lib/mdx/remarkHeadings'
import { CategoryIconRenderer } from '@web/utils/categoryIcons'
import { computeReadingTime } from '@web/utils/computeReadingTime'
import { slugify } from '@web/utils/slugify'

import { PublishNotifyModal } from '../../../components/PublishNotifyModal'
import { EmbedInsertModal } from '../EmbedInsertModal'
import { GpxMapModal } from '../GpxMapModal'
import { ImageInsertModal } from '../ImageInsertModal'
import { ImagePicker } from '../ImagePicker'
import { MarkdownPreview } from '../MarkdownPreview'
import { SlideshowInsertModal } from '../SlideshowInsertModal'
import { CoverImageInput } from './CoverImageInput'
import { PostCardPreview } from './PostCardPreview'
import {
  StyledActions,
  StyledArchiveButton,
  StyledAutoRenderLabel,
  StyledBackLink,
  StyledCheckboxFieldLabel,
  StyledContentTextarea,
  StyledDraftPreviewCopyButton,
  StyledDraftPreviewLabel,
  StyledDraftPreviewLink,
  StyledDraftPreviewRow,
  StyledEditEmbedButton,
  StyledEditorLayout,
  StyledEditorPane,
  StyledError,
  StyledFormActions,
  StyledHeaderLeft,
  StyledHeading,
  StyledImagePickerButton,
  StyledLocaleTab,
  StyledLocaleTabs,
  StyledMetaGrid,
  StyledMetadataSection,
  StyledMobileContent,
  StyledMobileFrame,
  StyledPageHeader,
  StyledPreviewContent,
  StyledPreviewControls,
  StyledPreviewPane,
  StyledPreviewTab,
  StyledPreviewTabsBar,
  StyledPublishButton,
  StyledSaveButton,
  StyledStatusBadge,
  StyledTextareaWrapper,
  StyledTitleRow,
  StyledTocPreview,
  StyledToolbarRow,
  StyledUpdatePreviewButton,
  StyledWrapper,
} from './PostEditor.styles'
import type {
  DetectedEmbed,
  ParsedEmbed,
  ParsedGpx,
  ParsedImage,
  ParsedSlideshow,
} from './parseEmbedBlock'
import { detectEmbedAtCursor } from './parseEmbedBlock'

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
  postNumber?: number | null
  category: string
  tags: string[]
  status: PostStatus
  coverImage: string | null
  coverImageFit: 'cover' | 'contain' | null
  seriesId: string | null
  seriesOrder: number | null
  scheduledAt: Date | null
  authorId: string | null
  commentsEnabled: boolean
  previewToken: string | null
}

export type PostEditorSeries = {
  id: string
  nextOrder: number
  translations: Array<{ locale: string; title: string }>
}

export interface PostEditorProps {
  post?: {
    post: PostEditorPost
    translations: PostEditorTranslation[]
  }
  categories: PostEditorCategory[]
  users: UserRecord[]
  allTags?: string[]
  series?: PostEditorSeries[]
  currentUserId?: string
  currentUserRole?: 'admin' | 'editor' | 'user'
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
  users,
  allTags,
  series,
  currentUserId,
  currentUserRole,
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
  const [seriesTitles, setSeriesTitles] = useState<Record<Locale, string>>(
    () => {
      const initialId = post?.post.seriesId
      if (!initialId) return { en: '', es: '' }
      const found = (series ?? []).find((s) => s.id === initialId)
      if (!found) return { en: '', es: '' }
      return {
        en: found.translations.find((tr) => tr.locale === 'en')?.title ?? '',
        es: found.translations.find((tr) => tr.locale === 'es')?.title ?? '',
      }
    },
  )
  const [coverImage, setCoverImage] = useState(post?.post.coverImage ?? '')
  const [coverImageFit, setCoverImageFit] = useState<'cover' | 'contain'>(
    post?.post.coverImageFit ?? 'cover',
  )
  const [scheduledAt, setScheduledAt] = useState<Date | null>(
    post?.post.scheduledAt ?? null,
  )
  const [commentsEnabled, setCommentsEnabled] = useState(
    post?.post.commentsEnabled ?? true,
  )
  const [editAuthor, setEditAuthor] = useState(
    post ? (post.post.authorId ?? '') : (currentUserId ?? users[0]?.id ?? ''),
  )

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
  const [urlCopied, setUrlCopied] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isContentPickerOpen, setIsContentPickerOpen] = useState(false)
  const contentPickerCallbackRef = useRef<
    ((image: CloudinaryImage) => void) | null
  >(null)
  const [isImageInsertModalOpen, setIsImageInsertModalOpen] = useState(false)
  const [isEmbedInsertModalOpen, setIsEmbedInsertModalOpen] = useState(false)
  const [isGpxModalOpen, setIsGpxModalOpen] = useState(false)
  const [imageModalKey, setImageModalKey] = useState(0)
  const [embedModalKey, setEmbedModalKey] = useState(0)
  const [gpxModalKey, setGpxModalKey] = useState(0)
  const [showPublishNotify, setShowPublishNotify] = useState(false)
  const [editingEmbed, setEditingEmbed] = useState<DetectedEmbed | null>(null)
  const [imageInitialValues, setImageInitialValues] =
    useState<ParsedImage | null>(null)
  const [embedInitialValues, setEmbedInitialValues] =
    useState<ParsedEmbed | null>(null)
  const [gpxInitialValues, setGpxInitialValues] = useState<ParsedGpx | null>(
    null,
  )
  const [isSlideshowModalOpen, setIsSlideshowModalOpen] = useState(false)
  const [slideshowModalKey, setSlideshowModalKey] = useState(0)
  const [slideshowInitialValues, setSlideshowInitialValues] =
    useState<ParsedSlideshow | null>(null)
  const [previewTab, setPreviewTab] = useState<
    'post' | 'post-mobile' | 'hero' | 'card' | 'toc'
  >('post')
  const [autoRender, setAutoRender] = useState(true)
  const [previewContent, setPreviewContent] = useState(currentLocale.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (autoRender) setPreviewContent(currentLocale.content)
  }, [currentLocale.content, autoRender])

  function handleSeriesIdChange(newId: string) {
    setSeriesId(newId)
    if (!newId) {
      setSeriesTitles({ en: '', es: '' })
      return
    }
    const found = (series ?? []).find((s) => s.id === newId)
    if (found) {
      setSeriesTitles({
        en: found.translations.find((tr) => tr.locale === 'en')?.title ?? '',
        es: found.translations.find((tr) => tr.locale === 'es')?.title ?? '',
      })
      if (!post || !post.post.seriesId) {
        setSeriesOrder(String(found.nextOrder))
      }
    } else {
      setSeriesTitles({ en: '', es: '' })
      setSeriesOrder('1')
    }
  }

  function insertAtCursor(markdown: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const el = textareaRef.current!
    const start = el.selectionStart
    const end = el.selectionEnd
    const newContent =
      currentLocale.content.slice(0, start) +
      markdown +
      currentLocale.content.slice(end)
    updateLocale(activeLocale, { content: newContent })
  }

  function handleTextareaClick() {
    const el = textareaRef.current
    /* istanbul ignore next */
    if (!el) return
    const detected = detectEmbedAtCursor(
      currentLocale.content,
      el.selectionStart,
    )
    setEditingEmbed(detected)
  }

  function replaceBlock(start: number, end: number, markdown: string) {
    updateLocale(activeLocale, {
      content:
        currentLocale.content.slice(0, start) +
        markdown +
        currentLocale.content.slice(end),
    })
    setEditingEmbed(null)
  }

  function handleEditEmbed() {
    /* istanbul ignore next */
    if (!editingEmbed) return
    if (editingEmbed.type === 'image') {
      setImageInitialValues(editingEmbed.parsed as ParsedImage)
      setImageModalKey((k) => k + 1)
      setIsImageInsertModalOpen(true)
    } else if (editingEmbed.type === 'embed') {
      setEmbedInitialValues(editingEmbed.parsed as ParsedEmbed)
      setEmbedModalKey((k) => k + 1)
      setIsEmbedInsertModalOpen(true)
    } else if (editingEmbed.type === 'slideshow') {
      setSlideshowInitialValues(editingEmbed.parsed as ParsedSlideshow)
      setSlideshowModalKey((k) => k + 1)
      setIsSlideshowModalOpen(true)
    } else {
      setGpxInitialValues(editingEmbed.parsed as ParsedGpx)
      setGpxModalKey((k) => k + 1)
      setIsGpxModalOpen(true)
    }
  }

  function handlePick(image: CloudinaryImage) {
    setCoverImage(image.publicId)
    setIsPickerOpen(false)
  }

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
    const scheduledAtValue = scheduledAt ? scheduledAt.toISOString() : null
    const seriesIdValue = seriesId.trim() || null
    const seriesOrderValue = seriesOrder.trim()
      ? parseInt(seriesOrder.trim(), 10)
      : null

    const seriesTitlesValue = seriesIdValue
      ? {
          ...(seriesTitles.en.trim() ? { en: seriesTitles.en.trim() } : {}),
          ...(seriesTitles.es.trim() ? { es: seriesTitles.es.trim() } : {}),
        }
      : undefined

    if (post) {
      return {
        category,
        authorId: editAuthor,
        tags: tagsArray,
        status: targetStatus,
        coverImage: coverImageValue,
        coverImageFit,
        seriesId: seriesIdValue,
        seriesOrder: seriesOrderValue,
        scheduledAt: scheduledAtValue,
        commentsEnabled,
        ...(seriesTitlesValue ? { seriesTitles: seriesTitlesValue } : {}),
        translations,
      }
    }

    return {
      category,
      tags: tagsArray,
      authorId: editAuthor,
      status: targetStatus,
      ...(coverImageValue ? { coverImage: coverImageValue } : {}),
      coverImageFit,
      ...(seriesIdValue ? { seriesId: seriesIdValue } : {}),
      ...(seriesOrderValue != null ? { seriesOrder: seriesOrderValue } : {}),
      scheduledAt: scheduledAtValue,
      commentsEnabled,
      ...(seriesTitlesValue ? { seriesTitles: seriesTitlesValue } : {}),
      translations,
    }
  }

  const previewAuthor = users.find((u) => u.id === editAuthor)?.name ?? ''

  const draftPreviewPath =
    post && status !== 'published' && post.post.previewToken
      ? `/blog/preview/${post.post.previewToken}`
      : null

  function handleCopyPreviewUrl() {
    /* istanbul ignore next */
    if (!draftPreviewPath) return
    void navigator.clipboard
      .writeText(window.location.origin + draftPreviewPath)
      .then(() => {
        setUrlCopied(true)
        setTimeout(() => setUrlCopied(false), 2000)
      })
  }

  async function handleSave(
    targetStatus: PostStatus = status,
    notify?: boolean,
  ) {
    setSaving(true)
    setError(null)

    try {
      const url = post ? `/api/posts/${post.post.id}/` : '/api/posts/'
      const body = {
        ...buildBody(targetStatus),
        ...(targetStatus === 'published' && notify !== undefined
          ? { notify }
          : {}),
      }

      if (!post) {
        const { data: created } = await axios.post<{ id: string }>(url, body)
        router.push(`/admin/posts/${created.id}`)
      } else {
        await axios.put(url, body)
        setStatus(targetStatus)
        router.refresh()
      }
    } catch (err) {
      if (isAxiosError(err)) {
        const errData = err.response?.data as { error?: unknown } | undefined
        setError(
          typeof errData?.error === 'string'
            ? errData.error
            : t('postEditor.error'),
        )
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
          {draftPreviewPath && (
            <StyledDraftPreviewRow data-testid="draft-preview-row">
              <StyledDraftPreviewLabel>
                {t('postEditor.draftPreviewLabel')}
              </StyledDraftPreviewLabel>
              <StyledDraftPreviewLink
                href={draftPreviewPath}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="draft-preview-link"
              >
                {draftPreviewPath}
              </StyledDraftPreviewLink>
              <StyledDraftPreviewCopyButton
                onClick={handleCopyPreviewUrl}
                data-testid="draft-preview-copy-button"
              >
                {urlCopied
                  ? t('postEditor.draftPreviewCopied')
                  : t('postEditor.draftPreviewCopy')}
              </StyledDraftPreviewCopyButton>
            </StyledDraftPreviewRow>
          )}
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
              onClick={() => setShowPublishNotify(true)}
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

          {status === 'draft' && !!post && (
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

              <CoverImageInput
                label={t('postEditor.fields.coverImage')}
                placeholder={t('postEditor.fields.coverImagePlaceholder')}
                clearTitle={t('postEditor.fields.coverImageClear')}
                value={coverImage}
                onPick={() => setIsPickerOpen(true)}
                onClear={() => setCoverImage('')}
              />

              <FieldGroup>
                <FieldLabel htmlFor="meta-series-id">
                  {t('postEditor.fields.seriesId')}
                </FieldLabel>
                <Select
                  id="meta-series-id"
                  value={seriesId}
                  onChange={handleSeriesIdChange}
                  options={(series ?? []).map((s) => ({
                    value: s.id,
                    label: s.id,
                  }))}
                  isSearchable
                  isCreatable
                  isClearable
                  placeholder={t('postEditor.fields.seriesIdPlaceholder')}
                  data-testid="series-id-input"
                />
              </FieldGroup>

              {seriesId && (
                <FieldGroup>
                  <FieldLabel htmlFor={`meta-series-title-${activeLocale}`}>
                    {t('postEditor.fields.seriesTitle')}
                  </FieldLabel>
                  <Input
                    id={`meta-series-title-${activeLocale}`}
                    type="text"
                    value={seriesTitles[activeLocale]}
                    onChange={(e) =>
                      setSeriesTitles((prev) => ({
                        ...prev,
                        [activeLocale]: e.target.value,
                      }))
                    }
                    placeholder={t('postEditor.fields.seriesTitlePlaceholder')}
                    data-testid="series-title-input"
                  />
                </FieldGroup>
              )}

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

              <FieldGroup>
                <FieldLabel>{t('postEditor.fields.scheduledAt')}</FieldLabel>
                <DateTimePicker
                  value={scheduledAt}
                  onChange={setScheduledAt}
                  placeholder={t('postEditor.fields.scheduledAtPlaceholder')}
                  data-testid="scheduled-at-picker"
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="meta-cover-image-fit">
                  {t('postEditor.fields.coverImageFit')}
                </FieldLabel>
                <Select
                  id="meta-cover-image-fit"
                  value={coverImageFit}
                  onChange={(v) => setCoverImageFit(v as 'cover' | 'contain')}
                  options={[
                    {
                      value: 'cover',
                      label: t('postEditor.fields.coverImageFitCover'),
                    },
                    {
                      value: 'contain',
                      label: t('postEditor.fields.coverImageFitContain'),
                    },
                  ]}
                  data-testid="cover-image-fit-select"
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="meta-author">
                  {t('postEditor.fields.author')}
                </FieldLabel>
                {currentUserRole && currentUserRole !== 'admin' ? (
                  <Input
                    id="meta-author"
                    type="text"
                    value={users.find((u) => u.id === editAuthor)?.name ?? ''}
                    readOnly
                    data-testid="author-input"
                  />
                ) : (
                  <Select
                    id="meta-author"
                    value={editAuthor}
                    onChange={(value) => setEditAuthor(value)}
                    options={users.map((u) => ({
                      value: u.id,
                      label: u.name,
                    }))}
                    data-testid="author-input"
                  />
                )}
              </FieldGroup>

              <StyledCheckboxFieldLabel>
                <input
                  id="meta-comments-enabled"
                  type="checkbox"
                  checked={commentsEnabled}
                  onChange={(e) => setCommentsEnabled(e.target.checked)}
                  data-testid="comments-enabled-checkbox"
                />
                {t('postEditor.fields.commentsEnabled')}
              </StyledCheckboxFieldLabel>
            </StyledMetaGrid>
          </StyledMetadataSection>

          <FieldGroup>
            <FieldLabel htmlFor={`content-${activeLocale}`} required>
              {t('postEditor.fields.content')}
            </FieldLabel>
            <StyledToolbarRow>
              <StyledImagePickerButton
                type="button"
                onClick={() => {
                  setEditingEmbed(null)
                  setImageInitialValues(null)
                  setImageModalKey((k) => k + 1)
                  setIsImageInsertModalOpen(true)
                }}
                data-testid="open-image-picker-button"
              >
                {t('images.picker.title')}
              </StyledImagePickerButton>
              <StyledImagePickerButton
                type="button"
                onClick={() => {
                  setEditingEmbed(null)
                  setEmbedInitialValues(null)
                  setEmbedModalKey((k) => k + 1)
                  setIsEmbedInsertModalOpen(true)
                }}
                data-testid="open-embed-modal-button"
              >
                Insert Embed
              </StyledImagePickerButton>
              <StyledImagePickerButton
                type="button"
                onClick={() => {
                  setEditingEmbed(null)
                  setGpxInitialValues(null)
                  setGpxModalKey((k) => k + 1)
                  setIsGpxModalOpen(true)
                }}
                data-testid="open-gpx-modal-button"
              >
                Insert GPX Map
              </StyledImagePickerButton>
              <StyledImagePickerButton
                type="button"
                onClick={() => {
                  setEditingEmbed(null)
                  setSlideshowInitialValues(null)
                  setSlideshowModalKey((k) => k + 1)
                  setIsSlideshowModalOpen(true)
                }}
                data-testid="open-slideshow-modal-button"
              >
                Insert Slideshow
              </StyledImagePickerButton>
            </StyledToolbarRow>
            <StyledTextareaWrapper>
              <StyledContentTextarea
                id={`content-${activeLocale}`}
                value={currentLocale.content}
                onChange={(e) => {
                  updateLocale(activeLocale, { content: e.target.value })
                  setEditingEmbed(null)
                }}
                onClick={handleTextareaClick}
                placeholder={t('postEditor.fields.contentPlaceholder')}
                data-testid="content-input"
                ref={textareaRef}
              />
              {editingEmbed && (
                <StyledEditEmbedButton
                  type="button"
                  onClick={handleEditEmbed}
                  data-testid="edit-embed-button"
                >
                  Edit {editingEmbed.type}
                </StyledEditEmbedButton>
              )}
            </StyledTextareaWrapper>
          </FieldGroup>
        </StyledEditorPane>

        <StyledPreviewPane data-testid="preview-pane">
          <StyledPreviewTabsBar>
            <StyledPreviewTab
              $active={previewTab === 'post'}
              onClick={() => setPreviewTab('post')}
              data-testid="preview-tab-post"
            >
              {t('postEditor.previewTabPost')}
            </StyledPreviewTab>
            <StyledPreviewTab
              $active={previewTab === 'post-mobile'}
              onClick={() => setPreviewTab('post-mobile')}
              data-testid="preview-tab-post-mobile"
            >
              {t('postEditor.previewTabPostMobile')}
            </StyledPreviewTab>
            <StyledPreviewTab
              $active={previewTab === 'hero'}
              onClick={() => setPreviewTab('hero')}
              data-testid="preview-tab-hero"
            >
              {t('postEditor.previewTabHero')}
            </StyledPreviewTab>
            <StyledPreviewTab
              $active={previewTab === 'card'}
              onClick={() => setPreviewTab('card')}
              data-testid="preview-tab-card"
            >
              {t('postEditor.previewTabCard')}
            </StyledPreviewTab>
            <StyledPreviewTab
              $active={previewTab === 'toc'}
              onClick={() => setPreviewTab('toc')}
              data-testid="preview-tab-toc"
            >
              {t('postEditor.previewTabToc')}
            </StyledPreviewTab>
            <StyledPreviewControls>
              {!autoRender && (
                <StyledUpdatePreviewButton
                  onClick={() => setPreviewContent(currentLocale.content)}
                  data-testid="update-preview-button"
                >
                  {t('postEditor.updatePreview')}
                </StyledUpdatePreviewButton>
              )}
              <StyledAutoRenderLabel>
                <input
                  type="checkbox"
                  checked={autoRender}
                  onChange={(e) => setAutoRender(e.target.checked)}
                  data-testid="auto-render-checkbox"
                />
                {t('postEditor.autoRender')}
              </StyledAutoRenderLabel>
            </StyledPreviewControls>
          </StyledPreviewTabsBar>
          <StyledPreviewContent>
            {previewTab === 'post' && (
              <MarkdownPreview
                content={previewContent}
                loadingLabel={t('postEditor.previewLoading')}
              />
            )}
            {previewTab === 'post-mobile' && (
              <StyledMobileFrame data-testid="mobile-frame">
                <StyledMobileContent>
                  <MarkdownPreview
                    content={previewContent}
                    loadingLabel={t('postEditor.previewLoading')}
                  />
                </StyledMobileContent>
              </StyledMobileFrame>
            )}
            {previewTab === 'hero' && (
              <PostHero
                title={currentLocale.title}
                coverImagePublicId={coverImage || null}
                coverImageFit={coverImageFit}
                category={
                  categories.find((c) => c.slug === category)?.name ?? ''
                }
                categoryIcon={
                  <CategoryIconRenderer slug={category} aria-hidden />
                }
                tags={tags}
                author={previewAuthor}
                publishedAt={new Date().toLocaleDateString()}
                readingTime={computeReadingTime(currentLocale.content)}
                lng={activeLocale}
                seriesTitle={seriesTitles[activeLocale] || null}
                seriesOrder={
                  seriesOrder.trim() ? parseInt(seriesOrder.trim(), 10) : null
                }
                url={`/${activeLocale}/blog/${post?.post.postNumber ?? 'preview'}/${currentLocale.slug || 'preview'}`}
                shareLabel={t('postEditor.share')}
                copyLinkLabel={t('postEditor.shareCopyLink')}
                copiedLabel={t('postEditor.shareCopied')}
              />
            )}
            {previewTab === 'card' && (
              <PostCardPreview
                title={currentLocale.title}
                slug={currentLocale.slug}
                excerpt={currentLocale.excerpt}
                content={previewContent}
                categoryName={
                  categories.find((c) => c.slug === category)?.name ?? ''
                }
                tags={tags}
                coverImage={coverImage}
                coverImageFit={coverImageFit}
                seriesTitle={seriesTitles[activeLocale] || undefined}
                seriesOrder={
                  seriesOrder.trim() ? parseInt(seriesOrder.trim(), 10) : null
                }
                author={previewAuthor}
                lng={activeLocale}
                postNumber={post?.post.postNumber ?? undefined}
              />
            )}
            {previewTab === 'toc' && (
              <StyledTocPreview data-testid="toc-preview">
                <TableOfContents
                  entries={extractToc(currentLocale.content)}
                  label={t('postEditor.previewTabToc')}
                />
              </StyledTocPreview>
            )}
          </StyledPreviewContent>
        </StyledPreviewPane>
      </StyledEditorLayout>

      <StyledFormActions>
        {error && <StyledError data-testid="editor-error">{error}</StyledError>}
      </StyledFormActions>

      <ImagePicker
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onPick={handlePick}
      />
      <ImagePicker
        open={isContentPickerOpen}
        onClose={() => setIsContentPickerOpen(false)}
        onPick={(image) => {
          /* istanbul ignore next */
          contentPickerCallbackRef.current?.(image)
          contentPickerCallbackRef.current = null
          setIsContentPickerOpen(false)
        }}
        zIndex={1100}
      />
      <ImageInsertModal
        key={`image-${imageModalKey}`}
        isOpen={isImageInsertModalOpen}
        initialValues={imageInitialValues}
        onInsert={(markdown) => {
          if (editingEmbed?.type === 'image') {
            replaceBlock(
              editingEmbed.blockStart,
              editingEmbed.blockEnd,
              markdown,
            )
          } else {
            insertAtCursor(markdown)
          }
          setIsImageInsertModalOpen(false)
          setImageInitialValues(null)
        }}
        onCancel={() => {
          setIsImageInsertModalOpen(false)
          setImageInitialValues(null)
        }}
        pickerOpen={isContentPickerOpen}
        onRequestImagePick={(onPicked) => {
          contentPickerCallbackRef.current = onPicked
          setIsContentPickerOpen(true)
        }}
      />
      <EmbedInsertModal
        key={`embed-${embedModalKey}`}
        isOpen={isEmbedInsertModalOpen}
        initialValues={embedInitialValues}
        onInsert={(markdown) => {
          if (editingEmbed?.type === 'embed') {
            replaceBlock(
              editingEmbed.blockStart,
              editingEmbed.blockEnd,
              markdown,
            )
          } else {
            insertAtCursor(markdown)
          }
          setIsEmbedInsertModalOpen(false)
          setEmbedInitialValues(null)
        }}
        onCancel={() => {
          setIsEmbedInsertModalOpen(false)
          setEmbedInitialValues(null)
        }}
      />
      <GpxMapModal
        key={`gpx-${gpxModalKey}`}
        isOpen={isGpxModalOpen}
        initialValues={gpxInitialValues}
        onInsert={(markdown) => {
          if (editingEmbed?.type === 'gpx') {
            replaceBlock(
              editingEmbed.blockStart,
              editingEmbed.blockEnd,
              markdown,
            )
          } else {
            insertAtCursor(markdown)
          }
          setIsGpxModalOpen(false)
          setGpxInitialValues(null)
        }}
        onCancel={() => {
          setIsGpxModalOpen(false)
          setGpxInitialValues(null)
        }}
      />
      <SlideshowInsertModal
        key={`slideshow-${slideshowModalKey}`}
        isOpen={isSlideshowModalOpen}
        initialValues={slideshowInitialValues}
        onInsert={(markdown) => {
          if (editingEmbed?.type === 'slideshow') {
            replaceBlock(
              editingEmbed.blockStart,
              editingEmbed.blockEnd,
              markdown,
            )
          } else {
            insertAtCursor(markdown)
          }
          setIsSlideshowModalOpen(false)
          setSlideshowInitialValues(null)
        }}
        onCancel={() => {
          setIsSlideshowModalOpen(false)
          setSlideshowInitialValues(null)
        }}
        pickerOpen={isContentPickerOpen}
        onRequestImagePick={(onPicked) => {
          contentPickerCallbackRef.current = onPicked
          setIsContentPickerOpen(true)
        }}
      />
      <PublishNotifyModal
        isOpen={showPublishNotify}
        onPublishAndNotify={() => {
          setShowPublishNotify(false)
          void handleSave('published', true)
        }}
        onPublishOnly={() => {
          setShowPublishNotify(false)
          void handleSave('published', false)
        }}
        onCancel={() => setShowPublishNotify(false)}
      />
    </StyledWrapper>
  )
}
