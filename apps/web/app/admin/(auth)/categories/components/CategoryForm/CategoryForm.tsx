'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import axios, { isAxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useClientTranslation } from '@web/i18n/client'
import { slugify } from '@web/utils/slugify'

import {
  StyledActions,
  StyledBackLink,
  StyledError,
  StyledFieldGroup,
  StyledForm,
  StyledHeading,
  StyledHelper,
  StyledInput,
  StyledLabel,
  StyledPageHeader,
  StyledSubmitButton,
  StyledTextarea,
} from './CategoryForm.styles'

const categoryFormSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

export interface CategoryFormProps {
  title: string
  backLabel: string
}

export function CategoryForm({ title, backLabel }: CategoryFormProps) {
  const { t } = useClientTranslation('admin')
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    mode: 'onChange',
    values: { name, slug },
  })

  const canSubmit = categoryFormSchema.safeParse({ name, slug }).success

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setName(val)
    if (!slugManuallyEdited) {
      setSlug(slugify(val))
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value)
    setSlugManuallyEdited(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await axios.post('/api/categories', {
        translations: {
          en: { name, slug, description: description || undefined },
        },
      })
      router.push('/admin/categories')
      router.refresh()
    } catch (err) {
      if (isAxiosError(err)) {
        const errData = err.response?.data as { error?: unknown } | undefined
        setError(
          typeof errData?.error === 'string'
            ? errData.error
            : t('categories.form.error'),
        )
      }
    }
  }

  return (
    <>
      <StyledPageHeader>
        <StyledBackLink
          onClick={() => router.back()}
          role="link"
          data-testid="back-link"
        >
          {backLabel}
        </StyledBackLink>
        <StyledHeading>{title}</StyledHeading>
      </StyledPageHeader>

      <StyledForm onSubmit={handleSubmit} data-testid="category-form">
        <StyledFieldGroup>
          <StyledLabel htmlFor="category-name">
            {t('categories.form.name')}
          </StyledLabel>
          <StyledInput
            id="category-name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder={t('categories.form.namePlaceholder')}
            required
            data-testid="name-input"
          />
        </StyledFieldGroup>

        <StyledFieldGroup>
          <StyledLabel htmlFor="category-slug">
            {t('categories.form.slug')}
          </StyledLabel>
          <StyledInput
            id="category-slug"
            type="text"
            value={slug}
            onChange={handleSlugChange}
            placeholder={t('categories.slugPlaceholder')}
            required
            data-testid="slug-input"
          />
          <StyledHelper>{t('categories.form.slugHelper')}</StyledHelper>
        </StyledFieldGroup>

        <StyledFieldGroup>
          <StyledLabel htmlFor="category-description">
            {t('categories.form.description')}
          </StyledLabel>
          <StyledTextarea
            id="category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('categories.form.descriptionPlaceholder')}
            data-testid="description-input"
          />
        </StyledFieldGroup>

        {error && <StyledError data-testid="form-error">{error}</StyledError>}

        <StyledActions>
          <StyledSubmitButton
            type="submit"
            disabled={!canSubmit}
            data-testid="submit-button"
          >
            {t('categories.form.create')}
          </StyledSubmitButton>
          <StyledBackLink
            onClick={() => router.back()}
            role="link"
            data-testid="cancel-link"
          >
            {t('categories.cancel')}
          </StyledBackLink>
        </StyledActions>
      </StyledForm>
    </>
  )
}
