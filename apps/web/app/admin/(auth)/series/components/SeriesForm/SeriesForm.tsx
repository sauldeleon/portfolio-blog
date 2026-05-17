'use client'

import axios, { isAxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
  StyledPageHeader,
  StyledSubmitButton,
} from './SeriesForm.styles'

export interface SeriesFormProps {
  title: string
  backLabel: string
}

export function SeriesForm({ title, backLabel }: SeriesFormProps) {
  const { t } = useClientTranslation('admin')
  const router = useRouter()
  const [id, setId] = useState('')
  const [idManuallyEdited, setIdManuallyEdited] = useState(false)
  const [enTitle, setEnTitle] = useState('')
  const [esTitle, setEsTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canSubmit = id.trim().length > 0 && enTitle.trim().length > 0

  function handleEnTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setEnTitle(val)
    if (!idManuallyEdited) {
      setId(slugify(val))
    }
  }

  function handleIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    setId(e.target.value)
    setIdManuallyEdited(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await axios.post('/api/series', {
        id: id.trim(),
        translations: {
          en: enTitle.trim(),
          ...(esTitle.trim() ? { es: esTitle.trim() } : {}),
        },
      })
      router.push('/admin/series')
      router.refresh()
    } catch (err) {
      if (isAxiosError(err)) {
        const errData = err.response?.data as { error?: unknown } | undefined
        setError(
          typeof errData?.error === 'string'
            ? errData.error
            : t('series.form.error'),
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

      <StyledForm onSubmit={handleSubmit} data-testid="series-form">
        <StyledFieldGroup>
          <label htmlFor="series-en-title">{t('series.form.enTitle')}</label>
          <StyledInput
            id="series-en-title"
            type="text"
            value={enTitle}
            onChange={handleEnTitleChange}
            placeholder={t('series.form.enTitlePlaceholder')}
            required
            data-testid="en-title-input"
          />
        </StyledFieldGroup>

        <StyledFieldGroup>
          <label htmlFor="series-id">{t('series.form.id')}</label>
          <StyledInput
            id="series-id"
            type="text"
            value={id}
            onChange={handleIdChange}
            placeholder={t('series.form.idPlaceholder')}
            required
            data-testid="id-input"
          />
          <StyledHelper>{t('series.form.idHelper')}</StyledHelper>
        </StyledFieldGroup>

        <StyledFieldGroup>
          <label htmlFor="series-es-title">{t('series.form.esTitle')}</label>
          <StyledInput
            id="series-es-title"
            type="text"
            value={esTitle}
            onChange={(e) => setEsTitle(e.target.value)}
            placeholder={t('series.form.esTitlePlaceholder')}
            data-testid="es-title-input"
          />
        </StyledFieldGroup>

        {error && <StyledError data-testid="form-error">{error}</StyledError>}

        <StyledActions>
          <StyledSubmitButton
            type="submit"
            disabled={!canSubmit}
            data-testid="submit-button"
          >
            {t('series.form.create')}
          </StyledSubmitButton>
          <StyledBackLink
            onClick={() => router.back()}
            role="link"
            data-testid="cancel-link"
          >
            {t('series.cancel')}
          </StyledBackLink>
        </StyledActions>
      </StyledForm>
    </>
  )
}
