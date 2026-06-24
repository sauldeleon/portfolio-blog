'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile } from '@marsidev/react-turnstile'
import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@sdlgr/button'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledCancelReplyButton,
  StyledError,
  StyledFieldGroup,
  StyledForm,
  StyledHoneypot,
  StyledInput,
  StyledLabel,
  StyledReplyBanner,
  StyledSuccess,
  StyledTextarea,
  StyledTurnstileWrapper,
} from './CommentForm.styles'

const commentFormSchema = z.object({
  username: z.string().min(1).max(100).trim(),
  body: z.string().min(1).max(2000).trim(),
  honeypot: z.string().max(0).optional(),
})

type CommentFormValues = z.infer<typeof commentFormSchema>

export interface CommentFormProps {
  postId: string
  postTitle: string
  postNumber: number
  postSlug: string
  postLng: string
  lng: string
  replyToId?: string | null
  replyToUsername?: string | null
  onCancelReply?: () => void
}

export function CommentForm({
  postId,
  postTitle,
  postNumber,
  postSlug,
  postLng,
  lng,
  replyToId,
  replyToUsername,
  onCancelReply,
}: CommentFormProps) {
  const { t } = useClientTranslation('blogPage')
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileError, setTurnstileError] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
  })

  const onSubmit = async (values: CommentFormValues) => {
    /* istanbul ignore next */
    if (!turnstileToken && !turnstileError) return
    setStatus('submitting')

    try {
      // Trailing slash matches `trailingSlash: true`, avoiding a 308 redirect
      // that would drop this POST's body on the way to the comments route.
      await axios.post(`/api/posts/${postId}/comments/`, {
        username: values.username,
        body: values.body,
        honeypot: values.honeypot,
        turnstileToken: turnstileToken ?? '__cf_error__',
        postTitle,
        postNumber,
        postSlug,
        postLng,
        parentId: replyToId ?? null,
      })
      setStatus('success')
      reset()
      onCancelReply?.()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <StyledSuccess role="status">{t('comments.form.success')}</StyledSuccess>
    )
  }

  const isSubmitting = status === 'submitting'
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate>
      {replyToUsername && (
        <StyledReplyBanner data-testid="reply-banner">
          <span>{t('comments.replyTo', { username: replyToUsername })}</span>
          {onCancelReply && (
            <StyledCancelReplyButton
              type="button"
              onClick={onCancelReply}
              data-testid="cancel-reply"
            >
              ✕
            </StyledCancelReplyButton>
          )}
        </StyledReplyBanner>
      )}

      <StyledHoneypot
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        {...register('honeypot')}
      />

      <StyledFieldGroup>
        <StyledLabel htmlFor="comment-username">
          {t('comments.form.username')}
        </StyledLabel>
        <StyledInput
          id="comment-username"
          type="text"
          placeholder={t('comments.form.usernamePlaceholder')}
          autoComplete="name"
          aria-invalid={errors.username ? 'true' : undefined}
          {...register('username')}
        />
        {errors.username && (
          <StyledError role="alert">{errors.username.message}</StyledError>
        )}
      </StyledFieldGroup>

      <StyledFieldGroup>
        <StyledLabel htmlFor="comment-body">
          {t('comments.form.body')}
        </StyledLabel>
        <StyledTextarea
          id="comment-body"
          placeholder={t('comments.form.bodyPlaceholder')}
          aria-invalid={errors.body ? 'true' : undefined}
          {...register('body')}
        />
        {errors.body && (
          <StyledError role="alert">{errors.body.message}</StyledError>
        )}
      </StyledFieldGroup>

      {siteKey && (
        <StyledTurnstileWrapper>
          <Turnstile
            siteKey={siteKey}
            onSuccess={(token) => {
              setTurnstileToken(token)
              setTurnstileError(false)
            }}
            onError={() => {
              setTurnstileToken(null)
              setTurnstileError(true)
            }}
            onExpire={() => {
              setTurnstileToken(null)
              setTurnstileError(false)
            }}
            options={{ theme: 'dark', language: lng, size: 'flexible' }}
          />
        </StyledTurnstileWrapper>
      )}

      {status === 'error' && (
        <StyledError role="alert">{t('comments.form.error')}</StyledError>
      )}

      <Button
        type="submit"
        variant="inverted"
        disabled={
          isSubmitting ||
          (!siteKey ? false : !turnstileToken && !turnstileError)
        }
      >
        {
          /* istanbul ignore next */
          isSubmitting
            ? t('comments.form.submitting')
            : t('comments.form.submit')
        }
      </Button>
    </StyledForm>
  )
}
