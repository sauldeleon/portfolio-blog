'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'

import { useClientTranslation } from '@web/i18n/client'
import type { CommentRecord } from '@web/lib/db/queries/comments'

import { CommentForm } from '../CommentForm'
import {
  StyledBody,
  StyledCommentItem,
  StyledCommentList,
  StyledCommentMeta,
  StyledDate,
  StyledDisabled,
  StyledDivider,
  StyledEmpty,
  StyledError,
  StyledFormSection,
  StyledFormTitle,
  StyledReplyButton,
  StyledReplyingTo,
  StyledSection,
  StyledTitle,
  StyledUsername,
} from './PostComments.styles'

export interface PostCommentsProps {
  postId: string
  postTitle: string
  postNumber: number
  postSlug: string
  lng: string
  commentsEnabled?: boolean
}

type ReplyRecord = CommentRecord & { parentUsername: string }
type CommentWithReplies = CommentRecord & { replies: ReplyRecord[] }

function groupComments(flat: CommentRecord[]): CommentWithReplies[] {
  const byId = new Map<string, CommentRecord>()
  for (const c of flat) byId.set(c.id, c)

  const hasKnownParent = (
    c: CommentRecord,
  ): c is CommentRecord & { parentId: string } =>
    c.parentId !== null && byId.has(c.parentId)

  function getRootId(id: string): string {
    const c = byId.get(id)
    if (!c || !hasKnownParent(c)) return id
    return getRootId(c.parentId)
  }

  const roots = new Map<string, CommentWithReplies>()
  const rootOrder: string[] = []

  for (const c of flat) {
    if (!hasKnownParent(c)) {
      roots.set(c.id, { ...c, replies: [] })
      rootOrder.push(c.id)
    } else {
      const rootId = getRootId(c.id)
      const root = roots.get(rootId)
      /* istanbul ignore next */
      if (!root) continue
      const parentRecord = byId.get(c.parentId)
      /* istanbul ignore next */
      if (!parentRecord) continue
      root.replies.push({ ...c, parentUsername: parentRecord.username })
    }
  }

  return rootOrder
    .map((id) => roots.get(id))
    .filter((item): item is CommentWithReplies => item !== undefined)
}

export function PostComments({
  postId,
  postTitle,
  postNumber,
  postSlug,
  lng,
  commentsEnabled = true,
}: PostCommentsProps) {
  const { t } = useClientTranslation('blogPage')
  const [comments, setComments] = useState<CommentRecord[]>([])
  const [error, setError] = useState(false)
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [replyToUsername, setReplyToUsername] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  useEffect(() => {
    void axios
      .get<{ comments: CommentRecord[] }>(`/api/posts/${postId}/comments`)
      .then(({ data }) => {
        setComments(data.comments)
      })
      .catch(() => {
        setError(true)
      })
  }, [postId])

  const grouped = groupComments(comments)

  function handleReply(id: string, username: string) {
    setReplyToId(id)
    setReplyToUsername(username)
  }

  function handleCancelReply() {
    setReplyToId(null)
    setReplyToUsername(null)
  }

  return (
    <StyledSection aria-label={t('comments.title')}>
      <StyledTitle>{t('comments.title')}</StyledTitle>

      {error ? (
        <StyledError>{t('comments.error')}</StyledError>
      ) : grouped.length === 0 ? (
        <StyledEmpty>{t('comments.empty')}</StyledEmpty>
      ) : (
        <StyledCommentList>
          {grouped.map((comment) => (
            <StyledCommentItem
              key={comment.id}
              $highlighted={highlightedId === comment.id}
              data-highlighted={highlightedId === comment.id || undefined}
              data-testid="comment-item"
            >
              <StyledCommentMeta>
                <StyledUsername>{comment.username}</StyledUsername>
                <StyledDate
                  dateTime={new Date(comment.createdAt).toISOString()}
                >
                  {new Date(comment.createdAt).toLocaleString(
                    lng === 'es' ? 'es-ES' : 'en-GB',
                    { dateStyle: 'medium', timeStyle: 'short' },
                  )}
                </StyledDate>
              </StyledCommentMeta>
              <StyledBody>{comment.body}</StyledBody>
              <StyledReplyButton
                onClick={() => handleReply(comment.id, comment.username)}
                data-testid="reply-button"
              >
                {t('comments.reply')}
              </StyledReplyButton>

              {comment.replies.length > 0 && (
                <StyledCommentList style={{ marginTop: '1rem' }}>
                  {comment.replies.map((reply) => (
                    <StyledCommentItem
                      key={reply.id}
                      $isReply
                      $highlighted={highlightedId === reply.id}
                      data-highlighted={highlightedId === reply.id || undefined}
                      onMouseEnter={() => setHighlightedId(reply.parentId)}
                      onMouseLeave={() => setHighlightedId(null)}
                      data-testid="reply-item"
                    >
                      <StyledCommentMeta>
                        <StyledUsername>{reply.username}</StyledUsername>
                        <StyledDate
                          dateTime={new Date(reply.createdAt).toISOString()}
                        >
                          {new Date(reply.createdAt).toLocaleString(
                            lng === 'es' ? 'es-ES' : 'en-GB',
                            { dateStyle: 'medium', timeStyle: 'short' },
                          )}
                        </StyledDate>
                      </StyledCommentMeta>
                      <StyledReplyingTo>
                        @{reply.parentUsername}
                      </StyledReplyingTo>
                      <StyledBody>{reply.body}</StyledBody>
                      <StyledReplyButton
                        onClick={() => handleReply(reply.id, reply.username)}
                        data-testid="reply-button"
                      >
                        {t('comments.reply')}
                      </StyledReplyButton>
                    </StyledCommentItem>
                  ))}
                </StyledCommentList>
              )}
            </StyledCommentItem>
          ))}
        </StyledCommentList>
      )}

      <StyledDivider />
      {commentsEnabled ? (
        <StyledFormSection>
          <StyledFormTitle>
            {replyToUsername
              ? t('comments.replyTo', { username: replyToUsername })
              : t('comments.title')}
          </StyledFormTitle>
          <CommentForm
            postId={postId}
            postTitle={postTitle}
            postNumber={postNumber}
            postSlug={postSlug}
            postLng={lng}
            lng={lng}
            replyToId={replyToId}
            replyToUsername={replyToUsername}
            onCancelReply={handleCancelReply}
          />
        </StyledFormSection>
      ) : (
        <StyledDisabled data-testid="comments-disabled-message">
          {t('comments.disabled')}
        </StyledDisabled>
      )}
    </StyledSection>
  )
}
