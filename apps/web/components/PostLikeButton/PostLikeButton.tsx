'use client'

import axios, { isAxiosError } from 'axios'
import { useState } from 'react'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledLikeButton,
  StyledLikeCount,
  StyledLikeWrapper,
} from './PostLikeButton.styles'

const STORAGE_KEY = 'liked_posts'

function getLikedPosts(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

function saveLikedPost(postId: string) {
  const prev = getLikedPosts()
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...new Set([...prev, postId])]),
  )
}

export function PostLikeButton({
  postId,
  initialLikes,
}: {
  postId: string
  initialLikes: number
}) {
  const { t } = useClientTranslation('blogPage')
  const [liked, setLiked] = useState(() => getLikedPosts().includes(postId))
  const [count, setCount] = useState(initialLikes)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    /* istanbul ignore next */
    if (liked) return

    setLiked(true)
    setCount((c) => c + 1)
    setLoading(true)

    try {
      const { data } = await axios.post<{ likes: number }>(
        `/api/posts/${postId}/like/`,
      )
      setCount(data.likes)
      saveLikedPost(postId)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 429) {
        // Already liked recently — treat as success, keep the optimistic state.
        saveLikedPost(postId)
      } else {
        setLiked(false)
        setCount((c) => c - 1)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <StyledLikeWrapper>
      <StyledLikeButton
        onClick={handleLike}
        $liked={liked}
        disabled={liked || loading}
        aria-label={liked ? t('likeButton.liked') : t('likeButton.like')}
        data-testid="like-button"
      >
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </StyledLikeButton>
      <StyledLikeCount data-testid="like-count">{count}</StyledLikeCount>
    </StyledLikeWrapper>
  )
}
