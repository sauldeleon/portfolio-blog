'use client'

import axios, { isAxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Select } from '@sdlgr/select'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledActions,
  StyledBackLink,
  StyledError,
  StyledFieldGroup,
  StyledForm,
  StyledHeading,
  StyledInput,
  StyledPageHeader,
  StyledSubmitButton,
} from './UserForm.styles'

export interface UserFormInitialValues {
  userId: string
  email: string
  name: string
  role: string
}

export interface UserFormProps {
  title: string
  backLabel: string
  mode?: 'create' | 'edit'
  initialValues?: UserFormInitialValues
}

export function UserForm({
  title,
  backLabel,
  mode = 'create',
  initialValues,
}: UserFormProps) {
  const { t } = useClientTranslation('admin')
  const router = useRouter()
  const [email, setEmail] = useState(initialValues?.email ?? '')
  const [name, setName] = useState(initialValues?.name ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(initialValues?.role ?? 'editor')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isEdit = mode === 'edit'
  const passwordValid = isEdit
    ? password.trim() === '' || password.trim().length >= 8
    : password.trim().length >= 8

  const canSubmit =
    email.trim().length > 0 && name.trim().length > 0 && passwordValid

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const body: Record<string, string> = {
        email: email.trim(),
        name: name.trim(),
        role,
      }
      if (!isEdit || password.trim().length > 0) {
        body.password = password
      }
      if (isEdit) {
        await axios.patch(`/api/users/${initialValues?.userId}`, body)
      } else {
        await axios.post('/api/users', body)
      }
      router.push('/admin/users')
      router.refresh()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.error : null
      setError(typeof message === 'string' ? message : t('users.form.error'))
    } finally {
      setSubmitting(false)
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

      <StyledForm onSubmit={handleSubmit} data-testid="user-form">
        <StyledFieldGroup>
          <label htmlFor="user-email">{t('users.form.email')}</label>
          <StyledInput
            id="user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('users.form.emailPlaceholder')}
            required
            autoComplete="off"
            data-testid="email-input"
          />
        </StyledFieldGroup>

        <StyledFieldGroup>
          <label htmlFor="user-name">{t('users.form.name')}</label>
          <StyledInput
            id="user-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('users.form.namePlaceholder')}
            data-testid="name-input"
          />
        </StyledFieldGroup>

        <StyledFieldGroup>
          <label htmlFor="user-password">{t('users.form.password')}</label>
          <StyledInput
            id="user-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              isEdit
                ? t('users.form.passwordOptionalPlaceholder')
                : t('users.form.passwordPlaceholder')
            }
            required={!isEdit}
            autoComplete="new-password"
            data-testid="password-input"
          />
        </StyledFieldGroup>

        <StyledFieldGroup>
          <label htmlFor="user-role">{t('users.form.role')}</label>
          <Select
            id="user-role"
            value={role}
            onChange={(value) => setRole(value)}
            options={[
              { value: 'admin', label: t('users.roles.admin') },
              { value: 'editor', label: t('users.roles.editor') },
              { value: 'user', label: t('users.roles.user') },
            ]}
            data-testid="role-select"
          />
        </StyledFieldGroup>

        {error && <StyledError data-testid="form-error">{error}</StyledError>}

        <StyledActions>
          <StyledSubmitButton
            type="submit"
            disabled={!canSubmit || submitting}
            data-testid="submit-button"
          >
            {isEdit ? t('users.form.save') : t('users.form.create')}
          </StyledSubmitButton>
          <StyledBackLink
            onClick={() => router.back()}
            role="link"
            data-testid="cancel-link"
          >
            {t('users.form.cancel')}
          </StyledBackLink>
        </StyledActions>
      </StyledForm>
    </>
  )
}
