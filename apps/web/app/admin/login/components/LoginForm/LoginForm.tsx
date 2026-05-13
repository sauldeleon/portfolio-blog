'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledError,
  StyledField,
  StyledForm,
  StyledInput,
  StyledInputRow,
  StyledLabel,
  StyledSubmitButton,
  StyledToggleButton,
} from './LoginForm.styles'

export function LoginForm() {
  const router = useRouter()
  const { t } = useClientTranslation('admin')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = e.currentTarget
    const username = (form.elements.namedItem('username') as HTMLInputElement)
      .value
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      .value
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError(t('login.invalidCredentials'))
    } else {
      router.refresh()
      router.push('/admin/posts')
    }
  }

  return (
    <StyledForm onSubmit={handleSubmit} data-testid="login-form">
      <StyledField>
        <StyledLabel htmlFor="username">{t('login.username')}</StyledLabel>
        <StyledInputRow>
          <StyledInput
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="admin"
            required
          />
        </StyledInputRow>
      </StyledField>

      <StyledField>
        <StyledLabel htmlFor="password">{t('login.password')}</StyledLabel>
        <StyledInputRow>
          <StyledInput
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
          <StyledToggleButton
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={
              showPassword ? t('login.hidePassword') : t('login.showPassword')
            }
            data-testid="password-toggle"
          >
            {showPassword ? t('login.hidePassword') : t('login.showPassword')}
          </StyledToggleButton>
        </StyledInputRow>
      </StyledField>

      {error && <StyledError role="alert">{error}</StyledError>}

      <StyledSubmitButton variant="inverted" type="submit" disabled={loading}>
        {loading ? t('login.signingIn') : t('login.signIn')}
      </StyledSubmitButton>
    </StyledForm>
  )
}
