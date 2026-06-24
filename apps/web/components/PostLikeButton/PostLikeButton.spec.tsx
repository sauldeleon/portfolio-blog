import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { PostLikeButton } from './PostLikeButton'

const mockT = jest.fn((key: string) => key)

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: mockT }),
}))

let mockAxiosPost: jest.SpyInstance

function makeAxiosError(status: number): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data: {},
    statusText: 'Error',
    headers: {},
    config: {} as never,
  })
}

const STORAGE_KEY = 'liked_posts'

beforeEach(() => {
  localStorage.clear()
  mockAxiosPost = jest
    .spyOn(axios, 'post')
    .mockResolvedValue({ data: { likes: 10 } })
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('PostLikeButton', () => {
  it('renders like button and count', () => {
    renderApp(<PostLikeButton postId="post-1" initialLikes={5} />)
    expect(screen.getByTestId('like-button')).toBeInTheDocument()
    expect(screen.getByTestId('like-count')).toHaveTextContent('5')
  })

  it('shows "like" aria-label when not liked', () => {
    renderApp(<PostLikeButton postId="post-1" initialLikes={0} />)
    expect(screen.getByTestId('like-button')).toHaveAttribute(
      'aria-label',
      'likeButton.like',
    )
  })

  it('reads liked state from localStorage on mount', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['post-1']))
    renderApp(<PostLikeButton postId="post-1" initialLikes={3} />)
    await waitFor(() =>
      expect(screen.getByTestId('like-button')).toBeDisabled(),
    )
    expect(screen.getByTestId('like-button')).toHaveAttribute(
      'aria-label',
      'likeButton.liked',
    )
  })

  it('does not mark liked when post id not in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['other-post']))
    renderApp(<PostLikeButton postId="post-1" initialLikes={0} />)
    expect(screen.getByTestId('like-button')).not.toBeDisabled()
  })

  it('increments count and disables button on like', async () => {
    renderApp(<PostLikeButton postId="post-1" initialLikes={5} />)
    fireEvent.click(screen.getByTestId('like-button'))
    expect(screen.getByTestId('like-count')).toHaveTextContent('6')
    await waitFor(() =>
      expect(screen.getByTestId('like-count')).toHaveTextContent('10'),
    )
    expect(screen.getByTestId('like-button')).toBeDisabled()
  })

  it('saves post id to localStorage after successful like', async () => {
    renderApp(<PostLikeButton postId="post-1" initialLikes={0} />)
    fireEvent.click(screen.getByTestId('like-button'))
    await waitFor(() => expect(mockAxiosPost).toHaveBeenCalled())
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]',
    ) as string[]
    expect(stored).toContain('post-1')
  })

  it('calls the correct API endpoint (trailing slash)', async () => {
    renderApp(<PostLikeButton postId="post-abc" initialLikes={0} />)
    fireEvent.click(screen.getByTestId('like-button'))
    await waitFor(() => expect(mockAxiosPost).toHaveBeenCalled())
    expect(mockAxiosPost).toHaveBeenCalledWith('/api/posts/post-abc/like/')
  })

  it('reverts optimistic update on non-429 error response', async () => {
    mockAxiosPost.mockRejectedValue(makeAxiosError(500))
    renderApp(<PostLikeButton postId="post-1" initialLikes={5} />)
    fireEvent.click(screen.getByTestId('like-button'))
    expect(screen.getByTestId('like-count')).toHaveTextContent('6')
    await waitFor(() =>
      expect(screen.getByTestId('like-count')).toHaveTextContent('5'),
    )
    expect(screen.getByTestId('like-button')).not.toBeDisabled()
  })

  it('keeps liked state on 429 response (already liked server-side)', async () => {
    mockAxiosPost.mockRejectedValue(makeAxiosError(429))
    renderApp(<PostLikeButton postId="post-1" initialLikes={5} />)
    fireEvent.click(screen.getByTestId('like-button'))
    await waitFor(() =>
      expect(screen.getByTestId('like-button')).toBeDisabled(),
    )
    expect(screen.getByTestId('like-count')).toHaveTextContent('6')
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]',
    ) as string[]
    expect(stored).toContain('post-1')
  })

  it('reverts optimistic update on network error', async () => {
    mockAxiosPost.mockRejectedValue(new Error('network'))
    renderApp(<PostLikeButton postId="post-1" initialLikes={5} />)
    fireEvent.click(screen.getByTestId('like-button'))
    await waitFor(() =>
      expect(screen.getByTestId('like-count')).toHaveTextContent('5'),
    )
    expect(screen.getByTestId('like-button')).not.toBeDisabled()
  })

  it('does not call API when already liked', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['post-1']))
    renderApp(<PostLikeButton postId="post-1" initialLikes={5} />)
    await waitFor(() =>
      expect(screen.getByTestId('like-button')).toBeDisabled(),
    )
    fireEvent.click(screen.getByTestId('like-button'))
    expect(mockAxiosPost).not.toHaveBeenCalled()
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json')
    renderApp(<PostLikeButton postId="post-1" initialLikes={0} />)
    expect(screen.getByTestId('like-button')).not.toBeDisabled()
  })

  it('does not duplicate post in localStorage on 429', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['post-1']))
    mockAxiosPost.mockRejectedValue(makeAxiosError(429))
    renderApp(<PostLikeButton postId="post-1" initialLikes={0} />)
    fireEvent.click(screen.getByTestId('like-button'))
    await waitFor(() =>
      expect(screen.getByTestId('like-button')).toBeDisabled(),
    )
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]',
    ) as string[]
    expect(stored.filter((id) => id === 'post-1')).toHaveLength(1)
  })
})
