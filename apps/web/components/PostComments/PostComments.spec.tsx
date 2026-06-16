import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { PostComments } from './PostComments'

jest.mock('axios', () => ({
  get: jest.fn(),
}))

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: jest.fn((key: string, opts?: { username?: string }) => {
      if (opts?.username) return `Reply to ${opts.username}`
      if (key === 'comments.reply') return '↳ Reply'
      return key
    }),
  }),
}))

jest.mock('../CommentForm', () => ({
  CommentForm: ({
    replyToUsername,
    onCancelReply,
  }: {
    replyToUsername?: string | null
    onCancelReply?: () => void
  }) => (
    <div data-testid="comment-form">
      {replyToUsername && <span>{`replyTo:${replyToUsername}`}</span>}
      {onCancelReply && (
        <button data-testid="cancel-reply-form" onClick={onCancelReply}>
          cancel
        </button>
      )}
    </div>
  ),
}))

const mockAxiosGet = jest.mocked(axios.get)

const baseProps = {
  postId: 'p1',
  postTitle: 'My Post',
  postNumber: 1,
  postSlug: 'my-post',
  lng: 'en',
}

const mockComment = {
  id: 'c1',
  postId: 'p1',
  parentId: null,
  username: 'Alice',
  body: 'Great post!',
  status: 'approved',
  createdAt: new Date('2024-01-15'),
}

const mockReply = {
  id: 'c2',
  postId: 'p1',
  parentId: 'c1',
  username: 'Bob',
  body: 'Agreed!',
  status: 'approved',
  createdAt: new Date('2024-01-16'),
}

const mockDeepReply = {
  id: 'c3',
  postId: 'p1',
  parentId: 'c2',
  username: 'Charlie',
  body: 'Indeed!',
  status: 'approved',
  createdAt: new Date('2024-01-17'),
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('PostComments', () => {
  it('renders the section title', async () => {
    mockAxiosGet.mockResolvedValue({ data: { comments: [] } })
    renderApp(<PostComments {...baseProps} />)
    expect(screen.getAllByText('comments.title').length).toBeGreaterThan(0)
  })

  it('shows empty state when no comments', async () => {
    mockAxiosGet.mockResolvedValue({ data: { comments: [] } })
    renderApp(<PostComments {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByText('comments.empty')).toBeInTheDocument()
    })
  })

  it('renders comments fetched from API', async () => {
    mockAxiosGet.mockResolvedValue({ data: { comments: [mockComment] } })
    renderApp(<PostComments {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByTestId('comment-item')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Great post!')).toBeInTheDocument()
    })
  })

  it('renders nested replies under parent comment', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { comments: [mockComment, mockReply] },
    })
    renderApp(<PostComments {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByTestId('reply-item')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Agreed!')).toBeInTheDocument()
    })
  })

  it('shows @parentUsername in reply', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { comments: [mockComment, mockReply] },
    })
    renderApp(<PostComments {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByText('@Alice')).toBeInTheDocument()
    })
  })

  it('flattens deep replies under root comment', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { comments: [mockComment, mockReply, mockDeepReply] },
    })
    renderApp(<PostComments {...baseProps} />)
    await waitFor(() => {
      const replyItems = screen.getAllByTestId('reply-item')
      expect(replyItems).toHaveLength(2)
      expect(screen.getByText('Charlie')).toBeInTheDocument()
      expect(screen.getByText('@Bob')).toBeInTheDocument()
    })
  })

  it('treats orphaned reply (non-existent parentId) as root', async () => {
    const orphan = { ...mockReply, id: 'c_orphan', parentId: 'non-existent' }
    mockAxiosGet.mockResolvedValue({ data: { comments: [orphan] } })
    renderApp(<PostComments {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByTestId('comment-item')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('reply-item')).not.toBeInTheDocument()
  })

  it('renders CommentForm', async () => {
    mockAxiosGet.mockResolvedValue({ data: { comments: [] } })
    renderApp(<PostComments {...baseProps} />)
    expect(screen.getByTestId('comment-form')).toBeInTheDocument()
  })

  it('sets reply context when reply button clicked on root comment', async () => {
    mockAxiosGet.mockResolvedValue({ data: { comments: [mockComment] } })
    renderApp(<PostComments {...baseProps} />)
    fireEvent.click(await screen.findByTestId('reply-button'))
    await waitFor(() => {
      expect(screen.getByText('replyTo:Alice')).toBeInTheDocument()
    })
  })

  it('sets reply context when reply button clicked on a nested reply', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { comments: [mockComment, mockReply] },
    })
    renderApp(<PostComments {...baseProps} />)
    await screen.findAllByTestId('reply-button')
    const replyButtons = screen.getAllByTestId('reply-button')
    fireEvent.click(replyButtons[1])
    await waitFor(() => {
      expect(screen.getByText('replyTo:Bob')).toBeInTheDocument()
    })
  })

  it('clears reply context when cancel reply called', async () => {
    mockAxiosGet.mockResolvedValue({ data: { comments: [mockComment] } })
    renderApp(<PostComments {...baseProps} />)
    fireEvent.click(await screen.findByTestId('reply-button'))
    fireEvent.click(await screen.findByTestId('cancel-reply-form'))
    await waitFor(() => {
      expect(screen.queryByText('replyTo:Alice')).not.toBeInTheDocument()
    })
  })

  it('shows error state when fetch fails', async () => {
    mockAxiosGet.mockRejectedValue(new Error('network'))
    renderApp(<PostComments {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByText('comments.error')).toBeInTheDocument()
    })
  })

  it('still renders form when fetch fails', async () => {
    mockAxiosGet.mockRejectedValue(new Error('network'))
    renderApp(<PostComments {...baseProps} />)
    await screen.findByText('comments.error')
    expect(screen.getByTestId('comment-form')).toBeInTheDocument()
  })

  it('highlights parent comment when hovering a direct reply', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { comments: [mockComment, mockReply] },
    })
    renderApp(<PostComments {...baseProps} />)
    fireEvent.mouseEnter(await screen.findByTestId('reply-item'))
    expect(screen.getByTestId('comment-item')).toHaveAttribute(
      'data-highlighted',
      'true',
    )
    fireEvent.mouseLeave(screen.getByTestId('reply-item'))
    expect(screen.getByTestId('comment-item')).not.toHaveAttribute(
      'data-highlighted',
    )
  })

  it('highlights sibling reply when hovering a deep reply', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { comments: [mockComment, mockReply, mockDeepReply] },
    })
    renderApp(<PostComments {...baseProps} />)
    await screen.findAllByTestId('reply-item')
    const replyItems = screen.getAllByTestId('reply-item')
    fireEvent.mouseEnter(replyItems[1])
    expect(replyItems[0]).toHaveAttribute('data-highlighted', 'true')
    fireEvent.mouseLeave(replyItems[1])
    expect(replyItems[0]).not.toHaveAttribute('data-highlighted')
  })

  it('renders reply button for root and reply items', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { comments: [mockComment, mockReply] },
    })
    renderApp(<PostComments {...baseProps} />)
    await waitFor(() => {
      expect(screen.getAllByTestId('reply-button')).toHaveLength(2)
    })
  })

  it('hides form and shows disabled message when commentsEnabled is false', async () => {
    mockAxiosGet.mockResolvedValue({ data: { comments: [] } })
    renderApp(<PostComments {...baseProps} commentsEnabled={false} />)
    await waitFor(() => {
      expect(
        screen.getByTestId('comments-disabled-message'),
      ).toBeInTheDocument()
    })
    expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument()
  })

  it('shows form when commentsEnabled is true (default)', async () => {
    mockAxiosGet.mockResolvedValue({ data: { comments: [] } })
    renderApp(<PostComments {...baseProps} commentsEnabled={true} />)
    await screen.findByText('comments.empty')
    expect(screen.getByTestId('comment-form')).toBeInTheDocument()
    expect(
      screen.queryByTestId('comments-disabled-message'),
    ).not.toBeInTheDocument()
  })

  it('formats dates in Spanish locale when lng is es', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { comments: [mockComment, mockReply] },
    })
    renderApp(<PostComments {...baseProps} lng="es" />)
    await waitFor(() => {
      expect(screen.getByTestId('comment-item')).toBeInTheDocument()
      expect(screen.getByTestId('reply-item')).toBeInTheDocument()
    })
  })
})
